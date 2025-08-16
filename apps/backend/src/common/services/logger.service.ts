import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
const DailyRotateFile = require('winston-daily-rotate-file');
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
      })
    );

    // Console transport for development
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const contextStr = context ? `[${context}]` : '';
          return `${timestamp} ${level} ${contextStr} ${message}`;
        })
      ),
    });

    const transports: winston.transport[] = [consoleTransport];

    // Add file transports only in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // File transport for errors
        const errorFileTransport = new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: logFormat,
        });

        // File transport for combined logs
        const combinedFileTransport = new DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        });

        transports.push(errorFileTransport, combinedFileTransport);
      } catch (error) {
        console.warn('Failed to setup file logging:', error);
      }
    }

    // Create winston logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      format: logFormat,
      transports,
    });
  }

  log(message: any, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context });
  }

  // Additional helper methods
  logWithUser(message: string, userId: string, context?: string): void {
    this.logger.info(message, { userId, context });
  }

  logError(error: Error, context?: string, additionalData?: any): void {
    this.logger.error(error.message, {
      context,
      stack: error.stack,
      ...additionalData,
    });
  }

  // Security-sensitive logging (strips sensitive data)
  logSecure(message: string, data: any, context?: string): void {
    const sanitized = this.sanitizeData(data);
    this.logger.info(message, { context, data: sanitized });
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitive = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key of Object.keys(sanitized)) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }
}