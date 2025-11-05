# Quick Start: Trial System

## 🚀 Apply Migration

### Option A: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
4. Paste and run the SQL
5. Verify tables `telemetry` and `trial_features` are created

### Option B: Supabase CLI (if linked)
```bash
# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

### Option C: Direct SQL Connection
```bash
# Connect to your Supabase database and run:
psql $DATABASE_URL < supabase/migrations/20250115000004_telemetry_trials_rls.sql
```

## ✅ Verify Setup

### 1. Check Tables Exist
Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('telemetry', 'trial_features');
```

### 2. Check RLS Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('telemetry', 'trial_features');
```

## 🧪 Quick Test

### Test Trial Grant API
```bash
curl -X POST http://localhost:3000/api/trial/grant \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "schema_fix"}' \
  -c cookies.txt \
  -v
```

Expected response:
```json
{
  "success": true,
  "data": {
    "feature_id": "schema_fix",
    "expires_at": "2025-01-16T12:00:00.000Z",
    "hours_remaining": 24
  }
}
```

### Test Trial Status API
```bash
curl -X GET http://localhost:3000/api/trial/status \
  -b cookies.txt \
  -v
```

Expected response:
```json
{
  "success": true,
  "data": {
    "active": ["schema_fix"]
  }
}
```

## 🎯 Test User Flow

### 1. Pricing Page
1. Navigate to `http://localhost:3000/pricing`
2. As Tier 1 user, click **"Borrow a Pro feature for 24h"**
3. Verify trial is granted
4. Check browser DevTools → Application → Cookies → `dai_trial_schema_fix`

### 2. Dashboard - Schema Tab
1. Navigate to `http://localhost:3000/dashboard`
2. Click **"Schema"** tab
3. **As Tier 1 (no trial):** Should see locked overlay
4. Click **"Try for 24 hours"**
5. Overlay should disappear, Schema content visible
6. Refresh page → Should remain unlocked

### 3. Dashboard - Mystery Shop Tab
1. Click **"Mystery Shop"** tab
2. **As Tier 1 (no trial):** Should see locked overlay
3. Click **"Try for 24 hours"**
4. Overlay should disappear, Mystery Shop content visible

## 🔍 Debugging

### Check Trial Status in Browser Console
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('dai:trial:schema_fix'))

// Check cookies (if accessible)
document.cookie

// Check API
fetch('/api/trial/status').then(r => r.json()).then(console.log)
```

### Check Database
```sql
-- Active trials
SELECT * FROM trial_features 
WHERE expires_at > NOW() 
ORDER BY granted_at DESC;

-- Telemetry events
SELECT * FROM telemetry 
WHERE event = 'trial_feature_granted' 
ORDER BY at DESC 
LIMIT 10;
```

### Common Issues

**Issue: Trial grant fails**
- Check `SUPABASE_SERVICE_KEY` is set
- Verify RLS allows service role inserts
- Check Supabase connection

**Issue: Drawer always locked**
- Verify user tier is correctly determined
- Check trial cookie is set
- Test `/api/trial/status` endpoint

**Issue: Middleware headers not set**
- Check cookie format (should be JSON)
- Verify middleware runs on non-static routes
- Check cookie expiration parsing

## 📊 What's Integrated

✅ **Schema Tab** - Protected with `DrawerGuard` (Tier 2 required)  
✅ **Mystery Shop Tab** - Protected with `DrawerGuard` (Tier 2 required)  
✅ **Pricing Page** - Trial grant buttons working  
✅ **API Endpoints** - Grant and status endpoints ready  
✅ **Middleware** - Cookie-to-header mirroring active  
✅ **Client Utils** - Trial checking functions available  

## 🎨 Next Steps

1. **Add Zero-Click Drawer Guard** (if needed)
   ```tsx
   <DrawerGuard tier={userTier} featureId="zero_click_drawer" requiredTier={2}>
     <ZeroClickTab />
   </DrawerGuard>
   ```

2. **Add Trial Expiration Notifications**
   - Show banner when trial expires soon
   - Remind users to upgrade

3. **Add More Premium Features**
   - Wrap other features with `DrawerGuard`
   - Configure feature IDs and tiers

## 📝 Files Reference

- Migration: `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
- API Grant: `app/api/trial/grant/route.ts`
- API Status: `app/api/trial/status/route.ts`
- Guard Component: `components/drawer-guard.tsx`
- Client Utils: `lib/utils/trial-feature.ts`
- Dashboard Integration: `components/dashboard/TabbedDashboard.tsx`
- Pricing Page: `app/(marketing)/pricing/page.tsx`

---

**Ready to test!** 🚀

