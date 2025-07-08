import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { SacredSite, SiteTier, SiteStatus } from '../entities/sacred-site.entity';
import { SiteActivity, ActivityType } from '../entities/site-activity.entity';
import { SignalSpot } from '../../entities/signal-spot.entity';

interface RankingMetrics {
  visitCount: number;
  uniqueVisitorCount: number;
  spotCount: number;
  totalEngagement: number;
  averageEngagementRate: number;
  growthRate: number;
  recencyScore: number;
  diversityScore: number;
  consistencyScore: number;
}

interface TierThresholds {
  legendary: number;
  major: number;
  minor: number;
  emerging: number;
}

interface RankingWeights {
  visitCount: number;
  uniqueVisitors: number;
  engagement: number;
  growth: number;
  recency: number;
  diversity: number;
  consistency: number;
}

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  // Configurable ranking weights
  private readonly defaultWeights: RankingWeights = {
    visitCount: 0.20,      // 20% - Total visits
    uniqueVisitors: 0.18,  // 18% - Unique visitor count
    engagement: 0.25,      // 25% - Engagement rate (likes, comments, shares)
    growth: 0.15,          // 15% - Growth rate over time
    recency: 0.10,         // 10% - Recent activity
    diversity: 0.07,       // 7% - Content/user diversity
    consistency: 0.05,     // 5% - Consistent activity patterns
  };

  // Tier thresholds (0-100 scale)
  private readonly defaultThresholds: TierThresholds = {
    legendary: 85,
    major: 65,
    minor: 40,
    emerging: 0,
  };

  constructor(private readonly em: EntityManager) {}

  /**
   * Calculate comprehensive ranking score for a sacred site
   */
  async calculateSiteRanking(
    site: SacredSite,
    weights: Partial<RankingWeights> = {},
    customPeriodDays: number = 30
  ): Promise<{
    totalScore: number;
    tier: SiteTier;
    metrics: RankingMetrics;
    breakdown: Record<string, number>;
  }> {
    const finalWeights = { ...this.defaultWeights, ...weights };
    
    try {
      // Gather all metrics
      const metrics = await this.calculateSiteMetrics(site, customPeriodDays);
      
      // Calculate individual scores
      const visitScore = this.calculateVisitScore(metrics.visitCount);
      const uniqueVisitorScore = this.calculateUniqueVisitorScore(metrics.uniqueVisitorCount);
      const engagementScore = this.calculateEngagementScore(metrics.averageEngagementRate);
      const growthScore = this.calculateGrowthScore(metrics.growthRate);
      const recencyScore = this.calculateRecencyScore(metrics.recencyScore);
      const diversityScore = this.calculateDiversityScore(metrics.diversityScore);
      const consistencyScore = this.calculateConsistencyScore(metrics.consistencyScore);

      // Calculate weighted total score
      const totalScore = Math.round(
        visitScore * finalWeights.visitCount +
        uniqueVisitorScore * finalWeights.uniqueVisitors +
        engagementScore * finalWeights.engagement +
        growthScore * finalWeights.growth +
        recencyScore * finalWeights.recency +
        diversityScore * finalWeights.diversity +
        consistencyScore * finalWeights.consistency
      );

      // Determine tier
      const tier = this.calculateTier(totalScore);

      // Breakdown for transparency
      const breakdown = {
        visitScore: Math.round(visitScore * finalWeights.visitCount),
        uniqueVisitorScore: Math.round(uniqueVisitorScore * finalWeights.uniqueVisitors),
        engagementScore: Math.round(engagementScore * finalWeights.engagement),
        growthScore: Math.round(growthScore * finalWeights.growth),
        recencyScore: Math.round(recencyScore * finalWeights.recency),
        diversityScore: Math.round(diversityScore * finalWeights.diversity),
        consistencyScore: Math.round(consistencyScore * finalWeights.consistency),
      };

      return {
        totalScore: Math.max(0, Math.min(100, totalScore)),
        tier,
        metrics,
        breakdown,
      };
    } catch (error) {
      this.logger.error(`Error calculating ranking for site ${site.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate all metrics for a sacred site
   */
  private async calculateSiteMetrics(site: SacredSite, periodDays: number): Promise<RankingMetrics> {
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get activities within the site area
    const activities = await this.em.find(SiteActivity, {
      site: site.id,
      timestamp: { $gte: periodStart },
    }, {
      populate: ['user'],
      orderBy: { timestamp: 'DESC' },
    });

    // Get spots within the site area
    const spots = await this.getSpotsInSiteArea(site, periodStart);

    // Calculate basic metrics
    const visitCount = activities.filter(a => 
      a.activityType === ActivityType.VISIT || a.activityType === ActivityType.CHECK_IN
    ).length;

    const uniqueVisitorCount = new Set(
      activities.filter(a => a.user).map(a => a.user!.id)
    ).size;

    const spotCount = spots.length;

    const totalEngagement = spots.reduce((sum, spot) => 
      sum + spot.likeCount + spot.replyCount + spot.shareCount, 0
    );

    const averageEngagementRate = spotCount > 0 ? totalEngagement / spotCount : 0;

    // Calculate growth rate
    const growthRate = await this.calculateGrowthRate(site, periodDays);

    // Calculate recency score
    const recencyScore = this.calculateSiteRecencyScore(activities);

    // Calculate diversity score
    const diversityScore = await this.calculateSiteDiversityScore(site, activities, spots);

    // Calculate consistency score
    const consistencyScore = this.calculateSiteConsistencyScore(activities);

    return {
      visitCount,
      uniqueVisitorCount,
      spotCount,
      totalEngagement,
      averageEngagementRate,
      growthRate,
      recencyScore,
      diversityScore,
      consistencyScore,
    };
  }

  /**
   * Get spots within sacred site area
   */
  private async getSpotsInSiteArea(site: SacredSite, since: Date): Promise<SignalSpot[]> {
    const bounds = site.getBounds();
    
    return await this.em.find(SignalSpot, {
      latitude: { $gte: bounds.minLat, $lte: bounds.maxLat },
      longitude: { $gte: bounds.minLng, $lte: bounds.maxLng },
      createdAt: { $gte: since },
    });
  }

  /**
   * Calculate growth rate over specified period
   */
  private async calculateGrowthRate(site: SacredSite, periodDays: number): Promise<number> {
    const now = new Date();
    const periodEnd = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const periodStart = new Date(periodEnd.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Get activity counts for two periods
    const currentPeriodActivities = await this.em.count(SiteActivity, {
      site: site.id,
      timestamp: { $gte: periodEnd, $lte: now },
    });

    const previousPeriodActivities = await this.em.count(SiteActivity, {
      site: site.id,
      timestamp: { $gte: periodStart, $lte: periodEnd },
    });

    // Calculate growth rate as percentage
    if (previousPeriodActivities === 0) {
      return currentPeriodActivities > 0 ? 100 : 0;
    }

    return ((currentPeriodActivities - previousPeriodActivities) / previousPeriodActivities) * 100;
  }

  /**
   * Calculate recency score based on recent activity
   */
  private calculateSiteRecencyScore(activities: SiteActivity[]): number {
    if (activities.length === 0) return 0;

    const now = Date.now();
    const recentActivityWeights = activities.map(activity => {
      const ageInHours = (now - activity.timestamp.getTime()) / (1000 * 60 * 60);
      
      // Exponential decay with 48-hour half-life
      return Math.exp(-ageInHours / 48);
    });

    const totalWeight = recentActivityWeights.reduce((sum, weight) => sum + weight, 0);
    const maxPossibleWeight = activities.length; // If all activities were just now

    return maxPossibleWeight > 0 ? (totalWeight / maxPossibleWeight) : 0;
  }

  /**
   * Calculate diversity score based on user and content variety
   */
  private async calculateSiteDiversityScore(
    site: SacredSite, 
    activities: SiteActivity[], 
    spots: SignalSpot[]
  ): Promise<number> {
    let diversityScore = 0;

    // User diversity (40% of diversity score)
    const uniqueUsers = new Set(activities.filter(a => a.user).map(a => a.user!.id));
    const totalActivities = activities.length;
    const userDiversity = totalActivities > 0 ? uniqueUsers.size / totalActivities : 0;
    diversityScore += userDiversity * 0.4;

    // Activity type diversity (30% of diversity score)
    const activityTypes = new Set(activities.map(a => a.activityType));
    const maxActivityTypes = Object.keys(ActivityType).length;
    const activityDiversity = activityTypes.size / maxActivityTypes;
    diversityScore += activityDiversity * 0.3;

    // Content diversity (30% of diversity score)
    if (spots.length > 0) {
      const allTags = spots.flatMap(spot => spot.tags || []);
      const uniqueTags = new Set(allTags);
      const tagDiversity = allTags.length > 0 ? uniqueTags.size / allTags.length : 0;
      diversityScore += tagDiversity * 0.3;
    }

    return Math.min(1, diversityScore);
  }

  /**
   * Calculate consistency score based on regular activity patterns
   */
  private calculateSiteConsistencyScore(activities: SiteActivity[]): number {
    if (activities.length < 7) return 0; // Need at least a week of data

    // Group activities by day of week and hour
    const activityByHour: { [key: number]: number } = {};
    const activityByDay: { [key: number]: number } = {};

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const hour = date.getHours();
      const day = date.getDay();

      activityByHour[hour] = (activityByHour[hour] || 0) + 1;
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    });

    // Calculate coefficient of variation (lower = more consistent)
    const hourCounts = Object.values(activityByHour);
    const dayCounts = Object.values(activityByDay);

    const hourConsistency = this.calculateConsistencyMetric(hourCounts);
    const dayConsistency = this.calculateConsistencyMetric(dayCounts);

    // Average the two consistency measures
    return (hourConsistency + dayConsistency) / 2;
  }

  /**
   * Calculate consistency metric (inverse of coefficient of variation)
   */
  private calculateConsistencyMetric(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (mean === 0) return 0;

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    // Convert to consistency score (0-1, higher = more consistent)
    return Math.max(0, 1 - Math.min(1, coefficientOfVariation));
  }

  /**
   * Calculate normalized score for visit count (0-100)
   */
  private calculateVisitScore(visitCount: number): number {
    // Logarithmic scaling for visit count
    return Math.min(100, Math.log10(visitCount + 1) * 20);
  }

  /**
   * Calculate normalized score for unique visitors (0-100)
   */
  private calculateUniqueVisitorScore(uniqueVisitorCount: number): number {
    // Square root scaling for unique visitors
    return Math.min(100, Math.sqrt(uniqueVisitorCount) * 10);
  }

  /**
   * Calculate normalized score for engagement rate (0-100)
   */
  private calculateEngagementScore(engagementRate: number): number {
    // Linear scaling with diminishing returns
    return Math.min(100, engagementRate * 20);
  }

  /**
   * Calculate normalized score for growth rate (0-100)
   */
  private calculateGrowthScore(growthRate: number): number {
    // Sigmoid scaling for growth rate (can be negative)
    const sigmoid = (x: number) => 1 / (1 + Math.exp(-x / 50));
    return sigmoid(growthRate) * 100;
  }

  /**
   * Calculate normalized score for recency (0-100)
   */
  private calculateRecencyScore(recencyScore: number): number {
    return recencyScore * 100;
  }

  /**
   * Calculate normalized score for diversity (0-100)
   */
  private calculateDiversityScore(diversityScore: number): number {
    return diversityScore * 100;
  }

  /**
   * Calculate normalized score for consistency (0-100)
   */
  private calculateConsistencyScore(consistencyScore: number): number {
    return consistencyScore * 100;
  }

  /**
   * Determine tier based on total score
   */
  private calculateTier(totalScore: number): SiteTier {
    const thresholds = this.defaultThresholds;

    if (totalScore >= thresholds.legendary) {
      return SiteTier.LEGENDARY;
    } else if (totalScore >= thresholds.major) {
      return SiteTier.MAJOR;
    } else if (totalScore >= thresholds.minor) {
      return SiteTier.MINOR;
    } else {
      return SiteTier.EMERGING;
    }
  }

  /**
   * Batch update rankings for multiple sites
   */
  async batchUpdateRankings(
    siteIds?: string[],
    weights?: Partial<RankingWeights>
  ): Promise<{
    updated: number;
    errors: number;
    results: Array<{
      siteId: string;
      success: boolean;
      error?: string;
      ranking?: any;
    }>;
  }> {
    this.logger.log('Starting batch ranking update');

    try {
      // Get sites to update
      const sites = siteIds 
        ? await this.em.find(SacredSite, { id: { $in: siteIds } })
        : await this.em.find(SacredSite, { status: SiteStatus.ACTIVE });

      const results: Array<{
        siteId: string;
        success: boolean;
        error?: string;
        ranking?: any;
      }> = [];

      let updated = 0;
      let errors = 0;

      // Process each site
      for (const site of sites) {
        try {
          const ranking = await this.calculateSiteRanking(site, weights);
          
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

          await this.em.persistAndFlush(site);

          results.push({
            siteId: site.id,
            success: true,
            ranking,
          });

          updated++;
        } catch (error) {
          this.logger.error(`Error updating ranking for site ${site.id}: ${error.message}`);
          
          results.push({
            siteId: site.id,
            success: false,
            error: error.message,
          });

          errors++;
        }
      }

      this.logger.log(`Batch ranking update completed: ${updated} updated, ${errors} errors`);

      return {
        updated,
        errors,
        results,
      };
    } catch (error) {
      this.logger.error(`Error in batch ranking update: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get leaderboard of top sacred sites
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
    const queryOptions: any = {
      status: SiteStatus.ACTIVE,
    };

    if (tier) {
      queryOptions.tier = tier;
    }

    // Add location filter if provided
    if (location) {
      const { latitude, longitude, radiusKm } = location;
      const radiusMeters = radiusKm * 1000;
      
      // Simple bounding box filter (could be improved with actual spatial query)
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

    const sites = await this.em.find(SacredSite, queryOptions, {
      orderBy: { totalScore: 'DESC' },
      limit,
    });

    return sites.map((site, index) => ({
      rank: index + 1,
      site,
      score: site.totalScore,
      tier: site.tier,
    }));
  }

  /**
   * Get ranking history for a site (if we store historical data)
   */
  async getSiteRankingHistory(
    siteId: string,
    days: number = 30
  ): Promise<Array<{
    date: Date;
    score: number;
    tier: SiteTier;
    rank?: number;
  }>> {
    // This would require historical ranking data storage
    // For now, return empty array as placeholder
    return [];
  }
}