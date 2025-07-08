import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SacredSiteService } from './sacred-site.service';
import { RankingService } from './services/ranking.service';
import {
  CreateSacredSiteDto,
  SacredSiteQueryDto,
  RecordVisitDto,
  RecordActivityDto,
  LeaderboardQueryDto,
  SiteStatisticsQueryDto,
  DiscoveryTriggerDto,
  UpdateRankingDto,
  SacredSiteResponse,
  SiteListResponse,
  LeaderboardResponse,
  SiteStatisticsResponse,
  DiscoveryResultResponse,
} from './dto/sacred-site.dto';
import { User } from '../entities/user.entity';
import { SacredSite } from './entities/sacred-site.entity';

@Controller('sacred-sites')
export class SacredSiteController {
  private readonly logger = new Logger(SacredSiteController.name);

  constructor(
    private readonly sacredSiteService: SacredSiteService,
    private readonly rankingService: RankingService,
  ) {}

  /**
   * Get all sacred sites with filtering and pagination
   * GET /sacred-sites
   */
  @Get()
  async getSacredSites(
    @Query() query: SacredSiteQueryDto,
  ): Promise<SiteListResponse> {
    this.logger.log(`Getting sacred sites with query: ${JSON.stringify(query)}`);

    const result = await this.sacredSiteService.getSacredSites(query);

    const sites = result.sites.map(site => this.transformSiteToResponse(site));

    return {
      sites,
      pagination: {
        total: result.total,
        offset: query.offset || 0,
        limit: query.limit || 20,
        hasMore: result.hasMore,
      },
    };
  }

  /**
   * Get sacred site by ID
   * GET /sacred-sites/:id
   */
  @Get(':id')
  async getSacredSiteById(@Param('id') id: string): Promise<SacredSiteResponse> {
    this.logger.log(`Getting sacred site by ID: ${id}`);

    const site = await this.sacredSiteService.getSacredSiteById(id);
    return this.transformSiteToResponse(site);
  }

