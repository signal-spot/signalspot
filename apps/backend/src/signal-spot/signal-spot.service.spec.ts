import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SignalSpotService } from './signal-spot.service';
import { SignalSpotRepository } from '../repositories/signal-spot.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSignalSpotDto } from './dto/create-signal-spot.dto';
import { SignalSpot } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';

describe('SignalSpotService', () => {
  let service: SignalSpotService;
  let repository: jest.Mocked<SignalSpotRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockSignalSpot: Partial<SignalSpot> = {
    id: 'spot-123',
    latitude: 37.5665,
    longitude: 126.978,
    title: 'Test Signal Spot',
    content: 'This is a test signal spot',
    type: 'social',
    visibility: 'public',
    radius: 100,
    creator: mockUser as User,
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalSpotService,
        {
          provide: SignalSpotRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findNearby: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByCreator: jest.fn(),
            countInRadius: jest.fn(),
            findWithinRadius: jest.fn(),
            incrementViewCount: jest.fn(),
            incrementInteractionCount: jest.fn(),
            findTrending: jest.fn(),
            findPopular: jest.fn(),
            searchSpots: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SignalSpotService>(SignalSpotService);
    repository = module.get(SignalSpotRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('create', () => {
    const createDto: CreateSignalSpotDto = {
      latitude: 37.5665,
      longitude: 126.978,
      title: 'New Signal Spot',
      content: 'This is a new signal spot',
      type: 'social',
      visibility: 'public',
      radius: 100,
      maxDuration: 24,
      tags: ['test', 'signal'],
    };

    it('should successfully create a signal spot', async () => {
      repository.create.mockResolvedValue(mockSignalSpot as SignalSpot);

      const result = await service.create(createDto, mockUser as User);

      expect(repository.create).toHaveBeenCalledWith(
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

      await expect(service.create(invalidDto, mockUser as User)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for invalid radius', async () => {
      const invalidDto = { ...createDto, radius: 10001 };

      await expect(service.create(invalidDto, mockUser as User)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findNearby', () => {
    const nearbyQuery = {
      latitude: 37.5665,
      longitude: 126.978,
      radiusKm: 2,
      limit: 10,
    };

    it('should find nearby signal spots', async () => {
      const mockSpots = [mockSignalSpot, { ...mockSignalSpot, id: 'spot-456' }];
      repository.findNearby.mockResolvedValue(mockSpots as SignalSpot[]);

      const result = await service.findNearby(nearbyQuery);

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
      const queryWithTypes = { ...nearbyQuery, types: ['social', 'event'] };
      repository.findNearby.mockResolvedValue([]);

      await service.findNearby(queryWithTypes);

      expect(repository.findNearby).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          types: ['social', 'event'],
        })
      );
    });
  });

  describe('findById', () => {
    it('should find a signal spot by id', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);

      const result = await service.findById('spot-123');

      expect(repository.findById).toHaveBeenCalledWith('spot-123');
      expect(result).toEqual(mockSignalSpot);
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('interact', () => {
    it('should handle like interaction', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);
      repository.incrementInteractionCount.mockResolvedValue({
        ...mockSignalSpot,
        likeCount: 1,
      } as SignalSpot);

      const result = await service.interact(
        'spot-123',
        { type: 'like' },
        mockUser as User
      );

      expect(repository.incrementInteractionCount).toHaveBeenCalledWith(
        'spot-123',
        'likeCount'
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
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);
      repository.incrementInteractionCount.mockResolvedValue({
        ...mockSignalSpot,
        reportCount: 1,
      } as SignalSpot);

      const result = await service.interact(
        'spot-123',
        { type: 'report', reason: 'inappropriate' },
        mockUser as User
      );

      expect(repository.incrementInteractionCount).toHaveBeenCalledWith(
        'spot-123',
        'reportCount'
      );
      expect(result.reportCount).toBe(1);
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.interact('non-existent', { type: 'like' }, mockUser as User)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    it('should update a signal spot', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);
      repository.update.mockResolvedValue({
        ...mockSignalSpot,
        ...updateDto,
      } as SignalSpot);

      const result = await service.update('spot-123', updateDto, mockUser as User);

      expect(repository.update).toHaveBeenCalledWith('spot-123', updateDto);
      expect(result.title).toBe(updateDto.title);
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto, mockUser as User)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unauthorized update', async () => {
      const otherUser = { ...mockUser, id: 'other-user' };
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);

      await expect(
        service.update('spot-123', updateDto, otherUser as User)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a signal spot', async () => {
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);

      await service.delete('spot-123', mockUser as User);

      expect(repository.delete).toHaveBeenCalledWith('spot-123');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'signal-spot.deleted',
        mockSignalSpot
      );
    });

    it('should throw NotFoundException for non-existent spot', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.delete('non-existent', mockUser as User)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unauthorized delete', async () => {
      const otherUser = { ...mockUser, id: 'other-user' };
      repository.findById.mockResolvedValue(mockSignalSpot as SignalSpot);

      await expect(
        service.delete('spot-123', otherUser as User)
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
      ] as SignalSpot[]);

      const result = await service.getLocationStatistics(37.5665, 126.978, 1);

      expect(repository.countInRadius).toHaveBeenCalledWith(
        37.5665,
        126.978,
        1
      );
      expect(result).toEqual({
        totalSpots: 25,
        density: 25 / Math.PI,
        radiusKm: 1,
        location: { latitude: 37.5665, longitude: 126.978 },
        popularTypes: [
          { type: 'social', count: 2 },
          { type: 'event', count: 1 },
        ],
        peakHours: expect.any(Array),
      });
    });
  });
});