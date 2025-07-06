import { 
  IsOptional, 
  IsNumber, 
  IsString, 
  IsEnum, 
  IsArray,
  IsBoolean,
  Min, 
  Max,
  IsLatitude,
  IsLongitude,
  Transform
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SpotVisibility, SpotType } from '../../entities/signal-spot.entity';

export class LocationQueryDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate for location-based search',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for location-based search',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 1.5,
    minimum: 0.1,
    maximum: 50,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'Radius must be at least 0.1 km' })
  @Max(50, { message: 'Radius cannot exceed 50 km' })
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip (for pagination)',
    example: 0,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Filter by spot types (comma-separated)',
    example: 'announcement,question',
    enum: SpotType,
    isArray: true
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? value.split(',').map((type: string) => type.trim()) : undefined)
  types?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'coffee,wifi',
    type: String
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? value.split(',').map((tag: string) => tag.trim()) : undefined)
  tags?: string;

  @ApiPropertyOptional({
    description: 'Search term to filter spots by content',
    example: 'coffee shop',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by visibility level',
    enum: SpotVisibility,
    example: SpotVisibility.PUBLIC
  })
  @IsOptional()
  @IsEnum(SpotVisibility)
  visibility?: SpotVisibility;
}

export class UserSpotsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip (for pagination)',
    example: 0,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Include expired spots in results',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeExpired?: boolean;
}

export class SearchSpotsQueryDto {
  @ApiPropertyOptional({
    description: 'Search query string',
    example: 'coffee shop',
    maxLength: 100
  })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate for location-based search',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for location-based search',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 5,
    minimum: 0.1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'Radius must be at least 0.1 km' })
  @Max(50, { message: 'Radius cannot exceed 50 km' })
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip (for pagination)',
    example: 0,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;
}

export class TagsQueryDto {
  @ApiPropertyOptional({
    description: 'Tags to search for (comma-separated)',
    example: 'coffee,wifi',
    type: String
  })
  @IsString()
  tags: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate for location-based search',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for location-based search',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 5,
    minimum: 0.1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'Radius must be at least 0.1 km' })
  @Max(50, { message: 'Radius cannot exceed 50 km' })
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip (for pagination)',
    example: 0,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Whether to match all tags (true) or any tag (false)',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  matchAll?: boolean;
}

export class TrendingQueryDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate for location-based search',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for location-based search',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 5,
    minimum: 0.1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'Radius must be at least 0.1 km' })
  @Max(50, { message: 'Radius cannot exceed 50 km' })
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Time frame for trending calculation',
    example: 'day',
    enum: ['hour', 'day', 'week', 'month']
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month'])
  timeframe?: 'hour' | 'day' | 'week' | 'month';
}

export class LocationStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate for location statistics',
    example: 37.7749,
    minimum: -90,
    maximum: 90
  })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for location statistics',
    example: -122.4194,
    minimum: -180,
    maximum: 180
  })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Radius in kilometers for statistics calculation',
    example: 1,
    minimum: 0.1,
    maximum: 50,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'Radius must be at least 0.1 km' })
  @Max(50, { message: 'Radius cannot exceed 50 km' })
  radiusKm?: number;
}