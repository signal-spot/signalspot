import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';
import { SignalSpot } from '../../entities/signal-spot.entity';

export interface CachedSpot {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  message: string;
  type: string;
  status: string;
  creatorId: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
}

export interface LocationBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

@Injectable()
export class LocationCacheService {
  private readonly logger = new Logger(LocationCacheService.name);
  private readonly NEARBY_SPOTS_TTL = 300; // 5 minutes
  private readonly GEOHASH_PRECISION = 6; // ~1.2km precision
  private readonly POPULAR_LOCATIONS_TTL = 1800; // 30 minutes

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Generate geohash for location-based caching
   */
  private generateGeohash(latitude: number, longitude: number, precision: number = this.GEOHASH_PRECISION): string {
    // Simple geohash implementation
    const latRange = [-90, 90];
    const lngRange = [-180, 180];
    let hash = '';
    let isLat = true;
    
    for (let i = 0; i < precision * 5; i++) {
      let mid: number;
      
      if (isLat) {
        mid = (latRange[0] + latRange[1]) / 2;
        if (latitude >= mid) {
          hash += '1';
          latRange[0] = mid;
        } else {
          hash += '0';
          latRange[1] = mid;
        }
      } else {
        mid = (lngRange[0] + lngRange[1]) / 2;
        if (longitude >= mid) {
          hash += '1';
          lngRange[0] = mid;
        } else {
          hash += '0';
          lngRange[1] = mid;
        }
      }
      
      isLat = !isLat;
    }
    
    return hash;
  }

  /**
   * Cache nearby spots for a location
   */
  async cacheNearbySpots(
    latitude: number, 
    longitude: number, 
    radius: number, 
    spots: SignalSpot[]
  ): Promise<void> {
    const geohash = this.generateGeohash(latitude, longitude);
    const cacheKey = `location:nearby:${geohash}:${radius}`;
    
    const cachedSpots: CachedSpot[] = spots.map(spot => ({
      id: spot.id,
      latitude: spot.latitude,
      longitude: spot.longitude,
      title: spot.title,
      message: spot.message,
      type: spot.type,
      status: spot.status,
      creatorId: spot.creator.id,
      createdAt: spot.createdAt.toISOString(),
      viewCount: spot.viewCount,
      likeCount: spot.likeCount,
    }));

    await this.cacheService.set(cacheKey, cachedSpots, { ttl: this.NEARBY_SPOTS_TTL });
  }

  /**
   * Get cached nearby spots
   */
  async getCachedNearbySpots(
    latitude: number, 
    longitude: number, 
    radius: number
  ): Promise<CachedSpot[] | null> {
    const geohash = this.generateGeohash(latitude, longitude);
    const cacheKey = `location:nearby:${geohash}:${radius}`;
    
    return await this.cacheService.get<CachedSpot[]>(cacheKey);
  }

  /**
   * Cache user location with expiry
   */
  async cacheUserLocation(
    userId: string, 
    latitude: number, 
    longitude: number,
    accuracy?: number
  ): Promise<void> {
    const cacheKey = `location:user:${userId}`;
    const locationData = {
      latitude,
      longitude,
      accuracy,
      timestamp: Date.now(),
    };

    await this.cacheService.set(cacheKey, locationData, { ttl: 600 }); // 10 minutes
  }

