import { Migration } from '@mikro-orm/migrations';

export class Migration20250810180846_UpdateTimestampColumns extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "apns_token" varchar(255) null, add column "notification_settings" jsonb null;`);

    this.addSql(`alter table "signal_spot" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "signal_spot" alter column "created_at" set default now();`);
    this.addSql(`alter table "signal_spot" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "signal_spot" alter column "updated_at" set default now();`);
    this.addSql(`alter table "signal_spot" alter column "expires_at" type timestamptz using ("expires_at"::timestamptz);`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "comments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "spot_id" uuid not null, "author_id" uuid not null, "content" text not null, "metadata" jsonb null, "like_count" int not null default 0, "liked_by" text[] not null default '{}', "is_deleted" boolean not null default false, "deleted_at" timestamptz null, "parent_comment_id" varchar(255) null, "is_anonymous" boolean not null default false, constraint "comments_pkey" primary key ("id"));`);
    this.addSql(`create index "comments_spot_id_index" on "comments" ("spot_id");`);
    this.addSql(`create index "comments_author_id_index" on "comments" ("author_id");`);

    this.addSql(`alter table "comments" add constraint "comments_spot_id_foreign" foreign key ("spot_id") references "signal_spot" ("id") on update cascade;`);
    this.addSql(`alter table "comments" add constraint "comments_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "user" drop column "apns_token", drop column "notification_settings";`);

    this.addSql(`alter table "signal_spot" alter column "created_at" drop default;`);
    this.addSql(`alter table "signal_spot" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "signal_spot" alter column "updated_at" drop default;`);
    this.addSql(`alter table "signal_spot" alter column "updated_at" type date using ("updated_at"::date);`);
    this.addSql(`alter table "signal_spot" alter column "expires_at" type date using ("expires_at"::date);`);
  }

}
