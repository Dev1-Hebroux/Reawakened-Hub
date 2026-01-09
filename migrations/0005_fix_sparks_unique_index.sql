-- Fix sparks unique content index type mismatch
-- Drops the problematic index and recreates it with correct operator classes

-- Drop the malformed index if it exists
DROP INDEX IF EXISTS sparks_unique_content_idx;

-- Recreate without explicit operator classes (PostgreSQL will use correct defaults)
CREATE UNIQUE INDEX IF NOT EXISTS sparks_unique_content_idx 
ON sparks(title, daily_date, COALESCE(audience_segment, ''));
