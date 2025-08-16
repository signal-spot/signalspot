import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Spark, SparkType, SparkStatus } from '../entities/spark.entity';
import { Location } from '../../entities/location.entity';
import { WebSocketService } from '../../websocket/websocket.service';
import { User } from '../../entities/user.entity';
import { BlockedUser } from '../../entities/blocked-user.entity';
import { ChatRoom, ChatRoomType, ChatRoomStatus } from '../../entities/chat-room.entity';

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
  private readonly eventEmitter = new EventEmitter2();
  
  private readonly config = {
    proximity: {
      maxDistance: 100, // meters
      minDuration: 0, // seconds - immediately create spark
      scanInterval: 30000, // 30 seconds
    },
    interest: {
      minSharedInterests: 3,
      strengthThreshold: 50,
    },
  };

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Spark)
    private readonly sparkRepository: EntityRepository<Spark>,
    @InjectRepository(Location)
    private readonly locationRepository: EntityRepository<Location>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectQueue('location-processing') private readonly locationQueue: Queue,
    @Optional() private readonly webSocketService?: WebSocketService,
  ) {}

  async processLocationUpdate(
    userId: string,
    location: Location,
  ): Promise<void> {
    try {
      // Add location to queue for processing
      await this.locationQueue.add('process-location', {
        userId,
        location: {
          id: location.id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          createdAt: location.createdAt,
        },
      }, {
        // Prevent duplicate processing for same user within short time window
        jobId: `${userId}-${Date.now()}`,
        removeOnComplete: 100, // Keep last 100 completed jobs for debugging
        removeOnFail: 50, // Keep last 50 failed jobs for debugging
      });

      this.logger.debug(`Added location update for user ${userId} to processing queue`);
    } catch (error) {
      this.logger.error('Error adding location to queue:', error);
      // Fallback to direct processing if queue fails
      await this.processLocationDirectly(userId, location);
    }
  }

  // Fallback method for direct processing if queue fails
  private async processLocationDirectly(
    userId: string,
    location: Location,
  ): Promise<Spark[]> {
    const sparks: Spark[] = [];

    try {
      const detectedSparks = await this.detectProximitySparks(userId, location);
      sparks.push(...detectedSparks);

      this.logger.debug(`Directly processed location update for user ${userId}, detected ${sparks.length} sparks`);
      
      return sparks;
    } catch (error) {
      this.logger.error('Error processing location update directly:', error);
      throw error;
    }
  }

  private async detectProximitySparks(
    userId: string,
    userLocation: Location,
  ): Promise<Spark[]> {
    const sparks: Spark[] = [];

    try {
      // Find nearby users within the last 3 hours
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const nearbyUsers = await this.findNearbyUsers(
        userLocation.latitude,
        userLocation.longitude,
        this.config.proximity.maxDistance,
        userId,
        threeHoursAgo,
      );

      this.logger.debug(`Found ${nearbyUsers.length} nearby users for user ${userId}`);

      for (const nearbyUser of nearbyUsers) {
        // Double check with more strict time window (last 1 minute) to prevent race conditions
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentSpark = await this.sparkRepository.findOne({
          $or: [
            {
              user1: userId,
              user2: nearbyUser.userId,
              createdAt: { $gte: oneMinuteAgo },
            },
            {
              user1: nearbyUser.userId,
              user2: userId,
              createdAt: { $gte: oneMinuteAgo },
            },
          ],
        });

        if (recentSpark) {
          this.logger.debug(`Very recent spark exists (within 1 minute) between ${userId} and ${nearbyUser.userId}, skipping`);
          continue;
        }

        // Check if spark already exists within 5 minutes (shorter cooldown for regeneration)
        const existingSpark = await this.checkExistingSpark(
          userId,
          nearbyUser.userId,
          5 * 60 * 1000, // 5 minutes cooldown instead of 72 hours
        );

        if (existingSpark) {
          this.logger.debug(`Recent spark already exists between ${userId} and ${nearbyUser.userId} (within 5 minutes)`);
          continue;
        }

        // 즉시 스파크 생성 - 한 번이라도 범위 안에 들어오면 생성
        const spark = await this.createSpark({
          user1: await this.userRepository.findOne({ id: userId }),
          user2: await this.userRepository.findOne({ id: nearbyUser.userId }),
          type: SparkType.PROXIMITY,
          strength: 80, // 기본 강도 설정
          distance: nearbyUser.distance,
          location: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          metadata: {
            duration: 0, // 즉시 생성이므로 duration 0
            averageDistance: nearbyUser.distance,
            detectionTime: userLocation.createdAt,
            accuracy: userLocation.accuracy,
            instantDetection: true, // 즉시 감지 표시
          },
        });

        sparks.push(spark);
        
        // Immediately flush to ensure the spark is saved before processing next
        await this.em.flush();
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
    // Get blocked users
    const blockedUsers = await this.em.find(BlockedUser, {
      $or: [
        { blocker: excludeUserId },
        { blocked: excludeUserId }
      ]
    });

    const blockedUserIds: string[] = [excludeUserId]; // Always exclude self
    blockedUsers.forEach(block => {
      if (block.blocker.id === excludeUserId) {
        blockedUserIds.push(block.blocked.id);
      } else {
        blockedUserIds.push(block.blocker.id);
      }
    });

    // Using PostGIS for efficient spatial queries on location table (singular)
    // Create array literal properly for PostgreSQL
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

  private async calculateProximityData(
    user1Id: string,
    user2Id: string,
    referenceTime: Date,
  ): Promise<{
    duration: number;
    averageDistance: number;
    dataPoints: number;
  }> {
    // Look back 60 minutes from reference time
    const lookbackTime = new Date(referenceTime.getTime() - 60 * 60 * 1000);

    const query = `
      WITH user_pairs AS (
        SELECT 
          l1.created_at as timestamp,
          ST_Distance(
            ST_Point(l1.longitude, l1.latitude)::geography,
            ST_Point(l2.longitude, l2.latitude)::geography
          ) as distance
        FROM locations l1
        JOIN locations l2 ON ABS(EXTRACT(EPOCH FROM (l1.created_at - l2.created_at))) <= 180
        WHERE l1.user_id = $1
          AND l2.user_id = $2
          AND l1.created_at >= $3
          AND l1.created_at <= $4
          AND l2.created_at >= $3
          AND l2.created_at <= $4
          AND l1.is_active = true
          AND l2.is_active = true
        ORDER BY l1.created_at
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

    // Find the most recent spark between these users
    const existingSpark = await this.sparkRepository.findOne({
      $or: [
        {
          user1: user1Id,
          user2: user2Id,
        },
        {
          user1: user2Id,
          user2: user1Id,
        },
      ],
    }, {
      orderBy: { createdAt: 'DESC' }
    });

    // If no spark exists, return null
    if (!existingSpark) {
      return null;
    }

    // Check if the spark is expired or rejected - allow new spark creation
    if (existingSpark.status === SparkStatus.EXPIRED || 
        existingSpark.status === SparkStatus.REJECTED) {
      return null; // Allow new spark creation
    }

    // Check if the spark is within the time window
    if (existingSpark.createdAt >= since) {
      return existingSpark; // Recent spark exists, don't create new one
    }

    // Spark exists but is outside time window - allow new spark
    return null;
  }

  private async createSpark(sparkData: SparkDetectionResult): Promise<Spark> {
    const spark = this.sparkRepository.create({
      // Set user relations directly
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
      // Create a proper Spark entity with sender and receiver
      const sparkWithRelations = {
        ...spark,
        sender: sparkData.user1,
        receiver: sparkData.user2,
        message: `A ${sparkData.type} spark was detected!`,
      };
      await this.webSocketService.notifySparkSent(sparkWithRelations as any);
    }

    this.logger.log(`Spark detected: ${sparkData.type} between ${sparkData.user1.username} and ${sparkData.user2.username} (strength: ${sparkData.strength})`);

    return spark;
  }

  async sendManualSpark(senderId: string, receiverId: string, message?: string, spotId?: string): Promise<Spark> {
    // Check if users exist
    const sender = await this.userRepository.findOne({ id: senderId });
    const receiver = await this.userRepository.findOne({ id: receiverId });
    
    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }
    
    // Check if sender and receiver are the same
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send spark to yourself');
    }

    // Check if users have blocked each other
    const blockedRelation = await this.em.findOne(BlockedUser, {
      $or: [
        { blocker: senderId, blocked: receiverId },
        { blocker: receiverId, blocked: senderId }
      ]
    });

    if (blockedRelation) {
      throw new ForbiddenException('Cannot send spark to blocked user');
    }
    
    // Check for existing spark between these users
    const existingSpark = await this.checkExistingSpark(senderId, receiverId, 72 * 60 * 60 * 1000); // 3 days
    if (existingSpark) {
      throw new ConflictException('A spark already exists between these users');
    }
    
    // Get sender's current location if available
    const senderLocation = await this.getRecentLocation(senderId);
    
    // Create the spark
    const spark = this.sparkRepository.create({
      user1: sender,
      user2: receiver,
      type: SparkType.MANUAL, // New type for manually sent sparks
      strength: 80, // Default strength for manual sparks
      latitude: senderLocation?.latitude || 0,
      longitude: senderLocation?.longitude || 0,
      distance: 0, // Not applicable for manual sparks
      message: message || '', // Store message directly in spark entity
      metadata: {
        spotId: spotId || null,
        sentAt: new Date().toISOString(),
        type: 'manual_send'
      },
      status: SparkStatus.PENDING,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours for manual sparks
    });

    await this.em.persistAndFlush(spark);

    // Emit event for notifications
    this.eventEmitter.emit('spark.sent', spark);

    // Send WebSocket notifications
    if (this.webSocketService) {
      const sparkWithRelations = {
        ...spark,
        sender: sender,
        receiver: receiver,
        message: message || `${sender.username}님이 스파크를 보냈습니다!`,
      };
      await this.webSocketService.notifySparkSent(sparkWithRelations as any);
    }

    this.logger.log(`Manual spark sent from ${sender.username} to ${receiver.username}`);

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
            72 * 60 * 60 * 1000, // 72 hours (3 days)
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

  private async getRecentLocation(userId: string): Promise<Location | null> {
    return this.locationRepository.findOne(
      { user: userId, isActive: true }, 
      { orderBy: { createdAt: 'DESC' } }
    );
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

  async getSparkById(sparkId: string): Promise<Spark | null> {
    try {
      const spark = await this.em.findOne(Spark, 
        { id: sparkId },
        { 
          populate: ['user1', 'user2'] 
        }
      );
      
      return spark;
    } catch (error) {
      this.logger.error(`Failed to get spark by id: ${error.message}`);
      throw error;
    }
  }

  async getLocationHistory(user1Id: string, user2Id: string): Promise<any[]> {
    try {
      // Get location history for both users from locations table
      const user1History = await this.em.find(Location, {
        user: user1Id,
        isActive: true
      }, {
        orderBy: { createdAt: 'DESC' },
        limit: 10
      });
      
      const user2History = await this.em.find(Location, {
        user: user2Id,
        isActive: true
      }, {
        orderBy: { createdAt: 'DESC' },
        limit: 10
      });
      
      // Calculate distances between locations
      const history = [];
      for (const loc1 of user1History) {
        for (const loc2 of user2History) {
          const timeDiff = Math.abs(loc1.createdAt.getTime() - loc2.createdAt.getTime());
          if (timeDiff <= 3 * 60 * 60 * 1000) { // Within 3 hours
            const distance = this.calculateDistance(
              loc1.latitude,
              loc1.longitude,
              loc2.latitude,
              loc2.longitude
            );
            
            history.push({
              user1Location: loc1,
              user2Location: loc2,
              distance,
              timeDiff,
              timestamp: loc1.createdAt
            });
          }
        }
      }
      
      return history.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      this.logger.error(`Failed to get location history: ${error.message}`);
      throw error;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async getUserSparks(userId: string): Promise<Spark[]> {
    try {
      const sparks = await this.em.find(Spark, {
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      }, {
        populate: ['user1', 'user2'],
        orderBy: { createdAt: 'DESC' }
      });

      return sparks;
    } catch (error) {
      this.logger.error(`Failed to get user sparks: ${error.message}`);
      throw error;
    }
  }

  async updateSparkStatus(sparkId: string, userId: string, status: SparkStatus): Promise<Spark> {
    const spark = await this.getSparkById(sparkId);
    
    if (!spark) {
      throw new NotFoundException('Spark not found');
    }
    
    // Check if user is part of this spark
    if (spark.user1.id !== userId && spark.user2.id !== userId) {
      throw new ForbiddenException('You do not have permission to update this spark');
    }
    
    spark.status = status;
    await this.em.flush();
    
    // Emit event for status change
    this.eventEmitter.emit('spark.statusChanged', spark);
    
    return spark;
  }

  /**
   * Respond to a spark (accept or reject)
   */
  async respondToSpark(sparkId: string, userId: string, accept: boolean): Promise<Spark> {
    const spark = await this.getSparkById(sparkId);
    
    if (!spark) {
      throw new NotFoundException('Spark not found');
    }
    
    // Check if user is part of this spark
    const isUser1 = spark.user1.id === userId;
    const isUser2 = spark.user2.id === userId;
    
    if (!isUser1 && !isUser2) {
      throw new ForbiddenException('You do not have permission to respond to this spark');
    }
    
    // Update the user's acceptance status
    if (isUser1) {
      spark.user1Accepted = accept;
      spark.user1ResponseAt = new Date();
    } else {
      spark.user2Accepted = accept;
      spark.user2ResponseAt = new Date();
    }
    
    // Determine spark status based on type and responses
    if (!accept) {
      // If either user rejects, spark is rejected
      spark.status = SparkStatus.REJECTED;
    } else if (spark.type === SparkType.PROXIMITY) {
      // For proximity and automatic sparks, both users must accept
      if (spark.user1Accepted && spark.user2Accepted) {
        spark.status = SparkStatus.MATCHED;
      } else if (spark.user1Accepted || spark.user2Accepted) {
        // One has accepted, waiting for the other
        spark.status = SparkStatus.PENDING;
      }
    } else if (spark.type === SparkType.MANUAL) {
      // For manual sparks, only the receiver needs to accept
      // The sender (who sent the spark) already implicitly accepted
      
      // Determine who is the sender and who is the receiver
      // In manual sparks, user1 is always the sender
      const isSender = isUser1;
      const isReceiver = isUser2;
      
      if (isSender) {
        // Sender cannot accept/reject their own spark
        throw new BadRequestException('You cannot accept your own spark');
      }
      
      if (isReceiver && accept) {
        spark.status = SparkStatus.MATCHED;
        spark.user1Accepted = true; // Sender implicitly accepted by sending
        spark.user2Accepted = true; // Receiver explicitly accepted
      } else if (isReceiver && !accept) {
        spark.status = SparkStatus.REJECTED;
      }
    }
    
    await this.em.flush();
    
    // If matched, create or update chat room
    if (spark.status === SparkStatus.MATCHED) {
      // Check if chat room already exists
      const existingChatRoom = await this.em.findOne(ChatRoom, {
        $or: [
          { participant1: spark.user1.id, participant2: spark.user2.id },
          { participant1: spark.user2.id, participant2: spark.user1.id }
        ]
      });
      
      let chatRoomId: string;
      if (!existingChatRoom) {
        // Create new chat room
        const chatRoom = new ChatRoom();
        // Load the actual User entities from the references
        const user1 = await this.em.findOne(User, { id: spark.user1.id });
        const user2 = await this.em.findOne(User, { id: spark.user2.id });
        chatRoom.participant1 = user1!;
        chatRoom.participant2 = user2!;
        chatRoom.sparkId = spark.id;
        await this.em.persistAndFlush(chatRoom);
        chatRoomId = chatRoom.id;
      } else {
        chatRoomId = existingChatRoom.id;
      }
      
      // Send notification to both users about the match
      this.eventEmitter.emit('spark.matched', {
        sparkId: spark.id,
        user1Id: spark.user1.id,
        user2Id: spark.user2.id,
        chatRoomId: chatRoomId
      });
    } else if (accept && spark.status === SparkStatus.PENDING) {
      // Notify the other user that one side has accepted
      const otherUserId = isUser1 ? spark.user2.id : spark.user1.id;
      this.eventEmitter.emit('spark.partiallyAccepted', {
        sparkId: spark.id,
        acceptedBy: userId,
        waitingFor: otherUserId
      });
    }
    
    // Emit event for status change
    this.eventEmitter.emit('spark.statusChanged', spark);
    
    return spark;
  }
}