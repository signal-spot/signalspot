import { registerAs } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Security configuration
 */
export default registerAs('security', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Generate secure defaults for development
  const generateDevSecret = (name: string) => {
    if (isProduction) {
      throw new Error(`${name} is required in production`);
    }
    return crypto.randomBytes(32).toString('base64');
  };
  
  // Validate security settings in production
  if (isProduction) {
    const requiredSecrets = [
      'ENCRYPTION_KEY',
      'HMAC_SECRET', 
      'SESSION_SECRET'
    ];
    
    for (const secret of requiredSecrets) {
      const value = process.env[secret];
      if (!value || value.length < 32) {
        throw new Error(`${secret} must be at least 32 characters in production`);
      }
      
      // Check for placeholder values
      if (value.includes('CHANGE_THIS') || value.includes('your_')) {
        throw new Error(`${secret} contains placeholder value. Please set a secure value`);
      }
    }
  }
  
  return {
    // Bcrypt settings
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    },
    
    // Encryption settings
    encryption: {
      key: process.env.ENCRYPTION_KEY || generateDevSecret('ENCRYPTION_KEY'),
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      tagLength: 16,
      saltLength: 64,
      iterations: 100000,
    },
    
    // HMAC settings
    hmac: {
      secret: process.env.HMAC_SECRET || generateDevSecret('HMAC_SECRET'),
      algorithm: 'sha256',
    },
    
    // Session settings
    session: {
      secret: process.env.SESSION_SECRET || generateDevSecret('SESSION_SECRET'),
      name: 'signalspot.sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
    
    // CORS settings
    cors: {
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : isProduction 
          ? ['https://app.signalspot.com']
          : ['http://localhost:8080', 'http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
      maxAge: 86400, // 24 hours
    },
    
    // Rate limiting
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      skipIfLoggedIn: process.env.RATE_LIMIT_SKIP_IF_LOGGED_IN === 'true',
    },
    
    // Password policy
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLength: 128,
      preventCommon: true,
      preventUserInfo: true,
    },
    
    // Headers security
    headers: {
      contentSecurityPolicy: isProduction ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      } : false,
      xssProtection: true,
      noSniff: true,
      frameguard: { action: 'deny' },
      hsts: isProduction ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      } : false,
    },
  };
});