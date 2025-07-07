import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UploadService } from '../upload/upload.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SignatureConnectionPreferencesDto } from './dto/signature-connection-preferences.dto';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user.entity';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;
  let uploadService: jest.Mocked<UploadService>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockProfile: Partial<UserProfile> = {
    id: 'profile-123',
    userId: 'user-123',
    bio: 'Test bio',
    interests: ['coding', 'travel'],
    personalityTraits: ['friendly', 'creative'],
    lifestyle: ['active', 'social'],
    ageRange: { min: 25, max: 35 },
    locationRadius: 10,
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
            updateSignatureConnection: jest.fn(),
            uploadAvatar: jest.fn(),
            removeAvatar: jest.fn(),
            getPublicProfile: jest.fn(),
          },
        },
        {
          provide: UploadService,
          useValue: {
            processProfileImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get(ProfileService);
    uploadService = module.get(UploadService);
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      profileService.getProfile.mockResolvedValue(mockProfile as UserProfile);

      const result = await controller.getProfile(mockUser as User);

      expect(profileService.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the user profile', async () => {
      const updateDto: UpdateProfileDto = {
        bio: 'Updated bio',
        interests: ['coding', 'music'],
      };

      const updatedProfile = { ...mockProfile, ...updateDto };
      profileService.updateProfile.mockResolvedValue(updatedProfile as UserProfile);

      const result = await controller.updateProfile(mockUser as User, updateDto);

      expect(profileService.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        updateDto
      );
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('updateSignatureConnection', () => {
    it('should update signature connection preferences', async () => {
      const preferencesDto: SignatureConnectionPreferencesDto = {
        interests: ['coding', 'gaming'],
        personalityTraits: ['introverted', 'analytical'],
        lifestyle: ['remote', 'minimalist'],
        bio: 'Looking for tech enthusiasts',
        lookingFor: 'Friends with similar interests',
        ageRange: { min: 25, max: 40 },
        locationRadius: 15,
      };

      const updatedProfile = {
        ...mockProfile,
        ...preferencesDto,
      };
      profileService.updateSignatureConnection.mockResolvedValue(
        updatedProfile as UserProfile
      );

      const result = await controller.updateSignatureConnection(
        mockUser as User,
        preferencesDto
      );

      expect(profileService.updateSignatureConnection).toHaveBeenCalledWith(
        mockUser.id,
        preferencesDto
      );
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar and return updated profile', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const processedImage = {
        originalUrl: 'https://example.com/avatar-original.jpg',
        thumbnailUrl: 'https://example.com/avatar-thumb.jpg',
        mediumUrl: 'https://example.com/avatar-medium.jpg',
      };

      const updatedProfile = {
        ...mockProfile,
        avatarUrl: processedImage.mediumUrl,
      };

      uploadService.processProfileImage.mockResolvedValue(processedImage);
      profileService.updateProfile.mockResolvedValue(updatedProfile as UserProfile);

      const result = await controller.uploadAvatar(mockUser as User, mockFile);

      expect(uploadService.processProfileImage).toHaveBeenCalledWith(
        mockFile,
        mockUser.id
      );
      expect(profileService.updateProfile).toHaveBeenCalledWith(mockUser.id, {
        avatarUrl: processedImage.mediumUrl,
      });
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('removeAvatar', () => {
    it('should remove avatar and return updated profile', async () => {
      const updatedProfile = {
        ...mockProfile,
        avatarUrl: null,
      };

      profileService.updateProfile.mockResolvedValue(updatedProfile as UserProfile);

      const result = await controller.removeAvatar(mockUser as User);

      expect(profileService.updateProfile).toHaveBeenCalledWith(mockUser.id, {
        avatarUrl: null,
      });
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('getPublicProfile', () => {
    it('should return a public user profile', async () => {
      const publicProfile = {
        id: mockProfile.id,
        username: 'testuser',
        bio: mockProfile.bio,
        avatarUrl: mockProfile.avatarUrl,
        interests: mockProfile.interests,
      };

      profileService.getPublicProfile.mockResolvedValue(publicProfile);

      const result = await controller.getPublicProfile('user-456');

      expect(profileService.getPublicProfile).toHaveBeenCalledWith('user-456');
      expect(result).toEqual(publicProfile);
    });
  });
});