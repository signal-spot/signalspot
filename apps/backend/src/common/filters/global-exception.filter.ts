import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    // HTTP 예외 처리
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
        details = responseObj.details || null;
      }
    }
    // 데이터베이스 쿼리 에러 처리
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Query Error';
      
      // PostgreSQL 에러 코드에 따른 메시지 처리
      const pgError = exception as any;
      switch (pgError.code) {
        case '23505': // unique_violation
          message = 'Duplicate entry. This record already exists.';
          details = {
            field: pgError.constraint,
            value: pgError.detail,
          };
          break;
        case '23503': // foreign_key_violation
          message = 'Referenced record does not exist.';
          break;
        case '23502': // not_null_violation
          message = 'Required field is missing.';
          details = {
            column: pgError.column,
          };
          break;
        case '22P02': // invalid_text_representation
          message = 'Invalid data format.';
          break;
        default:
          message = 'Database operation failed.';
          details = {
            code: pgError.code,
            detail: pgError.detail,
          };
      }
    }
    // Validation 에러 처리
    else if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Request validation failed';
      details = this.formatValidationErrors(exception);
    }
    // TypeError 처리
    else if (exception instanceof TypeError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Type Error';
      message = exception.message;
    }
    // 일반 Error 처리
    else if (exception instanceof Error) {
      message = exception.message;
      
      // 특정 에러 메시지에 따른 상태 코드 조정
      if (message.includes('not found') || message.includes('Not found')) {
        status = HttpStatus.NOT_FOUND;
        error = 'Not Found';
      } else if (message.includes('unauthorized') || message.includes('Unauthorized')) {
        status = HttpStatus.UNAUTHORIZED;
        error = 'Unauthorized';
      } else if (message.includes('forbidden') || message.includes('Forbidden')) {
        status = HttpStatus.FORBIDDEN;
        error = 'Forbidden';
      } else if (message.includes('bad request') || message.includes('Bad request')) {
        status = HttpStatus.BAD_REQUEST;
        error = 'Bad Request';
      }
    }

    // 에러 로깅
    this.logError(exception, request, status);

    // 에러 응답
    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // 개발 환경에서는 스택 트레이스 포함
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(errors: ValidationError[]): any {
    const formatted: any = {};
    
    errors.forEach((error) => {
      const property = error.property;
      formatted[property] = {
        value: error.value,
        constraints: error.constraints,
        children: error.children?.length ? this.formatValidationErrors(error.children) : undefined,
      };
    });
    
    return formatted;
  }

  private logError(exception: unknown, request: Request, status: number) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      userId: (request as any).user?.id,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    if (status >= 500) {
      this.logger.error(
        `Server Error: ${JSON.stringify(errorInfo)}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client Error: ${JSON.stringify(errorInfo)}`,
        exception instanceof Error ? exception.message : exception,
      );
    }
  }
}