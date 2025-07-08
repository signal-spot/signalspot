import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compressionMiddleware = compression({
    // Compression level (1-9, higher = better compression but slower)
    level: 6,
    
    // Minimum response size to compress (in bytes)
    threshold: 1024,
    
    // Filter function to determine what to compress
    filter: (req: Request, res: Response) => {
      // Don't compress if the response is already compressed
      if (res.headersSent) {
        return false;
      }

      // Don't compress images, videos, or already compressed files
      const contentType = res.getHeader('content-type') as string;
      if (contentType) {
        if (
          contentType.includes('image/') ||
          contentType.includes('video/') ||
          contentType.includes('audio/') ||
          contentType.includes('application/pdf') ||
          contentType.includes('application/zip') ||
          contentType.includes('application/gzip')
        ) {
          return false;
        }
      }

      // Don't compress real-time endpoints
      if (req.path.includes('/realtime') || req.path.includes('/stream')) {
        return false;
      }

      // Compress text-based content
      return compression.filter(req, res);
    },

    // Custom compression options for different content types
    windowBits: 15,
    memLevel: 8,
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.compressionMiddleware(req, res, next);
  }
}