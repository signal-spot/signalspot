import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsUrl, IsArray, IsEnum, IsDateString, MaxLength, MinLength } from 'class-validator';
import { ProfileVisibility } from '../../entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({ description: 'First name', required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ description: 'Profile bio', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Date of birth', required: false, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Gender', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Occupation', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiProperty({ description: 'Company', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @ApiProperty({ description: 'School', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  school?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Location', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ description: 'Profile visibility', required: false, enum: ProfileVisibility })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @ApiProperty({ description: 'Social media links', required: false })
  @IsOptional()
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  @ApiProperty({ description: 'User interests', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ description: 'User skills', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Languages spoken', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

export class UpdateProfileSettingsDto {
  @ApiProperty({ description: 'Make profile public', required: false })
  @IsOptional()
  isPublicProfile?: boolean;

  @ApiProperty({ description: 'Allow messages from strangers', required: false })
  @IsOptional()
  allowMessagesFromStrangers?: boolean;

  @ApiProperty({ description: 'Show online status', required: false })
  @IsOptional()
  showOnlineStatus?: boolean;

  @ApiProperty({ description: 'Show profile viewers', required: false })
  @IsOptional()
  showProfileViewers?: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'First name', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Profile bio', required: false })
  bio?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatarUrl?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Date of birth', required: false })
  dateOfBirth?: Date;

  @ApiProperty({ description: 'Gender', required: false })
  gender?: string;

  @ApiProperty({ description: 'Occupation', required: false })
  occupation?: string;

  @ApiProperty({ description: 'Company', required: false })
  company?: string;

  @ApiProperty({ description: 'School', required: false })
  school?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  website?: string;

  @ApiProperty({ description: 'Location', required: false })
  location?: string;

  @ApiProperty({ description: 'Profile visibility', enum: ProfileVisibility })
  profileVisibility: ProfileVisibility;

  @ApiProperty({ description: 'Social media links', required: false })
  socialLinks?: object;

  @ApiProperty({ description: 'User interests', required: false, type: [String] })
  interests?: string[];

  @ApiProperty({ description: 'User skills', required: false, type: [String] })
  skills?: string[];

  @ApiProperty({ description: 'Languages spoken', required: false, type: [String] })
  languages?: string[];

  @ApiProperty({ description: 'Profile completion percentage' })
  profileCompletionPercentage: number;

  @ApiProperty({ description: 'Profile views count' })
  profileViews: number;

  @ApiProperty({ description: 'Email verification status' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Profile verification status' })
  verificationStatus: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last profile update date', required: false })
  lastProfileUpdateAt?: Date;
}