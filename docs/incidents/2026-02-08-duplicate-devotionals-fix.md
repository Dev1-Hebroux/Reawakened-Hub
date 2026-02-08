# Incident Report: Duplicate Devotionals Issue

**Date**: February 8, 2026
**Severity**: High
**Status**: Resolved
**Duration**: 2 hours (00:00 GMT - 02:20 GMT)

---

## Summary

Multiple devotionals were being served for the same date (Feb 7th), causing user confusion and incorrect content display. Investigation revealed massive data duplication across the entire sparks table.

---

## Timeline

- **00:00 GMT**: Issue reported - "3 different devotionals were served sat 7th"
- **00:15 GMT**: Investigation started - checked deployment status and API responses
- **00:30 GMT**: Root cause identified - 672 sparks for 44 dates (should be 264)
- **01:00 GMT**: Solution designed - deduplication + unique constraint
- **01:30 GMT**: Fix executed - deleted 408 duplicates
- **01:45 GMT**: Constraint added - unique index on (daily_date, audience_segment)
- **02:00 GMT**: Verification complete - 264 sparks, 0 duplicates
- **02:20 GMT**: Deployment successful - all systems operational

---

## Root Cause Analysis

### The Problem
The database contained **672 total sparks** for only **44 unique dates**, meaning an average of **15.3 sparks per date** instead of the expected 6 (one per audience segment).

### Data Breakdown
- **Expected**: 44 dates × 6 audiences = 264 sparks
- **Actual**: 672 sparks
- **Duplicates**: 408 sparks (61% of the database)

### Why It Happened
- No database constraint preventing duplicate entries for same (daily_date, audience_segment)
- Content import/seed scripts likely ran multiple times
- Each date had 2-3 complete sets of devotionals:
  - "Living Light in Darkness" (oldest, created Feb 5 01:11)
  - "Holiness Is the Home of Presence" (middle, created Feb 5 16:27)
  - "Escape What Holds You Back" (newest, created Feb 5 17:20)

### Impact
- Users saw wrong devotional for their date
- Featured content was inconsistent
- Database queries slower due to extra rows
- Potential confusion about which content was "official"

---

## Resolution

### Step 1: Data Cleanup
```sql
-- Deleted 408 duplicate sparks, keeping newest per (daily_date, audience_segment)
WITH ranked_sparks AS (
  SELECT id, daily_date, audience_segment, title, created_at,
    ROW_NUMBER() OVER (
      PARTITION BY daily_date, COALESCE(audience_segment, '')
      ORDER BY created_at DESC, id DESC
    ) as rn
  FROM sparks
  WHERE status IN ('published', 'scheduled')
),
sparks_to_delete AS (
  SELECT id FROM ranked_sparks WHERE rn > 1
)
DELETE FROM sparks WHERE id IN (SELECT id FROM sparks_to_delete);
```

**Result**: 408 rows deleted

### Step 2: Prevention
```sql
-- Added unique constraint to prevent future duplicates
CREATE UNIQUE INDEX idx_sparks_daily_date_audience_unique
ON sparks(daily_date, COALESCE(audience_segment, ''))
WHERE status IN ('published', 'scheduled');
```

**Result**: Database now enforces uniqueness

### Step 3: Verification
```sql
-- Verified no duplicates remain
SELECT daily_date, COALESCE(audience_segment, '') as segment, COUNT(*)
FROM sparks
WHERE status IN ('published', 'scheduled')
GROUP BY daily_date, COALESCE(audience_segment, '')
HAVING COUNT(*) > 1;
```

**Result**: 0 rows (no duplicates)

---

## Final State

### Database Integrity
- ✅ Total sparks: 264
- ✅ Unique dates: 44
- ✅ Sparks per date: 6 (consistent)
- ✅ Unique titles: 38
- ✅ Duplicates: 0

### API Verification
- ✅ `/api/sparks/today` - Serving correct devotional for today (Feb 8)
- ✅ `/api/sparks/featured` - Showing correct featured content (Feb 10)
- ✅ `/api/sparks/dashboard` - Historical sparks displayed correctly
- ✅ Home page - All synchronized and functional

---

## Lessons Learned

### What Went Well
- Quick identification of root cause
- Clean deduplication logic (kept newest entries)
- Permanent fix with database constraint
- Comprehensive verification before declaring resolved

### What Could Be Improved
- Should have had unique constraint from the start
- Need better monitoring to catch data anomalies earlier
- Import/seed scripts should check for existing data before inserting

### Prevention Measures
1. ✅ Database constraint added (prevents duplicates)
2. ✅ Monitoring guide created for ongoing health checks
3. 📝 TODO: Review all seed/import scripts for idempotency
4. 📝 TODO: Add data validation checks to CI/CD pipeline

---

## Related Documents

- [Migration File](../../migrations/0008_remove_duplicate_sparks.sql)
- [RLS Monitoring Guide](../monitoring/RLS_MONITORING_GUIDE.md)
- [Database Schema](../../db/schema.ts)

---

## Action Items

- [x] Remove duplicate sparks (408 deleted)
- [x] Add unique constraint
- [x] Verify data integrity
- [x] Deploy to production
- [x] Create monitoring guide
- [ ] Review import/seed scripts for idempotency (assigned: DevOps, due: Feb 15)
- [ ] Add data validation to CI/CD (assigned: DevOps, due: Feb 22)
- [ ] Enable pg_stat_statements (assigned: DBA, due: Feb 9)

---

**Resolved By**: Claude Code + Abraham
**Reviewed By**: Pending
**Sign-off**: Pending
