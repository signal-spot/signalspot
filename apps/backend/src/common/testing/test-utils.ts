import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionContext } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { SignalSpot } from '../../entities/signal-spot.entity';
import { Spark } from '../../spark/entities/spark.entity';

/**
 * Mock repository factory for testing
 */
export const createMockRepository = <T = any>(): Partial<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn(),
  })),
});

/**
 * Mock EntityManager for testing
 */
export const createMockEntityManager = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  getRepository: jest.fn(),
  createQueryBuilder: jest.fn(),
  query: jest.fn(),
  transaction: jest.fn(),
  getConnection: jest.fn(() => ({
    execute: jest.fn(),
    query: jest.fn(),
  })),
});

/**
 * Factory for creating test users
 */
export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    const user = new User();
    user.id = overrides.id || 'test-user-id';
    user.email = overrides.email || 'test@example.com';
    user.username = overrides.username || 'testuser';
    user.isVerified = overrides.isVerified ?? true;
    user.isActive = overrides.isActive ?? true;
    user.createdAt = overrides.createdAt || new Date();
    user.updatedAt = overrides.updatedAt || new Date();
    
    return Object.assign(user, overrides);
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({ 
        id: `test-user-${index + 1}`,
        email: `test${index + 1}@example.com`,
        username: `testuser${index + 1}`,
        ...overrides 
      })
    );
  }

  static createDto(overrides: any = {}): any {
    return {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      ...overrides,
    };
  }
}

/**
 * Factory for creating test signal spots
 */
export class SignalSpotFactory {
  static create(overrides: Partial<SignalSpot> = {}): SignalSpot {
    const spot = new SignalSpot();
    spot.id = overrides.id || 'test-spot-id';
    spot.userId = overrides.userId || 'test-user-id';
    spot.title = overrides.title || 'Test Signal Spot';
    spot.message = overrides.message || 'Test message';
    spot.latitude = overrides.latitude || 37.7749;
    spot.longitude = overrides.longitude || -122.4194;
    spot.radiusMeters = overrides.radiusMeters || 100;
    spot.status = overrides.status || 'active';
    spot.expiresAt = overrides.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    spot.createdAt = overrides.createdAt || new Date();
    spot.updatedAt = overrides.updatedAt || new Date();
    
    return Object.assign(spot, overrides);
  }

  static createMany(count: number, overrides: Partial<SignalSpot> = {}): SignalSpot[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({ 
        id: `test-spot-${index + 1}`,
        title: `Test Signal Spot ${index + 1}`,
        latitude: 37.7749 + (index * 0.001),
        longitude: -122.4194 + (index * 0.001),
        ...overrides 
      })
    );
  }

  static createDto(overrides: any = {}): any {
    return {
      title: 'Test Signal Spot',
      message: 'Test message',
      latitude: 37.7749,
      longitude: -122.4194,
      radiusMeters: 100,
      tags: ['test'],
      ...overrides,
    };
  }
}

/**
 * Factory for creating test sparks
 */
export class SparkFactory {
  static create(overrides: Partial<Spark> = {}): Spark {
    const spark = new Spark();
    spark.id = overrides.id || 'test-spark-id';
    spark.user1Id = overrides.user1Id || 'test-user-1';
    spark.user2Id = overrides.user2Id || 'test-user-2';
    spark.latitude = overrides.latitude || 37.7749;
    spark.longitude = overrides.longitude || -122.4194;
    spark.status = overrides.status || 'pending';
    spark.createdAt = overrides.createdAt || new Date();
    spark.updatedAt = overrides.updatedAt || new Date();
    
    return Object.assign(spark, overrides);
  }

  static createMany(count: number, overrides: Partial<Spark> = {}): Spark[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({ 
        id: `test-spark-${index + 1}`,
        user1Id: `test-user-${index + 1}`,
        user2Id: `test-user-${index + 2}`,
        ...overrides 
      })
    );
  }
}

/**
 * Mock guard for testing authenticated routes
 */
export const createMockAuthGuard = (user: User = UserFactory.create()) => {
  return {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = user;
      return true;
    }),
  };
};

/**
 * Mock guard for testing admin routes
 */
export const createMockAdminGuard = () => {
  return {
    canActivate: jest.fn().mockReturnValue(true),
  };
};

/**
 * Test database utilities
 */
export class TestDatabase {
  /**
   * Create a test database connection
   */
  static async createTestConnection() {
    // In a real implementation, this would create a test database connection
    // For now, we'll return a mock connection
    return {
      synchronize: jest.fn(),
      dropDatabase: jest.fn(),
      close: jest.fn(),
    };
  }

  /**
   * Seed test data
   */
  static async seedTestData() {
    // In a real implementation, this would seed the test database
    // For now, we'll return mock data
    return {
      users: UserFactory.createMany(3),
      signalSpots: SignalSpotFactory.createMany(5),
      sparks: SparkFactory.createMany(2),
    };
  }

