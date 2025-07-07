import { IsNumber, IsOptional, IsString, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude coordinate', example: 37.5665 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate', example: 126.9780 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class UpdateLocationDto {
  @ApiProperty({ description: 'Current coordinates' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @ApiProperty({ description: 'Location accuracy in meters', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiProperty({ description: 'Location timestamp', required: false })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class LocationSearchDto {
  @ApiProperty({ description: 'Search center coordinates' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  center: CoordinatesDto;

  @ApiProperty({ description: 'Search radius in kilometers', example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius?: number = 5;

  @ApiProperty({ description: 'Maximum number of results', example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: 'Result offset for pagination', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ description: 'Filter by user interests', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ description: 'Include only active users', required: false })
  @IsOptional()
  activeOnly?: boolean = true;
}

export enum LocationPrivacy {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

export class LocationPrivacyDto {
  @ApiProperty({ description: 'Location sharing privacy level' })
  @IsEnum(LocationPrivacy)
  privacy: LocationPrivacy;

  @ApiProperty({ description: 'Show precise location or approximate', required: false })
  @IsOptional()
  showPreciseLocation?: boolean = false;

  @ApiProperty({ description: 'Share location history', required: false })
  @IsOptional()
  shareLocationHistory?: boolean = false;
}

export class NearbyUserDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'User nickname' })
  nickname?: string;

  @ApiProperty({ description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiProperty({ description: 'User bio' })
  bio?: string;

  @ApiProperty({ description: 'Distance from search center in kilometers' })
  distance: number;

  @ApiProperty({ description: 'Last known location' })
  location?: {
    coordinates: CoordinatesDto;
    timestamp: Date;
    accuracy?: number;
  };

  @ApiProperty({ description: 'Common interests with searcher' })
  commonInterests: string[];

  @ApiProperty({ description: 'User verification status' })
  isVerified: boolean;

  @ApiProperty({ description: 'Last active timestamp' })
  lastActiveAt?: Date;

  @ApiProperty({ description: 'Mutual connections count' })
  mutualConnections: number;
}

export class LocationHistoryDto {
  @ApiProperty({ description: 'Location ID' })
  id: string;

  @ApiProperty({ description: 'Coordinates' })
  coordinates: CoordinatesDto;

  @ApiProperty({ description: 'Timestamp when location was recorded' })
  timestamp: Date;

  @ApiProperty({ description: 'Location accuracy in meters' })
  accuracy?: number;

  @ApiProperty({ description: 'Location source' })
  source: 'gps' | 'network' | 'manual';

  @ApiProperty({ description: 'Address or place name if available' })
  address?: string;
}

export class PlaceDto {
  @ApiProperty({ description: 'Place ID' })
  id: string;

  @ApiProperty({ description: 'Place name' })
  name: string;

  @ApiProperty({ description: 'Place address' })
  address: string;

  @ApiProperty({ description: 'Place coordinates' })
  coordinates: CoordinatesDto;

  @ApiProperty({ description: 'Place type/category' })
  category: string;

  @ApiProperty({ description: 'Distance from search point' })
  distance?: number;

  @ApiProperty({ description: 'Number of users currently at this place' })
  activeUsersCount?: number;
}

export class GeofenceDto {
  @ApiProperty({ description: 'Geofence ID' })
  id: string;

  @ApiProperty({ description: 'Geofence name' })
  name: string;

  @ApiProperty({ description: 'Center coordinates' })
  center: CoordinatesDto;

  @ApiProperty({ description: 'Radius in meters' })
  radius: number;

  @ApiProperty({ description: 'Is geofence active' })
  isActive: boolean;

  @ApiProperty({ description: 'Entry action type' })
  entryAction?: 'notify' | 'auto_checkin' | 'none';

  @ApiProperty({ description: 'Exit action type' })
  exitAction?: 'notify' | 'auto_checkout' | 'none';
}

export class LocationStatsDto {
  @ApiProperty({ description: 'Total tracked locations' })
  totalLocations: number;

  @ApiProperty({ description: 'Most visited places' })
  topPlaces: Array<{
    place: PlaceDto;
    visitCount: number;
    totalTimeSpent: number; // in minutes
  }>;

  @ApiProperty({ description: 'Location tracking accuracy average' })
  averageAccuracy: number;

  @ApiProperty({ description: 'Distance traveled this month in km' })
  monthlyDistance: number;

  @ApiProperty({ description: 'Active tracking days this month' })
  activeDays: number;

  @ApiProperty({ description: 'Nearby users discovered this month' })
  nearbyUsersDiscovered: number;
}

export class AreaDto {
  @ApiProperty({ description: 'Area bounds (southwest and northeast corners)' })
  bounds: {
    southwest: CoordinatesDto;
    northeast: CoordinatesDto;
  };

  @ApiProperty({ description: 'Polygon coordinates for complex areas', required: false })
  @IsOptional()
  polygon?: CoordinatesDto[];
}

export class LocationClusterDto {
  @ApiProperty({ description: 'Cluster center coordinates' })
  center: CoordinatesDto;

  @ApiProperty({ description: 'Number of users in cluster' })
  userCount: number;

  @ApiProperty({ description: 'Cluster radius in meters' })
  radius: number;

  @ApiProperty({ description: 'Representative users in cluster' })
  users: NearbyUserDto[];
}