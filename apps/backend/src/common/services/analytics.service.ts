import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../entities/user.entity';
import { SignalSpot } from '../../entities/signal-spot.entity';

export interface AnalyticsEvent {
  eventType: 'user_action' | 'system_event' | 'performance_metric' | 'error_event';
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties?: Record<string, any>;
  metadata?: {
    userAgent?: string;
    ip?: string;
    location?: { latitude: number; longitude: number };
    device?: string;
    platform?: string;
  };
}

export interface AnalyticsMetrics {
  timeframe: 'hour' | 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  metrics: {
    userMetrics: {
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      retentionRate: number;
      avgSessionDuration: number;
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
    };
    contentMetrics: {
      totalSpots: number;
      spotsCreated: number;
      totalSparks: number;
      sparksCreated: number;
      totalInteractions: number;
      avgEngagementRate: number;
      contentDistribution: Record<string, number>;
    };
    performanceMetrics: {
      avgResponseTime: number;
      errorRate: number;
      throughput: number;
      uptime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    locationMetrics: {
      topLocations: Array<{
        latitude: number;
        longitude: number;
        count: number;
        city?: string;
      }>;
      locationDistribution: Record<string, number>;
      averageRadius: number;
    };
    socialMetrics: {
      totalConnections: number;
      connectionsCreated: number;
      avgConnectionsPerUser: number;
      networkDensity: number;
      influencers: Array<{
        userId: string;
        username: string;
        influence: number;
      }>;
    };
  };
}

export interface AnalyticsReport {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    keyMetrics: Record<string, number>;
    trends: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
      significance: 'low' | 'medium' | 'high';
    }>;
    insights: string[];
    recommendations: string[];
  };
  sections: {
    userActivity: AnalyticsMetrics['metrics']['userMetrics'];
    contentActivity: AnalyticsMetrics['metrics']['contentMetrics'];
    technicalHealth: AnalyticsMetrics['metrics']['performanceMetrics'];
    locationInsights: AnalyticsMetrics['metrics']['locationMetrics'];
    socialNetwork: AnalyticsMetrics['metrics']['socialMetrics'];
  };
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'heatmap';
    title: string;
    data: any[];
    config: Record<string, any>;
  }>;
}

export interface RealTimeMetrics {
  timestamp: Date;
  activeUsers: number;
  recentActivity: Array<{
    type: 'spot_created' | 'spark_formed' | 'interaction';
    count: number;
    lastMinute: number;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    errorRate: number;
    alertsActive: number;
  };
  locationActivity: Array<{
    latitude: number;
    longitude: number;
    activityCount: number;
    recentSpots: number;
  }>;
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly eventQueue: AnalyticsEvent[] = [];
  private readonly maxQueueSize = 1000;

  constructor(private readonly em: EntityManager) {}

