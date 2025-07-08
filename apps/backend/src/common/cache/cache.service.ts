import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export interface CacheKey {
  key: string;
  version?: number;
  tags?: string[];
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;
  private readonly defaultTTL = 3600; // 1 hour

  constructor(private readonly configService: ConfigService) {
    this.initializeRedis();
  }

  private initializeRedis(): void {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      if (redisUrl) {
        this.redis = new Redis(redisUrl);
      } else {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          lazyConnect: true,
        });
      }

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.redis.on('ready', () => {
        this.logger.log('Redis ready for operations');
      });

    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string | CacheKey, options?: CacheOptions): Promise<T | null> {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const value = await this.redis.get(cacheKey);
      
      if (!value) {
        return null;
      }

      const parsed = JSON.parse(value);
      
      // Check if value is compressed
      if (options?.compress && parsed._compressed) {
        // Implement decompression here if needed
        return parsed.data;
      }

      return parsed;
    } catch (error) {
      this.logger.error(`Error getting cache key ${this.buildCacheKey(key, options)}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string | CacheKey, 
    value: T, 
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const ttl = options?.ttl || this.defaultTTL;
      
      let serializedValue = JSON.stringify(value);
      
      // Implement compression if needed
      if (options?.compress && serializedValue.length > 1024) {
        // Add compression logic here
        serializedValue = JSON.stringify({
          _compressed: true,
          data: value
        });
      }

      const result = await this.redis.setex(cacheKey, ttl, serializedValue);
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Error setting cache key ${this.buildCacheKey(key, options)}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string | CacheKey, options?: CacheOptions): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const result = await this.redis.del(cacheKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${this.buildCacheKey(key, options)}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string | CacheKey, options?: CacheOptions): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const result = await this.redis.exists(cacheKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key ${this.buildCacheKey(key, options)}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T>(keys: (string | CacheKey)[], options?: CacheOptions): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map(key => this.buildCacheKey(key, options));
      const values = await this.redis.mget(...cacheKeys);
      
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      });
    } catch (error) {
      this.logger.error('Error getting multiple cache keys:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values in cache
   */
  async mset<T>(
    keyValuePairs: Array<{ key: string | CacheKey; value: T }>,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      const ttl = options?.ttl || this.defaultTTL;

      keyValuePairs.forEach(({ key, value }) => {
        const cacheKey = this.buildCacheKey(key, options);
        const serializedValue = JSON.stringify(value);
        pipeline.setex(cacheKey, ttl, serializedValue);
      });

      const results = await pipeline.exec();
      return results?.every(([error, result]) => !error && result === 'OK') || false;
    } catch (error) {
      this.logger.error('Error setting multiple cache keys:', error);
      return false;
    }
  }

  /**
   * Increment counter in cache
   */
  async incr(key: string | CacheKey, options?: CacheOptions): Promise<number> {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const result = await this.redis.incr(cacheKey);
      
      // Set TTL if this is a new key
      if (result === 1) {
        const ttl = options?.ttl || this.defaultTTL;
        await this.redis.expire(cacheKey, ttl);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error incrementing cache key ${this.buildCacheKey(key, options)}:`, error);
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache, or execute function and cache result
   */
  async getOrSet<T>(
    key: string | CacheKey,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await fetchFn();
      await this.set(key, result, options);
      return result;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${this.buildCacheKey(key, options)}:`, error);
      // Fallback to executing function
      return await fetchFn();
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.logger.debug(`Invalidated ${result} cache keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      this.logger.error(`Error invalidating cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalInvalidated = 0;
      
      for (const tag of tags) {
        const pattern = this.buildTagPattern(tag);
        const invalidated = await this.invalidateByPattern(pattern);
        totalInvalidated += invalidated;
      }

      return totalInvalidated;
    } catch (error) {
      this.logger.error('Error invalidating cache by tags:', error);
      return 0;
    }
  }

  /**
   * Set cache with tags for easy invalidation
   */
  async setWithTags<T>(
    key: string | CacheKey,
    value: T,
    tags: string[],
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const success = await this.set(key, value, options);
      
      if (success && tags.length > 0) {
        // Store tag associations
        const pipeline = this.redis.pipeline();
        const ttl = options?.ttl || this.defaultTTL;
        
        tags.forEach(tag => {
          const tagKey = this.buildTagKey(tag, cacheKey);
          pipeline.setex(tagKey, ttl, '1');
        });
        
        await pipeline.exec();
      }

      return success;
    } catch (error) {
      this.logger.error('Error setting cache with tags:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memory: string;
    keys: number;
    hits: number;
    misses: number;
    connections: number;
  }> {
    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      const clients = await this.redis.info('clients');
      
      const keyspace = await this.redis.info('keyspace');
      const dbInfo = keyspace.split('\r\n').find(line => line.startsWith('db0:'));
      const keysMatch = dbInfo?.match(/keys=(\d+)/);
      const keys = keysMatch ? parseInt(keysMatch[1]) : 0;

      // Parse memory usage
      const memoryMatch = info.match(/used_memory_human:(.+)\r/);
      const memory = memoryMatch ? memoryMatch[1].trim() : 'Unknown';

      // Parse hits/misses
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0;

      // Parse connections
      const connectionsMatch = clients.match(/connected_clients:(\d+)/);
      const connections = connectionsMatch ? parseInt(connectionsMatch[1]) : 0;

      return {
        memory,
        keys,
        hits,
        misses,
        connections,
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return {
        memory: 'Unknown',
        keys: 0,
        hits: 0,
        misses: 0,
        connections: 0,
      };
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      await this.redis.flushall();
      this.logger.log('Cache cleared successfully');
      return true;
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Cache health check failed:', error);
      return false;
    }
  }

  /**
   * Build cache key with prefix and versioning
   */
  private buildCacheKey(key: string | CacheKey, options?: CacheOptions): string {
    const prefix = options?.prefix || 'signalspot';
    
    if (typeof key === 'string') {
      return `${prefix}:${key}`;
    }

    let cacheKey = `${prefix}:${key.key}`;
    
    if (key.version) {
      cacheKey += `:v${key.version}`;
    }

    return cacheKey;
  }

  /**
   * Build tag pattern for invalidation
   */
  private buildTagPattern(tag: string): string {
    return `signalspot:tag:${tag}:*`;
  }

  /**
   * Build tag key for association
   */
  private buildTagKey(tag: string, cacheKey: string): string {
    return `signalspot:tag:${tag}:${cacheKey}`;
  }

  /**
   * Cleanup on application shutdown
   */
  async onApplicationShutdown(): Promise<void> {
    try {
      await this.redis.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }
}