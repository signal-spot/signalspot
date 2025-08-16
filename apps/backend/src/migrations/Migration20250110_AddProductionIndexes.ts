import { Migration } from '@mikro-orm/migrations';

/**
 * Add production-level database indexes for performance optimization
 */
export class Migration20250110AddProductionIndexes extends Migration {
  async up(): Promise<void> {
    // User table indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON "user" (email);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_username ON "user" (username);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_phone ON "user" (phone_number) WHERE phone_number IS NOT NULL;');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_status ON "user" (status) WHERE status != \'active\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_created ON "user" (created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_last_active ON "user" (last_active_at DESC) WHERE last_active_at IS NOT NULL;');
    
    // Signal Spot table indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_creator ON signal_spot (creator_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_status ON signal_spot (status) WHERE status = \'active\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_expires ON signal_spot (expires_at) WHERE status = \'active\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_created ON signal_spot (created_at DESC);');
    
    // Spatial index for location queries (using PostGIS)
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_location ON signal_spot USING GIST (ST_MakePoint(longitude, latitude));');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_location_active ON signal_spot USING GIST (ST_MakePoint(longitude, latitude)) WHERE status = \'active\';');
    
    // Compound index for nearby queries
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_location_expires ON signal_spot (status, expires_at, latitude, longitude) WHERE status = \'active\' AND expires_at > NOW();');
    
    // Spark table indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_user1 ON sparks (user1_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_user2 ON sparks (user2_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_status ON sparks (status) WHERE status IN (\'pending\', \'accepted\');');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_expires ON sparks (expires_at) WHERE status = \'pending\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_created ON sparks (created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_location ON sparks USING GIST (ST_MakePoint(longitude, latitude));');
    
    // Compound index for user sparks queries
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_user_status ON sparks (user1_id, status, created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spark_user2_status ON sparks (user2_id, status, created_at DESC);');
    
    // Chat room indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_participant1 ON chat_room (participant1_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_participant2 ON chat_room (participant2_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_status ON chat_room (status) WHERE status = \'active\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_last_message ON chat_room (last_message_at DESC);');
    
    // Compound index for user chat rooms
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_user_active ON chat_room (participant1_id, status, last_message_at DESC) WHERE status = \'active\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_user2_active ON chat_room (participant2_id, status, last_message_at DESC) WHERE status = \'active\';');
    
    // Message indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_room ON message (chat_room_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_sender ON message (sender_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_created ON message (created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_room_created ON message (chat_room_id, created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_unread ON message (chat_room_id, status) WHERE status != \'read\';');
    
    // Comment indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_spot ON comments (spot_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_author ON comments (author_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_created ON comments (created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_spot_created ON comments (spot_id, created_at DESC) WHERE is_deleted = false;');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_parent ON comments (parent_comment_id) WHERE parent_comment_id IS NOT NULL;');
    
    // Location history indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_user ON location_history (user_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_timestamp ON location_history (timestamp DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_user_time ON location_history (user_id, timestamp DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_spatial ON location_history USING GIST (ST_MakePoint(longitude, latitude));');
    
    // Notification indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_user ON notification (user_id);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_status ON notification (status) WHERE status IN (\'pending\', \'delivered\');');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_created ON notification (created_at DESC);');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_user_unread ON notification (user_id, status, created_at DESC) WHERE status != \'read\';');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_scheduled ON notification (scheduled_for) WHERE scheduled_for IS NOT NULL AND status = \'pending\';');
    
    // Full-text search indexes
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spot_content_fts ON signal_spot USING GIN (to_tsvector(\'english\', message));');
    this.addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_search ON "user" USING GIN (to_tsvector(\'english\', username || \' \' || COALESCE(first_name, \'\') || \' \' || COALESCE(last_name, \'\')));');
    
    // Analyze tables to update statistics
    this.addSql('ANALYZE "user";');
    this.addSql('ANALYZE signal_spot;');
    this.addSql('ANALYZE sparks;');
    this.addSql('ANALYZE chat_room;');
    this.addSql('ANALYZE message;');
    this.addSql('ANALYZE comments;');
    this.addSql('ANALYZE location_history;');
    this.addSql('ANALYZE notification;');
  }
  
  async down(): Promise<void> {
    // Drop all created indexes
    this.addSql('DROP INDEX IF EXISTS idx_user_email;');
    this.addSql('DROP INDEX IF EXISTS idx_user_username;');
    this.addSql('DROP INDEX IF EXISTS idx_user_phone;');
    this.addSql('DROP INDEX IF EXISTS idx_user_status;');
    this.addSql('DROP INDEX IF EXISTS idx_user_created;');
    this.addSql('DROP INDEX IF EXISTS idx_user_last_active;');
    
    this.addSql('DROP INDEX IF EXISTS idx_spot_creator;');
    this.addSql('DROP INDEX IF EXISTS idx_spot_status;');
    this.addSql('DROP INDEX IF EXISTS idx_spot_expires;');
    this.addSql('DROP INDEX IF EXISTS idx_spot_created;');
    this.addSql('DROP INDEX IF EXISTS idx_spot_location;');
    this.addSql('DROP INDEX IF EXISTS idx_spot_location_active;');
    this.addSql('DROP INDEX IF EXISTS idx_spot_location_expires;');
    
    this.addSql('DROP INDEX IF EXISTS idx_spark_user1;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_user2;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_status;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_expires;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_created;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_location;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_user_status;');
    this.addSql('DROP INDEX IF EXISTS idx_spark_user2_status;');
    
    this.addSql('DROP INDEX IF EXISTS idx_chat_participant1;');
    this.addSql('DROP INDEX IF EXISTS idx_chat_participant2;');
    this.addSql('DROP INDEX IF EXISTS idx_chat_status;');
    this.addSql('DROP INDEX IF EXISTS idx_chat_last_message;');
    this.addSql('DROP INDEX IF EXISTS idx_chat_user_active;');
    this.addSql('DROP INDEX IF EXISTS idx_chat_user2_active;');
    
    this.addSql('DROP INDEX IF EXISTS idx_message_room;');
    this.addSql('DROP INDEX IF EXISTS idx_message_sender;');
    this.addSql('DROP INDEX IF EXISTS idx_message_created;');
    this.addSql('DROP INDEX IF EXISTS idx_message_room_created;');
    this.addSql('DROP INDEX IF EXISTS idx_message_unread;');
    
    this.addSql('DROP INDEX IF EXISTS idx_comment_spot;');
    this.addSql('DROP INDEX IF EXISTS idx_comment_author;');
    this.addSql('DROP INDEX IF EXISTS idx_comment_created;');
    this.addSql('DROP INDEX IF EXISTS idx_comment_spot_created;');
    this.addSql('DROP INDEX IF EXISTS idx_comment_parent;');
    
    this.addSql('DROP INDEX IF EXISTS idx_location_user;');
    this.addSql('DROP INDEX IF EXISTS idx_location_timestamp;');
    this.addSql('DROP INDEX IF EXISTS idx_location_user_time;');
    this.addSql('DROP INDEX IF EXISTS idx_location_spatial;');
    
    this.addSql('DROP INDEX IF EXISTS idx_notification_user;');
    this.addSql('DROP INDEX IF EXISTS idx_notification_status;');
    this.addSql('DROP INDEX IF EXISTS idx_notification_created;');
    this.addSql('DROP INDEX IF EXISTS idx_notification_user_unread;');
    this.addSql('DROP INDEX IF EXISTS idx_notification_scheduled;');
    
    this.addSql('DROP INDEX IF EXISTS idx_spot_content_fts;');
    this.addSql('DROP INDEX IF EXISTS idx_user_search;');
  }
}