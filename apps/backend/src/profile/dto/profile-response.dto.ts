import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ProfileVisibility, ProfileVerificationStatus } from '../../entities/user.entity';

export class SocialLinksResponseDto {
  @ApiPropertyOptional()
  @Expose()
  instagram?: string;

  @ApiPropertyOptional()
  @Expose()
  twitter?: string;

  @ApiPropertyOptional()
  @Expose()
  facebook?: string;

  @ApiPropertyOptional()
  @Expose()
  linkedin?: string;

  @ApiPropertyOptional()
  @Expose()
  youtube?: string;

  @ApiPropertyOptional()
  @Expose()
  tiktok?: string;
}

export class ProfileAnalyticsResponseDto {
  @ApiProperty({ description: 'Total profile views' })
  @Expose()
  totalViews: number;

  @ApiProperty({ description: 'Unique profile views' })
  @Expose()
  uniqueViews: number;

  @ApiProperty({ description: 'Views this month' })
  @Expose()
  viewsThisMonth: number;

  @ApiProperty({ description: 'Search appearances' })
  @Expose()
  searchAppearances: number;

  @ApiProperty({ description: 'Profile clicks' })
  @Expose()
  profileClicks: number;

  @ApiProperty({ description: 'Profile completion percentage' })
  @Expose()
  completionPercentage: number;

  @ApiProperty({ description: 'Last analytics update' })
  @Expose()
  lastAnalyticsUpdate: Date;
}

export class ProfileCompletionResponseDto {
  @ApiProperty({ description: 'Profile completion percentage' })
  @Expose()
  percentage: number;

  @ApiProperty({ description: 'Whether profile is considered complete' })
  @Expose()
  isComplete: boolean;

  @ApiProperty({ description: 'List of missing required fields' })
  @Expose()
  missingFields: string[];

  @ApiProperty({ description: 'Suggestions for profile improvement' })
  @Expose()
  suggestions: string[];
}

export class ProfileVerificationResponseDto {
  @ApiProperty({ description: 'Verification status', enum: ProfileVerificationStatus })
  @Expose()
  status: ProfileVerificationStatus;

  @ApiPropertyOptional({ description: 'Verification type' })
  @Expose()
  type?: string;

  @ApiPropertyOptional({ description: 'Verification date' })
  @Expose()
  verifiedAt?: Date;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  @Expose()
  rejectionReason?: string;
}

export class ProfileSummaryResponseDto {
  @ApiProperty({ description: 'Profile completion percentage' })
  @Expose()
  completionPercentage: number;