  /**
   * Clean test data
   */
  static async cleanTestData() {
    // In a real implementation, this would clean the test database
    // For now, we'll just return a success indicator
    return true;
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure execution time of a function
   */
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = process.hrtime.bigint();
    const result = await fn();
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    return { result, duration };
  }

  /**
   * Run a function multiple times and measure average performance
   */
  static async benchmarkFunction<T>(
    fn: () => Promise<T>,
    iterations: number = 100
  ): Promise<{
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    totalDuration: number;
    iterations: number;
  }> {
    const durations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureExecutionTime(fn);
      durations.push(duration);
    }
    
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / iterations;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    return {
      averageDuration,
      minDuration,
      maxDuration,
      totalDuration,
      iterations,
    };
  }

  /**
   * Measure memory usage of a function
   */
  static async measureMemoryUsage<T>(fn: () => Promise<T>): Promise<{ 
    result: T; 
    memoryUsage: { heapUsed: number; heapTotal: number; external: number } 
  }> {
    const startMemory = process.memoryUsage();
    const result = await fn();
    const endMemory = process.memoryUsage();
    
    const memoryUsage = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };
    
    return { result, memoryUsage };
  }

  /**
   * Test concurrent execution
   */
  static async testConcurrentExecution<T>(
    fn: () => Promise<T>,
    concurrency: number = 10
  ): Promise<{
    results: T[];
    totalDuration: number;
    averageDuration: number;
    successRate: number;
  }> {
    const startTime = Date.now();
    const promises: Promise<T>[] = [];
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(fn());
    }
    
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.status === 'fulfilled');
    const successRate = (successful.length / results.length) * 100;
    const totalDuration = endTime - startTime;
    const averageDuration = totalDuration / concurrency;
    
    return {
      results: successful.map(r => (r as PromiseFulfilledResult<T>).value),
      totalDuration,
      averageDuration,
      successRate,
    };
  }
}

/**
 * API testing utilities
 */
export class ApiTestUtils {
  /**
   * Create a mock HTTP request
   */
  static createMockRequest(overrides: any = {}) {
    return {
      method: 'GET',
      url: '/test',
      headers: {},
      body: {},
      query: {},
      params: {},
      user: null,
      ...overrides,
    };
  }

  /**
   * Create a mock HTTP response
   */
  static createMockResponse() {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    
    return response;
  }

  /**
   * Test API endpoint performance
   */
  static async testEndpointPerformance(
    endpoint: () => Promise<any>,
    expectedMaxDuration: number = 1000
  ): Promise<{
    passed: boolean;
    duration: number;
    expectedMaxDuration: number;
    error?: string;
  }> {
    try {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(endpoint);
      const passed = duration <= expectedMaxDuration;
      
      return {
        passed,
        duration,
        expectedMaxDuration,
        error: passed ? undefined : `Endpoint took ${duration}ms, expected max ${expectedMaxDuration}ms`,
      };
    } catch (error) {
      return {
        passed: false,
        duration: 0,
        expectedMaxDuration,
        error: `Endpoint failed: ${error.message}`,
      };
    }
  }

  /**
   * Test API endpoint with different load levels
   */
  static async testEndpointLoad(
    endpoint: () => Promise<any>,
    loadLevels: number[] = [1, 5, 10, 20]
  ): Promise<Array<{
    concurrency: number;
    averageDuration: number;
    successRate: number;
    passed: boolean;
  }>> {
    const results = [];
    
    for (const concurrency of loadLevels) {
      const loadTest = await PerformanceTestUtils.testConcurrentExecution(
        endpoint,
        concurrency
      );
      
      const passed = loadTest.successRate >= 95 && loadTest.averageDuration <= 2000;
      
      results.push({
        concurrency,
        averageDuration: loadTest.averageDuration,
        successRate: loadTest.successRate,
        passed,
      });
    }
    
    return results;
  }
}

/**
 * Integration test utilities
 */
export class IntegrationTestUtils {
  /**
   * Create a test module with mocked dependencies
   */
  static async createTestModule(
    moduleClass: any,
    providers: any[] = [],
    mockOverrides: Record<string, any> = {}
  ): Promise<TestingModule> {
    const module = Test.createTestingModule({
      imports: [moduleClass],
      providers: [
        ...providers,
        {
          provide: getRepositoryToken(User),
          useValue: mockOverrides.userRepository || createMockRepository(),
        },
        {
          provide: getRepositoryToken(SignalSpot),
          useValue: mockOverrides.signalSpotRepository || createMockRepository(),
        },
        {
          provide: getRepositoryToken(Spark),
          useValue: mockOverrides.sparkRepository || createMockRepository(),
        },
      ],
    });
    
    return module.compile();
  }

