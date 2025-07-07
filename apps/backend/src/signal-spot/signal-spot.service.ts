import { Injectable, Inject } from '@nestjs/common';
import { SignalSpot, SpotId, SpotStatus, SpotVisibility, SpotType } from '../entities/signal-spot.entity';
import { ISignalSpotRepository, SIGNAL_SPOT_REPOSITORY_TOKEN } from '../repositories/signal-spot.repository';
import { SignalSpotDomainService } from '../domain/signal-spot.domain-service';
import { User } from '../entities/user.entity';
import { Coordinates } from '../entities/location.entity';

// DTOs for API layer
export interface CreateSpotDto {
  message: string;
  title?: string;
  latitude: number;
  longitude: number;
  radiusInMeters?: number;
  durationInHours?: number;
  visibility?: SpotVisibility;
  type?: SpotType;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateSpotDto {
  message?: string;
  title?: string;
  tags?: string[];
}

export interface SpotQueryDto {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  types?: SpotType[];
  tags?: string[];
  search?: string;
  visibility?: SpotVisibility;
}

export interface SpotInteractionDto {
  type: 'like' | 'dislike' | 'reply' | 'share' | 'report';
  latitude?: number;
  longitude?: number;
  reason?: string; // For reports
  content?: string; // For replies
}

// Application Service for SignalSpot
@Injectable()
export class SignalSpotService {
  constructor(
    @Inject(SIGNAL_SPOT_REPOSITORY_TOKEN)
    private readonly signalSpotRepository: ISignalSpotRepository,
    private readonly signalSpotDomainService: SignalSpotDomainService
  ) {}

  // Create a new SignalSpot
  async createSpot(creator: User, createSpotDto: CreateSpotDto): Promise<SignalSpot> {
    return await this.signalSpotDomainService.createSignalSpot({
      creator,
      ...createSpotDto
    });
  }

  // Get a single spot by ID
  async getSpotById(spotId: string, user: User): Promise<SignalSpot | null> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      return null;
    }

    // Check if user can view this spot
    if (!spot.canBeViewedBy(user)) {
      throw new Error('Access denied to this spot');
    }

    // Record view if user is not the creator
    spot.recordView(user);
    await this.signalSpotRepository.save(spot);

