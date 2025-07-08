import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';

/**
 * Test configuration for the SignalSpot application
 */
export const testConfig = {
  // Database configuration for testing
  database: {
    type: 'sqlite' as const,
    dbName: ':memory:',
    entities: ['./src/**/*.entity.ts'],
    entitiesTs: ['./src/**/*.entity.ts'],
    synchronize: true,
    debug: false,
    allowGlobalContext: true,
  },

  // Test timeouts
  timeouts: {
    unit: 5000, // 5 seconds for unit tests
    integration: 10000, // 10 seconds for integration tests
    e2e: 30000, // 30 seconds for e2e tests
  },

  // Performance thresholds
  performance: {
    maxResponseTime: 1000, // 1 second
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxCpuUsage: 80, // 80%
  },

  // Test data configuration
  testData: {
    users: {
      count: 10,
      defaultPassword: 'testpassword123',
    },
    signalSpots: {
      count: 50,
      defaultRadius: 100,
    },
    sparks: {
      count: 20,
    },
  },

  // Mock services configuration
  mocks: {
    enableEmailService: false,
    enablePushNotifications: false,
    enableS3Upload: false,
    enableRedisCache: false,
  },

  // Test environment variables
  env: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    JWT_SECRET: 'test-jwt-secret',
    BCRYPT_ROUNDS: '1', // Faster hashing for tests
  },
};

/**
 * Create a test module with common configuration
 */
export const createTestModule = (moduleMetadata: any) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => testConfig],
      }),
      MikroOrmModule.forRoot(testConfig.database),
      ...(moduleMetadata.imports || []),
    ],
    controllers: moduleMetadata.controllers || [],
    providers: moduleMetadata.providers || [],
    exports: moduleMetadata.exports || [],
  });
};

/**
 * Test suite configuration
 */
export const testSuiteConfig = {
  // Unit tests configuration
  unit: {
    setupFilesAfterEnv: ['<rootDir>/src/common/testing/setup-unit.ts'],
    testMatch: ['**/*.spec.ts'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },

  // Integration tests configuration
  integration: {
    setupFilesAfterEnv: ['<rootDir>/src/common/testing/setup-integration.ts'],
    testMatch: ['**/*.integration.spec.ts'],
    testTimeout: testConfig.timeouts.integration,
  },

  // E2E tests configuration
  e2e: {
    setupFilesAfterEnv: ['<rootDir>/src/common/testing/setup-e2e.ts'],
    testMatch: ['**/*.e2e.spec.ts'],
    testTimeout: testConfig.timeouts.e2e,
  },

  // Performance tests configuration
  performance: {
    setupFilesAfterEnv: ['<rootDir>/src/common/testing/setup-performance.ts'],
    testMatch: ['**/*.perf.spec.ts'],
    testTimeout: 60000, // 1 minute for performance tests
  },
};

/**
 * Test database setup
 */
export const setupTestDatabase = async () => {
  // Set environment variables
  Object.entries(testConfig.env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  // Additional setup can be added here
  return testConfig.database;
};

/**
 * Test cleanup utilities
 */
export const cleanupTestDatabase = async () => {
  // Cleanup logic can be added here
  console.log('Test database cleanup completed');
};

/**
 * Performance test configuration
 */
export const performanceTestConfig = {
  // Load testing parameters
  load: {
    light: { users: 10, duration: 30 }, // 30 seconds
    medium: { users: 50, duration: 60 }, // 1 minute
    heavy: { users: 100, duration: 120 }, // 2 minutes
  },

  // Performance benchmarks
  benchmarks: {
    databaseQuery: { maxTime: 100, iterations: 1000 },
    apiResponse: { maxTime: 500, iterations: 100 },
    cacheAccess: { maxTime: 10, iterations: 10000 },
    memoryUsage: { maxHeap: 200 * 1024 * 1024 }, // 200MB
  },

  // Stress testing parameters
  stress: {
    rampUp: 30, // 30 seconds to reach max users
    sustainPeak: 60, // 60 seconds at peak load
    rampDown: 30, // 30 seconds to ramp down
  },
};

/**
 * Test reporting configuration
 */
export const testReportingConfig = {
  // Coverage reporting
  coverage: {
    enabled: true,
    directory: 'coverage',
    formats: ['html', 'lcov', 'text'],
    includeUntested: true,
  },

  // Performance reporting
  performance: {
    enabled: true,
    directory: 'performance-reports',
    formats: ['json', 'html'],
    includeCharts: true,
  },

  // Test results reporting
  results: {
    enabled: true,
    directory: 'test-results',
    formats: ['junit', 'json'],
    includeTimings: true,
  },
};

/**
 * Test utilities configuration
 */
export const testUtilitiesConfig = {
  // Snapshot testing
  snapshots: {
    enabled: true,
    updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true',
    failOnMissingSnapshots: true,
  },

  // Mock configuration
  mocks: {
    clearBetweenTests: true,
    resetBetweenTests: true,
    restoreBetweenTests: false,
  },

  // Test data generation
  dataGeneration: {
    seed: 12345, // Fixed seed for reproducible tests
    locale: 'en',
    timezone: 'UTC',
  },
};

/**
 * Export all configurations
 */
export default {
  testConfig,
  createTestModule,
  testSuiteConfig,
  setupTestDatabase,
  cleanupTestDatabase,
  performanceTestConfig,
  testReportingConfig,
  testUtilitiesConfig,
};