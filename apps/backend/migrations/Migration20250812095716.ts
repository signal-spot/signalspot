import { Migration } from '@mikro-orm/migrations';

export class Migration20250812095716 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "comments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "spot_id" uuid not null, "author_id" uuid not null, "content" text not null, "metadata" jsonb null, "like_count" int not null default 0, "liked_by" jsonb not null default '[]', "is_deleted" boolean not null default false, "deleted_at" timestamptz null, "parent_comment_id" varchar(255) null, "is_anonymous" boolean not null default false, constraint "comments_pkey" primary key ("id"));`);
    this.addSql(`create index "comments_spot_id_index" on "comments" ("spot_id");`);
    this.addSql(`create index "comments_author_id_index" on "comments" ("author_id");`);

    this.addSql(`create table "report" ("id" varchar(255) not null, "reporter_id" uuid not null, "type" text check ("type" in ('user', 'signal_spot', 'comment', 'chat_message')) not null default 'signal_spot', "reason" text check ("reason" in ('spam', 'harassment', 'hate_speech', 'violence', 'sexual_content', 'false_information', 'privacy_violation', 'copyright', 'self_harm', 'other')) not null default 'other', "description" text null, "reported_user_id" uuid null, "reported_spot_id" uuid null, "reported_comment_id" uuid null, "reported_message_id" varchar(255) null, "status" text check ("status" in ('pending', 'reviewing', 'resolved', 'rejected', 'escalated')) not null default 'pending', "action_taken" text check ("action_taken" in ('none', 'warning_issued', 'content_removed', 'user_suspended', 'user_banned')) not null default 'none', "review_notes" varchar(255) null, "reviewed_by_id" uuid null, "reviewed_at" timestamptz null, "resolved_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "report_pkey" primary key ("id"));`);
    this.addSql(`create index "report_created_at_status_index" on "report" ("created_at", "status");`);
    this.addSql(`create index "report_type_status_index" on "report" ("type", "status");`);
    this.addSql(`create index "report_reported_spot_id_status_index" on "report" ("reported_spot_id", "status");`);
    this.addSql(`create index "report_reported_user_id_status_index" on "report" ("reported_user_id", "status");`);
    this.addSql(`create index "report_reporter_id_status_index" on "report" ("reporter_id", "status");`);

    this.addSql(`create table "blocked_user" ("id" varchar(255) not null, "blocker_id" uuid not null, "blocked_id" uuid not null, "reason" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "blocked_user_pkey" primary key ("id"));`);
    this.addSql(`create index "blocked_user_blocker_id_blocked_id_index" on "blocked_user" ("blocker_id", "blocked_id");`);
    this.addSql(`alter table "blocked_user" add constraint "blocked_user_blocker_id_blocked_id_unique" unique ("blocker_id", "blocked_id");`);

    this.addSql(`alter table "comments" add constraint "comments_spot_id_foreign" foreign key ("spot_id") references "signal_spot" ("id") on update cascade;`);
    this.addSql(`alter table "comments" add constraint "comments_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "report" add constraint "report_reporter_id_foreign" foreign key ("reporter_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "report" add constraint "report_reported_user_id_foreign" foreign key ("reported_user_id") references "user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "report" add constraint "report_reported_spot_id_foreign" foreign key ("reported_spot_id") references "signal_spot" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "report" add constraint "report_reported_comment_id_foreign" foreign key ("reported_comment_id") references "comments" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "report" add constraint "report_reviewed_by_id_foreign" foreign key ("reviewed_by_id") references "user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "blocked_user" add constraint "blocked_user_blocker_id_foreign" foreign key ("blocker_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "blocked_user" add constraint "blocked_user_blocked_id_foreign" foreign key ("blocked_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "sparks" drop constraint if exists "sparks_type_check";`);

    this.addSql(`alter table "sparks" add constraint "sparks_type_check" check("type" in ('proximity', 'interest', 'location', 'activity', 'manual'));`);

    this.addSql(`alter table "chat_room" add column "spark_id" varchar(255) null, add column "initiated_by" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "report" drop constraint "report_reported_comment_id_foreign";`);

    this.addSql(`alter table "sparks" drop constraint if exists "sparks_type_check";`);

    this.addSql(`alter table "sparks" add constraint "sparks_type_check" check("type" in ('proximity', 'interest', 'location', 'activity'));`);

    this.addSql(`alter table "chat_room" drop column "spark_id", drop column "initiated_by";`);
  }

}
