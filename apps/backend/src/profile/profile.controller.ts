import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../common/services/logger.service';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, ProfileVisibility } from '../entities/user.entity';
import { UpdateProfileDto, UpdateProfileSettingsDto, ProfileResponseDto } from './dto/profile-update.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { SignatureConnectionPreferencesDto, ConnectionMatchDto, SignatureConnectionStatsDto } from './dto/signature-connection.dto';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { UploadService } from '../upload/upload.service';
import { S3Service } from '../upload/s3.service';
import { SignatureConnectionService } from './services/signature-connection.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
    private readonly s3Service: S3Service,
    private readonly signatureConnectionService: SignatureConnectionService,
    private readonly logger: LoggerService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  async getMyProfile(@GetUser() user: User): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.id);
  }

  @Post('setup')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '초기 프로필 설정 (온보딩)' })
  @ApiResponse({
    status: 200,
    description: 'Profile setup completed successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists',
  })
  async setupProfile(
    @GetUser() user: User,
    @Body() setupDto: ProfileSetupDto,
  ): Promise<{ success: boolean; data: ProfileResponseDto }> {
    // 닉네임 중복 확인
    if (setupDto.username) {
      const exists = await this.profileService.checkUsernameExists(setupDto.username, user.id);
      if (exists) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    // 프로필 업데이트
    const updatedProfile = await this.profileService.setupInitialProfile(user.id, setupDto);

    return {
      success: true,
      data: updatedProfile,
    };
  }

  @Get('check-username')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @ApiQuery({ name: 'username', required: true, description: 'Username to check' })
  @ApiResponse({
    status: 200,
    description: 'Username availability checked',
  })
  async checkUsername(
    @Query('username') username: string
  ): Promise<{ available: boolean }> {
    const exists = await this.profileService.checkUsernameExists(username);
    return { available: !exists };
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile analytics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Profile analytics retrieved successfully',
  })
  async getProfileAnalytics(@GetUser() user: User) {
    return this.profileService.getProfileAnalytics(user.id);
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile connection suggestions' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of suggestions (max 20)' })
  @ApiResponse({
    status: 200,
    description: 'Connection suggestions retrieved successfully',
    type: [ProfileResponseDto],
  })
  async getConnectionSuggestions(
    @GetUser() user: User,
    @Query('limit') limit?: number,
  ): Promise<ProfileResponseDto[]> {
    const suggestionLimit = Math.min(limit || 10, 20);
    return this.profileService.suggestConnections(user.id, suggestionLimit);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 updates per minute
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  @ApiResponse({ status: 429, description: 'Too many update requests' })
  async updateMyProfile(
    @GetUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(user.id, updateDto);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 settings updates per minute
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update profile privacy and display settings' })
  @ApiResponse({
    status: 200,
    description: 'Profile settings updated successfully',
  })
  @ApiResponse({ status: 429, description: 'Too many settings update requests' })
  async updateProfileSettings(
    @GetUser() user: User,
    @Body() settingsDto: UpdateProfileSettingsDto,
  ): Promise<{ message: string }> {
    return this.profileService.updateProfileSettings(user.id, settingsDto);
  }

  @Put('visibility/:visibility')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update profile visibility' })
  @ApiParam({
    name: 'visibility',
    enum: ProfileVisibility,
    description: 'Profile visibility setting',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile visibility updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid visibility setting' })
  async updateProfileVisibility(
    @GetUser() user: User,
    @Param('visibility') visibility: ProfileVisibility,
  ): Promise<{ message: string }> {
    return this.profileService.updateProfileVisibility(user.id, visibility);
  }

  @Get('search')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 30, windowMs: 60 * 1000 }) // 30 searches per minute
  @ApiOperation({ summary: 'Search public profiles' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Location filter' })
  @ApiQuery({ name: 'skills', required: false, type: [String], description: 'Skills filter' })
  @ApiQuery({ name: 'interests', required: false, type: [String], description: 'Interests filter' })
  @ApiQuery({ name: 'occupation', required: false, type: String, description: 'Occupation filter' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Results limit (max 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Results offset' })
  @ApiResponse({
    status: 200,
    description: 'Profiles found successfully',
    schema: {
      type: 'object',
      properties: {
        profiles: { type: 'array', items: { $ref: '#/components/schemas/ProfileResponseDto' } },
        total: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many search requests' })
  async searchProfiles(
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('skills') skills?: string | string[],
    @Query('interests') interests?: string | string[],
    @Query('occupation') occupation?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Convert single strings to arrays for skills and interests
    const skillsArray = Array.isArray(skills) ? skills : skills ? [skills] : undefined;
    const interestsArray = Array.isArray(interests) ? interests : interests ? [interests] : undefined;

    return this.profileService.searchProfiles({
      search,
      location,
      skills: skillsArray,
      interests: interestsArray,
      occupation,
      limit,
      offset,
    });
  }

  @Get(':userId')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 50, windowMs: 60 * 1000 }) // 50 profile views per minute
  @ApiOperation({ summary: 'Get public profile by user ID' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Profile is not public' })
  @ApiResponse({ status: 429, description: 'Too many profile view requests' })
  async getPublicProfile(
    @Param('userId') userId: string,
    @GetUser() viewer?: User,
  ): Promise<ProfileResponseDto> {
    return this.profileService.getPublicProfile(userId, viewer?.id);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
  @RateLimit({ max: 3, windowMs: 60 * 1000 }) // 3 avatar uploads per minute
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload profile avatar',
    description: 'Upload a profile avatar image to S3. The image will be automatically resized to multiple dimensions (thumbnail: 150x150, medium: 400x400, large: 800x800).'
  })
  @ApiBody({
    description: 'Avatar image file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, WebP, GIF). Maximum size: 5MB'
        }
      },
      required: ['avatar']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded to S3 and profile updated successfully. Returns the updated profile with the new avatar URL.',
    type: ProfileResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or missing image file. Supported formats: JPEG, PNG, WebP, GIF' 
  })
  @ApiResponse({ 
    status: 413, 
    description: 'File size exceeds 5MB limit' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many upload requests (max 3 per minute)' 
  })
  async uploadAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    this.logger.logWithUser('ProfileController.uploadAvatar called', user.id, 'ProfileController');
    
    if (!file) {
      throw new BadRequestException('No avatar image provided');
    }

    this.logger.debug(`File info - Name: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`, 'ProfileController');

    // Upload image to S3
    const processedImage = await this.s3Service.uploadProfileImage(file, user.id);
    this.logger.debug('S3 upload completed', 'ProfileController');

    // Update user profile with new avatar URL from S3
    const updatedProfile = await this.profileService.updateProfile(user.id, {
      avatarUrl: processedImage.mediumUrl,
    });
    
    this.logger.debug('Profile updated successfully', 'ProfileController');
    
    return updatedProfile;
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove profile avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar removed successfully',
    type: ProfileResponseDto,
  })
  async removeAvatar(@GetUser() user: User): Promise<ProfileResponseDto> {
    // Get current profile to extract avatar URL for deletion
    const currentProfile = await this.profileService.getProfile(user.id);
    
    if (currentProfile.avatarUrl) {
      // Extract S3 key from the URL
      // URL format: https://bucket.s3.region.amazonaws.com/signalspot/profiles/{userId}/{timestamp}_{fileId}_medium.jpg
      const urlParts = currentProfile.avatarUrl.split('/');
      const filename = urlParts[urlParts.length - 1]; // e.g., "timestamp_fileId_medium.jpg"
      
      if (filename) {
        // Extract timestamp and fileId from filename
        const matches = filename.match(/(\d+)_([a-f0-9-]+)_/);
        if (matches && matches.length >= 3) {
          const timestamp = matches[1];
          const fileId = matches[2];
          
          // Delete all sizes from S3
          await this.s3Service.deleteProfileImageSet(user.id, timestamp, fileId);
        }
      }
    }

    // Update profile to remove avatar URL
    return this.profileService.updateProfile(user.id, {
      avatarUrl: null,
    });
  }

  // Signature Connection Endpoints
  @Put('signature-connection/preferences')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 updates per minute
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update signature connection preferences' })
  @ApiResponse({
    status: 200,
    description: 'Signature connection preferences updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid preferences data' })
  @ApiResponse({ status: 429, description: 'Too many update requests' })
  async updateSignatureConnectionPreferences(
    @GetUser() user: User,
    @Body() preferences: SignatureConnectionPreferencesDto,
  ): Promise<{ message: string }> {
    await this.signatureConnectionService.updateConnectionPreferences(user.id, preferences);
    return { message: 'Signature connection preferences updated successfully' };
  }

  @Post('signature-connection/preferences')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '시그니처 커넥션 설정 (온보딩)' })
  @ApiResponse({
    status: 200,
    description: 'Signature connection preferences set successfully',
  })
  async setupSignatureConnection(
    @GetUser() user: User,
    @Body() preferencesDto: SignatureConnectionPreferencesDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.signatureConnectionService.updateConnectionPreferences(user.id, preferencesDto);
    
    // 프로필 완성 상태 업데이트
    await this.profileService.markProfileAsCompleted(user.id);

    return {
      success: true,
      message: '시그니처 커넥션 설정이 완료되었습니다',
    };
  }

  @Get('signature-connection/preferences')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get signature connection preferences' })
  @ApiResponse({
    status: 200,
    description: 'Signature connection preferences retrieved successfully',
    type: SignatureConnectionPreferencesDto,
  })
  @ApiResponse({ status: 404, description: 'Preferences not found' })
  async getSignatureConnectionPreferences(
    @GetUser() user: User,
  ): Promise<SignatureConnectionPreferencesDto | null> {
    return this.signatureConnectionService.getConnectionPreferences(user.id);
  }

  @Get('signature-connection/matches')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 requests per minute
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find signature connection matches' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of matches (max 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Results offset' })
  @ApiResponse({
    status: 200,
    description: 'Connection matches found successfully',
    schema: {
      type: 'object',
      properties: {
        matches: { type: 'array', items: { $ref: '#/components/schemas/ConnectionMatchDto' } },
        total: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many search requests' })
  async findSignatureConnectionMatches(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{
    matches: ConnectionMatchDto[];
    total: number;
    hasMore: boolean;
  }> {
    const searchLimit = Math.min(limit || 20, 50);
    const searchOffset = offset || 0;
    
    return this.signatureConnectionService.findMatches(user.id, searchLimit, searchOffset);
  }

  @Get('signature-connection/stats')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get signature connection statistics' })
  @ApiResponse({
    status: 200,
    description: 'Connection statistics retrieved successfully',
    type: SignatureConnectionStatsDto,
  })
  async getSignatureConnectionStats(
    @GetUser() user: User,
  ): Promise<SignatureConnectionStatsDto> {
    return this.signatureConnectionService.getConnectionStats(user.id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for profile service' })
  @ApiResponse({ status: 200, description: 'Profile service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      service: 'profile',
      timestamp: new Date().toISOString(),
    };
  }
}