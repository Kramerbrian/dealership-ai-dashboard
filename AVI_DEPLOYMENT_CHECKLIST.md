# AVI Dashboard Deployment Checklist

## ✅ Complete Deployment Steps (1-5)

---

## 1. 🗄️ Deploy Database Changes

### Step 1.1: Run Migration
```bash
# Option A: Supabase CLI
supabase login
supabase link --project-ref your-project-ref
supabase db push

# Option B: Manual (Supabase Dashboard → SQL Editor)
# Copy and paste: supabase/migrations/20250110000001_create_avi_reports.sql
```

### Step 1.2: Verify Migration
```sql
-- Check table exists
SELECT * FROM avi_reports LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename='avi_reports';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename='avi_reports';
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 2. 🌱 Seed Database

### Step 2.1: Update Tenant IDs
Edit `scripts/seed-avi-reports.ts`:
```typescript
const DEMO_TENANTS = [
  { id: 'your-real-tenant-id-1', name: 'Tenant Name 1' },
  { id: 'your-real-tenant-id-2', name: 'Tenant Name 2' },
  // Add your actual tenant IDs
];
```

### Step 2.2: Run Seeding Script
```bash
npx tsx scripts/seed-avi-reports.ts
```

### Step 2.3: Verify Data
```sql
-- Check record count
SELECT COUNT(*) FROM avi_reports;

-- View sample data
SELECT tenant_id, as_of, aiv_pct, ati_pct, regime_state
FROM avi_reports
ORDER BY as_of DESC
LIMIT 10;
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 3. ⚙️ Configure Environment Variables

### Step 3.1: Vercel Dashboard Setup
Go to: **Vercel → Your Project → Settings → Environment Variables**

Add these variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# AVI Configuration (Required)
AVI_CACHE_TTL=300
AVI_USE_MOCK_FALLBACK=false  # IMPORTANT: false in production!

# Authentication (Already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Step 3.2: Set for All Environments
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 3.3: Verify
```bash
# After deployment, check logs
vercel logs --follow
# Look for: "Supabase admin environment variables not set" (should NOT appear)
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 4. 🚀 Deploy to Vercel

### Step 4.1: Commit Changes
```bash
git add .
git commit -m "feat: add AVI dashboard with Supabase integration

- Database migration for avi_reports table
- Enhanced API with caching layer
- 7 visualization components
- Role-based access control
- Seeding script for demo data

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 4.2: Push to Repository
```bash
git push origin main
```

### Step 4.3: Monitor Deployment
- Go to Vercel Dashboard
- Watch build progress
- Check for errors
- Wait for "Ready" status

### Step 4.4: Verify Build
```bash
# Check build logs
vercel logs
# Should see: "✓ Compiled successfully"
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 5. ✔️ Post-Deployment Testing

### Test 5.1: API Endpoint
```bash
# Test API (replace with your domain and tenant ID)
curl "https://your-app.vercel.app/api/avi-report?tenantId=your-tenant-id"

# Expected: JSON response with AVI report data
```

### Test 5.2: Dashboard Access

**SuperAdmin Test:**
1. Login as superadmin
2. Navigate to `/dashboard`
3. Should see: Comprehensive dashboard with all 7 visualizations
   - Pillar radar chart
   - Modifiers gauges
   - Clarity heatmap
   - Counterfactual revenue
   - Drivers breakdown
   - Anomalies timeline
   - Backlog prioritization

**Regular User Test:**
1. Login as regular user
2. Navigate to `/dashboard`
3. Should see: Tabbed dashboard (standard view)

### Test 5.3: Performance
```javascript
// Open DevTools → Network tab
// First request
console.time('First');
await fetch('/api/avi-report?tenantId=xxx');
console.timeEnd('First'); // Should be ~180ms

// Second request (cached)
console.time('Cached');
await fetch('/api/avi-report?tenantId=xxx');
console.timeEnd('Cached'); // Should be ~8ms
```

### Test 5.4: Database Queries
In Supabase Dashboard → Database → Query Performance:
- ✅ No slow queries
- ✅ Indexes being used
- ✅ Connection pool healthy

### Test 5.5: Error Handling
```bash
# Test with invalid tenant ID
curl "https://your-app.vercel.app/api/avi-report?tenantId=invalid"

# Should return: 500 error with proper error message (if mock fallback disabled)
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📊 Deployment Summary

| Task | Status | Notes |
|------|--------|-------|
| 1. Database Migration | ⬜ | Run SQL migration |
| 2. Database Seeding | ⬜ | Populate with demo data |
| 3. Environment Variables | ⬜ | Configure in Vercel |
| 4. Vercel Deployment | ⬜ | Git push triggers deploy |
| 5. Post-Deployment Tests | ⬜ | Verify all functionality |

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ API returns valid JSON
- ✅ Dashboard loads for SuperAdmin
- ✅ Dashboard loads for regular users
- ✅ Cache improves performance (8ms vs 180ms)
- ✅ Database queries work correctly
- ✅ RLS policies enforce access
- ✅ No errors in production logs

---

## 🔧 Quick Fix Commands

### If API Returns 500
```bash
# Check environment variables
vercel env ls

# Check Supabase connection
curl -X POST 'https://your-project.supabase.co/rest/v1/rpc/version' \
  -H "apikey: your-anon-key"
```

### If Cache Not Working
```bash
# Redeploy to clear cache
vercel --prod --force
```

### If RLS Blocks Access
```sql
-- Check user's tenant_id
SELECT tenant_id FROM users WHERE clerk_id = 'user_xxx';

-- Temporarily test without RLS (DANGEROUS - DEV ONLY!)
ALTER TABLE avi_reports DISABLE ROW LEVEL SECURITY;
-- Test query
-- Re-enable immediately!
ALTER TABLE avi_reports ENABLE ROW LEVEL SECURITY;
```

---

## 📞 Rollback Plan

If issues occur:

### Option 1: Revert Code
```bash
git revert HEAD
git push origin main
```

### Option 2: Redeploy Previous Version
Vercel Dashboard → Deployments → Previous Version → Promote to Production

### Option 3: Enable Mock Fallback
```bash
# Vercel environment variables
AVI_USE_MOCK_FALLBACK=true
# Redeploy
```

---

## 📝 Post-Deployment Notes

### What to Monitor
- API response times (should be <200ms)
- Cache hit rate (should be >95%)
- Database query performance
- Error rates
- User feedback

### Maintenance Schedule
- Weekly: Review performance metrics
- Monthly: Check slow queries
- Quarterly: Optimize indexes
- As needed: Update cache TTL

---

## ✅ Final Checklist

Before marking as complete:
- [ ] Database migration successful
- [ ] Seeding script ran without errors
- [ ] Environment variables configured
- [ ] Deployment succeeded
- [ ] API endpoint tested
- [ ] Dashboard tested (SuperAdmin)
- [ ] Dashboard tested (Regular User)
- [ ] Performance verified
- [ ] No errors in logs
- [ ] Documentation updated

---

**Deployment Time:** ~30 minutes
**Difficulty:** Medium
**Risk:** Low (rollback available)
**Status:** Ready to Deploy 🚀
