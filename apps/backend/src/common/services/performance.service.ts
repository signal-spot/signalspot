import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AnalyticsService } from './analytics.service';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface PerformanceProfile {
  operation: string;
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  avgResponseTime: number;
  evictionRate: number;
}

export interface DatabaseMetrics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryMetrics: {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  indexUsage: Array<{
    tableName: string;
    indexName: string;
    usage: number;
  }>;
}

export interface OptimizationRecommendation {
  category: 'query' | 'cache' | 'memory' | 'network' | 'algorithm';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  code?: string;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private readonly metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly profiles: PerformanceProfile[] = [];
  private readonly maxMetricsPerType = 1000;
  private readonly maxProfiles = 500;

  constructor(
    private readonly em: EntityManager,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context,
    };

    // Store in memory
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);
    
    // Keep only recent metrics
    if (metricArray.length > this.maxMetricsPerType) {
      metricArray.shift();
    }

    // Send to analytics service
    this.analyticsService.trackPerformanceMetric(name, value, context);
    
    this.logger.debug(`Performance metric recorded: ${name} = ${value} ${unit}`);
  }

  /**
   * Profile a function execution
   */
  async profile<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await fn();
      
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      const profile: PerformanceProfile = {
        operation,
        duration,
        memoryUsage: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
        },
        timestamp: new Date(),
        metadata,
      };
      
      this.profiles.push(profile);
      
      // Keep only recent profiles
      if (this.profiles.length > this.maxProfiles) {
        this.profiles.shift();
      }
      
      // Record as metrics
      this.recordMetric(`${operation}_duration`, duration, 'ms', metadata);
      this.recordMetric(`${operation}_memory`, profile.memoryUsage.heapUsed, 'bytes', metadata);
      
      // Log slow operations
      if (duration > 1000) {
        this.logger.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      
      this.recordMetric(`${operation}_error`, 1, 'count', { error: error.message, ...metadata });
      this.logger.error(`Operation failed: ${operation} after ${duration.toFixed(2)}ms - ${error.message}`);
      
      throw error;
    }
  }

  /**
   * Get performance metrics summary
   */
  getMetricsSummary(): Record<string, {
    current: number;
    average: number;
    min: number;
    max: number;
    count: number;
    unit: string;
  }> {
    const summary: Record<string, any> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;
      
      const values = metrics.map(m => m.value);
      const current = values[values.length - 1];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      summary[name] = {
        current,
        average,
        min,
        max,
        count: values.length,
        unit: metrics[0].unit,
      };
    }
    
    return summary;
  }

  /**
   * Get performance profiles summary
   */
  getProfilesSummary(): Record<string, {
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    executions: number;
    avgMemoryUsage: number;
    slowExecutions: number;
  }> {
    const summary: Record<string, any> = {};
    
    const profilesByOperation = new Map<string, PerformanceProfile[]>();
    
    for (const profile of this.profiles) {
      if (!profilesByOperation.has(profile.operation)) {
        profilesByOperation.set(profile.operation, []);
      }
      profilesByOperation.get(profile.operation)!.push(profile);
    }
    
    for (const [operation, profiles] of profilesByOperation.entries()) {
      const durations = profiles.map(p => p.duration);
      const memoryUsages = profiles.map(p => p.memoryUsage.heapUsed);
      
      summary[operation] = {
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
        executions: profiles.length,
        avgMemoryUsage: memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length,
        slowExecutions: durations.filter(d => d > 1000).length,
      };
    }
    
    return summary;
  }

  /**
   * Get cache performance metrics
   */
  async getCacheMetrics(): Promise<CacheMetrics> {
    // In a real implementation, this would query cache statistics
    // For now, return simulated metrics
    return {
      hitRate: 0.85,
      missRate: 0.15,
      totalRequests: 10000,
      avgResponseTime: 15,
      evictionRate: 0.02,
    };
  }

  /**
   * Get database performance metrics
   */
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Get connection pool stats (implementation depends on your database driver)
      const connectionPoolStats = {
        active: 5,
        idle: 15,
        total: 20,
      };
      
      // Get query performance statistics
      const queryStatsQuery = `
        SELECT 
          COUNT(*) as total_queries,
          AVG(EXTRACT(EPOCH FROM (NOW() - query_start))) as avg_query_time,
          COUNT(CASE WHEN EXTRACT(EPOCH FROM (NOW() - query_start)) > 1 THEN 1 END) as slow_queries
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
      
      let queryStats = {
        avgQueryTime: 0.1,
        slowQueries: 0,
        totalQueries: 100,
      };
      
      try {
        const result = await this.em.getConnection().execute(queryStatsQuery);
        if (result.length > 0) {
          queryStats = {
            avgQueryTime: parseFloat(result[0].avg_query_time) || 0.1,
            slowQueries: parseInt(result[0].slow_queries) || 0,
            totalQueries: parseInt(result[0].total_queries) || 100,
          };
        }
      } catch (error) {
        this.logger.debug('Could not get query stats from pg_stat_activity');
      }
      
      // Get index usage statistics
      const indexUsageQuery = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read + idx_tup_fetch as usage
        FROM pg_stat_user_indexes
        ORDER BY usage DESC
        LIMIT 10
      `;
      
      let indexUsage: Array<{ tableName: string; indexName: string; usage: number }> = [];
      
      try {
        const indexResult = await this.em.getConnection().execute(indexUsageQuery);
        indexUsage = indexResult.map(row => ({
          tableName: row.tablename,
          indexName: row.indexname,
          usage: parseInt(row.usage) || 0,
        }));
      } catch (error) {
        this.logger.debug('Could not get index usage statistics');
      }
      
      return {
        connectionPool: connectionPoolStats,
        queryMetrics: queryStats,
        indexUsage,
      };
    } catch (error) {
      this.logger.error(`Error getting database metrics: ${error.message}`);
      return {
        connectionPool: { active: 0, idle: 0, total: 0 },
        queryMetrics: { avgQueryTime: 0, slowQueries: 0, totalQueries: 0 },
        indexUsage: [],
      };
    }
  }

  /**
   * Analyze performance and generate optimization recommendations
   */
  async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    
    try {
      const metricsSummary = this.getMetricsSummary();
      const profilesSummary = this.getProfilesSummary();
      const cacheMetrics = await this.getCacheMetrics();
      const dbMetrics = await this.getDatabaseMetrics();
      
      // Query optimization recommendations
      if (dbMetrics.queryMetrics.avgQueryTime > 0.5) {
        recommendations.push({
          category: 'query',
          priority: 'high',
          title: 'Optimize slow database queries',
          description: `Average query time is ${dbMetrics.queryMetrics.avgQueryTime.toFixed(2)}s. Consider adding indexes, optimizing queries, or implementing query caching.`,
          expectedImpact: '30-50% reduction in response time',
          implementationEffort: 'medium',
          code: `
// Example: Add database index
CREATE INDEX idx_signal_spots_location ON signal_spots USING GIST (ST_Point(longitude, latitude));

// Example: Optimize query with selective fields
SELECT id, title, latitude, longitude 
FROM signal_spots 
WHERE ST_DWithin(location, ST_Point($1, $2), $3)
LIMIT 20;
          `,
        });
      }
      
      // Cache optimization recommendations
      if (cacheMetrics.hitRate < 0.8) {
        recommendations.push({
          category: 'cache',
          priority: 'medium',
          title: 'Improve cache hit rate',
          description: `Cache hit rate is ${(cacheMetrics.hitRate * 100).toFixed(1)}%. Consider implementing better caching strategies for frequently accessed data.`,
          expectedImpact: '20-30% reduction in database load',
          implementationEffort: 'low',
          code: `
// Example: Implement Redis caching
@CacheKey('user:profile:{{userId}}')
@CacheTTL(300) // 5 minutes
async getUserProfile(userId: string): Promise<UserProfile> {
  return this.userRepository.findProfile(userId);
}
          `,
        });
      }
      
      // Memory optimization recommendations
      for (const [operation, summary] of Object.entries(profilesSummary)) {
        if (summary.avgMemoryUsage > 50 * 1024 * 1024) { // 50MB
          recommendations.push({
            category: 'memory',
            priority: 'medium',
            title: `Optimize memory usage in ${operation}`,
            description: `Operation ${operation} uses an average of ${(summary.avgMemoryUsage / 1024 / 1024).toFixed(1)}MB. Consider implementing streaming or pagination.`,
            expectedImpact: '40-60% reduction in memory usage',
            implementationEffort: 'high',
            code: `
// Example: Implement streaming for large datasets
async *streamLargeDataset(query: Query): AsyncGenerator<DataItem> {
  const batchSize = 1000;
  let offset = 0;
  
  while (true) {
    const batch = await this.repository.findMany(query, { offset, limit: batchSize });
    if (batch.length === 0) break;
    
    for (const item of batch) {
      yield item;
    }
    
    offset += batchSize;
  }
}
            `,
          });
        }
      }
      
      // Network optimization recommendations
      if (metricsSummary.api_response_time?.average > 300) {
        recommendations.push({
          category: 'network',
          priority: 'high',
          title: 'Reduce API response time',
          description: `Average API response time is ${metricsSummary.api_response_time.average.toFixed(0)}ms. Consider implementing response compression and optimizing payload sizes.`,
          expectedImpact: '25-35% reduction in response time',
          implementationEffort: 'low',
          code: `
// Example: Enable compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    return compression.filter(req, res);
  }
}));
          `,
        });
      }
      
      // Algorithm optimization recommendations
      for (const [operation, summary] of Object.entries(profilesSummary)) {
        if (summary.slowExecutions > summary.executions * 0.1) {
          recommendations.push({
            category: 'algorithm',
            priority: 'medium',
            title: `Optimize ${operation} algorithm`,
            description: `${((summary.slowExecutions / summary.executions) * 100).toFixed(1)}% of ${operation} executions are slow. Consider algorithmic improvements or parallel processing.`,
            expectedImpact: '50-70% reduction in execution time',
            implementationEffort: 'high',
            code: `
// Example: Implement parallel processing
async processInParallel<T>(items: T[], processor: (item: T) => Promise<any>): Promise<any[]> {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}
            `,
          });
        }
      }
      
      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      this.logger.error(`Error generating optimization recommendations: ${error.message}`);
      return [];
    }
  }

  /**
   * Run performance benchmarks
   */
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
    
    const benchmarks = [];
    const benchmarkTests = [
      { name: 'Database Query', fn: () => this.benchmarkDatabaseQuery() },
      { name: 'API Response', fn: () => this.benchmarkApiResponse() },
      { name: 'Cache Performance', fn: () => this.benchmarkCachePerformance() },
      { name: 'Memory Usage', fn: () => this.benchmarkMemoryUsage() },
      { name: 'Concurrent Requests', fn: () => this.benchmarkConcurrentRequests() },
    ];
    
    for (const test of benchmarkTests) {
      try {
        const result = await this.profile(test.name, test.fn);
        const profile = this.profiles.find(p => p.operation === test.name);
        
        benchmarks.push({
          name: test.name,
          duration: profile?.duration || 0,
          throughput: result.throughput || 0,
          memoryUsage: profile?.memoryUsage.heapUsed || 0,
          success: true,
        });
      } catch (error) {
        benchmarks.push({
          name: test.name,
          duration: 0,
          throughput: 0,
          memoryUsage: 0,
          success: false,
          error: error.message,
        });
      }
    }
    
    const successfulBenchmarks = benchmarks.filter(b => b.success);
    const summary = {
      totalDuration: benchmarks.reduce((sum, b) => sum + b.duration, 0),
      averageThroughput: successfulBenchmarks.reduce((sum, b) => sum + b.throughput, 0) / successfulBenchmarks.length,
      totalMemoryUsage: benchmarks.reduce((sum, b) => sum + b.memoryUsage, 0),
      successRate: (successfulBenchmarks.length / benchmarks.length) * 100,
    };
    
    this.logger.log(`Benchmarks completed: ${successfulBenchmarks.length}/${benchmarks.length} successful`);
    
    return { benchmarks, summary };
  }

  /**
   * Monitor system resources
   */
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
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculate CPU usage percentage (simplified)
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    
    return {
      cpu: {
        usage: cpuPercent,
        loadAverage: require('os').loadavg(),
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
      eventLoop: {
        lag: 0, // Would need additional library to measure
        utilization: 0, // Would need additional library to measure
      },
      handles: {
        active: (process as any)._getActiveHandles?.()?.length || 0,
        refs: (process as any)._getActiveRequests?.()?.length || 0,
      },
    };
  }

  /**
   * Optimize database queries
   */
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
    const optimizations = [];
    const indexSuggestions = [];
    
    try {
      // Analyze slow queries
      const slowQueriesQuery = `
        SELECT 
          query,
          mean_exec_time,
          calls
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `;
      
      try {
        const slowQueries = await this.em.getConnection().execute(slowQueriesQuery);
        
        for (const query of slowQueries) {
          optimizations.push({
            query: query.query,
            suggestion: 'Consider adding appropriate indexes or rewriting the query',
            estimatedImprovement: `${(query.mean_exec_time * 0.3).toFixed(0)}ms reduction`,
          });
        }
      } catch (error) {
        this.logger.debug('pg_stat_statements not available for query analysis');
      }
      
      // Suggest indexes for common query patterns
      indexSuggestions.push(
        {
          table: 'signal_spots',
          columns: ['latitude', 'longitude'],
          reason: 'Spatial queries for location-based searches',
        },
        {
          table: 'signal_spots',
          columns: ['user_id', 'created_at'],
          reason: 'User activity timeline queries',
        },
        {
          table: 'user_interactions',
          columns: ['user_id', 'created_at'],
          reason: 'User activity analysis',
        },
        {
          table: 'sparks',
          columns: ['user1_id', 'user2_id'],
          reason: 'User connection queries',
        },
      );
      
      return { optimizations, indexSuggestions };
    } catch (error) {
      this.logger.error(`Error optimizing queries: ${error.message}`);
      return { optimizations: [], indexSuggestions: [] };
    }
  }

  /**
   * Clear performance data
   */
  clearPerformanceData(): void {
    this.metrics.clear();
    this.profiles.length = 0;
    this.logger.log('Performance data cleared');
  }

  /**
   * Benchmark database query performance
   */
  private async benchmarkDatabaseQuery(): Promise<{ throughput: number }> {
    const iterations = 100;
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      await this.em.getConnection().execute('SELECT 1');
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const throughput = (iterations / duration) * 1000; // Operations per second
    
    return { throughput };
  }

  /**
   * Benchmark API response performance
   */
  private async benchmarkApiResponse(): Promise<{ throughput: number }> {
    const iterations = 50;
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      // Simulate API processing
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const throughput = (iterations / duration) * 1000;
    
    return { throughput };
  }

  /**
   * Benchmark cache performance
   */
  private async benchmarkCachePerformance(): Promise<{ throughput: number }> {
    const iterations = 1000;
    const cache = new Map<string, any>();
    
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const key = `key_${i % 100}`;
      if (cache.has(key)) {
        cache.get(key);
      } else {
        cache.set(key, { data: `value_${i}` });
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const throughput = (iterations / duration) * 1000;
    
    return { throughput };
  }

  /**
   * Benchmark memory usage
   */
  private async benchmarkMemoryUsage(): Promise<{ throughput: number }> {
    const iterations = 10000;
    const data = [];
    
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      data.push({ id: i, data: `item_${i}` });
      
      // Simulate cleanup
      if (i % 1000 === 0) {
        data.splice(0, 500);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const throughput = (iterations / duration) * 1000;
    
    return { throughput };
  }

  /**
   * Benchmark concurrent requests
   */
  private async benchmarkConcurrentRequests(): Promise<{ throughput: number }> {
    const concurrency = 10;
    const requestsPerWorker = 10;
    const totalRequests = concurrency * requestsPerWorker;
    
    const startTime = Date.now();
    
    const workers = Array.from({ length: concurrency }, async () => {
      for (let i = 0; i < requestsPerWorker; i++) {
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    });
    
    await Promise.all(workers);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const throughput = (totalRequests / duration) * 1000;
    
    return { throughput };
  }
}