-- Fix comments table liked_by column
ALTER TABLE comments 
ALTER COLUMN liked_by TYPE jsonb 
USING CASE 
  WHEN liked_by IS NULL OR liked_by = '' OR liked_by = '[]' THEN '[]'::jsonb
  ELSE liked_by::jsonb
END;

-- Set default value
ALTER TABLE comments 
ALTER COLUMN liked_by SET DEFAULT '[]'::jsonb;

-- Update any NULL values
UPDATE comments 
SET liked_by = '[]'::jsonb 
WHERE liked_by IS NULL;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_spot_id ON comments(spot_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);