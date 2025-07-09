import { Migration } from '@mikro-orm/migrations';

export class Migration20250709030329 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "signal_spot" ("id" uuid not null, "creator_id" uuid not null, "message" varchar(255) not null, "title" varchar(255) null, "latitude" double precision not null, "longitude" double precision not null, "radius_in_meters" int not null default 100, "duration_in_hours" int not null default 24, "status" varchar(255) not null default 'active', "visibility" varchar(255) not null default 'public', "type" varchar(255) not null default 'announcement', "tags" jsonb null, "view_count" int not null default 0, "like_count" int not null default 0, "dislike_count" int not null default 0, "reply_count" int not null default 0, "share_count" int not null default 0, "report_count" int not null default 0, "is_active" boolean not null default true, "is_pinned" boolean not null default false, "metadata" jsonb null, "created_at" timestamptz not null, "updated_at" date not null, "expires_at" date not null, constraint "signal_spot_pkey" primary key ("id"));`);
    this.addSql(`create index "signal_spot_id_index" on "signal_spot" ("id");`);
    this.addSql(`create index "signal_spot_creator_id_index" on "signal_spot" ("creator_id");`);
    this.addSql(`create index "signal_spot_latitude_index" on "signal_spot" ("latitude");`);
    this.addSql(`create index "signal_spot_longitude_index" on "signal_spot" ("longitude");`);
    this.addSql(`create index "signal_spot_status_index" on "signal_spot" ("status");`);
    this.addSql(`create index "signal_spot_visibility_index" on "signal_spot" ("visibility");`);
    this.addSql(`create index "signal_spot_type_index" on "signal_spot" ("type");`);
    this.addSql(`create index "signal_spot_created_at_index" on "signal_spot" ("created_at");`);
    this.addSql(`create index "signal_spot_expires_at_index" on "signal_spot" ("expires_at");`);
    this.addSql(`create index "signal_spot_like_count_view_count_created_at_index" on "signal_spot" ("like_count", "view_count", "created_at");`);
    this.addSql(`create index "signal_spot_creator_id_status_created_at_index" on "signal_spot" ("creator_id", "status", "created_at");`);
    this.addSql(`create index "signal_spot_type_status_created_at_index" on "signal_spot" ("type", "status", "created_at");`);
    this.addSql(`create index "signal_spot_status_visibility_expires_at_index" on "signal_spot" ("status", "visibility", "expires_at");`);
    this.addSql(`create index "signal_spot_latitude_longitude_index" on "signal_spot" ("latitude", "longitude");`);

    this.addSql(`alter table "signal_spot" add constraint "signal_spot_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "user" add column "email_verified_at" timestamptz null, add column "fcm_token" varchar(255) null;`);
    this.addSql(`create index "user_location_tracking_enabled_index" on "user" ("location_tracking_enabled");`);
    this.addSql(`create index "user_location_privacy_index" on "user" ("location_privacy");`);
    this.addSql(`create index "user_last_login_at_is_active_index" on "user" ("last_login_at", "is_active");`);
    this.addSql(`create index "user_location_privacy_location_tracking_enabled_index" on "user" ("location_privacy", "location_tracking_enabled");`);
    this.addSql(`create index "user_profile_completion_percentage_verification_status_index" on "user" ("profile_completion_percentage", "verification_status");`);
    this.addSql(`create index "user_status_is_active_index" on "user" ("status", "is_active");`);
    this.addSql(`create index "user_last_known_latitude_last_known_longitude_last_66c78_index" on "user" ("last_known_latitude", "last_known_longitude", "last_location_update_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "user_location_tracking_enabled_index";`);
    this.addSql(`drop index "user_location_privacy_index";`);
    this.addSql(`drop index "user_last_login_at_is_active_index";`);
    this.addSql(`drop index "user_location_privacy_location_tracking_enabled_index";`);
    this.addSql(`drop index "user_profile_completion_percentage_verification_status_index";`);
    this.addSql(`drop index "user_status_is_active_index";`);
    this.addSql(`drop index "user_last_known_latitude_last_known_longitude_last_66c78_index";`);
    this.addSql(`alter table "user" drop column "email_verified_at", drop column "fcm_token";`);
  }

}
