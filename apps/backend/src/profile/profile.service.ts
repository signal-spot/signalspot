import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { LoggerService } from '../common/services/logger.service';
import { User, ProfileVisibility, UserStatus } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { UpdateProfileDto, UpdateProfileSettingsDto, ProfileResponseDto } from './dto/profile-update.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: LoggerService
  ) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfileResponse(user);
  }

  async getPublicProfile(userId: string, viewerId?: string): Promise<ProfileResponseDto> {
    const user = await this.em.findOne(User, { id: userId }, {
      populate: ['location', 'profileCompleted', 'preferences'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if viewer exists and get their data
    const viewer = viewerId ? await this.em.findOne(User, { id: viewerId }) : null;
    
    // Check if viewer is blocked by the profile owner
    if (viewer) {
      const isBlocked = await this.em.findOne('BlockedUser', {
        blocker: user.id,
        blocked: viewer.id,
      });
      
      if (isBlocked) {
        throw new ForbiddenException('You cannot view this profile');
      }
      
      // Check if profile owner is blocked by the viewer
      const hasBlocked = await this.em.findOne('BlockedUser', {
        blocker: viewer.id,
        blocked: user.id,
      });
      
      if (hasBlocked) {
        throw new ForbiddenException('You have blocked this user');
      }
    }
    
    // Check profile visibility settings
    if (!user.canViewProfile(viewer || user)) {
      throw new ForbiddenException('Profile is not public');
    }

    // Increment profile views if viewed by someone else
    if (viewerId && viewerId !== userId) {
      user.incrementProfileViews();
      await this.em.flush();
    }

    // Get full profile data using the same mapping method
    const response = this.mapUserToProfileResponse(user);
    
    // If viewing someone else's profile, remove sensitive information
    if (!viewerId || viewerId !== userId) {
      // Remove only truly sensitive fields
      delete response.email;
      delete response.phoneNumber;
      delete response.settings;
      
      // Keep all other fields including:
      // - signatureConnection (for matching)
      // - location (for distance calculations)
      // - interests, mbti, etc (for compatibility)
      // - profileViews, isVerified (public information)
    }

    return response;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    this.logger.debug('UpdateProfile called', 'ProfileService');
    
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.debug(`Avatar URL update: current=${user.avatarUrl}, new=${updateDto.avatarUrl}`, 'ProfileService');

    // Update basic profile fields if provided
    if (updateDto.username !== undefined) {
      // Check username availability if it's being changed
      if (updateDto.username !== user.username) {
        const usernameExists = await this.checkUsernameExists(updateDto.username, userId);
        if (usernameExists) {
          throw new BadRequestException('Username is already taken');
        }
      }
      user.username = updateDto.username;
    }

    if (updateDto.bio !== undefined) {
      user.bio = updateDto.bio;
    }

    if (updateDto.avatarUrl !== undefined) {
      user.avatarUrl = updateDto.avatarUrl;
      this.logger.debug(`User avatarUrl set to: ${user.avatarUrl}`, 'ProfileService');
    }

    // Update preferences.signatureConnection with the new data
    if (!user.preferences) {
      user.preferences = {};
    }
    
    // Only update signatureConnection if any of these fields are provided
    const signatureFields = ['mbti', 'interests', 'memorablePlace', 'childhoodMemory', 'turningPoint', 'proudestMoment', 'bucketList', 'lifeLesson'];
    const hasSignatureFields = signatureFields.some(field => updateDto[field] !== undefined);
    
    if (hasSignatureFields) {
      user.preferences.signatureConnection = {
        ...user.preferences.signatureConnection,
        mbti: updateDto.mbti,
        interests: updateDto.interests,
        memorablePlace: updateDto.memorablePlace,
        childhoodMemory: updateDto.childhoodMemory,
        turningPoint: updateDto.turningPoint,
        proudestMoment: updateDto.proudestMoment,
        bucketList: updateDto.bucketList,
        lifeLesson: updateDto.lifeLesson,
        updatedAt: new Date(),
      };
    }

    // Mark profile as completed if all required fields are filled
    if (updateDto.mbti || updateDto.interests?.length || updateDto.username || updateDto.bio) {
      user.profileCompleted = true;
    }

    user.updatedAt = new Date();
    
    this.logger.debug(`Before flush - user avatarUrl: ${user.avatarUrl}`, 'ProfileService');
    await this.em.flush();
    this.logger.debug(`After flush - user avatarUrl: ${user.avatarUrl}`, 'ProfileService');

    const response = this.mapUserToProfileResponse(user);
    this.logger.debug(`Response avatarUrl: ${response.avatarUrl}`, 'ProfileService');
    
    return response;
  }

  async setupInitialProfile(userId: string, setupDto: ProfileSetupDto): Promise<ProfileResponseDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user profile with setup data
    if (setupDto.username) {
      user.username = setupDto.username;
    }
    if (setupDto.displayName !== undefined) {
      user.displayName = setupDto.displayName;
    }
    if (setupDto.bio !== undefined) {
      user.bio = setupDto.bio;
    }
    // Only update avatarUrl if it's not null or undefined
    if (setupDto.avatarUrl !== undefined && setupDto.avatarUrl !== null) {
      user.avatarUrl = setupDto.avatarUrl;
    }
    if (setupDto.firstName !== undefined) {
      user.firstName = setupDto.firstName;
    }
    if (setupDto.lastName !== undefined) {
      user.lastName = setupDto.lastName;
    }
    if (setupDto.dateOfBirth !== undefined) {
      user.dateOfBirth = new Date(setupDto.dateOfBirth);
    }
    if (setupDto.gender !== undefined) {
      user.gender = setupDto.gender;
    }
    if (setupDto.email !== undefined && !user.email.startsWith('temp_')) {
      user.email = setupDto.email;
    }

    // Mark profile as completed if basic fields are filled
    if (user.username && !user.username.startsWith('temp_')) {
      user.profileCompleted = true;
      user.status = UserStatus.VERIFIED;
    }

    await this.em.flush();
    return this.mapUserToProfileResponse(user);
  }

  async checkUsernameExists(username: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { username };
    if (excludeUserId) {
      query.id = { $ne: excludeUserId };
    }
    
    const existingUser = await this.em.findOne(User, query);
    return !!existingUser;
  }

  async markProfileAsCompleted(userId: string): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.profileCompleted = true;
    user.status = UserStatus.VERIFIED;
    await this.em.flush();
  }

  async updateProfileSettings(
    userId: string,
    settingsDto: UpdateProfileSettingsDto,
  ): Promise<{ message: string }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use the domain method to update profile settings
    user.updateProfileSettings(settingsDto);
    
    await this.em.flush();

    return { message: 'Profile settings updated successfully' };
  }

  async updateProfileVisibility(
    userId: string,
    visibility: ProfileVisibility,
  ): Promise<{ message: string }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.updateProfileVisibility(visibility);
    await this.em.flush();

    return { message: 'Profile visibility updated successfully' };
  }

  async getProfileAnalytics(userId: string): Promise<{
    profileSummary: any;
    analytics: any;
    recentActivity: any;
  }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Aggregate actual statistics from database
    const [
      totalSparks,
      totalMessages,
      matchedSparks,
      totalSignalSpots
    ] = await Promise.all([
      // Count total sparks where user is involved
      this.em.count('Spark', {
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      }),
      
      // Count total messages sent by user
      this.em.count('Message', { sender: userId }),
      
      // Count matched sparks
      this.em.count('Spark', {
        $or: [
          { user1: userId, status: 'matched' },
          { user2: userId, status: 'matched' }
        ]
      }),
      
      // Count total signal spots created by user - using ID reference
      this.em.count('SignalSpot', { creator: userId })
    ]);

    // Calculate additional statistics with proper reference handling
    const [
      activeSignalSpots,
      totalSpotLikes,
      totalSpotViews
    ] = await Promise.all([
      // Count active signal spots - using ID reference
      this.em.count('SignalSpot', { 
        creator: userId, 
        status: 'active' 
      }),
      
      // Sum total likes on user's spots
      this.em.getConnection().execute(
        `SELECT COALESCE(SUM(like_count), 0) as total 
         FROM signal_spot 
         WHERE creator_id = ?`,
        [userId],
        'get'
      ).then((result: any) => parseInt(result?.total || '0')),
      
      // Sum total views on user's spots
      this.em.getConnection().execute(
        `SELECT COALESCE(SUM(view_count), 0) as total 
         FROM signal_spot 
         WHERE creator_id = ?`,
        [userId],
        'get'
      ).then((result: any) => parseInt(result?.total || '0'))
    ]);

    // Build analytics object with real data
    const analytics = {
      totalSparks,
      totalMessages,
      totalMatches: matchedSparks,
      totalSignalSpots,
      activeSignalSpots,
      totalSpotLikes,
      totalSpotViews,
      // Preserve any existing analytics data
      ...(user.profileAnalytics || {})
    };

    // Update user's profileAnalytics for caching
    user.profileAnalytics = {
      ...user.profileAnalytics,
      ...analytics,
      lastAnalyticsUpdate: new Date()
    };
    
    await this.em.flush();

    return {
      profileSummary: user.getProfileSummary(),
      analytics,
      recentActivity: {
        lastLogin: user.lastLoginAt,
        lastProfileUpdate: user.lastProfileUpdateAt,
        accountAge: user.accountAge,
        isRecentlyActive: user.isRecentlyActive(),
      },
    };
  }

  async searchProfiles(query: {
    search?: string;
    location?: string;
    skills?: string[];
    interests?: string[];
    occupation?: string;
    limit?: number;
    offset?: number;
    userId?: string; // Add userId to exclude blocked users
  }): Promise<{
    profiles: ProfileResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const limit = Math.min(query.limit || 20, 50); // Max 50 results
    const offset = query.offset || 0;

    // Get blocked users if userId is provided
    let blockedUserIds = new Set<string>();
    if (query.userId) {
      const blockedUsers = await this.em.find(BlockedUser, {
        $or: [
          { blocker: query.userId },
          { blocked: query.userId }
        ]
      });

      blockedUsers.forEach(block => {
        if (block.blocker.id === query.userId) {
          blockedUserIds.add(block.blocked.id);
        } else {
          blockedUserIds.add(block.blocker.id);
        }
      });
    }

    // Build search criteria
    const searchCriteria: any = {
      profileVisibility: ProfileVisibility.PUBLIC,
      isActive: true,
    };

    // Exclude blocked users
    if (blockedUserIds.size > 0) {
      searchCriteria.id = { $nin: Array.from(blockedUserIds) };
    }

    if (query.location) {
      searchCriteria.location = { $ilike: `%${query.location}%` };
    }

    if (query.occupation) {
      searchCriteria.occupation = { $ilike: `%${query.occupation}%` };
    }

    if (query.skills && query.skills.length > 0) {
      searchCriteria.skills = { $overlap: query.skills };
    }

    if (query.interests && query.interests.length > 0) {
      searchCriteria.interests = { $overlap: query.interests };
    }

    if (query.search) {
      searchCriteria.$or = [
        { firstName: { $ilike: `%${query.search}%` } },
        { lastName: { $ilike: `%${query.search}%` } },
        { username: { $ilike: `%${query.search}%` } },
        { bio: { $ilike: `%${query.search}%` } },
      ];
    }

    const [users, total] = await this.em.findAndCount(
      User,
      searchCriteria,
      {
        orderBy: {
          profileCompletionPercentage: 'DESC',
          lastLoginAt: 'DESC',
          createdAt: 'DESC',
        },
        limit,
        offset,
      }
    );

    return {
      profiles: users.map(user => this.mapUserToProfileResponse(user)),
      total,
      hasMore: offset + limit < total,
    };
  }

  async suggestConnections(userId: string, limit = 10): Promise<ProfileResponseDto[]> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get blocked users
    const blockedUsers = await this.em.find(BlockedUser, {
      $or: [
        { blocker: userId },
        { blocked: userId }
      ]
    });

    const blockedUserIds: string[] = [userId]; // Always exclude self
    blockedUsers.forEach(block => {
      if (block.blocker.id === userId) {
        blockedUserIds.push(block.blocked.id);
      } else {
        blockedUserIds.push(block.blocker.id);
      }
    });

    // Build search criteria for suggestions
    const baseCriteria = {
      id: { $nin: blockedUserIds },
      profileVisibility: ProfileVisibility.PUBLIC,
      isActive: true,
    };

    const suggestions: User[] = [];

    // Find users with similar interests
    if (user.interests && user.interests.length > 0) {
      const interestMatches = await this.em.find(
        User,
        {
          ...baseCriteria,
          interests: { $overlap: user.interests },
        },
        {
          orderBy: { profileCompletionPercentage: 'DESC', lastLoginAt: 'DESC' },
          limit: Math.ceil(limit * 0.5),
        }
      );
      suggestions.push(...interestMatches);
    }

    // Find users with similar skills
    if (user.skills && user.skills.length > 0 && suggestions.length < limit) {
      const skillMatches = await this.em.find(
        User,
        {
          ...baseCriteria,
          skills: { $overlap: user.skills },
          id: { $nin: suggestions.map(s => s.id).concat(userId) },
        },
        {
          orderBy: { profileCompletionPercentage: 'DESC', lastLoginAt: 'DESC' },
          limit: limit - suggestions.length,
        }
      );
      suggestions.push(...skillMatches);
    }

    // Fill remaining with users from similar location
    if (user.location && suggestions.length < limit) {
      const locationMatches = await this.em.find(
        User,
        {
          ...baseCriteria,
          location: { $ilike: `%${user.location}%` },
          id: { $nin: suggestions.map(s => s.id).concat(userId) },
        },
        {
          orderBy: { profileCompletionPercentage: 'DESC', lastLoginAt: 'DESC' },
          limit: limit - suggestions.length,
        }
      );
      suggestions.push(...locationMatches);
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, arr) => 
        arr.findIndex(s => s.id === suggestion.id) === index
      )
      .slice(0, limit);

    return uniqueSuggestions.map(u => this.mapUserToProfileResponse(u));
  }

  private mapUserToProfileResponse(user: User): ProfileResponseDto {
    const signatureConnection = user.preferences?.signatureConnection || {};
    
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      
      // Location as object if coordinates exist
      location: (user.lastKnownLatitude && user.lastKnownLongitude) ? {
        latitude: user.lastKnownLatitude,
        longitude: user.lastKnownLongitude,
        address: user.location,
        city: undefined,
        country: undefined,
      } : undefined,
      
      // Profile metadata
      profileCompleted: user.profileCompleted,
      profileCompletionScore: user.profileCompletionPercentage,
      profileVisibility: user.profileVisibility,
      
      // Signature Connection individual fields
      mbti: signatureConnection.mbti,
      interests: signatureConnection.interests || user.interests,
      memorablePlace: signatureConnection.memorablePlace,
      childhoodMemory: signatureConnection.childhoodMemory,
      turningPoint: signatureConnection.turningPoint,
      proudestMoment: signatureConnection.proudestMoment,
      bucketList: signatureConnection.bucketList,
      lifeLesson: signatureConnection.lifeLesson,
      
      // Full signature connection object
      signatureConnection: signatureConnection ? {
        mbti: signatureConnection.mbti,
        interests: signatureConnection.interests || [],
        memorablePlace: signatureConnection.memorablePlace,
        childhoodMemory: signatureConnection.childhoodMemory,
        turningPoint: signatureConnection.turningPoint,
        proudestMoment: signatureConnection.proudestMoment,
        bucketList: signatureConnection.bucketList,
        lifeLesson: signatureConnection.lifeLesson,
        preferredMbti: signatureConnection.preferredMbti || [],
        preferredInterests: signatureConnection.preferredInterests || [],
        preferredAgeMin: signatureConnection.preferredAgeMin,
        preferredAgeMax: signatureConnection.preferredAgeMax,
        preferredDistance: signatureConnection.preferredDistance,
      } : undefined,
      
      // Stats
      profileViews: user.profileViews,
      isVerified: user.status === UserStatus.VERIFIED,
      
      // Settings
      settings: user.preferences,
      
      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastActiveAt: user.lastLoginAt,
    };
  }
}