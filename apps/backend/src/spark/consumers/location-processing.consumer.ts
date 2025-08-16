import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Spark, SparkType, SparkStatus } from '../entities/spark.entity';
import { Location } from '../../entities/location.entity';
import { User } from '../../entities/user.entity';
import { BlockedUser } from '../../entities/blocked-user.entity';
import { WebSocketService } from '../../websocket/websocket.service';

export interface LocationJobData {
  userId: string;
  location: {
    id: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    createdAt: Date;
  };
}

@Processor('location-processing')
@Injectable()
export class LocationProcessingConsumer {
  private readonly logger = new Logger(LocationProcessingConsumer.name);
  
  private readonly config = {
    proximity: {
      maxDistance: 100, // meters
      minDuration: 0, // seconds - immediately create spark
    },
  };

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Spark)
    private readonly sparkRepository: EntityRepository<Spark>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly webSocketService: WebSocketService,
  ) {}

  @Process('process-location')
  async processLocation(job: Job<LocationJobData>): Promise<void> {
    const { userId, location } = job.data;
    
    this.logger.debug(`Processing location for user ${userId} from queue`);
    
    try {
      // Find nearby users
      const nearbyUsers = await this.findNearbyUsers(
        location.latitude,
        location.longitude,
        this.config.proximity.maxDistance,
        userId,
        new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      );

      this.logger.debug(`Found ${nearbyUsers.length} nearby users for user ${userId}`);

      for (const nearbyUser of nearbyUsers) {
        // Check if spark already exists within 72 hours
        const existingSpark = await this.checkExistingSpark(
          userId,
          nearbyUser.userId,
          72 * 60 * 60 * 1000, // 72 hours (3 days)
        );

        if (existingSpark) {
          this.logger.debug(`Spark already exists between ${userId} and ${nearbyUser.userId}`);
          continue;
        }

        // Create spark immediately
        const user1 = await this.userRepository.findOne({ id: userId });
        const user2 = await this.userRepository.findOne({ id: nearbyUser.userId });
        
        if (!user1 || !user2) {
          this.logger.warn(`User not found: ${!user1 ? userId : nearbyUser.userId}`);
          continue;
        }

        const spark = await this.createSpark({
          user1,
          user2,
          type: SparkType.PROXIMITY,
          strength: 80,
          distance: nearbyUser.distance,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          metadata: {
            duration: 0,
            averageDistance: nearbyUser.distance,
            detectionTime: location.createdAt,
            accuracy: location.accuracy,
            instantDetection: true,
            processedViaQueue: true,
          },
        });

        this.logger.log(`Spark created between ${user1.username} and ${user2.username} via queue processing`);
      }
    } catch (error) {
      this.logger.error(`Error processing location job: ${error.message}`, error.stack);
      throw error; // Re-throw to let Bull handle retry
    }
  }

  private async findNearbyUsers(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    excludeUserId: string,
    since: Date,
  ): Promise<Array<{ userId: string; distance: number; lastSeen: Date }>> {
    // Get blocked users
    const blockedUsers = await this.em.find(BlockedUser, {
      $or: [
        { blocker: excludeUserId },
        { blocked: excludeUserId }
      ]
    });

    const blockedUserIds: string[] = [excludeUserId];
    blockedUsers.forEach(block => {
      if (block.blocker.id === excludeUserId) {
        blockedUserIds.push(block.blocked.id);
      } else {
        blockedUserIds.push(block.blocker.id);
      }
    });

    // Using PostGIS for efficient spatial queries
    const arrayLiteral = `ARRAY[${blockedUserIds.map(id => `'${id}'`).join(',')}]::text[]`;
    
    const query = `
      SELECT DISTINCT ON (l.user_id)
        l.user_id,
        ST_Distance(
          ST_Point(l.longitude, l.latitude)::geography,
          ST_Point(?, ?)::geography
        ) as distance,
        l.created_at as last_seen
      FROM location l
      WHERE l.user_id::text != ALL(${arrayLiteral})
        AND l.created_at >= ?
        AND l.is_active = true
        AND ST_DWithin(
          ST_Point(l.longitude, l.latitude)::geography,
          ST_Point(?, ?)::geography,
          ?
        )
      ORDER BY l.user_id, l.created_at DESC
    `;

    const result = await this.em.getConnection().execute(query, [
      longitude,
      latitude,
      since,
      longitude,
      latitude,
      radiusMeters,
    ]);

    return result.map((row: any) => ({
      userId: row.user_id as string,
      distance: parseFloat(row.distance as string),
      lastSeen: new Date(row.last_seen as string),
    }));
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
          user1: user1Id,
          user2: user2Id,
          createdAt: { $gte: since },
        },
        {
          user1: user2Id,
          user2: user1Id,
          createdAt: { $gte: since },
        },
      ],
    });
  }

  private async createSpark(sparkData: {
    user1: User;
    user2: User;
    type: SparkType;
    strength: number;
    distance?: number;
    location: { latitude: number; longitude: number };
    metadata: Record<string, unknown>;
  }): Promise<Spark> {
    const spark = this.sparkRepository.create({
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

    // Send WebSocket notifications to both users
    if (this.webSocketService) {
      const sparkWithRelations = {
        ...spark,
        sender: sparkData.user1,
        receiver: sparkData.user2,
        message: `A ${sparkData.type} spark was detected!`,
      };
      await this.webSocketService.notifySparkSent(sparkWithRelations as any);
    }

    return spark;
  }
}