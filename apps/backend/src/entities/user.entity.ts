import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  @Index()
  email!: string;

  @Property({ unique: true })
  @Index()
  username!: string;

  @Property()
  password!: string;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ nullable: true })
  bio?: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'boolean', default: false })
  isVerified: boolean = false;

  @Property({ nullable: true })
  @Index()
  lastLoginAt?: Date;

  @Property({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @Property({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @Index()
  latitude?: number;

  @Property({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @Index()
  longitude?: number;

  @Property({ type: 'timestamptz', defaultRaw: 'CURRENT_TIMESTAMP' })
  @Index()
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor() {
    this.id = v4();
  }
} 