import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  Logger,
  ParseEnumPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  PerformanceService,
  PerformanceMetric,
  OptimizationRecommendation,
  CacheMetrics,
  DatabaseMetrics,
} from '../services/performance.service';

@Controller('performance')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(private readonly performanceService: PerformanceService) {}

  /**
   * Get performance metrics summary
   * GET /performance/metrics
   */
  @Get('metrics')
  async getMetricsSummary(): Promise<Record<string, {
    current: number;
    average: number;
    min: number;
    max: number;
    count: number;
    unit: string;
  }>> {
    this.logger.log('Performance metrics summary request');
    
    try {
      return this.performanceService.getMetricsSummary();
    } catch (error) {
      this.logger.error(`Error getting metrics summary: ${error.message}`);
      throw new HttpException('Failed to get metrics summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get performance profiles summary
   * GET /performance/profiles
   */
  @Get('profiles')
  async getProfilesSummary(): Promise<Record<string, {
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    executions: number;
    avgMemoryUsage: number;
    slowExecutions: number;
  }>> {
    this.logger.log('Performance profiles summary request');
    
    try {
      return this.performanceService.getProfilesSummary();
    } catch (error) {
      this.logger.error(`Error getting profiles summary: ${error.message}`);
      throw new HttpException('Failed to get profiles summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get cache performance metrics
   * GET /performance/cache
   */
  @Get('cache')
  async getCacheMetrics(): Promise<CacheMetrics> {
    this.logger.log('Cache metrics request');
    
    try {
      return await this.performanceService.getCacheMetrics();
    } catch (error) {
      this.logger.error(`Error getting cache metrics: ${error.message}`);
      throw new HttpException('Failed to get cache metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get database performance metrics
   * GET /performance/database
   */
  @Get('database')
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    this.logger.log('Database metrics request');
    
    try {
      return await this.performanceService.getDatabaseMetrics();
    } catch (error) {
      this.logger.error(`Error getting database metrics: ${error.message}`);
      throw new HttpException('Failed to get database metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get optimization recommendations
   * GET /performance/recommendations
   */
  @Get('recommendations')
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    this.logger.log('Optimization recommendations request');
    
    try {
      return await this.performanceService.generateOptimizationRecommendations();
    } catch (error) {
      this.logger.error(`Error getting optimization recommendations: ${error.message}`);
      throw new HttpException('Failed to get optimization recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Run performance benchmarks
   * POST /performance/benchmark
   */
  @Post('benchmark')
  async runBenchmarks(): Promise<{
    benchmarks: Array<{
      name: string;
      duration: number;
      throughput: number;
      memoryUsage: number;
      success: boolean;
      error?: string;
    }>;
    summary: {
      totalDuration: number;
      averageThroughput: number;
      totalMemoryUsage: number;
      successRate: number;
    };
  }> {
    this.logger.log('Running performance benchmarks');
    
    try {
      return await this.performanceService.runBenchmarks();
    } catch (error) {
      this.logger.error(`Error running benchmarks: ${error.message}`);
      throw new HttpException('Failed to run benchmarks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Monitor system resources
   * GET /performance/resources
   */
  @Get('resources')
  async monitorResources(): Promise<{
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
      heapUsed: number;
      heapTotal: number;
    };
    eventLoop: {
      lag: number;
      utilization: number;
    };
    handles: {
      active: number;
      refs: number;
    };
  }> {
    this.logger.log('System resources monitoring request');
    
    try {
      return await this.performanceService.monitorResources();
    } catch (error) {
      this.logger.error(`Error monitoring resources: ${error.message}`);
      throw new HttpException('Failed to monitor resources', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get query optimization suggestions
   * GET /performance/optimize-queries
   */
  @Get('optimize-queries')
  async optimizeQueries(): Promise<{
    optimizations: Array<{
      query: string;
      suggestion: string;
      estimatedImprovement: string;
    }>;
    indexSuggestions: Array<{
      table: string;
      columns: string[];
      reason: string;
    }>;
  }> {
    this.logger.log('Query optimization request');
    
    try {
      return await this.performanceService.optimizeQueries();
    } catch (error) {
      this.logger.error(`Error optimizing queries: ${error.message}`);
      throw new HttpException('Failed to optimize queries', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Record a performance metric
   * POST /performance/record-metric
   */
  @Post('record-metric')
  async recordMetric(
    @Body() metric: {
      name: string;
      value: number;
      unit: string;
      context?: Record<string, any>;
    },
  ): Promise<{ success: boolean }> {
    this.logger.log(`Recording performance metric: ${metric.name}`);
    
    try {
      this.performanceService.recordMetric(
        metric.name,
        metric.value,
        metric.unit,
        metric.context
      );
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error recording metric: ${error.message}`);
      throw new HttpException('Failed to record metric', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Clear performance data
   * DELETE /performance/data
   */
  @Delete('data')
  async clearPerformanceData(): Promise<{ success: boolean }> {
    this.logger.log('Clearing performance data');
    
    try {
      this.performanceService.clearPerformanceData();
      return { success: true };
    } catch (error) {
      this.logger.error(`Error clearing performance data: ${error.message}`);
      throw new HttpException('Failed to clear performance data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get comprehensive performance report
   * GET /performance/report
   */
  @Get('report')
  async getPerformanceReport(): Promise<{
    timestamp: Date;
    metrics: Record<string, any>;
    profiles: Record<string, any>;
    cache: CacheMetrics;
    database: DatabaseMetrics;
    resources: any;
    recommendations: OptimizationRecommendation[];
    health: {
      status: 'healthy' | 'warning' | 'critical';
      issues: string[];
      score: number;
    };
  }> {
    this.logger.log('Comprehensive performance report request');
    
    try {
      const [
        metrics,
        profiles,
        cache,
        database,
        resources,
        recommendations,
      ] = await Promise.all([
        this.performanceService.getMetricsSummary(),
        this.performanceService.getProfilesSummary(),
        this.performanceService.getCacheMetrics(),
        this.performanceService.getDatabaseMetrics(),
        this.performanceService.monitorResources(),
        this.performanceService.generateOptimizationRecommendations(),
      ]);
      
      // Calculate overall health score
      const issues = [];
      let score = 100;
      
      // Check memory usage
      if (resources.memory.percentage > 90) {
        issues.push('High memory usage detected');
        score -= 20;
      } else if (resources.memory.percentage > 75) {
        issues.push('Elevated memory usage');
        score -= 10;
      }
      
      // Check database performance
      if (database.queryMetrics.avgQueryTime > 1) {
        issues.push('Slow database queries detected');
        score -= 15;
      }
      
      // Check cache performance
      if (cache.hitRate < 0.7) {
        issues.push('Low cache hit rate');
        score -= 10;
      }
      
      // Check for slow operations
      const slowOperations = Object.entries(profiles).filter(
        ([_, profile]) => profile.slowExecutions > profile.executions * 0.1
      );
      
      if (slowOperations.length > 0) {
        issues.push(`${slowOperations.length} operations have slow executions`);
        score -= 5 * slowOperations.length;
      }
      
      // Check for critical recommendations
      const criticalRecommendations = recommendations.filter(r => r.priority === 'critical');
      if (criticalRecommendations.length > 0) {
        issues.push(`${criticalRecommendations.length} critical optimization issues`);
        score -= 15 * criticalRecommendations.length;
      }
      
      const health = {
        status: (score > 80 ? 'healthy' : score > 60 ? 'warning' : 'critical') as 'healthy' | 'warning' | 'critical',
        issues,
        score: Math.max(0, score),
      };
      
      return {
        timestamp: new Date(),
        metrics,
        profiles,
        cache,
        database,
        resources,
        recommendations,
        health,
      };
    } catch (error) {
      this.logger.error(`Error generating performance report: ${error.message}`);
      throw new HttpException('Failed to generate performance report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get performance trends
   * GET /performance/trends?period=hour
   */
  @Get('trends')
  async getPerformanceTrends(
    @Query('period', new ParseEnumPipe(['hour', 'day', 'week'], { optional: true })) period?: 'hour' | 'day' | 'week',
  ): Promise<{
    period: string;
    trends: Array<{
      metric: string;
      data: Array<{
        timestamp: Date;
        value: number;
      }>;
      trend: 'up' | 'down' | 'stable';
      change: number;
    }>;
  }> {
    this.logger.log(`Performance trends request for ${period || 'hour'}`);
    
    try {
      const selectedPeriod = period || 'hour';
      
      // In a real implementation, this would query historical data
      // For now, we'll return simulated trend data
      const trends = [
        {
          metric: 'response_time',
          data: [
            { timestamp: new Date(Date.now() - 3600000), value: 150 },
            { timestamp: new Date(Date.now() - 1800000), value: 160 },
            { timestamp: new Date(), value: 145 },
          ],
          trend: 'down' as const,
          change: -3.3,
        },
        {
          metric: 'memory_usage',
          data: [
            { timestamp: new Date(Date.now() - 3600000), value: 70 },
            { timestamp: new Date(Date.now() - 1800000), value: 72 },
            { timestamp: new Date(), value: 75 },
          ],
          trend: 'up' as const,
          change: 7.1,
        },
        {
          metric: 'throughput',
          data: [
            { timestamp: new Date(Date.now() - 3600000), value: 100 },
            { timestamp: new Date(Date.now() - 1800000), value: 110 },
            { timestamp: new Date(), value: 105 },
          ],
          trend: 'stable' as const,
          change: 5.0,
        },
      ];
      
      return {
        period: selectedPeriod,
        trends,
      };
    } catch (error) {
      this.logger.error(`Error getting performance trends: ${error.message}`);
      throw new HttpException('Failed to get performance trends', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get performance alerts
   * GET /performance/alerts
   */
  @Get('alerts')
  async getPerformanceAlerts(): Promise<{
    alerts: Array<{
      id: string;
      level: 'info' | 'warning' | 'error' | 'critical';
      title: string;
      message: string;
      timestamp: Date;
      resolved: boolean;
      metadata?: Record<string, any>;
    }>;
    summary: {
      total: number;
      byLevel: Record<string, number>;
      unresolved: number;
    };
  }> {
    this.logger.log('Performance alerts request');
    
    try {
      // In a real implementation, this would query from an alerts system
      // For now, we'll generate alerts based on current metrics
      const alerts = [];
      const resources = await this.performanceService.monitorResources();
      const dbMetrics = await this.performanceService.getDatabaseMetrics();
      
      // Memory usage alert
      if (resources.memory.percentage > 85) {
        alerts.push({
          id: `memory-${Date.now()}`,
          level: 'warning' as const,
          title: 'High Memory Usage',
          message: `Memory usage is at ${resources.memory.percentage.toFixed(1)}%`,
          timestamp: new Date(),
          resolved: false,
          metadata: { memoryUsage: resources.memory },
        });
      }
      
      // Database performance alert
      if (dbMetrics.queryMetrics.avgQueryTime > 0.5) {
        alerts.push({
          id: `db-slow-${Date.now()}`,
          level: 'warning' as const,
          title: 'Slow Database Queries',
          message: `Average query time is ${dbMetrics.queryMetrics.avgQueryTime.toFixed(2)}s`,
          timestamp: new Date(),
          resolved: false,
          metadata: { queryMetrics: dbMetrics.queryMetrics },
        });
      }
      
      // CPU usage alert
      if (resources.cpu.usage > 80) {
        alerts.push({
          id: `cpu-${Date.now()}`,
          level: 'critical' as const,
          title: 'High CPU Usage',
          message: `CPU usage is at ${resources.cpu.usage.toFixed(1)}%`,
          timestamp: new Date(),
          resolved: false,
          metadata: { cpuUsage: resources.cpu },
        });
      }
      
      const summary = {
        total: alerts.length,
        byLevel: alerts.reduce((acc, alert) => {
          acc[alert.level] = (acc[alert.level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        unresolved: alerts.filter(a => !a.resolved).length,
      };
      
      return { alerts, summary };
    } catch (error) {
      this.logger.error(`Error getting performance alerts: ${error.message}`);
      throw new HttpException('Failed to get performance alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}