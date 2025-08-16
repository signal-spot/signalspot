import { Migration } from '@mikro-orm/migrations';

export class Migration20250810103000 extends Migration {

  async up(): Promise<void> {
    // Fix the comments table liked_by column to use JSONB properly
    this.addSql(`
      ALTER TABLE comments 
      ALTER COLUMN liked_by TYPE jsonb 
      USING CASE 
        WHEN liked_by IS NULL OR liked_by = '' THEN '[]'::jsonb
        ELSE liked_by::jsonb
      END
    `);
    
    // Set default value for liked_by
    this.addSql(`
      ALTER TABLE comments 
      ALTER COLUMN liked_by SET DEFAULT '[]'::jsonb
    `);
    
    // Update any NULL values to empty array
    this.addSql(`
      UPDATE comments 
      SET liked_by = '[]'::jsonb 
      WHERE liked_by IS NULL
    `);
    
    // Add indexes for better performance
    this.addSql('CREATE INDEX IF NOT EXISTS idx_comments_spot_id ON comments(spot_id);');
    this.addSql('CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);');
    this.addSql('CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);');
    
    // Add indexes for signal_spots table performance
    this.addSql('CREATE INDEX IF NOT EXISTS idx_signal_spots_location ON signal_spots USING GIST(location);');
    this.addSql('CREATE INDEX IF NOT EXISTS idx_signal_spots_status ON signal_spots(status);');
    this.addSql('CREATE INDEX IF NOT EXISTS idx_signal_spots_expires_at ON signal_spots(expires_at);');
    this.addSql('CREATE INDEX IF NOT EXISTS idx_signal_spots_created_at ON signal_spots(created_at DESC);');
    this.addSql('CREATE INDEX IF NOT EXISTS idx_signal_spots_user_id ON signal_spots(user_id);');
  }

  async down(): Promise<void> {
    // Revert liked_by column
    this.addSql(`
      ALTER TABLE comments 
      ALTER COLUMN liked_by TYPE text 
      USING liked_by::text
    `);
    
    // Drop indexes
    this.addSql('DROP INDEX IF EXISTS idx_comments_spot_id;');
    this.addSql('DROP INDEX IF EXISTS idx_comments_author_id;');
    this.addSql('DROP INDEX IF EXISTS idx_comments_created_at;');
    this.addSql('DROP INDEX IF EXISTS idx_signal_spots_location;');
    this.addSql('DROP INDEX IF EXISTS idx_signal_spots_status;');
    this.addSql('DROP INDEX IF EXISTS idx_signal_spots_expires_at;');
    this.addSql('DROP INDEX IF EXISTS idx_signal_spots_created_at;');
    this.addSql('DROP INDEX IF EXISTS idx_signal_spots_user_id;');
  }

}