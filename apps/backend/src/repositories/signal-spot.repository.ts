import { Injectable } from '@nestjs/common';
import { EntityRepository, FindOptions, QueryBuilder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { SignalSpot, SpotId, SpotStatus, SpotVisibility, SpotType } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';
import { Coordinates } from '../entities/location.entity';

// Domain Repository Interface
export interface ISignalSpotRepository {
  // Basic CRUD operations
  findById(id: SpotId): Promise<SignalSpot | null>;
  findByIdAndCreator(id: SpotId, creatorId: string): Promise<SignalSpot | null>;
  save(spot: SignalSpot): Promise<SignalSpot>;
  remove(spot: SignalSpot): Promise<void>;
  
  // Location-based queries
  findNearby(
    coordinates: Coordinates,
    radiusKm: number,
    options?: {
      limit?: number;
      offset?: number;
      visibility?: SpotVisibility;
      types?: SpotType[];
      tags?: string[];
      excludeExpired?: boolean;
    }
  ): Promise<SignalSpot[]>;
  
  findWithinRadius(
    coordinates: Coordinates,
    radiusKm: number,
    visibility?: SpotVisibility
  ): Promise<SignalSpot[]>;
  
  // User-specific queries
  findByCreator(
    creatorId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: SpotStatus;
      includeExpired?: boolean;
    }
  ): Promise<SignalSpot[]>;
  
  findViewableByUser(
    user: User,
    coordinates?: Coordinates,
    radiusKm?: number,
    options?: {
      limit?: number;
      offset?: number;
      types?: SpotType[];
      tags?: string[];
    }
  ): Promise<SignalSpot[]>;
  
  // Status-based queries
  findActive(coordinates?: Coordinates, radiusKm?: number): Promise<SignalSpot[]>;
  findExpired(limit?: number): Promise<SignalSpot[]>;
  findExpiring(minutesThreshold: number): Promise<SignalSpot[]>;
  
  // Analytics queries
  findPopular(
    coordinates?: Coordinates,
    radiusKm?: number,
    options?: {
      limit?: number;
      timeframe?: 'hour' | 'day' | 'week' | 'month';
    }
  ): Promise<SignalSpot[]>;
  
  findTrending(
    coordinates?: Coordinates,
    radiusKm?: number,
    limit?: number
  ): Promise<SignalSpot[]>;
  
  // Search queries
  searchByContent(
    query: string,
    coordinates?: Coordinates,
    radiusKm?: number,
    options?: {
      limit?: number;
      offset?: number;
      visibility?: SpotVisibility;
    }
  ): Promise<SignalSpot[]>;
  
  findByTags(
    tags: string[],
    coordinates?: Coordinates,
    radiusKm?: number,
    options?: {
      limit?: number;
      offset?: number;
      matchAll?: boolean;
    }
  ): Promise<SignalSpot[]>;
  
  // Reporting and moderation
  findReported(limit?: number): Promise<SignalSpot[]>;
  findByUser(userId: string, limit?: number): Promise<SignalSpot[]>;
  
  // Statistics
  countByStatus(status: SpotStatus): Promise<number>;
  countByCreator(creatorId: string): Promise<number>;
  countInRadius(coordinates: Coordinates, radiusKm: number): Promise<number>;
  
  // Batch operations
  markExpired(spotIds: SpotId[]): Promise<void>;
  removeExpired(olderThanHours: number): Promise<number>;
}

// Repository Implementation
@Injectable()
export class SignalSpotRepository implements ISignalSpotRepository {
  constructor(
    @InjectRepository(SignalSpot)
    private readonly repository: EntityRepository<SignalSpot>
  ) {}

  async findById(id: SpotId): Promise<SignalSpot | null> {
    return await this.repository.findOne(
      { id: id.toString() },
      { populate: ['creator'] }
    );
  }

  async findByIdAndCreator(id: SpotId, creatorId: string): Promise<SignalSpot | null> {
    return await this.repository.findOne(
      { id: id.toString(), creator: creatorId },
      { populate: ['creator'] }
    );
  }

  async save(spot: SignalSpot): Promise<SignalSpot> {
    await this.repository.persistAndFlush(spot);
    return spot;
  }

  async remove(spot: SignalSpot): Promise<void> {
    await this.repository.removeAndFlush(spot);
  }

  async findNearby(
    coordinates: Coordinates,
    radiusKm: number,
    options: {
      limit?: number;
      offset?: number;
      visibility?: SpotVisibility;
      types?: SpotType[];
      tags?: string[];
      excludeExpired?: boolean;
    } = {}
  ): Promise<SignalSpot[]> {
    const qb = this.repository.createQueryBuilder('s');
    
    // Calculate distance using Haversine formula
    qb.select('s.*')
      .addSelect(`(
        6371 * acos(
          cos(radians(${coordinates.latitude})) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(${coordinates.longitude})) + 
          sin(radians(${coordinates.latitude})) * 
          sin(radians(s.latitude))
        )
      ) AS distance`)
      .where(`(
        6371 * acos(
          cos(radians(${coordinates.latitude})) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(${coordinates.longitude})) + 
          sin(radians(${coordinates.latitude})) * 
          sin(radians(s.latitude))
        )
      ) <= ?`, [radiusKm])
      .andWhere({ isActive: true });

    if (options.excludeExpired !== false) {
      qb.andWhere('s.expiresAt > ?', [new Date()]);
    }

    if (options.visibility) {
      qb.andWhere({ visibility: options.visibility });
    }

    if (options.types && options.types.length > 0) {
      qb.andWhere({ type: { $in: options.types } });
    }

    if (options.tags && options.tags.length > 0) {
      qb.andWhere({ tags: { $overlap: options.tags } });
    }

    qb.orderBy({ distance: 'ASC' })
      .limit(options.limit || 50)
      .offset(options.offset || 0);

    return await qb.getResultList();
  }

