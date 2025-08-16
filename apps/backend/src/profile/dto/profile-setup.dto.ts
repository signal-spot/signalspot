import { IsString, IsOptional, Length, Matches, IsUrl, IsDateString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileSetupDto {
  @ApiProperty({
    description: 'Username (nickname) for the user',
    example: 'john_doe',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @Length(2, 30, { message: 'Username must be between 2 and 30 characters' })
  username: string;

  @ApiPropertyOptional({
    description: 'Display name shown to other users',
    example: 'John Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Display name must be between 1 and 50 characters' })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User bio or description',
    example: 'Love to explore new places and meet new people',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Profile avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Email address (optional for phone-based signup)',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;
}

export class CheckUsernameDto {
  @ApiProperty({
    description: 'Username to check availability',
    example: 'john_doe',
  })
  @IsString()
  @Length(2, 30, { message: 'Username must be between 2 and 30 characters' })
  username: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  gender?: string;

  @ApiProperty()
  profileCompleted: boolean;

  @ApiProperty()
  isPhoneVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.displayName = user.displayName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.bio = user.bio;
    this.avatarUrl = user.avatarUrl;
    this.dateOfBirth = user.dateOfBirth;
    this.gender = user.gender;
    this.profileCompleted = user.profileCompleted;
    this.isPhoneVerified = user.isPhoneVerified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}