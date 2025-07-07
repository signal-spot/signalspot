import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../entities/user.entity';
import {
  SignatureConnectionPreferencesDto,
  ConnectionMatchDto,
  ConnectionType,
  AvailabilityLevel,
  MeetingPreference,
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
    const [potentialMatches, total] = await this.em.findAndCount(
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

    // Interests compatibility (30%)
    const interestsScore = this.calculateArrayCompatibility(
      user1.interests || [],
      user2.interests || [],
    );
    score += interestsScore * 30;
    maxScore += 30;

    // Skills compatibility (20%)
    const skillsScore = this.calculateArrayCompatibility(
      user1.skills || [],
      user2.skills || [],
    );
    score += skillsScore * 20;
    maxScore += 20;

    // Location compatibility (15%)
    if (user1.location && user2.location) {
      const locationScore = user1.location.toLowerCase() === user2.location.toLowerCase() ? 1 : 0.3;
      score += locationScore * 15;
    }
    maxScore += 15;

    // Signature Connection preferences compatibility (35%)
    if (prefs1 && prefs2) {
      // Connection types compatibility (15%)
      const connectionTypesScore = this.calculateArrayCompatibility(
        prefs1.connectionTypes || [],
        prefs2.connectionTypes || [],
      );
      score += connectionTypesScore * 15;

      // Creative interests compatibility (10%)
      const creativeScore = this.calculateArrayCompatibility(
        prefs1.creativeInterests || [],
        prefs2.creativeInterests || [],
      );
      score += creativeScore * 10;

      // Music genres compatibility (5%)
      const musicScore = this.calculateArrayCompatibility(
        prefs1.musicGenres || [],
        prefs2.musicGenres || [],
      );
      score += musicScore * 5;

      // Entertainment compatibility (5%)
      const entertainmentScore = this.calculateArrayCompatibility(
        prefs1.entertainmentGenres || [],
        prefs2.entertainmentGenres || [],
      );
      score += entertainmentScore * 5;
    }
    maxScore += 35;

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