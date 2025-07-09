import { Migration } from '@mikro-orm/migrations';

export class Migration20250709030448 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "notification" ("id" uuid not null, "user_id" uuid not null, "type" text check ("type" in ('spark_detected', 'spark_matched', 'message_received', 'signal_spot_nearby', 'sacred_site_discovered', 'sacred_site_tier_upgraded', 'profile_visited', 'system_announcement', 'location_sharing_request', 'friend_request', 'achievement_unlocked')) not null, "title" varchar(255) not null, "body" text not null, "data" jsonb null, "status" text check ("status" in ('pending', 'delivered', 'read', 'failed', 'cancelled')) not null, "priority" text check ("priority" in ('low', 'normal', 'high', 'critical')) not null, "image_url" varchar(255) null, "action_url" varchar(255) null, "deep_link_url" varchar(255) null, "group_key" varchar(255) null, "expires_at" timestamptz null, "scheduled_for" timestamptz null, "delivered_at" timestamptz null, "read_at" timestamptz null, "failure_reason" varchar(255) null, "retry_count" int not null default 0, "max_retries" int not null default 3, "fcm_response" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null, "updated_at" date not null, constraint "notification_pkey" primary key ("id"));`);
    this.addSql(`create index "notification_user_id_index" on "notification" ("user_id");`);
    this.addSql(`create index "notification_type_index" on "notification" ("type");`);
    this.addSql(`create index "notification_status_index" on "notification" ("status");`);
    this.addSql(`create index "notification_created_at_index" on "notification" ("created_at");`);
    this.addSql(`create index "notification_type_created_at_index" on "notification" ("type", "created_at");`);
    this.addSql(`create index "notification_group_key_user_id_created_at_index" on "notification" ("group_key", "user_id", "created_at");`);
    this.addSql(`create index "notification_expires_at_status_index" on "notification" ("expires_at", "status");`);
    this.addSql(`create index "notification_status_scheduled_for_index" on "notification" ("status", "scheduled_for");`);
    this.addSql(`create index "notification_user_id_status_created_at_index" on "notification" ("user_id", "status", "created_at");`);

    this.addSql(`alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

}