  /**
   * Setup test environment
   */
  static async setupTestEnvironment() {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
    
    // Create test database connection
    const connection = await TestDatabase.createTestConnection();
    
    // Seed test data
    const testData = await TestDatabase.seedTestData();
    
    return {
      connection,
      testData,
    };
  }

  /**
   * Cleanup test environment
   */
  static async cleanupTestEnvironment() {
    // Clean test data
    await TestDatabase.cleanTestData();
    
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
  }
}

/**
 * Test assertion utilities
 */
export class TestAssertions {
  /**
   * Assert that a value is within a range
   */
  static assertWithinRange(value: number, min: number, max: number, message?: string) {
    if (value < min || value > max) {
      throw new Error(message || `Expected ${value} to be within range [${min}, ${max}]`);
    }
  }

  /**
   * Assert that a function completes within a time limit
   */
  static async assertCompletesWithinTime<T>(
    fn: () => Promise<T>,
    maxDuration: number,
    message?: string
  ): Promise<T> {
    const { result, duration } = await PerformanceTestUtils.measureExecutionTime(fn);
    
    if (duration > maxDuration) {
      throw new Error(
        message || `Function took ${duration}ms, expected max ${maxDuration}ms`
      );
    }
    
    return result;
  }

  /**
   * Assert that a value matches a pattern
   */
  static assertMatchesPattern(value: any, pattern: any, message?: string) {
    const matches = this.deepMatchesPattern(value, pattern);
    if (!matches) {
      throw new Error(
        message || `Value ${JSON.stringify(value)} does not match pattern ${JSON.stringify(pattern)}`
      );
    }
  }

  /**
   * Deep pattern matching utility
   */
  private static deepMatchesPattern(value: any, pattern: any): boolean {
    if (pattern === null || pattern === undefined) {
      return value === pattern;
    }
    
    if (typeof pattern === 'function') {
      return pattern(value);
    }
    
    if (typeof pattern === 'object' && typeof value === 'object') {
      if (Array.isArray(pattern)) {
        if (!Array.isArray(value)) return false;
        return pattern.every((p, i) => this.deepMatchesPattern(value[i], p));
      }
      
      return Object.keys(pattern).every(key => 
        this.deepMatchesPattern(value[key], pattern[key])
      );
    }
    
    return value === pattern;
  }
}

/**
 * Test data generators
 */
export class TestDataGenerators {
  /**
   * Generate random coordinates within a bounding box
   */
  static generateCoordinates(
    center: { latitude: number; longitude: number },
    radiusKm: number = 1
  ): { latitude: number; longitude: number } {
    const latRange = radiusKm / 111; // Rough conversion from km to degrees
    const lngRange = radiusKm / (111 * Math.cos(center.latitude * Math.PI / 180));
    
    return {
      latitude: center.latitude + (Math.random() - 0.5) * 2 * latRange,
      longitude: center.longitude + (Math.random() - 0.5) * 2 * lngRange,
    };
  }

  /**
   * Generate random string of specified length
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Generate random email address
   */
  static generateRandomEmail(): string {
    const username = this.generateRandomString(8);
    const domain = this.generateRandomString(6);
    return `${username}@${domain}.com`;
  }

  /**
   * Generate random date within range
   */
  static generateRandomDate(startDate: Date, endDate: Date): Date {
    const start = startDate.getTime();
    const end = endDate.getTime();
    const random = Math.random() * (end - start) + start;
    return new Date(random);
  }

  /**
   * Generate test dataset with realistic relationships
   */
  static generateTestDataset(size: number = 100): {
    users: User[];
    signalSpots: SignalSpot[];
    sparks: Spark[];
  } {
    const users = UserFactory.createMany(size);
    const signalSpots = [];
    const sparks = [];
    
    // Generate signal spots for random users
    for (let i = 0; i < size * 3; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const coordinates = this.generateCoordinates({
        latitude: 37.7749,
        longitude: -122.4194,
      }, 10);
      
      signalSpots.push(
        SignalSpotFactory.create({
          id: `spot-${i}`,
          userId: randomUser.id,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        })
      );
    }
    
    // Generate sparks between random users
    for (let i = 0; i < size / 2; i++) {
      const user1 = users[Math.floor(Math.random() * users.length)];
      const user2 = users[Math.floor(Math.random() * users.length)];
      
      if (user1.id !== user2.id) {
        const coordinates = this.generateCoordinates({
          latitude: 37.7749,
          longitude: -122.4194,
        }, 5);
        
        sparks.push(
          SparkFactory.create({
            id: `spark-${i}`,
            user1Id: user1.id,
            user2Id: user2.id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          })
        );
      }
    }
    
    return { users, signalSpots, sparks };
  }
}