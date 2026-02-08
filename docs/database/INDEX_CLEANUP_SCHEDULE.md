# Index Cleanup & Optimization Schedule

**Purpose**: Track and optimize database indexes post-RLS deployment
**RLS Deployment Date**: February 8, 2026
**Total Indexes Added**: 153 (user_id columns)
**Review Schedule**: Weekly for 1 month, then monthly

---

## Index Categories

### Critical Indexes (Never Remove)
These indexes are essential for RLS policy evaluation:
- `idx_*_user_id` on tables with RLS policies
- `idx_sparks_daily_date_audience_unique` (data integrity constraint)
- Primary key indexes
- Foreign key indexes with high usage

### Candidate for Removal After Analysis
Indexes that may be removed if usage is low after 2 weeks:
- Indexes with `idx_scan = 0` (never used)
- Large indexes with `idx_scan < 100` and no RLS dependency
- Duplicate/redundant indexes

---

## Review Schedule

### Week 1 (Feb 8-15, 2026)
**Status**: 🟡 In Progress

**Tasks**:
- [x] Deploy 153 RLS-related indexes
- [ ] Enable pg_stat_statements
- [ ] Baseline performance measurements
- [ ] Monitor for errors/warnings

**Query to Run**:
```sql
-- Capture initial state
SELECT
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Expected Output**: Save to file for comparison

---

### Week 2 (Feb 15-22, 2026)
**Status**: ⏳ Pending

**Tasks**:
- [ ] Run index usage analysis
- [ ] Identify indexes with idx_scan < 10
- [ ] Document potential candidates for removal
- [ ] Compare performance vs. baseline

**Query to Run**:
```sql
-- Find potentially unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as rows_read,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 10 THEN 'LOW_USAGE'
    WHEN idx_scan < 100 THEN 'MODERATE'
    ELSE 'ACTIVE'
  END as status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname NOT IN (
    SELECT indexname FROM pg_indexes
    WHERE indexdef LIKE '%PRIMARY KEY%'
    OR indexdef LIKE '%UNIQUE%'
  )
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
```

**Action Items**:
- Document all indexes with status = 'UNUSED' or 'LOW_USAGE'
- Cross-reference with RLS policies (keep if RLS-critical)
- Schedule removal for confirmed unused indexes

---

### Week 3 (Feb 22-29, 2026)
**Status**: ⏳ Pending

**Tasks**:
- [ ] Execute safe index removals (CONCURRENTLY)
- [ ] Monitor query performance after each removal
- [ ] Rollback if performance degrades
- [ ] Update documentation

**Removal Process**:
```sql
-- Safe index removal (no table locking)
BEGIN;

-- Drop the index
DROP INDEX CONCURRENTLY IF EXISTS idx_example_unused;

-- Monitor query performance for 24 hours
-- If performance degrades, recreate:
-- CREATE INDEX CONCURRENTLY idx_example_unused ON table_name(column);

COMMIT;
```

**Safety Checklist**:
- ✅ Verify index has idx_scan = 0 for 2+ weeks
- ✅ Confirm not referenced in any RLS policy
- ✅ Check not part of foreign key constraint
- ✅ Use CONCURRENTLY to avoid locks
- ✅ Monitor performance for 24 hours post-removal

---

### Week 4 (Mar 1-8, 2026)
**Status**: ⏳ Pending

**Tasks**:
- [ ] Final performance comparison
- [ ] Document indexes kept vs. removed
- [ ] Update monitoring baseline
- [ ] Create monthly review template

**Metrics to Compare**:
| Metric | Baseline (Feb 8) | Week 2 (Feb 22) | Week 4 (Mar 8) | Target |
|--------|------------------|-----------------|----------------|--------|
| Dashboard query time | 280ms | ___ ms | ___ ms | 100ms |
| Spark detail time | 150ms | ___ ms | ___ ms | 50ms |
| User profile time | 200ms | ___ ms | ___ ms | 80ms |
| Total index size | ___ MB | ___ MB | ___ MB | -10% |
| Active indexes | 153 | ___ | ___ | 120-140 |

---

## Monthly Reviews (Starting March 2026)

### Review Template
```markdown
## Monthly Index Review - [Month Year]

**Date**: [Date]
**Reviewer**: [Name]

### Metrics
- Total indexes: ___
- Unused indexes (idx_scan = 0): ___
- Low usage indexes (idx_scan < 100): ___
- Total index size: ___ MB
- Index size change: ___% vs. last month

### Actions Taken
- Removed: [list of indexes]
- Added: [list of indexes]
- Optimized: [list of indexes]

### Performance Impact
- Query time improvements: ___
- Regressions (if any): ___
- User-reported issues: ___

### Next Review
- Date: [Next review date]
- Focus areas: [Specific areas to monitor]
```

---

## Index Removal Decision Matrix

| Criteria | Weight | Score (0-5) | Notes |
|----------|--------|-------------|-------|
| idx_scan = 0 for 2+ weeks | High | ___ | Strong signal for removal |
| Large size (>10MB) | Medium | ___ | More impact if removed |
| No RLS dependency | High | ___ | Safe to remove |
| Not in foreign key | High | ___ | Safe to remove |
| Table has low write volume | Low | ___ | Less impact on writes |

**Decision Rule**:
- Total score ≥ 12 → Remove
- Total score 8-11 → Monitor for another week
- Total score < 8 → Keep

---

## Rollback Procedures

### If Performance Degrades After Index Removal

**Step 1: Identify the Issue**
```sql
-- Find slow queries after index removal
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%table_name%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Step 2: Recreate the Index**
```sql
-- Recreate index immediately
CREATE INDEX CONCURRENTLY idx_example_restored
ON table_name(column_name);
```

**Step 3: Verify Recovery**
- Re-run slow queries
- Check execution time returned to normal
- Monitor for 24 hours

**Step 4: Document**
- Update this schedule with lessons learned
- Mark index as "critical - do not remove"

---

## Reference Queries

### Show All Indexes and Usage
```sql
SELECT
  t.schemaname,
  t.tablename,
  i.indexname,
  i.idx_scan,
  pg_size_pretty(pg_relation_size(i.indexrelid)) as size,
  pg_get_indexdef(i.indexrelid) as definition
FROM pg_stat_user_indexes i
JOIN pg_stat_user_tables t ON i.relid = t.relid
WHERE t.schemaname = 'public'
ORDER BY t.tablename, i.indexname;
```

### Check RLS Policy Dependencies
```sql
-- Find which policies reference which columns
SELECT
  schemaname,
  tablename,
  policyname,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Index Bloat Check
```sql
-- Check for bloated indexes (consider rebuilding)
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND pg_relation_size(indexrelid) > 10485760  -- > 10MB
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Next Actions

### Immediate (Feb 9)
- [ ] Enable pg_stat_statements in Supabase
- [ ] Run baseline index usage query
- [ ] Save results to file

### Week 2 (Feb 15)
- [ ] Run usage analysis
- [ ] Create removal candidate list
- [ ] Schedule cleanup for Week 3

### Week 3 (Feb 22)
- [ ] Execute safe removals
- [ ] Monitor performance
- [ ] Document results

### Monthly (March 8)
- [ ] Comprehensive review
- [ ] Update baseline metrics
- [ ] Plan next month's focus

---

**Document Created**: February 8, 2026
**Last Updated**: February 8, 2026
**Next Review**: February 15, 2026
**Owner**: Database Team
