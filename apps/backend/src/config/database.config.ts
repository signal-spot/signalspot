import { registerAs } from '@nestjs/config';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';

/**
 * Database configuration with proper environment variable handling
 */
export default registerAs('database', (): MikroOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Validate required database configuration
  if (isProduction) {
    const required = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required database configuration: ${missing.join(', ')}`);
    }
    
    // Validate password strength in production
    const password = process.env.DB_PASSWORD;
    if (password.length < 16) {
      throw new Error('Database password must be at least 16 characters in production');
    }
  }
  
  return {
    driver: PostgreSqlDriver,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dbName: process.env.DB_NAME || 'signalspot',
    
    // Connection pool settings
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    },
    
    // SSL configuration for production
    driverOptions: isProduction && process.env.DB_SSL === 'true' ? {
      connection: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    } : undefined,
    
    // Entity discovery
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    
    // Migrations
    migrations: {
      path: 'dist/migrations',
      pathTs: 'src/migrations',
      glob: '!(*.d).{js,ts}',
      transactional: true,
      disableForeignKeys: false,
      allOrNothing: true,
      safe: isProduction,
      emit: 'ts',
    },
    
    // Development settings
    debug: !isProduction && process.env.DB_DEBUG === 'true',
    logger: console.log.bind(console),
    
    // Schema settings
    schemaGenerator: {
      disableForeignKeys: false,
      createForeignKeyConstraints: true,
      ignoreSchema: [],
    },
    
    // Performance optimizations
    autoFlush: true,
    forceUtcTimezone: true,
    timezone: 'Asia/Seoul',
    
    // Validation
    validate: true,
    strict: true,
    
    // Naming strategy
    namingStrategy: UnderscoreNamingStrategy,
  };
});