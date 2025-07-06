import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index('IDX_user_email', ['email'], { unique: true })
@Index('IDX_user_username', ['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'spot_count', default: 0 })
  spotCount: number;

  @Column({ name: 'spark_count', default: 0 })
  sparkCount: number;

  @Column({ name: 'match_count', default: 0 })
  matchCount: number;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations will be added as we create other entities
  // @OneToMany(() => SignalSpot, spot => spot.author)
  // spots: SignalSpot[];

  // @OneToMany(() => SignalSpark, spark => spark.author)
  // sparks: SignalSpark[];
} 