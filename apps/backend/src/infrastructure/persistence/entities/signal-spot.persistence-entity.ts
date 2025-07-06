import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { SpotCategory, SpotStatus, SpotVisibility, SpotInteraction } from '../../../domain/signal-spot/entities/signal-spot.entity';

@Entity({ tableName: 'signal_spots' })
export class SignalSpotEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'decimal', precision: 10, scale: 8 })
  @Index()
  latitude!: number;

  @Property({ type: 'decimal', precision: 11, scale: 8 })
  @Index()
  longitude!: number;

  @Property()
  radius!: number;

  @Property({ type: 'enum' })
  @Index()
  category!: SpotCategory;

  @Property({ type: 'enum' })
  visibility!: SpotVisibility;

  @Property()
  @Index()
  createdBy!: string;

  @Property({ type: 'enum' })
  @Index()
  status!: SpotStatus;

  @Property()
  @Index()
  createdAt!: Date;

  @Property()
  @Index()
  expiresAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ type: 'json', nullable: true })
  interactions?: SpotInteraction[];
}