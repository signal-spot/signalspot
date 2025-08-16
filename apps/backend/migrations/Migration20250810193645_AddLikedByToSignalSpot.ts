import { Migration } from '@mikro-orm/migrations';

export class Migration20250810193645_AddLikedByToSignalSpot extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "sparks" drop constraint if exists "sparks_status_check";`);

    this.addSql(`alter table "sparks" add constraint "sparks_status_check" check("status" in ('pending', 'accepted', 'declined', 'expired', 'matched', 'rejected'));`);

    this.addSql(`alter table "signal_spot" add column "liked_by" jsonb not null default '[]';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "sparks" drop constraint if exists "sparks_status_check";`);

    this.addSql(`alter table "sparks" add constraint "sparks_status_check" check("status" in ('pending', 'accepted', 'declined', 'expired', 'matched'));`);

    this.addSql(`alter table "signal_spot" drop column "liked_by";`);
  }

}
