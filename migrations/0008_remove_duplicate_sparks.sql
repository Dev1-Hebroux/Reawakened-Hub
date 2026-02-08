-- Remove Duplicate Sparks Migration
-- Fixes data integrity issue where multiple devotionals exist for the same date
-- Keeps only the most recently created spark for each (daily_date, audience_segment) pair
-- Adds unique constraint to prevent future duplicates

-- ============================================================================
-- 1. Identify and Delete Duplicate Sparks
-- ============================================================================

-- For each (daily_date, audience_segment) combination, keep only the spark with the highest created_at
-- This ensures we keep the most recently added content and delete older duplicates

WITH ranked_sparks AS (
  SELECT
    id,
    daily_date,
    audience_segment,
    title,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY daily_date, COALESCE(audience_segment, '')
      ORDER BY created_at DESC, id DESC
    ) as rn
  FROM sparks
  WHERE status IN ('published', 'scheduled')
),
sparks_to_delete AS (
  SELECT id, title, daily_date, audience_segment, created_at
  FROM ranked_sparks
  WHERE rn > 1
)
DELETE FROM sparks
WHERE id IN (SELECT id FROM sparks_to_delete);

-- ============================================================================
-- 2. Add Unique Constraint to Prevent Future Duplicates
-- ============================================================================

-- Create a unique index on (daily_date, audience_segment)
-- This prevents multiple sparks from being scheduled for the same date and audience
-- Note: We use COALESCE to handle NULL audience_segment values
CREATE UNIQUE INDEX IF NOT EXISTS idx_sparks_daily_date_audience_unique
ON sparks(daily_date, COALESCE(audience_segment, ''))
WHERE status IN ('published', 'scheduled');

-- ============================================================================
-- 3. Verify Data Integrity
-- ============================================================================

-- This query should return 0 rows after the migration
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO duplicate_count
  FROM (
    SELECT daily_date, COALESCE(audience_segment, '') as segment, COUNT(*) as cnt
    FROM sparks
    WHERE status IN ('published', 'scheduled')
    GROUP BY daily_date, COALESCE(audience_segment, '')
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % date/audience combinations with duplicates after cleanup', duplicate_count;
  ELSE
    RAISE NOTICE 'Data integrity verified: No duplicates found';
  END IF;
END $$;

-- ============================================================================
-- 4. Analyze Table
-- ============================================================================

ANALYZE sparks;
