import { Injectable, Inject, forwardRef, Logger, ForbiddenException } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';
import { SignalSpot, SpotId, SpotStatus, SpotVisibility, SpotType } from '../entities/signal-spot.entity';
import { Comment } from '../entities/comment.entity';
import { ISignalSpotRepository, SIGNAL_SPOT_REPOSITORY_TOKEN } from '../repositories/signal-spot.repository';
import { SignalSpotDomainService } from '../domain/signal-spot.domain-service';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationService, NotificationType } from '../notifications/notification.service';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Coordinates } from '../entities/location.entity';
import { EntityManager } from '@mikro-orm/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  CreateSpotDto, 
  UpdateSpotDto, 
  SpotInteractionDto, 
  LocationQueryDto 
} from './dto';
import { AdminCreateSpotDto } from './dto/admin-create-spot.dto';

// Application Service for SignalSpot
@Injectable()
export class SignalSpotService {
  private readonly logger = new Logger(SignalSpotService.name);

  constructor(
    @Inject(SIGNAL_SPOT_REPOSITORY_TOKEN)
    private readonly signalSpotRepository: ISignalSpotRepository,
    private readonly signalSpotDomainService: SignalSpotDomainService,
    private readonly em: EntityManager,
    private readonly loggerService: LoggerService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => WebSocketService))
    private readonly webSocketService?: WebSocketService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService?: NotificationService
  ) {}

  // Create a new SignalSpot
  async createSpot(creator: User, createSpotDto: CreateSpotDto): Promise<SignalSpot> {
    const spot = await this.signalSpotDomainService.createSignalSpot({
      creator,
      content: createSpotDto.content,
      title: createSpotDto.title,
      latitude: createSpotDto.latitude,
      longitude: createSpotDto.longitude,
      mediaUrls: createSpotDto.mediaUrls,
      radiusInMeters: createSpotDto.radiusInMeters,
      durationHours: createSpotDto.durationHours,
      visibility: createSpotDto.visibility,
      type: createSpotDto.type,
      tags: createSpotDto.tags,
      metadata: createSpotDto.metadata,
    });

    // Send WebSocket notification for new spot
    if (this.webSocketService) {
      await this.webSocketService.notifySpotCreated(spot);
    }

    return spot;
  }

  async createAdminSpot(adminUser: User, dto: AdminCreateSpotDto): Promise<SignalSpot> {
    // Verify admin permissions
    if (!adminUser.isAdmin) {
      throw new ForbiddenException('Only administrators can create system messages');
    }

    // Create a system user or use admin as creator
    const systemUser = adminUser; // Use admin user as the creator

    // Create the spot with system message flags
    const spot = await this.signalSpotDomainService.createSignalSpot({
      creator: systemUser,
      content: dto.message,
      title: dto.title,
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusInMeters: dto.radiusInMeters || 1000,
      durationHours: dto.durationInHours || 48,
      visibility: dto.visibility || SpotVisibility.PUBLIC,
      type: dto.type || SpotType.ANNOUNCEMENT,
      tags: dto.tags || ['시스템', '공지'],
      metadata: {
        ...dto.metadata,
        isSystemMessage: true,
        customSenderName: dto.customSenderName || '시스템 관리자',
        targetUserId: dto.targetUserId,
        createdByAdmin: true,
        adminId: adminUser.id,
      },
    });

    // Set system message fields
    spot.isSystemMessage = true;
    spot.customSenderName = dto.customSenderName || '시스템 관리자';
    
    // Pin the message if requested
    if (dto.isPinned) {
      spot.pin();
    }

    await this.em.persistAndFlush(spot);

    // Send WebSocket notification for new system spot
    if (this.webSocketService) {
      await this.webSocketService.notifySpotCreated(spot);
    }

    // If target user is specified, send push notification
    if (dto.targetUserId && this.notificationService) {
      await this.notificationService.sendNotification({
        title: dto.customSenderName || '시스템 관리자',
        body: dto.message.substring(0, 100),
        type: NotificationType.SIGNAL_SPOT_NEARBY,
        userId: dto.targetUserId,
        data: {
          spotId: spot.id,
          isSystemMessage: 'true',
        },
      });
    }

    return spot;
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
    query: LocationQueryDto
  ): Promise<SignalSpot[]> {
    if (!query.latitude || !query.longitude) {
      throw new Error('Location coordinates are required');
    }

    const coordinates = Coordinates.create(query.latitude, query.longitude);
    const radiusKm = query.radiusKm || 10; // Updated: Use 10km default instead of 1km
    
    // Debug logging for service layer
    this.loggerService.debug('Service layer processing nearby spots', 'SignalSpotService');
    this.loggerService.debug(`Query: radiusKm=${query.radiusKm}, effectiveRadius=${radiusKm}, limit=${query.limit}, location=[${query.latitude}, ${query.longitude}]`, 'SignalSpotService');

    const result = await this.signalSpotDomainService.findSpotsForUser(
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
    
    this.loggerService.debug(`Service layer returning ${result.length} spots`, 'SignalSpotService');
    return result;
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

    // Send WebSocket notifications based on interaction type
    if (this.webSocketService) {
      if (interaction.type === 'like') {
        await this.webSocketService.notifySpotLiked(spot, user);
      } else {
        // For other interaction types, send general update notification
        await this.webSocketService.notifySpotUpdated(spot);
      }
    }

    // Send push notifications based on interaction type
    if (this.notificationService && spot.creator.id !== user.id) {
      if (interaction.type === 'like') {
        // TODO: Implement spot liked notification
        await this.notificationService.sendNotification({
          title: 'Your spot was liked!',
          body: `${user.username || 'Someone'} liked your signal spot`,
          type: NotificationType.SIGNAL_SPOT_NEARBY,
          userId: spot.creator.id,
          data: {
            spotId: spot.id,
            likerId: user.id
          }
        });
      }
    }

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

    // Get list of blocked users
    const blockedUsers = await this.em.find(BlockedUser, {
      $or: [
        { blocker: user.id },
        { blocked: user.id }
      ]
    });

    const blockedUserIds = new Set<string>();
    blockedUsers.forEach(block => {
      if (block.blocker.id === user.id) {
        blockedUserIds.add(block.blocked.id);
      } else {
        blockedUserIds.add(block.blocker.id);
      }
    });

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

    // Filter spots that user can view and exclude blocked users
    return spots.filter(spot => 
      spot.canBeViewedBy(user) && !blockedUserIds.has(spot.creator.id)
    );
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

  // Comment-related methods
  async addComment(spotId: string, content: string, user: User): Promise<Comment> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error(`Signal Spot with ID ${spotId} not found`);
    }

    if (!spot.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    const comment = new Comment();
    comment.spot = spot;
    comment.author = user;
    comment.content = content;
    comment.isAnonymous = false; // Can be configurable later
    comment.likedBy = []; // Initialize empty array
    comment.likeCount = 0;
    comment.createdAt = new Date();
    comment.updatedAt = new Date();

    // Update spot reply count
    spot.addReply(user);

    // Save comment and update spot
    await this.signalSpotRepository.save(spot);
    await this.em.persistAndFlush(comment);
    
    // Send WebSocket notification for new comment
    if (this.webSocketService) {
      await this.webSocketService.notifySpotCommented(spot, comment, user);
    }
    
    // Emit event for push notification to spot owner
    const spotCreator = spot.creator.unwrap ? spot.creator.unwrap() : spot.creator;
    if (spotCreator.id !== user.id) {
      this.eventEmitter.emit('signal-spot.commented', {
        spotId: spot.id,
        spotCreatorId: spotCreator.id,
        commenterId: user.id,
        commenterUsername: user.username || 'Someone',
        commentContent: content,
        spotTitle: spot.title || spot.message.substring(0, 50)
      });
      
      this.logger.debug(`Emitted signal-spot.commented event for spot ${spotId}`, 'SignalSpotService');
    }
    
    return comment;
  }

  async getComments(spotId: string, limit: number, offset: number, user: User): Promise<Comment[]> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error(`Signal Spot with ID ${spotId} not found`);
    }

    if (!spot.canBeViewedBy(user)) {
      throw new Error('User cannot view this spot');
    }

    // Get blocked users
    const blockedUsers = await this.em.find(BlockedUser, {
      $or: [
        { blocker: user.id },
        { blocked: user.id }
      ]
    });

    const blockedUserIds = new Set<string>();
    blockedUsers.forEach(block => {
      if (block.blocker.id === user.id) {
        blockedUserIds.add(block.blocked.id);
      } else {
        blockedUserIds.add(block.blocker.id);
      }
    });

    const conditions: any = {
      spot: spotId,
      isDeleted: false
    };

    // Exclude comments from blocked users
    if (blockedUserIds.size > 0) {
      conditions.author = { $nin: Array.from(blockedUserIds) };
    }

    const comments = await this.em.find(Comment, 
      conditions,
      { 
        populate: ['author'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset
      }
    );

    // Ensure likedBy arrays are properly initialized and fix any data inconsistencies
    comments.forEach(comment => {
      if (!Array.isArray(comment.likedBy)) {
        comment.likedBy = [];
      }
      
      // Fix like count if it doesn't match likedBy array length
      if (comment.likeCount !== comment.likedBy.length) {
        this.logger.warn(`Comment ${comment.id} has inconsistent like count. Fixing: ${comment.likeCount} -> ${comment.likedBy.length}`);
        comment.likeCount = comment.likedBy.length;
      }
    });

    // Save any fixed comments
    const commentsToUpdate = comments.filter(c => c.likeCount !== c.likedBy.length);
    if (commentsToUpdate.length > 0) {
      await this.em.persistAndFlush(commentsToUpdate);
    }

    return comments;
  }

  async toggleCommentLike(spotId: string, commentId: string, user: User): Promise<Comment> {
    // Use transaction to ensure data consistency
    return await this.em.transactional(async (em) => {
      const comment = await em.findOne(Comment, 
        { 
          id: commentId,
          spot: spotId,
          isDeleted: false
        },
        { populate: ['spot', 'author'] }
      );

      if (!comment) {
        throw new Error(`Comment with ID ${commentId} not found or deleted`);
      }

      // Ensure likedBy is properly initialized
      if (!Array.isArray(comment.likedBy)) {
        comment.likedBy = [];
      }

      const wasLiked = comment.isLikedBy(user.id);
      
      this.logger.log(`Toggle like - Comment: ${commentId}, User: ${user.id}, WasLiked: ${wasLiked}`);
      this.logger.log(`Before toggle - likedBy: ${JSON.stringify(comment.likedBy)}, count: ${comment.likeCount}`);
      
      // Toggle the like status
      comment.toggleLike(user.id);
      
      this.logger.log(`After toggle - likedBy: ${JSON.stringify(comment.likedBy)}, count: ${comment.likeCount}`);
      
      // Persist the changes
      await em.persistAndFlush(comment);
      
      // Verify the changes were saved
      const updatedComment = await em.findOne(Comment, { id: commentId });
      this.logger.log(`Verified after save - likedBy: ${JSON.stringify(updatedComment?.likedBy)}, count: ${updatedComment?.likeCount}`);
      
      // Emit event when comment is liked (not unliked)
      if (!wasLiked && comment.author.id !== user.id) {
        this.eventEmitter.emit('comment.liked', {
          commentId: comment.id,
          commentAuthorId: comment.author.id,
          likerUserId: user.id,
          likerUsername: user.username || 'Someone',
          commentContent: comment.content.substring(0, 100)
        });
        
        this.logger.debug(`Emitted comment.liked event for comment ${commentId}`, 'SignalSpotService');
      }
      
      return comment;
    });
  }

  async toggleSpotLike(spotId: string, user: User): Promise<{ isLiked: boolean; likeCount: number }> {
    const spot = await this.signalSpotRepository.findById(SpotId.fromString(spotId));
    
    if (!spot) {
      throw new Error(`Signal Spot with ID ${spotId} not found`);
    }

    if (!spot.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    const isLiked = spot.toggleLike(user.id);
    
    await this.signalSpotRepository.save(spot);
    
    this.logger.log(`User ${user.id} ${isLiked ? 'liked' : 'unliked'} spot ${spotId}. New like count: ${spot.likeCount}`);
    
    // Emit event when spot is liked (not unliked)
    if (isLiked && spot.creator.id !== user.id) {
      // Get spot creator for the event
      const spotCreator = spot.creator.unwrap ? spot.creator.unwrap() : spot.creator;
      
      this.eventEmitter.emit('signal-spot.liked', {
        spotId: spot.id,
        spotCreatorId: spotCreator.id,
        likerUserId: user.id,
        likerUsername: user.username || 'Someone',
        spotTitle: spot.title || spot.message.substring(0, 50)
      });
      
      this.logger.debug(`Emitted signal-spot.liked event for spot ${spotId}`, 'SignalSpotService');
    }
    
    return {
      isLiked,
      likeCount: spot.likeCount
    };
  }

  async deleteComment(spotId: string, commentId: string, user: User): Promise<void> {
    const comment = await this.em.findOne(Comment, 
      { 
        id: commentId,
        spot: spotId
      },
      { populate: ['author', 'spot'] }
    );

    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }

    // Only author or spot owner can delete comments
    if (comment.author.id !== user.id && comment.spot.creator.id !== user.id) {
      throw new Error('User cannot delete this comment');
    }

    comment.softDelete();
    await this.em.persistAndFlush(comment);
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