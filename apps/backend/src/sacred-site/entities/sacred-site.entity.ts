import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { SiteActivity } from './site-activity.entity';

export enum SiteTier {
  LEGENDARY = 'legendary',
  MAJOR = 'major',
  MINOR = 'minor',
  EMERGING = 'emerging',
}

export enum SiteStatus {
  ACTIVE = 'active',
  DORMANT = 'dormant',
  ARCHIVED = 'archived',
}

@Entity()
export class SacredSite {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'decimal', precision: 10, scale: 8 })
  @Index()
  latitude: number;

  @Property({ type: 'decimal', precision: 11, scale: 8 })
  @Index()
  longitude: number;

  @Property({ nullable: true })
  address?: string;

  @Property()
  @Index()
  radius: number; // meters

  @Enum(() => SiteTier)
  @Index()
  tier: SiteTier = SiteTier.EMERGING;

  @Enum(() => SiteStatus)
  @Index()
  status: SiteStatus = SiteStatus.ACTIVE;

  // Clustering metadata
  @Property()
  clusterPoints: number = 0; // Number of spots/activities in cluster

  @Property({ type: 'json', nullable: true })
  clusterMetadata?: {
    algorithm: string;
    parameters: Record<string, any>;
    lastCalculated: Date;
    confidence: number;
  };

  // Ranking metrics
  @Property({ type: 'decimal', precision: 8, scale: 4 })
  totalScore: number = 0;

  @Property()
  @Index()
  visitCount: number = 0;

  @Property()
  uniqueVisitorCount: number = 0;

  @Property()
  spotCount: number = 0;

  @Property()
  totalEngagement: number = 0; // likes + comments + shares

  @Property({ type: 'decimal', precision: 8, scale: 4 })
  averageEngagementRate: number = 0;

  @Property({ type: 'decimal', precision: 8, scale: 4 })
  growthRate: number = 0; // Weekly growth percentage

  @Property({ type: 'decimal', precision: 8, scale: 4 })
  recencyScore: number = 0; // Based on recent activity

  // Temporal data
  @Property()
  firstActivityAt: Date;

  @Property()
  lastActivityAt: Date;

  @Property()
  @Index()
  peakActivityHour: number = 12; // Hour of day with most activity

  @Property({ type: 'json', nullable: true })
  activityPattern?: {
    hourly: number[]; // 24 hours
    daily: number[]; // 7 days
    monthly: number[]; // 12 months
  };

  // Discovery and gamification
  @Property({ nullable: true })
  discovererUserId?: string;

  @Property()
  discoveredAt: Date;

  @Property()
  isVerified: boolean = false;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  // Timestamps
  @Property()
  @Index()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  archivedAt?: Date;

  // Relations
  @OneToMany(() => SiteActivity, activity => activity.site)
  activities = new Collection<SiteActivity>(this);

  constructor(data: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    discovererUserId?: string;
    description?: string;
    address?: string;
  }) {
    this.name = data.name;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.radius = data.radius;
    this.discovererUserId = data.discovererUserId;
    this.description = data.description;
    this.address = data.address;
    this.firstActivityAt = new Date();
    this.lastActivityAt = new Date();
    this.discoveredAt = new Date();
  }

  /**
   * Update site metrics based on current activity
   */
  updateMetrics(metrics: {
    visitCount?: number;
    uniqueVisitorCount?: number;
    spotCount?: number;
    totalEngagement?: number;
    lastActivityAt?: Date;
  }): void {
    if (metrics.visitCount !== undefined) {
      this.visitCount = metrics.visitCount;
    }
    if (metrics.uniqueVisitorCount !== undefined) {
      this.uniqueVisitorCount = metrics.uniqueVisitorCount;
    }
    if (metrics.spotCount !== undefined) {
      this.spotCount = metrics.spotCount;
    }
    if (metrics.totalEngagement !== undefined) {
      this.totalEngagement = metrics.totalEngagement;
      this.averageEngagementRate = this.spotCount > 0 
        ? this.totalEngagement / this.spotCount 
        : 0;
    }
    if (metrics.lastActivityAt) {
      this.lastActivityAt = metrics.lastActivityAt;
    }

    this.updatedAt = new Date();
  }

  /**
   * Calculate and update tier based on current metrics
   */
  updateTier(): void {
    const score = this.calculateTierScore();
    
    if (score >= 80) {
      this.tier = SiteTier.LEGENDARY;
    } else if (score >= 60) {
      this.tier = SiteTier.MAJOR;
    } else if (score >= 30) {
      this.tier = SiteTier.MINOR;
    } else {
      this.tier = SiteTier.EMERGING;
    }
  }

  /**
   * Calculate tier score (0-100)
   */
  private calculateTierScore(): number {
    let score = 0;

    // Visit count (30% weight)
    score += Math.min(30, (this.visitCount / 1000) * 30);

    // Unique visitors (25% weight)
    score += Math.min(25, (this.uniqueVisitorCount / 100) * 25);

    // Engagement rate (20% weight)
    score += Math.min(20, this.averageEngagementRate * 4);

    // Growth rate (15% weight)
    score += Math.min(15, Math.max(0, this.growthRate * 3));

    // Recency (10% weight)
    score += Math.min(10, this.recencyScore * 10);

    return Math.round(score);
  }

  /**
   * Check if site should be considered dormant
   */
  isDormant(): boolean {
    const daysSinceLastActivity = (Date.now() - this.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastActivity > 30; // 30 days without activity
  }

  /**
   * Get site bounds for spatial queries
   */
  getBounds(): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } {
    // Approximate conversion: 1 degree ≈ 111,320 meters at equator
    const latOffset = (this.radius / 111320);
    const lngOffset = (this.radius / (111320 * Math.cos(this.latitude * Math.PI / 180)));

    return {
      minLat: this.latitude - latOffset,
      maxLat: this.latitude + latOffset,
      minLng: this.longitude - lngOffset,
      maxLng: this.longitude + lngOffset,
    };
  }

  /**
   * Generate summary for API responses
   */
  toSummary(): {
    id: string;
    name: string;
    tier: SiteTier;
    status: SiteStatus;
    latitude: number;
    longitude: number;
    address?: string;
    metrics: {
      visitCount: number;
      spotCount: number;
      totalScore: number;
      growthRate: number;
    };
    discoveredAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      tier: this.tier,
      status: this.status,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
      metrics: {
        visitCount: this.visitCount,
        spotCount: this.spotCount,
        totalScore: this.totalScore,
        growthRate: this.growthRate,
      },
      discoveredAt: this.discoveredAt,
    };
  }
}