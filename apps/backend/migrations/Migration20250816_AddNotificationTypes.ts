import { Migration } from '@mikro-orm/migrations';

export class Migration20250816_AddNotificationTypes extends Migration {

  async up(): Promise<void> {
    // Drop the old check constraint
    this.addSql('ALTER TABLE "notification" DROP CONSTRAINT IF EXISTS "notification_type_check";');
    
    // Add the new check constraint with all notification types
    this.addSql(`
      ALTER TABLE "notification" 
      ADD CONSTRAINT "notification_type_check" 
      CHECK (type IN (
        'spark_detected',
        'spark_matched',
        'message_received',
        'signal_spot_nearby',
        'sacred_site_discovered',
        'sacred_site_tier_upgraded',
        'profile_visited',
        'system_announcement',
        'location_sharing_request',
        'friend_request',
        'achievement_unlocked',
        'spot_liked',
        'spot_commented',
        'comment_liked',
        'comment_replied'
      ))
    `);
  }

  async down(): Promise<void> {
    // Drop the new check constraint
    this.addSql('ALTER TABLE "notification" DROP CONSTRAINT IF EXISTS "notification_type_check";');
    
    // Restore the old check constraint
    this.addSql(`
      ALTER TABLE "notification" 
      ADD CONSTRAINT "notification_type_check" 
      CHECK (type IN (
        'spark_detected',
        'spark_matched',
        'message_received',
        'signal_spot_nearby',
        'sacred_site_discovered',
        'sacred_site_tier_upgraded',
        'profile_visited',
        'system_announcement',
        'location_sharing_request',
        'friend_request',
        'achievement_unlocked'
      ))
    `);
  }

}