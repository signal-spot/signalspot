import { 
  IsOptional, 
  IsNumber, 
  IsString, 
  IsEnum,
  Min, 
  Max,
  Length
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtendDurationDto {
  @ApiProperty({
    description: 'Additional hours to extend the spot duration',
    example: 12,
    minimum: 1,
    maximum: 48
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Additional hours must be at least 1' })
  @Max(48, { message: 'Additional hours cannot exceed 48' })
  additionalHours: number;
}

export class AdminReportQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of reported spots to return',
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum report count',
    example: 3,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Minimum report count must be at least 1' })
  minReportCount?: number;

  @ApiPropertyOptional({
    description: 'Filter by report reason',
    example: 'spam',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Report reason must be between 1 and 100 characters' })
  reason?: string;
}

export class AdminExpiringQueryDto {
  @ApiPropertyOptional({
    description: 'Minutes threshold for spots needing attention',
    example: 60,
    minimum: 1,
    maximum: 1440,
    default: 60
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Minutes threshold must be at least 1' })
  @Max(1440, { message: 'Minutes threshold cannot exceed 1440 (24 hours)' })
  minutesThreshold?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of expiring spots to return',
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;
}

export class AdminActionDto {
  @ApiProperty({
    description: 'Administrative action to perform',
    example: 'remove',
    enum: ['remove', 'pin', 'unpin', 'approve', 'reject']
  })
  @IsString()
  @IsEnum(['remove', 'pin', 'unpin', 'approve', 'reject'], {
    message: 'Action must be one of: remove, pin, unpin, approve, reject'
  })
  action: 'remove' | 'pin' | 'unpin' | 'approve' | 'reject';

  @ApiPropertyOptional({
    description: 'Reason for the administrative action',
    example: 'Violates community guidelines',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: 'Reason must be between 1 and 500 characters' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the action',
    example: 'User was notified via email',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(1, 1000, { message: 'Notes must be between 1 and 1000 characters' })
  notes?: string;
}

export class AdminStatsResponseDto {
  @ApiProperty({
    description: 'Total number of active spots',
    example: 1250
  })
  totalActiveSpots: number;

  @ApiProperty({
    description: 'Total number of expired spots',
    example: 8743
  })
  totalExpiredSpots: number;

  @ApiProperty({
    description: 'Total number of reported spots',
    example: 23
  })
  totalReportedSpots: number;

  @ApiProperty({
    description: 'Total number of spots created today',
    example: 89
  })
  spotsCreatedToday: number;

  @ApiProperty({
    description: 'Total number of spots created this week',
    example: 456
  })
  spotsCreatedThisWeek: number;

  @ApiProperty({
    description: 'Total number of spots created this month',
    example: 1823
  })
  spotsCreatedThisMonth: number;

  @ApiProperty({
    description: 'Average spot duration in hours',
    example: 18.5
  })
  averageSpotDuration: number;

  @ApiProperty({
    description: 'Average views per spot',
    example: 24.7
  })
  averageViewsPerSpot: number;

  @ApiProperty({
    description: 'Average engagement per spot',
    example: 5.2
  })
  averageEngagementPerSpot: number;

  @ApiProperty({
    description: 'Most popular spot types',
    example: [
      { type: 'announcement', count: 450 },
      { type: 'social', count: 380 },
      { type: 'question', count: 220 }
    ]
  })
  popularSpotTypes: Array<{ type: string; count: number }>;

  @ApiProperty({
    description: 'Most popular tags',
    example: [
      { tag: 'coffee', count: 123 },
      { tag: 'wifi', count: 89 },
      { tag: 'study', count: 67 }
    ]
  })
  popularTags: Array<{ tag: string; count: number }>;
}

export class AdminActionResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Action performed',
    example: 'remove'
  })
  action: string;

  @ApiProperty({
    description: 'Spot ID that was acted upon',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  spotId: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Spot removed successfully'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional details about the action',
    example: 'User was notified via email'
  })
  details?: string;
}