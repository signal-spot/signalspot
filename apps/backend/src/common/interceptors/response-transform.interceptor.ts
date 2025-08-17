import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  path: string;
  statusCode: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: {
    version: string;
    responseTime?: string;
    cached?: boolean;
    requestId?: string;
  };
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseTransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();
    const requestId = request.headers['x-request-id'] || this.generateRequestId();

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - startTime;
        
        // Don't transform if data is already in API response format
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            metadata: {
              ...data.metadata,
              requestId,
              responseTime: `${responseTime}ms`,
            },
          };
        }

        // Don't transform file downloads or streams
        if (response.getHeader('content-type')?.includes('application/octet-stream') ||
            response.getHeader('content-disposition')?.includes('attachment')) {
          return data;
        }

        // Transform data into standard API response format
        const apiResponse: ApiResponse = {
          success: true,
          data: this.optimizeData(data),
          timestamp: new Date().toISOString(),
          path: request.url,
          statusCode: response.statusCode,
          metadata: {
            version: '1.0',
            responseTime: `${responseTime}ms`,
            cached: response.getHeader('x-cache-status') === 'HIT',
            requestId,
          },
        };

        // Add pagination info if present in original data
        if (data && typeof data === 'object') {
          if ('pagination' in data) {
            apiResponse.pagination = data.pagination;
            apiResponse.data = data.data || data.items;
          }
          
          // Preserve unreadCount for notification responses
          if ('unreadCount' in data) {
            apiResponse['unreadCount'] = data.unreadCount;
          }
          
          if ('total' in data && 'limit' in data && 'offset' in data) {
            const { total, limit, offset } = data;
            const page = Math.floor(offset / limit) + 1;
            const totalPages = Math.ceil(total / limit);
            
            apiResponse.pagination = {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            };
            
            // Extract actual data
            if ('items' in data) {
              apiResponse.data = data.items;
            }
          }
        }

        // Add cache headers for cacheable responses
        if (this.isCacheable(request, data)) {
          response.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
          response.setHeader('ETag', this.generateETag(data));
        }

        return apiResponse;
      }),
    );
  }

  private optimizeData(data: any): any {
    if (!data) return data;

    // Remove internal/private fields
    if (Array.isArray(data)) {
      return data.map(item => this.cleanItem(item));
    }

    if (typeof data === 'object') {
      return this.cleanItem(data);
    }

    return data;
  }

  private cleanItem(item: any): any {
    if (!item || typeof item !== 'object') return item;

    const cleaned = { ...item };

    // Remove internal fields
    const internalFields = [
      'password',
      'passwordHash',
      'salt',
      'apiKey',
      'secretKey',
      'internalId',
      '_internal',
      '__v',
    ];

    internalFields.forEach(field => {
      delete cleaned[field];
    });

    // Optimize date fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] instanceof Date) {
        cleaned[key] = cleaned[key].toISOString();
      }
      
      // Recursively clean nested objects
      if (cleaned[key] && typeof cleaned[key] === 'object' && !Array.isArray(cleaned[key])) {
        cleaned[key] = this.cleanItem(cleaned[key]);
      }
      
      // Clean arrays of objects
      if (Array.isArray(cleaned[key])) {
        cleaned[key] = cleaned[key].map((nestedItem: any) => 
          typeof nestedItem === 'object' ? this.cleanItem(nestedItem) : nestedItem
        );
      }
    });

    return cleaned;
  }

  private isCacheable(request: any, data: any): boolean {
    // Only cache GET requests
    if (request.method !== 'GET') return false;

    // Don't cache user-specific data
    if (request.url.includes('/me') || request.url.includes('/profile')) return false;

    // Don't cache real-time data
    if (request.url.includes('/realtime') || request.url.includes('/live')) return false;

    // Cache public data
    if (request.url.includes('/public') || request.url.includes('/spots')) return true;

    return false;
  }

  private generateETag(data: any): string {
    // Simple ETag generation based on data hash
    const dataString = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `"${Math.abs(hash).toString(36)}"`;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}