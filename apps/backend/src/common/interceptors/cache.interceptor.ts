import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache/cache.service';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export const CacheKey = (key: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_KEY_METADATA, key, descriptor.value);
    return descriptor;
  };
};

export const CacheTTL = (ttl: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_TTL_METADATA, ttl, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, handler);
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, handler);

    if (!cacheKey) {
      return next.handle();
    }

    // Build dynamic cache key
    const dynamicCacheKey = this.buildCacheKey(cacheKey, request);

    try {
      // Try to get from cache
      const cachedResult = await this.cacheService.get(dynamicCacheKey);
      
      if (cachedResult !== null) {
        this.logger.debug(`Cache hit for key: ${dynamicCacheKey}`);
        return of(cachedResult);
      }

      // Cache miss - execute handler and cache result
      return next.handle().pipe(
        tap(async (data) => {
          if (data && !this.shouldSkipCache(data)) {
            const ttl = cacheTTL || 300; // Default 5 minutes
            await this.cacheService.set(dynamicCacheKey, data, { ttl });
            this.logger.debug(`Cached result for key: ${dynamicCacheKey} (TTL: ${ttl}s)`);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache error for key ${dynamicCacheKey}:`, error);
      return next.handle();
    }
  }

  private buildCacheKey(template: string, request: any): string {
    let cacheKey = template;
    
    // Replace placeholders with actual values
    cacheKey = cacheKey.replace(/:userId/g, request.user?.id || 'anonymous');
    cacheKey = cacheKey.replace(/:id/g, request.params?.id || '');
    
    // Add query parameters for pagination, filtering etc.
    const queryParams = new URLSearchParams();
    Object.keys(request.query || {}).forEach(key => {
      if (['limit', 'offset', 'page', 'filter', 'sort'].includes(key)) {
        queryParams.append(key, request.query[key]);
      }
    });
    
    if (queryParams.toString()) {
      cacheKey += `?${queryParams.toString()}`;
    }

    return cacheKey;
  }

  private shouldSkipCache(data: any): boolean {
    // Skip caching errors or empty results
    if (!data || data.error) {
      return true;
    }

    // Skip caching real-time data
    if (data.realTime || data.timestamp) {
      return true;
    }

    return false;
  }
}

// Utility decorators for easy caching
export const Cacheable = (key: string, ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    CacheKey(key)(target, propertyKey, descriptor);
    CacheTTL(ttl)(target, propertyKey, descriptor);
    return descriptor;
  };
};