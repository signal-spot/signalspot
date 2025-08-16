import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { LoggerService } from '../common/services/logger.service';

/**
 * Redis configuration with proper defaults and validation
 */
export default registerAs('redis', (): RedisOptions & { url?: string } => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use Redis URL if provided
  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      lazyConnect: false,
    };
  }
  
  // Validate Redis configuration in production
  if (isProduction && !process.env.REDIS_PASSWORD) {
    const logger = new LoggerService();
    logger.warn('Redis password not set in production environment', 'RedisConfig');
  }
  
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    
    // Connection settings
    family: 4, // IPv4
    connectTimeout: 10000,
    keepAlive: 10000,
    noDelay: true,
    
    // Retry strategy
    retryStrategy: (times: number) => {
      if (times > 10) {
        // Stop retrying after 10 attempts
        return null;
      }
      // Exponential backoff with max 2 seconds
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    
    // Request settings
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    
    // Performance settings
    lazyConnect: false,
    
    // TLS settings for production
    ...(isProduction && process.env.REDIS_TLS === 'true' ? {
      tls: {
        rejectUnauthorized: false,
      },
    } : {}),
  };
});