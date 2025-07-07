import { apiService, ApiResponse } from './api.service';
import { SignatureConnectionPreferencesDto, ConnectionMatchDto, SignatureConnectionStatsDto } from '../types/profile.types';

// User profile interfaces
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  bio?: string;
  interests?: string[];
  avatarUrl?: string;
  coverImageUrl?: string;
  location?: {
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  isEmailVerified: boolean;
  isVerified: boolean;
  verificationBadge?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  lastLoginAt?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showLocation: boolean;
      showActivity: boolean;
      allowMessages: boolean;
      allowFriendRequests: boolean;
    };
    appearance: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
    };
  };
  statistics: {
    totalSpots: number;
    activeSpots: number;
    totalViews: number;
    totalLikes: number;
    followersCount: number;
    followingCount: number;
    profileViews: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  bio?: string;
  interests?: string[];
  location?: {
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface UpdateProfileSettingsRequest {
  isPrivate?: boolean;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    privacy?: {
      showLocation?: boolean;
      showActivity?: boolean;
      allowMessages?: boolean;
      allowFriendRequests?: boolean;
    };
    appearance?: {
      theme?: 'light' | 'dark' | 'auto';
      language?: string;
      timezone?: string;
    };
  };
}

export interface ProfileCompletionStatus {
  completionPercentage: number;
  missingFields: string[];
  completedFields: string[];
  suggestions: Array<{
    field: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface ProfileAnalytics {
  totalViews: number;
  weeklyViews: number;
  monthlyViews: number;
  viewsThisYear: number;
  topViewers: Array<{
    userId: string;
    username: string;
    avatarUrl?: string;
    viewCount: number;
  }>;
  profileSearchRank: number;
  engagementRate: number;
  peakActivityHours: number[];
}

export interface ProfileSummary {
  id: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  isVerified: boolean;
  verificationBadge?: string;
  totalSpots: number;
  totalLikes: number;
  memberSince: string;
  lastActive: string;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export interface PublicProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  bio?: string;
  interests?: string[];
  avatarUrl?: string;
  coverImageUrl?: string;
  location?: {
    city?: string;
    country?: string;
  };
  isVerified: boolean;
  verificationBadge?: string;
  createdAt: string;
  lastActiveAt?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  statistics: {
    totalSpots: number;
    activeSpots: number;
    totalViews: number;
    totalLikes: number;
    followersCount: number;
    followingCount: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  canFollow: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
  mutualFollowers: number;
}

export interface ProfileSearchResult {
  id: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  isVerified: boolean;
  verificationBadge?: string;
  followersCount: number;
  mutualFollowers: number;
  isFollowing: boolean;
  relevanceScore: number;
}

export interface VerificationRequest {
  type: 'identity' | 'business' | 'celebrity' | 'organization';
  documentUrl: string;
  additionalInfo?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileSearchQuery {
  q: string;
  limit?: number;
  offset?: number;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  };
  filters?: {
    verified?: boolean;
    hasAvatar?: boolean;
    interests?: string[];
    minFollowers?: number;
  };
}

class ProfileService {
  private readonly baseEndpoint = '/profile';

  // Get current user profile
  async getCurrentProfile(): Promise<ApiResponse<UserProfile>> {
    return apiService.get<ApiResponse<UserProfile>>(
      `${this.baseEndpoint}/me`,
      {},
      'currentProfile'
    );
  }

  // Update current user profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return apiService.put<ApiResponse<UserProfile>>(
      `${this.baseEndpoint}/me`,
      profileData,
      'updateProfile'
    );
  }

  // Update profile settings
  async updateProfileSettings(settingsData: UpdateProfileSettingsRequest): Promise<ApiResponse<{ message: string }>> {
    return apiService.put<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/settings`,
      settingsData,
      'updateSettings'
    );
  }

  // Update profile visibility
  async updateProfileVisibility(visibility: 'public' | 'friends' | 'private'): Promise<ApiResponse<{ message: string }>> {
    return apiService.put<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/visibility/${visibility}`,
      {},
      'updateVisibility'
    );
  }

  // Get profile analytics
  async getProfileAnalytics(): Promise<ApiResponse<ProfileAnalytics>> {
    return apiService.get<ApiResponse<ProfileAnalytics>>(
      `${this.baseEndpoint}/analytics`,
      {},
      'profileAnalytics'
    );
  }

  // Get connection suggestions
  async getConnectionSuggestions(limit = 10): Promise<ApiResponse<ProfileSearchResult[]>> {
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      `${this.baseEndpoint}/suggestions`,
      { limit },
      'connectionSuggestions'
    );
  }

  // Search profiles with backend API
  async searchProfiles(query: {
    search?: string;
    location?: string;
    skills?: string[];
    interests?: string[];
    occupation?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    profiles: ProfileSearchResult[];
    total: number;
    hasMore: boolean;
  }>> {
    return apiService.get<ApiResponse<{
      profiles: ProfileSearchResult[];
      total: number;
      hasMore: boolean;
    }>>(
      `${this.baseEndpoint}/search`,
      query,
      'searchProfiles'
    );
  }

  // Signature Connection methods
  async updateSignatureConnectionPreferences(preferences: SignatureConnectionPreferencesDto): Promise<ApiResponse<{ message: string }>> {
    return apiService.put<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/signature-connection/preferences`,
      preferences,
      'updateSignatureConnectionPreferences'
    );
  }

  async getSignatureConnectionPreferences(): Promise<ApiResponse<SignatureConnectionPreferencesDto>> {
    return apiService.get<ApiResponse<SignatureConnectionPreferencesDto>>(
      `${this.baseEndpoint}/signature-connection/preferences`,
      {},
      'getSignatureConnectionPreferences'
    );
  }

  async findSignatureConnectionMatches(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{
    matches: ConnectionMatchDto[];
    total: number;
    hasMore: boolean;
  }>> {
    return apiService.get<ApiResponse<{
      matches: ConnectionMatchDto[];
      total: number;
      hasMore: boolean;
    }>>(
      `${this.baseEndpoint}/signature-connection/matches`,
      params,
      'findSignatureConnectionMatches'
    );
  }

  async getSignatureConnectionStats(): Promise<ApiResponse<SignatureConnectionStatsDto>> {
    return apiService.get<ApiResponse<SignatureConnectionStatsDto>>(
      `${this.baseEndpoint}/signature-connection/stats`,
      {},
      'getSignatureConnectionStats'
    );
  }

  // Upload profile avatar
  async uploadAvatar(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<ApiResponse<UserProfile>> {
    return apiService.uploadFile<ApiResponse<UserProfile>>(
      `${this.baseEndpoint}/avatar`,
      file,
      {},
      'uploadAvatar'
    );
  }

  // Remove profile avatar
  async removeAvatar(): Promise<ApiResponse<UserProfile>> {
    return apiService.delete<ApiResponse<UserProfile>>(
      `${this.baseEndpoint}/avatar`,
      'removeAvatar'
    );
  }

  // Upload cover image
  async uploadCoverImage(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<ApiResponse<FileUploadResponse>> {
    return apiService.uploadFile<ApiResponse<FileUploadResponse>>(
      `${this.baseEndpoint}/me/cover`,
      file,
      {},
      'uploadCover'
    );
  }

  // Remove cover image
  async removeCoverImage(): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(
      `${this.baseEndpoint}/me/cover`,
      'removeCover'
    );
  }

  // Get profile completion status
  async getProfileCompletionStatus(): Promise<ApiResponse<ProfileCompletionStatus>> {
    return apiService.get<ApiResponse<ProfileCompletionStatus>>(
      `${this.baseEndpoint}/me/completion`,
      {},
      'profileCompletion'
    );
  }

  // Get profile summary
  async getProfileSummary(): Promise<ApiResponse<ProfileSummary>> {
    return apiService.get<ApiResponse<ProfileSummary>>(
      `${this.baseEndpoint}/me/summary`,
      {},
      'profileSummary'
    );
  }

  // Get profile analytics
  async getProfileAnalytics(): Promise<ApiResponse<ProfileAnalytics>> {
    return apiService.get<ApiResponse<ProfileAnalytics>>(
      `${this.baseEndpoint}/me/analytics`,
      {},
      'profileAnalytics'
    );
  }

  // Request profile verification
  async requestVerification(
    verificationData: VerificationRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/me/verification`,
      verificationData,
      'requestVerification'
    );
  }

  // Change password
  async changePassword(passwordData: PasswordChangeRequest): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/me/password`,
      passwordData,
      'changePassword'
    );
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<ApiResponse<PublicProfile>> {
    return apiService.get<ApiResponse<PublicProfile>>(
      `${this.baseEndpoint}/${userId}`,
      {},
      `profile-${userId}`
    );
  }

  // Search profiles
  async searchProfiles(searchQuery: ProfileSearchQuery): Promise<ApiResponse<ProfileSearchResult[]>> {
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      `${this.baseEndpoint}/search`,
      searchQuery,
      'searchProfiles'
    );
  }

  // Follow user
  async followUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/${userId}/follow`,
      {},
      `follow-${userId}`
    );
  }

  // Unfollow user
  async unfollowUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/${userId}/follow`,
      `unfollow-${userId}`
    );
  }

  // Get followers
  async getFollowers(userId?: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<ProfileSearchResult[]>> {
    const endpoint = userId ? `${this.baseEndpoint}/${userId}/followers` : `${this.baseEndpoint}/me/followers`;
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      endpoint,
      { limit, offset },
      `followers-${userId || 'me'}`
    );
  }

  // Get following
  async getFollowing(userId?: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<ProfileSearchResult[]>> {
    const endpoint = userId ? `${this.baseEndpoint}/${userId}/following` : `${this.baseEndpoint}/me/following`;
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      endpoint,
      { limit, offset },
      `following-${userId || 'me'}`
    );
  }

  // Block user
  async blockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/${userId}/block`,
      {},
      `block-${userId}`
    );
  }

  // Unblock user
  async unblockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/${userId}/block`,
      `unblock-${userId}`
    );
  }

  // Get blocked users
  async getBlockedUsers(): Promise<ApiResponse<ProfileSearchResult[]>> {
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      `${this.baseEndpoint}/me/blocked`,
      {},
      'blockedUsers'
    );
  }

  // Report user
  async reportUser(userId: string, reason: string, details?: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/${userId}/report`,
      { reason, details },
      `report-${userId}`
    );
  }

  // Delete account
  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/me/delete`,
      { password },
      'deleteAccount'
    );
  }

  // Export profile data
  async exportProfileData(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.get<ApiResponse<{ downloadUrl: string }>>(
      `${this.baseEndpoint}/me/export`,
      {},
      'exportProfile'
    );
  }

  // Get nearby users
  async getNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<ProfileSearchResult[]>> {
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      `${this.baseEndpoint}/nearby`,
      { latitude, longitude, radiusKm, limit },
      'nearbyUsers'
    );
  }

  // Get mutual connections
  async getMutualConnections(userId: string): Promise<ApiResponse<ProfileSearchResult[]>> {
    return apiService.get<ApiResponse<ProfileSearchResult[]>>(
      `${this.baseEndpoint}/${userId}/mutual`,
      {},
      `mutual-${userId}`
    );
  }

  // Utility methods
  validateProfileData(profileData: UpdateProfileRequest): string[] {
    const errors: string[] = [];

    if (profileData.nickname && (profileData.nickname.length < 2 || profileData.nickname.length > 30)) {
      errors.push('Nickname must be between 2 and 30 characters');
    }

    if (profileData.bio && profileData.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    if (profileData.interests && profileData.interests.length > 20) {
      errors.push('Maximum 20 interests allowed');
    }

    if (profileData.socialLinks) {
      const urlRegex = /^https?:\/\/.+/;
      Object.entries(profileData.socialLinks).forEach(([platform, url]) => {
        if (url && !urlRegex.test(url)) {
          errors.push(`Invalid URL for ${platform}`);
        }
      });
    }

    return errors;
  }

  validatePasswordChange(passwordData: PasswordChangeRequest): string[] {
    const errors: string[] = [];

    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }

    if (!passwordData.newPassword) {
      errors.push('New password is required');
    } else if (passwordData.newPassword.length < 8) {
      errors.push('New password must be at least 8 characters');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New passwords do not match');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password');
    }

    return errors;
  }

  getProfileCompletionPercentage(profile: UserProfile): number {
    const fields = [
      'firstName',
      'lastName',
      'nickname',
      'bio',
      'avatarUrl',
      'location',
      'interests',
      'socialLinks',
    ];

    const completedFields = fields.filter(field => {
      const value = profile[field as keyof UserProfile];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }

  formatLastActiveTime(lastActiveAt: string): string {
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return lastActive.toLocaleDateString();
    }
  }

  generateUsername(firstName: string, lastName: string): string {
    const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    const random = Math.floor(Math.random() * 1000);
    return `${base}${random}`;
  }

  sanitizeProfileData(profileData: UpdateProfileRequest): UpdateProfileRequest {
    const sanitized = { ...profileData };

    // Trim string fields
    if (sanitized.firstName) {
      sanitized.firstName = sanitized.firstName.trim();
    }
    if (sanitized.lastName) {
      sanitized.lastName = sanitized.lastName.trim();
    }
    if (sanitized.nickname) {
      sanitized.nickname = sanitized.nickname.trim();
    }
    if (sanitized.bio) {
      sanitized.bio = sanitized.bio.trim();
    }

    // Clean interests array
    if (sanitized.interests) {
      sanitized.interests = sanitized.interests
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);
    }

    // Clean social links
    if (sanitized.socialLinks) {
      Object.keys(sanitized.socialLinks).forEach(key => {
        const url = sanitized.socialLinks![key as keyof typeof sanitized.socialLinks];
        if (url) {
          sanitized.socialLinks![key as keyof typeof sanitized.socialLinks] = url.trim();
        }
      });
    }

    return sanitized;
  }
}

export const profileService = new ProfileService();