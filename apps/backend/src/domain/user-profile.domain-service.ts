import { Injectable } from '@nestjs/common';
import { User, ProfileVisibility, ProfileVerificationStatus } from '../entities/user.entity';

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  occupation?: string;
  company?: string;
  school?: string;
  website?: string;
  location?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  interests?: string[];
  skills?: string[];
  languages?: string[];
}

export interface ProfileSettingsData {
  isPublicProfile?: boolean;
  allowMessagesFromStrangers?: boolean;
  showOnlineStatus?: boolean;
  showProfileViewers?: boolean;
  profileVisibility?: ProfileVisibility;
}

export interface ProfileVerificationData {
  type: string;
  documentUrl: string;
}

export interface ProfileAnalytics {
  totalViews: number;
  uniqueViews: number;
  viewsThisMonth: number;
  searchAppearances: number;
  profileClicks: number;
  completionPercentage: number;
  lastAnalyticsUpdate: Date;
}

/**
 * Domain service for user profile management
 * Encapsulates complex business logic related to user profiles
 */
@Injectable()
export class UserProfileDomainService {
  
  /**
   * Updates user profile with validation and business rules
   */
  public updateUserProfile(user: User, updateData: ProfileUpdateData): void {
    // Validate profile data before updating
    this.validateProfileData(updateData);
    
    // Apply business rules
    this.applyProfileUpdateRules(user, updateData);
    
    // Update the profile
    user.updateProfile(updateData);
  }

  /**
   * Updates user profile settings with validation
   */
  public updateProfileSettings(user: User, settings: ProfileSettingsData): void {
    // Validate settings data
    this.validateProfileSettings(settings);
    
    // Apply business rules for settings
    this.applyProfileSettingsRules(user, settings);
    
    // Update profile visibility if provided
    if (settings.profileVisibility !== undefined) {
      user.updateProfileVisibility(settings.profileVisibility);
    }
    
    // Update other settings
    user.updateProfileSettings({
      isPublicProfile: settings.isPublicProfile,
      allowMessagesFromStrangers: settings.allowMessagesFromStrangers,
      showOnlineStatus: settings.showOnlineStatus,
      showProfileViewers: settings.showProfileViewers,
    });
  }

  /**
   * Initiates profile verification process
   */
  public requestProfileVerification(user: User, verificationData: ProfileVerificationData): void {
    // Validate verification data
    this.validateVerificationData(verificationData);
    
    // Apply business rules for verification
    this.applyVerificationRules(user, verificationData);
    
    // Request verification
    user.requestProfileVerification(verificationData.type, verificationData.documentUrl);
  }

  /**
   * Verifies a user's profile
   */
  public verifyUserProfile(user: User, verifierId: string): void {
    // Apply business rules for verification approval
    this.applyVerificationApprovalRules(user);
    
    // Verify the profile
    user.verifyProfile(verifierId);
  }

  /**
   * Rejects a user's profile verification
   */
  public rejectProfileVerification(user: User, reason: string): void {
    // Validate rejection reason
    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters long');
    }
    
