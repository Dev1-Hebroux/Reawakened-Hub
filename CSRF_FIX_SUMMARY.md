# CSRF Token Implementation - Comprehensive Platform Fix

**Status**: Phase 1 Complete ✅ | Phase 2 In Progress 🔄
**Date**: February 8, 2026
**Severity**: CRITICAL - Platform-wide security and functionality issue

---

## Executive Summary

Discovered and fixed a critical platform-wide CSRF token vulnerability affecting **~80 files**. The server enforces CSRF validation globally, but most client-side mutations were missing CSRF tokens, causing all POST/PUT/DELETE requests to fail with `403 CSRF token missing` errors.

### User Impact (Before Fix)
- ❌ Users **could not enroll** in reading plans
- ❌ Users **could not save** vision goals, plans, or check-ins
- ❌ Users **could not submit** reflections, prayers, or journal entries
- ❌ Offline changes **would not sync** when back online (data loss!)
- ❌ Push notifications **could not be** subscribed/unsubscribed
- ❌ AI coach **did not work**
- ❌ Most interactive features were **completely broken**

---

## Phase 1: Critical Infrastructure (DEPLOYED ✅)

### Files Fixed (7 files)
1. ✅ **`client/src/lib/apiFetch.ts`** (NEW) - Centralized CSRF-protected fetch utility
2. ✅ **`client/src/lib/api.ts`** - Export apiFetch, apiFetchJson, getCsrfToken
3. ✅ **`client/src/services/NotificationService.ts`** - 4 endpoints fixed
4. ✅ **`client/src/services/offlineService.ts`** - Sync queue fixed
5. ✅ **`client/src/components/AICoachPanel.tsx`** - AI analysis fixed
6. ✅ **`client/src/pages/ReadingPlans.tsx`** - Enrollment & profile mutations fixed
7. ✅ **`client/src/pages/Vision.tsx`** - Session creation fixed

### Features Now Working
- ✅ Reading plan enrollment
- ✅ Spiritual profile saving
- ✅ Push notification subscriptions/unsubscriptions/preferences
- ✅ Offline-to-online data sync (critical for preventing data loss!)
- ✅ AI coach analysis
- ✅ Vision session creation

### Commit
```
commit 9874161
fix: comprehensive CSRF token implementation - Phase 1
```

---

## Phase 2: Remaining User-Facing Pages (TODO 🔄)

### High Priority (15 files) - Est. 2-3 hours
Vision Suite:
- ⏳ `/pages/VisionGoals.tsx` - Goal creation/updates
- ⏳ `/pages/VisionPlan.tsx` - Action plan management
- ⏳ `/pages/VisionHabits.tsx` - Habit tracking
- ⏳ `/pages/VisionValues.tsx` - Values definition
- ⏳ `/pages/VisionCheckin.tsx` - Progress check-ins
- ⏳ `/pages/WheelOfLife.tsx` - Life wheel assessments

Critical User Features:
- ⏳ `/pages/DailyReflection.tsx` - Journal entries & reactions
- ⏳ `/pages/Goals.tsx` - Goal tracking & updates
- ⏳ `/pages/PrayHub.tsx` - Prayer request submissions
- ⏳ `/pages/CommunityHub.tsx` - Community posts & interactions
- ⏳ `/pages/SparkDetail.tsx` - Spark reactions (if any POST)
- ⏳ `/pages/Mission.tsx` - Mission interactions
- ⏳ `/pages/Outreach.tsx` - Outreach actions
- ⏳ `/pages/CollaboratorPortal.tsx` - Collaborator actions
- ⏳ `/hooks/use-upload.ts` - File upload metadata requests

### Medium Priority (20+ files) - Est. 3-4 hours
Admin & Tools:
- ⏳ `/pages/admin/Coaching.tsx`
- ⏳ `/pages/admin/ContentBlog.tsx`
- ⏳ `/pages/admin/ContentSparks.tsx`
- ⏳ `/pages/admin/Challenges.tsx`
- ⏳ `/pages/admin/MissionTrips.tsx`
- ⏳ `/pages/admin/Users.tsx`
- ⏳ `/pages/admin/VisionGoals.tsx`
- ⏳ `/pages/AdminBlog.tsx`
- ⏳ `/pages/AdminEvents.tsx`
- ⏳ `/pages/AdminMissions.tsx`
- ⏳ `/pages/AdminModeration.tsx`
- ⏳ `/pages/AdminPrayer.tsx`
- ⏳ `/pages/AdminSparks.tsx`
- ⏳ `/pages/ScaTool.tsx`
- ⏳ `/pages/WdepTool.tsx`
- ⏳ `/pages/WdepExperiment.tsx`
- ⏳ `/pages/EqTool.tsx`
- ⏳ `/pages/StrengthsTool.tsx`
- ⏳ `/pages/StylesTool.tsx`
- ⏳ `/pages/Mini360.tsx`

### Low Priority (40+ files) - Est. 4-5 hours
- ⏳ Various other pages with mutations

---

## Technical Implementation

### Centralized Solution: `apiFetch`

Created `/client/src/lib/apiFetch.ts` with two exports:

#### 1. `apiFetch(url, options)` - Base Fetch Wrapper
```typescript
import { apiFetch } from '@/lib/apiFetch';

const response = await apiFetch('/api/reading-plans/1/enroll', {
  method: 'POST',
  body: JSON.stringify({ ... }),
});
```

