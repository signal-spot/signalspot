import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'User email address' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ 
    example: 'johndoe',
    description: 'Username (3-30 characters, letters, numbers, underscore, hyphen only)' 
  })
  @IsString({ message: 'Username must be a string' })
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(30, { message: 'Username must be less than 30 characters' })
  username: string;

  @ApiProperty({ 
    example: 'SecurePassword123!',
    description: 'Password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)' 
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'User email address' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'User password' 
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(1, { message: 'Password is required' })
  password: string;

  @ApiProperty({ 
    example: 'fcm_token_string',
    description: 'FCM or APNs token for push notifications',
    required: false
  })
  @IsString({ message: 'Device token must be a string' })
  @IsOptional()
  deviceToken?: string;

  @ApiProperty({ 
    example: 'fcm',
    description: 'Platform type (fcm for Android, apns for iOS)',
    required: false,
    enum: ['fcm', 'apns']
  })
  @IsString({ message: 'Platform must be a string' })
  @IsOptional()
  platform?: 'fcm' | 'apns';
}

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token' 
  })
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
}

export class EmailVerificationDto {
  @ApiProperty({ 
    example: 'verification-token-string',
    description: 'Email verification token' 
  })
  @IsString({ message: 'Token must be a string' })
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'User email address' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}