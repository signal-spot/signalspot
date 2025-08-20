import { Migration } from '@mikro-orm/migrations';

export class Migration20250820_AddForceUpdateColumn extends Migration {
  async up(): Promise<void> {
    // Add force_update column to app_versions table
    this.addSql(`
      ALTER TABLE app_versions 
      ADD COLUMN force_update BOOLEAN DEFAULT false;
    `);

    // Update existing records to have force_update = false
    this.addSql(`
      UPDATE app_versions 
      SET force_update = false 
      WHERE force_update IS NULL;
    `);
  }

  async down(): Promise<void> {
    // Remove force_update column
    this.addSql(`
      ALTER TABLE app_versions 
      DROP COLUMN IF EXISTS force_update;
    `);
  }
}