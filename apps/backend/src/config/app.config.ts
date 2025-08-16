import { registerAs } from '@nestjs/config';

/**
 * Application configuration
 * All environment variables should be accessed through this configuration
 */
export default registerAs('app', () => ({
  // Node Environment
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  
  // Security
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || (
    process.env.NODE_ENV === 'production' 
      ? 'https://app.signalspot.com'
      : 'http://localhost:8080'
  ),
  
  // Application Settings
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  },
  
  location: {
    defaultSearchRadius: parseInt(process.env.DEFAULT_SEARCH_RADIUS, 10) || 1000,
    maxSearchRadius: parseInt(process.env.MAX_SEARCH_RADIUS, 10) || 50000,
  },
  
  spark: {
    expiryHours: parseInt(process.env.SPARK_EXPIRY_HOURS, 10) || 72,
    maxDistanceMeters: parseInt(process.env.SPARK_MAX_DISTANCE_METERS, 10) || 100,
  },
  
  signalSpot: {
    defaultExpiryHours: parseInt(process.env.SPOT_DEFAULT_EXPIRY_HOURS, 10) || 24,
    maxExpiryHours: parseInt(process.env.SPOT_MAX_EXPIRY_HOURS, 10) || 168,
    defaultRadiusMeters: parseInt(process.env.SPOT_DEFAULT_RADIUS_METERS, 10) || 100,
    maxRadiusMeters: parseInt(process.env.SPOT_MAX_RADIUS_METERS, 10) || 5000,
  },
  
  // Feature Flags
  features: {
    websocket: process.env.ENABLE_WEBSOCKET === 'true',
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    healthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
  },
  
  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9090,
    sentryDsn: process.env.SENTRY_DSN,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
}));