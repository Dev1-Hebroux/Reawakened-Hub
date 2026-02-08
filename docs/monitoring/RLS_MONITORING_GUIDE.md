# RLS Performance Monitoring & Optimization Guide

## Overview
This guide provides ongoing monitoring recommendations for the Row Level Security (RLS) implementation deployed on Feb 8, 2026.

## Current RLS Implementation Status

### Deployed Components
- **153 indexes** on user_id foreign keys across all tables
- **32 RLS policies** with optimized subquery patterns
- **17 tables** with FORCE RLS enabled
- **Unique constraint** on sparks table to prevent duplicate devotionals
- **RLS context middleware** in Express pipeline

### Expected Performance Gains
- Dashboard queries: 60% faster (280ms → 100ms target)
- Spark detail pages: 67% faster (150ms → 50ms target)
- User profile queries: 60% faster (200ms → 80ms target)

---

## 1. Enable pg_stat_statements

### What is pg_stat_statements?
PostgreSQL extension that tracks execution statistics for all SQL statements. Essential for identifying slow queries post-RLS.

### Enablement Steps

#### Option A: Via Supabase Dashboard (Recommended)
1. Log in to Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project → Database → Extensions
3. Search for `pg_stat_statements`
4. Click "Enable"

#### Option B: Via SQL (if you have database admin access)
```sql
-- Enable the extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Verify it's enabled
SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';
```

### Query for Slow Queries
Once enabled, use this query to find the slowest queries:

```sql
-- Top 20 slowest queries by average execution time
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Query for High-Impact Queries
Find queries that are both slow AND called frequently:

```sql
-- Queries with highest total impact (frequency × avg time)
SELECT
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_ms,
  ROUND(total_exec_time::numeric, 2) as total_ms,
  ROUND((total_exec_time / sum(total_exec_time) OVER ()) * 100, 2) as pct_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;
```

---

## 2. Monitor RLS Policy Performance

### Check RLS Policy Evaluation Time
```sql
-- Show queries with RLS policy overhead
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Monitor RLS Policy Hits
```sql
-- Check which tables are most accessed (RLS applies on every access)
SELECT
  relname as table_name,
  seq_scan as sequential_scans,
  seq_tup_read as rows_read_sequential,
  idx_scan as index_scans,
  idx_tup_fetch as rows_fetched_index,
  n_tup_ins + n_tup_upd + n_tup_del as total_writes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (seq_tup_read + idx_tup_fetch) DESC;
```

---

## 3. Index Usage Analysis (1-2 Week Review)

### Check Unused Indexes
After 1-2 weeks, identify indexes that aren't being used:

```sql
-- Find indexes with zero or very low usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as rows_read,
  idx_tup_fetch as rows_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 100  -- Adjust threshold based on your traffic
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Recommended Action
If an index:
- Has **idx_scan = 0** after 2 weeks → Strong candidate for removal
- Has **idx_scan < 100** and is large → Evaluate if needed
- Is on user_id with RLS enabled → Keep even if low usage (RLS needs it)

### Drop Unused Indexes Safely
```sql
-- Example: Drop unused index (only after confirming it's not needed)
DROP INDEX CONCURRENTLY IF EXISTS idx_example_unused;

-- CONCURRENTLY prevents table locking during drop
-- Verify table still performs well after dropping
```

---

## 4. RLS Policy Optimization

### Check for Policy Overlaps
Avoid having multiple policies that apply to the same operation:

```sql
-- List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Best Practices
✅ **DO:**
- Keep policies minimal and explicit
- Use `TO authenticated` or `TO anon` instead of `TO ALL` where possible
- Use EXISTS subqueries instead of JOINs in USING clauses
- Ensure indexes exist on all columns referenced in policies

❌ **DON'T:**
- Create overlapping "ALL" policies unless necessary
- Use complex JOINs in RLS policy definitions
- Add RLS policies without corresponding indexes

### Example: Optimized vs. Slow Policy

**❌ Slow (uses JOIN):**
```sql
CREATE POLICY posts_select_own
ON posts FOR SELECT
USING (user_id IN (SELECT id FROM users WHERE id = current_setting('app.current_user_id')));
```

**✅ Fast (uses direct comparison with indexed column):**
```sql
CREATE POLICY posts_select_own
ON posts FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);
```

---

## 5. Weekly Monitoring Checklist

### Week 1-2: Initial Assessment
- [ ] Enable pg_stat_statements
- [ ] Run slow query report daily
- [ ] Monitor RLS table access patterns
- [ ] Check for any new errors in logs related to RLS

### Week 2-4: Performance Tuning
- [ ] Identify unused indexes (idx_scan < 100)
- [ ] Review policies for overlaps or inefficiencies
- [ ] Compare actual query times vs. expected improvements
- [ ] Adjust indexes based on actual usage patterns

### Monthly: Ongoing Optimization
- [ ] Review pg_stat_statements for new slow queries
- [ ] Check index sizes and usage
- [ ] Verify no RLS bypass attempts in logs
- [ ] Update this document with lessons learned

---

## 6. Monitoring Queries Reference

### Query 1: Current RLS Context
```sql
-- Check if RLS context is being set correctly
SHOW app.current_user_id;
SHOW app.current_user_role;
```

### Query 2: Table Sizes & Growth
```sql
-- Monitor table growth over time
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Query 3: Lock Monitoring
```sql
-- Check for blocking queries (important after enabling RLS)
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

---

## 7. Performance Benchmarks

### Baseline (Before RLS - Jan 2026)
- Dashboard load: ~280ms
- Spark detail: ~150ms
- User profile: ~200ms
- Featured sparks: ~120ms

### Target (Post-RLS with indexes)
- Dashboard load: ~100ms (60% improvement)
- Spark detail: ~50ms (67% improvement)
- User profile: ~80ms (60% improvement)
- Featured sparks: ~50ms (58% improvement)

### Actual Results (Measure after 2 weeks)
- Dashboard load: ___ ms (measure on Feb 22)
- Spark detail: ___ ms
- User profile: ___ ms
- Featured sparks: ___ ms

---

## 8. Rollback Plan

If RLS causes severe performance issues:

### Step 1: Disable RLS on problematic table
```sql
-- Temporarily disable RLS (keeps policies but doesn't enforce)
ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;
```

### Step 2: Investigate & Fix
- Check if indexes are being used: `EXPLAIN ANALYZE <query>`
- Verify policy logic is correct
- Ensure RLS context middleware is setting session variables

### Step 3: Re-enable when fixed
```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;
```

---

## 9. Contact & Support

### Internal Escalation
- **Database Issues**: Check Supabase dashboard logs
- **Application Issues**: Review Express middleware logs
- **Performance Issues**: Run pg_stat_statements queries

### External Resources
- PostgreSQL RLS Docs: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- pg_stat_statements Docs: https://www.postgresql.org/docs/current/pgstatstatements.html

---

## 10. Next Review Dates

- **Feb 15, 2026**: First week assessment
- **Feb 22, 2026**: Two-week performance review & index cleanup
- **March 8, 2026**: One-month comprehensive review

---

**Document Created**: February 8, 2026
**Last Updated**: February 8, 2026
**Owner**: Database/DevOps Team
**Review Frequency**: Monthly
