import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  Ref,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../entities/user.entity';

export enum SparkType {
  PROXIMITY = 'proximity', // Physical proximity spark
  INTEREST = 'interest', // Shared interests spark
  LOCATION = 'location', // Same location history spark
  ACTIVITY = 'activity', // Similar activity patterns spark
}

export enum SparkStatus {
  PENDING = 'pending', // Waiting for response
  ACCEPTED = 'accepted', // Both users accepted
  DECLINED = 'declined', // One or both users declined
  EXPIRED = 'expired', // Spark expired
  MATCHED = 'matched', // Converted to match
}

@Entity({ tableName: 'sparks' })
@Index({ properties: ['user1', 'user2', 'createdAt'] })
@Index({ properties: ['status', 'createdAt'] })
@Index({ properties: ['type', 'createdAt'] })
@Index({ properties: ['expiresAt', 'status'] }) // Expiration cleanup queries
@Index({ properties: ['latitude', 'longitude'] }) // Spatial queries for location-based sparks
export class Spark {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User, { ref: true, eager: true })
  @Index()
  user1: Ref<User>;

  @ManyToOne(() => User, { ref: true, eager: true })
  @Index()  
  user2: Ref<User>;

  @Enum(() => SparkType)
  @Property({ default: SparkType.PROXIMITY })
  type: SparkType = SparkType.PROXIMITY;

  @Enum(() => SparkStatus)
  @Property({ default: SparkStatus.PENDING })
  @Index()
  status: SparkStatus = SparkStatus.PENDING;

  @Property({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Property({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Property({ type: 'float', nullable: true })
  distance?: number; // Distance between users in meters

  @Property({ type: 'integer', default: 0 })
  strength = 0; // Spark strength score (0-100)

  @Property({ type: 'json', nullable: true })
  metadata?: {
    duration?: number; // How long they were in proximity (seconds)
    sharedInterests?: string[];
    commonLocations?: string[];
    activitySimilarity?: number;
    signalSpotId?: string; // If spark happened at a signal spot
    weather?: string;
    timeOfDay?: string;
    [key: string]: unknown;
  };

  @Property({ type: 'datetime', nullable: true })
  user1ResponseAt?: Date;

  @Property({ type: 'datetime', nullable: true })
  user2ResponseAt?: Date;

  @Property({ default: false })
  user1Accepted = false;

  @Property({ default: false })
  user2Accepted = false;

  @Property({ type: 'datetime', nullable: true })
  expiresAt?: Date;

  @Property({ default: false })
  isNotified = false;

  @Property({ type: 'datetime', nullable: true })
  notifiedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Computed properties
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isMutual(): boolean {
    return this.user1Accepted && this.user2Accepted;
  }

  get isPending(): boolean {
    return this.status === SparkStatus.PENDING && !this.isExpired;
  }

  get sparkAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  get responseTime(): number | null {
    if (!this.user1ResponseAt && !this.user2ResponseAt) return null;
    
    const responses = [this.user1ResponseAt, this.user2ResponseAt].filter(Boolean);
    const latestResponse = Math.max(...responses.map(d => d.getTime()));
    return latestResponse - this.createdAt.getTime();
  }
}