import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsLatitude,
  IsLongitude,
  Length,
  ValidateIf
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpotInteractionType } from '../../entities/signal-spot.entity';

export class SpotInteractionDto {
  @ApiProperty({
    description: 'Type of interaction with the signal spot',
    enum: ['like', 'dislike', 'reply', 'share', 'report'],
    example: 'like'
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['like', 'dislike', 'reply', 'share', 'report'], { 
    message: 'Type must be one of: like, dislike, reply, share, report' 
  })
  type: 'like' | 'dislike' | 'reply' | 'share' | 'report';

  @ApiPropertyOptional({
    description: 'User latitude coordinate (for location-based interactions)',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'User longitude coordinate (for location-based interactions)',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Reason for the interaction (required for reports)',
    example: 'Inappropriate content',
    maxLength: 500
  })
  @IsOptional()
  @ValidateIf((o) => o.type === 'report')
  @IsString()
  @IsNotEmpty({ message: 'Reason is required for reports' })
  @Length(1, 500, { message: 'Reason must be between 1 and 500 characters' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Content for the interaction (for replies)',
    example: 'Thanks for the recommendation!',
    maxLength: 500
  })
  @IsOptional()
  @ValidateIf((o) => o.type === 'reply')
  @IsString()
  @IsNotEmpty({ message: 'Content is required for replies' })
  @Length(1, 500, { message: 'Content must be between 1 and 500 characters' })
  content?: string;
}

export class SpotInteractionResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Spot like recorded successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Updated spot data after interaction',
    type: 'object'
  })
  data: any;
}