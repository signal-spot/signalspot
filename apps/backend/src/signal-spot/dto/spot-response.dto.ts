import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpotVisibility, SpotType, SpotStatus } from '../../entities/signal-spot.entity';

export class SpotLocationDto {
  @ApiProperty({
    description: 'Latitude coordinate of the signal spot',
    example: 37.7749
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the signal spot',
    example: -122.4194
  })
  longitude: number;

  @ApiProperty({
    description: 'Radius in meters for the signal spot coverage',
    example: 100
  })
  radius: number;
}

export class SpotEngagementDto {
  @ApiProperty({
    description: 'Number of views for the signal spot',
    example: 45
  })
  viewCount: number;

  @ApiProperty({
    description: 'Number of likes for the signal spot',
    example: 12
  })
  likeCount: number;

  @ApiProperty({
    description: 'Number of dislikes for the signal spot',
    example: 2
  })
  dislikeCount: number;

  @ApiProperty({
    description: 'Number of replies for the signal spot',
    example: 8
  })
  replyCount: number;

  @ApiProperty({
    description: 'Number of shares for the signal spot',
    example: 5
  })
  shareCount: number;

  @ApiProperty({
    description: 'Calculated engagement score for the signal spot',
    example: 67
  })
  engagementScore: number;

  @ApiProperty({
    description: 'Calculated popularity score for the signal spot',
    example: 89
  })
  popularityScore: number;
}

export class SpotTimingDto {
  @ApiProperty({
    description: 'When the signal spot was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the signal spot will expire',
    example: '2024-01-16T10:30:00.000Z'
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Human-readable remaining time until expiration',
    example: '12h 30m'
  })
  remainingTime: string;

  @ApiProperty({
    description: 'Whether the signal spot has expired',
    example: false
  })
  isExpired: boolean;
}

export class SpotResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the signal spot',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who created the signal spot',
    example: '987fcdeb-51a2-43d1-b234-765432198765'
  })
  creatorId: string;

  @ApiProperty({
    description: 'Main message content of the signal spot',
    example: 'Great coffee shop with free WiFi!'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Title of the signal spot',
    example: 'Coffee Shop Recommendation'
  })
  title?: string;

  @ApiProperty({
    description: 'Location information for the signal spot',
    type: SpotLocationDto
  })
  location: SpotLocationDto;

  @ApiProperty({
    description: 'Current status of the signal spot',
    enum: SpotStatus,
    example: SpotStatus.ACTIVE
  })
  status: SpotStatus;

  @ApiProperty({
    description: 'Visibility level of the signal spot',
    enum: SpotVisibility,
    example: SpotVisibility.PUBLIC
  })
  visibility: SpotVisibility;

  @ApiProperty({
    description: 'Type/category of the signal spot',
    enum: SpotType,
    example: SpotType.ANNOUNCEMENT
  })
  type: SpotType;

  @ApiPropertyOptional({
    description: 'Array of tags for the signal spot',
    example: ['coffee', 'wifi', 'study'],
    type: [String]
  })
  tags?: string[];

  @ApiProperty({
    description: 'Engagement metrics for the signal spot',
    type: SpotEngagementDto
  })
  engagement: SpotEngagementDto;

  @ApiProperty({
    description: 'Timing information for the signal spot',
    type: SpotTimingDto
  })
  timing: SpotTimingDto;

  @ApiProperty({
    description: 'Whether the signal spot is pinned',
    example: false
  })
  isPinned: boolean;
}

export class SpotListResponseDto {
  @ApiProperty({
    description: 'Array of signal spots',
    type: [SpotResponseDto]
  })
  data: SpotResponseDto[];

  @ApiProperty({
    description: 'Number of spots returned',
    example: 10
  })
  count: number;

  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Spots retrieved successfully'
  })
  message: string;
}

export class SpotSingleResponseDto {
  @ApiProperty({
    description: 'Single signal spot',
    type: SpotResponseDto
  })
  data: SpotResponseDto;

  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Spot retrieved successfully'
  })
  message: string;
}