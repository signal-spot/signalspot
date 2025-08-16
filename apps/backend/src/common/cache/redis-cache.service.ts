import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis.Redis;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.client = new Redis.Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        db: this.configService.get('REDIS_DB', 0),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
        this.isConnected = false;
      });

      // Test connection
      await this.client.ping();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      // Continue without cache if Redis is not available
      this.isConnected = false;
    }
  }

  private async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis disconnected');
    }
  }

  // Basic cache operations
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Error setting expiry for key ${key}:`, error);
      return false;
    }
  }

  // Pattern-based operations
  async delByPattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        return await this.client.del(...keys);
      }
      return 0;
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern ${pattern}:`, error);
      return 0;
    }
  }

  // List operations
  async lpush(key: string, value: any): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.lpush(key, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}:`, error);
      return false;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.isConnected) return [];
    
    try {
      const values = await this.client.lrange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      this.logger.error(`Error getting list range ${key}:`, error);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.ltrim(key, start, stop);
      return true;
    } catch (error) {
      this.logger.error(`Error trimming list ${key}:`, error);
      return false;
    }
  }

  // Set operations
  async sadd(key: string, member: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.sadd(key, member);
      return true;
    } catch (error) {
      this.logger.error(`Error adding to set ${key}:`, error);
      return false;
    }
  }

  async srem(key: string, member: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.srem(key, member);
      return true;
    } catch (error) {
      this.logger.error(`Error removing from set ${key}:`, error);
      return false;
    }
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.isConnected) return [];
    
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Error getting set members ${key}:`, error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking set membership ${key}:`, error);
      return false;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.hset(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Error setting hash field ${key}:${field}:`, error);
      return false;
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting hash field ${key}:${field}:`, error);
      return null;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    if (!this.isConnected) return {};
    
    try {
      const hash = await this.client.hgetall(key);
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error getting hash ${key}:`, error);
      return {};
    }
  }

  // Increment operations
  async incr(key: string): Promise<number | null> {
    if (!this.isConnected) return null;
    
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing ${key}:`, error);
      return null;
    }
  }

  async incrby(key: string, increment: number): Promise<number | null> {
    if (!this.isConnected) return null;
    
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      this.logger.error(`Error incrementing ${key} by ${increment}:`, error);
      return null;
    }
  }

  // Cache keys for different entities
  static getCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `signalspot:${prefix}:${parts.join(':')}`;
  }

  // Predefined cache key generators
  static keys = {
    user: (userId: string) => RedisCacheService.getCacheKey('user', userId),
    userProfile: (userId: string) => RedisCacheService.getCacheKey('user', userId, 'profile'),
    userSparks: (userId: string) => RedisCacheService.getCacheKey('user', userId, 'sparks'),
    
    spot: (spotId: string) => RedisCacheService.getCacheKey('spot', spotId),
    spotComments: (spotId: string) => RedisCacheService.getCacheKey('spot', spotId, 'comments'),
    spotLikes: (spotId: string) => RedisCacheService.getCacheKey('spot', spotId, 'likes'),
    nearbySpots: (lat: number, lng: number, radius: number) => 
      RedisCacheService.getCacheKey('spots', 'nearby', `${lat}`, `${lng}`, `${radius}`),
    popularSpots: () => RedisCacheService.getCacheKey('spots', 'popular'),
    
    spark: (sparkId: string) => RedisCacheService.getCacheKey('spark', sparkId),
    userSparksCount: (userId: string) => RedisCacheService.getCacheKey('spark', userId, 'count'),
    
    chatRoom: (roomId: string) => RedisCacheService.getCacheKey('chat', 'room', roomId),
    chatMessages: (roomId: string) => RedisCacheService.getCacheKey('chat', 'messages', roomId),
    unreadCount: (userId: string, roomId: string) => 
      RedisCacheService.getCacheKey('chat', 'unread', userId, roomId),
      
    notification: (userId: string) => RedisCacheService.getCacheKey('notification', userId),
    
    session: (sessionId: string) => RedisCacheService.getCacheKey('session', sessionId),
    
    rateLimit: (ip: string, endpoint: string) => 
      RedisCacheService.getCacheKey('ratelimit', ip, endpoint),
  };

  // Cache TTL values (in seconds)
  static TTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 3600,          // 1 hour
    VERY_LONG: 86400,    // 24 hours
    WEEK: 604800,        // 7 days
  };
}