import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      catchError((error) => {
        this.logger.error(
          `Error in ${request.method} ${request.url}: ${error.message}`,
          error.stack
        );

        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: this.getErrorCode(error),
            message: this.getErrorMessage(error),
            details: this.getErrorDetails(error),
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };

        // Convert to appropriate HTTP exception
        const httpException = this.convertToHttpException(error, errorResponse);
        return throwError(() => httpException);
      })
    );
  }

  private getErrorCode(error: any): string {
    if (error.code) return error.code;
    if (error.name) return error.name;
    if (error.constructor?.name) return error.constructor.name;
    return 'UNKNOWN_ERROR';
  }

  private getErrorMessage(error: any): string {
    if (error.response?.message) {
      return Array.isArray(error.response.message) 
        ? error.response.message.join(', ')
        : error.response.message;
    }
    return error.message || 'An unexpected error occurred';
  }

  private getErrorDetails(error: any): any {
    const details: any = {};

    // Include validation errors
    if (error.response?.message && Array.isArray(error.response.message)) {
      details.validationErrors = error.response.message;
    }

    // Include constraint violations
    if (error.constraint) {
      details.constraint = error.constraint;
    }

    // Include database errors
    if (error.code && (error.code.startsWith('23') || error.code.startsWith('42'))) {
      details.databaseError = {
        code: error.code,
        constraint: error.constraint,
        table: error.table,
        column: error.column,
      };
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }

  private convertToHttpException(error: any, errorResponse: ErrorResponse): any {
    // If it's already an HTTP exception, preserve it but update the response
    if (error.status) {
      const ExceptionClass = this.getExceptionClass(error.status);
      return new ExceptionClass(errorResponse);
    }

    // Handle specific database errors
    if (error.code) {
      switch (error.code) {
        case '23505': // Unique violation
          return new BadRequestException({
            ...errorResponse,
            error: {
              ...errorResponse.error,
              message: 'Resource already exists',
              code: 'DUPLICATE_RESOURCE',
            },
          });
        case '23503': // Foreign key violation
          return new BadRequestException({
            ...errorResponse,
            error: {
              ...errorResponse.error,
              message: 'Referenced resource not found',
              code: 'INVALID_REFERENCE',
            },
          });
        case '23502': // Not null violation
          return new BadRequestException({
            ...errorResponse,
            error: {
              ...errorResponse.error,
              message: 'Required field is missing',
              code: 'MISSING_REQUIRED_FIELD',
            },
          });
      }
    }

    // Handle domain-specific errors
    if (error.message) {
      if (error.message.includes('not found')) {
        return new NotFoundException(errorResponse);
      }
      if (error.message.includes('Access denied') || error.message.includes('cannot')) {
        return new ForbiddenException(errorResponse);
      }
      if (error.message.includes('Invalid') || error.message.includes('must be')) {
        return new BadRequestException(errorResponse);
      }
    }

    // Default to internal server error
    return new InternalServerErrorException({
      ...errorResponse,
      error: {
        ...errorResponse.error,
        message: 'An internal server error occurred',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }

  private getExceptionClass(status: number): any {
    switch (status) {
      case 400:
        return BadRequestException;
      case 401:
        return UnauthorizedException;
      case 403:
        return ForbiddenException;
      case 404:
        return NotFoundException;
      default:
        return InternalServerErrorException;
    }
  }
}