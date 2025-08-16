import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../entities/user.entity';
import {
  SignatureConnectionPreferencesDto,
  ConnectionMatchDto,
  ConnectionType,
  SignatureConnectionStatsDto,
} from '../dto/signature-connection.dto';

@Injectable()
export class SignatureConnectionService {
  constructor(private readonly em: EntityManager) {}

  async updateConnectionPreferences(
    userId: string,
    preferences: SignatureConnectionPreferencesDto,
  ): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Update user preferences - we'll store this in the existing preferences field
    const currentPreferences = user.preferences || {};
    const signatureConnectionPrefs = {
      ...currentPreferences,
      signatureConnection: {
        ...preferences,
        updatedAt: new Date(),
      },
    };

    user.preferences = signatureConnectionPrefs;
    await this.em.flush();
  }

  async getConnectionPreferences(userId: string): Promise<SignatureConnectionPreferencesDto | null> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user || !user.preferences?.signatureConnection) {
      return null;
    }

    return user.preferences.signatureConnection;
  }

  async findMatches(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    matches: ConnectionMatchDto[];
    total: number;
    hasMore: boolean;
  }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const userPrefs = user.preferences?.signatureConnection;
    if (!userPrefs) {
      return { matches: [], total: 0, hasMore: false };
    }

    // Build search criteria based on user preferences
    const searchCriteria: any = {
      id: { $ne: userId },
      isActive: true,
      profileVisibility: { $in: ['public', 'friends'] },
    };

    // Add age range filter if specified
    if (userPrefs.ageRangeMin || userPrefs.ageRangeMax) {
      const now = new Date();
      const maxBirthDate = userPrefs.ageRangeMin 
        ? new Date(now.getFullYear() - userPrefs.ageRangeMin, now.getMonth(), now.getDate())
        : null;
      const minBirthDate = userPrefs.ageRangeMax
        ? new Date(now.getFullYear() - userPrefs.ageRangeMax, now.getMonth(), now.getDate())
        : null;

      if (maxBirthDate && minBirthDate) {
        searchCriteria.dateOfBirth = { $gte: minBirthDate, $lte: maxBirthDate };
      } else if (maxBirthDate) {
        searchCriteria.dateOfBirth = { $lte: maxBirthDate };
      } else if (minBirthDate) {
        searchCriteria.dateOfBirth = { $gte: minBirthDate };
      }
    }

    // Find potential matches
    const [potentialMatches] = await this.em.findAndCount(
      User,
      searchCriteria,
      {
        limit: limit * 3, // Get more to filter and rank
        offset,
        orderBy: { lastLoginAt: 'DESC' },
      }
    );

    // Calculate compatibility scores and filter
    const matches: ConnectionMatchDto[] = [];
    
    for (const match of potentialMatches) {
      const matchPrefs = match.preferences?.signatureConnection;
      const compatibilityScore = this.calculateCompatibilityScore(user, match, userPrefs, matchPrefs);
      
      // Only include matches with decent compatibility (40%+)
      if (compatibilityScore >= 40) {
        const connectionMatch = await this.buildConnectionMatch(user, match, compatibilityScore);
        matches.push(connectionMatch);
      }
    }

    // Sort by compatibility score and limit results
    const sortedMatches = matches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);

    return {
      matches: sortedMatches,
      total: sortedMatches.length,
      hasMore: offset + limit < matches.length,
    };
  }

  async getConnectionStats(userId: string): Promise<SignatureConnectionStatsDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const { matches } = await this.findMatches(userId, 100, 0); // Get more for stats

    const highCompatibility = matches.filter(m => m.compatibilityScore >= 80).length;
    const mediumCompatibility = matches.filter(m => m.compatibilityScore >= 60 && m.compatibilityScore < 80).length;
    const lowCompatibility = matches.filter(m => m.compatibilityScore >= 40 && m.compatibilityScore < 60).length;

    const averageScore = matches.length > 0 
      ? matches.reduce((sum, m) => sum + m.compatibilityScore, 0) / matches.length
      : 0;

    // Find most common shared interest
    const interestCounts: Record<string, number> = {};
    matches.forEach(match => {
      match.commonInterests.forEach(interest => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    });

    const topSharedInterest = Object.entries(interestCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Find most common connection type
    const typeCounts: Record<string, number> = {};
    matches.forEach(match => {
      match.matchingConnectionTypes.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });

    const topConnectionType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as ConnectionType;

    // Calculate profile completion impact
    const currentCompletion = user.profileCompletionPercentage;
    const missingFields = this.getMissingProfileFields(user);
    const potentialIncrease = Math.min(100 - currentCompletion, missingFields.length * 10);

    return {
      totalMatches: matches.length,
      highCompatibilityMatches: highCompatibility,
      mediumCompatibilityMatches: mediumCompatibility,
      lowCompatibilityMatches: lowCompatibility,
      averageCompatibilityScore: Math.round(averageScore),
      topSharedInterest,
      topConnectionType,
      profileCompletionImpact: {
        currentCompletion,
        potentialIncrease,
        missingFields,
      },
    };
  }

  private calculateCompatibilityScore(
    user1: User,
    user2: User,
    prefs1?: any,
    prefs2?: any,
  ): number {
    let score = 0;
    let maxScore = 0;

    // Interests compatibility (25%)
    const interestsScore = this.calculateArrayCompatibility(
      user1.interests || [],
      user2.interests || [],
    );
    score += interestsScore * 25;
    maxScore += 25;

    // Skills compatibility (15%)
    const skillsScore = this.calculateArrayCompatibility(
      user1.skills || [],
      user2.skills || [],
    );
    score += skillsScore * 15;
    maxScore += 15;

    // Location compatibility (10%)
    if (user1.location && user2.location) {
      const locationScore = user1.location.toLowerCase() === user2.location.toLowerCase() ? 1 : 0.3;
      score += locationScore * 10;
    }
    maxScore += 10;

    // Signature Connection preferences compatibility (50%)
    if (prefs1 && prefs2) {
      // Connection types compatibility (10%)
      const connectionTypesScore = this.calculateArrayCompatibility(
        prefs1.connectionTypes || [],
        prefs2.connectionTypes || [],
      );
      score += connectionTypesScore * 10;

      // Creative interests compatibility (8%)
      const creativeScore = this.calculateArrayCompatibility(
        prefs1.creativeInterests || [],
        prefs2.creativeInterests || [],
      );
      score += creativeScore * 8;

      // MBTI compatibility (10%)
      if (prefs1.mbti && prefs2.mbti) {
        const mbtiScore = this.calculateMBTICompatibility(prefs1.mbti, prefs2.mbti);
        score += mbtiScore * 10;
      }
      maxScore += 10;

      // Interests tags compatibility (8%)
      if (prefs1.interests && prefs2.interests) {
        const interestsTagsScore = this.calculateArrayCompatibility(
          prefs1.interests || [],
          prefs2.interests || [],
        );
        score += interestsTagsScore * 8;
      }
      maxScore += 8;

      // Music taste compatibility (5%)
      const musicScore = this.calculateMusicCompatibility(prefs1, prefs2);
      score += musicScore * 5;

      // Entertainment compatibility (5%)
      const entertainmentScore = this.calculateEntertainmentCompatibility(prefs1, prefs2);
      score += entertainmentScore * 5;

      // Personal story compatibility (4%)
      const personalStoryScore = this.calculatePersonalStoryCompatibility(prefs1, prefs2);
      score += personalStoryScore * 4;
    }
    maxScore += 40;

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  private calculateArrayCompatibility(array1: string[], array2: string[]): number {
    if (array1.length === 0 && array2.length === 0) return 0.5;
    if (array1.length === 0 || array2.length === 0) return 0.1;

    const set1 = new Set(array1.map(item => item.toLowerCase()));
    const set2 = new Set(array2.map(item => item.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculateMBTICompatibility(mbti1: string, mbti2: string): number {
    // MBTI 호환성 매트릭스 - 일반적인 MBTI 호환성 기준
    const compatibilityMatrix: Record<string, string[]> = {
      'INTJ': ['ENFP', 'ENTP', 'INFJ', 'INTJ'],
      'INTP': ['ENTJ', 'ESTJ', 'INFJ', 'INTP'],
      'ENTJ': ['INTP', 'INFP', 'ENFJ', 'ENTJ'],
      'ENTP': ['INFJ', 'INTJ', 'ENFJ', 'ENTP'],
      'INFJ': ['ENTP', 'ENFP', 'INTJ', 'INFJ'],
      'INFP': ['ENTJ', 'ENFJ', 'INFP', 'ENFP'],
      'ENFJ': ['INFP', 'ISFP', 'ENFJ', 'ENFP'],
      'ENFP': ['INTJ', 'INFJ', 'ENFJ', 'ENFP'],
      'ISTJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ'],
      'ISFJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ'],
      'ESTJ': ['ISTP', 'ISFP', 'ISTJ', 'ESTJ'],
      'ESFJ': ['ISFP', 'ISTP', 'ESFJ', 'ISFJ'],
      'ISTP': ['ESTJ', 'ESFJ', 'ISTP', 'ESTP'],
      'ISFP': ['ENFJ', 'ESFJ', 'ESTJ', 'ISFP'],
      'ESTP': ['ISTJ', 'ISFJ', 'ESTP', 'ISTP'],
      'ESFP': ['ISTJ', 'ISFJ', 'ESFP', 'ISFP'],
    };

    const highlyCompatible = compatibilityMatrix[mbti1] || [];
    
    if (mbti1 === mbti2) {
      return 0.8; // 같은 MBTI는 80% 호환성
    } else if (highlyCompatible.includes(mbti2)) {
      return 1.0; // 높은 호환성
    } else {
      // 기본 호환성 계산 (같은 그룹끼리는 더 높은 점수)
      const group1 = this.getMBTIGroup(mbti1);
      const group2 = this.getMBTIGroup(mbti2);
      
      if (group1 === group2) {
        return 0.6; // 같은 그룹
      } else {
        return 0.4; // 다른 그룹
      }
    }
  }

  private getMBTIGroup(mbti: string): string {
    const analysts = ['INTJ', 'INTP', 'ENTJ', 'ENTP'];
    const diplomats = ['INFJ', 'INFP', 'ENFJ', 'ENFP'];
    const sentinels = ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'];
    const explorers = ['ISTP', 'ISFP', 'ESTP', 'ESFP'];
    
    if (analysts.includes(mbti)) return 'analysts';
    if (diplomats.includes(mbti)) return 'diplomats';
    if (sentinels.includes(mbti)) return 'sentinels';
    if (explorers.includes(mbti)) return 'explorers';
    return 'unknown';
  }

  private calculateMusicCompatibility(prefs1: any, prefs2: any): number {
    let score = 0;
    
    // 음악 장르 호환성
    const genreScore = this.calculateArrayCompatibility(
      prefs1.musicGenres || [],
      prefs2.musicGenres || [],
    );
    score += genreScore * 0.4;
    
    // 좋아하는 아티스트 일치
    if (prefs1.artist && prefs2.artist) {
      score += (prefs1.artist.toLowerCase() === prefs2.artist.toLowerCase()) ? 0.6 : 0.2;
    } else if (prefs1.favoriteArtists && prefs2.favoriteArtists) {
      const artistScore = this.calculateArrayCompatibility(
        prefs1.favoriteArtists,
        prefs2.favoriteArtists,
      );
      score += artistScore * 0.6;
    }
    
    return Math.min(score, 1);
  }

  private calculateEntertainmentCompatibility(prefs1: any, prefs2: any): number {
    let score = 0;
    
    // 엔터테인먼트 장르 호환성
    const genreScore = this.calculateArrayCompatibility(
      prefs1.entertainmentGenres || [],
      prefs2.entertainmentGenres || [],
    );
    score += genreScore * 0.5;
    
    // 좋아하는 영화 일치
    if (prefs1.movie && prefs2.movie) {
      score += (prefs1.movie.toLowerCase() === prefs2.movie.toLowerCase()) ? 0.5 : 0.1;
    }
    
    return Math.min(score, 1);
  }

  private calculatePersonalStoryCompatibility(prefs1: any, prefs2: any): number {
    const storyFields = [
      'memorablePlace',
      'childhoodMemory',
      'turningPoint',
      'proudestMoment',
      'bucketList',
      'lifeLesson',
    ];
    
    let filledCount = 0;
    let similarityScore = 0;
    
    for (const field of storyFields) {
      if (prefs1[field] && prefs2[field]) {
        filledCount++;
        // 간단한 텍스트 유사성 (길이와 키워드 기반)
        const similarity = this.calculateTextSimilarity(prefs1[field], prefs2[field]);
        similarityScore += similarity;
      }
    }
    
    if (filledCount === 0) return 0;
    
    // 개인 이야기를 많이 공유할수록 높은 점수
    const sharingBonus = filledCount / storyFields.length * 0.3;
    const avgSimilarity = similarityScore / filledCount * 0.7;
    
    return sharingBonus + avgSimilarity;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // 간단한 텍스트 유사성 계산
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async buildConnectionMatch(
    currentUser: User,
    matchUser: User,
    compatibilityScore: number,
  ): Promise<ConnectionMatchDto> {
    const currentPrefs = currentUser.preferences?.signatureConnection;
    const matchPrefs = matchUser.preferences?.signatureConnection;

    // Calculate common elements
    const commonInterests = this.findCommonElements(
      currentUser.interests || [],
      matchUser.interests || [],
    );

    const commonSkills = this.findCommonElements(
      currentUser.skills || [],
      matchUser.skills || [],
    );

    const commonMusicGenres = this.findCommonElements(
      currentPrefs?.musicGenres || [],
      matchPrefs?.musicGenres || [],
    ) as string[];

    const commonEntertainment = this.findCommonElements(
      currentPrefs?.entertainmentGenres || [],
      matchPrefs?.entertainmentGenres || [],
    ) as string[];

    const matchingConnectionTypes = this.findCommonElements(
      currentPrefs?.connectionTypes || [],
      matchPrefs?.connectionTypes || [],
    ) as ConnectionType[];

    // Calculate distance if both users have location
    let distance: number | undefined;
    if (currentUser.lastKnownLatitude && currentUser.lastKnownLongitude &&
        matchUser.lastKnownLatitude && matchUser.lastKnownLongitude) {
      distance = this.calculateDistance(
        currentUser.lastKnownLatitude,
        currentUser.lastKnownLongitude,
        matchUser.lastKnownLatitude,
        matchUser.lastKnownLongitude,
      );
    }

    return {
      userId: matchUser.id,
      username: matchUser.username,
      fullName: matchUser.getFullName(),
      avatarUrl: matchUser.avatarUrl,
      bio: matchUser.bio,
      location: matchUser.location,
      distance,
      compatibilityScore,
      matchingConnectionTypes,
      commonInterests,
      commonSkills,
      commonMusicGenres,
      commonEntertainment,
      lastActiveAt: matchUser.lastLoginAt,
      hasBeenContacted: false, // TODO: Implement contact tracking
      mutualConnections: 0, // TODO: Implement mutual connections
    };
  }

  private findCommonElements<T>(array1: T[], array2: T[]): T[] {
    const set1 = new Set(array1.map(item => String(item).toLowerCase()));
    return array2.filter(item => set1.has(String(item).toLowerCase()));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getMissingProfileFields(user: User): string[] {
    const missing = [];
    
    if (!user.bio) missing.push('bio');
    if (!user.interests || user.interests.length === 0) missing.push('interests');
    if (!user.skills || user.skills.length === 0) missing.push('skills');
    if (!user.avatarUrl) missing.push('avatarUrl');
    if (!user.location) missing.push('location');
    if (!user.dateOfBirth) missing.push('dateOfBirth');
    if (!user.occupation) missing.push('occupation');
    if (!user.preferences?.signatureConnection) missing.push('signatureConnectionPreferences');
    
    return missing;
  }
}