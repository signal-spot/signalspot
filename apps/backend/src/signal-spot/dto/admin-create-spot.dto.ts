import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpotVisibility, SpotType } from '../../entities/signal-spot.entity';

export class AdminCreateSpotDto {
  @ApiProperty({
    description: 'Custom sender name for the system message',
    example: '시스템 관리자',
    default: '시스템 관리자',
  })
  @IsString()
  @IsOptional()
  customSenderName?: string;

  @ApiProperty({
    description: 'Target user ID for the message (optional - if not specified, creates public spot)',
    example: 'user-uuid',
    required: false,
  })
  @IsString()
  @IsOptional()
  targetUserId?: string;

  @ApiProperty({
    description: 'Message content',
    example: '시스템 점검이 예정되어 있습니다.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Optional title for the message',
    example: '시스템 공지',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 37.5665,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 126.9780,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['공지', '시스템'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Visibility radius in meters',
    example: 1000,
    minimum: 10,
    maximum: 50000,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  radiusInMeters?: number;

  @ApiPropertyOptional({
    description: 'Duration in hours',
    example: 48,
    minimum: 1,
    maximum: 720,
    default: 48,
  })
  @IsOptional()
  @IsNumber()
  durationInHours?: number;

  @ApiPropertyOptional({
    description: 'Visibility setting',
    enum: SpotVisibility,
    default: SpotVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(SpotVisibility, { message: 'Visibility must be one of: public, friends, private' })
  visibility?: SpotVisibility;

  @ApiPropertyOptional({
    description: 'Spot type',
    enum: SpotType,
    default: SpotType.ANNOUNCEMENT,
  })
  @IsOptional()
  @IsEnum(SpotType, { message: 'Type must be one of: announcement, question, meetup, alert, social, business' })
  type?: SpotType;

  @ApiPropertyOptional({
    description: 'Pin the message to top',
    default: false,
  })
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { priority: 'high', category: 'maintenance' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}