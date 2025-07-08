import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { SacredSite, SiteTier, SiteStatus } from './entities/sacred-site.entity';
import { SiteActivity, ActivityType } from './entities/site-activity.entity';
import { ClusteringService } from './services/clustering.service';
import { RankingService } from './services/ranking.service';
import { User } from '../entities/user.entity';

interface CreateSiteRequest {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  discovererUserId?: string;
  address?: string;
  tags?: string[];
}

interface SiteQueryOptions {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  tier?: SiteTier;
  status?: SiteStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'distance' | 'recent' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface SiteDiscoveryResult {
  newSites: SacredSite[];
  updatedSites: SacredSite[];
  removedSites: string[];
  totalClusters: number;
}

@Injectable()
export class SacredSiteService {
  private readonly logger = new Logger(SacredSiteService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly clusteringService: ClusteringService,
    private readonly rankingService: RankingService,
  ) {}

  /**
   * Discover sacred sites using clustering algorithm
   */
  async discoverSacredSites(): Promise<SiteDiscoveryResult> {
    this.logger.log('Starting sacred sites discovery');

    try {
      // Perform clustering to find potential sacred sites
      const clusters = await this.clusteringService.performClustering();
      
      if (clusters.length === 0) {
        this.logger.warn('No clusters found during discovery');
        return {
          newSites: [],
          updatedSites: [],
          removedSites: [],
          totalClusters: 0,
        };
      }

      const newSites: SacredSite[] = [];
      const updatedSites: SacredSite[] = [];

      // Process each cluster
      for (const cluster of clusters) {
        const existingSite = await this.findExistingSiteForCluster(cluster);

        if (existingSite) {
          // Update existing site
          const updatedSite = await this.updateSiteFromCluster(existingSite, cluster);
          updatedSites.push(updatedSite);
        } else {
          // Create new site
          const newSite = await this.createSiteFromCluster(cluster);
          newSites.push(newSite);
        }
      }

      // Mark dormant sites
      const removedSites = await this.markDormantSites();

      // Update rankings for all active sites
      await this.rankingService.batchUpdateRankings();

      this.logger.log(`Discovery completed: ${newSites.length} new, ${updatedSites.length} updated, ${removedSites.length} dormant`);

      return {
        newSites,
        updatedSites,
        removedSites,
        totalClusters: clusters.length,
      };
    } catch (error) {
      this.logger.error(`Error during sacred sites discovery: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find existing site that matches a cluster
   */
  private async findExistingSiteForCluster(cluster: any): Promise<SacredSite | null> {
    // Find sites within the cluster area
    const potentialSites = await this.em.find(SacredSite, {
      status: { $ne: SiteStatus.ARCHIVED },
      latitude: { 
        $gte: cluster.boundingBox.minLat, 
        $lte: cluster.boundingBox.maxLat 
      },
      longitude: { 
        $gte: cluster.boundingBox.minLng, 
        $lte: cluster.boundingBox.maxLng 
      },
    });

    // Find the closest site to cluster center
    let closestSite: SacredSite | null = null;
    let minDistance = Infinity;

    for (const site of potentialSites) {
      const distance = this.calculateDistance(
        cluster.centerLat, cluster.centerLng,
        site.latitude, site.longitude
      );

      if (distance <= site.radius && distance < minDistance) {
        minDistance = distance;
        closestSite = site;
      }
    }

    return closestSite;
  }

  /**
   * Create new sacred site from cluster
   */
  private async createSiteFromCluster(cluster: any): Promise<SacredSite> {
    const name = await this.clusteringService.generateClusterName(cluster);
    
    const site = new SacredSite({
      name,
      latitude: cluster.centerLat,
      longitude: cluster.centerLng,
      radius: Math.max(100, Math.min(1000, cluster.radius)), // 100m to 1km
    });

    site.clusterPoints = cluster.points.length;
    site.clusterMetadata = {
      algorithm: 'DBSCAN',
      parameters: { density: cluster.density, totalWeight: cluster.totalWeight },
      lastCalculated: new Date(),
      confidence: Math.min(1, cluster.totalWeight / 100),
    };

    await this.em.persistAndFlush(site);
    
    // Track discovery activity
    await this.recordSiteActivity(site, ActivityType.DISCOVERY);

    this.logger.log(`Created new sacred site: ${site.name} (${site.id})`);
    
    return site;
  }

  /**
   * Update existing site from cluster data
   */
  private async updateSiteFromCluster(site: SacredSite, cluster: any): Promise<SacredSite> {
    // Update cluster metadata
    site.clusterPoints = cluster.points.length;
    site.clusterMetadata = {
      algorithm: 'DBSCAN',
      parameters: { density: cluster.density, totalWeight: cluster.totalWeight },
      lastCalculated: new Date(),
      confidence: Math.min(1, cluster.totalWeight / 100),
    };

    // Update center if significantly different
    const centerDistance = this.calculateDistance(
      site.latitude, site.longitude,
      cluster.centerLat, cluster.centerLng
    );

    if (centerDistance > site.radius * 0.3) { // Move center if > 30% of radius
      site.latitude = cluster.centerLat;
      site.longitude = cluster.centerLng;
    }

    // Update radius if needed
    const newRadius = Math.max(100, Math.min(1000, cluster.radius));
    if (Math.abs(site.radius - newRadius) > 50) { // Update if difference > 50m
      site.radius = newRadius;
    }

    site.lastActivityAt = new Date();

    await this.em.persistAndFlush(site);

    this.logger.debug(`Updated sacred site: ${site.name} (${site.id})`);

    return site;
  }

  /**
   * Mark sites as dormant if they haven't had activity recently
   */
  private async markDormantSites(): Promise<string[]> {
    const activeSites = await this.em.find(SacredSite, {
      status: SiteStatus.ACTIVE,
    });

    const dormantSiteIds: string[] = [];

    for (const site of activeSites) {
      if (site.isDormant()) {
        site.status = SiteStatus.DORMANT;
        dormantSiteIds.push(site.id);
        
        this.logger.debug(`Marked site as dormant: ${site.name} (${site.id})`);
      }
    }

    if (dormantSiteIds.length > 0) {
      await this.em.flush();
    }

    return dormantSiteIds;
  }

  /**
   * Get sacred sites with filtering and pagination
   */
  async getSacredSites(options: SiteQueryOptions = {}): Promise<{
    sites: SacredSite[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      latitude,
      longitude,
      radiusKm = 10,
      tier,
      status = SiteStatus.ACTIVE,
      limit = 20,
      offset = 0,
      sortBy = 'score',
      sortOrder = 'desc',
    } = options;

    const queryOptions: any = { status };

    if (tier) {
      queryOptions.tier = tier;
    }

    // Add location filter
    if (latitude !== undefined && longitude !== undefined) {
      const radiusMeters = radiusKm * 1000;
      const latOffset = (radiusMeters / 111320);
      const lngOffset = (radiusMeters / (111320 * Math.cos(latitude * Math.PI / 180)));

      queryOptions.latitude = { 
        $gte: latitude - latOffset, 
        $lte: latitude + latOffset 
      };
      queryOptions.longitude = { 
        $gte: longitude - lngOffset, 
        $lte: longitude + lngOffset 
      };
    }

    // Determine sort order
    const orderBy: any = {};
    switch (sortBy) {
      case 'score':
        orderBy.totalScore = sortOrder.toUpperCase();
        break;
      case 'recent':
        orderBy.lastActivityAt = sortOrder.toUpperCase();
        break;
      case 'name':
        orderBy.name = sortOrder.toUpperCase();
        break;
      default:
        orderBy.totalScore = 'DESC';
    }

    const [sites, total] = await this.em.findAndCount(SacredSite, queryOptions, {
      orderBy,
      limit,
      offset,
    });

    // Calculate distances if location provided
    if (latitude !== undefined && longitude !== undefined) {
      sites.forEach(site => {
        const distance = this.calculateDistance(latitude, longitude, site.latitude, site.longitude);
        (site as any).distance = distance;
      });

      // Re-sort by distance if requested
      if (sortBy === 'distance') {
        sites.sort((a, b) => {
          const distanceA = (a as any).distance || 0;
          const distanceB = (b as any).distance || 0;
          return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
        });
      }
    }

    return {
      sites,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get sacred site by ID
   */
  async getSacredSiteById(id: string): Promise<SacredSite> {
    const site = await this.em.findOne(SacredSite, { id }, {
      populate: ['activities'],
    });

    if (!site) {
      throw new NotFoundException(`Sacred site with ID ${id} not found`);
    }

    return site;
  }

  /**
   * Create a sacred site manually
   */
  async createSacredSite(data: CreateSiteRequest): Promise<SacredSite> {
    // Check for existing sites in the area
    const existingSites = await this.findNearbyBaseSites(
      data.latitude, 
      data.longitude, 
      data.radius
    );

    if (existingSites.length > 0) {
      throw new BadRequestException('A sacred site already exists in this area');
    }

    const site = new SacredSite(data);
    site.tags = data.tags;

    await this.em.persistAndFlush(site);

    // Record discovery activity
    if (data.discovererUserId) {
      const user = await this.em.findOne(User, { id: data.discovererUserId });
      if (user) {
        await this.recordSiteActivity(site, ActivityType.DISCOVERY, user);
      }
    }

    this.logger.log(`Created sacred site manually: ${site.name} (${site.id})`);

    return site;
  }

  /**
   * Record activity at a sacred site
   */
  async recordSiteActivity(
    site: SacredSite,
    activityType: ActivityType,
    user?: User,
    metadata?: any
  ): Promise<SiteActivity> {
    const activity = new SiteActivity({
      site,
      activityType,
      user,
      metadata,
    });

    await this.em.persistAndFlush(activity);

    // Update site's last activity
    site.lastActivityAt = new Date();
    await this.em.flush();

    return activity;
  }

  /**
   * Record visit to a sacred site
   */
  async recordVisit(
    siteId: string,
    userId?: string,
    location?: { latitude: number; longitude: number }
  ): Promise<void> {
    const site = await this.getSacredSiteById(siteId);
    const user = userId ? await this.em.findOne(User, { id: userId }) : undefined;

    await this.recordSiteActivity(site, ActivityType.VISIT, user, {
      location,
      timestamp: new Date(),
    });
  }

  /**
   * Get sacred sites near a location
   */
  async findNearbyBaseSites(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<SacredSite[]> {
    const latOffset = (radiusMeters / 111320);
    const lngOffset = (radiusMeters / (111320 * Math.cos(latitude * Math.PI / 180)));

    return await this.em.find(SacredSite, {
      status: { $ne: SiteStatus.ARCHIVED },
      latitude: { $gte: latitude - latOffset, $lte: latitude + latOffset },
      longitude: { $gte: longitude - lngOffset, $lte: longitude + lngOffset },
    });
  }

  /**
   * Get leaderboard of sacred sites
   */
  async getLeaderboard(
    limit: number = 10,
    tier?: SiteTier,
    location?: { latitude: number; longitude: number; radiusKm: number }
  ): Promise<Array<{
    rank: number;
    site: SacredSite;
    score: number;
    tier: SiteTier;
  }>> {
    return await this.rankingService.getLeaderboard(limit, tier, location);
  }

  /**
   * Get site statistics
   */
  async getSiteStatistics(siteId: string, days: number = 30): Promise<{
    totalVisits: number;
    uniqueVisitors: number;
    totalActivities: number;
    activityBreakdown: Record<ActivityType, number>;
    hourlyPattern: number[];
    dailyPattern: number[];
    growthRate: number;
  }> {
    const site = await this.getSacredSiteById(siteId);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activities = await this.em.find(SiteActivity, {
      site: site.id,
      timestamp: { $gte: since },
    }, {
      populate: ['user'],
    });

    // Calculate statistics
    const totalVisits = activities.filter(a => a.activityType === ActivityType.VISIT).length;
    const uniqueVisitors = new Set(activities.filter(a => a.user).map(a => a.user!.id)).size;
    const totalActivities = activities.length;

    // Activity breakdown
    const activityBreakdown: Record<ActivityType, number> = {
      [ActivityType.VISIT]: 0,
      [ActivityType.SPOT_CREATED]: 0,
      [ActivityType.INTERACTION]: 0,
      [ActivityType.DISCOVERY]: 0,
      [ActivityType.CHECK_IN]: 0,
    };

    activities.forEach(activity => {
      activityBreakdown[activity.activityType]++;
    });

    // Hourly and daily patterns
    const hourlyPattern = new Array(24).fill(0);
    const dailyPattern = new Array(7).fill(0);

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      hourlyPattern[date.getHours()]++;
      dailyPattern[date.getDay()]++;
    });

    // Calculate growth rate (compare with previous period)
    const previousPeriodStart = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
    const previousActivities = await this.em.count(SiteActivity, {
      site: site.id,
      timestamp: { $gte: previousPeriodStart, $lt: since },
    });

    const growthRate = previousActivities > 0 
      ? ((totalActivities - previousActivities) / previousActivities) * 100
      : totalActivities > 0 ? 100 : 0;

    return {
      totalVisits,
      uniqueVisitors,
      totalActivities,
      activityBreakdown,
      hourlyPattern,
      dailyPattern,
      growthRate,
    };
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Update site ranking manually
   */
  async updateSiteRanking(siteId: string): Promise<{
    totalScore: number;
    tier: string;
    metrics: any;
    breakdown: any;
  }> {
    const site = await this.getSacredSiteById(siteId);
    const ranking = await this.rankingService.calculateSiteRanking(site);

    // Update site with new ranking
    site.totalScore = ranking.totalScore;
    site.tier = ranking.tier;
    site.visitCount = ranking.metrics.visitCount;
    site.uniqueVisitorCount = ranking.metrics.uniqueVisitorCount;
    site.spotCount = ranking.metrics.spotCount;
    site.totalEngagement = ranking.metrics.totalEngagement;
    site.averageEngagementRate = ranking.metrics.averageEngagementRate;
    site.growthRate = ranking.metrics.growthRate;
    site.recencyScore = ranking.metrics.recencyScore;

    await this.em.flush();

    return {
      totalScore: ranking.totalScore,
      tier: ranking.tier,
      metrics: ranking.metrics,
      breakdown: ranking.breakdown,
    };
  }
}