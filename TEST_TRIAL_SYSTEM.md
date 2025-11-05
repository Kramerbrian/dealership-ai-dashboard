# Testing the Trial System

## Prerequisites

1. **Supabase Migration Applied**
   ```bash
   # Option 1: Use Supabase CLI
   supabase db push
   
   # Option 2: Run migration script
   ./scripts/run-migration.sh
   
   # Option 3: Apply manually via Supabase Dashboard
   # Copy contents of supabase/migrations/20250115000004_telemetry_trials_rls.sql
   # and run in SQL Editor
   ```

2. **Environment Variables Set**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

## Test Flow

### 1. Test Trial Grant API

```bash
# Grant a trial feature
curl -X POST http://localhost:3000/api/trial/grant \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "schema_fix"}' \
  -v

# Expected response:
# {
#   "success": true,
#   "data": {
#     "feature_id": "schema_fix",
#     "expires_at": "2025-01-16T12:00:00.000Z",
#     "hours_remaining": 24
#   }
# }
```

**Check:**
- ✅ Response includes `success: true`
- ✅ Cookie `dai_trial_schema_fix` is set
- ✅ Cookie contains JSON with `expires_at`
- ✅ Database row inserted in `trial_features` table

### 2. Test Trial Status API

```bash
# Check active trials (with cookie from step 1)
curl -X GET http://localhost:3000/api/trial/status \
  -H "Cookie: dai_trial_schema_fix=..." \
  -v

# Expected response:
# {
#   "success": true,
#   "data": {
#     "active": ["schema_fix"]
#   }
# }
```

**Check:**
- ✅ Returns active trials array
- ✅ Includes `schema_fix` if trial is active
- ✅ Excludes expired trials

### 3. Test Pricing Page Flow

1. **Navigate to Pricing Page**
   ```
   http://localhost:3000/pricing
   ```

2. **Click "Borrow a Pro feature for 24h"** (Tier 1 card)

3. **Verify:**
   - ✅ API call to `/api/trial/grant` succeeds
   - ✅ Success message appears
   - ✅ Cookie is set
   - ✅ localStorage is updated with trial data

### 4. Test Schema Drawer Guard

1. **Navigate to Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Click "Schema" Tab**

3. **As Tier 1 User (No Trial):**
   - ✅ Shows locked overlay
   - ✅ "Try for 24 hours" button visible
   - ✅ "Upgrade to DIY Guide" button visible

4. **Click "Try for 24 hours"**
   - ✅ Trial is granted
   - ✅ Overlay disappears
   - ✅ Schema content is visible

5. **Refresh Page**
   - ✅ Schema content remains visible (trial active)
   - ✅ No overlay shown

### 5. Test Mystery Shop Drawer Guard

1. **Navigate to Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Click "Mystery Shop" Tab**

3. **As Tier 1 User (No Trial):**
   - ✅ Shows locked overlay
   - ✅ "Try for 24 hours" button visible
   - ✅ "Upgrade to DIY Guide" button visible

4. **Click "Try for 24 hours"**
   - ✅ Trial is granted
   - ✅ Overlay disappears
   - ✅ Mystery Shop content is visible

### 6. Test Middleware Header Mirroring

1. **Grant a trial** (via API or pricing page)

2. **Check request headers** (in browser DevTools Network tab):
   ```
   x-dai-trial-schema_fix: true
   ```

3. **Verify middleware is working:**
   - ✅ Header is set for active trials
   - ✅ Header is NOT set for expired trials

### 7. Test Database Verification

**Check Supabase Dashboard:**

1. **`telemetry` table:**
   ```sql
   SELECT * FROM telemetry 
   WHERE event = 'trial_feature_granted' 
   ORDER BY at DESC 
   LIMIT 10;
   ```
   - ✅ Events are recorded
   - ✅ Includes `feature_id` in metadata

2. **`trial_features` table:**
   ```sql
   SELECT * FROM trial_features 
   WHERE expires_at > NOW() 
   ORDER BY granted_at DESC;
   ```
   - ✅ Active trials are present
   - ✅ Expired trials can be cleaned up

### 8. Test Expiration

1. **Grant a trial**

2. **Manually expire it** (for testing):
   ```sql
   UPDATE trial_features 
   SET expires_at = NOW() - INTERVAL '1 hour'
   WHERE feature_id = 'schema_fix';
   ```

3. **Refresh dashboard**
   - ✅ Overlay appears again
   - ✅ Trial status API returns empty array

## Manual Testing Checklist

- [ ] Migration applied successfully
- [ ] Trial grant API works
- [ ] Trial status API works
- [ ] Pricing page trial grant works
- [ ] Schema drawer guard shows locked state (Tier 1)
- [ ] Schema drawer guard unlocks with trial
- [ ] Mystery Shop drawer guard shows locked state (Tier 1)
- [ ] Mystery Shop drawer guard unlocks with trial
- [ ] Middleware mirrors cookies to headers
- [ ] Telemetry events are recorded
- [ ] Database rows are created correctly
- [ ] Expired trials are excluded

## Troubleshooting

### Issue: Trial grant fails
- Check Supabase connection
- Verify `SUPABASE_SERVICE_KEY` is set
- Check RLS policies allow service role inserts

### Issue: Drawer guard always shows locked
- Check user tier is correctly determined
- Verify trial cookie is set
- Check localStorage has trial data
- Test `/api/trial/status` endpoint

### Issue: Middleware headers not set
- Check cookie format (should be JSON)
- Verify cookie expiration date parsing
- Check middleware is running (non-static routes)

## Next Steps

After testing:
1. Create similar guards for other premium features
2. Add trial expiration notifications
3. Add telemetry tracking for trial usage
4. Implement automatic cleanup of expired trials

