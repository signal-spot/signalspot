import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - start;
        const response = context.switchToHttp().getResponse();
        
        // Log slow requests (>1 second)
        if (responseTime > 1000) {
          this.logger.warn(
            `Slow request: ${method} ${url} - ${responseTime}ms - ${response.statusCode} - ${userAgent}`
          );
        }

        // Log performance metrics
        this.logger.debug(
          `${method} ${url} - ${responseTime}ms - ${response.statusCode}`
        );

        // Add performance headers
        response.setHeader('X-Response-Time', `${responseTime}ms`);
        response.setHeader('X-Timestamp', new Date().toISOString());
      })
    );
  }
}