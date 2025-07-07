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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, ProfileVisibility } from '../entities/user.entity';
import { UpdateProfileDto, UpdateProfileSettingsDto, ProfileResponseDto } from './dto/profile-update.dto';
import { SignatureConnectionPreferencesDto, ConnectionMatchDto, SignatureConnectionStatsDto } from './dto/signature-connection.dto';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { UploadService } from '../upload/upload.service';
import { SignatureConnectionService } from './services/signature-connection.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
    private readonly signatureConnectionService: SignatureConnectionService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
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

  @Get('analytics')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
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
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 3, windowMs: 60 * 1000 }) // 3 avatar uploads per minute
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded and profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  @ApiResponse({ status: 429, description: 'Too many upload requests' })
  async uploadAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    if (!file) {
      throw new BadRequestException('No avatar image provided');
    }

    // Process the image
    const processedImage = await this.uploadService.processProfileImage(file);

    // Update user profile with new avatar URL
    return this.profileService.updateProfile(user.id, {
      avatarUrl: processedImage.mediumUrl,
    });
  }

  @Delete('avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove profile avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar removed successfully',
    type: ProfileResponseDto,
  })
  async removeAvatar(@GetUser() user: User): Promise<ProfileResponseDto> {
    // Get current profile to extract avatar filename for deletion
    const currentProfile = await this.profileService.getProfile(user.id);
    
    if (currentProfile.avatarUrl) {
      const filename = this.uploadService.extractFilenameFromUrl(currentProfile.avatarUrl);
      if (filename) {
        // Extract base filename for deleting all sizes
        const baseFilename = filename.replace(/(_thumb|_medium|_large)?\..*$/, '');
        await this.uploadService.deleteProfileImageSet(baseFilename);
      }
    }

    // Update profile to remove avatar URL
    return this.profileService.updateProfile(user.id, {
      avatarUrl: undefined,
    });
  }

  // Signature Connection Endpoints
  @Put('signature-connection/preferences')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
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

  @Get('signature-connection/preferences')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
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
  @UseGuards(AuthGuard('jwt'))
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