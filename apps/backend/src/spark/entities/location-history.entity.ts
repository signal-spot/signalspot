import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  Ref,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../entities/user.entity';

@Entity({ tableName: 'location_history' })
@Index({ properties: ['userId', 'timestamp'] })
@Index({ properties: ['latitude', 'longitude', 'timestamp'] })
@Index({ properties: ['timestamp'] })
export class LocationHistory {
  @PrimaryKey()
  id: string = v4();

  @Property()
  @Index()
  userId: string;

  @ManyToOne(() => User, { ref: true, joinColumn: 'userId' })
  user: Ref<User>;

  @Property({ type: 'decimal', precision: 10, scale: 8 })
  @Index()
  latitude: number;

  @Property({ type: 'decimal', precision: 11, scale: 8 })
  @Index()
  longitude: number;

  @Property({ type: 'float', nullable: true })
  accuracy?: number; // GPS accuracy in meters

  @Property({ type: 'float', nullable: true })
  speed?: number; // Speed in m/s

  @Property({ type: 'float', nullable: true })
  heading?: number; // Direction in degrees

  @Property({ type: 'float', nullable: true })
  altitude?: number; // Altitude in meters

  @Property({ default: false })
  isBackground = false; // Was this recorded in background

  @Property({ type: 'json', nullable: true })
  metadata?: {
    batteryLevel?: number;
    networkType?: string;
    appState?: string;
    source?: 'gps' | 'network' | 'passive';
    [key: string]: unknown;
  };

  @Property({ type: 'datetime' })
  @Index()
  timestamp: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  // Spatial column for PostGIS (using text for PostgreSQL geography)
  @Property({ type: 'text', nullable: true })
  location?: string;

  // Computed properties
  get coordinates(): [number, number] {
    return [this.longitude, this.latitude];
  }

  get isRecent(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.timestamp > fiveMinutesAgo;
  }

  get isHighAccuracy(): boolean {
    return this.accuracy !== null && this.accuracy <= 20; // 20 meters or better
  }
}