import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AppVersionService } from './app-version.service';
import {
  CheckAppVersionDto,
  AppVersionResponseDto,
  CreateAppVersionDto,
  UpdateAppVersionDto,
} from './dto/app-version.dto';
import { AppVersion, AppPlatform } from './entities/app-version.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';

@ApiTags('App Version')
@Controller('app-version')
@UseInterceptors(ResponseTransformInterceptor)
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  /**
   * Check if app needs update (Public endpoint)
   */
  @Get('check')
  @Public()
  @ApiOperation({ summary: 'Check if app needs update' })
  @ApiResponse({
    status: 200,
    description: 'Version check result',
    type: AppVersionResponseDto,
  })
  @ApiQuery({ name: 'platform', enum: AppPlatform, required: true })
  @ApiQuery({ name: 'currentVersion', required: true, example: '1.0.0' })
  async checkVersion(
    @Query() dto: CheckAppVersionDto
  ): Promise<AppVersionResponseDto> {
    return await this.appVersionService.checkVersion(dto);
  }

  /**
   * Get all app versions (Admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all app versions (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all app versions',
    type: [AppVersion],
  })
  @ApiQuery({ name: 'platform', enum: AppPlatform, required: false })
  async getAllVersions(
    @Query('platform') platform?: AppPlatform
  ): Promise<AppVersion[]> {
    return await this.appVersionService.getAllVersions(platform);
  }

  /**
   * Get latest version for a platform (Public endpoint)
   */
  @Get('latest/:platform')
  @Public()
  @ApiOperation({ summary: 'Get latest version for a platform' })
  @ApiResponse({
    status: 200,
    description: 'Latest app version',
    type: AppVersion,
  })
  @ApiResponse({
    status: 404,
    description: 'No active version found',
  })
  async getLatestVersion(
    @Param('platform') platform: AppPlatform
  ): Promise<AppVersion> {
    const version = await this.appVersionService.getLatestVersion(platform);
    
    if (!version) {
      throw new Error('No active version found for platform');
    }
    
    return version;
  }

  /**
   * Get a specific app version (Admin only)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific app version (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'App version details',
    type: AppVersion,
  })
  @ApiResponse({
    status: 404,
    description: 'App version not found',
  })
  async getVersion(@Param('id') id: string): Promise<AppVersion> {
    return await this.appVersionService.getVersion(id);
  }

  /**
   * Create a new app version (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new app version (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'App version created successfully',
    type: AppVersion,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or version already exists',
  })
  async createVersion(
    @Body() dto: CreateAppVersionDto
  ): Promise<AppVersion> {
    return await this.appVersionService.createVersion(dto);
  }

  /**
   * Update an existing app version (Admin only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing app version (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'App version updated successfully',
    type: AppVersion,
  })
  @ApiResponse({
    status: 404,
    description: 'App version not found',
  })
  async updateVersion(
    @Param('id') id: string,
    @Body() dto: UpdateAppVersionDto
  ): Promise<AppVersion> {
    return await this.appVersionService.updateVersion(id, dto);
  }

  /**
   * Delete an app version (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an app version (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'App version deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'App version not found',
  })
  async deleteVersion(@Param('id') id: string): Promise<{ message: string }> {
    await this.appVersionService.deleteVersion(id);
    return { message: 'App version deleted successfully' };
  }
}