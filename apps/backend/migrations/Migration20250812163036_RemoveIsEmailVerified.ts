import { Migration } from '@mikro-orm/migrations';

export class Migration20250812163036_RemoveIsEmailVerified extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" drop column "is_email_verified";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" add column "is_email_verified" boolean not null default false;`);
  }

}
