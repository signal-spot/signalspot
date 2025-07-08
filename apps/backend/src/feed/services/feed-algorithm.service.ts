import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FeedItem, FeedQueryDto, ContentType, SortOrder, PersonalizationData } from '../dto/feed.dto';
import { SignalSpot } from '../../entities/signal-spot.entity';
import { Spark } from '../../spark/entities/spark.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FeedAlgorithmService {
  private readonly logger = new Logger(FeedAlgorithmService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Generate personalized feed content for a user
   */
  async generateFeed(
    userId: string,
    query: FeedQueryDto,
    personalizationData?: PersonalizationData
  ): Promise<{
    items: FeedItem[];
    total: number;
  }> {
    this.logger.debug(
      `Generating feed for user ${userId} with query: ${JSON.stringify(query)}`
    );

    const startTime = Date.now();
    
    try {
      let feedItems: FeedItem[] = [];
      let totalCount = 0;

      // Determine content mix based on query and personalization
      const contentMix = this.determineContentMix(query, personalizationData);
      
      // Get spots if needed
      if (contentMix.includeSpots) {
        const spotData = await this.getSpotContent(userId, query, contentMix.spotLimit);
        feedItems.push(...spotData.items);
        totalCount += spotData.total;
      }

      // Get sparks if needed
      if (contentMix.includeSparks) {
        const sparkData = await this.getSparkContent(userId, query, contentMix.sparkLimit);
        feedItems.push(...sparkData.items);
        totalCount += sparkData.total;
      }

      // Apply sorting and ranking
      feedItems = this.applyFeedRanking(feedItems, query, personalizationData);

      // Apply pagination
      const paginatedItems = feedItems.slice(query.offset, query.offset + query.limit);

      const endTime = Date.now();
      this.logger.debug(
        `Feed generation completed in ${endTime - startTime}ms for user ${userId}`
      );

      return {
        items: paginatedItems,
        total: totalCount,
      };
    } catch (error) {
      this.logger.error(
        `Error generating feed for user ${userId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Determine the mix of content types based on query and user preferences
   */
  private determineContentMix(
    query: FeedQueryDto,
    personalizationData?: PersonalizationData
  ): {
    includeSpots: boolean;
    includeSparks: boolean;
    spotLimit: number;
    sparkLimit: number;
  } {
    const totalLimit = query.limit * 2; // Get more items for better ranking

    switch (query.contentType) {
      case ContentType.SPOT:
        return {
          includeSpots: true,
          includeSparks: false,
          spotLimit: totalLimit,
          sparkLimit: 0,
        };
      
      case ContentType.SPARK:
        return {
          includeSpots: false,
          includeSparks: true,
          spotLimit: 0,
          sparkLimit: totalLimit,
        };
      
      case ContentType.MIXED:
      default:
        // Use personalization data to determine ratio
        const spotRatio = personalizationData?.engagementMetrics?.contentTypePref?.spots || 0.6;
        const sparkRatio = 1 - spotRatio;
        
        return {
          includeSpots: true,
          includeSparks: true,
          spotLimit: Math.ceil(totalLimit * spotRatio),
          sparkLimit: Math.ceil(totalLimit * sparkRatio),
        };
    }
  }

  /**
   * Get spot content for the feed
   */
  private async getSpotContent(
    userId: string,
    query: FeedQueryDto,
    limit: number
  ): Promise<{ items: FeedItem[]; total: number }> {
    let whereClause = 'WHERE s.status = $1';
    let params: any[] = ['active'];
    let paramIndex = 1;

    // Apply location filtering
    if (query.latitude && query.longitude) {
      paramIndex++;
      whereClause += ` AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        $${paramIndex + 2}
      )`;
      params.push(query.longitude, query.latitude, query.radiusMeters || 5000);
      paramIndex += 2;
    }

    // Apply time filtering
    const hoursAgo = new Date(Date.now() - (query.hoursAgo || 24) * 60 * 60 * 1000);
    paramIndex++;
    whereClause += ` AND s.created_at >= $${paramIndex}`;
    params.push(hoursAgo);

    // Apply tag filtering
    if (query.tags) {
      const tagArray = query.tags.split(',').map(tag => tag.trim());
      paramIndex++;
      whereClause += ` AND s.tags && $${paramIndex}`;
      params.push(tagArray);
    }

    // Exclude user's own content for better discovery
    paramIndex++;
    whereClause += ` AND s.user_id != $${paramIndex}`;
    params.push(userId);

    // Apply basic sorting
    let orderByClause = 'ORDER BY s.created_at DESC';
    switch (query.sortBy) {
      case SortOrder.RECENT:
        orderByClause = 'ORDER BY s.created_at DESC';
        break;
      case SortOrder.POPULAR:
        orderByClause = 'ORDER BY s.like_count DESC';
        break;
      case SortOrder.NEARBY:
        if (query.latitude && query.longitude) {
          orderByClause = `ORDER BY ST_Distance(
            ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography
          ) ASC`;
        }
        break;
      default:
        orderByClause = 'ORDER BY s.created_at DESC';
    }

    // Build the main query
    const mainQuery = `
      SELECT s.*, u.username, u.avatar_url
      FROM signal_spots s
      LEFT JOIN users u ON s.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ${limit}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*)
      FROM signal_spots s
      ${whereClause}
    `;

    const [spots, countResult] = await Promise.all([
      this.em.getConnection().execute(mainQuery, params),
      this.em.getConnection().execute(countQuery, params)
    ]);

    const total = parseInt(countResult[0]?.count || '0');

    const items: FeedItem[] = spots.map(spot => this.transformSpotToFeedItem(spot, query));

    return { items, total };
  }

  /**
   * Get spark content for the feed
   */
  private async getSparkContent(
    userId: string,
    query: FeedQueryDto,
    limit: number
  ): Promise<{ items: FeedItem[]; total: number }> {
    let whereClause = 'WHERE sp.status = $1';
    let params: any[] = ['pending'];
    let paramIndex = 1;

    // Apply location filtering
    if (query.latitude && query.longitude) {
      paramIndex++;
      whereClause += ` AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(sp.longitude, sp.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        $${paramIndex + 2}
      )`;
      params.push(query.longitude, query.latitude, query.radiusMeters || 5000);
      paramIndex += 2;
    }

    // Apply time filtering
    const hoursAgo = new Date(Date.now() - (query.hoursAgo || 24) * 60 * 60 * 1000);
    paramIndex++;
    whereClause += ` AND sp.created_at >= $${paramIndex}`;
    params.push(hoursAgo);

    // Include sparks where user is involved
    paramIndex++;
    whereClause += ` AND (sp.user1_id = $${paramIndex} OR sp.user2_id = $${paramIndex})`;
    params.push(userId);

    // Build the main query
    const mainQuery = `
      SELECT sp.*, 
             u1.username as user1_username, u1.avatar_url as user1_avatar,
             u2.username as user2_username, u2.avatar_url as user2_avatar
      FROM sparks sp
      LEFT JOIN users u1 ON sp.user1_id = u1.id
      LEFT JOIN users u2 ON sp.user2_id = u2.id
      ${whereClause}
      ORDER BY sp.created_at DESC
      LIMIT ${limit}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*)
      FROM sparks sp
      ${whereClause}
    `;

    const [sparks, countResult] = await Promise.all([
      this.em.getConnection().execute(mainQuery, params),
      this.em.getConnection().execute(countQuery, params)
    ]);

    const total = parseInt(countResult[0]?.count || '0');

    const items: FeedItem[] = sparks.map(spark => this.transformSparkToFeedItem(spark, userId, query));

    return { items, total };
  }

  /**
   * Apply advanced ranking algorithm to feed items
   */
  private applyFeedRanking(
    items: FeedItem[],
    query: FeedQueryDto,
    personalizationData?: PersonalizationData
  ): FeedItem[] {
    const rankedItems = items.map(item => ({
      ...item,
      relevanceScore: this.calculateRelevanceScore(item, query, personalizationData),
    }));

    // Sort by relevance score for RELEVANT sort order, otherwise maintain original order
    if (query.sortBy === SortOrder.RELEVANT) {
      rankedItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return rankedItems;
  }

  /**
   * Calculate relevance score for a feed item
   */
  private calculateRelevanceScore(
    item: FeedItem,
    query: FeedQueryDto,
    personalizationData?: PersonalizationData
  ): number {
    let score = 0;

    // Base engagement score (30% weight)
    const engagementScore = this.calculateEngagementScore(item.stats);
    score += engagementScore * 0.3;

    // Recency score (25% weight)
    const recencyScore = this.calculateRecencyScore(item.timestamp);
    score += recencyScore * 0.25;

    // Distance score (20% weight)
    if (item.distance !== undefined) {
      const distanceScore = this.calculateDistanceScore(item.distance, query.radiusMeters);
      score += distanceScore * 0.2;
    }

    // Personalization score (25% weight)
    if (personalizationData) {
      const personalizationScore = this.calculatePersonalizationScore(item, personalizationData);
      score += personalizationScore * 0.25;
    }

    return Math.max(0, Math.min(1, score)); // Normalize to 0-1 range
  }

  /**
   * Calculate engagement score based on stats
   */
  private calculateEngagementScore(stats: FeedItem['stats']): number {
    const weightedScore = 
      stats.likes * 3 + 
      stats.comments * 5 + 
      (stats.shares || 0) * 7 + 
      stats.views * 0.1;
    
    // Normalize using log scale to handle large variations
    return Math.min(1, Math.log10(weightedScore + 1) / 3);
  }

  /**
   * Calculate recency score (newer content scores higher)
   */
  private calculateRecencyScore(timestamp: Date): number {
    const ageHours = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    
    // Exponential decay with 24-hour half-life
    return Math.exp(-ageHours / 24);
  }

  /**
   * Calculate distance score (closer content scores higher)
   */
  private calculateDistanceScore(distance: number, maxRadius: number): number {
    // Linear decay from max score at 0 distance to 0 at max radius
    return Math.max(0, 1 - (distance / maxRadius));
  }

  /**
   * Calculate personalization score based on user data
   */
  private calculatePersonalizationScore(
    item: FeedItem,
    personalizationData: PersonalizationData
  ): number {
    let score = 0;

    // Interest matching (40% of personalization score)
    if (item.tags && personalizationData.interests.length > 0) {
      const matchingTags = item.tags.filter(tag => 
        personalizationData.interests.includes(tag)
      );
      const interestScore = matchingTags.length / Math.max(item.tags.length, personalizationData.interests.length);
      score += interestScore * 0.4;
    }

    // Content type preference (30% of personalization score)
    const contentTypePref = personalizationData.engagementMetrics?.contentTypePref;
    if (contentTypePref) {
      const typeScore = item.type === 'spot' ? contentTypePref.spots : contentTypePref.sparks;
      score += typeScore * 0.3;
    }

    // Recent interaction patterns (30% of personalization score)
    const recentInteractions = personalizationData.recentInteractions.slice(0, 10);
    const similarContentInteractions = recentInteractions.filter(interaction => 
      interaction.contentType === item.type
    );
    if (recentInteractions.length > 0) {
      const patternScore = similarContentInteractions.length / recentInteractions.length;
      score += patternScore * 0.3;
    }

    return score;
  }

  /**
   * Transform a SignalSpot entity to FeedItem
   */
  private transformSpotToFeedItem(spot: any, query: FeedQueryDto): FeedItem {
    let distance: number | undefined;
    
    if (query.latitude && query.longitude) {
      // Calculate distance using Haversine formula
      distance = this.calculateDistance(
        query.latitude,
        query.longitude,
        spot.latitude,
        spot.longitude
      );
    }

    return {
      id: spot.id,
      type: 'spot',
      title: spot.title || '',
      content: spot.message,
      location: {
        latitude: spot.latitude,
        longitude: spot.longitude,
        address: undefined, // SignalSpot doesn't have address
      },
      author: {
        id: spot.user_id,
        username: spot.username || 'Unknown',
        avatar: spot.avatar_url,
      },
      timestamp: new Date(spot.created_at),
      stats: {
        views: spot.view_count || 0,
        likes: spot.like_count || 0,
        comments: spot.reply_count || 0,
        shares: spot.share_count || 0,
      },
      tags: spot.tags || [],
      distance,
      relevanceScore: 0, // Will be calculated later
      interactionData: {
        hasLiked: false, // TODO: Check user interactions
        hasCommented: false,
        hasShared: false,
      },
    };
  }

  /**
   * Transform a Spark entity to FeedItem
   */
  private transformSparkToFeedItem(spark: any, currentUserId: string, query: FeedQueryDto): FeedItem {
    let distance: number | undefined;
    
    if (query.latitude && query.longitude) {
      distance = this.calculateDistance(
        query.latitude,
        query.longitude,
        spark.latitude,
        spark.longitude
      );
    }

    // Determine the other user in the spark
    const isUser1 = spark.user1_id === currentUserId;
    const otherUserId = isUser1 ? spark.user2_id : spark.user1_id;
    const otherUsername = isUser1 ? spark.user2_username : spark.user1_username;
    const otherAvatar = isUser1 ? spark.user2_avatar : spark.user1_avatar;

    return {
      id: spark.id,
      type: 'spark',
      title: `Spark with ${otherUsername || 'Unknown'}`,
      content: `You had a spark connection at ${new Date(spark.created_at).toLocaleString()}`,
      location: {
        latitude: spark.latitude,
        longitude: spark.longitude,
      },
      author: {
        id: otherUserId,
        username: otherUsername || 'Unknown',
        avatar: otherAvatar,
      },
      timestamp: new Date(spark.created_at),
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
      },
      distance,
      relevanceScore: 0, // Will be calculated later
      interactionData: {
        hasLiked: false,
        hasCommented: false,
        hasShared: false,
      },
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
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
}