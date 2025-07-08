import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { CacheService, CacheOptions } from './cache.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name);
  private readonly USER_CACHE_TTL = 3600; // 1 hour
  private readonly PROFILE_CACHE_TTL = 1800; // 30 minutes
  private readonly LOCATION_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly cacheService: CacheService,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  /**
   * Get user profile from cache or database
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const cacheKey = `user:profile:${userId}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({ id: userId });
        return user;
      },
      { ttl: this.PROFILE_CACHE_TTL, prefix: 'signalspot' }
    );
  }

  /**
   * Get user basic info (lightweight)
   */
  async getUserBasicInfo(userId: string): Promise<Partial<User> | null> {
    const cacheKey = `user:basic:${userId}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({ id: userId });
        return user;
      },
      { ttl: this.USER_CACHE_TTL, prefix: 'signalspot' }
    );
  }

  /**
   * Get multiple user basic info
   */
  async getMultipleUserBasicInfo(userIds: string[]): Promise<Record<string, Partial<User> | null>> {
    const cacheKeys = userIds.map(id => `user:basic:${id}`);
    const cached = await this.cacheService.mget<Partial<User>>(cacheKeys);
    
    const result: Record<string, Partial<User> | null> = {};
    const missingUserIds: string[] = [];

    // Check which users are missing from cache
    userIds.forEach((userId, index) => {
      if (cached[index] !== null) {
        result[userId] = cached[index];
      } else {
        missingUserIds.push(userId);
      }
    });

    // Fetch missing users from database
    if (missingUserIds.length > 0) {
      const users = await this.userRepository.find({ id: { $in: missingUserIds } });

      // Cache the fetched users
      const cacheItems = users.map(user => ({
        key: `user:basic:${user.id}`,
        value: user
      }));

      await this.cacheService.mset(cacheItems, { ttl: this.USER_CACHE_TTL });

      // Add to result
      users.forEach(user => {
        result[user.id] = user;
      });

      // Mark non-existent users as null
      missingUserIds.forEach(userId => {
        if (!result[userId]) {
          result[userId] = null;
        }
      });
    }

    return result;
  }

  /**
   * Get user location info
   */
  async getUserLocation(userId: string): Promise<{
    latitude?: number;
    longitude?: number;
    lastLocationUpdateAt?: Date;
    locationPrivacy?: string;
  } | null> {
    const cacheKey = `user:location:${userId}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({ id: userId });
        
        if (!user) return null;
        
        return {
          latitude: user.lastKnownLatitude,
          longitude: user.lastKnownLongitude,
          lastLocationUpdateAt: user.lastLocationUpdateAt,
          locationPrivacy: user.locationPrivacy,
        };
      },
      { ttl: this.LOCATION_CACHE_TTL, prefix: 'signalspot' }
    );
  }

  /**
   * Cache user's active status
   */
  async cacheUserActiveStatus(userId: string, isActive: boolean): Promise<void> {
    const cacheKey = `user:active:${userId}`;
    await this.cacheService.set(cacheKey, isActive, { ttl: 600 }); // 10 minutes
  }

  /**
   * Get user's active status from cache
   */
  async getUserActiveStatus(userId: string): Promise<boolean | null> {
    const cacheKey = `user:active:${userId}`;
    return await this.cacheService.get<boolean>(cacheKey);
  }

  /**
   * Cache user settings
   */
  async cacheUserSettings(userId: string, settings: any): Promise<void> {
    const cacheKey = `user:settings:${userId}`;
    await this.cacheService.set(cacheKey, settings, { ttl: this.USER_CACHE_TTL });
  }

  /**
   * Get user settings from cache
   */
  async getUserSettings(userId: string): Promise<any | null> {
    const cacheKey = `user:settings:${userId}`;
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      `signalspot:user:profile:${userId}`,
      `signalspot:user:basic:${userId}`,
      `signalspot:user:location:${userId}`,
      `signalspot:user:active:${userId}`,
      `signalspot:user:settings:${userId}`,
    ];

    await Promise.all(patterns.map(pattern => this.cacheService.del(pattern)));
    this.logger.debug(`Invalidated cache for user ${userId}`);
  }

  /**
   * Invalidate multiple users cache
   */
  async invalidateUsers(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map(userId => this.invalidateUser(userId)));
  }

  /**
   * Cache user online status for real-time features
   */
  async setUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const cacheKey = `user:online:${userId}`;
    if (isOnline) {
      await this.cacheService.set(cacheKey, Date.now(), { ttl: 300 }); // 5 minutes
    } else {
      await this.cacheService.del(cacheKey);
    }
  }

  /**
   * Get user online status
   */
  async getUserOnlineStatus(userId: string): Promise<boolean> {
    const cacheKey = `user:online:${userId}`;
    const lastSeen = await this.cacheService.get<number>(cacheKey);
    
    if (!lastSeen) return false;
    
    // Consider user online if last seen within 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  }

  /**
   * Get multiple users online status
   */
  async getMultipleUsersOnlineStatus(userIds: string[]): Promise<Record<string, boolean>> {
    const cacheKeys = userIds.map(id => `user:online:${id}`);
    const lastSeenTimes = await this.cacheService.mget<number>(cacheKeys);
    
    const result: Record<string, boolean> = {};
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    userIds.forEach((userId, index) => {
      const lastSeen = lastSeenTimes[index];
      result[userId] = lastSeen ? lastSeen > fiveMinutesAgo : false;
    });

    return result;
  }

  /**
   * Cache user preferences
   */
  async cacheUserPreferences(userId: string, preferences: Record<string, any>): Promise<void> {
    const cacheKey = `user:preferences:${userId}`;
    await this.cacheService.set(cacheKey, preferences, { ttl: this.USER_CACHE_TTL });
  }

  /**
   * Get user preferences from cache
   */
  async getUserPreferences(userId: string): Promise<Record<string, any> | null> {
    const cacheKey = `user:preferences:${userId}`;
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Cache user stats for dashboard
   */
  async cacheUserStats(userId: string, stats: any): Promise<void> {
    const cacheKey = `user:stats:${userId}`;
    await this.cacheService.set(cacheKey, stats, { ttl: 3600 }); // 1 hour
  }

  /**
   * Get user stats from cache
   */
  async getUserStats(userId: string): Promise<any | null> {
    const cacheKey = `user:stats:${userId}`;
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Pre-warm cache for active users
   */
  async preWarmActiveUsers(): Promise<void> {
    try {
      const activeUsers = await this.userRepository.find(
        { 
          isActive: true,
          lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        },
        { 
          limit: 1000 
        }
      );

      const cacheItems = activeUsers.map(user => ({
        key: `user:basic:${user.id}`,
        value: user
      }));

      await this.cacheService.mset(cacheItems, { ttl: this.USER_CACHE_TTL });
      this.logger.log(`Pre-warmed cache for ${activeUsers.length} active users`);
    } catch (error) {
      this.logger.error('Error pre-warming user cache:', error);
    }
  }
}