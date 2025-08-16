import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../cache/redis-cache.service';

export interface RateLimitOptions {
  ttl: number; // Time window in seconds
  limit: number; // Max requests in time window
  skipIf?: (context: ExecutionContext) => boolean;
  keyGenerator?: (context: ExecutionContext) => string;
  message?: string;
}

/**
 * Advanced rate limiting with Redis backend and flexible configuration
 */
@Injectable()
export class AdvancedRateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(AdvancedRateLimitGuard.name);
  
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly cacheService: RedisCacheService,
  ) {
    super(
      {
        ttl: configService.get('security.rateLimit.ttl', 60),
        limit: configService.get('security.rateLimit.max', 100),
      },
      {
        errorMessage: 'Too many requests. Please try again later.',
      },
      reflector,
    );
  }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get custom rate limit options from decorator
    const customOptions = this.reflector.get<RateLimitOptions>(
      'rateLimit',
      context.getHandler(),
    );
    
    const options: RateLimitOptions = {
      ttl: customOptions?.ttl || this.configService.get('security.rateLimit.ttl', 60),
      limit: customOptions?.limit || this.configService.get('security.rateLimit.max', 100),
      skipIf: customOptions?.skipIf,
      keyGenerator: customOptions?.keyGenerator || this.defaultKeyGenerator,
      message: customOptions?.message || 'Too many requests. Please try again later.',
    };
    
    // Check if should skip rate limiting
    if (options.skipIf && options.skipIf(context)) {
      return true;
    }
    
    // Skip for authenticated users if configured
    if (
      this.configService.get('security.rateLimit.skipIfLoggedIn') &&
      request.user
    ) {
      return true;
    }
    
    // Generate rate limit key
    const key = options.keyGenerator(context);
    const rateLimitKey = `ratelimit:${key}`;
    
    try {
      // Get current count from Redis
      const currentCount = await this.cacheService.incr(rateLimitKey);
      
      // Set TTL on first request
      if (currentCount === 1) {
        await this.cacheService.expire(rateLimitKey, options.ttl);
      }
      
      // Get TTL for headers
      const ttl = await this.getTTL(rateLimitKey);
      
      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', options.limit);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - currentCount));
      response.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());
      
      // Check if limit exceeded
      if (currentCount > options.limit) {
        // Log rate limit violation
        this.logger.warn({
          message: 'Rate limit exceeded',
          key,
          count: currentCount,
          limit: options.limit,
          ip: request.ip,
          path: request.path,
          method: request.method,
          user: request.user?.id,
        });
        
        // Set retry-after header
        response.setHeader('Retry-After', ttl);
        
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: options.message,
            error: 'Too Many Requests',
            retryAfter: ttl,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      // If Redis fails, allow request but log error
      this.logger.error('Rate limit check failed', error);
      return true;
    }
  }
  
  private defaultKeyGenerator(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    
    // Use combination of IP, user ID (if authenticated), and endpoint
    const parts = [
      request.ip || 'unknown',
      request.user?.id || 'anonymous',
      request.method,
      request.path,
    ];
    
    return parts.join(':');
  }
  
  private async getTTL(key: string): Promise<number> {
    try {
      // Get TTL from Redis (this would need to be implemented in RedisCacheService)
      const ttl = await this.cacheService['client'].ttl(key);
      return ttl > 0 ? ttl : 0;
    } catch {
      return 0;
    }
  }
}

/**
 * Decorator for custom rate limiting
 */
export function RateLimit(options: Partial<RateLimitOptions>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('rateLimit', options, descriptor.value);
    return descriptor;
  };
}