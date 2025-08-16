import { Migration } from '@mikro-orm/migrations';

export class Migration20250810FixMissingColumns extends Migration {

  async up(): Promise<void> {
    // Add missing columns to user table if they don't exist
    const userColumns = await this.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name IN ('apns_token', 'fcm_token')
    `);
    
    if (!userColumns.find((col: any) => col.column_name === 'apns_token')) {
      this.addSql('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "apns_token" varchar(255) NULL;');
    }
    
    if (!userColumns.find((col: any) => col.column_name === 'fcm_token')) {
      this.addSql('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "fcm_token" varchar(255) NULL;');
    }

    // Add missing columns to spark table if they don't exist
    const sparkColumns = await this.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'spark'
    `);
    
    if (!sparkColumns.find((col: any) => col.column_name === 'sender_id')) {
      this.addSql('ALTER TABLE "spark" ADD COLUMN IF NOT EXISTS "sender_id" uuid NULL;');
    }
    
    if (!sparkColumns.find((col: any) => col.column_name === 'receiver_id')) {
      this.addSql('ALTER TABLE "spark" ADD COLUMN IF NOT EXISTS "receiver_id" uuid NULL;');
    }

    // Add missing columns to signal_spot table if they don't exist
    const signalSpotColumns = await this.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'signal_spot'
    `);
    
    if (!signalSpotColumns.find((col: any) => col.column_name === 'creator_id')) {
      this.addSql('ALTER TABLE "signal_spot" ADD COLUMN IF NOT EXISTS "creator_id" uuid NULL;');
    }

    // Create chat_room table if it doesn't exist
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "chat_room" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(255) NULL,
        "type" varchar(50) NOT NULL DEFAULT 'direct',
        "created_by_id" uuid NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_message" text NULL,
        "last_message_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create chat_room_participants table if it doesn't exist
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "chat_room_participants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "room_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "joined_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "left_at" timestamptz NULL,
        "is_admin" boolean NOT NULL DEFAULT false,
        "unread_count" int NOT NULL DEFAULT 0,
        "last_read_at" timestamptz NULL,
        CONSTRAINT "chat_room_participants_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create message table if it doesn't exist
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "message" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "room_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "content" text NOT NULL,
        "type" varchar(50) NOT NULL DEFAULT 'text',
        "media_url" varchar(255) NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "is_edited" boolean NOT NULL DEFAULT false,
        "edited_at" timestamptz NULL,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "deleted_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "message_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create notification table if it doesn't exist
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "notification" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "type" varchar(50) NOT NULL,
        "title" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "data" jsonb NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
      );
    `);

    // Add indexes
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_spark_sender" ON "spark" ("sender_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_spark_receiver" ON "spark" ("receiver_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_signal_spot_creator" ON "signal_spot" ("creator_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_chat_room_participants_room" ON "chat_room_participants" ("room_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_chat_room_participants_user" ON "chat_room_participants" ("user_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_message_room" ON "message" ("room_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_message_sender" ON "message" ("sender_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "idx_notification_user" ON "notification" ("user_id");');
  }

  async down(): Promise<void> {
    // This migration is not reversible as it adds missing columns
  }

}