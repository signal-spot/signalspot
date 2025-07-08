import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Logger,
  ParseEnumPipe,
  ParseDatePipe,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import {
  AnalyticsService,
  AnalyticsEvent,
  AnalyticsMetrics,
  AnalyticsReport,
  RealTimeMetrics,
} from '../services/analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Track analytics event
   * POST /analytics/track
   */
  @Post('track')
  async trackEvent(
    @GetUser() user: User,
    @Body() event: Omit<AnalyticsEvent, 'timestamp' | 'userId'>,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Tracking event from user ${user.id}: ${event.category}.${event.action}`);
    
    try {
      await this.analyticsService.trackEvent({
        ...event,
        userId: user.id,
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error tracking event: ${error.message}`);
      throw new HttpException('Failed to track event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get analytics metrics (admin only)
   * GET /analytics/metrics?timeframe=week&startDate=2024-01-01&endDate=2024-01-07
   */
  @Get('metrics')
  @UseGuards(AdminGuard)
  async getAnalyticsMetrics(
    @Query('timeframe', new ParseEnumPipe(['hour', 'day', 'week', 'month'])) timeframe: 'hour' | 'day' | 'week' | 'month',
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
    @Query('endDate', new ParseDatePipe({ optional: true })) endDate?: Date,
  ): Promise<AnalyticsMetrics> {
    this.logger.log(`Analytics metrics request for ${timeframe}`);\n    
    try {
      return await this.analyticsService.getAnalyticsMetrics(timeframe, startDate, endDate);
    } catch (error) {
      this.logger.error(`Error getting analytics metrics: ${error.message}`);
      throw new HttpException('Failed to get analytics metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generate analytics report (admin only)
   * GET /analytics/report?type=weekly&startDate=2024-01-01&endDate=2024-01-07
   */
  @Get('report')
  @UseGuards(AdminGuard)
  async generateReport(
    @Query('type', new ParseEnumPipe(['daily', 'weekly', 'monthly', 'custom'])) reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
    @Query('endDate', new ParseDatePipe({ optional: true })) endDate?: Date,
  ): Promise<AnalyticsReport> {
    this.logger.log(`Analytics report request for ${reportType}`);
    
    try {
      return await this.analyticsService.generateReport(reportType, startDate, endDate);
    } catch (error) {
      this.logger.error(`Error generating analytics report: ${error.message}`);
      throw new HttpException('Failed to generate analytics report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get real-time metrics (admin only)
   * GET /analytics/realtime
   */
  @Get('realtime')
  @UseGuards(AdminGuard)
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    this.logger.log('Real-time metrics request');
    
    try {
      return await this.analyticsService.getRealTimeMetrics();
    } catch (error) {
      this.logger.error(`Error getting real-time metrics: ${error.message}`);
      throw new HttpException('Failed to get real-time metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user analytics for authenticated user
   * GET /analytics/user?timeframe=week
   */
  @Get('user')
  async getUserAnalytics(
    @GetUser() user: User,
    @Query('timeframe', new ParseEnumPipe(['day', 'week', 'month'], { optional: true })) timeframe?: 'day' | 'week' | 'month',
  ): Promise<{
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
    this.logger.log(`User analytics request from user ${user.id} for ${timeframe || 'week'}`);
    
    try {
      return await this.analyticsService.getUserAnalytics(user.id, timeframe || 'week');
    } catch (error) {
      this.logger.error(`Error getting user analytics: ${error.message}`);
      throw new HttpException('Failed to get user analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get system health status
   * GET /analytics/health
   */
  @Get('health')
  @UseGuards(AdminGuard)
  async getSystemHealth(): Promise<{
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
    this.logger.log('System health check request');
    
    try {
      return await this.analyticsService.getSystemHealthStatus();
    } catch (error) {
      this.logger.error(`Error getting system health: ${error.message}`);
      throw new HttpException('Failed to get system health', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Export analytics data (admin only)
   * GET /analytics/export?format=json&timeframe=week
   */
  @Get('export')
  @UseGuards(AdminGuard)
  async exportAnalyticsData(
    @Query('format', new ParseEnumPipe(['json', 'csv', 'excel'])) format: 'json' | 'csv' | 'excel',
    @Query('timeframe', new ParseEnumPipe(['day', 'week', 'month'])) timeframe: 'day' | 'week' | 'month',
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
    @Query('endDate', new ParseDatePipe({ optional: true })) endDate?: Date,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Analytics export request: ${format} format for ${timeframe}`);
    
    try {
      const exportData = await this.analyticsService.exportAnalyticsData(
        format,
        timeframe,
        startDate,
        endDate
      );
      
      res.setHeader('Content-Type', exportData.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      
      if (format === 'json') {
        res.send(exportData.data);
      } else if (format === 'csv') {
        res.send(exportData.data);
      } else if (format === 'excel') {
        res.send(exportData.data);
      }
    } catch (error) {
      this.logger.error(`Error exporting analytics data: ${error.message}`);
      throw new HttpException('Failed to export analytics data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Track user interaction (convenience method)
   * POST /analytics/interaction
   */
  @Post('interaction')
  async trackInteraction(
    @GetUser() user: User,
    @Body() interaction: {
      action: string;
      contentId?: string;
      contentType?: 'spot' | 'spark';
      properties?: Record<string, any>;
    },
  ): Promise<{ success: boolean }> {
    this.logger.log(`Tracking interaction from user ${user.id}: ${interaction.action}`);
    
    try {
      await this.analyticsService.trackUserInteraction(
        user.id,
        interaction.action,
        {
          contentId: interaction.contentId,
          contentType: interaction.contentType,
          ...interaction.properties,
        }
      );
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error tracking interaction: ${error.message}`);
      throw new HttpException('Failed to track interaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Track performance metric (internal use)
   * POST /analytics/performance
   */
  @Post('performance')
  @UseGuards(AdminGuard)
  async trackPerformanceMetric(
    @Body() metric: {
      name: string;
      value: number;
      properties?: Record<string, any>;
    },
  ): Promise<{ success: boolean }> {
    this.logger.log(`Tracking performance metric: ${metric.name} = ${metric.value}`);
    
    try {
      await this.analyticsService.trackPerformanceMetric(
        metric.name,
        metric.value,
        metric.properties
      );
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error tracking performance metric: ${error.message}`);
      throw new HttpException('Failed to track performance metric', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get analytics dashboard data (admin only)
   * GET /analytics/dashboard
   */
  @Get('dashboard')
  @UseGuards(AdminGuard)
  async getDashboardData(): Promise<{
    overview: {
      totalUsers: number;
      activeUsers: number;
      totalContent: number;
      systemHealth: 'healthy' | 'warning' | 'critical';
    };
    recentActivity: Array<{
      type: string;
      count: number;
      change: number;
    }>;
    topMetrics: Array<{
      name: string;
      value: number;
      unit: string;
      trend: 'up' | 'down' | 'stable';
    }>;
    alerts: Array<{
      level: 'info' | 'warning' | 'error';
      message: string;
      timestamp: Date;
    }>;
  }> {
    this.logger.log('Dashboard data request');
    
    try {
      const [metrics, realTimeMetrics, healthStatus] = await Promise.all([
        this.analyticsService.getAnalyticsMetrics('day'),
        this.analyticsService.getRealTimeMetrics(),
        this.analyticsService.getSystemHealthStatus(),
      ]);

      return {
        overview: {
          totalUsers: metrics.metrics.userMetrics.totalUsers,
          activeUsers: metrics.metrics.userMetrics.activeUsers,
          totalContent: metrics.metrics.contentMetrics.totalSpots + metrics.metrics.contentMetrics.totalSparks,
          systemHealth: healthStatus.status,
        },
        recentActivity: realTimeMetrics.recentActivity.map(activity => ({
          type: activity.type,
          count: activity.count,
          change: activity.lastMinute,
        })),
        topMetrics: [
          {
            name: 'Response Time',
            value: metrics.metrics.performanceMetrics.avgResponseTime,
            unit: 'ms',
            trend: 'stable',
          },
          {
            name: 'Uptime',
            value: metrics.metrics.performanceMetrics.uptime,
            unit: '%',
            trend: 'stable',
          },
          {
            name: 'Active Users',
            value: metrics.metrics.userMetrics.activeUsers,
            unit: 'users',
            trend: 'up',
          },
        ],
        alerts: realTimeMetrics.alerts.map(alert => ({
          level: alert.level,
          message: alert.message,
          timestamp: alert.timestamp,
        })),
      };
    } catch (error) {
      this.logger.error(`Error getting dashboard data: ${error.message}`);
      throw new HttpException('Failed to get dashboard data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get analytics insights (admin only)
   * GET /analytics/insights?timeframe=week
   */
  @Get('insights')
  @UseGuards(AdminGuard)
  async getAnalyticsInsights(
    @Query('timeframe', new ParseEnumPipe(['day', 'week', 'month'], { optional: true })) timeframe?: 'day' | 'week' | 'month',
  ): Promise<{
    insights: Array<{
      category: string;
      title: string;
      description: string;
      significance: 'low' | 'medium' | 'high';
      actionRequired: boolean;
    }>;
    recommendations: Array<{
      priority: 'low' | 'medium' | 'high';
      title: string;
      description: string;
      expectedImpact: string;
    }>;
    trends: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
      significance: 'low' | 'medium' | 'high';
    }>;
  }> {
    this.logger.log(`Analytics insights request for ${timeframe || 'week'}`);
    
    try {
      const metrics = await this.analyticsService.getAnalyticsMetrics(timeframe || 'week');
      
      // Generate insights based on metrics
      const insights = [];
      const recommendations = [];
      const trends = [];

      // User activity insights
      if (metrics.metrics.userMetrics.retentionRate < 50) {
        insights.push({
          category: 'User Retention',
          title: 'Low user retention rate',
          description: `Current retention rate is ${metrics.metrics.userMetrics.retentionRate.toFixed(1)}%`,
          significance: 'high' as const,
          actionRequired: true,
        });
        
        recommendations.push({
          priority: 'high' as const,
          title: 'Implement retention strategies',
          description: 'Focus on user onboarding and engagement features',
          expectedImpact: 'Increase retention by 10-15%',
        });
      }

      // Performance insights
      if (metrics.metrics.performanceMetrics.avgResponseTime > 300) {
        insights.push({
          category: 'Performance',
          title: 'Slow response times',
          description: `Average response time is ${metrics.metrics.performanceMetrics.avgResponseTime}ms`,
          significance: 'medium' as const,
          actionRequired: true,
        });
        
        recommendations.push({
          priority: 'medium' as const,
          title: 'Optimize performance',
          description: 'Implement caching and database optimization',
          expectedImpact: 'Reduce response time by 30-40%',
        });
      }

      // Content creation insights
      if (metrics.metrics.contentMetrics.spotsCreated > 0) {
        trends.push({
          metric: 'Content Creation',
          trend: 'up' as const,
          change: 15,
          significance: 'medium' as const,
        });
      }

      return {
        insights,
        recommendations,
        trends,
      };
    } catch (error) {
      this.logger.error(`Error getting analytics insights: ${error.message}`);
      throw new HttpException('Failed to get analytics insights', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get usage statistics summary
   * GET /analytics/usage
   */
  @Get('usage')
  async getUsageStatistics(
    @GetUser() user: User,
  ): Promise<{
    thisWeek: {
      spotsCreated: number;
      sparksFormed: number;
      interactions: number;
      timeSpent: number;
    };
    comparison: {
      spotsCreated: { change: number; trend: 'up' | 'down' | 'stable' };
      sparksFormed: { change: number; trend: 'up' | 'down' | 'stable' };
      interactions: { change: number; trend: 'up' | 'down' | 'stable' };
    };
    achievements: Array<{
      name: string;
      description: string;
      unlockedAt: Date;
    }>;
  }> {
    this.logger.log(`Usage statistics request from user ${user.id}`);
    
    try {
      const userAnalytics = await this.analyticsService.getUserAnalytics(user.id, 'week');
      
      return {
        thisWeek: {
          spotsCreated: userAnalytics.activitySummary.spotsCreated,
          sparksFormed: userAnalytics.activitySummary.sparksFormed,
          interactions: userAnalytics.activitySummary.interactions,
          timeSpent: userAnalytics.activitySummary.avgDailyActivity * 7 * 5, // Rough estimate
        },
        comparison: {
          spotsCreated: {
            change: userAnalytics.trends.find(t => t.metric === 'Activity')?.change || 0,
            trend: userAnalytics.trends.find(t => t.metric === 'Activity')?.trend || 'stable',
          },
          sparksFormed: {
            change: userAnalytics.trends.find(t => t.metric === 'Connections')?.change || 0,
            trend: userAnalytics.trends.find(t => t.metric === 'Connections')?.trend || 'stable',
          },
          interactions: {
            change: userAnalytics.trends.find(t => t.metric === 'Engagement')?.change || 0,
            trend: userAnalytics.trends.find(t => t.metric === 'Engagement')?.trend || 'stable',
          },
        },
        achievements: [
          // Placeholder achievements
          {
            name: 'First Spark',
            description: 'Created your first spark connection',
            unlockedAt: new Date(),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Error getting usage statistics: ${error.message}`);
      throw new HttpException('Failed to get usage statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}