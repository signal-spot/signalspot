import { SignalSpot, SpotCategory, SpotStatus } from '../entities/signal-spot.entity';
import { SpotId } from '../value-objects/spot-id.value-object';
import { UserId } from '../../user/value-objects/user-id.value-object';
import { Coordinates } from '../../shared/value-objects/coordinates.value-object';

export interface FindNearbyOptions {
  location: Coordinates;
  radiusKm: number;
  category?: SpotCategory;
  limit?: number;
  offset?: number;
  includeExpired?: boolean;
}

export interface SignalSpotRepository {
  findById(id: SpotId): Promise<SignalSpot | null>;
  findByCreator(creatorId: UserId): Promise<SignalSpot[]>;
  findNearby(options: FindNearbyOptions): Promise<SignalSpot[]>;
  findActiveSpots(): Promise<SignalSpot[]>;
  findExpiredSpots(): Promise<SignalSpot[]>;
  findByStatus(status: SpotStatus): Promise<SignalSpot[]>;
  countByUserAndDate(userId: UserId, date: Date): Promise<number>;
  save(spot: SignalSpot): Promise<void>;
  remove(spot: SignalSpot): Promise<void>;
}