  /**
   * Get cached user location
   */
  async getCachedUserLocation(userId: string): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  } | null> {
    const cacheKey = `location:user:${userId}`;
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Cache nearby users for spark detection
   */
  async cacheNearbyUsers(
    latitude: number,
    longitude: number,
    radius: number,
    users: Array<{
      userId: string;
      latitude: number;
      longitude: number;
      distance: number;
      lastSeen: Date;
    }>
  ): Promise<void> {
    const geohash = this.generateGeohash(latitude, longitude);
    const cacheKey = `location:users:${geohash}:${radius}`;
    
    await this.cacheService.set(cacheKey, users, { ttl: 120 }); // 2 minutes
  }

  /**
   * Get cached nearby users
   */
  async getCachedNearbyUsers(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<Array<{
    userId: string;
    latitude: number;
    longitude: number;
    distance: number;
    lastSeen: Date;
  }> | null> {
    const geohash = this.generateGeohash(latitude, longitude);
    const cacheKey = `location:users:${geohash}:${radius}`;
    
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Cache popular locations
   */
  async cachePopularLocations(locations: Array<{
    latitude: number;
    longitude: number;
    name: string;
    activityCount: number;
    userCount: number;
  }>): Promise<void> {
    const cacheKey = 'location:popular';
    await this.cacheService.set(cacheKey, locations, { ttl: this.POPULAR_LOCATIONS_TTL });
  }

  /**
   * Get cached popular locations
   */
  async getCachedPopularLocations(): Promise<Array<{
    latitude: number;
    longitude: number;
    name: string;
    activityCount: number;
    userCount: number;
  }> | null> {
    const cacheKey = 'location:popular';
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Cache location-based statistics
   */
  async cacheLocationStats(
    geohash: string,
    stats: {
      totalSpots: number;
      activeSpots: number;
      totalUsers: number;
      activeUsers: number;
      averageActivity: number;
    }
  ): Promise<void> {
    const cacheKey = `location:stats:${geohash}`;
    await this.cacheService.set(cacheKey, stats, { ttl: 1800 }); // 30 minutes
  }

  /**
   * Get cached location statistics
   */
  async getCachedLocationStats(geohash: string): Promise<{
    totalSpots: number;
    activeSpots: number;
    totalUsers: number;
    activeUsers: number;
    averageActivity: number;
  } | null> {
    const cacheKey = `location:stats:${geohash}`;
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Cache location search results
   */
  async cacheLocationSearch(
    query: string,
    results: Array<{
      name: string;
      latitude: number;
      longitude: number;
      address?: string;
      type: string;
    }>
  ): Promise<void> {
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `location:search:${Buffer.from(normalizedQuery).toString('base64')}`;
    
    await this.cacheService.set(cacheKey, results, { ttl: 3600 }); // 1 hour
  }

  /**
   * Get cached location search results
   */
  async getCachedLocationSearch(query: string): Promise<Array<{
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    type: string;
  }> | null> {
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `location:search:${Buffer.from(normalizedQuery).toString('base64')}`;
    
    return await this.cacheService.get(cacheKey);
  }

  /**
   * Invalidate location cache for a specific area
   */
  async invalidateAreaCache(latitude: number, longitude: number, radius: number): Promise<void> {
    const geohash = this.generateGeohash(latitude, longitude);
    
    const patterns = [
      `signalspot:location:nearby:${geohash}:*`,
      `signalspot:location:users:${geohash}:*`,
      `signalspot:location:stats:${geohash}`,
    ];

    await Promise.all(
      patterns.map(pattern => this.cacheService.invalidateByPattern(pattern))
    );

    this.logger.debug(`Invalidated location cache for area ${geohash}`);
  }

  /**
   * Invalidate user location cache
   */
  async invalidateUserLocation(userId: string): Promise<void> {
    const cacheKey = `location:user:${userId}`;
    await this.cacheService.del(cacheKey);
  }

  /**
   * Get geohash for coordinate (utility method)
   */
  getGeohash(latitude: number, longitude: number): string {
    return this.generateGeohash(latitude, longitude);
  }

  /**
   * Calculate distance between two points (utility method)
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Batch invalidate multiple areas
   */
  async batchInvalidateAreas(locations: Array<{ latitude: number; longitude: number }>): Promise<void> {
    await Promise.all(
      locations.map(location => 
        this.invalidateAreaCache(location.latitude, location.longitude, 1000)
      )
    );
  }

  /**
   * Pre-warm cache for popular areas
   */
  async preWarmPopularAreas(
    areas: Array<{ latitude: number; longitude: number; radius: number }>
  ): Promise<void> {
    // This would be called with actual spot data from the service
    this.logger.log(`Pre-warming location cache for ${areas.length} popular areas`);
    
    // Implementation would fetch spots for each area and cache them
    // This is a placeholder for the actual implementation
  }
}