  /**
   * Track an analytics event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.logger.debug(`Tracking event: ${event.eventType} - ${event.category}.${event.action}`);

    // Add to in-memory queue
    this.eventQueue.push(analyticsEvent);

    // Keep queue size manageable
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift();
    }

    // In a real implementation, this would be persisted to a database or sent to an analytics service
    try {
      await this.persistEvent(analyticsEvent);
    } catch (error) {
      this.logger.error(`Error persisting analytics event: ${error.message}`);
    }
  }

  /**
   * Get analytics metrics for a specific timeframe
   */
  async getAnalyticsMetrics(
    timeframe: 'hour' | 'day' | 'week' | 'month',
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsMetrics> {
    this.logger.log(`Getting analytics metrics for ${timeframe}`);

    const end = endDate || new Date();
    const start = startDate || this.getStartDate(timeframe, end);

    try {
      const [userMetrics, contentMetrics, performanceMetrics, locationMetrics, socialMetrics] = await Promise.all([
        this.getUserMetrics(start, end),
        this.getContentMetrics(start, end),
        this.getPerformanceMetrics(start, end),
        this.getLocationMetrics(start, end),
        this.getSocialMetrics(start, end),
      ]);

      return {
        timeframe,
        startDate: start,
        endDate: end,
        metrics: {
          userMetrics,
          contentMetrics,
          performanceMetrics,
          locationMetrics,
          socialMetrics,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting analytics metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a comprehensive analytics report
   */
  async generateReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsReport> {
    this.logger.log(`Generating ${reportType} analytics report`);

    const end = endDate || new Date();
    const start = startDate || this.getStartDate(reportType, end);

    try {
      const timeframe = reportType === 'daily' ? 'day' : reportType === 'weekly' ? 'week' : reportType === 'monthly' ? 'month' : 'day';
      const metrics = await this.getAnalyticsMetrics(timeframe, start, end);
      const trends = await this.calculateTrends(metrics);
      const insights = await this.generateInsights(metrics);
      const recommendations = await this.generateRecommendations(metrics);
      const charts = await this.generateCharts(metrics);

      return {
        reportType,
        generatedAt: new Date(),
        period: { startDate: start, endDate: end },
        summary: {
          keyMetrics: this.extractKeyMetrics(metrics),
          trends,
          insights,
          recommendations,
        },
        sections: {
          userActivity: metrics.metrics.userMetrics,
          contentActivity: metrics.metrics.contentMetrics,
          technicalHealth: metrics.metrics.performanceMetrics,
          locationInsights: metrics.metrics.locationMetrics,
          socialNetwork: metrics.metrics.socialMetrics,
        },
        charts,
      };
    } catch (error) {
      this.logger.error(`Error generating analytics report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get real-time metrics dashboard
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    this.logger.debug('Getting real-time metrics');

    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      const [activeUsers, recentActivity, systemHealth, locationActivity, alerts] = await Promise.all([
        this.getActiveUsersCount(),
        this.getRecentActivity(fiveMinutesAgo),
        this.getSystemHealth(),
        this.getLocationActivity(fiveMinutesAgo),
        this.getActiveAlerts(),
      ]);

      return {
        timestamp: now,
        activeUsers,
        recentActivity,
        systemHealth,
        locationActivity,
        alerts,
      };
    } catch (error) {
      this.logger.error(`Error getting real-time metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(userId: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    activitySummary: {
      spotsCreated: number;
      sparksFormed: number;
      interactions: number;
      avgDailyActivity: number;
    };
    engagementMetrics: {
      likesReceived: number;
      commentsReceived: number;
      sharesReceived: number;
      engagementRate: number;
    };
    socialMetrics: {
      connections: number;
      networkReach: number;
      influenceScore: number;
    };
    locationMetrics: {
      uniqueLocations: number;
      favoriteAreas: Array<{
        latitude: number;
        longitude: number;
        visitCount: number;
      }>;
      explorationRadius: number;
    };
    trends: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
    }>;
  }> {
    this.logger.log(`Getting user analytics for ${userId} over ${timeframe}`);

    try {
      const startDate = this.getStartDate(timeframe, new Date());
      const endDate = new Date();

      const [activitySummary, engagementMetrics, socialMetrics, locationMetrics, trends] = await Promise.all([
        this.getUserActivitySummary(userId, startDate, endDate),
        this.getUserEngagementMetrics(userId, startDate, endDate),
        this.getUserSocialMetrics(userId, startDate, endDate),
        this.getUserLocationMetrics(userId, startDate, endDate),
        this.getUserTrends(userId, timeframe),
      ]);

      return {
        activitySummary,
        engagementMetrics,
        socialMetrics,
        locationMetrics,
        trends,
      };
    } catch (error) {
      this.logger.error(`Error getting user analytics for ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track user interaction
   */
  async trackUserInteraction(userId: string, action: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'user_action',
      category: 'interaction',
      action,
      userId,
      properties,
    });
  }

  /**
   * Track performance metric
   */
  async trackPerformanceMetric(metric: string, value: number, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'performance_metric',
      category: 'performance',
      action: metric,
      value,
      properties,
    });
  }

  /**
   * Track system error
   */
  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'error_event',
      category: 'system',
      action: 'error',
      label: error.message,
      properties: {
        stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Get system health status
   */
  async getSystemHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      responseTime?: number;
    }>;
    uptime: number;
    lastChecked: Date;
  }> {
    this.logger.debug('Checking system health status');

    try {
      const checks = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkMemoryUsage(),
        this.checkResponseTime(),
        this.checkErrorRate(),
      ]);

      const failedChecks = checks.filter(check => check.status === 'fail');
      const warningChecks = checks.filter(check => check.status === 'warn');

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (failedChecks.length > 0) {
        status = 'critical';
      } else if (warningChecks.length > 0) {
        status = 'warning';
      }

      return {
        status,
        checks,
        uptime: process.uptime(),
        lastChecked: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error checking system health: ${error.message}`);
      return {
        status: 'critical',
        checks: [{
          name: 'health_check',
          status: 'fail',
          message: 'Health check failed',
        }],
        uptime: 0,
        lastChecked: new Date(),
      };
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(
    format: 'json' | 'csv' | 'excel',
    timeframe: 'day' | 'week' | 'month',
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    data: any;
    filename: string;
    mimeType: string;
  }> {
    this.logger.log(`Exporting analytics data as ${format} for ${timeframe}`);

    try {
      const metrics = await this.getAnalyticsMetrics(timeframe, startDate, endDate);
      
      const filename = `analytics_${timeframe}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      switch (format) {
        case 'json':
          return {
            data: JSON.stringify(metrics, null, 2),
            filename,
            mimeType: 'application/json',
          };
        case 'csv':
          return {
            data: this.convertToCSV(metrics),
            filename,
            mimeType: 'text/csv',
          };
        case 'excel':
          return {
            data: this.convertToExcel(metrics),
            filename,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      this.logger.error(`Error exporting analytics data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Persist analytics event (placeholder implementation)
   */
  private async persistEvent(event: AnalyticsEvent): Promise<void> {
    // In a real implementation, this would save to a database or send to an analytics service
    // For now, we'll just log it
    this.logger.debug(`Persisting event: ${JSON.stringify(event)}`);
  }

  /**
   * Get start date for timeframe
   */
  private getStartDate(timeframe: string, endDate: Date): Date {
    const start = new Date(endDate);
    
    switch (timeframe) {
      case 'hour':
        start.setHours(start.getHours() - 1);
        break;
      case 'day':
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return start;
  }

  /**
   * Get user metrics for timeframe
   */
  private async getUserMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics['metrics']['userMetrics']> {
    try {
      const totalUsersQuery = 'SELECT COUNT(*) as count FROM users';
      const activeUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_interactions 
        WHERE created_at BETWEEN $1 AND $2
      `;
      const newUsersQuery = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at BETWEEN $1 AND $2
      `;

      const [totalResult, activeResult, newResult] = await Promise.all([
        this.em.getConnection().execute(totalUsersQuery),
        this.em.getConnection().execute(activeUsersQuery, [startDate, endDate]),
        this.em.getConnection().execute(newUsersQuery, [startDate, endDate]),
      ]);

      const totalUsers = parseInt(totalResult[0]?.count || '0');
      const activeUsers = parseInt(activeResult[0]?.count || '0');
      const newUsers = parseInt(newResult[0]?.count || '0');

      return {
        totalUsers,
        activeUsers,
        newUsers,
        retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        avgSessionDuration: 15, // Placeholder
        dailyActiveUsers: activeUsers,
        weeklyActiveUsers: activeUsers,
        monthlyActiveUsers: activeUsers,
      };
    } catch (error) {
      this.logger.error(`Error getting user metrics: ${error.message}`);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        retentionRate: 0,
        avgSessionDuration: 0,
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
      };
    }
  }

  /**
   * Get content metrics for timeframe
   */
  private async getContentMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics['metrics']['contentMetrics']> {
    try {
      const spotsQuery = `
        SELECT 
          COUNT(*) as total_spots,
          COUNT(CASE WHEN created_at BETWEEN $1 AND $2 THEN 1 END) as spots_created
        FROM signal_spots
      `;
      const sparksQuery = `
        SELECT 
          COUNT(*) as total_sparks,
          COUNT(CASE WHEN created_at BETWEEN $1 AND $2 THEN 1 END) as sparks_created
        FROM sparks
      `;
      const interactionsQuery = `
        SELECT COUNT(*) as total_interactions
        FROM user_interactions
        WHERE created_at BETWEEN $1 AND $2
      `;

      const [spotsResult, sparksResult, interactionsResult] = await Promise.all([
        this.em.getConnection().execute(spotsQuery, [startDate, endDate]),
        this.em.getConnection().execute(sparksQuery, [startDate, endDate]),
        this.em.getConnection().execute(interactionsQuery, [startDate, endDate]),
      ]);

      const spotsData = spotsResult[0] || {};
      const sparksData = sparksResult[0] || {};
      const totalInteractions = parseInt(interactionsResult[0]?.total_interactions || '0');

      return {
        totalSpots: parseInt(spotsData.total_spots || '0'),
        spotsCreated: parseInt(spotsData.spots_created || '0'),
        totalSparks: parseInt(sparksData.total_sparks || '0'),
        sparksCreated: parseInt(sparksData.sparks_created || '0'),
        totalInteractions,
        avgEngagementRate: 0, // Placeholder
        contentDistribution: {
          spots: parseInt(spotsData.spots_created || '0'),
          sparks: parseInt(sparksData.sparks_created || '0'),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting content metrics: ${error.message}`);
      return {
        totalSpots: 0,
        spotsCreated: 0,
        totalSparks: 0,
        sparksCreated: 0,
        totalInteractions: 0,
        avgEngagementRate: 0,
        contentDistribution: {},
      };
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics['metrics']['performanceMetrics']> {
    // In a real implementation, this would query performance monitoring data
    return {
      avgResponseTime: 150, // ms
      errorRate: 0.01, // 1%
      throughput: 1000, // requests per hour
      uptime: 99.9, // percentage
      memoryUsage: 75, // percentage
      cpuUsage: 45, // percentage
    };
  }

  /**
   * Get location metrics
   */
  private async getLocationMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics['metrics']['locationMetrics']> {
    try {
      const topLocationsQuery = `
        SELECT 
          ROUND(latitude::numeric, 3) as latitude,
          ROUND(longitude::numeric, 3) as longitude,
          COUNT(*) as count
        FROM signal_spots
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY latitude, longitude
        ORDER BY count DESC
        LIMIT 10
      `;

      const topLocationsResult = await this.em.getConnection().execute(topLocationsQuery, [startDate, endDate]);

      const topLocations = topLocationsResult.map(row => ({
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        count: parseInt(row.count),
      }));

      return {
        topLocations,
        locationDistribution: {},
        averageRadius: 1000, // meters
      };
    } catch (error) {
      this.logger.error(`Error getting location metrics: ${error.message}`);
      return {
        topLocations: [],
        locationDistribution: {},
        averageRadius: 0,
      };
    }
  }

  /**
   * Get social metrics
   */
  private async getSocialMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics['metrics']['socialMetrics']> {
    try {
      const connectionsQuery = `
        SELECT 
          COUNT(*) as total_connections,
          COUNT(CASE WHEN created_at BETWEEN $1 AND $2 THEN 1 END) as connections_created
        FROM sparks
      `;

      const connectionsResult = await this.em.getConnection().execute(connectionsQuery, [startDate, endDate]);
      const connectionsData = connectionsResult[0] || {};

      const totalConnections = parseInt(connectionsData.total_connections || '0');
      const connectionsCreated = parseInt(connectionsData.connections_created || '0');

      return {
        totalConnections,
        connectionsCreated,
        avgConnectionsPerUser: 0, // Placeholder
        networkDensity: 0, // Placeholder
        influencers: [], // Placeholder
      };
    } catch (error) {
      this.logger.error(`Error getting social metrics: ${error.message}`);
      return {
        totalConnections: 0,
        connectionsCreated: 0,
        avgConnectionsPerUser: 0,
        networkDensity: 0,
        influencers: [],
      };
    }
  }

  /**
   * Calculate trends in metrics
   */
  private async calculateTrends(metrics: AnalyticsMetrics): Promise<Array<{
    metric: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    significance: 'low' | 'medium' | 'high';
  }>> {
    // Placeholder implementation - in reality would compare with previous period
    return [
      {
        metric: 'Active Users',
        trend: 'up',
        change: 15.5,
        significance: 'high',
      },
      {
        metric: 'Content Creation',
        trend: 'up',
        change: 8.2,
        significance: 'medium',
      },
      {
        metric: 'Response Time',
        trend: 'down',
        change: -3.1,
        significance: 'low',
      },
    ];
  }

  /**
   * Generate insights from metrics
   */
  private async generateInsights(metrics: AnalyticsMetrics): Promise<string[]> {
    const insights: string[] = [];

    if (metrics.metrics.userMetrics.activeUsers > 0) {
      insights.push(`${metrics.metrics.userMetrics.activeUsers} users were active during this period`);
    }

    if (metrics.metrics.contentMetrics.spotsCreated > 0) {
      insights.push(`${metrics.metrics.contentMetrics.spotsCreated} new signal spots were created`);
    }

    if (metrics.metrics.socialMetrics.connectionsCreated > 0) {
      insights.push(`${metrics.metrics.socialMetrics.connectionsCreated} new connections were formed`);
    }

    return insights;
  }

  /**
   * Generate recommendations from metrics
   */
  private async generateRecommendations(metrics: AnalyticsMetrics): Promise<string[]> {
    const recommendations: string[] = [];

    if (metrics.metrics.userMetrics.retentionRate < 50) {
      recommendations.push('Consider implementing user retention strategies');
    }

    if (metrics.metrics.performanceMetrics.avgResponseTime > 200) {
      recommendations.push('Response time could be improved with caching or optimization');
    }

    if (metrics.metrics.socialMetrics.avgConnectionsPerUser < 2) {
      recommendations.push('Encourage more social interactions with gamification');
    }

    return recommendations;
  }

  /**
   * Generate charts data
   */
  private async generateCharts(metrics: AnalyticsMetrics): Promise<AnalyticsReport['charts']> {
    return [
      {
        type: 'line',
        title: 'User Activity Over Time',
        data: [
          { date: '2024-01-01', activeUsers: 100 },
          { date: '2024-01-02', activeUsers: 120 },
          { date: '2024-01-03', activeUsers: 150 },
        ],
        config: {
          xAxis: 'date',
          yAxis: 'activeUsers',
          color: '#007AFF',
        },
      },
      {
        type: 'bar',
        title: 'Content Creation',
        data: [
          { type: 'Spots', count: metrics.metrics.contentMetrics.spotsCreated },
          { type: 'Sparks', count: metrics.metrics.contentMetrics.sparksCreated },
        ],
        config: {
          xAxis: 'type',
          yAxis: 'count',
          color: '#34C759',
        },
      },
    ];
  }

  /**
   * Extract key metrics for summary
   */
  private extractKeyMetrics(metrics: AnalyticsMetrics): Record<string, number> {
    return {
      activeUsers: metrics.metrics.userMetrics.activeUsers,
      spotsCreated: metrics.metrics.contentMetrics.spotsCreated,
      sparksCreated: metrics.metrics.contentMetrics.sparksCreated,
      avgResponseTime: metrics.metrics.performanceMetrics.avgResponseTime,
      uptime: metrics.metrics.performanceMetrics.uptime,
    };
  }

  /**
   * Get active users count
   */
  private async getActiveUsersCount(): Promise<number> {
    try {
      const query = `
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_interactions 
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
      `;
      const result = await this.em.getConnection().execute(query);
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      this.logger.error(`Error getting active users count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity(since: Date): Promise<RealTimeMetrics['recentActivity']> {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      
      const spotQuery = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_count
        FROM signal_spots
        WHERE created_at >= $2
      `;
      
      const sparkQuery = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_count
        FROM sparks
        WHERE created_at >= $2
      `;
      
      const interactionQuery = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_count
        FROM user_interactions
        WHERE created_at >= $2
      `;

      const [spotResult, sparkResult, interactionResult] = await Promise.all([
        this.em.getConnection().execute(spotQuery, [oneMinuteAgo, since]),
        this.em.getConnection().execute(sparkQuery, [oneMinuteAgo, since]),
        this.em.getConnection().execute(interactionQuery, [oneMinuteAgo, since]),
      ]);

      return [
        {
          type: 'spot_created',
          count: parseInt(spotResult[0]?.total_count || '0'),
          lastMinute: parseInt(spotResult[0]?.recent_count || '0'),
        },
        {
          type: 'spark_formed',
          count: parseInt(sparkResult[0]?.total_count || '0'),
          lastMinute: parseInt(sparkResult[0]?.recent_count || '0'),
        },
        {
          type: 'interaction',
          count: parseInt(interactionResult[0]?.total_count || '0'),
          lastMinute: parseInt(interactionResult[0]?.recent_count || '0'),
        },
      ];
    } catch (error) {
      this.logger.error(`Error getting recent activity: ${error.message}`);
      return [];
    }
  }

  /**
   * Get system health
   */
  private async getSystemHealth(): Promise<RealTimeMetrics['systemHealth']> {
    try {
      const responseTime = 150; // Placeholder
      const errorRate = 0.01; // Placeholder
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (errorRate > 0.05) status = 'critical';
      else if (errorRate > 0.02 || responseTime > 300) status = 'warning';

      return {
        status,
        responseTime,
        errorRate,
        alertsActive: 0,
      };
    } catch (error) {
      this.logger.error(`Error getting system health: ${error.message}`);
      return {
        status: 'critical',
        responseTime: 0,
        errorRate: 1,
        alertsActive: 1,
      };
    }
  }

  /**
   * Get location activity
   */
  private async getLocationActivity(since: Date): Promise<RealTimeMetrics['locationActivity']> {
    try {
      const query = `
        SELECT 
          ROUND(latitude::numeric, 2) as latitude,
          ROUND(longitude::numeric, 2) as longitude,
          COUNT(*) as activity_count,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_spots
        FROM signal_spots
        WHERE created_at >= $1
        GROUP BY latitude, longitude
        ORDER BY activity_count DESC
        LIMIT 10
      `;

      const result = await this.em.getConnection().execute(query, [since]);
      
      return result.map(row => ({
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        activityCount: parseInt(row.activity_count),
        recentSpots: parseInt(row.recent_spots),
      }));
    } catch (error) {
      this.logger.error(`Error getting location activity: ${error.message}`);
      return [];
    }
  }

  /**
   * Get active alerts
   */
  private async getActiveAlerts(): Promise<RealTimeMetrics['alerts']> {
    // Placeholder implementation
    return [];
  }

  /**
   * Health check methods
   */
  private async checkDatabaseHealth(): Promise<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string; responseTime?: number }> {
    const startTime = Date.now();
    
    try {
      await this.em.getConnection().execute('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'Database',
        status: responseTime < 100 ? 'pass' : 'warn',
        message: `Database connection ${responseTime < 100 ? 'healthy' : 'slow'}`,
        responseTime,
      };
    } catch (error) {
      return {
        name: 'Database',
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  private async checkMemoryUsage(): Promise<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string }> {
    const memoryUsage = process.memoryUsage();
    const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024;
    const totalMemoryMB = memoryUsage.heapTotal / 1024 / 1024;
    const usagePercent = (usedMemoryMB / totalMemoryMB) * 100;

    let status: 'pass' | 'fail' | 'warn' = 'pass';
    let message = `Memory usage: ${usagePercent.toFixed(1)}%`;

    if (usagePercent > 90) {
      status = 'fail';
      message = `High memory usage: ${usagePercent.toFixed(1)}%`;
    } else if (usagePercent > 75) {
      status = 'warn';
      message = `Elevated memory usage: ${usagePercent.toFixed(1)}%`;
    }

    return { name: 'Memory', status, message };
  }

  private async checkResponseTime(): Promise<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string; responseTime?: number }> {
    // Placeholder - would measure actual response times
    const avgResponseTime = 150;

    let status: 'pass' | 'fail' | 'warn' = 'pass';
    let message = `Average response time: ${avgResponseTime}ms`;

    if (avgResponseTime > 500) {
      status = 'fail';
      message = `Slow response time: ${avgResponseTime}ms`;
    } else if (avgResponseTime > 300) {
      status = 'warn';
      message = `Elevated response time: ${avgResponseTime}ms`;
    }

    return { name: 'Response Time', status, message, responseTime: avgResponseTime };
  }

  private async checkErrorRate(): Promise<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string }> {
    // Placeholder - would measure actual error rates
    const errorRate = 0.01; // 1%

    let status: 'pass' | 'fail' | 'warn' = 'pass';
    let message = `Error rate: ${(errorRate * 100).toFixed(2)}%`;

    if (errorRate > 0.05) {
      status = 'fail';
      message = `High error rate: ${(errorRate * 100).toFixed(2)}%`;
    } else if (errorRate > 0.02) {
      status = 'warn';
      message = `Elevated error rate: ${(errorRate * 100).toFixed(2)}%`;
    }

    return { name: 'Error Rate', status, message };
  }

  /**
   * User-specific analytics methods
   */
  private async getUserActivitySummary(userId: string, startDate: Date, endDate: Date): Promise<{
    spotsCreated: number;
    sparksFormed: number;
    interactions: number;
    avgDailyActivity: number;
  }> {
    try {
      const spotsQuery = `
        SELECT COUNT(*) as count 
        FROM signal_spots 
        WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
      `;
      
      const sparksQuery = `
        SELECT COUNT(*) as count 
        FROM sparks 
        WHERE (user1_id = $1 OR user2_id = $1) AND created_at BETWEEN $2 AND $3
      `;
      
      const interactionsQuery = `
        SELECT COUNT(*) as count 
        FROM user_interactions 
        WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
      `;

      const [spotsResult, sparksResult, interactionsResult] = await Promise.all([
        this.em.getConnection().execute(spotsQuery, [userId, startDate, endDate]),
        this.em.getConnection().execute(sparksQuery, [userId, startDate, endDate]),
        this.em.getConnection().execute(interactionsQuery, [userId, startDate, endDate]),
      ]);

      const spotsCreated = parseInt(spotsResult[0]?.count || '0');
      const sparksFormed = parseInt(sparksResult[0]?.count || '0');
      const interactions = parseInt(interactionsResult[0]?.count || '0');

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const avgDailyActivity = (spotsCreated + sparksFormed + interactions) / daysDiff;

      return {
        spotsCreated,
        sparksFormed,
        interactions,
        avgDailyActivity,
      };
    } catch (error) {
      this.logger.error(`Error getting user activity summary: ${error.message}`);
      return { spotsCreated: 0, sparksFormed: 0, interactions: 0, avgDailyActivity: 0 };
    }
  }

  private async getUserEngagementMetrics(userId: string, startDate: Date, endDate: Date): Promise<{
    likesReceived: number;
    commentsReceived: number;
    sharesReceived: number;
    engagementRate: number;
  }> {
    try {
      const engagementQuery = `
        SELECT 
          COUNT(CASE WHEN ui.action_type = 'like' THEN 1 END) as likes_received,
          COUNT(CASE WHEN ui.action_type = 'comment' THEN 1 END) as comments_received,
          COUNT(CASE WHEN ui.action_type = 'share' THEN 1 END) as shares_received
        FROM user_interactions ui
        JOIN signal_spots s ON ui.content_id = s.id
        WHERE s.user_id = $1 
        AND ui.created_at BETWEEN $2 AND $3
        AND ui.content_type = 'spot'
      `;

      const result = await this.em.getConnection().execute(engagementQuery, [userId, startDate, endDate]);
      const engagementData = result[0] || {};

      const likesReceived = parseInt(engagementData.likes_received || '0');
      const commentsReceived = parseInt(engagementData.comments_received || '0');
      const sharesReceived = parseInt(engagementData.shares_received || '0');
      const totalEngagement = likesReceived + commentsReceived + sharesReceived;

      return {
        likesReceived,
        commentsReceived,
        sharesReceived,
        engagementRate: totalEngagement / Math.max(1, totalEngagement) * 100,
      };
    } catch (error) {
      this.logger.error(`Error getting user engagement metrics: ${error.message}`);
      return { likesReceived: 0, commentsReceived: 0, sharesReceived: 0, engagementRate: 0 };
    }
  }

  private async getUserSocialMetrics(userId: string, startDate: Date, endDate: Date): Promise<{
    connections: number;
    networkReach: number;
    influenceScore: number;
  }> {
    try {
      const connectionsQuery = `
        SELECT COUNT(*) as connections 
        FROM sparks 
        WHERE (user1_id = $1 OR user2_id = $1) AND created_at BETWEEN $2 AND $3
      `;

      const result = await this.em.getConnection().execute(connectionsQuery, [userId, startDate, endDate]);
      const connections = parseInt(result[0]?.connections || '0');

      return {
        connections,
        networkReach: connections * 2, // Placeholder calculation
        influenceScore: connections * 10, // Placeholder calculation
      };
    } catch (error) {
      this.logger.error(`Error getting user social metrics: ${error.message}`);
      return { connections: 0, networkReach: 0, influenceScore: 0 };
    }
  }

  private async getUserLocationMetrics(userId: string, startDate: Date, endDate: Date): Promise<{
    uniqueLocations: number;
    favoriteAreas: Array<{ latitude: number; longitude: number; visitCount: number }>;
    explorationRadius: number;
  }> {
    try {
      const locationQuery = `
        SELECT 
          ROUND(latitude::numeric, 3) as latitude,
          ROUND(longitude::numeric, 3) as longitude,
          COUNT(*) as visit_count
        FROM signal_spots
        WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
        GROUP BY latitude, longitude
        ORDER BY visit_count DESC
        LIMIT 5
      `;

      const result = await this.em.getConnection().execute(locationQuery, [userId, startDate, endDate]);
      
      const favoriteAreas = result.map(row => ({
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        visitCount: parseInt(row.visit_count),
      }));

      return {
        uniqueLocations: result.length,
        favoriteAreas,
        explorationRadius: 5000, // Placeholder
      };
    } catch (error) {
      this.logger.error(`Error getting user location metrics: ${error.message}`);
      return { uniqueLocations: 0, favoriteAreas: [], explorationRadius: 0 };
    }
  }

  private async getUserTrends(userId: string, timeframe: string): Promise<Array<{
    metric: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>> {
    // Placeholder implementation - would compare with previous period
    return [
      { metric: 'Activity', trend: 'up', change: 10 },
      { metric: 'Engagement', trend: 'stable', change: 0 },
      { metric: 'Connections', trend: 'up', change: 25 },
    ];
  }

  /**
   * Data export methods
   */
  private convertToCSV(data: any): string {
    // Placeholder CSV conversion
    return 'metric,value\nactive_users,100\nspots_created,50';
  }

  private convertToExcel(data: any): Buffer {
    // Placeholder Excel conversion - would use a library like exceljs
    return Buffer.from('Excel data placeholder');
  }
}