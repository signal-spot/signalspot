import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  ArrayMaxSize,
  IsObject,
  Min, 
  Max, 
  Length,
  IsLatitude,
  IsLongitude
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpotVisibility, SpotType } from '../../entities/signal-spot.entity';

export class CreateSpotDto {
  @ApiProperty({
    description: 'The main message content of the signal spot',
    example: 'Great coffee shop with free WiFi!',
    minLength: 1,
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500, { message: 'Message must be between 1 and 500 characters' })
  message: string;

  @ApiPropertyOptional({
    description: 'Optional title for the signal spot',
    example: 'Coffee Shop Recommendation',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title?: string;

  @ApiProperty({
    description: 'Latitude coordinate of the signal spot',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the signal spot',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Radius in meters for the signal spot coverage',
    example: 100,
    minimum: 1,
    maximum: 1000,
    default: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Radius must be at least 1 meter' })
  @Max(1000, { message: 'Radius cannot exceed 1000 meters' })
  radiusInMeters?: number;

  @ApiPropertyOptional({
    description: 'Duration in hours for how long the signal spot should remain active',
    example: 24,
    minimum: 1,
    maximum: 168,
    default: 24
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Duration must be at least 1 hour' })
  @Max(168, { message: 'Duration cannot exceed 168 hours (1 week)' })
  durationInHours?: number;

  @ApiPropertyOptional({
    description: 'Visibility level of the signal spot',
    enum: SpotVisibility,
    enumName: 'SpotVisibility',
    example: SpotVisibility.PUBLIC,
    default: SpotVisibility.PUBLIC
  })
  @IsOptional()
  @IsEnum(SpotVisibility, { message: 'Visibility must be one of: public, friends, private' })
  visibility?: SpotVisibility;

  @ApiPropertyOptional({
    description: 'Type/category of the signal spot',
    enum: SpotType,
    enumName: 'SpotType',
    example: SpotType.ANNOUNCEMENT,
    default: SpotType.ANNOUNCEMENT
  })
  @IsOptional()
  @IsEnum(SpotType, { message: 'Type must be one of: announcement, question, meetup, alert, social, business' })
  type?: SpotType;

  @ApiPropertyOptional({
    description: 'Array of tags to categorize the signal spot',
    example: ['coffee', 'wifi', 'study'],
    maxItems: 10,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true })
  @Length(1, 30, { each: true, message: 'Each tag must be between 1 and 30 characters' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the signal spot',
    example: { category: 'food', rating: 5 },
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}