import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PersonalizationData, FeedItem } from '../dto/feed.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class ContentScoringService {
  private readonly logger = new Logger(ContentScoringService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Get personalization data for a user
   */
  async getPersonalizationData(userId: string): Promise<PersonalizationData | null> {
    try {
      const user = await this.em.findOne(User, { id: userId });

      if (!user) {
        this.logger.warn(`User ${userId} not found for personalization`);
        return null;
      }

      // Get user's recent interactions
      const recentInteractions = await this.getRecentInteractions(userId);
      
      // Get user's location history
      const locationHistory = await this.getLocationHistory(userId);
      
      // Calculate engagement metrics
      const engagementMetrics = await this.calculateEngagementMetrics(userId);
      
      // Extract interests from profile and interactions
      const interests = await this.extractUserInterests(userId);
      
      // Get preferred tags based on interaction history
      const preferredTags = await this.getPreferredTags(userId);

      return {
        userId,
        interests,
        recentInteractions,
        locationHistory,
        preferredTags,
        engagementMetrics,
      };
    } catch (error) {
      this.logger.error(
        `Error getting personalization data for user ${userId}: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Get recent user interactions for personalization
   */
  private async getRecentInteractions(userId: string): Promise<PersonalizationData['recentInteractions']> {
    // This would typically query an interactions table
    // For now, return empty array as placeholder
    const interactions: PersonalizationData['recentInteractions'] = [];

    try {
      // TODO: Implement actual interaction history query
      // This would query a table that tracks user interactions
      const rawQuery = `
        SELECT 
          content_id,
          content_type,
          action_type as action,
          created_at as timestamp
        FROM user_interactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      
      const results = await this.em.getConnection().execute(rawQuery, [userId]);
      
      return results.map(row => ({
        contentId: row.content_id,
        contentType: row.content_type,
        action: row.action,
        timestamp: new Date(row.timestamp),
      }));
    } catch (error) {
      this.logger.debug(`No interaction history found for user ${userId}`);
      return interactions;
    }
  }

  /**
   * Get user's location history for personalization
   */
  private async getLocationHistory(userId: string): Promise<PersonalizationData['locationHistory']> {
    try {
      // Query location history from the database
      const rawQuery = `
        SELECT latitude, longitude, created_at as timestamp
        FROM location_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 100
      `;
      
      const results = await this.em.getConnection().execute(rawQuery, [userId]);
      
      return results.map(row => ({
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        timestamp: new Date(row.timestamp),
      }));
    } catch (error) {
      this.logger.debug(`No location history found for user ${userId}`);
      return [];
    }
  }

  /**
   * Calculate user engagement metrics
   */
  private async calculateEngagementMetrics(userId: string): Promise<PersonalizationData['engagementMetrics']> {
    try {
      // Get session data
      const sessionQuery = `
        SELECT 
          AVG(duration_minutes) as avg_duration,
          COUNT(*) as session_count
        FROM user_sessions 
        WHERE user_id = ? 
        AND created_at >= NOW() - INTERVAL '30 days'
      `;
      
      const sessionData = await this.em.getConnection().execute(sessionQuery, [userId]);
      const avgSessionDuration = sessionData[0]?.avg_duration || 5; // Default 5 minutes

      // Get content type preferences
      const contentPrefQuery = `
        SELECT 
          content_type,
          COUNT(*) as interaction_count
        FROM user_interactions 
        WHERE user_id = ? 
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY content_type
      `;
      
      const contentPrefData = await this.em.getConnection().execute(contentPrefQuery, [userId]);
      
      let spotsCount = 0;
      let sparksCount = 0;
      
      contentPrefData.forEach(row => {
        if (row.content_type === 'spot') spotsCount = row.interaction_count;
        if (row.content_type === 'spark') sparksCount = row.interaction_count;
      });
      
      const totalInteractions = spotsCount + sparksCount;
      const contentTypePref = totalInteractions > 0 ? {
        spots: spotsCount / totalInteractions,
        sparks: sparksCount / totalInteractions,
      } : { spots: 0.6, sparks: 0.4 }; // Default preferences

      // Get time of day activity patterns
      const activityQuery = `
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as activity_count
        FROM user_interactions 
        WHERE user_id = ? 
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY EXTRACT(HOUR FROM created_at)
      `;
      
      const activityData = await this.em.getConnection().execute(activityQuery, [userId]);
      
      const timeOfDayActivity: { [hour: string]: number } = {};
      for (let i = 0; i < 24; i++) {
        timeOfDayActivity[i.toString()] = 0;
      }
      
      activityData.forEach(row => {
        timeOfDayActivity[row.hour.toString()] = row.activity_count;
      });

      return {
        avgSessionDuration,
        contentTypePref,
        timeOfDayActivity,
      };
    } catch (error) {
      this.logger.debug(`Could not calculate engagement metrics for user ${userId}`);
      return {
        avgSessionDuration: 5,
        contentTypePref: { spots: 0.6, sparks: 0.4 },
        timeOfDayActivity: {},
      };
    }
  }

  /**
   * Extract user interests from profile and interactions
   */
  private async extractUserInterests(userId: string): Promise<string[]> {
    try {
      const user = await this.em.findOne(User, { id: userId });

      const interests: string[] = [];

      // Get interests from user profile
      if (user?.interests) {
        interests.push(...user.interests);
      }

      // Get interests from interaction patterns (tags of content user interacted with)
      const interactionQuery = `
        SELECT DISTINCT unnest(s.tags) as tag
        FROM signal_spots s
        JOIN user_interactions ui ON ui.content_id = s.id
        WHERE ui.user_id = ? 
        AND ui.content_type = 'spot'
        AND ui.created_at >= NOW() - INTERVAL '30 days'
        LIMIT 20
      `;
      
      const tagResults = await this.em.getConnection().execute(interactionQuery, [userId]);
      const interactionTags = tagResults.map(row => row.tag);
      
      interests.push(...interactionTags);

      // Remove duplicates and return
      return [...new Set(interests)];
    } catch (error) {
      this.logger.debug(`Could not extract interests for user ${userId}`);
      return [];
    }
  }

  /**
   * Get user's preferred tags based on interaction history
   */
  private async getPreferredTags(userId: string): Promise<string[]> {
    try {
      const tagQuery = `
        SELECT 
          unnest(s.tags) as tag,
          COUNT(*) as frequency
        FROM signal_spots s
        JOIN user_interactions ui ON ui.content_id = s.id
        WHERE ui.user_id = ? 
        AND ui.content_type = 'spot'
        AND ui.action_type IN ('like', 'comment', 'share')
        AND ui.created_at >= NOW() - INTERVAL '60 days'
        GROUP BY unnest(s.tags)
        ORDER BY frequency DESC
        LIMIT 10
      `;
      
      const results = await this.em.getConnection().execute(tagQuery, [userId]);
      return results.map(row => row.tag);
    } catch (error) {
      this.logger.debug(`Could not get preferred tags for user ${userId}`);
      return [];
    }
  }

  /**
   * Calculate similarity score between two users based on their interactions
   */
  async calculateUserSimilarity(userId1: string, userId2: string): Promise<number> {
    try {
      // Get interaction vectors for both users
      const user1Interests = await this.extractUserInteractions(userId1);
      const user2Interests = await this.extractUserInteractions(userId2);
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(user1Interests, user2Interests);
      
      return similarity;
    } catch (error) {
      this.logger.error(`Error calculating user similarity: ${error.message}`);
      return 0;
    }
  }

  /**
   * Extract interaction vector for collaborative filtering
   */
  private async extractUserInteractions(userId: string): Promise<Map<string, number>> {
    const interactions = new Map<string, number>();
    
    try {
      const interactionQuery = `
        SELECT 
          content_id,
          action_type,
          COUNT(*) as frequency
        FROM user_interactions 
        WHERE user_id = ? 
        AND created_at >= NOW() - INTERVAL '90 days'
        GROUP BY content_id, action_type
      `;
      
      const results = await this.em.getConnection().execute(interactionQuery, [userId]);
      
      results.forEach(row => {
        const key = `${row.content_id}:${row.action_type}`;
        const weight = this.getActionWeight(row.action_type);
        interactions.set(key, row.frequency * weight);
      });
    } catch (error) {
      this.logger.debug(`Could not extract interactions for user ${userId}`);
    }
    
    return interactions;
  }

  /**
   * Get weight for different interaction types
   */
  private getActionWeight(actionType: string): number {
    const weights = {
      'view': 1,
      'like': 3,
      'comment': 5,
      'share': 7,
    };
    
    return weights[actionType] || 1;
  }

  /**
   * Calculate cosine similarity between two interaction vectors
   */
  private cosineSimilarity(vector1: Map<string, number>, vector2: Map<string, number>): number {
    const keys1 = new Set(vector1.keys());
    const keys2 = new Set(vector2.keys());
    const commonKeys = new Set([...keys1].filter(key => keys2.has(key)));
    
    if (commonKeys.size === 0) {
      return 0;
    }
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (const key of commonKeys) {
      const val1 = vector1.get(key) || 0;
      const val2 = vector2.get(key) || 0;
      dotProduct += val1 * val2;
    }
    
    for (const val of vector1.values()) {
      magnitude1 += val * val;
    }
    
    for (const val of vector2.values()) {
      magnitude2 += val * val;
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Get trending tags for content discovery
   */
  async getTrendingTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
    try {
      const trendingQuery = `
        SELECT 
          unnest(tags) as tag,
          COUNT(*) as count
        FROM signal_spots 
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY unnest(tags)
        ORDER BY count DESC
        LIMIT ?
      `;
      
      const results = await this.em.getConnection().execute(trendingQuery, [limit]);
      
      return results.map(row => ({
        tag: row.tag,
        count: parseInt(row.count),
      }));
    } catch (error) {
      this.logger.error(`Error getting trending tags: ${error.message}`);
      return [];
    }
  }
}