  @ApiProperty({ description: 'Whether profile is verified' })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ description: 'Total profile views' })
  @Expose()
  totalViews: number;

  @ApiProperty({ description: 'Whether profile is complete' })
  @Expose()
  isComplete: boolean;

  @ApiPropertyOptional({ description: 'Last profile update date' })
  @Expose()
  lastUpdated?: Date;
}

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Username' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'Email address' })
  @Expose()
  email: string;

  @ApiPropertyOptional({ description: 'First name' })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @Expose()
  lastName?: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.firstName && !obj.lastName) {
      return obj.username;
    }
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ');
  })
  fullName: string;

  @ApiPropertyOptional({ description: 'Profile bio' })
  @Expose()
  bio?: string;

  @ApiPropertyOptional({ description: 'Profile avatar URL' })
  @Expose()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @Expose()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @Expose()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Age calculated from date of birth' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(obj.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  })
  age?: number;

  @ApiPropertyOptional({ description: 'Gender' })
  @Expose()
  gender?: string;

  @ApiPropertyOptional({ description: 'Occupation' })
  @Expose()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Company' })
  @Expose()
  company?: string;

  @ApiPropertyOptional({ description: 'School' })
  @Expose()
  school?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @Expose()
  website?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @Expose()
  location?: string;

  @ApiProperty({ description: 'Profile visibility setting', enum: ProfileVisibility })
  @Expose()
  profileVisibility: ProfileVisibility;

  @ApiProperty({ description: 'Verification status', enum: ProfileVerificationStatus })
  @Expose()
  verificationStatus: ProfileVerificationStatus;

  @ApiPropertyOptional({ description: 'Social media links', type: SocialLinksResponseDto })
  @Expose()
  @Type(() => SocialLinksResponseDto)
  socialLinks?: SocialLinksResponseDto;

  @ApiPropertyOptional({ description: 'List of interests' })
  @Expose()
  interests?: string[];

  @ApiPropertyOptional({ description: 'List of skills' })
  @Expose()
  skills?: string[];

  @ApiPropertyOptional({ description: 'List of languages' })
  @Expose()
  languages?: string[];

  @ApiProperty({ description: 'Whether profile is public' })
  @Expose()
  isPublicProfile: boolean;

  @ApiProperty({ description: 'Whether user allows messages from strangers' })
  @Expose()
  allowMessagesFromStrangers: boolean;

  @ApiProperty({ description: 'Whether to show online status' })
  @Expose()
  showOnlineStatus: boolean;

  @ApiProperty({ description: 'Whether to show profile viewers' })
  @Expose()
  showProfileViewers: boolean;

  @ApiProperty({ description: 'Profile views count' })
  @Expose()
  profileViews: number;

  @ApiProperty({ description: 'Profile completion percentage' })
  @Expose()
  profileCompletionPercentage: number;

  @ApiProperty({ description: 'Whether profile is verified' })
  @Expose()
  @Transform(({ obj }) => obj.verificationStatus === ProfileVerificationStatus.VERIFIED)
  isVerified: boolean;

  @ApiProperty({ description: 'Whether profile is complete' })
  @Expose()
  @Transform(({ obj }) => obj.profileCompletionPercentage >= 80)
  isComplete: boolean;

  @ApiPropertyOptional({ description: 'Last profile update date' })
  @Expose()
  lastProfileUpdateAt?: Date;

  @ApiProperty({ description: 'Account creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last account update date' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Last login date' })
  @Expose()
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account age in days' })
  @Expose()
  @Transform(({ obj }) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - obj.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })
  accountAge: number;
}

export class PublicProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Username' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.firstName && !obj.lastName) {
      return obj.username;
    }
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ');
  })
  fullName: string;

  @ApiPropertyOptional({ description: 'Profile bio' })
  @Expose()
  bio?: string;

  @ApiPropertyOptional({ description: 'Profile avatar URL' })
  @Expose()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Occupation' })
  @Expose()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Company' })
  @Expose()
  company?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @Expose()
  location?: string;

  @ApiProperty({ description: 'Whether profile is verified' })
  @Expose()
  @Transform(({ obj }) => obj.verificationStatus === ProfileVerificationStatus.VERIFIED)
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Social media links', type: SocialLinksResponseDto })
  @Expose()
  @Type(() => SocialLinksResponseDto)
  socialLinks?: SocialLinksResponseDto;

  @ApiPropertyOptional({ description: 'List of interests' })
  @Expose()
  interests?: string[];

  @ApiPropertyOptional({ description: 'List of skills' })
  @Expose()
  skills?: string[];

  @ApiProperty({ description: 'Profile views count' })
  @Expose()
  profileViews: number;

  @ApiProperty({ description: 'Account creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Account age in days' })
  @Expose()
  @Transform(({ obj }) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - obj.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })
  accountAge: number;
}

export class ProfileSearchResponseDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Username' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.firstName && !obj.lastName) {
      return obj.username;
    }
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ');
  })
  fullName: string;

  @ApiPropertyOptional({ description: 'Profile avatar URL' })
  @Expose()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Occupation' })
  @Expose()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @Expose()
  location?: string;

  @ApiProperty({ description: 'Whether profile is verified' })
  @Expose()
  @Transform(({ obj }) => obj.verificationStatus === ProfileVerificationStatus.VERIFIED)
  isVerified: boolean;

  @ApiProperty({ description: 'Profile completion percentage' })
  @Expose()
  profileCompletionPercentage: number;
}

export class FileUploadResponseDto {
  @ApiProperty({ description: 'File URL' })
  @Expose()
  url: string;

  @ApiProperty({ description: 'File name' })
  @Expose()
  fileName: string;

  @ApiProperty({ description: 'Original file name' })
  @Expose()
  originalName: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Expose()
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  @Expose()
  mimeType: string;
}