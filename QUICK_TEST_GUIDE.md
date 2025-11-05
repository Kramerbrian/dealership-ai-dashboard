# Quick Test Guide - Trial System

## 🚀 Step-by-Step Testing

### Step 1: Apply Supabase Migration

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **SQL Editor:**
   - Click "SQL Editor" → "New query"
   - Open file: `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)

3. **Verify:**
   - Go to "Table Editor"
   - Should see `telemetry` and `trial_features` tables

### Step 2: Configure Environment Variables

**Edit `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**Find your keys:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "service_role" key → `SUPABASE_SERVICE_KEY`

**Restart dev server after updating:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Test API Endpoints

**Option A: Use test script**
```bash
./scripts/test-trial-system.sh
```

**Option B: Manual curl test**
```bash
# Grant trial
curl -X POST http://localhost:3000/api/trial/grant \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "schema_fix"}' \
  -v

# Check status (after granting)
curl -X GET http://localhost:3000/api/trial/status \
  -v
```

**Expected:**
- ✅ HTTP 200 responses
- ✅ JSON with `success: true`
- ✅ Cookie set for trial grant

### Step 4: Test Pricing Page

1. **Navigate:** http://localhost:3000/pricing

2. **Find Tier 1 Card (Ignition):**
   - Look for "Borrow a Pro feature for 24h" button
   - Click it

3. **Verify:**
   - ✅ Success alert/notification appears
   - ✅ Browser DevTools → Application → Cookies
   - ✅ Cookie `dai_trial_schema_fix` exists
   - ✅ Cookie value is JSON

### Step 5: Test Dashboard - Schema Tab

1. **Navigate:** http://localhost:3000/dashboard

2. **Click "Schema" Tab**

3. **Before Trial (Tier 1):**
   - ✅ Should see locked overlay
   - ✅ "Try for 24 hours" button visible
   - ✅ "Upgrade to DIY Guide" button visible

4. **Grant Trial:**
   - Click "Try for 24 hours"
   - ✅ Overlay disappears
   - ✅ Schema content visible

5. **Refresh Page:**
   - ✅ Schema content still visible (trial active)

### Step 6: Test Dashboard - Mystery Shop Tab

1. **Click "Mystery Shop" Tab**

2. **Before Trial (Tier 1):**
   - ✅ Should see locked overlay

3. **Grant Trial:**
   - Click "Try for 24 hours"
   - ✅ Overlay disappears
   - ✅ Mystery Shop content visible

4. **Refresh Page:**
   - ✅ Content still visible (trial active)

## 🔍 Verification Checklist

### Browser DevTools Checks

**Cookies:**
- [ ] `dai_trial_schema_fix` exists (after granting)
- [ ] Cookie value is valid JSON
- [ ] Cookie has expiration date

**LocalStorage:**
- [ ] `dai:trial:schema_fix` exists (after granting)
- [ ] Contains JSON with `expires_at`

**Network Tab:**
- [ ] `POST /api/trial/grant` → 200 OK
- [ ] `GET /api/trial/status` → 200 OK
- [ ] No errors in responses

**Console:**
- [ ] No JavaScript errors
- [ ] No API errors

### Database Checks (Supabase SQL Editor)

**Check trials:**
```sql
SELECT * FROM trial_features 
WHERE expires_at > NOW() 
ORDER BY granted_at DESC;
```

**Check telemetry:**
```sql
SELECT * FROM telemetry 
WHERE event = 'trial_feature_granted' 
ORDER BY at DESC 
LIMIT 5;
```

## 🐛 Common Issues & Fixes

### Issue: "Failed to grant trial feature"

**Causes:**
1. Supabase not configured
   - ✅ Check `.env.local` has `SUPABASE_SERVICE_KEY`
   - ✅ Verify key is correct (service_role, not anon key)
   - ✅ Restart dev server after updating

2. Migration not applied
   - ✅ Run migration SQL in Supabase Dashboard
   - ✅ Verify tables exist

3. RLS blocking
   - ✅ Check RLS policies are created
   - ✅ Service role should bypass RLS

**Fix:**
```bash
# 1. Update .env.local with correct Supabase keys
# 2. Restart dev server
npm run dev
```

### Issue: Overlay always shows (locked)

**Causes:**
1. User tier not detected
   - ✅ Defaults to Tier 1 (expected)
   - ✅ Check `getUserTier()` function

2. Trial not granted
   - ✅ Check cookie is set
   - ✅ Check localStorage has data
   - ✅ Test `/api/trial/status` endpoint

**Fix:**
- Grant trial from pricing page
- Or manually set cookie/localStorage for testing

### Issue: Trial doesn't persist after refresh

**Causes:**
1. Cookie not set
   - ✅ Check cookie in DevTools
   - ✅ Verify cookie expiration

2. localStorage not set
   - ✅ Check localStorage in DevTools
   - ✅ Verify data format

**Fix:**
- Grant trial again
- Check browser console for errors

## ✅ Success Indicators

When everything works:

- ✅ Migration applied successfully
- ✅ API endpoints return 200
- ✅ Pricing page trial button works
- ✅ Schema tab shows locked overlay (Tier 1)
- ✅ Schema tab unlocks with trial
- ✅ Mystery Shop tab shows locked overlay (Tier 1)
- ✅ Mystery Shop tab unlocks with trial
- ✅ Trials persist after refresh
- ✅ Database has records
- ✅ No console errors

## 📞 Next Steps

Once all tests pass:

1. **Add more premium features** with `DrawerGuard`
2. **Add trial expiration notifications**
3. **Track trial-to-upgrade conversions**
4. **Monitor trial usage metrics**

---

**Ready to test!** 🚀