  async findWithinRadius(
    coordinates: Coordinates,
    radiusKm: number,
    visibility?: SpotVisibility
  ): Promise<SignalSpot[]> {
    const conditions: any = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() }
    };

    if (visibility) {
      conditions.visibility = visibility;
    }

    const qb = this.repository.createQueryBuilder('s');
    
    qb.select('s.*')
      .where(conditions)
      .andWhere(`(
        6371 * acos(
          cos(radians(${coordinates.latitude})) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(${coordinates.longitude})) + 
          sin(radians(${coordinates.latitude})) * 
          sin(radians(s.latitude))
        )
      ) <= ?`, [radiusKm])
      .populate(['creator']);

    return await qb.getResultList();
  }

  async findByCreator(
    creatorId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: SpotStatus;
      includeExpired?: boolean;
    } = {}
  ): Promise<SignalSpot[]> {
    const conditions: any = {
      creator: creatorId,
      isActive: true
    };

    if (options.status) {
      conditions.status = options.status;
    }

    if (!options.includeExpired) {
      conditions.expiresAt = { $gt: new Date() };
    }

    return await this.repository.find(conditions, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' },
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  }

  async findViewableByUser(
    user: User,
    coordinates?: Coordinates,
    radiusKm?: number,
    options: {
      limit?: number;
      offset?: number;
      types?: SpotType[];
      tags?: string[];
    } = {}
  ): Promise<SignalSpot[]> {
    const conditions: any = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
      $or: [
        { visibility: SpotVisibility.PUBLIC },
        { creator: user.id }
        // TODO: Add friends visibility when friend system is implemented
      ]
    };

    if (options.types && options.types.length > 0) {
      conditions.type = { $in: options.types };
    }

    if (options.tags && options.tags.length > 0) {
      conditions.tags = { $overlap: options.tags };
    }

    let query = this.repository.find(conditions, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' },
      limit: options.limit || 50,
      offset: options.offset || 0
    });

    // If location-based filtering is requested
    if (coordinates && radiusKm) {
      return this.findNearby(coordinates, radiusKm, {
        limit: options.limit,
        offset: options.offset,
        types: options.types,
        tags: options.tags
      });
    }

    return await query;
  }

  async findActive(coordinates?: Coordinates, radiusKm?: number): Promise<SignalSpot[]> {
    const conditions = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() }
    };

    if (coordinates && radiusKm) {
      return this.findWithinRadius(coordinates, radiusKm, SpotVisibility.PUBLIC);
    }

    return await this.repository.find(conditions, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' }
    });
  }

  async findExpired(limit = 100): Promise<SignalSpot[]> {
    return await this.repository.find({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: SpotStatus.EXPIRED }
      ],
      isActive: true
    }, {
      populate: ['creator'],
      orderBy: { expiresAt: 'DESC' },
      limit
    });
  }

  async findExpiring(minutesThreshold: number): Promise<SignalSpot[]> {
    const thresholdDate = new Date(Date.now() + (minutesThreshold * 60 * 1000));
    
    return await this.repository.find({
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $between: [new Date(), thresholdDate] }
    }, {
      populate: ['creator'],
      orderBy: { expiresAt: 'ASC' }
    });
  }

  async findPopular(
    coordinates?: Coordinates,
    radiusKm?: number,
    options: {
      limit?: number;
      timeframe?: 'hour' | 'day' | 'week' | 'month';
    } = {}
  ): Promise<SignalSpot[]> {
    let since = new Date();
    
    switch (options.timeframe) {
      case 'hour':
        since.setHours(since.getHours() - 1);
        break;
      case 'day':
        since.setDate(since.getDate() - 1);
        break;
      case 'week':
        since.setDate(since.getDate() - 7);
        break;
      case 'month':
        since.setMonth(since.getMonth() - 1);
        break;
      default:
        since.setDate(since.getDate() - 1); // Default to last day
    }

    const conditions = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
      createdAt: { $gte: since }
    };

    if (coordinates && radiusKm) {
      return this.findNearby(coordinates, radiusKm, {
        limit: options.limit || 20,
        excludeExpired: true
      });
    }

    return await this.repository.find(conditions, {
      populate: ['creator'],
      orderBy: { 
        likeCount: 'DESC', 
        viewCount: 'DESC', 
        replyCount: 'DESC' 
      },
      limit: options.limit || 20
    });
  }

  async findTrending(
    coordinates?: Coordinates,
    radiusKm?: number,
    limit = 10
  ): Promise<SignalSpot[]> {
    const qb = this.repository.createQueryBuilder('s');
    
    // Calculate trending score based on engagement velocity
    qb.select('s.*')
      .addSelect(`(
        (s.like_count * 2 + s.reply_count * 3 + s.share_count * 4) / 
        EXTRACT(EPOCH FROM (NOW() - s.created_at)) * 3600
      ) AS trending_score`)
      .where({
        isActive: true,
        status: SpotStatus.ACTIVE,
        expiresAt: { $gt: new Date() },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
      .orderBy({ trending_score: 'DESC' })
      .limit(limit);

    if (coordinates && radiusKm) {
      qb.andWhere(`(
        6371 * acos(
          cos(radians(${coordinates.latitude})) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(${coordinates.longitude})) + 
          sin(radians(${coordinates.latitude})) * 
          sin(radians(s.latitude))
        )
      ) <= ?`, [radiusKm]);
    }

    return await qb.getResultList();
  }

  async searchByContent(
    query: string,
    coordinates?: Coordinates,
    radiusKm?: number,
    options: {
      limit?: number;
      offset?: number;
      visibility?: SpotVisibility;
    } = {}
  ): Promise<SignalSpot[]> {
    const conditions: any = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
      $or: [
        { message: { $like: `%${query}%` } },
        { title: { $like: `%${query}%` } }
      ]
    };

    if (options.visibility) {
      conditions.visibility = options.visibility;
    }

    if (coordinates && radiusKm) {
      return this.findNearby(coordinates, radiusKm, {
        limit: options.limit,
        offset: options.offset,
        visibility: options.visibility
      });
    }

    return await this.repository.find(conditions, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' },
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  }

  async findByTags(
    tags: string[],
    coordinates?: Coordinates,
    radiusKm?: number,
    options: {
      limit?: number;
      offset?: number;
      matchAll?: boolean;
    } = {}
  ): Promise<SignalSpot[]> {
    const conditions: any = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() }
    };

    if (options.matchAll) {
      conditions.tags = { $contains: tags };
    } else {
      conditions.tags = { $overlap: tags };
    }

    if (coordinates && radiusKm) {
      return this.findNearby(coordinates, radiusKm, {
        limit: options.limit,
        offset: options.offset,
        tags
      });
    }

    return await this.repository.find(conditions, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' },
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  }

  async findReported(limit = 100): Promise<SignalSpot[]> {
    return await this.repository.find({
      isActive: true,
      reportCount: { $gt: 0 }
    }, {
      populate: ['creator'],
      orderBy: { reportCount: 'DESC' },
      limit
    });
  }

  async findByUser(userId: string, limit = 50): Promise<SignalSpot[]> {
    return await this.repository.find({
      creator: userId,
      isActive: true
    }, {
      populate: ['creator'],
      orderBy: { createdAt: 'DESC' },
      limit
    });
  }

  async countByStatus(status: SpotStatus): Promise<number> {
    return await this.repository.count({ status });
  }

  async countByCreator(creatorId: string): Promise<number> {
    return await this.repository.count({ 
      creator: creatorId,
      isActive: true 
    });
  }

  async countInRadius(coordinates: Coordinates, radiusKm: number): Promise<number> {
    const qb = this.repository.createQueryBuilder('s');
    
    const result = await qb
      .select('COUNT(*) as count')
      .where({
        isActive: true,
        status: SpotStatus.ACTIVE,
        expiresAt: { $gt: new Date() }
      })
      .andWhere(`(
        6371 * acos(
          cos(radians(${coordinates.latitude})) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(${coordinates.longitude})) + 
          sin(radians(${coordinates.latitude})) * 
          sin(radians(s.latitude))
        )
      ) <= ?`, [radiusKm])
      .execute();

    return parseInt(result[0].count);
  }

  async markExpired(spotIds: SpotId[]): Promise<void> {
    const ids = spotIds.map(id => id.toString());
    
    await this.repository.nativeUpdate(
      { id: { $in: ids } },
      { 
        status: SpotStatus.EXPIRED,
        isActive: false,
        updatedAt: new Date()
      }
    );
  }

  async removeExpired(olderThanHours: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    
    const expiredSpots = await this.repository.find({
      status: SpotStatus.EXPIRED,
      updatedAt: { $lt: cutoffDate }
    });

    if (expiredSpots.length > 0) {
      await this.repository.removeAndFlush(expiredSpots);
    }

    return expiredSpots.length;
  }

  // Helper method to build location-based queries
  private buildLocationQuery(
    qb: QueryBuilder<SignalSpot>,
    coordinates: Coordinates,
    radiusKm: number
  ): void {
    qb.andWhere(`(
      6371 * acos(
        cos(radians(${coordinates.latitude})) * 
        cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians(${coordinates.longitude})) + 
        sin(radians(${coordinates.latitude})) * 
        sin(radians(s.latitude))
      )
    ) <= ?`, [radiusKm]);
  }
}