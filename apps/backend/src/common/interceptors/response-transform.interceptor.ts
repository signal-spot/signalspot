import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || 
                     request.headers['x-correlation-id'] || 
                     this.generateRequestId();

    return next.handle().pipe(
      map((data) => {
        // If the data is already in the correct format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
              requestId,
              ...data.meta,
            },
          };
        }

        // Transform the data to standard format
        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
            requestId,
          },
        };
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}