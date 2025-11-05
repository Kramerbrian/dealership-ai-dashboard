# Supabase Migration Instructions

## Step 1: Apply Migration via Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste Migration SQL**
   - Open: `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
   - Wait for success message

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - Verify you see:
     - ✅ `telemetry` table
     - ✅ `trial_features` table

6. **Verify RLS Policies**
   - Click on `telemetry` table → "Policies" tab
   - Should see policies: "Users can view own telemetry", "Service role full access"
   - Click on `trial_features` table → "Policies" tab
   - Should see policies: "Users can view own trials", "Service role full access"

## Step 2: Verify Environment Variables

Make sure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**To find your keys:**
- Supabase Dashboard → Project Settings → API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "service_role" key → `SUPABASE_SERVICE_KEY`

## Step 3: Start Dev Server

```bash
npm run dev
```

Server should start on http://localhost:3000

## Step 4: Test Pricing Page

1. **Navigate to:** http://localhost:3000/pricing

2. **As Tier 1 User:**
   - Scroll to Tier 1 (Ignition) card
   - Click **"Borrow a Pro feature for 24h"** button

3. **Verify:**
   - ✅ Success alert appears
   - ✅ Cookie is set (check DevTools → Application → Cookies)
   - ✅ Cookie name: `dai_trial_schema_fix`
   - ✅ Cookie value is JSON with `expires_at`

4. **Check Browser Console:**
   - Open DevTools → Console
   - Should see API call to `/api/trial/grant`
   - Should see success response

## Step 5: Test Dashboard - Schema Tab

1. **Navigate to:** http://localhost:3000/dashboard

2. **Click "Schema" Tab**

3. **As Tier 1 User (No Trial):**
   - ✅ Should see locked overlay
   - ✅ "Try for 24 hours" button visible
   - ✅ "Upgrade to DIY Guide" button visible
   - ✅ Feature description shown

4. **Click "Try for 24 hours"**
   - ✅ Overlay disappears
   - ✅ Schema content becomes visible
   - ✅ Success message appears

5. **Refresh Page**
   - ✅ Schema content should remain visible
   - ✅ No overlay shown (trial is active)

## Step 6: Test Dashboard - Mystery Shop Tab

1. **Click "Mystery Shop" Tab**

2. **As Tier 1 User (No Trial):**
   - ✅ Should see locked overlay
   - ✅ "Try for 24 hours" button visible
   - ✅ "Upgrade to DIY Guide" button visible

3. **Click "Try for 24 hours"**
   - ✅ Overlay disappears
   - ✅ Mystery Shop content becomes visible
   - ✅ Success message appears

4. **Refresh Page**
   - ✅ Mystery Shop content should remain visible
   - ✅ No overlay shown (trial is active)

## Step 7: Verify Database

### Check Trial Features Table
```sql
SELECT * FROM trial_features 
WHERE expires_at > NOW() 
ORDER BY granted_at DESC;
```

### Check Telemetry Events
```sql
SELECT * FROM telemetry 
WHERE event = 'trial_feature_granted' 
ORDER BY at DESC 
LIMIT 10;
```

## Troubleshooting

### Issue: Migration fails
- Check you have admin access to Supabase
- Verify SQL syntax is correct
- Check for existing tables (migration is idempotent)

### Issue: Trial grant fails
- Verify `SUPABASE_SERVICE_KEY` is set correctly
- Check Supabase connection in browser console
- Verify RLS policies allow service role inserts

### Issue: Drawer always shows locked
- Check user tier is correctly determined (defaults to Tier 1)
- Verify trial cookie is set
- Check localStorage has trial data
- Test `/api/trial/status` endpoint directly

### Issue: Overlay doesn't appear
- Check `DrawerGuard` component is imported
- Verify `getUserTier()` returns correct tier
- Check browser console for errors

## Success Criteria

✅ Migration applied without errors  
✅ Tables `telemetry` and `trial_features` exist  
✅ RLS policies are enabled  
✅ Pricing page trial button works  
✅ Schema tab shows locked overlay (Tier 1)  
✅ Schema tab unlocks with trial  
✅ Mystery Shop tab shows locked overlay (Tier 1)  
✅ Mystery Shop tab unlocks with trial  
✅ Trials persist after page refresh  
✅ Database records are created  

---

**Ready to test!** 🚀

