import { IsEnum, IsString, IsOptional, IsBoolean, IsUrl, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppPlatform } from '../entities/app-version.entity';

/**
 * DTO for checking app version
 */
export class CheckAppVersionDto {
  @ApiProperty({ enum: AppPlatform, description: 'App platform (ios or android)' })
  @IsEnum(AppPlatform)
  platform: AppPlatform;

  @ApiProperty({ 
    description: 'Current app version', 
    example: '1.0.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$'
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format X.Y.Z' })
  currentVersion: string;
}

/**
 * Response DTO for version check
 */
export class AppVersionResponseDto {
  @ApiProperty({ description: 'Whether the app needs to be updated' })
  needsUpdate: boolean;

  @ApiProperty({ description: 'Whether the update is mandatory' })
  forceUpdate: boolean;

  @ApiProperty({ description: 'Latest available version' })
  latestVersion: string;

  @ApiProperty({ description: 'Minimum required version' })
  minRequiredVersion: string;

  @ApiProperty({ description: 'URL to update the app' })
  updateUrl: string;

  @ApiPropertyOptional({ description: 'Release notes for the latest version' })
  releaseNotes?: string;

  @ApiProperty({ description: 'Platform of the app' })
  platform: AppPlatform;
}

/**
 * DTO for creating/updating app version (Admin)
 */
export class CreateAppVersionDto {
  @ApiProperty({ enum: AppPlatform, description: 'App platform' })
  @IsEnum(AppPlatform)
  platform: AppPlatform;

  @ApiProperty({ 
    description: 'Version number', 
    example: '1.0.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$'
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format X.Y.Z' })
  version: string;

  @ApiProperty({ 
    description: 'Minimum required version for force update', 
    example: '1.0.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$'
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format X.Y.Z' })
  minRequiredVersion: string;

  @ApiPropertyOptional({ description: 'Release notes' })
  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @ApiProperty({ description: 'URL to update the app' })
  @IsUrl()
  updateUrl: string;

  @ApiPropertyOptional({ description: 'Whether this version is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for updating app version (Admin)
 */
export class UpdateAppVersionDto {
  @ApiPropertyOptional({ 
    description: 'Version number', 
    example: '1.0.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format X.Y.Z' })
  version?: string;

  @ApiPropertyOptional({ 
    description: 'Minimum required version for force update', 
    example: '1.0.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format X.Y.Z' })
  minRequiredVersion?: string;

  @ApiPropertyOptional({ description: 'Release notes' })
  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @ApiPropertyOptional({ description: 'URL to update the app' })
  @IsOptional()
  @IsUrl()
  updateUrl?: string;

  @ApiPropertyOptional({ description: 'Whether this version is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}