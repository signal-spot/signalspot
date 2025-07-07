import { Injectable } from '@nestjs/common';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { SignalSpot, SpotId, SpotStatus, SpotVisibility, SpotType } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';
import { Coordinates } from '../entities/location.entity';

// Domain Repository Interface Token
export const SIGNAL_SPOT_REPOSITORY_TOKEN = 'ISignalSpotRepository';

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
    private readonly repository: EntityRepository<SignalSpot>,
    private readonly em: EntityManager
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
    await this.em.persistAndFlush(spot);
    return spot;
  }

  async remove(spot: SignalSpot): Promise<void> {
    await this.em.removeAndFlush(spot);
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
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    // Build base conditions
    let whereConditions = ['s.is_active = true'];
    const params: any[] = [coordinates.latitude, coordinates.longitude, radiusKm * 1000]; // Convert km to meters

    if (options.excludeExpired !== false) {
      whereConditions.push('s.expires_at > NOW()');
    }

    if (options.visibility) {
      whereConditions.push('s.visibility = $' + (params.length + 1));
      params.push(options.visibility);
    }

    if (options.types && options.types.length > 0) {
      whereConditions.push('s.type = ANY($' + (params.length + 1) + ')');
      params.push(options.types);
    }

    if (options.tags && options.tags.length > 0) {
      whereConditions.push('s.tags && $' + (params.length + 1));
      params.push(options.tags);
    }

    const whereClause = whereConditions.join(' AND ');

    // PostGIS query for efficient spatial search
    const query = `
      SELECT s.*, 
             ST_Distance(
               ST_Point(s.longitude, s.latitude)::geography,
               ST_Point($2, $1)::geography
             ) as distance_meters,
             u.id as creator_id,
             u.username as creator_username,
             u.email as creator_email,
             u.first_name as creator_first_name,
             u.last_name as creator_last_name,
             u.avatar_url as creator_avatar_url,
             u.is_verified as creator_is_verified
      FROM signal_spot s
      JOIN user u ON s.creator_id = u.id
      WHERE ${whereClause}
        AND ST_DWithin(
          ST_Point(s.longitude, s.latitude)::geography,
          ST_Point($2, $1)::geography,
          $3
        )
      ORDER BY ST_Distance(
        ST_Point(s.longitude, s.latitude)::geography,
        ST_Point($2, $1)::geography
      )
      LIMIT ${limit} OFFSET ${offset};
    `;

    const result = await this.em.getConnection().execute(query, params);
    
    return this.mapRawResultsToEntities(result);
  }

  private mapRawResultsToEntities(rawResults: any[]): SignalSpot[] {
    return rawResults.map(row => {
      const spot = new SignalSpot();
      
      // Map basic spot properties
      Object.assign(spot, {
        id: row.id,
        message: row.message,
        title: row.title,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        radiusInMeters: parseInt(row.radius_in_meters || '100'),
        durationInHours: parseInt(row.duration_in_hours || '24'),
        status: row.status,
        visibility: row.visibility,
        type: row.type,
        tags: row.tags,
        viewCount: parseInt(row.view_count || '0'),
        likeCount: parseInt(row.like_count || '0'),
        dislikeCount: parseInt(row.dislike_count || '0'),
        replyCount: parseInt(row.reply_count || '0'),
        shareCount: parseInt(row.share_count || '0'),
        reportCount: parseInt(row.report_count || '0'),
        isActive: row.is_active,
        isPinned: row.is_pinned,
        metadata: row.metadata,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: new Date(row.expires_at)
      });

      // Add distance if available
      if (row.distance_meters !== undefined) {
        spot.metadata = { ...spot.metadata, distance: parseFloat(row.distance_meters) };
      }

      return spot;
    });
  }

  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth radius in km
    const lat1Rad = coord1.latitude * Math.PI / 180;
    const lat2Rad = coord2.latitude * Math.PI / 180;
    const deltaLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const deltaLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async findWithinRadius(
    coordinates: Coordinates,
    radiusKm: number,
    visibility?: SpotVisibility
  ): Promise<SignalSpot[]> {
    const params: any[] = [coordinates.latitude, coordinates.longitude, radiusKm * 1000];
    let whereClause = 's.is_active = true AND s.status = \'active\' AND s.expires_at > NOW()';

    if (visibility) {
      whereClause += ' AND s.visibility = $' + (params.length + 1);
      params.push(visibility);
    }

    const query = `
      SELECT s.*, 
             ST_Distance(
               ST_Point(s.longitude, s.latitude)::geography,
               ST_Point($2, $1)::geography
             ) as distance_meters
      FROM signal_spot s
      WHERE ${whereClause}
        AND ST_DWithin(
          ST_Point(s.longitude, s.latitude)::geography,
          ST_Point($2, $1)::geography,
          $3
        )
      ORDER BY ST_Distance(
        ST_Point(s.longitude, s.latitude)::geography,
        ST_Point($2, $1)::geography
      );
    `;

    const result = await this.em.getConnection().execute(query, params);
    return this.mapRawResultsToEntities(result);
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

    const query = this.repository.find(conditions, {
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
      expiresAt: { $gte: new Date(), $lte: thresholdDate }
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
    const since = new Date();
    
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
    const conditions = {
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    };

    const allSpots = await this.repository.find(conditions, {
      populate: ['creator']
    });

    let spots = allSpots;
    
    // Filter by location if provided
    if (coordinates && radiusKm) {
      spots = spots.filter(spot => {
        const distance = this.calculateDistance(
          coordinates,
          Coordinates.create(spot.latitude, spot.longitude)
        );
        return distance <= radiusKm;
      });
    }

    // Calculate trending scores and sort
    const now = Date.now();
    spots.sort((a, b) => {
      const scoreA = this.calculateTrendingScore(a, now);
      const scoreB = this.calculateTrendingScore(b, now);
      return scoreB - scoreA;
    });

    return spots.slice(0, limit);
  }

  private calculateTrendingScore(spot: SignalSpot, now: number): number {
    const ageInHours = (now - spot.createdAt.getTime()) / (1000 * 60 * 60);
    if (ageInHours === 0) return 0;
    
    const engagementScore = (spot.likeCount * 2) + (spot.replyCount * 3) + (spot.shareCount * 4);
    return engagementScore / ageInHours;
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
    const query = `
      SELECT COUNT(*) as count
      FROM signal_spot s
      WHERE s.is_active = true
        AND s.status = 'active'
        AND s.expires_at > NOW()
        AND ST_DWithin(
          ST_Point(s.longitude, s.latitude)::geography,
          ST_Point($2, $1)::geography,
          $3
        );
    `;

    const result = await this.em.getConnection().execute(query, [
      coordinates.latitude,
      coordinates.longitude,
      radiusKm * 1000
    ]);

    return parseInt(result[0]?.count || '0');
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
      await this.em.removeAndFlush(expiredSpots);
    }

    return expiredSpots.length;
  }

}