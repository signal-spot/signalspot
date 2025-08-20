import { Migration } from '@mikro-orm/migrations';

export class Migration20250820_AddAppVersionTable extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TYPE app_platform AS ENUM ('ios', 'android');
    `);

    this.addSql(`
      CREATE TABLE app_versions (
        id VARCHAR(255) PRIMARY KEY,
        platform app_platform NOT NULL,
        version VARCHAR(50) NOT NULL,
        min_required_version VARCHAR(50) NOT NULL,
        release_notes TEXT,
        update_url VARCHAR(500) NOT NULL,
        force_update BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add indexes for better query performance
    this.addSql(`
      CREATE INDEX idx_app_versions_platform ON app_versions(platform);
    `);

    this.addSql(`
      CREATE INDEX idx_app_versions_platform_active ON app_versions(platform, is_active);
    `);

    this.addSql(`
      CREATE UNIQUE INDEX idx_app_versions_platform_version ON app_versions(platform, version);
    `);

    // Insert initial versions for both platforms
    this.addSql(`
      INSERT INTO app_versions (
        id, 
        platform, 
        version, 
        min_required_version, 
        release_notes, 
        update_url, 
        is_active
      ) VALUES 
      (
        gen_random_uuid()::text,
        'ios',
        '1.0.0',
        '1.0.0',
        'Initial release',
        'https://apps.apple.com/app/signalspot',
        true
      ),
      (
        gen_random_uuid()::text,
        'android',
        '1.0.0',
        '1.0.0',
        'Initial release',
        'https://play.google.com/store/apps/details?id=com.signalspot.app',
        true
      );
    `);
  }

  async down(): Promise<void> {
    // Drop indexes first
    this.addSql('DROP INDEX IF EXISTS idx_app_versions_platform;');
    this.addSql('DROP INDEX IF EXISTS idx_app_versions_platform_active;');
    this.addSql('DROP INDEX IF EXISTS idx_app_versions_platform_version;');
    
    // Drop table
    this.addSql('DROP TABLE IF EXISTS app_versions;');
    
    // Drop enum type
    this.addSql('DROP TYPE IF EXISTS app_platform;');
  }
}