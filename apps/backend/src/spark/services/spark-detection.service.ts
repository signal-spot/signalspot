import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Spark, SparkType, SparkStatus } from '../entities/spark.entity';
import { LocationHistory } from '../entities/location-history.entity';
import { User } from '../../entities/user.entity';

export interface SparkDetectionResult {
  user1: User;
  user2: User;
  type: SparkType;
  strength: number;
  distance?: number;
  metadata: Record<string, unknown>;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ProximityConfig {
  maxDistance: number; // meters
  minDuration: number; // seconds
  strengthThreshold: number; // 0-100
}

@Injectable()
export class SparkDetectionService {
  private readonly logger = new Logger(SparkDetectionService.name);

  private readonly config = {
    proximity: {
      maxDistance: 50, // 50 meters
      minDuration: 300, // 5 minutes
      strengthThreshold: 60,
    },
    interest: {
      minSharedInterests: 3,
      strengthThreshold: 70,
    },
    location: {
      maxDistance: 100, // 100 meters for location history
      minCommonVisits: 2,
      strengthThreshold: 50,
    },
    activity: {
      similarityThreshold: 0.7,
      strengthThreshold: 65,
    },
  };

  constructor(
    @InjectRepository(Spark)
    private readonly sparkRepository: EntityRepository<Spark>,
    @InjectRepository(LocationHistory)
    private readonly locationRepository: EntityRepository<LocationHistory>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processLocationUpdate(
    userId: string,
    locations: LocationHistory[],
  ): Promise<Spark[]> {
    const sparks: Spark[] = [];

    try {
      // Process each location update
      for (const location of locations) {
        const detectedSparks = await this.detectProximitySparks(userId, location);
        sparks.push(...detectedSparks);
      }

      this.logger.debug(`Processed ${locations.length} location updates for user ${userId}, detected ${sparks.length} sparks`);
      
      return sparks;
    } catch (error) {
      this.logger.error('Error processing location update:', error);
      throw error;
    }
  }

  private async detectProximitySparks(
    userId: string,
    userLocation: LocationHistory,
  ): Promise<Spark[]> {
    const sparks: Spark[] = [];

    try {
      // Find nearby users within the last 10 minutes
      const nearbyUsers = await this.findNearbyUsers(
        userLocation.latitude,
        userLocation.longitude,
        this.config.proximity.maxDistance,
        userId,
        new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      );

      for (const nearbyUser of nearbyUsers) {
        // Check if spark already exists between these users recently
        const existingSpark = await this.checkExistingSpark(
          userId,
          nearbyUser.userId,
          24 * 60 * 60 * 1000, // 24 hours
        );

        if (existingSpark) {
          continue; // Skip if spark already exists
        }

        // Calculate proximity duration and strength
        const proximityData = await this.calculateProximityData(
          userId,
          nearbyUser.userId,
          userLocation.timestamp,
        );

        if (proximityData.duration >= this.config.proximity.minDuration) {
          const strength = this.calculateProximityStrength(proximityData);

          if (strength >= this.config.proximity.strengthThreshold) {
            const spark = await this.createSpark({
              user1: await this.userRepository.findOne({ id: userId }),
              user2: await this.userRepository.findOne({ id: nearbyUser.userId }),
              type: SparkType.PROXIMITY,
              strength,
              distance: nearbyUser.distance,
              location: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              metadata: {
                duration: proximityData.duration,
                averageDistance: proximityData.averageDistance,
                detectionTime: userLocation.timestamp,
                accuracy: userLocation.accuracy,
              },
            });

            sparks.push(spark);
          }
        }
      }

      return sparks;
    } catch (error) {
      this.logger.error('Error detecting proximity sparks:', error);
      return [];
    }
  }

  private async findNearbyUsers(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    excludeUserId: string,
    since: Date,
  ): Promise<Array<{ userId: string; distance: number; lastSeen: Date }>> {
    // Using PostGIS for efficient spatial queries
    const query = `
      SELECT DISTINCT ON (l.user_id)
        l.user_id,
        ST_Distance(
          ST_Point(l.longitude, l.latitude)::geography,
          ST_Point($2, $1)::geography
        ) as distance,
        l.timestamp as last_seen
      FROM location_history l
      WHERE l.user_id != $3
        AND l.timestamp >= $4
        AND ST_DWithin(
          ST_Point(l.longitude, l.latitude)::geography,
          ST_Point($2, $1)::geography,
          $5
        )
      ORDER BY l.user_id, l.timestamp DESC
    `;

    const result = await this.em.getConnection().execute(query, [
      latitude,
      longitude,
      excludeUserId,
      since,
      radiusMeters,
    ]);

    return result.map((row: any) => ({
      userId: row.user_id as string,
      distance: parseFloat(row.distance as string),
      lastSeen: new Date(row.last_seen as string),
    }));
  }

  private async calculateProximityData(
    user1Id: string,
    user2Id: string,
    referenceTime: Date,
  ): Promise<{
    duration: number;
    averageDistance: number;
    dataPoints: number;
  }> {
    // Look back 30 minutes from reference time
    const lookbackTime = new Date(referenceTime.getTime() - 30 * 60 * 1000);

    const query = `
      WITH user_pairs AS (
        SELECT 
          l1.timestamp,
          ST_Distance(
            ST_Point(l1.longitude, l1.latitude)::geography,
            ST_Point(l2.longitude, l2.latitude)::geography
          ) as distance
        FROM location_history l1
        JOIN location_history l2 ON ABS(EXTRACT(EPOCH FROM (l1.timestamp - l2.timestamp))) <= 60
        WHERE l1.user_id = $1
          AND l2.user_id = $2
          AND l1.timestamp >= $3
          AND l1.timestamp <= $4
          AND l2.timestamp >= $3
          AND l2.timestamp <= $4
        ORDER BY l1.timestamp
      )
      SELECT 
        COUNT(*) as data_points,
        AVG(distance) as average_distance,
        EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) as duration_seconds
      FROM user_pairs
      WHERE distance <= $5
    `;

    const result = await this.em.getConnection().execute(query, [
      user1Id,
      user2Id,
      lookbackTime,
      referenceTime,
      this.config.proximity.maxDistance,
    ]);

    const row = result[0];
    return {
      duration: parseInt(row.duration_seconds) || 0,
      averageDistance: parseFloat(row.average_distance) || 0,
      dataPoints: parseInt(row.data_points) || 0,
    };
  }

  private calculateProximityStrength(proximityData: {
    duration: number;
    averageDistance: number;
    dataPoints: number;
  }): number {
    // Base strength from duration (0-40 points)
    const durationScore = Math.min(
      (proximityData.duration / (15 * 60)) * 40, // 15 minutes = max duration score
      40,
    );

    // Distance score (0-30 points, closer = higher score)
    const distanceScore = Math.max(
      30 - (proximityData.averageDistance / this.config.proximity.maxDistance) * 30,
      0,
    );

    // Data quality score (0-30 points)
    const qualityScore = Math.min((proximityData.dataPoints / 10) * 30, 30);

    return Math.round(durationScore + distanceScore + qualityScore);
  }

  private async checkExistingSpark(
    user1Id: string,
    user2Id: string,
    timeWindowMs: number,
  ): Promise<Spark | null> {
    const since = new Date(Date.now() - timeWindowMs);

    return this.sparkRepository.findOne({
      $or: [
        {
          user1Id,
          user2Id,
          createdAt: { $gte: since },
        },
        {
          user1Id: user2Id,
          user2Id: user1Id,
          createdAt: { $gte: since },
        },
      ],
    });
  }

  private async createSpark(sparkData: SparkDetectionResult): Promise<Spark> {
    const spark = this.sparkRepository.create({
      user1Id: sparkData.user1.id,
      user2Id: sparkData.user2.id,
      user1: sparkData.user1,
      user2: sparkData.user2,
      type: sparkData.type,
      strength: sparkData.strength,
      latitude: sparkData.location.latitude,
      longitude: sparkData.location.longitude,
      distance: sparkData.distance,
      metadata: sparkData.metadata,
      status: SparkStatus.PENDING,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    });

    await this.em.persistAndFlush(spark);

    // Emit event for notifications
    this.eventEmitter.emit('spark.detected', spark);

    this.logger.log(`Spark detected: ${sparkData.type} between ${sparkData.user1.username} and ${sparkData.user2.username} (strength: ${sparkData.strength})`);

    return spark;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async detectInterestSparks(): Promise<void> {
    this.logger.debug('Running interest-based spark detection...');

    try {
      // Get users with similar interests who haven't sparked recently
      const usersWithInterests = await this.userRepository.find({
        interests: { $ne: null },
      });

      const sparks: Spark[] = [];

      for (let i = 0; i < usersWithInterests.length; i++) {
        for (let j = i + 1; j < usersWithInterests.length; j++) {
          const user1 = usersWithInterests[i];
          const user2 = usersWithInterests[j];

          // Check if spark already exists
          const existingSpark = await this.checkExistingSpark(
            user1.id,
            user2.id,
            7 * 24 * 60 * 60 * 1000, // 7 days
          );

          if (existingSpark) continue;

          // Calculate interest compatibility
          const compatibility = this.calculateInterestCompatibility(
            user1.interests,
            user2.interests,
          );

          if (compatibility.sharedCount >= this.config.interest.minSharedInterests) {
            const strength = this.calculateInterestStrength(compatibility);

            if (strength >= this.config.interest.strengthThreshold) {
              // Use their most recent locations
              const user1Location = await this.getRecentLocation(user1.id);
              const user2Location = await this.getRecentLocation(user2.id);

              if (user1Location && user2Location) {
                const spark = await this.createSpark({
                  user1,
                  user2,
                  type: SparkType.INTEREST,
                  strength,
                  location: {
                    latitude: (user1Location.latitude + user2Location.latitude) / 2,
                    longitude: (user1Location.longitude + user2Location.longitude) / 2,
                  },
                  metadata: {
                    sharedInterests: compatibility.shared,
                    compatibilityScore: compatibility.score,
                    totalInterests1: user1.interests.length,
                    totalInterests2: user2.interests.length,
                  },
                });

                sparks.push(spark);
              }
            }
          }
        }
      }

      this.logger.log(`Interest-based spark detection completed. Created ${sparks.length} sparks.`);
    } catch (error) {
      this.logger.error('Error in interest-based spark detection:', error);
    }
  }

  private calculateInterestCompatibility(
    interests1: string[],
    interests2: string[],
  ): {
    shared: string[];
    sharedCount: number;
    score: number;
  } {
    const set2 = new Set(interests2.map(i => i.toLowerCase()));

    const shared = interests1.filter(interest =>
      set2.has(interest.toLowerCase()),
    );

    const totalUnique = new Set([...interests1, ...interests2]).size;
    const jaccardIndex = shared.length / totalUnique;

    return {
      shared,
      sharedCount: shared.length,
      score: jaccardIndex,
    };
  }

  private calculateInterestStrength(compatibility: {
    sharedCount: number;
    score: number;
  }): number {
    // Base score from shared interests (0-50 points)
    const sharedScore = Math.min(compatibility.sharedCount * 10, 50);

    // Compatibility score (0-50 points)
    const compatibilityScore = compatibility.score * 50;

    return Math.round(sharedScore + compatibilityScore);
  }

  private async getRecentLocation(userId: string): Promise<LocationHistory | null> {
    return this.locationRepository.findOne({ userId }, { orderBy: { timestamp: 'DESC' } });
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupExpiredSparks(): Promise<void> {
    this.logger.debug('Cleaning up expired sparks...');

    try {
      // Use MikroORM's native update
      const expiredSparks = await this.sparkRepository.find({
        expiresAt: { $lt: new Date() },
        status: SparkStatus.PENDING
      });

      for (const spark of expiredSparks) {
        spark.status = SparkStatus.EXPIRED;
      }

      await this.em.flush();
      this.logger.log(`Expired ${expiredSparks.length} sparks`);
    } catch (error) {
      this.logger.error('Error cleaning up expired sparks:', error);
    }
  }

  async getUserSparks(
    userId: string,
    status?: SparkStatus,
    limit = 20,
  ): Promise<Spark[]> {
    const conditions: Record<string, any> = {
      $or: [
        { user1: userId },
        { user2: userId }
      ]
    };

    if (status) {
      conditions.status = status;
    }

    return this.sparkRepository.find(conditions, {
      populate: ['user1', 'user2'],
      orderBy: { createdAt: 'DESC' },
      limit
    });
  }

  async respondToSpark(
    sparkId: string,
    userId: string,
    accepted: boolean,
  ): Promise<Spark> {
    const spark = await this.sparkRepository.findOne({ id: sparkId }, { populate: ['user1', 'user2'] });

    if (!spark) {
      throw new Error('Spark not found');
    }

    if (spark.user1Id !== userId && spark.user2Id !== userId) {
      throw new Error('Unauthorized');
    }

    if (spark.isExpired || spark.status !== SparkStatus.PENDING) {
      throw new Error('Spark is no longer available');
    }

    // Update user response
    if (spark.user1Id === userId) {
      spark.user1Accepted = accepted;
      spark.user1ResponseAt = new Date();
    } else {
      spark.user2Accepted = accepted;
      spark.user2ResponseAt = new Date();
    }

    // Check if both users have responded
    if (spark.user1ResponseAt && spark.user2ResponseAt) {
      if (spark.user1Accepted && spark.user2Accepted) {
        spark.status = SparkStatus.MATCHED;
        this.eventEmitter.emit('spark.matched', spark);
      } else {
        spark.status = SparkStatus.DECLINED;
      }
    }

    await this.em.persistAndFlush(spark);

    this.eventEmitter.emit('spark.response', {
      spark: spark,
      userId,
      accepted,
    });

    return spark;
  }
}