  /**
   * Create a new sacred site manually
   * POST /sacred-sites
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createSacredSite(
    @GetUser() user: User,
    @Body() createSiteDto: CreateSacredSiteDto,
  ): Promise<SacredSiteResponse> {
    this.logger.log(`Creating sacred site: ${createSiteDto.name} by user ${user.id}`);

    const siteData = {
      ...createSiteDto,
      discovererUserId: user.id,
    };

    const site = await this.sacredSiteService.createSacredSite(siteData);
    return this.transformSiteToResponse(site);
  }

  /**
   * Record a visit to a sacred site
   * POST /sacred-sites/:id/visit
   */
  @Post(':id/visit')
  @UseGuards(JwtAuthGuard)
  async recordVisit(
    @Param('id') siteId: string,
    @GetUser() user: User,
    @Body() visitDto: RecordVisitDto,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Recording visit to site ${siteId} by user ${user.id}`);

    await this.sacredSiteService.recordVisit(
      siteId,
      user.id,
      visitDto.latitude && visitDto.longitude
        ? { latitude: visitDto.latitude, longitude: visitDto.longitude }
        : undefined
    );

    return { success: true };
  }

  /**
   * Record activity at a sacred site
   * POST /sacred-sites/:id/activity
   */
  @Post(':id/activity')
  @UseGuards(JwtAuthGuard)
  async recordActivity(
    @Param('id') siteId: string,
    @GetUser() user: User,
    @Body() activityDto: RecordActivityDto,
  ): Promise<{ success: boolean }> {
    this.logger.log(
      `Recording ${activityDto.activityType} activity at site ${siteId} by user ${user.id}`
    );

    const site = await this.sacredSiteService.getSacredSiteById(siteId);

    await this.sacredSiteService.recordSiteActivity(
      site,
      activityDto.activityType,
      user,
      {
        relatedContentId: activityDto.relatedContentId,
        relatedContentType: activityDto.relatedContentType,
        location: activityDto.latitude && activityDto.longitude
          ? { latitude: activityDto.latitude, longitude: activityDto.longitude }
          : undefined,
        ...activityDto.metadata,
      }
    );

    return { success: true };
  }

  /**
   * Get sacred sites leaderboard
   * GET /sacred-sites/leaderboard
   */
  @Get('leaderboard/top')
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponse> {
    this.logger.log(`Getting leaderboard with query: ${JSON.stringify(query)}`);

    const location = query.latitude && query.longitude && query.radiusKm
      ? {
          latitude: query.latitude,
          longitude: query.longitude,
          radiusKm: query.radiusKm,
        }
      : undefined;

    const leaderboard = await this.sacredSiteService.getLeaderboard(
      query.limit,
      query.tier,
      location
    );

    return {
      leaderboard: leaderboard.map(entry => ({
        ...entry,
        site: this.transformSiteToResponse(entry.site),
      })),
      generatedAt: new Date(),
    };
  }

  /**
   * Get site statistics
   * GET /sacred-sites/:id/statistics
   */
  @Get(':id/statistics')
  async getSiteStatistics(
    @Param('id') siteId: string,
    @Query() query: SiteStatisticsQueryDto,
  ): Promise<SiteStatisticsResponse> {
    this.logger.log(`Getting statistics for site ${siteId}`);

    const site = await this.sacredSiteService.getSacredSiteById(siteId);
    const stats = await this.sacredSiteService.getSiteStatistics(siteId, query.days);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (query.days || 30) * 24 * 60 * 60 * 1000);

    // Find peak activity hour and day
    const peakActivityHour = stats.hourlyPattern.indexOf(Math.max(...stats.hourlyPattern));
    const peakActivityDay = stats.dailyPattern.indexOf(Math.max(...stats.dailyPattern));

    return {
      siteId: site.id,
      period: {
        startDate,
        endDate,
        days: query.days || 30,
      },
      activity: {
        totalVisits: stats.totalVisits,
        uniqueVisitors: stats.uniqueVisitors,
        totalActivities: stats.totalActivities,
        activityBreakdown: stats.activityBreakdown,
        growthRate: stats.growthRate,
      },
      patterns: {
        hourlyPattern: stats.hourlyPattern,
        dailyPattern: stats.dailyPattern,
        peakActivityHour,
        peakActivityDay,
      },
      ranking: {
        currentScore: site.totalScore,
        currentTier: site.tier,
        // scoreHistory would be implemented if we store historical data
      },
    };
  }

  /**
   * Trigger sacred sites discovery manually
   * POST /sacred-sites/discovery/trigger
   */
  @Post('discovery/trigger')
  @UseGuards(JwtAuthGuard)
  async triggerDiscovery(
    @GetUser() user: User,
    @Body() discoveryDto: DiscoveryTriggerDto,
  ): Promise<DiscoveryResultResponse> {
    this.logger.log(`Manual discovery triggered by user ${user.id}`);

    const startTime = new Date();
    
    // TODO: Pass discovery parameters to the service
    const result = await this.sacredSiteService.discoverSacredSites();
    
    const endTime = new Date();

    // Count total active sites
    const totalActiveSites = await this.sacredSiteService.getSacredSites({
      limit: 1,
      offset: 0,
    });

    return {
      discovery: {
        triggeredAt: startTime,
        completedAt: endTime,
        totalClusters: result.totalClusters,
      },
      results: {
        newSites: result.newSites.map(site => this.transformSiteToResponse(site)),
        updatedSites: result.updatedSites.map(site => this.transformSiteToResponse(site)),
        dormantSites: result.removedSites,
      },
      summary: {
        newSitesCount: result.newSites.length,
        updatedSitesCount: result.updatedSites.length,
        dormantSitesCount: result.removedSites.length,
        totalActiveSites: totalActiveSites.total,
      },
    };
  }

  /**
   * Update ranking for a specific site
   * PUT /sacred-sites/:id/ranking
   */
  @Put(':id/ranking')
  @UseGuards(JwtAuthGuard)
  async updateSiteRanking(
    @Param('id') siteId: string,
    @GetUser() user: User,
    @Body() rankingDto: UpdateRankingDto,
  ): Promise<{
    siteId: string;
    ranking: {
      totalScore: number;
      tier: string;
      metrics: any;
      breakdown: any;
    };
  }> {
    this.logger.log(`Updating ranking for site ${siteId} by user ${user.id}`);

    const result = await this.sacredSiteService.updateSiteRanking(siteId);

    return {
      siteId,
      ranking: result,
    };
  }

  /**
   * Batch update rankings for all sites
   * POST /sacred-sites/ranking/batch-update
   */
  @Post('ranking/batch-update')
  @UseGuards(JwtAuthGuard)
  async batchUpdateRankings(
    @GetUser() user: User,
    @Body() rankingDto: UpdateRankingDto,
  ): Promise<{
    updated: number;
    errors: number;
    results: Array<{
      siteId: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    this.logger.log(`Batch ranking update triggered by user ${user.id}`);

    const weights = {
      visitCount: rankingDto.visitWeight,
      uniqueVisitors: rankingDto.uniqueVisitorsWeight,
      engagement: rankingDto.engagementWeight,
      growth: rankingDto.growthWeight,
      recency: rankingDto.recencyWeight,
      diversity: rankingDto.diversityWeight,
      consistency: rankingDto.consistencyWeight,
    };

    // Remove undefined values
    Object.keys(weights).forEach(key => {
      if (weights[key] === undefined) {
        delete weights[key];
      }
    });

    const result = await this.rankingService.batchUpdateRankings(undefined, weights);

    return {
      updated: result.updated,
      errors: result.errors,
      results: result.results.map(r => ({
        siteId: r.siteId,
        success: r.success,
        error: r.error,
      })),
    };
  }

  /**
   * Transform SacredSite entity to API response format
   */
  private transformSiteToResponse(site: SacredSite): SacredSiteResponse {
    return {
      id: site.id,
      name: site.name,
      description: site.description,
      latitude: site.latitude,
      longitude: site.longitude,
      address: site.address,
      radius: site.radius,
      tier: site.tier,
      status: site.status,
      clusterPoints: site.clusterPoints,
      metrics: {
        totalScore: site.totalScore,
        visitCount: site.visitCount,
        uniqueVisitorCount: site.uniqueVisitorCount,
        spotCount: site.spotCount,
        totalEngagement: site.totalEngagement,
        averageEngagementRate: site.averageEngagementRate,
        growthRate: site.growthRate,
        recencyScore: site.recencyScore,
      },
      discovery: {
        discovererUserId: site.discovererUserId,
        discoveredAt: site.discoveredAt,
        firstActivityAt: site.firstActivityAt,
        lastActivityAt: site.lastActivityAt,
      },
      tags: site.tags,
      distance: (site as any).distance, // Added by service if location query provided
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    };
  }
}