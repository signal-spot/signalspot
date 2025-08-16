import { Migration } from '@mikro-orm/migrations';

export class Migration20250814175147_AddAdminAndSystemMessageFields extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "is_admin" boolean not null default false;`);

    this.addSql(`alter table "signal_spot" add column "is_system_message" boolean not null default false, add column "custom_sender_name" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "is_admin";`);

    this.addSql(`alter table "signal_spot" drop column "is_system_message", drop column "custom_sender_name";`);
  }

}
