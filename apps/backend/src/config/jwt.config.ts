import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT configuration with secure defaults
 */
export default registerAs('jwt', (): JwtModuleOptions & { refreshSecret: string; refreshExpiresIn: string } => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Validate JWT secrets in production
  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }
    
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }
    
    // Check for common weak secrets
    const weakSecrets = ['secret', 'password', 'changeme', 'test', 'demo'];
    const jwtSecret = process.env.JWT_SECRET.toLowerCase();
    
    if (weakSecrets.some(weak => jwtSecret.includes(weak))) {
      throw new Error('JWT_SECRET contains weak patterns. Please use a cryptographically secure random string');
    }
  }
  
  return {
    secret: process.env.JWT_SECRET || (isProduction 
      ? (() => { throw new Error('JWT_SECRET is required in production'); })()
      : 'development-only-secret-change-in-production'),
    
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'signalspot',
      audience: 'signalspot-app',
      algorithm: 'HS256',
    },
    
    verifyOptions: {
      issuer: 'signalspot',
      audience: 'signalspot-app',
      algorithms: ['HS256'],
      clockTolerance: 5, // 5 seconds clock tolerance
    },
    
    // Refresh token configuration
    refreshSecret: process.env.JWT_REFRESH_SECRET || (isProduction
      ? (() => { throw new Error('JWT_REFRESH_SECRET is required in production'); })()
      : 'development-only-refresh-secret-change-in-production'),
    
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});