    // Reject the verification
    user.rejectProfileVerification(reason);
  }

  /**
   * Records a profile view and updates analytics
   */
  public recordProfileView(user: User, viewerId?: string): void {
    // Don't record self-views
    if (viewerId === user.id) {
      return;
    }
    
    // Increment profile views
    user.incrementProfileViews();
  }

  /**
   * Calculates and returns profile completion status
   */
  public getProfileCompletionStatus(user: User): {
    percentage: number;
    isComplete: boolean;
    missingFields: string[];
    suggestions: string[];
  } {
    const percentage = user.calculateProfileCompletionPercentage();
    const isComplete = user.isProfileComplete();
    
    const missingFields = this.getMissingProfileFields(user);
    const suggestions = this.getProfileCompletionSuggestions(user);
    
    return {
      percentage,
      isComplete,
      missingFields,
      suggestions,
    };
  }

  /**
   * Determines if a user can view another user's profile
   */
  public canViewProfile(profileOwner: User, viewer: User): boolean {
    return profileOwner.canViewProfile(viewer);
  }

  /**
   * Gets profile analytics for a user
   */
  public getProfileAnalytics(user: User): ProfileAnalytics {
    const analytics = user.profileAnalytics || {};
    
    return {
      totalViews: analytics.totalViews || 0,
      uniqueViews: analytics.uniqueViews || 0,
      viewsThisMonth: analytics.viewsThisMonth || 0,
      searchAppearances: analytics.searchAppearances || 0,
      profileClicks: analytics.profileClicks || 0,
      completionPercentage: user.profileCompletionPercentage,
      lastAnalyticsUpdate: analytics.lastAnalyticsUpdate || new Date(),
    };
  }

  /**
   * Validates profile data
   */
  private validateProfileData(data: ProfileUpdateData): void {
    // Validate website URL if provided
    if (data.website && !this.isValidUrl(data.website)) {
      throw new Error('Invalid website URL format');
    }
    
    // Validate social links
    if (data.socialLinks) {
      Object.entries(data.socialLinks).forEach(([platform, url]) => {
        if (url && !this.isValidSocialUrl(platform, url)) {
          throw new Error(`Invalid ${platform} URL format`);
        }
      });
    }
    
    // Validate date of birth
    if (data.dateOfBirth) {
      const age = this.calculateAge(data.dateOfBirth);
      if (age < 13 || age > 120) {
        throw new Error('Invalid date of birth');
      }
    }
    
    // Validate arrays
    if (data.interests && data.interests.length > 20) {
      throw new Error('Maximum 20 interests allowed');
    }
    
    if (data.skills && data.skills.length > 30) {
      throw new Error('Maximum 30 skills allowed');
    }
    
    if (data.languages && data.languages.length > 10) {
      throw new Error('Maximum 10 languages allowed');
    }
  }

  /**
   * Validates profile settings data
   */
  private validateProfileSettings(settings: ProfileSettingsData): void {
    // Validate profile visibility
    if (settings.profileVisibility && !Object.values(ProfileVisibility).includes(settings.profileVisibility)) {
      throw new Error('Invalid profile visibility setting');
    }
  }

  /**
   * Validates verification data
   */
  private validateVerificationData(data: ProfileVerificationData): void {
    const allowedTypes = ['identity', 'business', 'celebrity', 'organization'];
    
    if (!allowedTypes.includes(data.type)) {
      throw new Error('Invalid verification type');
    }
    
    if (!data.documentUrl || !this.isValidUrl(data.documentUrl)) {
      throw new Error('Valid document URL is required for verification');
    }
  }

  /**
   * Applies business rules for profile updates
   */
  private applyProfileUpdateRules(user: User, updateData: ProfileUpdateData): void {
    // Limit profile updates if user is suspended
    if (user.isSuspended) {
      throw new Error('Cannot update profile while account is suspended');
    }
  }

  /**
   * Applies business rules for profile settings
   */
  private applyProfileSettingsRules(user: User, settings: ProfileSettingsData): void {
    // Require profile completion for public profiles
    if (settings.isPublicProfile && !user.isProfileComplete()) {
      throw new Error('Profile must be complete to make it public');
    }
    
    // Require verification for certain visibility settings
    if (settings.profileVisibility === ProfileVisibility.PUBLIC && 
        user.verificationStatus !== ProfileVerificationStatus.VERIFIED) {
      // Allow but warn - don't throw error
    }
  }

  /**
   * Applies business rules for verification requests
   */
  private applyVerificationRules(user: User, verificationData: ProfileVerificationData): void {
    // Check if user can request verification

    if (!user.isProfileComplete()) {
      throw new Error('Profile must be complete before requesting verification');
    }
    
    // Check account age
    if (user.accountAge < 30) {
      throw new Error('Account must be at least 30 days old to request verification');
    }
  }

  /**
   * Applies business rules for verification approval
   */
  private applyVerificationApprovalRules(user: User): void {
    if (user.verificationStatus !== ProfileVerificationStatus.PENDING) {
      throw new Error('Profile verification is not pending');
    }
  }

  /**
   * Gets missing profile fields
   */
  private getMissingProfileFields(user: User): string[] {
    const fields = [
      { key: 'firstName', value: user.firstName },
      { key: 'lastName', value: user.lastName },
      { key: 'bio', value: user.bio },
      { key: 'avatarUrl', value: user.avatarUrl },
      { key: 'phoneNumber', value: user.phoneNumber },
      { key: 'dateOfBirth', value: user.dateOfBirth },
      { key: 'occupation', value: user.occupation },
      { key: 'location', value: user.location },
    ];
    
    return fields
      .filter(field => !field.value || field.value === '')
      .map(field => field.key);
  }

  /**
   * Gets profile completion suggestions
   */
  private getProfileCompletionSuggestions(user: User): string[] {
    const suggestions = [];
    
    if (!user.avatarUrl) {
      suggestions.push('Add a profile picture to increase visibility');
    }
    
    if (!user.bio) {
      suggestions.push('Write a bio to tell others about yourself');
    }
    
    if (!user.interests || user.interests.length === 0) {
      suggestions.push('Add your interests to connect with like-minded people');
    }
    
    if (!user.location) {
      suggestions.push('Add your location to find nearby connections');
    }
    
    if (!user.occupation) {
      suggestions.push('Add your occupation to show your professional background');
    }
    
    return suggestions;
  }

  /**
   * Validates URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates social media URLs
   */
  private isValidSocialUrl(platform: string, url: string): boolean {
    if (!this.isValidUrl(url)) {
      return false;
    }
    
    const socialDomains = {
      instagram: ['instagram.com', 'www.instagram.com'],
      twitter: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
      facebook: ['facebook.com', 'www.facebook.com'],
      linkedin: ['linkedin.com', 'www.linkedin.com'],
      youtube: ['youtube.com', 'www.youtube.com'],
      tiktok: ['tiktok.com', 'www.tiktok.com'],
    };
    
    const validDomains = socialDomains[platform];
    if (!validDomains) {
      return false;
    }
    
    const urlObj = new URL(url);
    return validDomains.includes(urlObj.hostname);
  }

  /**
   * Calculates age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}