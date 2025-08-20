import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum AppPlatform {
  IOS = 'ios',
  ANDROID = 'android',
}

@Entity({ tableName: 'app_versions' })
export class AppVersion {
  @PrimaryKey()
  id: string = v4();

  @Enum(() => AppPlatform)
  platform!: AppPlatform;

  @Property()
  version!: string;

  @Property()
  minRequiredVersion!: string;

  @Property({ type: 'text', nullable: true })
  releaseNotes?: string;

  @Property()
  updateUrl!: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * Compare two version strings
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  /**
   * Check if current version needs update
   */
  needsUpdate(currentVersion: string): boolean {
    return AppVersion.compareVersions(this.version, currentVersion) > 0;
  }

  /**
   * Check if update is mandatory
   */
  requiresForceUpdate(currentVersion: string): boolean {
    return AppVersion.compareVersions(this.minRequiredVersion, currentVersion) > 0;
  }
}