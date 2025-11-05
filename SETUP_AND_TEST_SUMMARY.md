# Trial System - Setup & Test Summary

## 📋 Current Status

✅ **Code Implementation:** Complete
- Migration SQL file created
- API endpoints implemented
- Drawer guards integrated
- Pricing page connected
- Client utilities ready

⚠️ **Configuration Needed:**
- Supabase migration not yet applied
- Environment variables need real values

## 🚀 Quick Start (3 Steps)

### Step 1: Apply Migration (5 minutes)

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard → Your Project
   ```

2. **Go to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Migration:**
   - Open: `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
   - Copy entire file contents
   - Paste into SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)
   - ✅ Should see "Success" message

4. **Verify Tables:**
   - Go to "Table Editor"
   - Should see: `telemetry` and `trial_features` tables

### Step 2: Configure Environment (2 minutes)

1. **Edit `.env.local`:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

2. **Find Your Keys:**
   - Supabase Dashboard → Settings → API
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "service_role" key (NOT anon key) → `SUPABASE_SERVICE_KEY`

3. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Step 3: Test (5 minutes)

1. **Test API:**
   ```bash
   ./scripts/test-trial-system.sh
   ```

2. **Test Pricing Page:**
   - Navigate: http://localhost:3000/pricing
   - Click "Borrow a Pro feature for 24h"
   - ✅ Should see success message

3. **Test Dashboard:**
   - Navigate: http://localhost:3000/dashboard
   - Click "Schema" tab
   - ✅ Should see locked overlay (Tier 1)
   - Click "Try for 24 hours"
   - ✅ Should unlock

## 📁 Files Ready

### Migration
- ✅ `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
  - Creates `telemetry` table
  - Creates `trial_features` table
  - Sets up RLS policies
  - Adds indexes

### API Endpoints
- ✅ `app/api/trial/grant/route.ts` - Grants trials
- ✅ `app/api/trial/status/route.ts` - Checks status

### Components
- ✅ `components/drawer-guard.tsx` - Generic guard
- ✅ `components/dashboard/TabbedDashboard.tsx` - Integrated guards

### Utilities
- ✅ `lib/utils/trial-feature.ts` - Client helpers

### Testing
- ✅ `scripts/test-trial-system.sh` - Automated API tests
- ✅ `TESTING_CHECKLIST.md` - Comprehensive checklist
- ✅ `QUICK_TEST_GUIDE.md` - Quick reference

## 🎯 What's Integrated

### Dashboard Tabs Protected
- ✅ **Schema Tab** - Requires Tier 2 (or Tier 1 with trial)
- ✅ **Mystery Shop Tab** - Requires Tier 2 (or Tier 1 with trial)

### Pricing Page
- ✅ "Borrow a Pro feature for 24h" button
- ✅ Calls `/api/trial/grant`
- ✅ Stores trial in localStorage

### Features
- ✅ 24-hour trial duration
- ✅ Cookie-based persistence
- ✅ localStorage sync
- ✅ Middleware header mirroring
- ✅ Database tracking
- ✅ Telemetry events

## 🧪 Testing Checklist

### Before Testing
- [ ] Migration applied
- [ ] Environment variables set
- [ ] Dev server restarted
- [ ] Tables visible in Supabase

### API Tests
- [ ] `POST /api/trial/grant` returns 200
- [ ] `GET /api/trial/status` returns active trials
- [ ] Cookies are set correctly

### UI Tests
- [ ] Pricing page trial button works
- [ ] Schema tab shows locked overlay (Tier 1)
- [ ] Schema tab unlocks with trial
- [ ] Mystery Shop tab shows locked overlay (Tier 1)
- [ ] Mystery Shop tab unlocks with trial
- [ ] Trials persist after refresh

### Database Verification
- [ ] `trial_features` table has rows
- [ ] `telemetry` table has events
- [ ] RLS policies working

## 🐛 Troubleshooting

### "Failed to grant trial feature"
**Cause:** Supabase not configured
**Fix:**
1. Check `.env.local` has `SUPABASE_SERVICE_KEY`
2. Verify key is service_role (not anon)
3. Restart dev server
4. Check Supabase connection

### Overlay always shows locked
**Cause:** Trial not granted or user tier issue
**Fix:**
1. Grant trial from pricing page
2. Check cookie exists
3. Check localStorage has data
4. Test `/api/trial/status` endpoint

### Migration fails
**Cause:** SQL syntax or permissions
**Fix:**
1. Check you're admin on Supabase
2. Verify SQL is correct
3. Check for existing tables (migration is idempotent)

## 📊 Expected Behavior

### Tier 1 User (No Trial)
- ✅ Pricing page: Can click "Borrow a Pro feature"
- ✅ Schema tab: Shows locked overlay
- ✅ Mystery Shop tab: Shows locked overlay

### Tier 1 User (With Trial)
- ✅ Schema tab: Content visible
- ✅ Mystery Shop tab: Content visible
- ✅ Trial expires after 24 hours

### Tier 2+ User
- ✅ All features unlocked
- ✅ No overlays shown
- ✅ No trial needed

## ✅ Success Criteria

All of these should pass:
- [ ] Migration applied without errors
- [ ] API endpoints return 200
- [ ] Pricing page trial button works
- [ ] Schema tab shows/hides overlay correctly
- [ ] Mystery Shop tab shows/hides overlay correctly
- [ ] Trials persist after refresh
- [ ] Database records created
- [ ] No console errors

## 🎉 Next Steps

Once testing passes:

1. **Add More Features:**
   - Wrap other premium features with `DrawerGuard`
   - Configure feature IDs and tiers

2. **Enhancements:**
   - Add trial expiration notifications
   - Track trial-to-upgrade conversions
   - Monitor trial usage metrics

3. **Production:**
   - Set up monitoring
   - Add analytics
   - Configure alerts

---

## 📞 Quick Reference

**Migration File:** `supabase/migrations/20250115000004_telemetry_trials_rls.sql`

**Test Script:** `./scripts/test-trial-system.sh`

**API Endpoints:**
- `POST /api/trial/grant` - Grant trial
- `GET /api/trial/status` - Check status

**Key Files:**
- `components/drawer-guard.tsx` - Guard component
- `components/dashboard/TabbedDashboard.tsx` - Dashboard integration
- `app/(marketing)/pricing/page.tsx` - Pricing page
- `lib/utils/trial-feature.ts` - Client utilities

**Ready to test once Supabase is configured!** 🚀
