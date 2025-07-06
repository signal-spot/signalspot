import { IsOptional, IsString, IsEmail, IsUrl, IsArray, IsDateString, IsEnum, IsBoolean, Length, Matches, ArrayMaxSize, IsObject, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '../../entities/user.entity';

export class SocialLinksDto {
  @ApiPropertyOptional({ description: 'Instagram profile URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Instagram URL must be valid' })
  @Matches(/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/, {
    message: 'Instagram URL must be a valid Instagram profile URL'
  })
  instagram?: string;

  @ApiPropertyOptional({ description: 'Twitter profile URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Twitter URL must be valid' })
  @Matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/, {
    message: 'Twitter URL must be a valid Twitter profile URL'
  })
  twitter?: string;

  @ApiPropertyOptional({ description: 'Facebook profile URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Facebook URL must be valid' })
  @Matches(/^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/, {
    message: 'Facebook URL must be a valid Facebook profile URL'
  })
  facebook?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be valid' })
  @Matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/, {
    message: 'LinkedIn URL must be a valid LinkedIn profile URL'
  })
  linkedin?: string;

  @ApiPropertyOptional({ description: 'YouTube channel URL' })
  @IsOptional()
  @IsUrl({}, { message: 'YouTube URL must be valid' })
  @Matches(/^https?:\/\/(www\.)?youtube\.com\/(channel\/|user\/|c\/)?[a-zA-Z0-9_-]+\/?$/, {
    message: 'YouTube URL must be a valid YouTube channel URL'
  })
  youtube?: string;

  @ApiPropertyOptional({ description: 'TikTok profile URL' })
  @IsOptional()
  @IsUrl({}, { message: 'TikTok URL must be valid' })
  @Matches(/^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/, {
    message: 'TikTok URL must be a valid TikTok profile URL'
  })
  tiktok?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'First name', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({ description: 'Bio/About section', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Bio must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @ApiPropertyOptional({ description: 'Profile avatar URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be valid' })
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be valid' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Gender', enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  @IsOptional()
  @IsString()
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender must be one of: male, female, other, prefer_not_to_say'
  })
  gender?: string;

  @ApiPropertyOptional({ description: 'Occupation/Job title', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Occupation must be between 1 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  occupation?: string;

  @ApiPropertyOptional({ description: 'Company name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Company name must be between 1 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  company?: string;

  @ApiPropertyOptional({ description: 'School/University', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'School name must be between 1 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  school?: string;

  @ApiPropertyOptional({ description: 'Personal website URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Website URL must be valid' })
  website?: string;

  @ApiPropertyOptional({ description: 'Location/City', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Location must be between 1 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  location?: string;

  @ApiPropertyOptional({ description: 'Social media links', type: SocialLinksDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({ description: 'List of interests', maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Maximum 20 interests allowed' })
  @IsString({ each: true })
  @Length(1, 50, { each: true, message: 'Each interest must be between 1 and 50 characters' })
  interests?: string[];

  @ApiPropertyOptional({ description: 'List of skills', maxItems: 30 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30, { message: 'Maximum 30 skills allowed' })
  @IsString({ each: true })
  @Length(1, 50, { each: true, message: 'Each skill must be between 1 and 50 characters' })
  skills?: string[];

  @ApiPropertyOptional({ description: 'List of languages', maxItems: 10 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Maximum 10 languages allowed' })
  @IsString({ each: true })
  @Length(1, 50, { each: true, message: 'Each language must be between 1 and 50 characters' })
  languages?: string[];
}

export class UpdateProfileSettingsDto {
  @ApiPropertyOptional({ description: 'Make profile publicly visible' })
  @IsOptional()
  @IsBoolean()
  isPublicProfile?: boolean;

  @ApiPropertyOptional({ description: 'Allow messages from strangers' })
  @IsOptional()
  @IsBoolean()
  allowMessagesFromStrangers?: boolean;

  @ApiPropertyOptional({ description: 'Show online status to others' })
  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @ApiPropertyOptional({ description: 'Show who viewed your profile' })
  @IsOptional()
  @IsBoolean()
  showProfileViewers?: boolean;

  @ApiPropertyOptional({ description: 'Profile visibility setting', enum: ProfileVisibility })
  @IsOptional()
  @IsEnum(ProfileVisibility, {
    message: 'Profile visibility must be one of: public, friends, private'
  })
  profileVisibility?: ProfileVisibility;
}

export class ProfileVerificationRequestDto {
  @ApiProperty({ description: 'Verification type', enum: ['identity', 'business', 'celebrity', 'organization'] })
  @IsString()
  @IsEnum(['identity', 'business', 'celebrity', 'organization'], {
    message: 'Verification type must be one of: identity, business, celebrity, organization'
  })
  type: string;

  @ApiProperty({ description: 'URL to verification document' })
  @IsUrl({}, { message: 'Document URL must be valid' })
  documentUrl: string;
}

export class ProfileVerificationActionDto {
  @ApiProperty({ description: 'Action to take', enum: ['approve', 'reject'] })
  @IsString()
  @IsEnum(['approve', 'reject'], {
    message: 'Action must be either approve or reject'
  })
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Reason for rejection (required when rejecting)' })
  @IsOptional()
  @IsString()
  @Length(10, 500, { message: 'Rejection reason must be between 10 and 500 characters' })
  reason?: string;
}