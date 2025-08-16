import { Migration } from '@mikro-orm/migrations';

export class Migration20250814124139_FixMessageNullableFields extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "chat_room" alter column "last_message_at" type timestamptz using ("last_message_at"::timestamptz);`);
    this.addSql(`alter table "chat_room" alter column "last_message_at" drop not null;`);
    this.addSql(`alter table "chat_room" alter column "last_message" type varchar(255) using ("last_message"::varchar(255));`);
    this.addSql(`alter table "chat_room" alter column "last_message" drop not null;`);

    this.addSql(`alter table "message" alter column "read_at" type timestamptz using ("read_at"::timestamptz);`);
    this.addSql(`alter table "message" alter column "read_at" drop not null;`);
    this.addSql(`alter table "message" alter column "delivered_at" type timestamptz using ("delivered_at"::timestamptz);`);
    this.addSql(`alter table "message" alter column "delivered_at" drop not null;`);
    this.addSql(`alter table "message" alter column "edited_at" type timestamptz using ("edited_at"::timestamptz);`);
    this.addSql(`alter table "message" alter column "edited_at" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "chat_room" alter column "last_message_at" type timestamptz using ("last_message_at"::timestamptz);`);
    this.addSql(`alter table "chat_room" alter column "last_message_at" set not null;`);
    this.addSql(`alter table "chat_room" alter column "last_message" type varchar(255) using ("last_message"::varchar(255));`);
    this.addSql(`alter table "chat_room" alter column "last_message" set not null;`);

    this.addSql(`alter table "message" alter column "read_at" type timestamptz using ("read_at"::timestamptz);`);
    this.addSql(`alter table "message" alter column "read_at" set not null;`);
    this.addSql(`alter table "message" alter column "delivered_at" type timestamptz using ("delivered_at"::timestamptz);`);
    this.addSql(`alter table "message" alter column "delivered_at" set not null;`);
    this.addSql(`alter table "message" alter column "edited_at" type timestamptz using ("edited_at"::timestamptz);`);
    this.addSql(`alter table "message" alter column "edited_at" set not null;`);
  }

}
