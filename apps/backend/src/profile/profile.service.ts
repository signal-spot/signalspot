import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User, ProfileVisibility } from '../entities/user.entity';
import { UpdateProfileDto, UpdateProfileSettingsDto, ProfileResponseDto } from './dto/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly em: EntityManager) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfileResponse(user);
  }

  async getPublicProfile(userId: string, viewerId?: string): Promise<ProfileResponseDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if viewer can access this profile
    const viewer = viewerId ? await this.em.findOne(User, { id: viewerId }) : null;
    
    if (!user.canViewProfile(viewer || user)) {
      throw new ForbiddenException('Profile is not public');
    }

    // Increment profile views if viewed by someone else
    if (viewerId && viewerId !== userId) {
      user.incrementProfileViews();
      await this.em.flush();
    }

    return this.mapUserToProfileResponse(user);
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert date string to Date object if provided
    const updateData: any = { ...updateDto };
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    // Use the domain method to update profile
    user.updateProfile(updateData);
    
    await this.em.flush();

    return this.mapUserToProfileResponse(user);
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

    return {
      profileSummary: user.getProfileSummary(),
      analytics: user.profileAnalytics || {},
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
  }): Promise<{
    profiles: ProfileResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const limit = Math.min(query.limit || 20, 50); // Max 50 results
    const offset = query.offset || 0;

    // Build search criteria
    const searchCriteria: any = {
      profileVisibility: ProfileVisibility.PUBLIC,
      isActive: true,
    };

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

    // Build search criteria for suggestions
    const baseCriteria = {
      id: { $ne: userId },
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
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      company: user.company,
      school: user.school,
      website: user.website,
      location: user.location,
      profileVisibility: user.profileVisibility,
      socialLinks: user.socialLinks,
      interests: user.interests,
      skills: user.skills,
      languages: user.languages,
      profileCompletionPercentage: user.profileCompletionPercentage,
      profileViews: user.profileViews,
      isEmailVerified: user.isEmailVerified,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      lastProfileUpdateAt: user.lastProfileUpdateAt,
    };
  }
}