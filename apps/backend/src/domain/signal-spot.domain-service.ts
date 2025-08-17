import { Injectable, Inject } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { SignalSpot, SpotStatus, SpotVisibility, SpotType } from '../entities/signal-spot.entity';
import { ISignalSpotRepository, SIGNAL_SPOT_REPOSITORY_TOKEN } from '../repositories/signal-spot.repository';
import { User } from '../entities/user.entity';
import { Coordinates } from '../entities/location.entity';

// Domain Service for SignalSpot Business Logic
@Injectable()
export class SignalSpotDomainService {
  constructor(
    @Inject(SIGNAL_SPOT_REPOSITORY_TOKEN)
    private readonly signalSpotRepository: ISignalSpotRepository,
    private readonly em: EntityManager
  ) {}

  // Business Logic: Create SignalSpot with validation
  async createSignalSpot(data: {
    creator: User;
    content: string;
    title?: string;
    latitude: number;
    longitude: number;
    mediaUrls?: string[];
    radiusInMeters?: number;
    durationHours?: number;
    visibility?: SpotVisibility;
    type?: SpotType;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<SignalSpot> {
    // Business Rule: Check if user can create spots
    if (!data.creator.canCreateSignalSpot()) {
      throw new Error('User is not authorized to create SignalSpots');
    }

    // Business Rule: Check daily spot creation limit
    await this.validateDailySpotLimit(data.creator);

    // Business Rule: Check for spam (same location + content)
    await this.validateSpamPrevention(data.creator, data.content, data.latitude, data.longitude);

    // Business Rule: Validate location permissions
    await this.validateLocationPermissions(data.creator, data.latitude, data.longitude);

    // Create and save the spot - map content to message and durationHours to durationInHours for entity
    const spot = SignalSpot.create({
      ...data,
      message: data.content, // Map content to message for internal entity storage
      durationInHours: data.durationHours, // Map durationHours to durationInHours for entity
    });
    return await this.signalSpotRepository.save(spot);
  }

  // Business Logic: Find spots visible to user within their location
  async findSpotsForUser(
    user: User,
    coordinates: Coordinates,
    radiusKm = 1,
    options: {
      limit?: number;
      offset?: number;
      types?: SpotType[];
      tags?: string[];
    } = {}
  ): Promise<SignalSpot[]> {

    // Get spots that the user can view
    const spots = await this.signalSpotRepository.findViewableByUser(
      user,
      coordinates,
      radiusKm,
      options
    );

    // Return all spots found within the search radius
    // The PostGIS query already filters by distance, so we don't need additional filtering
    return spots;
  }

  // Business Logic: Process spot interaction with business rules
  async processSpotInteraction(
    spot: SignalSpot,
    user: User,
    interactionType: 'like' | 'dislike' | 'reply' | 'share' | 'report',
    userLocation?: Coordinates,
    additionalData?: any
  ): Promise<void> {
    // Business Rule: Check if user can interact with this spot
    if (!spot.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    // Business Rule: Check if user is within range for interaction
    if (userLocation && !spot.isWithinRadius(userLocation)) {
      throw new Error('User is not within range to interact with this spot');
    }

    // Business Rule: Prevent spam interactions
    await this.validateInteractionSpamPrevention(spot, user, interactionType);

    // Process the interaction
    switch (interactionType) {
      case 'like':
        spot.addLike(user);
        break;
      case 'dislike':
        spot.addDislike(user);
        break;
      case 'reply':
        spot.addReply(user);
        break;
      case 'share':
        spot.addShare(user);
        break;
      case 'report':
        // Prevent self-reporting
        if (spot.creator.id === user.id) {
          throw new Error('Cannot report your own content');
        }
        if (!additionalData?.reason) {
          throw new Error('Report reason is required');
        }
        spot.reportSpot(user, additionalData.reason);
        break;
    }

    await this.signalSpotRepository.save(spot);
  }

  // Business Logic: Expire spots that have reached their time limit
  async expireSpots(): Promise<number> {
    const em = this.em.fork();
    const repository = em.getRepository(SignalSpot);
    
    const expiredSpots = await repository.find({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: SpotStatus.EXPIRED }
      ],
      isActive: true
    }, {
      populate: ['creator'],
      orderBy: { expiresAt: 'DESC' },
      limit: 100
    });
    
    let expiredCount = 0;

    for (const spot of expiredSpots) {
      if (spot.isExpired() && spot.status !== SpotStatus.EXPIRED) {
        spot.expire();
        await em.persistAndFlush(spot);
        expiredCount++;
      }
    }

    return expiredCount;
  }

  // Business Logic: Clean up old expired spots
  async cleanupExpiredSpots(olderThanHours = 168): Promise<number> {
    return await this.signalSpotRepository.removeExpired(olderThanHours);
  }

  // Business Logic: Find trending spots with engagement velocity
  async findTrendingSpots(
    coordinates?: Coordinates,
    radiusKm?: number,
    limit = 10
  ): Promise<SignalSpot[]> {
    return await this.signalSpotRepository.findTrending(coordinates, radiusKm, limit);
  }

  // Business Logic: Find spots that need attention (expiring soon)
  async findSpotsNeedingAttention(minutesThreshold = 60): Promise<SignalSpot[]> {
    const em = this.em.fork();
    const repository = em.getRepository(SignalSpot);
    const thresholdDate = new Date(Date.now() + (minutesThreshold * 60 * 1000));
    
    return await repository.find({
      isActive: true,
      status: SpotStatus.ACTIVE,
      expiresAt: { $gte: new Date(), $lte: thresholdDate }
    }, {
      populate: ['creator'],
      orderBy: { expiresAt: 'ASC' },
      limit: 50
    });
  }

  // Business Logic: Calculate user's spot statistics
  async getUserSpotStatistics(user: User): Promise<{
    totalSpots: number;
    activeSpots: number;
    expiredSpots: number;
    totalViews: number;
    totalLikes: number;
    totalReplies: number;
    averageEngagement: number;
  }> {
    const userSpots = await this.signalSpotRepository.findByCreator(user.id, {
      includeExpired: true
    });

    const stats = {
      totalSpots: userSpots.length,
      activeSpots: userSpots.filter(s => s.status === SpotStatus.ACTIVE).length,
      expiredSpots: userSpots.filter(s => s.status === SpotStatus.EXPIRED).length,
      totalViews: userSpots.reduce((sum, s) => sum + s.viewCount, 0),
      totalLikes: userSpots.reduce((sum, s) => sum + s.likeCount, 0),
      totalReplies: userSpots.reduce((sum, s) => sum + s.replyCount, 0),
      averageEngagement: 0
    };

    stats.averageEngagement = stats.totalSpots > 0 
      ? (stats.totalLikes + stats.totalReplies) / stats.totalSpots 
      : 0;

    return stats;
  }

  // Business Logic: Check if location has too many spots (spam prevention)
  async checkLocationSpotDensity(
    coordinates: Coordinates,
    radiusKm = 0.1
  ): Promise<{
    spotCount: number;
    isOvercrowded: boolean;
    maxAllowed: number;
  }> {
    const spotCount = await this.signalSpotRepository.countInRadius(coordinates, radiusKm);
    const maxAllowed = 50; // Maximum spots in 100m radius

    return {
      spotCount,
      isOvercrowded: spotCount >= maxAllowed,
      maxAllowed
    };
  }

  // Business Logic: Find spots by content similarity
  async findSimilarSpots(
    spot: SignalSpot,
    radiusKm = 1,
    limit = 5
  ): Promise<SignalSpot[]> {
    const coordinates = spot.getCoordinates();
    const tags = spot.getTags();
    
    if (!tags.isEmpty()) {
      return await this.signalSpotRepository.findByTags(
        tags.tags,
        coordinates,
        radiusKm,
        { limit, matchAll: false }
      );
    }

    // Fallback to content-based search
    const keywords = spot.message.split(' ').slice(0, 3).join(' ');
    return await this.signalSpotRepository.searchByContent(
      keywords,
      coordinates,
      radiusKm,
      { limit }
    );
  }

  // Private helper methods for business rule validation

  private async validateDailySpotLimit(user: User): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySpots = await this.signalSpotRepository.findByCreator(user.id, {
      limit: 100
    });

    const todayCount = todaySpots.filter(spot => 
      spot.createdAt >= today
    ).length;

    const dailyLimit = user.isVerified ? 20 : 5; // Higher limit for verified users

    if (todayCount >= dailyLimit) {
      throw new Error(`Daily spot creation limit reached (${dailyLimit} spots per day)`);
    }
  }

