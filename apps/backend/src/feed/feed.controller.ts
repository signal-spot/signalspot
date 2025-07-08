import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FeedService } from './feed.service';
import { FeedQueryDto, FeedResponse, TodaysConnectionResponse, TodaysConnectionQueryDto } from './dto/feed.dto';
import { User } from '../entities/user.entity';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  private readonly logger = new Logger(FeedController.name);

  constructor(private readonly feedService: FeedService) {}

  /**
   * Get personalized feed for the authenticated user
   * GET /feed
   */
  @Get()
  async getFeed(
    @GetUser() user: User,
    @Query() query: FeedQueryDto,
  ): Promise<FeedResponse> {
    this.logger.log(`Feed request from user ${user.id} with query: ${JSON.stringify(query)}`);
    
    return this.feedService.getFeed(user.id, query);
  }

  /**
   * Get trending content (public)
   * GET /feed/trending
   */
  @Get('trending')
  async getTrendingContent(
    @Query() query: FeedQueryDto,
  ): Promise<FeedResponse> {
    this.logger.log(`Trending content request with query: ${JSON.stringify(query)}`);
    
    return this.feedService.getTrendingContent(query);
  }

  /**
   * Get feed for a specific location
   * GET /feed/location?latitude=X&longitude=Y
   */
  @Get('location')
  async getLocationFeed(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query() query: Omit<FeedQueryDto, 'latitude' | 'longitude'>,
  ): Promise<FeedResponse> {
    this.logger.log(`Location feed request for ${latitude}, ${longitude}`);
    
    return this.feedService.getLocationFeed(latitude, longitude, query);
  }

  /**
   * Get trending tags
   * GET /feed/trending-tags?limit=10
   */
  @Get('trending-tags')
  async getTrendingTags(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<Array<{ tag: string; count: number }>> {
    this.logger.log(`Trending tags request with limit: ${limit}`);
    
    return this.feedService.getTrendingTags(limit);
  }

  /**
   * Get recommended users based on similar interests
   * GET /feed/recommended-users?limit=10
   */
  @Get('recommended-users')
  async getRecommendedUsers(
    @GetUser() user: User,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<Array<{
    userId: string;
    username: string;
    avatar?: string;
    similarityScore: number;
    commonInterests: string[];
  }>> {
    this.logger.log(`Recommended users request from user ${user.id} with limit: ${limit}`);
    
    return this.feedService.getRecommendedUsers(user.id, limit);
  }

  /**
   * Refresh feed cache for the authenticated user
   * POST /feed/refresh
   */
  @Get('refresh')
  async refreshFeedCache(@GetUser() user: User): Promise<{ success: boolean }> {
    this.logger.log(`Feed cache refresh request from user ${user.id}`);
    
    await this.feedService.refreshUserFeedCache(user.id);
    
    return { success: true };
  }

  /**
   * Get Today's Connection - special daily digest
   * GET /feed/todays-connection
   */
  @Get('todays-connection')
  async getTodaysConnection(
    @GetUser() user: User,
    @Query() query: TodaysConnectionQueryDto,
  ): Promise<TodaysConnectionResponse> {
    this.logger.log(`Today's Connection request from user ${user.id} with query: ${JSON.stringify(query)}`);
    
    return this.feedService.getTodaysConnection(user.id, query);
  }

  /**
   * Get feed performance metrics (admin only)
   * GET /feed/metrics?timeframe=day
   */
  @Get('metrics')
  async getFeedMetrics(
    @Query('timeframe') timeframe: 'hour' | 'day' | 'week' = 'day',
  ): Promise<{
    totalRequests: number;
    avgResponseTime: number;
    cacheHitRate: number;
    topContentTypes: Array<{ type: string; count: number }>;
    topSortMethods: Array<{ method: string; count: number }>;
  }> {
    this.logger.log(`Feed metrics request for timeframe: ${timeframe}`);
    
    return this.feedService.getFeedMetrics(timeframe);
  }
}