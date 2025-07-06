import { Injectable } from '@nestjs/common';
import { SignalSpotRepository } from '../../../domain/signal-spot/repositories/signal-spot.repository.interface';
import { Coordinates } from '../../../domain/shared/value-objects/coordinates.value-object';
import { SpotCategory } from '../../../domain/signal-spot/entities/signal-spot.entity';
import { FindNearbySpotsQuery } from '../queries/find-nearby-spots.query';

export interface NearbySpotResult {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  category: string;
  visibility: string;
  createdBy: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  distanceKm: number;
  statistics: {
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    replyCount: number;
    shareCount: number;
  };
}

@Injectable()
export class FindNearbySpotsHandler {
  constructor(private readonly spotRepository: SignalSpotRepository) {}

  async handle(query: FindNearbySpotsQuery): Promise<NearbySpotResult[]> {
    const location = Coordinates.create(query.latitude, query.longitude);
    
    const spots = await this.spotRepository.findNearby({
      location,
      radiusKm: query.radiusKm,
      category: query.category ? this.validateCategory(query.category) : undefined,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      includeExpired: false,
    });

    return spots.map(spot => {
      const statistics = spot.getStatistics();
      return {
        id: spot.id.toString(),
        title: spot.content.getTitle(),
        description: spot.content.getDescription(),
        latitude: spot.location.getLatitude(),
        longitude: spot.location.getLongitude(),
        radius: spot.radius.getValue(),
        category: spot.category,
        visibility: spot.visibility,
        createdBy: spot.createdBy.toString(),
        status: spot.status,
        createdAt: spot.createdAt,
        expiresAt: spot.expiresAt,
        distanceKm: location.distanceTo(spot.location),
        statistics: {
          viewCount: statistics.viewCount,
          likeCount: statistics.likeCount,
          dislikeCount: statistics.dislikeCount,
          replyCount: statistics.replyCount,
          shareCount: statistics.shareCount,
        },
      };
    });
  }

  private validateCategory(category: string): SpotCategory {
    if (!Object.values(SpotCategory).includes(category as SpotCategory)) {
      throw new Error('Invalid spot category');
    }
    return category as SpotCategory;
  }
}