    return spot;
  }

  // Get spots near a location
  async getSpotsNearLocation(
    user: User,
    query: SpotQueryDto
  ): Promise<SignalSpot[]> {
    if (!query.latitude || !query.longitude) {
      throw new Error('Location coordinates are required');
    }

    const coordinates = Coordinates.create(query.latitude, query.longitude);
    const radiusKm = query.radiusKm || 1;

    return await this.signalSpotDomainService.findSpotsForUser(
      user,
      coordinates,
      radiusKm,
      {
        limit: query.limit,
        offset: query.offset,
        types: query.types,
        tags: query.tags
      }
    );
  }

  // Get spots created by a user
  async getUserSpots(
    userId: string,
    currentUser: User,
    options: {
      limit?: number;
      offset?: number;
      status?: SpotStatus;
      includeExpired?: boolean;
    } = {}
  ): Promise<SignalSpot[]> {
    // Users can only see their own spots or public spots from others
    if (userId !== currentUser.id) {
      throw new Error('Access denied to user spots');
    }

    return await this.signalSpotRepository.findByCreator(userId, options);
  }

  // Update a spot
  async updateSpot(
    spotId: string,
    updateSpotDto: UpdateSpotDto,
    user: User
  ): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    if (!spot.canBeEditedBy(user)) {
      throw new Error('Access denied to edit this spot');
    }

    if (updateSpotDto.message || updateSpotDto.title) {
      spot.updateContent(
        updateSpotDto.message || spot.message,
        updateSpotDto.title !== undefined ? updateSpotDto.title : spot.title
      );
    }

    if (updateSpotDto.tags) {
      spot.updateTags(updateSpotDto.tags);
    }

    return await this.signalSpotRepository.save(spot);
  }

  // Delete/remove a spot
  async removeSpot(spotId: string, user: User, reason = 'User request'): Promise<void> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    if (!spot.canBeRemovedBy(user)) {
      throw new Error('Access denied to remove this spot');
    }

    spot.remove(reason);
    await this.signalSpotRepository.save(spot);
  }

  // Interact with a spot
  async interactWithSpot(
    spotId: string,
    interaction: SpotInteractionDto,
    user: User
  ): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    let userLocation: Coordinates | undefined;
    if (interaction.latitude && interaction.longitude) {
      userLocation = Coordinates.create(interaction.latitude, interaction.longitude);
    }

    await this.signalSpotDomainService.processSpotInteraction(
      spot,
      user,
      interaction.type,
      userLocation,
      {
        reason: interaction.reason,
        content: interaction.content
      }
    );

    return spot;
  }

  // Search spots by content
  async searchSpots(
    query: string,
    user: User,
    options: {
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SignalSpot[]> {
    let coordinates: Coordinates | undefined;
    if (options.latitude && options.longitude) {
      coordinates = Coordinates.create(options.latitude, options.longitude);
    }

    const spots = await this.signalSpotRepository.searchByContent(
      query,
      coordinates,
      options.radiusKm,
      {
        limit: options.limit,
        offset: options.offset,
        visibility: SpotVisibility.PUBLIC
      }
    );

    // Filter spots that user can view
    return spots.filter(spot => spot.canBeViewedBy(user));
  }

  // Get spots by tags
  async getSpotsByTags(
    tags: string[],
    user: User,
    options: {
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
      limit?: number;
      offset?: number;
      matchAll?: boolean;
    } = {}
  ): Promise<SignalSpot[]> {
    let coordinates: Coordinates | undefined;
    if (options.latitude && options.longitude) {
      coordinates = Coordinates.create(options.latitude, options.longitude);
    }

    const spots = await this.signalSpotRepository.findByTags(
      tags,
      coordinates,
      options.radiusKm,
      {
        limit: options.limit,
        offset: options.offset,
        matchAll: options.matchAll
      }
    );

    // Filter spots that user can view
    return spots.filter(spot => spot.canBeViewedBy(user));
  }

  // Get trending spots
  async getTrendingSpots(
    options: {
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
      limit?: number;
    } = {}
  ): Promise<SignalSpot[]> {
    let coordinates: Coordinates | undefined;
    if (options.latitude && options.longitude) {
      coordinates = Coordinates.create(options.latitude, options.longitude);
    }

    return await this.signalSpotDomainService.findTrendingSpots(
      coordinates,
      options.radiusKm,
      options.limit
    );
  }

  // Get popular spots
  async getPopularSpots(
    options: {
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
      limit?: number;
      timeframe?: 'hour' | 'day' | 'week' | 'month';
    } = {}
  ): Promise<SignalSpot[]> {
    let coordinates: Coordinates | undefined;
    if (options.latitude && options.longitude) {
      coordinates = Coordinates.create(options.latitude, options.longitude);
    }

    return await this.signalSpotRepository.findPopular(
      coordinates,
      options.radiusKm,
      {
        limit: options.limit,
        timeframe: options.timeframe
      }
    );
  }

  // Get user statistics
  async getUserStatistics(user: User): Promise<any> {
    return await this.signalSpotDomainService.getUserSpotStatistics(user);
  }

  // Get location statistics
  async getLocationStatistics(
    latitude: number,
    longitude: number,
    radiusKm = 1
  ): Promise<{ spotCount: number; density: number; averageSignalStrength?: number }> {
    const coordinates = Coordinates.create(latitude, longitude);
    
    const [spotCount, density] = await Promise.all([
      this.signalSpotRepository.countInRadius(coordinates, radiusKm),
      this.signalSpotDomainService.checkLocationSpotDensity(coordinates, 0.1)
    ]);

    return {
      spotCount: spotCount,
      density: density.isOvercrowded ? 1 : 0,
      averageSignalStrength: density.maxAllowed
    };
  }

  // Extend spot duration
  async extendSpotDuration(
    spotId: string,
    additionalHours: number,
    user: User
  ): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    if (!spot.canBeEditedBy(user)) {
      throw new Error('Access denied to extend this spot');
    }

    spot.extendDuration(additionalHours);
    return await this.signalSpotRepository.save(spot);
  }

  // Pause a spot
  async pauseSpot(spotId: string, user: User): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    if (!spot.canBeEditedBy(user)) {
      throw new Error('Access denied to pause this spot');
    }

    spot.pause();
    return await this.signalSpotRepository.save(spot);
  }

  // Resume a spot
  async resumeSpot(spotId: string, user: User): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    if (!spot.canBeEditedBy(user)) {
      throw new Error('Access denied to resume this spot');
    }

    spot.resume();
    return await this.signalSpotRepository.save(spot);
  }

  // Pin a spot (admin/creator only)
  async pinSpot(spotId: string, user: User): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    // Only creator or admin can pin
    if (spot.creator.id !== user.id && !user.isVerified) {
      throw new Error('Access denied to pin this spot');
    }

    spot.pin();
    return await this.signalSpotRepository.save(spot);
  }

  // Unpin a spot
  async unpinSpot(spotId: string, user: User): Promise<SignalSpot> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    // Only creator or admin can unpin
    if (spot.creator.id !== user.id && !user.isVerified) {
      throw new Error('Access denied to unpin this spot');
    }

    spot.unpin();
    return await this.signalSpotRepository.save(spot);
  }

  // Get similar spots
  async getSimilarSpots(
    spotId: string,
    user: User,
    options: {
      radiusKm?: number;
      limit?: number;
    } = {}
  ): Promise<SignalSpot[]> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error('Spot not found');
    }

    if (!spot.canBeViewedBy(user)) {
      throw new Error('Access denied to this spot');
    }

    const similarSpots = await this.signalSpotDomainService.findSimilarSpots(
      spot,
      options.radiusKm,
      options.limit
    );

    // Filter spots that user can view and exclude the original spot
    return similarSpots
      .filter(s => s.id !== spot.id)
      .filter(s => s.canBeViewedBy(user));
  }

  // Admin/System methods
  async expireSpots(): Promise<number> {
    return await this.signalSpotDomainService.expireSpots();
  }

  async cleanupExpiredSpots(olderThanHours = 168): Promise<number> {
    return await this.signalSpotDomainService.cleanupExpiredSpots(olderThanHours);
  }

  async getReportedSpots(user: User, limit = 50): Promise<SignalSpot[]> {
    // Only verified users can see reported spots
    if (!user.isVerified) {
      throw new Error('Access denied to reported spots');
    }

    return await this.signalSpotRepository.findReported(limit);
  }

  async getSpotsNeedingAttention(
    user: User,
    minutesThreshold = 60
  ): Promise<SignalSpot[]> {
    // Only verified users can see spots needing attention
    if (!user.isVerified) {
      throw new Error('Access denied to spots needing attention');
    }

    return await this.signalSpotDomainService.findSpotsNeedingAttention(minutesThreshold);
  }
}