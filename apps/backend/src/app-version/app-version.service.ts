import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { AppVersion, AppPlatform } from './entities/app-version.entity';
import { 
  CheckAppVersionDto, 
  AppVersionResponseDto, 
  CreateAppVersionDto, 
  UpdateAppVersionDto 
} from './dto/app-version.dto';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class AppVersionService {
  constructor(
    @InjectRepository(AppVersion)
    private readonly appVersionRepository: EntityRepository<AppVersion>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Check if app needs update
   */
  async checkVersion(dto: CheckAppVersionDto): Promise<AppVersionResponseDto> {
    try {
      // Find the latest active version for the platform
      const latestVersion = await this.appVersionRepository.findOne(
        { 
          platform: dto.platform, 
          isActive: true 
        },
        { 
          orderBy: { createdAt: 'DESC' } 
        }
      );

      if (!latestVersion) {
        // If no version found, assume app is up to date
        this.logger.warn(`No active version found for platform ${dto.platform}`);
        return {
          needsUpdate: false,
          forceUpdate: false,
          latestVersion: dto.currentVersion,
          minRequiredVersion: dto.currentVersion,
          updateUrl: this.getDefaultUpdateUrl(dto.platform),
          platform: dto.platform,
        };
      }

      const needsUpdate = latestVersion.needsUpdate(dto.currentVersion);
      const forceUpdate = latestVersion.requiresForceUpdate(dto.currentVersion);

      this.logger.log(
        `Version check for ${dto.platform}: current=${dto.currentVersion}, latest=${latestVersion.version}, needsUpdate=${needsUpdate}, forceUpdate=${forceUpdate}`
      );

      return {
        needsUpdate,
        forceUpdate,
        latestVersion: latestVersion.version,
        minRequiredVersion: latestVersion.minRequiredVersion,
        updateUrl: latestVersion.updateUrl,
        releaseNotes: latestVersion.releaseNotes,
        platform: dto.platform,
      };
    } catch (error) {
      this.logger.error('Error checking app version', error);
      throw new BadRequestException('Failed to check app version');
    }
  }

  /**
   * Create a new app version (Admin only)
   */
  async createVersion(dto: CreateAppVersionDto): Promise<AppVersion> {
    try {
      // Check if version already exists
      const existingVersion = await this.appVersionRepository.findOne({
        platform: dto.platform,
        version: dto.version,
      });

      if (existingVersion) {
        throw new BadRequestException(
          `Version ${dto.version} already exists for platform ${dto.platform}`
        );
      }

      // Validate version format
      if (AppVersion.compareVersions(dto.version, dto.minRequiredVersion) < 0) {
        throw new BadRequestException(
          'Latest version cannot be lower than minimum required version'
        );
      }

      // If this is marked as active, deactivate other versions
      if (dto.isActive !== false) {
        await this.deactivateOtherVersions(dto.platform);
      }

      const appVersion = this.appVersionRepository.create({
        ...dto,
        isActive: dto.isActive ?? true,
      });

      await this.appVersionRepository.persistAndFlush(appVersion);

      this.logger.log(
        `Created new app version ${dto.version} for platform ${dto.platform}`
      );

      return appVersion;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating app version', error);
      throw new BadRequestException('Failed to create app version');
    }
  }

  /**
   * Update an existing app version (Admin only)
   */
  async updateVersion(
    id: string, 
    dto: UpdateAppVersionDto
  ): Promise<AppVersion> {
    try {
      const appVersion = await this.appVersionRepository.findOne({ id });

      if (!appVersion) {
        throw new NotFoundException('App version not found');
      }

      // Validate version format if provided
      if (dto.version && dto.minRequiredVersion) {
        if (AppVersion.compareVersions(dto.version, dto.minRequiredVersion) < 0) {
          throw new BadRequestException(
            'Latest version cannot be lower than minimum required version'
          );
        }
      }

      // If activating this version, deactivate others
      if (dto.isActive === true && !appVersion.isActive) {
        await this.deactivateOtherVersions(appVersion.platform);
      }

      Object.assign(appVersion, dto);
      await this.appVersionRepository.persistAndFlush(appVersion);

      this.logger.log(`Updated app version ${id}`);

      return appVersion;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error updating app version', error);
      throw new BadRequestException('Failed to update app version');
    }
  }

  /**
   * Get all app versions (Admin only)
   */
  async getAllVersions(platform?: AppPlatform): Promise<AppVersion[]> {
    try {
      const where = platform ? { platform } : {};
      
      return await this.appVersionRepository.find(
        where,
        { 
          orderBy: { 
            platform: 'ASC', 
            createdAt: 'DESC' 
          } 
        }
      );
    } catch (error) {
      this.logger.error('Error fetching app versions', error);
      throw new BadRequestException('Failed to fetch app versions');
    }
  }

  /**
   * Get a specific app version (Admin only)
   */
  async getVersion(id: string): Promise<AppVersion> {
    const appVersion = await this.appVersionRepository.findOne({ id });

    if (!appVersion) {
      throw new NotFoundException('App version not found');
    }

    return appVersion;
  }

  /**
   * Delete an app version (Admin only)
   */
  async deleteVersion(id: string): Promise<void> {
    try {
      const appVersion = await this.appVersionRepository.findOne({ id });

      if (!appVersion) {
        throw new NotFoundException('App version not found');
      }

      await this.appVersionRepository.removeAndFlush(appVersion);

      this.logger.log(`Deleted app version ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting app version', error);
      throw new BadRequestException('Failed to delete app version');
    }
  }

  /**
   * Get the latest version for a platform
   */
  async getLatestVersion(platform: AppPlatform): Promise<AppVersion | null> {
    return await this.appVersionRepository.findOne(
      { 
        platform, 
        isActive: true 
      },
      { 
        orderBy: { createdAt: 'DESC' } 
      }
    );
  }

  /**
   * Deactivate all other versions for a platform
   */
  private async deactivateOtherVersions(platform: AppPlatform): Promise<void> {
    await this.appVersionRepository.nativeUpdate(
      { platform, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Get default update URL for platform
   */
  private getDefaultUpdateUrl(platform: AppPlatform): string {
    switch (platform) {
      case AppPlatform.IOS:
        return 'https://apps.apple.com/app/signalspot';
      case AppPlatform.ANDROID:
        return 'https://play.google.com/store/apps/details?id=com.signalspot.app';
      default:
        return '';
    }
  }
}