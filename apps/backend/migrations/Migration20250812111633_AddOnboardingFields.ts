import { Migration } from '@mikro-orm/migrations';

export class Migration20250812111633_AddOnboardingFields extends Migration {

  override async up(): Promise<void> {
    // Add new columns for onboarding
    this.addSql(`alter table "user" add column if not exists "profile_completed" boolean not null default false;`);
    this.addSql(`alter table "user" add column if not exists "is_phone_verified" boolean not null default false;`);
    this.addSql(`alter table "user" add column if not exists "display_name" varchar(255) null;`);
    
    // Update existing users to have correct values
    this.addSql(`update "user" set "profile_completed" = true where status = 'verified';`);
    this.addSql(`update "user" set "is_phone_verified" = true where phone_number is not null;`);
    
    // Note: UserStatus enum is handled as varchar in the database, not a PostgreSQL enum type
    // The new status values 'pending' and 'pending_profile' will work automatically
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "profile_completed", drop column "is_phone_verified", drop column "display_name";`);
  }

}
