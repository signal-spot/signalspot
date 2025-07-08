import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../entities/user.entity';
import { SignalSpot } from '../../entities/signal-spot.entity';

export interface ContextData {
  userId: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timeContext: {
    hour: number;
    dayOfWeek: number;
    season: string;
    isWeekend: boolean;
  };
  deviceContext: {
    platform: string;
    version: string;
    batteryLevel?: number;
    connectivity: string;
  };
  socialContext: {
    nearbyUsers: number;
    recentInteractions: number;
    activeConnections: number;
  };
  behaviorContext: {
    sessionDuration: number;
    activityLevel: 'low' | 'medium' | 'high';
    preferredContentTypes: string[];
    interactionPatterns: string[];
  };
}

export interface ContextualSuggestion {
  id: string;
  type: 'location' | 'content' | 'social' | 'timing' | 'safety';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  actionable: boolean;
  actions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  relevanceScore: number;
  expiresAt?: Date;
  metadata?: any;
}

export interface ContextualInsight {
  category: 'behavioral' | 'social' | 'spatial' | 'temporal';
  insight: string;
  confidence: number;
  evidence: string[];
  recommendations: string[];
}

export interface SmartNotification {
  id: string;
  type: 'reminder' | 'suggestion' | 'alert' | 'opportunity';
  title: string;
  body: string;
  priority: number;
  timing: 'immediate' | 'optimal' | 'scheduled';
  scheduledFor?: Date;
  contextTriggers: string[];
  data?: any;
}

