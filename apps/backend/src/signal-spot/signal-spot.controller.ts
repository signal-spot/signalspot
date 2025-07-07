import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UseInterceptors,
  Logger
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { ErrorHandlingInterceptor } from '../common/interceptors/error-handling.interceptor';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { SignalSpotService } from './signal-spot.service';
import {
  CreateSpotDto,
  UpdateSpotDto,
  SpotInteractionDto,
  SpotListResponseDto,
  SpotSingleResponseDto,
  LocationQueryDto,
  UserSpotsQueryDto,
  SearchSpotsQueryDto,
  TagsQueryDto,
  TrendingQueryDto,
  LocationStatsQueryDto,
  ExtendDurationDto,
  AdminReportQueryDto,
  AdminExpiringQueryDto,
  AdminStatsResponseDto,
  SpotInteractionResponseDto
} from './dto';


@ApiTags('Signal Spots')
@Controller('signal-spots')
@UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
@UseInterceptors(ErrorHandlingInterceptor, ResponseTransformInterceptor)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ 
  transform: true, 
  whitelist: true, 
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}))
@RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
export class SignalSpotController {
  private readonly logger = new Logger(SignalSpotController.name);

  constructor(private readonly signalSpotService: SignalSpotService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit to 5 spot creations per minute
    message: 'Too many spots created, please wait before creating another one.',
  })
  @ApiOperation({ 
    summary: 'Create a new Signal Spot',
    description: 'Creates a new Signal Spot at the specified location with the provided content and settings.'
  })
  @ApiBody({ type: CreateSpotDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Signal Spot created successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - User cannot create Signal Spots' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createSpot(
    @Body() createSpotDto: CreateSpotDto,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Creating Signal Spot for user ${user.id} at location [${createSpotDto.latitude}, ${createSpotDto.longitude}]`);
      
      const spot = await this.signalSpotService.createSpot(user, createSpotDto);
      
      this.logger.log(`Signal Spot created successfully: ${spot.id}`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot created successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to create Signal Spot: ${error.message}`, error.stack);
      
      if (error.message.includes('cannot create')) {
        throw new ForbiddenException(error.message);
      }
      
      throw new BadRequestException(error.message);
    }
  }

  @Get('nearby')
  @ApiOperation({ 
    summary: 'Get nearby Signal Spots',
    description: 'Retrieves Signal Spots near the specified location with optional filtering by type, tags, and search terms.'
  })
  @ApiQuery({ type: LocationQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Nearby Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters or missing required location data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNearbySpots(
    @Query() query: LocationQueryDto,
    @GetUser() user: User
  ): Promise<SpotListResponseDto> {
    try {
      if (!query.latitude || !query.longitude) {
        throw new BadRequestException('Latitude and longitude are required for nearby search');
      }

      this.logger.log(`Getting nearby spots for user ${user.id} at [${query.latitude}, ${query.longitude}] within ${query.radiusKm || 1}km`);

      const spots = await this.signalSpotService.getSpotsNearLocation(user, {
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm: query.radiusKm,
        limit: query.limit,
        offset: query.offset,
        types: query.types ? (query.types as string).split(',') as any[] : undefined,
        tags: query.tags ? (query.tags as string).split(',') : undefined,
        search: query.search,
        visibility: query.visibility
      });

      this.logger.log(`Found ${spots.length} nearby spots`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'Nearby Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get nearby spots: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('trending')
  @ApiOperation({ 
    summary: 'Get trending Signal Spots',
    description: 'Retrieves currently trending Signal Spots based on recent engagement activity. Optionally filter by location.'
  })
  @ApiQuery({ type: TrendingQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Trending Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTrendingSpots(
    @Query() query: TrendingQueryDto
  ): Promise<SpotListResponseDto> {
    try {
      this.logger.log(`Getting trending spots with params: ${JSON.stringify(query)}`);
      
      const spots = await this.signalSpotService.getTrendingSpots({
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm: query.radiusKm,
        limit: query.limit
      });

      this.logger.log(`Found ${spots.length} trending spots`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'Trending Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get trending spots: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('popular')
  @ApiOperation({ 
    summary: 'Get popular Signal Spots',
    description: 'Retrieves the most popular Signal Spots based on engagement metrics within a specified timeframe. Optionally filter by location.'
  })
  @ApiQuery({ type: TrendingQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Popular Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPopularSpots(
    @Query() query: TrendingQueryDto
  ): Promise<SpotListResponseDto> {
    try {
      this.logger.log(`Getting popular spots with params: ${JSON.stringify(query)}`);
      
      const spots = await this.signalSpotService.getPopularSpots({
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm: query.radiusKm,
        limit: query.limit,
        timeframe: query.timeframe
      });

      this.logger.log(`Found ${spots.length} popular spots`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'Popular Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get popular spots: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search Signal Spots',
    description: 'Search for Signal Spots by content (title and message). Optionally filter by location proximity.'
  })
  @ApiQuery({ type: SearchSpotsQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: SpotListResponseDto,
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SpotListResponseDto' },
        {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query that was executed'
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid search query or parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchSpots(
    @Query() searchQuery: SearchSpotsQueryDto,
    @GetUser() user: User
  ): Promise<SpotListResponseDto & { query: string }> {
    try {
      if (!searchQuery.q || searchQuery.q.trim().length === 0) {
        throw new BadRequestException('Search query is required and cannot be empty');
      }

      this.logger.log(`Searching spots for query: "${searchQuery.q}" by user ${user.id}`);

      const spots = await this.signalSpotService.searchSpots(searchQuery.q, user, {
        latitude: searchQuery.latitude,
        longitude: searchQuery.longitude,
        radiusKm: searchQuery.radiusKm,
        limit: searchQuery.limit,
        offset: searchQuery.offset
      });

      this.logger.log(`Found ${spots.length} spots matching search query`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        query: searchQuery.q,
        message: 'Search results retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('tags/:tags')
  @ApiOperation({ 
    summary: 'Get Signal Spots by tags',
    description: 'Retrieves Signal Spots that match the specified tags. Supports both AND (matchAll=true) and OR (matchAll=false) matching.'
  })
  @ApiParam({ 
    name: 'tags', 
    description: 'Comma-separated list of tags to search for', 
    example: 'coffee,wifi,study' 
  })
  @ApiQuery({ type: TagsQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spots matching tags retrieved successfully',
    type: SpotListResponseDto,
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SpotListResponseDto' },
        {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'The tags that were searched for'
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid tags or query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSpotsByTags(
    @Param('tags') tags: string,
    @Query() query: Omit<TagsQueryDto, 'tags'>,
    @GetUser() user: User
  ): Promise<SpotListResponseDto & { tags: string[] }> {
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      if (tagArray.length === 0) {
        throw new BadRequestException('At least one valid tag is required');
      }

      this.logger.log(`Getting spots by tags [${tagArray.join(', ')}] for user ${user.id}`);

      const spots = await this.signalSpotService.getSpotsByTags(tagArray, user, {
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm: query.radiusKm,
        limit: query.limit,
        offset: query.offset,
        matchAll: query.matchAll
      });

      this.logger.log(`Found ${spots.length} spots matching tags`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        tags: tagArray,
        message: 'Signal Spots matching tags retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get spots by tags: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('my-spots')
  @ApiOperation({ 
    summary: 'Get current user\'s Signal Spots',
    description: 'Retrieves all Signal Spots created by the authenticated user. Optionally include expired spots.'
  })
  @ApiQuery({ type: UserSpotsQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User\'s Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMySpots(
    @Query() query: UserSpotsQueryDto,
    @GetUser() user: User
  ): Promise<SpotListResponseDto> {
    try {
      this.logger.log(`Getting spots for user ${user.id} with params: ${JSON.stringify(query)}`);
      
      const spots = await this.signalSpotService.getUserSpots(user.id, user, {
        limit: query.limit,
        offset: query.offset,
        includeExpired: query.includeExpired
      });

      this.logger.log(`Found ${spots.length} spots for user`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'User\'s Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get user spots: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get current user\'s Signal Spot statistics',
    description: 'Retrieves comprehensive statistics about the authenticated user\'s Signal Spot activity and engagement.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalSpots: { type: 'number', example: 25 },
            activeSpots: { type: 'number', example: 8 },
            expiredSpots: { type: 'number', example: 17 },
            totalViews: { type: 'number', example: 1542 },
            totalLikes: { type: 'number', example: 89 },
            totalEngagement: { type: 'number', example: 156 },
            averageSpotDuration: { type: 'number', example: 18.5 },
            mostPopularSpot: { type: 'object' }
          }
        },
        message: { type: 'string', example: 'User statistics retrieved successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserStatistics(@GetUser() user: User) {
    try {
      this.logger.log(`Getting statistics for user ${user.id}`);
      
      const stats = await this.signalSpotService.getUserStatistics(user);
      
      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get user statistics: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve user statistics');
    }
  }

  @Get('location-stats')
  @ApiOperation({ 
    summary: 'Get location-based Signal Spot statistics',
    description: 'Retrieves statistics about Signal Spot activity in a specific geographic area.'
  })
  @ApiQuery({ type: LocationStatsQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Location statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalSpots: { type: 'number', example: 45 },
            density: { type: 'number', example: 2.3, description: 'Spots per square kilometer' },
            radiusKm: { type: 'number', example: 1 },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number', example: 37.7749 },
                longitude: { type: 'number', example: -122.4194 }
              }
            }
          }
        },
        message: { type: 'string', example: 'Location statistics retrieved successfully' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid location coordinates or parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLocationStatistics(
    @Query() query: LocationStatsQueryDto
  ) {
    try {
      if (!query.latitude || !query.longitude) {
        throw new BadRequestException('Latitude and longitude are required for location statistics');
      }

      this.logger.log(`Getting location statistics for [${query.latitude}, ${query.longitude}] within ${query.radiusKm || 1}km`);

      const stats = await this.signalSpotService.getLocationStatistics(
        query.latitude,
        query.longitude,
        query.radiusKm
      );

      return {
        success: true,
        data: {
          ...stats,
          location: {
            latitude: query.latitude,
            longitude: query.longitude
          }
        },
        message: 'Location statistics retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get location statistics: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get Signal Spot by ID',
    description: 'Retrieves a specific Signal Spot by its unique identifier. Records a view if the user is not the creator.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot retrieved successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid spot ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSpotById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Getting spot ${id} for user ${user.id}`);
      
      const spot = await this.signalSpotService.getSpotById(id, user);
      
      if (!spot) {
        throw new NotFoundException(`Signal Spot with ID ${id} not found`);
      }

      this.logger.log(`Spot ${id} retrieved successfully`);

      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get spot ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id/similar')
  @ApiOperation({ 
    summary: 'Get similar Signal Spots',
    description: 'Finds Signal Spots similar to the specified spot based on location, type, tags, and content.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the reference Signal Spot', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiQuery({ name: 'radiusKm', required: false, description: 'Search radius in kilometers', example: 2 })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of similar spots to return', example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Similar Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid spot ID or query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access the reference Signal Spot' })
  @ApiResponse({ status: 404, description: 'Reference Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSimilarSpots(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Query('radiusKm') radiusKm?: number,
    @Query('limit') limit?: number
  ): Promise<SpotListResponseDto> {
    try {
      this.logger.log(`Getting similar spots to ${id} for user ${user.id}`);
      
      const spots = await this.signalSpotService.getSimilarSpots(id, user, {
        radiusKm,
        limit
      });

      this.logger.log(`Found ${spots.length} similar spots`);

      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'Similar Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get similar spots: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update Signal Spot',
    description: 'Updates the content and tags of a Signal Spot. Only the creator can update their own spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to update', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiBody({ type: UpdateSpotDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot updated successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid update data or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot update this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSpotDto: UpdateSpotDto,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Updating spot ${id} for user ${user.id}`);
      
      const spot = await this.signalSpotService.updateSpot(id, updateSpotDto, user);
      
      this.logger.log(`Spot ${id} updated successfully`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot updated successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to update spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Remove Signal Spot',
    description: 'Permanently removes a Signal Spot. Only the creator or admin users can remove spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to remove', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Signal Spot removed successfully' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid spot ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot remove this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ) {
    try {
      this.logger.log(`Removing spot ${id} for user ${user.id}`);
      
      await this.signalSpotService.removeSpot(id, user);
      
      this.logger.log(`Spot ${id} removed successfully`);
      
      return {
        success: true,
        message: 'Signal Spot removed successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to remove spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/interact')
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit to 20 interactions per minute
    message: 'Too many interactions, please slow down.',
  })
  @ApiOperation({ 
    summary: 'Interact with Signal Spot',
    description: 'Performs an interaction with a Signal Spot (like, dislike, reply, share, or report).'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to interact with', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiBody({ type: SpotInteractionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Interaction recorded successfully',
    type: SpotInteractionResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid interaction data or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot interact with this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async interactWithSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() interactionDto: SpotInteractionDto,
    @GetUser() user: User
  ): Promise<SpotInteractionResponseDto> {
    try {
      this.logger.log(`User ${user.id} interacting with spot ${id}: ${interactionDto.type}`);
      
      const spot = await this.signalSpotService.interactWithSpot(id, interactionDto, user);
      
      this.logger.log(`Interaction ${interactionDto.type} recorded successfully for spot ${id}`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: `Signal Spot ${interactionDto.type} recorded successfully`
      };
    } catch (error) {
      this.logger.error(`Failed to record ${interactionDto.type} for spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied') || error.message.includes('cannot interact')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/extend')
  @ApiOperation({ 
    summary: 'Extend Signal Spot duration',
    description: 'Extends the duration of an active Signal Spot. Only the creator can extend their own spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to extend', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiBody({ type: ExtendDurationDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot duration extended successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid duration value or spot cannot be extended' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot extend this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async extendSpotDuration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() extendDto: ExtendDurationDto,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Extending spot ${id} duration by ${extendDto.additionalHours} hours for user ${user.id}`);

      const spot = await this.signalSpotService.extendSpotDuration(id, extendDto.additionalHours, user);
      
      this.logger.log(`Spot ${id} duration extended successfully`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: `Signal Spot duration extended by ${extendDto.additionalHours} hours`
      };
    } catch (error) {
      this.logger.error(`Failed to extend spot ${id} duration: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/pause')
  @ApiOperation({ 
    summary: 'Pause Signal Spot',
    description: 'Temporarily pauses an active Signal Spot. Only the creator can pause their own spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to pause', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot paused successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Signal Spot cannot be paused' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot pause this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async pauseSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Pausing spot ${id} for user ${user.id}`);
      
      const spot = await this.signalSpotService.pauseSpot(id, user);
      
      this.logger.log(`Spot ${id} paused successfully`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot paused successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to pause spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/resume')
  @ApiOperation({ 
    summary: 'Resume Signal Spot',
    description: 'Resumes a paused Signal Spot, making it active again. Only the creator can resume their own spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to resume', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot resumed successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Signal Spot cannot be resumed (not paused or expired)' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot resume this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resumeSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Resuming spot ${id} for user ${user.id}`);
      
      const spot = await this.signalSpotService.resumeSpot(id, user);
      
      this.logger.log(`Spot ${id} resumed successfully`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot resumed successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to resume spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/pin')
  @ApiOperation({ 
    summary: 'Pin Signal Spot',
    description: 'Pins a Signal Spot to make it prominently visible. Only creators and admin users can pin spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to pin', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot pinned successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Signal Spot cannot be pinned' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot pin this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async pinSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Pinning spot ${id} for user ${user.id}`);
      
      const spot = await this.signalSpotService.pinSpot(id, user);
      
      this.logger.log(`Spot ${id} pinned successfully`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot pinned successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to pin spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/unpin')
  @ApiOperation({ 
    summary: 'Unpin Signal Spot',
    description: 'Removes the pin from a Signal Spot. Only creators and admin users can unpin spots.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the Signal Spot to unpin', 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Signal Spot unpinned successfully',
    type: SpotSingleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Signal Spot cannot be unpinned' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot unpin this Signal Spot' })
  @ApiResponse({ status: 404, description: 'Signal Spot not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unpinSpot(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ): Promise<SpotSingleResponseDto> {
    try {
      this.logger.log(`Unpinning spot ${id} for user ${user.id}`);
      
      const spot = await this.signalSpotService.unpinSpot(id, user);
      
      this.logger.log(`Spot ${id} unpinned successfully`);
      
      return {
        success: true,
        data: spot.getSummary(),
        message: 'Signal Spot unpinned successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to unpin spot ${id}: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // Admin endpoints
  @Get('admin/reported')
  @UseGuards(AdminGuard)
  @ApiOperation({ 
    summary: 'Get reported Signal Spots (Admin only)',
    description: 'Retrieves all Signal Spots that have been reported by users. Only verified admin users can access this endpoint.'
  })
  @ApiQuery({ type: AdminReportQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Reported Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getReportedSpots(
    @Query() query: AdminReportQueryDto,
    @GetUser() user: User
  ): Promise<SpotListResponseDto> {
    try {
      this.logger.log(`Admin ${user.id} requesting reported spots`);
      
      const spots = await this.signalSpotService.getReportedSpots(user, query.limit);
      
      this.logger.log(`Found ${spots.length} reported spots`);
      
      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'Reported Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get reported spots: ${error.message}`, error.stack);
      
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('admin/expiring')
  @UseGuards(AdminGuard)
  @ApiOperation({ 
    summary: 'Get expiring Signal Spots (Admin only)',
    description: 'Retrieves Signal Spots that are near expiration and may need administrative attention. Only verified admin users can access this endpoint.'
  })
  @ApiQuery({ type: AdminExpiringQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Expiring Signal Spots retrieved successfully',
    type: SpotListResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSpotsNeedingAttention(
    @Query() query: AdminExpiringQueryDto,
    @GetUser() user: User
  ): Promise<SpotListResponseDto> {
    try {
      this.logger.log(`Admin ${user.id} requesting expiring spots (threshold: ${query.minutesThreshold || 60} minutes)`);
      
      const spots = await this.signalSpotService.getSpotsNeedingAttention(
        user,
        query.minutesThreshold
      );
      
      this.logger.log(`Found ${spots.length} spots needing attention`);
      
      return {
        success: true,
        data: spots.map(spot => spot.getSummary()),
        count: spots.length,
        message: 'Expiring Signal Spots retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get expiring spots: ${error.message}`, error.stack);
      
      if (error.message.includes('Access denied')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('admin/statistics')
  @UseGuards(AdminGuard)
  @ApiOperation({ 
    summary: 'Get system-wide Signal Spot statistics (Admin only)',
    description: 'Retrieves comprehensive statistics about all Signal Spots in the system. Only verified admin users can access this endpoint.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'System statistics retrieved successfully',
    type: AdminStatsResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAdminStatistics(
    @GetUser() user: User
  ): Promise<{ success: boolean; data: AdminStatsResponseDto; message: string }> {
    try {
      if (!user.isVerified) {
        throw new ForbiddenException('Admin access required');
      }

      this.logger.log(`Admin ${user.id} requesting system statistics`);
      
      // This would need to be implemented in the service
      const stats = {
        totalActiveSpots: 0,
        totalExpiredSpots: 0,
        totalReportedSpots: 0,
        spotsCreatedToday: 0,
        spotsCreatedThisWeek: 0,
        spotsCreatedThisMonth: 0,
        averageSpotDuration: 0,
        averageViewsPerSpot: 0,
        averageEngagementPerSpot: 0,
        popularSpotTypes: [],
        popularTags: []
      };
      
      return {
        success: true,
        data: stats,
        message: 'System statistics retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to get admin statistics: ${error.message}`, error.stack);
      
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to retrieve system statistics');
    }
  }
}