import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { LocationService, CreateLocationDto, UpdateLocationDto, LocationQuery, NearbyUsersQuery } from './location.service';
import { Location, LocationAccuracy, LocationSource, LocationPrivacy } from '../entities/location.entity';

// DTOs for validation
export class CreateLocationRequestDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @IsOptional()
  @IsEnum(LocationAccuracy)
  accuracyLevel?: LocationAccuracy;

  @IsOptional()
  @IsEnum(LocationSource)
  source?: LocationSource;

  @IsOptional()
  @IsEnum(LocationPrivacy)
  privacy?: LocationPrivacy;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isCurrentLocation?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateLocationRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @IsOptional()
  @IsEnum(LocationAccuracy)
  accuracyLevel?: LocationAccuracy;

  @IsOptional()
  @IsEnum(LocationSource)
  source?: LocationSource;

  @IsOptional()
  @IsEnum(LocationPrivacy)
  privacy?: LocationPrivacy;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isCurrentLocation?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class LocationQueryDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius: number;

  @IsOptional()
  @IsEnum(LocationPrivacy)
  privacy?: LocationPrivacy;

  @IsOptional()
  @IsEnum(LocationAccuracy)
  accuracyLevel?: LocationAccuracy;

  @IsOptional()
  @IsEnum(LocationSource)
  source?: LocationSource;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class NearbyUsersQueryDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(0.1)
  @Max(50)
  radius: number;

  @IsOptional()
  @IsString()
  locationPrivacy?: 'public' | 'friends' | 'private';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class DistanceCalculationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat1: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon1: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat2: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon2: number;
}

@ApiTags('Location')
@Controller('location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

  constructor(private readonly locationService: LocationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location record' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid location data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createLocation(
    @GetUser() user: User,
    @Body(ValidationPipe) createLocationDto: CreateLocationRequestDto,
  ): Promise<Location> {
    this.logger.log(`Creating location for user ${user.id}`);
    return this.locationService.createLocation(user.id, createLocationDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLocation(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) locationId: string,
    @Body(ValidationPipe) updateLocationDto: UpdateLocationRequestDto,
  ): Promise<Location> {
    this.logger.log(`Updating location ${locationId} for user ${user.id}`);
    return this.locationService.updateLocation(locationId, user.id, updateLocationDto);
  }

  @Get('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current location' })
  @ApiResponse({ status: 200, description: 'Current location retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Current location not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentLocation(@GetUser() user: User): Promise<Location | null> {
    this.logger.log(`Getting current location for user ${user.id}`);
    return this.locationService.getCurrentLocation(user.id);
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get location history' })
  @ApiResponse({ status: 200, description: 'Location history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getLocationHistory(
    @GetUser() user: User,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ): Promise<Location[]> {
    this.logger.log(`Getting location history for user ${user.id}`);
    return this.locationService.getLocationHistory(user.id, limit, offset);
  }

  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find nearby locations' })
  @ApiResponse({ status: 200, description: 'Nearby locations retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findNearbyLocations(
    @Query(ValidationPipe) query: LocationQueryDto,
  ): Promise<Location[]> {
    this.logger.log(`Finding nearby locations`);
    
    const locationQuery: LocationQuery = {
      ...query,
      createdAfter: query.createdAfter ? new Date(query.createdAfter) : undefined,
      createdBefore: query.createdBefore ? new Date(query.createdBefore) : undefined,
    };

    return this.locationService.findNearbyLocations(locationQuery);
  }

  @Get('nearby/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find nearby users' })
  @ApiResponse({ status: 200, description: 'Nearby users retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findNearbyUsers(
    @GetUser() user: User,
    @Query(ValidationPipe) query: NearbyUsersQueryDto,
  ): Promise<User[]> {
    this.logger.log(`Finding nearby users for user ${user.id}`);
    
    const nearbyUsersQuery: NearbyUsersQuery = {
      ...query,
      excludeUserId: user.id,
    };

    return this.locationService.findNearbyUsers(nearbyUsersQuery);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get location statistics' })
  @ApiResponse({ status: 200, description: 'Location statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLocationStats(@GetUser() user: User): Promise<any> {
    this.logger.log(`Getting location stats for user ${user.id}`);
    return this.locationService.getLocationStats(user.id);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get another user\'s location (if accessible)' })
  @ApiResponse({ status: 200, description: 'User location retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserLocation(
    @GetUser() user: User,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ): Promise<Location | null> {
    this.logger.log(`Getting location for user ${targetUserId} requested by user ${user.id}`);
    return this.locationService.getUserLocation(user.id, targetUserId);
  }

  @Post('calculate-distance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate distance between two coordinates' })
  @ApiResponse({ status: 200, description: 'Distance calculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async calculateDistance(
    @Body(ValidationPipe) distanceDto: DistanceCalculationDto,
  ): Promise<{ distance: number; unit: string }> {
    this.logger.log(`Calculating distance between coordinates`);
    const distance = this.locationService.calculateDistance(
      distanceDto.lat1,
      distanceDto.lon1,
      distanceDto.lat2,
      distanceDto.lon2,
    );
    return { distance, unit: 'km' };
  }

  @Post('check-radius')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if coordinates are within a radius' })
  @ApiResponse({ status: 200, description: 'Radius check completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkRadius(
    @Body(ValidationPipe) body: DistanceCalculationDto & { radius: number },
  ): Promise<{ withinRadius: boolean; distance: number; radius: number }> {
    this.logger.log(`Checking if coordinates are within radius`);
    const distance = this.locationService.calculateDistance(
      body.lat1,
      body.lon1,
      body.lat2,
      body.lon2,
    );
    const withinRadius = this.locationService.isWithinRadius(
      body.lat1,
      body.lon1,
      body.lat2,
      body.lon2,
      body.radius,
    );
    return { withinRadius, distance, radius: body.radius };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({ status: 204, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteLocation(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) locationId: string,
  ): Promise<void> {
    this.logger.log(`Deleting location ${locationId} for user ${user.id}`);
    await this.locationService.deleteLocation(locationId, user.id);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a location' })
  @ApiResponse({ status: 200, description: 'Location deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateLocation(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) locationId: string,
  ): Promise<Location> {
    this.logger.log(`Deactivating location ${locationId} for user ${user.id}`);
    return this.locationService.deactivateLocation(locationId, user.id);
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a location' })
  @ApiResponse({ status: 200, description: 'Location activated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activateLocation(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) locationId: string,
  ): Promise<Location> {
    this.logger.log(`Activating location ${locationId} for user ${user.id}`);
    const location = await this.locationService.findUserLocation(locationId, user);
    
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    
    await this.locationService.activateLocation(location);
    
    return location;
  }
}