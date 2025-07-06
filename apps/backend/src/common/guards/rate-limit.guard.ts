import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      'rateLimit',
      [context.getHandler(), context.getClass()]
    );

    if (!rateLimitOptions) {
      return true; // No rate limiting configured
    }

    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request, rateLimitOptions);
    const now = Date.now();

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    // Get or create rate limit entry
    let entry = this.store[key];
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + rateLimitOptions.windowMs,
      };
      this.store[key] = entry;
    }

    // Check if limit exceeded
    if (entry.count >= rateLimitOptions.max) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: rateLimitOptions.message || 'Too many requests',
            details: {
              retryAfter: resetTime,
              limit: rateLimitOptions.max,
              windowMs: rateLimitOptions.windowMs,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment counter
    entry.count++;

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', rateLimitOptions.max);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitOptions.max - entry.count));
    response.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    return true;
  }

  private generateKey(request: any, options: RateLimitOptions): string {
    // Use IP address and user ID (if available) for key generation
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id || 'anonymous';
    const endpoint = `${request.method}:${request.route?.path || request.url}`;
    
    return `${ip}:${userId}:${endpoint}`;
  }

  private cleanupExpiredEntries(now: number): void {
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }
}

// Decorator to set rate limit options
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata('rateLimit', options, descriptor.value);
    } else {
      // Class decorator
      Reflect.defineMetadata('rateLimit', options, target);
    }
  };
};