import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Location, LocationAccuracy, LocationSource, LocationPrivacy, Coordinates } from '../entities/location.entity';
import { User } from '../entities/user.entity';

export interface CreateLocationDto {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  accuracyLevel?: LocationAccuracy;
  source?: LocationSource;
  privacy?: LocationPrivacy;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isCurrentLocation?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateLocationDto {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  accuracyLevel?: LocationAccuracy;
  source?: LocationSource;
  privacy?: LocationPrivacy;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isCurrentLocation?: boolean;
  metadata?: Record<string, any>;
}

export interface LocationQuery {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  privacy?: LocationPrivacy;
  accuracyLevel?: LocationAccuracy;
  source?: LocationSource;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface NearbyUsersQuery {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  excludeUserId?: string;
  locationPrivacy?: 'public' | 'friends' | 'private';
  limit?: number;
  offset?: number;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: EntityRepository<Location>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Create a new location record for a user
   */
  async createLocation(userId: string, createLocationDto: CreateLocationDto): Promise<Location> {
    this.logger.log(`Creating location for user ${userId}`);

    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate coordinates
    if (!this.isValidCoordinates(createLocationDto.latitude, createLocationDto.longitude)) {
      throw new BadRequestException('Invalid coordinates');
    }

    const location = Location.create({
      user,
      ...createLocationDto,
    });

    // If this is set as current location, unset other current locations
    if (createLocationDto.isCurrentLocation) {
      await this.unsetCurrentLocations(userId);
    }

    await this.em.persistAndFlush(location);

    // Update user's last known location
    await this.updateUserLastKnownLocation(userId, createLocationDto.latitude, createLocationDto.longitude);

    this.logger.log(`Location created with ID: ${location.id}`);
    return location;
  }

  /**
   * Update an existing location
   */
  async updateLocation(locationId: string, userId: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    this.logger.log(`Updating location ${locationId} for user ${userId}`);

    const location = await this.locationRepository.findOne({ id: locationId, user: userId });
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate coordinates if provided
    if (updateLocationDto.latitude !== undefined && updateLocationDto.longitude !== undefined) {
      if (!this.isValidCoordinates(updateLocationDto.latitude, updateLocationDto.longitude)) {
        throw new BadRequestException('Invalid coordinates');
      }
      location.updateCoordinates(updateLocationDto.latitude, updateLocationDto.longitude);
    }

    // Update other properties
    if (updateLocationDto.altitude !== undefined) location.altitude = updateLocationDto.altitude;
    if (updateLocationDto.accuracy !== undefined) location.accuracy = updateLocationDto.accuracy;
    if (updateLocationDto.heading !== undefined) location.heading = updateLocationDto.heading;
    if (updateLocationDto.speed !== undefined) location.speed = updateLocationDto.speed;
    if (updateLocationDto.accuracyLevel !== undefined) location.accuracyLevel = updateLocationDto.accuracyLevel;
    if (updateLocationDto.source !== undefined) location.source = updateLocationDto.source;
    if (updateLocationDto.privacy !== undefined) location.updatePrivacy(updateLocationDto.privacy);
    if (updateLocationDto.address !== undefined) location.address = updateLocationDto.address;
    if (updateLocationDto.city !== undefined) location.city = updateLocationDto.city;
    if (updateLocationDto.country !== undefined) location.country = updateLocationDto.country;
    if (updateLocationDto.postalCode !== undefined) location.postalCode = updateLocationDto.postalCode;
    if (updateLocationDto.metadata !== undefined) location.metadata = updateLocationDto.metadata;

    if (updateLocationDto.isCurrentLocation) {
      await this.unsetCurrentLocations(userId);
      location.setAsCurrentLocation();
    }

    await this.em.flush();

    this.logger.log(`Location ${locationId} updated successfully`);
    return location;
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(userId: string): Promise<Location | null> {
    this.logger.log(`Getting current location for user ${userId}`);

    const location = await this.locationRepository.findOne({
      user: userId,
      isCurrentLocation: true,
      isActive: true,
    });

    return location;
  }

  /**
   * Get user's location history
   */
  async getLocationHistory(userId: string, limit = 50, offset = 0): Promise<Location[]> {
    this.logger.log(`Getting location history for user ${userId}`);

    const locations = await this.locationRepository.find(
      { user: userId, isActive: true },
      { orderBy: { createdAt: 'DESC' }, limit, offset }
    );

    return locations;
  }

  /**
   * Find nearby locations within a specified radius
   */
  async findNearbyLocations(query: LocationQuery): Promise<Location[]> {
    this.logger.log(`Finding nearby locations within ${query.radius}km of ${query.latitude}, ${query.longitude}`);

    // Use repository find with in-memory filtering for distance
    const allLocations = await this.locationRepository.find(
      { isActive: true },
      { populate: ['user'] }
    );

    // Filter by distance
    const nearbyLocations = allLocations.filter(location => {
      const distance = this.calculateDistance(
        query.latitude,
        query.longitude,
        location.latitude,
        location.longitude
      );
      return distance <= query.radius;
    });

    // Sort by distance
    nearbyLocations.sort((a, b) => {
      const distA = this.calculateDistance(
        query.latitude,
        query.longitude,
        a.latitude,
        a.longitude
      );
      const distB = this.calculateDistance(
        query.latitude,
        query.longitude,
        b.latitude,
        b.longitude
      );
      return distA - distB;
    });

    // Apply limit and offset
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    return nearbyLocations.slice(offset, offset + limit);
  }


  /**
   * Find nearby users within a specified radius
   */
  async findNearbyUsers(query: NearbyUsersQuery): Promise<User[]> {
    this.logger.log(`Finding nearby users within ${query.radius}km of ${query.latitude}, ${query.longitude}`);

    // Find users with location data
    const conditions: any = {
      lastKnownLatitude: { $ne: null },
      lastKnownLongitude: { $ne: null },
      locationTrackingEnabled: true,
      isActive: true
    };

    if (query.excludeUserId) {
      conditions.id = { $ne: query.excludeUserId };
    }

    if (query.locationPrivacy) {
      conditions.locationPrivacy = query.locationPrivacy;
    }

    const allUsers = await this.userRepository.find(conditions);

    // Filter by distance
    const nearbyUsers = allUsers.filter(user => {
      if (!user.lastKnownLatitude || !user.lastKnownLongitude) {
        return false;
      }
      const distance = this.calculateDistance(
        query.latitude,
        query.longitude,
        user.lastKnownLatitude,
        user.lastKnownLongitude
      );
      return distance <= query.radius;
    });

    // Sort by distance
    nearbyUsers.sort((a, b) => {
      const distA = this.calculateDistance(
        query.latitude,
        query.longitude,
        a.lastKnownLatitude!,
        a.lastKnownLongitude!
      );
      const distB = this.calculateDistance(
        query.latitude,
        query.longitude,
        b.lastKnownLatitude!,
        b.lastKnownLongitude!
      );
      return distA - distB;
    });

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    return nearbyUsers.slice(offset, offset + limit);
  }

  /**
   * Delete a location
   */
  async deleteLocation(locationId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting location ${locationId} for user ${userId}`);

    const location = await this.locationRepository.findOne({ id: locationId, user: userId });
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.em.removeAndFlush(location);
    this.logger.log(`Location ${locationId} deleted successfully`);
  }

  /**
   * Deactivate a location instead of deleting it
   */
  async deactivateLocation(locationId: string, userId: string): Promise<Location> {
    this.logger.log(`Deactivating location ${locationId} for user ${userId}`);

    const location = await this.locationRepository.findOne({ id: locationId, user: userId });
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    location.deactivate();
    await this.em.flush();

    this.logger.log(`Location ${locationId} deactivated successfully`);
    return location;
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const coord1 = Coordinates.create(lat1, lon1);
    const coord2 = Coordinates.create(lat2, lon2);
    return coord1.distanceTo(coord2);
  }

  /**
   * Check if coordinates are within a radius
   */
  isWithinRadius(lat1: number, lon1: number, lat2: number, lon2: number, radiusKm: number): boolean {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusKm;
  }

  /**
   * Validate coordinates
   */
  private isValidCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Unset current locations for a user
   */
  private async unsetCurrentLocations(userId: string): Promise<void> {
    const currentLocations = await this.locationRepository.find({
      user: userId,
      isCurrentLocation: true,
    });

    for (const location of currentLocations) {
      location.unsetAsCurrentLocation();
    }

    if (currentLocations.length > 0) {
      await this.em.flush();
    }
  }

  /**
   * Update user's last known location
   */
  private async updateUserLastKnownLocation(userId: string, latitude: number, longitude: number): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId });
    if (user) {
      user.updateLastKnownLocation(latitude, longitude);
      await this.em.flush();
    }
  }

  /**
   * Clean up old location records
   */
  async cleanupOldLocations(olderThanDays = 30): Promise<number> {
    this.logger.log(`Cleaning up location records older than ${olderThanDays} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Find old locations
    const oldLocations = await this.locationRepository.find({
      createdAt: { $lt: cutoffDate },
      isCurrentLocation: false
    });

    if (oldLocations.length > 0) {
      await this.em.removeAndFlush(oldLocations);
    }

    this.logger.log(`Cleaned up ${oldLocations.length} old location records`);
    return oldLocations.length;
  }


  /**
   * Get location statistics for a user
   */
  async getLocationStats(userId: string): Promise<{
    totalLocations: number;
    currentLocation: Location | null;
    lastUpdate: Date | null;
    averageAccuracy: number | null;
    mostCommonSource: LocationSource | null;
  }> {
    this.logger.log(`Getting location stats for user ${userId}`);

    const [totalLocations, currentLocation, locations] = await Promise.all([
      this.locationRepository.count({ user: userId, isActive: true }),
      this.getCurrentLocation(userId),
      this.locationRepository.find({ user: userId, isActive: true }, { orderBy: { createdAt: 'DESC' }, limit: 100 })
    ]);

    const lastUpdate = locations.length > 0 ? locations[0].createdAt : null;
    
    const accuracyValues = locations.filter(l => l.accuracy).map(l => l.accuracy!);
    const averageAccuracy = accuracyValues.length > 0 
      ? accuracyValues.reduce((sum, acc) => sum + acc, 0) / accuracyValues.length 
      : null;

    // Find most common source
    const sourceCounts = locations.reduce((counts, location) => {
      counts[location.source] = (counts[location.source] || 0) + 1;
      return counts;
    }, {} as Record<LocationSource, number>);

    const mostCommonSource = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as LocationSource || null;

    return {
      totalLocations,
      currentLocation,
      lastUpdate,
      averageAccuracy,
      mostCommonSource
    };
  }

  /**
   * Check if a user can access another user's location
   */
  async canAccessUserLocation(requestingUserId: string, targetUserId: string): Promise<boolean> {
    if (requestingUserId === targetUserId) {
      return true;
    }

    const targetUser = await this.userRepository.findOne({ id: targetUserId });
    if (!targetUser) {
      return false;
    }

    const requestingUser = await this.userRepository.findOne({ id: requestingUserId });
    if (!requestingUser) {
      return false;
    }

    return targetUser.canShareLocationWith(requestingUser);
  }

  /**
   * Get user's location if accessible
   */
  async getUserLocation(requestingUserId: string, targetUserId: string): Promise<Location | null> {
    const canAccess = await this.canAccessUserLocation(requestingUserId, targetUserId);
    if (!canAccess) {
      throw new ForbiddenException('Access to this user\'s location is denied');
    }

    return this.getCurrentLocation(targetUserId);
  }

  /**
   * Find a user's location by ID
   */
  async findUserLocation(locationId: string, user: User): Promise<Location | null> {
    return await this.locationRepository.findOne({
      id: locationId,
      user: user.id,
    });
  }

  /**
   * Activate a location
   */
  async activateLocation(location: Location): Promise<void> {
    location.activate();
    await this.em.flush();
  }
}