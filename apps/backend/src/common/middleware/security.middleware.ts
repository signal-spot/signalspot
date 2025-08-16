import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

/**
 * Security middleware for production-grade protection
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private helmetMiddleware: any;
  
  constructor(private readonly configService: ConfigService) {
    const isProduction = this.configService.get('app.isProduction');
    
    // Configure helmet with security headers
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: isProduction ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'wss:', 'https:'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:'],
        },
      } : false,
      
      crossOriginEmbedderPolicy: isProduction,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: isProduction ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      } : false,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    });
  }
  
  use(req: Request, res: Response, next: NextFunction) {
    // Apply helmet middleware
    this.helmetMiddleware(req, res, () => {
      // Additional security headers
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      
      // Remove fingerprinting headers
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      
      // Add custom security headers
      if (this.configService.get('app.isProduction')) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        res.setHeader('Expect-CT', 'max-age=86400, enforce');
      }
      
      next();
    });
  }
}