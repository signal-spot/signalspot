import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User, ProfileVerificationStatus } from '../entities/user.entity';
import { UserProfileDomainService } from '../domain/user-profile.domain-service';
import { 
  UpdateProfileDto, 
  UpdateProfileSettingsDto, 
  ProfileVerificationRequestDto 
} from './dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly userProfileDomainService: UserProfileDomainService,
  ) {}

  /**
   * Updates user profile information
   */
  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use domain service to handle business logic
    this.userProfileDomainService.updateUserProfile(user, updateData);

    // Persist changes
    await this.em.persistAndFlush(user);

    return user;
  }

  /**
   * Updates user profile settings
   */
  async updateProfileSettings(userId: string, settings: UpdateProfileSettingsDto): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use domain service to handle business logic
    this.userProfileDomainService.updateProfileSettings(user, settings);

    // Persist changes
    await this.em.persistAndFlush(user);

    return user;
  }

  /**
   * Requests profile verification
   */
  async requestVerification(userId: string, verificationData: ProfileVerificationRequestDto): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use domain service to handle business logic
    this.userProfileDomainService.requestProfileVerification(user, verificationData);

    // Persist changes
    await this.em.persistAndFlush(user);
  }

  /**
   * Approves profile verification (Admin only)
   */
  async approveVerification(userId: string, verifierId: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use domain service to handle business logic
    this.userProfileDomainService.verifyUserProfile(user, verifierId);

    // Persist changes
    await this.em.persistAndFlush(user);
  }

  /**
   * Rejects profile verification (Admin only)
   */
  async rejectVerification(userId: string, reason: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use domain service to handle business logic
    this.userProfileDomainService.rejectProfileVerification(user, reason);

    // Persist changes
    await this.em.persistAndFlush(user);
  }

  /**
   * Finds a user by ID
   */
  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ id: userId });
  }

  /**
   * Updates user entity
   */
  async updateUser(user: User): Promise<void> {
    await this.em.persistAndFlush(user);
  }

  /**
   * Searches user profiles
   */
  async searchProfiles(query: string, limit: number = 10, offset: number = 0): Promise<User[]> {
    const searchQuery = `%${query.toLowerCase()}%`;
    
    return await this.userRepository.find(
      {
        $or: [
          { firstName: { $ilike: searchQuery } },
          { lastName: { $ilike: searchQuery } },
          { username: { $ilike: searchQuery } },
          { bio: { $ilike: searchQuery } },
          { occupation: { $ilike: searchQuery } },
          { company: { $ilike: searchQuery } },
          { school: { $ilike: searchQuery } },
          { location: { $ilike: searchQuery } },
        ],
        isActive: true,
        isPublicProfile: true,
      },
      {
        limit,
        offset,
        orderBy: { profileCompletionPercentage: 'DESC' },
      }
    );
  }

  /**
   * Gets users with pending verification requests
   */
  async getPendingVerifications(): Promise<User[]> {
    return await this.userRepository.find(
      { verificationStatus: ProfileVerificationStatus.PENDING },
      { orderBy: { updatedAt: 'ASC' } }
    );
  }

  /**
   * Gets profile analytics overview
   */
  async getAnalyticsOverview(): Promise<{
    totalProfiles: number;
    verifiedProfiles: number;
    completeProfiles: number;
    averageCompletionRate: number;
  }> {
    const [
      totalProfiles,
      verifiedProfiles,
      completeProfiles,
      averageCompletionResult
    ] = await Promise.all([
      this.userRepository.count({ isActive: true }),
      this.userRepository.count({ 
        isActive: true, 
        verificationStatus: ProfileVerificationStatus.VERIFIED 
      }),
      this.userRepository.count({ 
        isActive: true, 
        profileCompletionPercentage: { $gte: 80 } 
      }),
      this.em.getConnection().execute(`
        SELECT AVG(profile_completion_percentage) as avg_completion 
        FROM "user" 
        WHERE is_active = true
      `)
    ]);

    const averageCompletionRate = parseFloat(averageCompletionResult[0]?.avg_completion || '0');

    return {
      totalProfiles,
      verifiedProfiles,
      completeProfiles,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
    };
  }

  /**
   * Gets trending profiles
   */
  async getTrendingProfiles(limit: number = 10): Promise<User[]> {
    return await this.userRepository.find(
      {
        isActive: true,
        isPublicProfile: true,
        profileViews: { $gt: 0 },
      },
      {
        orderBy: { profileViews: 'DESC' },
        limit,
      }
    );
  }

  /**
   * Gets recently updated profiles
   */
  async getRecentlyUpdatedProfiles(limit: number = 10): Promise<User[]> {
    return await this.userRepository.find(
      {
        isActive: true,
        isPublicProfile: true,
        lastProfileUpdateAt: { $ne: null },
      },
      {
        orderBy: { lastProfileUpdateAt: 'DESC' },
        limit,
      }
    );
  }

  /**
   * Gets profiles by location
   */
  async getProfilesByLocation(location: string, limit: number = 10): Promise<User[]> {
    return await this.userRepository.find(
      {
        isActive: true,
        isPublicProfile: true,
        location: { $ilike: `%${location}%` },
      },
      {
        orderBy: { profileCompletionPercentage: 'DESC' },
        limit,
      }
    );
  }

  /**
   * Gets profiles by occupation
   */
  async getProfilesByOccupation(occupation: string, limit: number = 10): Promise<User[]> {
    return await this.userRepository.find(
      {
        isActive: true,
        isPublicProfile: true,
        occupation: { $ilike: `%${occupation}%` },
      },
      {
        orderBy: { profileCompletionPercentage: 'DESC' },
        limit,
      }
    );
  }

  /**
   * Gets profiles by interests
   */
  async getProfilesByInterests(interests: string[], limit: number = 10): Promise<User[]> {
    return await this.userRepository.find(
      {
        isActive: true,
        isPublicProfile: true,
        interests: { $overlap: interests },
      },
      {
        orderBy: { profileCompletionPercentage: 'DESC' },
        limit,
      }
    );
  }

  /**
   * Gets incomplete profiles (for completion reminders)
   */
  async getIncompleteProfiles(maxCompletionPercentage: number = 80, limit: number = 100): Promise<User[]> {
    return await this.userRepository.find(
      {
        isActive: true,
        profileCompletionPercentage: { $lt: maxCompletionPercentage },
      },
      {
        orderBy: { profileCompletionPercentage: 'ASC' },
        limit,
      }
    );
  }

  /**
   * Updates profile analytics
   */
  async updateProfileAnalytics(userId: string, analytics: {
    totalViews?: number;
    uniqueViews?: number;
    viewsThisMonth?: number;
    searchAppearances?: number;
    profileClicks?: number;
  }): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentAnalytics = user.profileAnalytics || {};
    user.profileAnalytics = {
      ...currentAnalytics,
      ...analytics,
      lastAnalyticsUpdate: new Date(),
    };

    await this.em.persistAndFlush(user);
  }

  /**
   * Bulk updates profile completion percentages
   */
  async recalculateProfileCompletions(): Promise<void> {
    const users = await this.userRepository.findAll();
    
    for (const user of users) {
      const newPercentage = user.calculateProfileCompletionPercentage();
      if (user.profileCompletionPercentage !== newPercentage) {
        user.profileCompletionPercentage = newPercentage;
      }
    }

    await this.em.flush();
  }

  /**
   * Gets profile statistics for a user
   */
  async getProfileStatistics(userId: string): Promise<{
    profileViews: number;
    completionPercentage: number;
    isVerified: boolean;
    accountAge: number;
    lastActive: Date | null;
  }> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      profileViews: user.profileViews,
      completionPercentage: user.profileCompletionPercentage,
      isVerified: user.verificationStatus === ProfileVerificationStatus.VERIFIED,
      accountAge: user.accountAge,
      lastActive: user.lastLoginAt,
    };
  }

  /**
   * Checks if a user can manage another user's profile
   */
  canManageProfile(manager: User, targetUserId: string): boolean {
    // Users can only manage their own profiles
    // Admins can manage any profile (implement admin check based on your user roles)
    return manager.id === targetUserId;
  }

  /**
   * Gets profile completion tips for a user
   */
  getProfileCompletionTips(user: User): string[] {
    const tips = [];
    
    if (!user.avatarUrl) {
      tips.push('Upload a profile picture to make your profile more appealing');
    }
    
    if (!user.bio) {
      tips.push('Add a bio to tell others about yourself');
    }
    
    if (!user.interests || user.interests.length === 0) {
      tips.push('Add interests to connect with like-minded people');
    }
    
    if (!user.location) {
      tips.push('Add your location to find nearby connections');
    }
    
    if (!user.occupation) {
      tips.push('Add your occupation to showcase your professional background');
    }
    
    if (!user.socialLinks || Object.keys(user.socialLinks).length === 0) {
      tips.push('Connect your social media accounts to expand your network');
    }
    
    if (!user.skills || user.skills.length === 0) {
      tips.push('Add your skills to highlight your expertise');
    }
    
    if (!user.dateOfBirth) {
      tips.push('Consider adding your date of birth to help others connect with you');
    }
    
    return tips;
  }
}