@Injectable()
export class ContextEnhancementService {
  private readonly logger = new Logger(ContextEnhancementService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Get comprehensive context data for a user
   */
  async getContextData(userId: string, location?: { latitude: number; longitude: number }): Promise<ContextData> {
    this.logger.debug(`Getting context data for user ${userId}`);

    try {
      const user = await this.em.findOne(User, { id: userId });
      
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const now = new Date();
      const timeContext = this.buildTimeContext(now);
      const socialContext = await this.buildSocialContext(userId, location);
      const behaviorContext = await this.buildBehaviorContext(userId);

      return {
        userId,
        currentLocation: location,
        timeContext,
        deviceContext: {
          platform: 'mobile', // This would come from request headers
          version: '1.0.0',
          connectivity: 'wifi', // This would come from client
        },
        socialContext,
        behaviorContext,
      };
    } catch (error) {
      this.logger.error(`Error getting context data for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate contextual suggestions based on user's current context
   */
  async getContextualSuggestions(contextData: ContextData): Promise<ContextualSuggestion[]> {
    this.logger.debug(`Generating contextual suggestions for user ${contextData.userId}`);

    const suggestions: ContextualSuggestion[] = [];

    try {
      // Location-based suggestions
      if (contextData.currentLocation) {
        const locationSuggestions = await this.generateLocationSuggestions(contextData);
        suggestions.push(...locationSuggestions);
      }

      // Time-based suggestions
      const timeSuggestions = await this.generateTimeSuggestions(contextData);
      suggestions.push(...timeSuggestions);

      // Social context suggestions
      const socialSuggestions = await this.generateSocialSuggestions(contextData);
      suggestions.push(...socialSuggestions);

      // Behavior-based suggestions
      const behaviorSuggestions = await this.generateBehaviorSuggestions(contextData);
      suggestions.push(...behaviorSuggestions);

      // Safety and wellness suggestions
      const safetySuggestions = await this.generateSafetySuggestions(contextData);
      suggestions.push(...safetySuggestions);

      // Sort by relevance score and priority
      return suggestions
        .sort((a, b) => {
          const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.relevanceScore - a.relevanceScore;
        })
        .slice(0, 10); // Limit to top 10 suggestions

    } catch (error) {
      this.logger.error(`Error generating contextual suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate contextual insights about user behavior
   */
  async getContextualInsights(userId: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<ContextualInsight[]> {
    this.logger.debug(`Generating contextual insights for user ${userId} over ${timeframe}`);

    const insights: ContextualInsight[] = [];

    try {
      // Behavioral insights
      const behaviorInsights = await this.generateBehaviorInsights(userId, timeframe);
      insights.push(...behaviorInsights);

      // Social insights
      const socialInsights = await this.generateSocialInsights(userId, timeframe);
      insights.push(...socialInsights);

      // Spatial insights
      const spatialInsights = await this.generateSpatialInsights(userId, timeframe);
      insights.push(...spatialInsights);

      // Temporal insights
      const temporalInsights = await this.generateTemporalInsights(userId, timeframe);
      insights.push(...temporalInsights);

      return insights.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      this.logger.error(`Error generating contextual insights: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate smart notifications based on context
   */
  async generateSmartNotifications(contextData: ContextData): Promise<SmartNotification[]> {
    this.logger.debug(`Generating smart notifications for user ${contextData.userId}`);

    const notifications: SmartNotification[] = [];

    try {
      // Check for optimal timing opportunities
      if (this.isOptimalEngagementTime(contextData)) {
        notifications.push({
          id: `optimal-time-${Date.now()}`,
          type: 'opportunity',
          title: 'Perfect time to connect',
          body: 'Now is a great time to create a signal spot or connect with others nearby',
          priority: 0.8,
          timing: 'immediate',
          contextTriggers: ['optimal_timing', 'high_engagement_probability'],
        });
      }

      // Location-based reminders
      if (contextData.currentLocation) {
        const locationNotifications = await this.generateLocationNotifications(contextData);
        notifications.push(...locationNotifications);
      }

      // Social opportunities
      if (contextData.socialContext.nearbyUsers > 2) {
        notifications.push({
          id: `social-opportunity-${Date.now()}`,
          type: 'suggestion',
          title: 'People nearby',
          body: `${contextData.socialContext.nearbyUsers} users are active in your area`,
          priority: 0.6,
          timing: 'optimal',
          contextTriggers: ['nearby_users', 'social_activity'],
        });
      }

      // Behavioral insights
      if (contextData.behaviorContext.activityLevel === 'low') {
        notifications.push({
          id: `engagement-reminder-${Date.now()}`,
          type: 'reminder',
          title: 'Time to reconnect',
          body: 'You haven\'t been active lately. Explore what\'s happening around you',
          priority: 0.4,
          timing: 'optimal',
          contextTriggers: ['low_activity', 'engagement_reminder'],
        });
      }

      return notifications
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5); // Limit to top 5 notifications

    } catch (error) {
      this.logger.error(`Error generating smart notifications: ${error.message}`);
      return [];
    }
  }

  /**
   * Get context-aware content recommendations
   */
  async getContextualContentRecommendations(contextData: ContextData): Promise<Array<{
    contentId: string;
    contentType: 'spot' | 'spark';
    reason: string;
    score: number;
  }>> {
    this.logger.debug(`Getting contextual content recommendations for user ${contextData.userId}`);

    try {
      const recommendations = [];

      // Location-based content
      if (contextData.currentLocation) {
        const nearbyContent = await this.findNearbyContent(contextData);
        recommendations.push(...nearbyContent);
      }

      // Time-based content
      const timeBasedContent = await this.findTimeBasedContent(contextData);
      recommendations.push(...timeBasedContent);

      // Social context content
      const socialContent = await this.findSocialContent(contextData);
      recommendations.push(...socialContent);

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    } catch (error) {
      this.logger.error(`Error getting contextual content recommendations: ${error.message}`);
      return [];
    }
  }

  /**
   * Build time context information
   */
  private buildTimeContext(date: Date): ContextData['timeContext'] {
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    
    let season = 'spring';
    if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else if (month >= 11 || month <= 1) season = 'winter';
    
    return {
      hour,
      dayOfWeek,
      season,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  }

  /**
   * Build social context information
   */
  private async buildSocialContext(userId: string, location?: { latitude: number; longitude: number }): Promise<ContextData['socialContext']> {
    try {
      let nearbyUsers = 0;
      
      // Count nearby users if location is provided
      if (location) {
        const nearbyQuery = `
          SELECT COUNT(DISTINCT s.user_id) as nearby_count
          FROM signal_spots s
          WHERE s.user_id != $1
          AND s.created_at >= NOW() - INTERVAL '1 hour'
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
            1000
          )
        `;
        
        const result = await this.em.getConnection().execute(nearbyQuery, [userId, location.longitude, location.latitude]);
        nearbyUsers = parseInt(result[0]?.nearby_count || '0');
      }

      // Get recent interactions count
      const interactionQuery = `
        SELECT COUNT(*) as interaction_count
        FROM user_interactions
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '24 hours'
      `;
      
      const interactionResult = await this.em.getConnection().execute(interactionQuery, [userId]);
      const recentInteractions = parseInt(interactionResult[0]?.interaction_count || '0');

      // Get active connections (users who have sparked with this user)
      const connectionQuery = `
        SELECT COUNT(DISTINCT 
          CASE 
            WHEN user1_id = $1 THEN user2_id 
            ELSE user1_id 
          END
        ) as active_connections
        FROM sparks
        WHERE (user1_id = $1 OR user2_id = $1)
        AND created_at >= NOW() - INTERVAL '7 days'
      `;
      
      const connectionResult = await this.em.getConnection().execute(connectionQuery, [userId]);
      const activeConnections = parseInt(connectionResult[0]?.active_connections || '0');

      return {
        nearbyUsers,
        recentInteractions,
        activeConnections,
      };
    } catch (error) {
      this.logger.debug(`Error building social context: ${error.message}`);
      return {
        nearbyUsers: 0,
        recentInteractions: 0,
        activeConnections: 0,
      };
    }
  }

  /**
   * Build behavior context information
   */
  private async buildBehaviorContext(userId: string): Promise<ContextData['behaviorContext']> {
    try {
      // Get session duration (placeholder - would come from session tracking)
      const sessionDuration = 15; // minutes

      // Calculate activity level based on recent actions
      const activityQuery = `
        SELECT COUNT(*) as activity_count
        FROM user_interactions
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '24 hours'
      `;
      
      const activityResult = await this.em.getConnection().execute(activityQuery, [userId]);
      const activityCount = parseInt(activityResult[0]?.activity_count || '0');
      
      let activityLevel: 'low' | 'medium' | 'high' = 'low';
      if (activityCount > 20) activityLevel = 'high';
      else if (activityCount > 8) activityLevel = 'medium';

      // Get preferred content types
      const contentPrefQuery = `
        SELECT content_type, COUNT(*) as frequency
        FROM user_interactions
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY content_type
        ORDER BY frequency DESC
      `;
      
      const prefResult = await this.em.getConnection().execute(contentPrefQuery, [userId]);
      const preferredContentTypes = prefResult.map(row => row.content_type);

      // Get interaction patterns
      const patternQuery = `
        SELECT action_type, COUNT(*) as frequency
        FROM user_interactions
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY action_type
        ORDER BY frequency DESC
      `;
      
      const patternResult = await this.em.getConnection().execute(patternQuery, [userId]);
      const interactionPatterns = patternResult.map(row => row.action_type);

      return {
        sessionDuration,
        activityLevel,
        preferredContentTypes,
        interactionPatterns,
      };
    } catch (error) {
      this.logger.debug(`Error building behavior context: ${error.message}`);
      return {
        sessionDuration: 5,
        activityLevel: 'medium',
        preferredContentTypes: ['spot'],
        interactionPatterns: ['view'],
      };
    }
  }

  /**
   * Generate location-based suggestions
   */
  private async generateLocationSuggestions(contextData: ContextData): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];

    if (!contextData.currentLocation) return suggestions;

    try {
      // Find popular spots nearby
      const popularSpots = await this.findPopularNearbySpots(contextData.currentLocation);
      
      if (popularSpots.length > 0) {
        suggestions.push({
          id: `popular-spots-${Date.now()}`,
          type: 'location',
          priority: 'medium',
          title: 'Popular spots nearby',
          description: `${popularSpots.length} popular signal spots are within 500m`,
          actionable: true,
          actions: [{
            type: 'navigate',
            label: 'Explore nearby',
            data: { spots: popularSpots },
          }],
          relevanceScore: 0.8,
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
        });
      }

      // Check for historical significance
      const historicalSpots = await this.findHistoricalSpots(contextData.currentLocation);
      
      if (historicalSpots.length > 0) {
        suggestions.push({
          id: `historical-spots-${Date.now()}`,
          type: 'location',
          priority: 'low',
          title: 'You\'ve been here before',
          description: `You created ${historicalSpots.length} signal spots in this area`,
          actionable: true,
          actions: [{
            type: 'revisit',
            label: 'View memories',
            data: { spots: historicalSpots },
          }],
          relevanceScore: 0.6,
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Error generating location suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate time-based suggestions
   */
  private async generateTimeSuggestions(contextData: ContextData): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];

    try {
      const { hour, isWeekend } = contextData.timeContext;

      // Morning inspiration
      if (hour >= 6 && hour <= 9) {
        suggestions.push({
          id: `morning-inspiration-${Date.now()}`,
          type: 'timing',
          priority: 'medium',
          title: 'Good morning!',
          description: 'Start your day by sharing something inspiring',
          actionable: true,
          actions: [{
            type: 'create',
            label: 'Create morning spot',
            data: { suggestedTags: ['morning', 'inspiration', 'daily'] },
          }],
          relevanceScore: 0.7,
        });
      }

      // Lunch break suggestions
      if (hour >= 11 && hour <= 13 && !isWeekend) {
        suggestions.push({
          id: `lunch-break-${Date.now()}`,
          type: 'timing',
          priority: 'medium',
          title: 'Lunch break connections',
          description: 'Great time to connect with colleagues or discover lunch spots',
          actionable: true,
          actions: [{
            type: 'explore',
            label: 'Find lunch spots',
            data: { tags: ['food', 'lunch', 'restaurant'] },
          }],
          relevanceScore: 0.6,
        });
      }

      // Evening wind-down
      if (hour >= 18 && hour <= 21) {
        suggestions.push({
          id: `evening-reflection-${Date.now()}`,
          type: 'timing',
          priority: 'low',
          title: 'Evening reflection',
          description: 'Perfect time to reflect on your day and share thoughts',
          actionable: true,
          actions: [{
            type: 'create',
            label: 'Share reflection',
            data: { suggestedTags: ['reflection', 'evening', 'thoughts'] },
          }],
          relevanceScore: 0.5,
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Error generating time suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate social context suggestions
   */
  private async generateSocialSuggestions(contextData: ContextData): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];

    try {
      const { nearbyUsers, recentInteractions, activeConnections } = contextData.socialContext;

      // High social activity
      if (nearbyUsers > 5) {
        suggestions.push({
          id: `high-social-activity-${Date.now()}`,
          type: 'social',
          priority: 'high',
          title: 'Busy area detected',
          description: `${nearbyUsers} users are active nearby - great for connections!`,
          actionable: true,
          actions: [{
            type: 'social',
            label: 'Join the activity',
            data: { nearbyUsers },
          }],
          relevanceScore: 0.9,
        });
      }

      // Low recent interactions
      if (recentInteractions < 3) {
        suggestions.push({
          id: `low-interaction-${Date.now()}`,
          type: 'social',
          priority: 'medium',
          title: 'Time to reconnect',
          description: 'You haven\'t been very active lately. Explore what\'s happening!',
          actionable: true,
          actions: [{
            type: 'explore',
            label: 'Discover content',
            data: { contentType: 'mixed' },
          }],
          relevanceScore: 0.4,
        });
      }

      // Active connections follow-up
      if (activeConnections > 0) {
        suggestions.push({
          id: `active-connections-${Date.now()}`,
          type: 'social',
          priority: 'medium',
          title: 'Follow up with connections',
          description: `You have ${activeConnections} recent connections to follow up with`,
          actionable: true,
          actions: [{
            type: 'message',
            label: 'Check connections',
            data: { activeConnections },
          }],
          relevanceScore: 0.6,
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Error generating social suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate behavior-based suggestions
   */
  private async generateBehaviorSuggestions(contextData: ContextData): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];

    try {
      const { activityLevel, preferredContentTypes, interactionPatterns } = contextData.behaviorContext;

      // High activity user
      if (activityLevel === 'high') {
        suggestions.push({
          id: `high-activity-${Date.now()}`,
          type: 'content',
          priority: 'medium',
          title: 'You\'re on fire!',
          description: 'You\'ve been very active. Consider creating premium content',
          actionable: true,
          actions: [{
            type: 'create',
            label: 'Create premium spot',
            data: { suggested: true },
          }],
          relevanceScore: 0.7,
        });
      }

      // Content type preferences
      if (preferredContentTypes.includes('spot')) {
        suggestions.push({
          id: `preferred-spots-${Date.now()}`,
          type: 'content',
          priority: 'low',
          title: 'More spots for you',
          description: 'Based on your activity, you might enjoy these new spots',
          actionable: true,
          actions: [{
            type: 'browse',
            label: 'Browse spots',
            data: { contentType: 'spot' },
          }],
          relevanceScore: 0.5,
        });
      }

      // Interaction patterns
      if (interactionPatterns.includes('like') && !interactionPatterns.includes('comment')) {
        suggestions.push({
          id: `engage-more-${Date.now()}`,
          type: 'content',
          priority: 'low',
          title: 'Share your thoughts',
          description: 'You like a lot of content. Consider adding comments to engage more',
          actionable: true,
          actions: [{
            type: 'engage',
            label: 'Comment on content',
            data: { action: 'comment' },
          }],
          relevanceScore: 0.4,
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Error generating behavior suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate safety and wellness suggestions
   */
  private async generateSafetySuggestions(contextData: ContextData): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];

    try {
      const { hour } = contextData.timeContext;
      const { sessionDuration } = contextData.behaviorContext;

      // Late night safety
      if (hour >= 22 || hour <= 5) {
        suggestions.push({
          id: `late-night-safety-${Date.now()}`,
          type: 'safety',
          priority: 'high',
          title: 'Stay safe at night',
          description: 'Be extra cautious when meeting new people at night',
          actionable: false,
          relevanceScore: 0.8,
        });
      }

      // Long session warning
      if (sessionDuration > 60) {
        suggestions.push({
          id: `long-session-${Date.now()}`,
          type: 'safety',
          priority: 'medium',
          title: 'Take a break',
          description: 'You\'ve been active for a while. Consider taking a break',
          actionable: true,
          actions: [{
            type: 'break',
            label: 'Take a break',
            data: { duration: sessionDuration },
          }],
          relevanceScore: 0.6,
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Error generating safety suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate behavioral insights
   */
  private async generateBehaviorInsights(userId: string, timeframe: string): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];

    try {
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      
      // Activity pattern analysis
      const activityQuery = `
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as activity_count
        FROM user_interactions
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY activity_count DESC
      `;
      
      const activityResult = await this.em.getConnection().execute(activityQuery, [userId]);
      
      if (activityResult.length > 0) {
        const peakHour = activityResult[0].hour;
        const timeDescription = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';
        
        insights.push({
          category: 'behavioral',
          insight: `You are most active during ${timeDescription} hours`,
          confidence: 0.8,
          evidence: [`Peak activity at ${peakHour}:00 with ${activityResult[0].activity_count} interactions`],
          recommendations: [`Schedule important activities during ${timeDescription} for better engagement`],
        });
      }

      return insights;
    } catch (error) {
      this.logger.error(`Error generating behavior insights: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate social insights
   */
  private async generateSocialInsights(userId: string, timeframe: string): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];

    try {
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      
      // Social connection analysis
      const connectionQuery = `
        SELECT COUNT(*) as spark_count
        FROM sparks
        WHERE (user1_id = $1 OR user2_id = $1)
        AND created_at >= NOW() - INTERVAL '${days} days'
      `;
      
      const connectionResult = await this.em.getConnection().execute(connectionQuery, [userId]);
      const sparkCount = parseInt(connectionResult[0]?.spark_count || '0');
      
      if (sparkCount > 0) {
        insights.push({
          category: 'social',
          insight: `You made ${sparkCount} new connections this ${timeframe}`,
          confidence: 0.9,
          evidence: [`${sparkCount} spark connections formed`],
          recommendations: ['Continue engaging with your network to maintain connections'],
        });
      }

      return insights;
    } catch (error) {
      this.logger.error(`Error generating social insights: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate spatial insights
   */
  private async generateSpatialInsights(userId: string, timeframe: string): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];

    try {
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      
      // Location diversity analysis
      const locationQuery = `
        SELECT 
          ROUND(latitude::numeric, 3) as lat_rounded,
          ROUND(longitude::numeric, 3) as lng_rounded,
          COUNT(*) as visit_count
        FROM signal_spots
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY lat_rounded, lng_rounded
      `;
      
      const locationResult = await this.em.getConnection().execute(locationQuery, [userId]);
      
      if (locationResult.length > 0) {
        const uniqueLocations = locationResult.length;
        const totalVisits = locationResult.reduce((sum, loc) => sum + parseInt(loc.visit_count), 0);
        
        insights.push({
          category: 'spatial',
          insight: `You visited ${uniqueLocations} unique locations this ${timeframe}`,
          confidence: 0.8,
          evidence: [`${totalVisits} total activities across ${uniqueLocations} locations`],
          recommendations: uniqueLocations < 3 ? ['Try exploring new areas to discover different communities'] : ['Great location diversity! Keep exploring'],
        });
      }

      return insights;
    } catch (error) {
      this.logger.error(`Error generating spatial insights: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate temporal insights
   */
  private async generateTemporalInsights(userId: string, timeframe: string): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];

    try {
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      
      // Time pattern analysis
      const timeQuery = `
        SELECT 
          EXTRACT(DOW FROM created_at) as day_of_week,
          COUNT(*) as activity_count
        FROM user_interactions
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY day_of_week
        ORDER BY activity_count DESC
      `;
      
      const timeResult = await this.em.getConnection().execute(timeQuery, [userId]);
      
      if (timeResult.length > 0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mostActiveDay = dayNames[timeResult[0].day_of_week];
        
        insights.push({
          category: 'temporal',
          insight: `You are most active on ${mostActiveDay}s`,
          confidence: 0.7,
          evidence: [`${timeResult[0].activity_count} activities on ${mostActiveDay}s`],
          recommendations: [`Plan important activities on ${mostActiveDay}s for better engagement`],
        });
      }

      return insights;
    } catch (error) {
      this.logger.error(`Error generating temporal insights: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if current time is optimal for engagement
   */
  private isOptimalEngagementTime(contextData: ContextData): boolean {
    const { hour, isWeekend } = contextData.timeContext;
    const { activityLevel } = contextData.behaviorContext;
    
    // Peak hours: 8-10 AM, 12-2 PM, 6-8 PM
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20);
    
    // Weekend mornings are good for leisure activities
    const isWeekendMorning = isWeekend && hour >= 9 && hour <= 11;
    
    // User is already active
    const isUserActive = activityLevel === 'high' || activityLevel === 'medium';
    
    return (isPeakHour || isWeekendMorning) && isUserActive;
  }

  /**
   * Generate location-based notifications
   */
  private async generateLocationNotifications(contextData: ContextData): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];

    if (!contextData.currentLocation) return notifications;

    try {
      // Check for events or high activity in the area
      const activityQuery = `
        SELECT COUNT(*) as recent_activity
        FROM signal_spots
        WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          500
        )
      `;
      
      const activityResult = await this.em.getConnection().execute(activityQuery, [
        contextData.currentLocation.longitude,
        contextData.currentLocation.latitude
      ]);
      
      const recentActivity = parseInt(activityResult[0]?.recent_activity || '0');
      
      if (recentActivity > 3) {
        notifications.push({
          id: `high-activity-area-${Date.now()}`,
          type: 'alert',
          title: 'Active area detected',
          body: `${recentActivity} signal spots created nearby in the last hour`,
          priority: 0.7,
          timing: 'immediate',
          contextTriggers: ['location_activity', 'recent_spots'],
        });
      }

      return notifications;
    } catch (error) {
      this.logger.error(`Error generating location notifications: ${error.message}`);
      return [];
    }
  }

  /**
   * Find popular spots nearby
   */
  private async findPopularNearbySpots(location: { latitude: number; longitude: number }): Promise<any[]> {
    try {
      const popularQuery = `
        SELECT id, title, latitude, longitude, like_count, reply_count
        FROM signal_spots
        WHERE status = 'active'
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          500
        )
        ORDER BY (like_count + reply_count) DESC
        LIMIT 5
      `;
      
      return await this.em.getConnection().execute(popularQuery, [location.longitude, location.latitude]);
    } catch (error) {
      this.logger.error(`Error finding popular nearby spots: ${error.message}`);
      return [];
    }
  }

  /**
   * Find historical spots for user
   */
  private async findHistoricalSpots(location: { latitude: number; longitude: number }): Promise<any[]> {
    try {
      const historicalQuery = `
        SELECT id, title, latitude, longitude, created_at
        FROM signal_spots
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          1000
        )
        AND created_at < NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 3
      `;
      
      return await this.em.getConnection().execute(historicalQuery, [location.longitude, location.latitude]);
    } catch (error) {
      this.logger.error(`Error finding historical spots: ${error.message}`);
      return [];
    }
  }

  /**
   * Find nearby content for recommendations
   */
  private async findNearbyContent(contextData: ContextData): Promise<Array<{ contentId: string; contentType: 'spot' | 'spark'; reason: string; score: number }>> {
    const recommendations = [];

    if (!contextData.currentLocation) return recommendations;

    try {
      const nearbySpots = await this.findPopularNearbySpots(contextData.currentLocation);
      
      nearbySpots.forEach(spot => {
        recommendations.push({
          contentId: spot.id,
          contentType: 'spot' as const,
          reason: 'Popular spot nearby',
          score: 0.8,
        });
      });

      return recommendations;
    } catch (error) {
      this.logger.error(`Error finding nearby content: ${error.message}`);
      return [];
    }
  }

  /**
   * Find time-based content recommendations
   */
  private async findTimeBasedContent(contextData: ContextData): Promise<Array<{ contentId: string; contentType: 'spot' | 'spark'; reason: string; score: number }>> {
    const recommendations = [];

    try {
      const { hour } = contextData.timeContext;
      
      // Get content that was popular at this time historically
      const timeBasedQuery = `
        SELECT id, title, like_count + reply_count as engagement
        FROM signal_spots
        WHERE EXTRACT(HOUR FROM created_at) = $1
        AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY engagement DESC
        LIMIT 5
      `;
      
      const timeBasedSpots = await this.em.getConnection().execute(timeBasedQuery, [hour]);
      
      timeBasedSpots.forEach(spot => {
        recommendations.push({
          contentId: spot.id,
          contentType: 'spot' as const,
          reason: 'Popular at this time',
          score: 0.6,
        });
      });

      return recommendations;
    } catch (error) {
      this.logger.error(`Error finding time-based content: ${error.message}`);
      return [];
    }
  }

  /**
   * Find social content recommendations
   */
  private async findSocialContent(contextData: ContextData): Promise<Array<{ contentId: string; contentType: 'spot' | 'spark'; reason: string; score: number }>> {
    const recommendations = [];

    try {
      // Get content from users with recent connections
      const socialQuery = `
        SELECT s.id, s.title, 'connection' as reason
        FROM signal_spots s
        JOIN sparks sp ON (s.user_id = sp.user1_id OR s.user_id = sp.user2_id)
        WHERE (sp.user1_id = $1 OR sp.user2_id = $1)
        AND s.user_id != $1
        AND s.created_at >= NOW() - INTERVAL '24 hours'
        AND sp.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY s.created_at DESC
        LIMIT 5
      `;
      
      const socialSpots = await this.em.getConnection().execute(socialQuery, [contextData.userId]);
      
      socialSpots.forEach(spot => {
        recommendations.push({
          contentId: spot.id,
          contentType: 'spot' as const,
          reason: 'From your connections',
          score: 0.7,
        });
      });

      return recommendations;
    } catch (error) {
      this.logger.error(`Error finding social content: ${error.message}`);
      return [];
    }
  }
}