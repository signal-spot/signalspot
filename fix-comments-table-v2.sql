-- First, drop the existing column
ALTER TABLE comments DROP COLUMN IF EXISTS liked_by;

-- Add it back as JSONB
ALTER TABLE comments 
ADD COLUMN liked_by jsonb DEFAULT '[]'::jsonb;

-- Update like_count to ensure it's consistent
UPDATE comments SET like_count = 0 WHERE like_count IS NULL;

-- Add performance indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_comments_spot_id ON comments(spot_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Add indexes for signal_spots table too
CREATE INDEX IF NOT EXISTS idx_signal_spots_location ON signal_spots USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_signal_spots_status ON signal_spots(status);
CREATE INDEX IF NOT EXISTS idx_signal_spots_expires_at ON signal_spots(expires_at);
CREATE INDEX IF NOT EXISTS idx_signal_spots_created_at ON signal_spots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_spots_user_id ON signal_spots(user_id);