  private async validateSpamPrevention(
    user: User,
    message: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const coordinates = Coordinates.create(latitude, longitude);
    const recentSpots = await this.signalSpotRepository.findByCreator(user.id, {
      limit: 10
    });

    // Check for duplicate content within 100m radius in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const duplicateSpot = recentSpots.find(spot => {
      const spotCoords = spot.getCoordinates();
      return (
        spot.createdAt >= oneHourAgo &&
        spotCoords.distanceTo(coordinates) <= 0.1 && // 100m
        spot.message.toLowerCase() === message.toLowerCase()
      );
    });

    if (duplicateSpot) {
      throw new Error('Similar spot already exists at this location');
    }
  }

  private async validateLocationPermissions(
    user: User,
    latitude: number,
    longitude: number
  ): Promise<void> {

    // Business Rule: Check if user is actually at the location (if recent location available)
    if (user.hasRecentLocation(30)) { // 30 minutes
      const userCoords = Coordinates.create(
        user.lastKnownLatitude!,
        user.lastKnownLongitude!
      );
      const spotCoords = Coordinates.create(latitude, longitude);
      
      // Allow 200m tolerance for GPS accuracy
      if (userCoords.distanceTo(spotCoords) > 0.2) {
        throw new Error('You must be at the location to create a spot there');
      }
    }
  }

  private async validateInteractionSpamPrevention(
    spot: SignalSpot,
    user: User,
    interactionType: string
  ): Promise<void> {
    // This would typically involve checking a separate interaction history table
    // For now, we'll implement basic rate limiting
    
    // Business Rule: Users can only interact with a spot once per type per hour
    // This would be implemented with a proper interaction tracking system
    
    // For reports, allow multiple reports but with different reasons
    if (interactionType === 'report') {
      // Additional validation for reports could be added here
      return;
    }
  }
}

// Domain Events Handler Service
@Injectable()
export class SignalSpotEventHandler {
  constructor(
    @Inject(SIGNAL_SPOT_REPOSITORY_TOKEN)
    private readonly signalSpotRepository: ISignalSpotRepository
  ) {}

  async handleSpotCreated(event: any): Promise<void> {
    // Handle spot creation events
    // This could involve notifications, analytics, etc.
  }

  async handleSpotExpired(event: any): Promise<void> {
    // Handle spot expiration events
    // This could involve cleanup, notifications, etc.
  }

  async handleSpotInteraction(event: any): Promise<void> {
    // Handle spot interaction events
    // This could involve analytics, notifications, etc.
  }

  async handleSpotReported(event: any): Promise<void> {
    // Handle spot reporting events
    // This could involve moderation workflows
  }
}