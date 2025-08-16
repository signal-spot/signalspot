import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../common/cache/redis-cache.service';

/**
 * Production-ready health check controller
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private configService: ConfigService,
    private redis: RedisCacheService,
  ) {}
  
  /**
   * Basic health check - used by load balancers
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),
      
      // Redis health
      () => this.checkRedis(),
      
      // Memory health - 90% threshold
      () => this.memory.checkHeap('memory_heap', 900 * 1024 * 1024),
      
      // RSS Memory - 1GB threshold
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
      
      // Disk health - 10% threshold
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.9,
      }),
    ]);
  }
  
  /**
   * Detailed health check - for monitoring systems
   */
  @Get('detailed')
  @HealthCheck()
  async detailed() {
    const checks = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkRedis(),
      () => this.memory.checkHeap('memory_heap', 900 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.9,
      }),
    ]);
    
    // Add additional metrics
    return {
      ...checks,
      timestamp: new Date().toISOString(),
      environment: this.configService.get('app.env'),
      version: process.env.npm_package_version || 'unknown',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        total: require('os').totalmem(),
        free: require('os').freemem(),
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: require('os').loadavg(),
        cores: require('os').cpus().length,
      },
    };
  }
  
  /**
   * Liveness probe - for Kubernetes
   */
  @Get('live')
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Readiness probe - for Kubernetes
   */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkRedis(),
    ]);
  }
  
  /**
   * Check Redis health
   */
  private async checkRedis() {
    try {
      const testKey = 'health:check';
      const testValue = Date.now().toString();
      
      // Test set and get
      await this.redis.set(testKey, testValue, 10);
      const retrieved = await this.redis.get(testKey);
      
      if (retrieved !== testValue) {
        throw new Error('Redis read/write test failed');
      }
      
      await this.redis.del(testKey);
      
      return {
        redis: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        redis: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }
}