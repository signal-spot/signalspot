import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FeedQueryDto, FeedResponse, ContentType, SortOrder, TodaysConnectionResponse, TodaysConnectionQueryDto } from './dto/feed.dto';
import { FeedAlgorithmService } from './services/feed-algorithm.service';
import { ContentScoringService } from './services/content-scoring.service';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly feedAlgorithmService: FeedAlgorithmService,
    private readonly contentScoringService: ContentScoringService,
    private readonly em: EntityManager,
  ) {}

  /**
   * Get personalized feed for a user
   */
  async getFeed(userId: string, query: FeedQueryDto): Promise<FeedResponse> {
    this.logger.log(`Generating feed for user ${userId} with query: ${JSON.stringify(query)}`);

    try {
      // Get personalization data for the user
      const personalizationData = await this.contentScoringService.getPersonalizationData(userId);
      
      if (personalizationData) {
        this.logger.debug(`Loaded personalization data for user ${userId}`);
      } else {
        this.logger.debug(`No personalization data available for user ${userId}, using defaults`);
      }

      // Generate feed using algorithm service
      const feedData = await this.feedAlgorithmService.generateFeed(
        userId,
        query,
        personalizationData
      );

      // Create response object
      const response: FeedResponse = {
        items: feedData.items,
        pagination: {
          total: feedData.total,
          offset: query.offset || 0,
          limit: query.limit || 20,
          hasMore: (query.offset || 0) + (query.limit || 20) < feedData.total,
        },
        metadata: {
          algorithm: 'relevance_v1',
          generatedAt: new Date(),
          userLocation: query.latitude && query.longitude ? {
            latitude: query.latitude,
            longitude: query.longitude,
          } : undefined,
          filters: {
            contentType: query.contentType || ContentType.MIXED,
            sortBy: query.sortBy || SortOrder.RELEVANT,
            radiusMeters: query.radiusMeters || 5000,
            hoursAgo: query.hoursAgo || 24,
          },
        },
      };

      this.logger.log(`Generated feed with ${feedData.items.length} items for user ${userId}`);
      
      return response;
    } catch (error) {
      this.logger.error(`Error generating feed for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get trending content for discovery
   */
  async getTrendingContent(query: FeedQueryDto): Promise<FeedResponse> {
    this.logger.log(`Getting trending content with query: ${JSON.stringify(query)}`);

    try {
      // For trending content, we'll use a generic algorithm without personalization
      const feedData = await this.feedAlgorithmService.generateFeed(
        'anonymous', // No specific user for trending
        {
          ...query,
          sortBy: SortOrder.POPULAR, // Override to focus on popular content
        }
      );

      const response: FeedResponse = {
        items: feedData.items,
        pagination: {
          total: feedData.total,
          offset: query.offset || 0,
          limit: query.limit || 20,
          hasMore: (query.offset || 0) + (query.limit || 20) < feedData.total,
        },
        metadata: {
          algorithm: 'trending_v1',
          generatedAt: new Date(),
          userLocation: query.latitude && query.longitude ? {
            latitude: query.latitude,
            longitude: query.longitude,
          } : undefined,
          filters: {
            contentType: query.contentType || ContentType.MIXED,
            sortBy: SortOrder.POPULAR,
            radiusMeters: query.radiusMeters || 5000,
            hoursAgo: query.hoursAgo || 24,
          },
        },
      };

      this.logger.log(`Generated trending feed with ${feedData.items.length} items`);
      
      return response;
    } catch (error) {
      this.logger.error(`Error getting trending content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get feed for a specific location
   */
  async getLocationFeed(
    latitude: number,
    longitude: number,
    query: Omit<FeedQueryDto, 'latitude' | 'longitude'>
  ): Promise<FeedResponse> {
    this.logger.log(`Getting location feed for ${latitude}, ${longitude}`);

    const locationQuery: FeedQueryDto = {
      ...query,
      latitude,
      longitude,
      sortBy: SortOrder.NEARBY, // Focus on nearby content
    };

    try {
      const feedData = await this.feedAlgorithmService.generateFeed(
        'anonymous',
        locationQuery
      );

      const response: FeedResponse = {
        items: feedData.items,
        pagination: {
          total: feedData.total,
          offset: query.offset || 0,
          limit: query.limit || 20,
          hasMore: (query.offset || 0) + (query.limit || 20) < feedData.total,
        },
        metadata: {
          algorithm: 'location_v1',
          generatedAt: new Date(),
          userLocation: {
            latitude,
            longitude,
          },
          filters: {
            contentType: query.contentType || ContentType.MIXED,
            sortBy: SortOrder.NEARBY,
            radiusMeters: query.radiusMeters || 5000,
            hoursAgo: query.hoursAgo || 24,
          },
        },
      };

      this.logger.log(`Generated location feed with ${feedData.items.length} items`);
      
      return response;
    } catch (error) {
      this.logger.error(`Error getting location feed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get trending tags for content discovery
   */
  async getTrendingTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
    this.logger.log(`Getting trending tags with limit ${limit}`);
    
    try {
      const trendingTags = await this.contentScoringService.getTrendingTags(limit);
      
      this.logger.log(`Found ${trendingTags.length} trending tags`);
      
      return trendingTags;
    } catch (error) {
      this.logger.error(`Error getting trending tags: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get recommended users based on content interactions
   */
  async getRecommendedUsers(
    userId: string,
    limit: number = 10
  ): Promise<Array<{
    userId: string;
    username: string;
    avatar?: string;
    similarityScore: number;
    commonInterests: string[];
  }>> {
    this.logger.log(`Getting recommended users for ${userId} with limit ${limit}`);
    
    try {
      // This would implement collaborative filtering to find similar users
      // For now, return empty array as placeholder
      
      this.logger.log(`Found 0 recommended users for ${userId}`);
      
      return [];
    } catch (error) {
      this.logger.error(`Error getting recommended users: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Refresh feed cache for a user (called after significant interactions)
   */
  async refreshUserFeedCache(userId: string): Promise<void> {
    this.logger.log(`Refreshing feed cache for user ${userId}`);
    
    try {
      // Invalidate any cached personalization data
      // This would typically clear Redis cache entries
      
      this.logger.log(`Feed cache refreshed for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error refreshing feed cache for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get Today's Connection - special daily digest of meaningful connections
   */
  async getTodaysConnection(userId: string, query: TodaysConnectionQueryDto): Promise<TodaysConnectionResponse> {
    this.logger.log(`Getting Today's Connection for user ${userId} with query: ${JSON.stringify(query)}`);
    
    try {
      const targetDate = query.date ? new Date(query.date) : new Date();
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);
      
      // Get all user activity for the day
      const [sparks, spots, interactions] = await Promise.all([
        this.getDailySparks(userId, startOfDay, endOfDay, query),
        this.getDailySpots(userId, startOfDay, endOfDay, query),
        this.getDailyInteractions(userId, startOfDay, endOfDay)
      ]);
      
      // Calculate summary statistics
      const summary = {
        totalConnections: sparks.length + spots.length + interactions.length,
        newSparks: sparks.length,
        revisitedSpots: spots.filter(spot => spot.isRevisited).length,
        meaningfulInteractions: interactions.filter(interaction => interaction.score > 0.7).length,
      };
      
      // Generate highlights from all activities
      const highlights = this.generateHighlights(sparks, spots, interactions);
      
      // Generate insights based on the day's activities
      const insights = await this.generateInsights(userId, sparks, spots, interactions, targetDate);
      
      // Generate recommendations for future connections
      const recommendations = await this.generateRecommendations(userId, sparks, spots, interactions);
      
      const response: TodaysConnectionResponse = {
        date: targetDate.toISOString().split('T')[0],
        summary,
        highlights,
        insights,
        recommendations,
      };
      
      this.logger.log(`Generated Today's Connection with ${highlights.length} highlights for user ${userId}`);
      
      return response;
    } catch (error) {
      this.logger.error(`Error getting Today's Connection for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's sparks for a specific day
   */
  private async getDailySparks(userId: string, startOfDay: Date, endOfDay: Date, query: TodaysConnectionQueryDto): Promise<any[]> {
    try {
      let whereClause = 'WHERE (sp.user1_id = $1 OR sp.user2_id = $1) AND sp.created_at BETWEEN $2 AND $3';
      let params = [userId, startOfDay, endOfDay];
      let paramIndex = 3;
      
      // Apply location filtering if provided
      if (query.latitude && query.longitude) {
        paramIndex++;
        whereClause += ` AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(sp.longitude, sp.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )`;
        params.push(query.longitude.toString(), query.latitude.toString(), (query.radiusMeters || 10000).toString());
        paramIndex += 2;
      }
      
      const sparkQuery = `
        SELECT sp.*, 
               u1.username as user1_username, u1.avatar_url as user1_avatar,
               u2.username as user2_username, u2.avatar_url as user2_avatar
        FROM sparks sp
        LEFT JOIN users u1 ON sp.user1_id = u1.id
        LEFT JOIN users u2 ON sp.user2_id = u2.id
        ${whereClause}
        ORDER BY sp.created_at DESC
      `;
      
      const results = await this.em.getConnection().execute(sparkQuery, params);
      
      return results.map(spark => ({
        ...spark,
        type: 'spark',
        score: 0.9, // Sparks are always high-value connections
        isRevisited: false,
      }));
    } catch (error) {
      this.logger.debug(`Error fetching daily sparks for user ${userId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user's spots for a specific day
   */
  private async getDailySpots(userId: string, startOfDay: Date, endOfDay: Date, query: TodaysConnectionQueryDto): Promise<any[]> {
    try {
      let whereClause = 'WHERE s.user_id = $1 AND s.created_at BETWEEN $2 AND $3';
      let params = [userId, startOfDay, endOfDay];
      let paramIndex = 3;
      
      // Apply location filtering if provided
      if (query.latitude && query.longitude) {
        paramIndex++;
        whereClause += ` AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )`;
        params.push(query.longitude.toString(), query.latitude.toString(), (query.radiusMeters || 10000).toString());
        paramIndex += 2;
      }
      
      const spotQuery = `
        SELECT s.*, u.username, u.avatar_url
        FROM signal_spots s
        LEFT JOIN users u ON s.user_id = u.id
        ${whereClause}
        ORDER BY s.created_at DESC
      `;
      
      const results = await this.em.getConnection().execute(spotQuery, params);
      
      // Check if any spots are revisited (user has been to similar location before)
      const spotsWithRevisitData = await Promise.all(results.map(async (spot) => {
        const isRevisited = await this.checkIfLocationRevisited(userId, spot.latitude, spot.longitude, startOfDay);
        return {
          ...spot,
          type: 'spot',
          score: this.calculateSpotScore(spot),
          isRevisited,
        };
      }));
      
      return spotsWithRevisitData;
    } catch (error) {
      this.logger.debug(`Error fetching daily spots for user ${userId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user's interactions for a specific day
   */
  private async getDailyInteractions(userId: string, startOfDay: Date, endOfDay: Date): Promise<any[]> {
    try {
      const interactionQuery = `
        SELECT ui.*, 
               CASE 
                 WHEN ui.content_type = 'spot' THEN s.title
                 WHEN ui.content_type = 'spark' THEN CONCAT('Spark with ', u.username)
                 ELSE 'Unknown Content'
               END as content_title,
               CASE 
                 WHEN ui.content_type = 'spot' THEN s.latitude
                 WHEN ui.content_type = 'spark' THEN sp.latitude
                 ELSE NULL
               END as latitude,
               CASE 
                 WHEN ui.content_type = 'spot' THEN s.longitude
                 WHEN ui.content_type = 'spark' THEN sp.longitude
                 ELSE NULL
               END as longitude
        FROM user_interactions ui
        LEFT JOIN signal_spots s ON ui.content_id = s.id AND ui.content_type = 'spot'
        LEFT JOIN sparks sp ON ui.content_id = sp.id AND ui.content_type = 'spark'
        LEFT JOIN users u ON (sp.user1_id = u.id OR sp.user2_id = u.id) AND u.id != $1
        WHERE ui.user_id = $1 
        AND ui.created_at BETWEEN $2 AND $3
        AND ui.action_type IN ('like', 'comment', 'share')
        ORDER BY ui.created_at DESC
      `;
      
      const results = await this.em.getConnection().execute(interactionQuery, [userId, startOfDay, endOfDay]);
      
      return results.map(interaction => ({
        ...interaction,
        type: 'interaction',
        score: this.calculateInteractionScore(interaction),
      }));
    } catch (error) {
      this.logger.debug(`Error fetching daily interactions for user ${userId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if a location has been revisited
   */
  private async checkIfLocationRevisited(userId: string, latitude: number, longitude: number, beforeDate: Date): Promise<boolean> {
    try {
      const revisitQuery = `
        SELECT COUNT(*) as count
        FROM signal_spots s
        WHERE s.user_id = $1 
        AND s.created_at < $2
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
          500
        )
      `;
      
      const result = await this.em.getConnection().execute(revisitQuery, [userId, beforeDate, longitude, latitude]);
      
      return parseInt(result[0]?.count || '0') > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate score for a spot based on engagement
   */
  private calculateSpotScore(spot: any): number {
    const likes = spot.like_count || 0;
    const replies = spot.reply_count || 0;
    const shares = spot.share_count || 0;
    const views = spot.view_count || 0;
    
    // Weighted score based on engagement
    const score = (likes * 3 + replies * 5 + shares * 7 + views * 0.1) / 100;
    
    return Math.min(1, score); // Normalize to 0-1 range
  }

  /**
   * Calculate score for an interaction
   */
  private calculateInteractionScore(interaction: any): number {
    const actionWeights = {
      like: 0.3,
      comment: 0.6,
      share: 0.9,
    };
    
    return actionWeights[interaction.action_type] || 0.1;
  }

  /**
   * Generate highlights from daily activities
   */
  private generateHighlights(sparks: any[], spots: any[], interactions: any[]): TodaysConnectionResponse['highlights'] {
    const allActivities = [...sparks, ...spots, ...interactions];
    
    // Sort by score and take top activities
    const topActivities = allActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    return topActivities.map(activity => {
      if (activity.type === 'spark') {
        const isUser1 = activity.user1_id === activity.user_id;
        const otherUser = {
          id: isUser1 ? activity.user2_id : activity.user1_id,
          username: isUser1 ? activity.user2_username : activity.user1_username,
          avatar: isUser1 ? activity.user2_avatar : activity.user1_avatar,
        };
        
        return {
          type: 'spark' as const,
          title: `New Spark Connection`,
          description: `You connected with ${otherUser.username} through a spark`,
          timestamp: new Date(activity.created_at),
          location: {
            latitude: activity.latitude,
            longitude: activity.longitude,
          },
          participants: [otherUser],
          score: activity.score,
        };
      } else if (activity.type === 'spot') {
        return {
          type: 'spot' as const,
          title: activity.title || 'Signal Spot',
          description: activity.isRevisited ? 'You revisited a meaningful location' : 'You created a new signal spot',
          timestamp: new Date(activity.created_at),
          location: {
            latitude: activity.latitude,
            longitude: activity.longitude,
          },
          score: activity.score,
        };
      } else {
        return {
          type: 'interaction' as const,
          title: `${activity.action_type} on ${activity.content_title}`,
          description: `You ${activity.action_type}d this content`,
          timestamp: new Date(activity.created_at),
          location: activity.latitude && activity.longitude ? {
            latitude: activity.latitude,
            longitude: activity.longitude,
          } : undefined,
          score: activity.score,
        };
      }
    });
  }

  /**
   * Generate insights based on daily activities
   */
  private async generateInsights(userId: string, sparks: any[], spots: any[], interactions: any[], targetDate: Date): Promise<TodaysConnectionResponse['insights']> {
    const totalActivities = sparks.length + spots.length + interactions.length;
    
    // Connection pattern insight
    let connectionPattern = 'You had a quiet day with minimal connections';
    if (totalActivities > 10) {
      connectionPattern = 'You were highly active with many meaningful connections';
    } else if (totalActivities > 5) {
      connectionPattern = 'You had a good balance of connections and interactions';
    } else if (sparks.length > 2) {
      connectionPattern = 'You focused on building new spark connections';
    }
    
    // Location insight
    const uniqueLocations = new Set();
    [...sparks, ...spots].forEach(activity => {
      if (activity.latitude && activity.longitude) {
        uniqueLocations.add(`${activity.latitude.toFixed(3)},${activity.longitude.toFixed(3)}`);
      }
    });
    
    let locationInsight = 'You stayed in familiar areas';
    if (uniqueLocations.size > 5) {
      locationInsight = 'You explored many different locations';
    } else if (uniqueLocations.size > 3) {
      locationInsight = 'You visited a good variety of locations';
    }
    
    // Time pattern insight
    const hourCounts = new Map<number, number>();
    [...sparks, ...spots, ...interactions].forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    const peakHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    let timePattern = 'Your activity was spread throughout the day';
    if (peakHour && peakHour[1] > totalActivities * 0.3) {
      const timeDescription = peakHour[0] < 12 ? 'morning' : peakHour[0] < 17 ? 'afternoon' : 'evening';
      timePattern = `You were most active in the ${timeDescription}`;
    }
    
    // Social insight
    const uniqueUsers = new Set();
    sparks.forEach(spark => {
      uniqueUsers.add(spark.user1_id === userId ? spark.user2_id : spark.user1_id);
    });
    
    let socialInsight = 'You focused on personal content creation';
    if (uniqueUsers.size > 3) {
      socialInsight = 'You connected with many different people';
    } else if (uniqueUsers.size > 1) {
      socialInsight = 'You had meaningful one-on-one connections';
    } else if (sparks.length > 0) {
      socialInsight = 'You made a special connection with someone';
    }
    
    return {
      connectionPattern,
      locationInsight,
      timePattern,
      socialInsight,
    };
  }

  /**
   * Generate recommendations based on daily activities
   */
  private async generateRecommendations(userId: string, sparks: any[], spots: any[], interactions: any[]): Promise<TodaysConnectionResponse['recommendations']> {
    const recommendations: TodaysConnectionResponse['recommendations'] = [];
    
    // Location recommendation based on frequently visited areas
    if (spots.length > 0) {
      const locationClusters = this.clusterLocations(spots);
      const topCluster = locationClusters[0];
      
      if (topCluster) {
        recommendations.push({
          type: 'location',
          title: 'Explore nearby areas',
          description: `You seem to enjoy this area. Explore similar locations within 2km`,
          score: 0.8,
          data: {
            latitude: topCluster.centerLat,
            longitude: topCluster.centerLng,
            radius: 2000,
          },
        });
      }
    }
    
    // User recommendation based on similar interests
    if (sparks.length > 0) {
      recommendations.push({
        type: 'user',
        title: 'Connect with similar users',
        description: 'Based on your recent connections, you might enjoy meeting these people',
        score: 0.7,
        data: {
          similarityThreshold: 0.6,
          excludeIds: sparks.map(spark => spark.user1_id === userId ? spark.user2_id : spark.user1_id),
        },
      });
    }
    
    // Content recommendation based on interaction patterns
    if (interactions.length > 0) {
      const contentTypes = interactions.map(i => i.content_type);
      const preferredType = contentTypes.reduce((a, b) => 
        contentTypes.filter(v => v === a).length >= contentTypes.filter(v => v === b).length ? a : b
      );
      
      recommendations.push({
        type: 'content',
        title: `More ${preferredType}s like these`,
        description: `You showed interest in ${preferredType}s today. Here are similar ones`,
        score: 0.6,
        data: {
          contentType: preferredType,
          basedOnInteractions: interactions.slice(0, 3).map(i => i.content_id),
        },
      });
    }
    
    return recommendations;
  }

  /**
   * Cluster locations to find frequently visited areas
   */
  private clusterLocations(locations: any[]): Array<{ centerLat: number; centerLng: number; count: number }> {
    const clusters: Array<{ centerLat: number; centerLng: number; count: number; points: any[] }> = [];
    const radius = 500; // 500 meters clustering radius
    
    locations.forEach(location => {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          cluster.centerLat,
          cluster.centerLng
        );
        
        if (distance <= radius) {
          cluster.points.push(location);
          cluster.count++;
          // Recalculate center
          cluster.centerLat = cluster.points.reduce((sum, p) => sum + p.latitude, 0) / cluster.points.length;
          cluster.centerLng = cluster.points.reduce((sum, p) => sum + p.longitude, 0) / cluster.points.length;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push({
          centerLat: location.latitude,
          centerLng: location.longitude,
          count: 1,
          points: [location],
        });
      }
    });
    
    return clusters
      .sort((a, b) => b.count - a.count)
      .map(cluster => ({
        centerLat: cluster.centerLat,
        centerLng: cluster.centerLng,
        count: cluster.count,
      }));
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
   * Get feed performance metrics for monitoring
   */
  async getFeedMetrics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalRequests: number;
    avgResponseTime: number;
    cacheHitRate: number;
    topContentTypes: Array<{ type: string; count: number }>;
    topSortMethods: Array<{ method: string; count: number }>;
  }> {
    this.logger.log(`Getting feed metrics for timeframe: ${timeframe}`);
    
    try {
      // This would query metrics from a monitoring system
      // For now, return placeholder data
      
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        cacheHitRate: 0,
        topContentTypes: [],
        topSortMethods: [],
      };
    } catch (error) {
      this.logger.error(`Error getting feed metrics: ${error.message}`, error.stack);
      throw error;
    }
  }
}