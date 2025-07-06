import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ParseUUIDPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { ProfileService } from './profile.service';
import { UserProfileDomainService } from '../domain/user-profile.domain-service';
import { FileUploadService } from '../common/services/file-upload.service';
import {
  UpdateProfileDto,
  UpdateProfileSettingsDto,
  ProfileVerificationRequestDto,
  ProfileVerificationActionDto,
  UserProfileResponseDto,
  PublicProfileResponseDto,
  ProfileSearchResponseDto,
  ProfileAnalyticsResponseDto,
  ProfileCompletionResponseDto,
  ProfileSummaryResponseDto,
  FileUploadResponseDto
} from './dto';
import { plainToClass } from 'class-transformer';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly userProfileDomainService: UserProfileDomainService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto
  })
  async getCurrentUserProfile(@GetUser() user: User): Promise<UserProfileResponseDto> {
    return plainToClass(UserProfileResponseDto, user, { excludeExtraneousValues: true });
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    type: UserProfileResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  async updateCurrentUserProfile(
    @GetUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.profileService.updateProfile(user.id, updateProfileDto);
    return plainToClass(UserProfileResponseDto, updatedUser, { excludeExtraneousValues: true });
  }

  @Put('me/settings')
  @ApiOperation({ summary: 'Update profile settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile settings updated successfully',
    type: UserProfileResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid settings data' })
  async updateProfileSettings(
    @GetUser() user: User,
    @Body() updateSettingsDto: UpdateProfileSettingsDto
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.profileService.updateProfileSettings(user.id, updateSettingsDto);
    return plainToClass(UserProfileResponseDto, updatedUser, { excludeExtraneousValues: true });
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Avatar uploaded successfully',
    type: FileUploadResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadResult = await this.fileUploadService.uploadProfileImage(file, user.id);
    
    // Update user's avatar URL
    await this.profileService.updateProfile(user.id, { avatarUrl: uploadResult.url });

    return plainToClass(FileUploadResponseDto, uploadResult, { excludeExtraneousValues: true });
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remove profile avatar' })
  @ApiResponse({ status: 200, description: 'Avatar removed successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAvatar(@GetUser() user: User): Promise<void> {
    await this.profileService.updateProfile(user.id, { avatarUrl: null });
  }

  @Get('me/completion')
  @ApiOperation({ summary: 'Get profile completion status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile completion status retrieved successfully',
    type: ProfileCompletionResponseDto
  })
  async getProfileCompletionStatus(@GetUser() user: User): Promise<ProfileCompletionResponseDto> {
    const completionStatus = this.userProfileDomainService.getProfileCompletionStatus(user);
    return plainToClass(ProfileCompletionResponseDto, completionStatus, { excludeExtraneousValues: true });
  }

  @Get('me/summary')
  @ApiOperation({ summary: 'Get profile summary' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile summary retrieved successfully',
    type: ProfileSummaryResponseDto
  })
  async getProfileSummary(@GetUser() user: User): Promise<ProfileSummaryResponseDto> {
    const summary = user.getProfileSummary();
    return plainToClass(ProfileSummaryResponseDto, summary, { excludeExtraneousValues: true });
  }

  @Get('me/analytics')
  @ApiOperation({ summary: 'Get profile analytics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile analytics retrieved successfully',
    type: ProfileAnalyticsResponseDto
  })
  async getProfileAnalytics(@GetUser() user: User): Promise<ProfileAnalyticsResponseDto> {
    const analytics = this.userProfileDomainService.getProfileAnalytics(user);
    return plainToClass(ProfileAnalyticsResponseDto, analytics, { excludeExtraneousValues: true });
  }

  @Post('me/verification')
  @ApiOperation({ summary: 'Request profile verification' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['identity', 'business', 'celebrity', 'organization']
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Verification request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification data' })
  @UseInterceptors(FileInterceptor('file'))
  async requestVerification(
    @GetUser() user: User,
    @Body('type') type: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('Verification document is required');
    }

    if (!['identity', 'business', 'celebrity', 'organization'].includes(type)) {
      throw new BadRequestException('Invalid verification type');
    }

    const uploadResult = await this.fileUploadService.uploadVerificationDocument(file, user.id);
    
    await this.profileService.requestVerification(user.id, {
      type,
      documentUrl: uploadResult.url
    });

    return { message: 'Verification request submitted successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: PublicProfileResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Profile is private' })
  async getUserProfile(
    @Param('id', ParseUUIDPipe) userId: string,
    @GetUser() currentUser: User
  ): Promise<PublicProfileResponseDto> {
    const user = await this.profileService.findUserById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current user can view this profile
    if (!this.userProfileDomainService.canViewProfile(user, currentUser)) {
      throw new ForbiddenException('This profile is private');
    }

    // Record profile view
    this.userProfileDomainService.recordProfileView(user, currentUser.id);
    await this.profileService.updateUser(user);

    return plainToClass(PublicProfileResponseDto, user, { excludeExtraneousValues: true });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search user profiles' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'limit', description: 'Number of results to return', required: false })
  @ApiQuery({ name: 'offset', description: 'Number of results to skip', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: [ProfileSearchResponseDto]
  })
  async searchProfiles(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @GetUser() currentUser: User
  ): Promise<ProfileSearchResponseDto[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }

    const users = await this.profileService.searchProfiles(query, limit, offset);
    
    // Filter out private profiles
    const visibleUsers = users.filter(user => 
      this.userProfileDomainService.canViewProfile(user, currentUser)
    );

    return visibleUsers.map(user => 
      plainToClass(ProfileSearchResponseDto, user, { excludeExtraneousValues: true })
    );
  }

  // Admin endpoints
  @Post('admin/verification/:id/action')
  @ApiOperation({ summary: 'Approve or reject profile verification (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Verification action completed successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AdminGuard)
  async handleVerificationAction(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() actionDto: ProfileVerificationActionDto,
    @GetUser() admin: User
  ): Promise<{ message: string }> {
    if (actionDto.action === 'approve') {
      await this.profileService.approveVerification(userId, admin.id);
      return { message: 'Profile verification approved successfully' };
    } else if (actionDto.action === 'reject') {
      if (!actionDto.reason) {
        throw new BadRequestException('Rejection reason is required');
      }
      await this.profileService.rejectVerification(userId, actionDto.reason);
      return { message: 'Profile verification rejected successfully' };
    }
    
    throw new BadRequestException('Invalid action');
  }

  @Get('admin/verification/pending')
  @ApiOperation({ summary: 'Get pending verification requests (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pending verification requests retrieved successfully',
    type: [UserProfileResponseDto]
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @UseGuards(AdminGuard)
  async getPendingVerifications(): Promise<UserProfileResponseDto[]> {
    const users = await this.profileService.getPendingVerifications();
    return users.map(user => 
      plainToClass(UserProfileResponseDto, user, { excludeExtraneousValues: true })
    );
  }

  @Get('admin/analytics')
  @ApiOperation({ summary: 'Get profile analytics overview (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Analytics overview retrieved successfully'
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @UseGuards(AdminGuard)
  async getProfileAnalyticsOverview(): Promise<{
    totalProfiles: number;
    verifiedProfiles: number;
    completeProfiles: number;
    averageCompletionRate: number;
  }> {
    return await this.profileService.getAnalyticsOverview();
  }
}