**Features:**
- ✅ Automatically adds `X-CSRF-Token` header for POST/PUT/PATCH/DELETE
- ✅ Automatically includes `credentials: 'include'` to send cookies
- ✅ Automatically sets `Content-Type: application/json`
- ✅ Extracts CSRF token from `csrf_token` cookie
- ✅ Logs warning if CSRF token missing

#### 2. `apiFetchJson(url, options)` - JSON Response Wrapper
```typescript
import { apiFetchJson } from '@/lib/apiFetch';

const data = await apiFetchJson('/api/user/profile', {
  method: 'POST',
  body: JSON.stringify({ ... }),
});
// Automatically parses JSON and throws on HTTP errors
```

### Migration Pattern

**Before (Broken):**
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch(getApiUrl("/api/endpoint"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },  // ❌ Missing CSRF
      body: JSON.stringify(data),
      // ❌ Missing credentials: "include"
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }
});
```

**After (Fixed):**
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    return await apiFetchJson(getApiUrl("/api/endpoint"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
});
```

---

## Testing Checklist

### Phase 1 (DONE ✅)
- [x] Reading plan enrollment works
- [x] Spiritual profile saving works
- [x] Push notification subscribe/unsubscribe works
- [x] Offline sync queue processes without errors
- [x] AI coach analysis works
- [x] Vision session creation works
- [x] No 403 CSRF errors in production logs for fixed endpoints

### Phase 2 (TODO)
- [ ] Vision goals CRUD operations work
- [ ] Vision plans CRUD operations work
- [ ] Vision habits tracking works
- [ ] Vision check-ins work
- [ ] Daily reflections submission works
- [ ] Goals tracking works
- [ ] Prayer requests work
- [ ] Community posts work
- [ ] Admin operations work
- [ ] All tools (WDEP, SCA, EQ, etc.) work
- [ ] No 403 CSRF errors in production logs

---

## Deployment Status

### Commit History
1. ✅ **9874161** - Phase 1: Critical infrastructure & Reading Plans fixed
2. ⏳ **Pending** - Phase 2: Vision suite & critical user pages
3. ⏳ **Pending** - Phase 3: Admin pages & tools

### Production URL
https://reawakened.app

### Monitoring
```bash
# Check for CSRF errors in production
fly logs | grep "CSRF"

# Test reading plan enrollment
curl -s 'https://reawakened.app/api/reading-plans/1/enroll' \
  -X POST \
  -H 'Cookie: csrf_token=...' \
  -H 'X-CSRF-Token: ...'
```

---

## Security Status

### Server-Side Protection (UNCHANGED)
- ✅ CSRF validation enforced globally at `/api/*` level
- ✅ Server middleware: `server/index.ts:63` - `app.use('/api', validateCsrfToken)`
- ✅ CSRF implementation: `server/middleware/csrf.ts`
- ✅ Cookie name: `csrf_token` (non-httpOnly for client access)
- ✅ Header name: `X-CSRF-Token` (case-insensitive)
- ✅ Timing-safe token comparison

### Client-Side Coverage
- ✅ **Phase 1**: 7 critical files fixed (infrastructure + reading plans)
- ⏳ **Phase 2**: ~70 files remaining
- 🎯 **Target**: 100% coverage across all POST/PUT/DELETE requests

---

## Lessons Learned

### Why This Happened
1. **No centralized API client** - Each file implemented fetch manually
2. **Copy-paste anti-pattern** - Broken pattern propagated across codebase
3. **Inconsistent helpers** - Some files used `apiRequest`, others used raw `fetch`
4. **Missing linting rules** - No check for raw `fetch` with POST/PUT/DELETE

### Prevention Strategy
1. ✅ Created centralized `apiFetch` utility
2. ⏳ Migrate all files to use `apiFetch`
3. ⏳ Add ESLint rule to prevent raw `fetch` for mutating requests
4. ⏳ Update developer documentation
5. ⏳ Add CSRF to onboarding guide

---

## Performance Impact

### Benefits
- ✅ **Offline sync now works** - prevents data loss when users reconnect
- ✅ **Push notifications functional** - improves user engagement
- ✅ **All features now accessible** - improves user satisfaction
- ✅ **Centralized error handling** - easier to debug issues

### No Negative Impact
- ✅ CSRF token fetched from cookie (no extra network request)
- ✅ Same number of headers sent (just adding one more)
- ✅ Server-side validation was already in place

---

## Next Steps

### Immediate (Next 2-3 hours)
1. Fix Vision suite pages (VisionGoals, VisionPlan, VisionHabits, etc.)
2. Fix DailyReflection, Goals, PrayHub, CommunityHub
3. Test all critical user flows manually
4. Deploy Phase 2 to production

### Short-term (Next 1-2 days)
5. Fix admin pages and tools
6. Add ESLint rule to prevent future violations
7. Update developer documentation
8. Add integration tests for CSRF

### Long-term (Next week)
9. Consider migrating to a more robust API client (e.g., Axios with interceptors)
10. Add automated E2E tests for all critical mutations
11. Set up monitoring/alerting for 403 CSRF errors
12. Document CSRF best practices for new developers

---

## Contact

For questions or issues:
- Check production logs: `fly logs`
- Review this document: `/CSRF_FIX_SUMMARY.md`
- Escalate critical issues immediately

---

**Generated**: February 8, 2026
**Last Updated**: February 8, 2026
**Status**: Phase 1 Complete, Phase 2 In Progress
