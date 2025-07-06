import { Migration } from '@mikro-orm/migrations';

export class Migration001AddSignalSpotTable extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE signal_spot (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID NOT NULL,
        message TEXT NOT NULL,
        title VARCHAR(100),
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        radius_in_meters INTEGER NOT NULL DEFAULT 100,
        duration_in_hours INTEGER NOT NULL DEFAULT 24,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        visibility VARCHAR(20) NOT NULL DEFAULT 'public',
        type VARCHAR(20) NOT NULL DEFAULT 'announcement',
        tags JSONB,
        view_count INTEGER NOT NULL DEFAULT 0,
        like_count INTEGER NOT NULL DEFAULT 0,
        dislike_count INTEGER NOT NULL DEFAULT 0,
        reply_count INTEGER NOT NULL DEFAULT 0,
        share_count INTEGER NOT NULL DEFAULT 0,
        report_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        
        CONSTRAINT fk_signal_spot_creator 
          FOREIGN KEY (creator_id) 
          REFERENCES "user"(id) 
          ON DELETE CASCADE
      );
    `);

    // Create indexes for performance
    this.addSql(`
      CREATE INDEX idx_signal_spot_creator ON signal_spot(creator_id);
      CREATE INDEX idx_signal_spot_location ON signal_spot(latitude, longitude);
      CREATE INDEX idx_signal_spot_status ON signal_spot(status);
      CREATE INDEX idx_signal_spot_visibility ON signal_spot(visibility);
      CREATE INDEX idx_signal_spot_type ON signal_spot(type);
      CREATE INDEX idx_signal_spot_created_at ON signal_spot(created_at);
      CREATE INDEX idx_signal_spot_expires_at ON signal_spot(expires_at);
      CREATE INDEX idx_signal_spot_is_active ON signal_spot(is_active);
      CREATE INDEX idx_signal_spot_tags ON signal_spot USING GIN(tags);
    `);

    // Create spatial index for location-based queries
    this.addSql(`
      CREATE INDEX idx_signal_spot_location_gist 
      ON signal_spot 
      USING GIST(ll_to_earth(latitude, longitude));
    `);

    // Create composite indexes for common queries
    this.addSql(`
      CREATE INDEX idx_signal_spot_active_expires 
      ON signal_spot(is_active, expires_at) 
      WHERE status = 'active';
    `);

    this.addSql(`
      CREATE INDEX idx_signal_spot_location_active 
      ON signal_spot(latitude, longitude, is_active, expires_at) 
      WHERE status = 'active';
    `);

    // Create function for distance calculation
    this.addSql(`
      CREATE OR REPLACE FUNCTION calculate_distance(
        lat1 DOUBLE PRECISION, 
        lon1 DOUBLE PRECISION, 
        lat2 DOUBLE PRECISION, 
        lon2 DOUBLE PRECISION
      ) RETURNS DOUBLE PRECISION AS $$
      BEGIN
        RETURN 6371 * acos(
          cos(radians(lat1)) * 
          cos(radians(lat2)) * 
          cos(radians(lon2) - radians(lon1)) + 
          sin(radians(lat1)) * 
          sin(radians(lat2))
        );
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`DROP FUNCTION IF EXISTS calculate_distance;`);
    this.addSql(`DROP TABLE IF EXISTS signal_spot;`);
  }
}