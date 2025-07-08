import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  Index,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { SacredSite } from './sacred-site.entity';
import { User } from '../../entities/user.entity';

export enum ActivityType {
  VISIT = 'visit',
  SPOT_CREATED = 'spot_created',
  INTERACTION = 'interaction', // like, comment, share
  DISCOVERY = 'discovery',
  CHECK_IN = 'check_in',
}

@Entity()
export class SiteActivity {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => SacredSite)
  @Index()
  site: SacredSite;

  @ManyToOne(() => User, { nullable: true })
  @Index()
  user?: User;

  @Enum(() => ActivityType)
  @Index()
  activityType: ActivityType;

  @Property({ nullable: true })
  relatedContentId?: string; // spot id, spark id, etc.

  @Property({ nullable: true })
  relatedContentType?: string; // 'spot', 'spark', etc.

  @Property({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Property({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Property({ type: 'json', nullable: true })
  metadata?: {
    deviceInfo?: Record<string, any>;
    sessionId?: string;
    duration?: number; // seconds
    interactionDetails?: Record<string, any>;
  };

  @Property()
  @Index()
  timestamp: Date = new Date();

  @Property()
  @Index()
  createdAt: Date = new Date();

  constructor(data: {
    site: SacredSite;
    activityType: ActivityType;
    user?: User;
    relatedContentId?: string;
    relatedContentType?: string;
    latitude?: number;
    longitude?: number;
    metadata?: any;
  }) {
    this.site = data.site;
    this.activityType = data.activityType;
    this.user = data.user;
    this.relatedContentId = data.relatedContentId;
    this.relatedContentType = data.relatedContentType;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.metadata = data.metadata;
  }

  /**
   * Check if activity is recent (within last 24 hours)
   */
  isRecent(): boolean {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.timestamp > twentyFourHoursAgo;
  }

  /**
   * Get activity weight for scoring calculations
   */
  getWeight(): number {
    const weights = {
      [ActivityType.VISIT]: 1,
      [ActivityType.CHECK_IN]: 2,
      [ActivityType.INTERACTION]: 3,
      [ActivityType.SPOT_CREATED]: 5,
      [ActivityType.DISCOVERY]: 10,
    };

    return weights[this.activityType] || 1;
  }

  /**
   * Get time-based decay factor (newer activities have higher scores)
   */
  getDecayFactor(): number {
    const ageInDays = (Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay with 30-day half-life
    return Math.exp(-ageInDays / 30);
  }

  /**
   * Calculate activity score considering type, recency, and other factors
   */
  calculateScore(): number {
    const baseWeight = this.getWeight();
    const decayFactor = this.getDecayFactor();
    
    // Bonus for recent activity
    const recencyBonus = this.isRecent() ? 1.5 : 1;
    
    return baseWeight * decayFactor * recencyBonus;
  }

  /**
   * Generate summary for API responses
   */
  toSummary(): {
    id: string;
    activityType: ActivityType;
    timestamp: Date;
    userId?: string;
    score: number;
  } {
    return {
      id: this.id,
      activityType: this.activityType,
      timestamp: this.timestamp,
      userId: this.user?.id,
      score: this.calculateScore(),
    };
  }
}