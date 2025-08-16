import { Migration } from '@mikro-orm/migrations';

export class Migration20250807164431 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "sacred_site" ("id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "latitude" numeric(10,8) not null, "longitude" numeric(11,8) not null, "address" varchar(255) null, "radius" int not null, "tier" text check ("tier" in ('legendary', 'major', 'minor', 'emerging')) not null, "status" text check ("status" in ('active', 'dormant', 'archived')) not null, "cluster_points" int not null, "cluster_metadata" jsonb null, "total_score" numeric(8,4) not null, "visit_count" int not null, "unique_visitor_count" int not null, "spot_count" int not null, "total_engagement" int not null, "average_engagement_rate" numeric(8,4) not null, "growth_rate" numeric(8,4) not null, "recency_score" numeric(8,4) not null, "first_activity_at" timestamptz not null, "last_activity_at" timestamptz not null, "peak_activity_hour" int not null, "activity_pattern" jsonb null, "discoverer_user_id" varchar(255) not null, "discovered_at" timestamptz not null, "is_verified" boolean not null, "tags" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "archived_at" timestamptz null, constraint "sacred_site_pkey" primary key ("id"));`);
    this.addSql(`create index "sacred_site_latitude_index" on "sacred_site" ("latitude");`);
    this.addSql(`create index "sacred_site_longitude_index" on "sacred_site" ("longitude");`);
    this.addSql(`create index "sacred_site_radius_index" on "sacred_site" ("radius");`);
    this.addSql(`create index "sacred_site_tier_index" on "sacred_site" ("tier");`);
    this.addSql(`create index "sacred_site_status_index" on "sacred_site" ("status");`);
    this.addSql(`create index "sacred_site_visit_count_index" on "sacred_site" ("visit_count");`);
    this.addSql(`create index "sacred_site_peak_activity_hour_index" on "sacred_site" ("peak_activity_hour");`);
    this.addSql(`create index "sacred_site_created_at_index" on "sacred_site" ("created_at");`);

    this.addSql(`create table "sparks" ("id" varchar(255) not null, "user1_id" uuid not null, "user2_id" uuid not null, "type" text check ("type" in ('proximity', 'interest', 'location', 'activity')) not null default 'proximity', "status" text check ("status" in ('pending', 'accepted', 'declined', 'expired', 'matched')) not null default 'pending', "latitude" numeric(10,8) not null, "longitude" numeric(11,8) not null, "distance" real null, "strength" int not null default 0, "metadata" jsonb null, "user1response_at" timestamptz null, "user2response_at" timestamptz null, "user1accepted" boolean not null default false, "user2accepted" boolean not null default false, "expires_at" timestamptz null, "is_notified" boolean not null default false, "notified_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "sparks_pkey" primary key ("id"));`);
    this.addSql(`create index "sparks_user1_id_index" on "sparks" ("user1_id");`);
    this.addSql(`create index "sparks_user2_id_index" on "sparks" ("user2_id");`);
    this.addSql(`create index "sparks_status_index" on "sparks" ("status");`);
    this.addSql(`create index "sparks_latitude_longitude_index" on "sparks" ("latitude", "longitude");`);
    this.addSql(`create index "sparks_expires_at_status_index" on "sparks" ("expires_at", "status");`);
    this.addSql(`create index "sparks_type_created_at_index" on "sparks" ("type", "created_at");`);
    this.addSql(`create index "sparks_status_created_at_index" on "sparks" ("status", "created_at");`);
    this.addSql(`create index "sparks_user1_id_user2_id_created_at_index" on "sparks" ("user1_id", "user2_id", "created_at");`);

    this.addSql(`create table "site_activity" ("id" varchar(255) not null, "site_id" varchar(255) not null, "user_id" uuid null, "activity_type" text check ("activity_type" in ('visit', 'spot_created', 'interaction', 'discovery', 'check_in')) not null, "related_content_id" varchar(255) null, "related_content_type" varchar(255) null, "latitude" numeric(10,8) null, "longitude" numeric(11,8) null, "metadata" jsonb null, "timestamp" timestamptz not null, "created_at" timestamptz not null, constraint "site_activity_pkey" primary key ("id"));`);
    this.addSql(`create index "site_activity_site_id_index" on "site_activity" ("site_id");`);
    this.addSql(`create index "site_activity_user_id_index" on "site_activity" ("user_id");`);
    this.addSql(`create index "site_activity_activity_type_index" on "site_activity" ("activity_type");`);
    this.addSql(`create index "site_activity_timestamp_index" on "site_activity" ("timestamp");`);
    this.addSql(`create index "site_activity_created_at_index" on "site_activity" ("created_at");`);

    this.addSql(`create table "location_history" ("id" varchar(255) not null, "user_id" varchar(255) not null, "userId" uuid not null, "latitude" numeric(10,8) not null, "longitude" numeric(11,8) not null, "accuracy" real null, "speed" real null, "heading" real null, "altitude" real null, "is_background" boolean not null default false, "metadata" jsonb null, "timestamp" timestamptz not null, "created_at" timestamptz not null, "location" text null, constraint "location_history_pkey" primary key ("id"));`);
    this.addSql(`create index "location_history_user_id_index" on "location_history" ("user_id");`);
    this.addSql(`create index "location_history_latitude_index" on "location_history" ("latitude");`);
    this.addSql(`create index "location_history_longitude_index" on "location_history" ("longitude");`);
    this.addSql(`create index "location_history_latitude_longitude_timestamp_index" on "location_history" ("latitude", "longitude", "timestamp");`);
    this.addSql(`create index "location_history_user_id_timestamp_index" on "location_history" ("user_id", "timestamp");`);

    this.addSql(`create table "comments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "spot_id" uuid not null, "author_id" uuid not null, "content" text not null, "metadata" jsonb null, "like_count" int not null default 0, "liked_by" text[] not null default '{}', "is_deleted" boolean not null default false, "deleted_at" timestamptz null, "parent_comment_id" varchar(255) null, "is_anonymous" boolean not null default false, constraint "comments_pkey" primary key ("id"));`);
    this.addSql(`create index "comments_spot_id_index" on "comments" ("spot_id");`);
    this.addSql(`create index "comments_author_id_index" on "comments" ("author_id");`);

    this.addSql(`create table "chat_room" ("id" varchar(255) not null, "name" varchar(255) not null, "type" text check ("type" in ('direct', 'group')) not null default 'direct', "status" text check ("status" in ('active', 'archived', 'blocked')) not null default 'active', "participant1_id" uuid not null, "participant2_id" uuid not null, "last_message_at" timestamptz not null, "last_message" varchar(255) not null, "unread_count1" int not null default 0, "unread_count2" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "chat_room_pkey" primary key ("id"));`);
    this.addSql(`create index "chat_room_type_status_index" on "chat_room" ("type", "status");`);
    this.addSql(`create index "chat_room_participant1_id_participant2_id_index" on "chat_room" ("participant1_id", "participant2_id");`);

    this.addSql(`create table "message" ("id" varchar(255) not null, "chat_room_id" varchar(255) not null, "sender_id" uuid not null, "content" text not null, "type" text check ("type" in ('text', 'image', 'location', 'system')) not null default 'text', "status" text check ("status" in ('sent', 'delivered', 'read', 'failed')) not null default 'sent', "metadata" jsonb null, "read_at" timestamptz not null, "delivered_at" timestamptz not null, "edited_at" timestamptz not null, "is_deleted" boolean not null default false, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "message_pkey" primary key ("id"));`);
    this.addSql(`create index "message_sender_id_created_at_index" on "message" ("sender_id", "created_at");`);
    this.addSql(`create index "message_chat_room_id_created_at_index" on "message" ("chat_room_id", "created_at");`);

    this.addSql(`alter table "sparks" add constraint "sparks_user1_id_foreign" foreign key ("user1_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "sparks" add constraint "sparks_user2_id_foreign" foreign key ("user2_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "site_activity" add constraint "site_activity_site_id_foreign" foreign key ("site_id") references "sacred_site" ("id") on update cascade;`);
    this.addSql(`alter table "site_activity" add constraint "site_activity_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "location_history" add constraint "location_history_userId_foreign" foreign key ("userId") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "comments" add constraint "comments_spot_id_foreign" foreign key ("spot_id") references "signal_spot" ("id") on update cascade;`);
    this.addSql(`alter table "comments" add constraint "comments_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "chat_room" add constraint "chat_room_participant1_id_foreign" foreign key ("participant1_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "chat_room" add constraint "chat_room_participant2_id_foreign" foreign key ("participant2_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "message" add constraint "message_chat_room_id_foreign" foreign key ("chat_room_id") references "chat_room" ("id") on update cascade;`);
    this.addSql(`alter table "message" add constraint "message_sender_id_foreign" foreign key ("sender_id") references "user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "site_activity" drop constraint "site_activity_site_id_foreign";`);

    this.addSql(`alter table "message" drop constraint "message_chat_room_id_foreign";`);
  }

}
