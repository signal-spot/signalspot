import { Migration } from '@mikro-orm/migrations';

export class Migration20250814194538 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "firebase_uid" varchar(255) null, add column "deleted_at" timestamptz null, add column "delete_reason" varchar(255) null, add column "deleted_by" varchar(255) null, add column "recovery_token" varchar(255) null, add column "recovery_token_expires" timestamptz null;`);
    this.addSql(`create index "user_deleted_at_index" on "user" ("deleted_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "user_deleted_at_index";`);
    this.addSql(`alter table "user" drop column "firebase_uid", drop column "deleted_at", drop column "delete_reason", drop column "deleted_by", drop column "recovery_token", drop column "recovery_token_expires";`);
  }

}
