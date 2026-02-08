# Reawakened Platform Documentation

**Last Updated**: February 8, 2026

---

## 📚 Documentation Structure

### `/database/`
Database-related documentation including schema, migrations, and optimization guides.

- [INDEX_CLEANUP_SCHEDULE.md](database/INDEX_CLEANUP_SCHEDULE.md) - Index maintenance and cleanup schedule

### `/monitoring/`
Performance monitoring, observability, and health check documentation.

- [RLS_MONITORING_GUIDE.md](monitoring/RLS_MONITORING_GUIDE.md) - Comprehensive RLS performance monitoring guide
  - pg_stat_statements setup
  - Slow query identification
  - Index usage analysis
  - Weekly monitoring checklist

### `/incidents/`
Incident reports, postmortems, and resolution documentation.

- [2026-02-08-duplicate-devotionals-fix.md](incidents/2026-02-08-duplicate-devotionals-fix.md) - Duplicate devotionals incident report
  - Root cause analysis
  - Resolution steps
  - Lessons learned

---

## 🔍 Quick Reference

### Recent Changes (Feb 8, 2026)

#### Database
- **Migration 0007**: RLS policies and comprehensive indexes
  - 153 indexes on user_id columns
  - 32 RLS policies with optimized subquery patterns
  - 17 tables with FORCE RLS enabled

- **Migration 0008**: Remove duplicate sparks
  - Deleted 408 duplicate devotionals
  - Added unique constraint on (daily_date, audience_segment)
  - Restored data integrity (264 sparks for 44 dates)

#### Performance
- **Expected Improvements**:
  - Dashboard queries: 60% faster (280ms → 100ms)
  - Spark detail pages: 67% faster (150ms → 50ms)
  - User profile: 60% faster (200ms → 80ms)

#### Security
- **Row Level Security (RLS)**: Fully deployed
  - User data isolation enforced at database level
  - Protection against SQL injection bypassing app logic
  - Session-based user context via middleware

---

## 📋 Monitoring Schedule

### Daily (Week 1-2)
- [ ] Check application logs for RLS errors
- [ ] Monitor API response times
- [ ] Review slow query reports

### Weekly
- [ ] Run index usage analysis
- [ ] Review pg_stat_statements
- [ ] Update performance benchmarks

### Monthly
- [ ] Comprehensive performance review
- [ ] Index cleanup (remove unused)
- [ ] Update documentation

---

## 🚨 Incident Response

### Reporting
1. Check [/incidents/](incidents/) for similar past issues
2. Review [monitoring guide](monitoring/RLS_MONITORING_GUIDE.md) for diagnostics
3. Create new incident report in `/incidents/`

### Escalation
- **Database Issues**: Supabase Dashboard → Logs
- **Performance Issues**: pg_stat_statements → Slow queries
- **RLS Issues**: Check middleware logs → Session context

---

## 🔗 External Resources

### PostgreSQL
- [RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)
- [Index Optimization](https://www.postgresql.org/docs/current/indexes.html)

### Supabase
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Performance Best Practices](https://supabase.com/docs/guides/database/performance)
- [Dashboard](https://supabase.com/dashboard)

### Project Resources
- [Main README](../README.md)
- [Database Schema](../db/schema.ts)
- [Migrations](../migrations/)

---

## 📝 Contributing to Documentation

### Adding New Documents
1. Place in appropriate directory (`/database/`, `/monitoring/`, `/incidents/`)
2. Use descriptive filenames with dates for incidents
3. Update this README with links and descriptions
4. Follow existing markdown formatting

### Updating Existing Documents
1. Update "Last Updated" date at top of document
2. Document changes in relevant incident report or changelog
3. Update related cross-references

### Document Templates
- Incident Report: See [2026-02-08-duplicate-devotionals-fix.md](incidents/2026-02-08-duplicate-devotionals-fix.md)
- Monitoring Guide: See [RLS_MONITORING_GUIDE.md](monitoring/RLS_MONITORING_GUIDE.md)
- Database Changes: See [INDEX_CLEANUP_SCHEDULE.md](database/INDEX_CLEANUP_SCHEDULE.md)

---

## 🎯 Next Documentation Priorities

1. [ ] API endpoint documentation
2. [ ] RLS policy reference guide
3. [ ] Deployment runbook
4. [ ] Backup and recovery procedures
5. [ ] Monitoring dashboard setup guide

---

**Maintained By**: Development & DevOps Teams
**Review Frequency**: Monthly
**Next Review**: March 8, 2026
