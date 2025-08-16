import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SignalSpotService } from './signal-spot.service';
import { ISignalSpotRepository, SIGNAL_SPOT_REPOSITORY_TOKEN } from '../repositories/signal-spot.repository';
import { SignalSpotDomainService } from '../domain/signal-spot.domain-service';
import { EntityManager } from '@mikro-orm/core';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationService } from '../notifications/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSpotDto } from './dto/create-spot.dto';
import { LoggerService } from '../common/services/logger.service';
import { SignalSpot, SpotType, SpotVisibility } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';
import { ref } from '@mikro-orm/core';

describe('SignalSpotService', () => {
  let service: SignalSpotService;
  let repository: jest.Mocked<ISignalSpotRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  } as User;

  const mockSignalSpot = {
    id: 'spot-123',
    latitude: 37.5665,
    longitude: 126.978,
    title: 'Test Signal Spot',
    content: 'This is a test signal spot',
    message: 'This is a test signal spot',
    type: SpotType.SOCIAL,
    visibility: SpotVisibility.PUBLIC,
    radiusInMeters: 100,
    creator: ref(mockUser),
    creatorId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: true,
    viewCount: 0,
    likeCount: 0,
    replyCount: 0,
    shareCount: 0,
    reportCount: 0,
    canBeViewedBy: jest.fn().mockReturnValue(true),
    canBeEditedBy: jest.fn().mockReturnValue(true),
    canBeRemovedBy: jest.fn().mockReturnValue(true),
    canInteract: jest.fn().mockReturnValue(true),
    recordView: jest.fn(),
    _domainEvents: [],
    addDomainEvent: jest.fn(),
    toggleLike: jest.fn().mockReturnValue(true),
    updateContent: jest.fn(),
    updateTags: jest.fn(),
    remove: jest.fn(),
    extendDuration: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    pin: jest.fn(),
    unpin: jest.fn(),
    addReply: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalSpotService,
        {
          provide: SIGNAL_SPOT_REPOSITORY_TOKEN,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
            findNearby: jest.fn(),
            remove: jest.fn(),
            findByCreator: jest.fn(),
            countInRadius: jest.fn(),
            findWithinRadius: jest.fn(),

            findTrending: jest.fn(),
            findPopular: jest.fn(),
            searchSpots: jest.fn(),
            searchByContent: jest.fn(),
            findByTags: jest.fn(),
            findReported: jest.fn(),
          },
        },
        {
          provide: SignalSpotDomainService,
          useValue: {
            createSignalSpot: jest.fn(),
            findSpotsForUser: jest.fn(),
            processSpotInteraction: jest.fn(),
            findTrendingSpots: jest.fn(),
            getUserSpotStatistics: jest.fn(),
            checkLocationSpotDensity: jest.fn(),
            expireSpots: jest.fn(),
            cleanupExpiredSpots: jest.fn(),
            findSpotsNeedingAttention: jest.fn(),
            findSimilarSpots: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            persistAndFlush: jest.fn(),
            transactional: jest.fn(),
          },
        },
        {
          provide: WebSocketService,
          useValue: {
            notifySpotCreated: jest.fn(),
            notifySpotUpdated: jest.fn(),
            notifySpotLiked: jest.fn(),
            notifySpotCommented: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SignalSpotService>(SignalSpotService);
    repository = module.get(SIGNAL_SPOT_REPOSITORY_TOKEN);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('createSpot', () => {
    const createDto: CreateSpotDto = {
      latitude: 37.5665,
      longitude: 126.978,
      title: 'New Signal Spot',
      content: 'This is a new signal spot',
      type: SpotType.SOCIAL,
      visibility: SpotVisibility.PUBLIC,
      radiusInMeters: 100,
      durationHours: 24,
      tags: ['test', 'signal'],
    };

    it('should successfully create a signal spot', async () => {
      repository.save.mockResolvedValue(mockSignalSpot as unknown as unknown as SignalSpot);

      const result = await service.createSpot(mockUser, createDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          creator: mockUser,
          expiresAt: expect.any(Date),
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'signal-spot.created',
        result
      );
      expect(result).toEqual(mockSignalSpot);
    });

    it('should throw BadRequestException for invalid coordinates', async () => {
      const invalidDto = { ...createDto, latitude: 91 };

      await expect(service.createSpot(mockUser, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for invalid radius', async () => {
      const invalidDto = { ...createDto, radiusInMeters: 10001 };

      await expect(service.createSpot(mockUser, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getSpotsNearLocation', () => {
    const nearbyQuery = {
      latitude: 37.5665,
      longitude: 126.978,
      radiusKm: 2,
      limit: 10,
    };

    it('should find nearby signal spots', async () => {
      const mockSpots = [mockSignalSpot, { ...mockSignalSpot, id: 'spot-456' }];
      repository.findNearby.mockResolvedValue(mockSpots as unknown as SignalSpot[]);

      const result = await service.getSpotsNearLocation(mockUser, nearbyQuery);

      expect(repository.findNearby).toHaveBeenCalledWith(
        nearbyQuery.latitude,
        nearbyQuery.longitude,
        nearbyQuery.radiusKm,
        expect.objectContaining({
          limit: nearbyQuery.limit,
          includeExpired: false,
        })
      );
      expect(result).toHaveLength(2);
    });

    it('should filter by spot types if provided', async () => {
      const queryWithTypes = { ...nearbyQuery, types: [SpotType.SOCIAL, SpotType.MEETUP] };
      repository.findNearby.mockResolvedValue([]);

      await service.getSpotsNearLocation(mockUser, queryWithTypes as any);

      expect(repository.findNearby).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          types: [SpotType.SOCIAL, SpotType.MEETUP],
        })
      );
    });
  });

  describe('getSpotById', () => {
    it('should find a signal spot by id', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);

      const result = await service.getSpotById('spot-123', mockUser);

      expect(repository.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(mockSignalSpot);
    });

    it('should return null for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.getSpotById('non-existent', mockUser);
      
      expect(result).toBeNull();
    });
  });

  describe('interactWithSpot', () => {
    it('should handle like interaction', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);
      repository.save.mockResolvedValue({
        ...mockSignalSpot,
        likeCount: 1,
      } as unknown as SignalSpot);

      const result = await service.interactWithSpot(
        'spot-123',
        { type: 'like' },
        mockUser
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'signal-spot.interaction',
        expect.objectContaining({
          spotId: 'spot-123',
          userId: mockUser.id,
          type: 'like',
        })
      );
      expect(result.likeCount).toBe(1);
    });

    it('should handle report interaction', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);
      repository.save.mockResolvedValue({
        ...mockSignalSpot,
        reportCount: 1,
      } as unknown as SignalSpot);

      const result = await service.interactWithSpot(
        'spot-123',
        { type: 'report', reason: 'inappropriate' },
        mockUser
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(result.reportCount).toBe(1);
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.interactWithSpot('non-existent', { type: 'like' }, mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSpot', () => {
    const updateDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    it('should update a signal spot', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);
      repository.save.mockResolvedValue({
        ...mockSignalSpot,
        ...updateDto,
      } as unknown as SignalSpot);

      const result = await service.updateSpot('spot-123', updateDto, mockUser);

      expect(repository.save).toHaveBeenCalledWith(expect.any(Object));
      expect(result.title).toBe(updateDto.title);
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateSpot('non-existent', updateDto, mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unauthorized update', async () => {
      const otherUser = { id: 'other-user', username: 'otheruser', email: 'other@example.com' } as User;
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);

      await expect(
        service.updateSpot('spot-123', updateDto, otherUser)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeSpot', () => {
    it('should delete a signal spot', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);

      await service.removeSpot('spot-123', mockUser);

      expect(repository.remove).toHaveBeenCalledWith(mockSignalSpot);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'signal-spot.deleted',
        mockSignalSpot
      );
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.removeSpot('non-existent', mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unauthorized delete', async () => {
      const otherUser = { id: 'other-user', username: 'otheruser', email: 'other@example.com' } as User;
      repository.findById.mockResolvedValue(mockSignalSpot as unknown as SignalSpot);

      await expect(
        service.removeSpot('spot-123', otherUser)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLocationStatistics', () => {
    it('should return location statistics', async () => {
      repository.countInRadius.mockResolvedValue(25);
      repository.findWithinRadius.mockResolvedValue([
        { ...mockSignalSpot, type: 'social' },
        { ...mockSignalSpot, type: 'event' },
        { ...mockSignalSpot, type: 'social' },
      ] as unknown as SignalSpot[]);

      const result = await service.getLocationStatistics(37.5665, 126.978, 1);

      expect(repository.countInRadius).toHaveBeenCalledWith(
        37.5665,
        126.978,
        1
      );
      expect(result).toEqual({
        spotCount: 25,
        density: expect.any(Number),
        averageSignalStrength: expect.any(Number),
      });
    });
  });
});