import { Migration } from '@mikro-orm/migrations';

export class Migration20250812190758_AddMessageToSpark extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "sparks" add column "message" text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "sparks" drop column "message";');
  }

}