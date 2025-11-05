# Trial System Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Migration applied to Supabase (via SQL Editor)
- [ ] `telemetry` table exists
- [ ] `trial_features` table exists
- [ ] RLS policies enabled
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_KEY`
- [ ] Dev server running (`npm run dev`)

## 🧪 API Endpoint Tests

### Test 1: Grant Trial API
```bash
curl -X POST http://localhost:3000/api/trial/grant \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "schema_fix"}' \
  -v
```

**Expected:**
- ✅ HTTP 200 status
- ✅ Response: `{"success": true, "data": {...}}`
- ✅ Cookie `dai_trial_schema_fix` is set
- ✅ Cookie contains JSON with `expires_at`

**Or run automated test:**
```bash
./scripts/test-trial-system.sh
```

### Test 2: Trial Status API
```bash
curl -X GET http://localhost:3000/api/trial/status \
  -H "Cookie: dai_trial_schema_fix=..." \
  -v
```

**Expected:**
- ✅ HTTP 200 status
- ✅ Response: `{"success": true, "data": {"active": ["schema_fix"]}}`

## 🎨 UI Flow Tests

### Test 3: Pricing Page - Trial Grant

1. **Navigate:** http://localhost:3000/pricing

2. **As Tier 1 User:**
   - [ ] See Tier 1 (Ignition) card
   - [ ] See "Borrow a Pro feature for 24h" button
   - [ ] Click button

3. **Verify:**
   - [ ] Success alert appears
   - [ ] Cookie is set (DevTools → Application → Cookies)
   - [ ] Cookie name: `dai_trial_schema_fix`
   - [ ] localStorage has trial data (DevTools → Application → Local Storage)

### Test 4: Dashboard - Schema Tab (Locked)

1. **Navigate:** http://localhost:3000/dashboard

2. **Click "Schema" Tab**

3. **As Tier 1 User (No Trial):**
   - [ ] See locked overlay
   - [ ] See "Try for 24 hours" button
   - [ ] See "Upgrade to DIY Guide" button
   - [ ] See feature description

### Test 5: Dashboard - Schema Tab (Unlock via Trial)

1. **On Schema Tab overlay:**
   - [ ] Click "Try for 24 hours"

2. **Verify:**
   - [ ] Overlay disappears
   - [ ] Schema content becomes visible
   - [ ] Success message appears

3. **Refresh Page:**
   - [ ] Schema content remains visible
   - [ ] No overlay shown

### Test 6: Dashboard - Mystery Shop Tab (Locked)

1. **Click "Mystery Shop" Tab**

2. **As Tier 1 User (No Trial):**
   - [ ] See locked overlay
   - [ ] See "Try for 24 hours" button
   - [ ] See "Upgrade to DIY Guide" button

### Test 7: Dashboard - Mystery Shop Tab (Unlock via Trial)

1. **On Mystery Shop Tab overlay:**
   - [ ] Click "Try for 24 hours"

2. **Verify:**
   - [ ] Overlay disappears
   - [ ] Mystery Shop content becomes visible
   - [ ] Success message appears

3. **Refresh Page:**
   - [ ] Mystery Shop content remains visible
   - [ ] No overlay shown

## 🔍 Browser DevTools Verification

### Check Cookies
1. Open DevTools (F12)
2. Application → Cookies → http://localhost:3000
3. Look for:
   - [ ] `dai_trial_schema_fix` (after granting trial)
   - [ ] Cookie value is JSON
   - [ ] Cookie has expiration date

### Check LocalStorage
1. Application → Local Storage → http://localhost:3000
2. Look for:
   - [ ] `dai:trial:schema_fix` (after granting trial)
   - [ ] Contains JSON with `expires_at`

### Check Network Requests
1. Network tab → Filter: "trial"
2. Look for:
   - [ ] `POST /api/trial/grant` → Status 200
   - [ ] `GET /api/trial/status` → Status 200
   - [ ] Response bodies are valid JSON

### Check Console
1. Console tab
2. Should see:
   - [ ] No errors related to trial system
   - [ ] API calls logged (if logging enabled)

## 🗄️ Database Verification

### Check Trial Features Table
```sql
SELECT * FROM trial_features 
WHERE expires_at > NOW() 
ORDER BY granted_at DESC 
LIMIT 10;
```

**Expected:**
- [ ] Rows exist after granting trials
- [ ] `feature_id` matches granted feature
- [ ] `expires_at` is ~24 hours in future
- [ ] `user_id` is set (or 'anonymous')

### Check Telemetry Events
```sql
SELECT * FROM telemetry 
WHERE event = 'trial_feature_granted' 
ORDER BY at DESC 
LIMIT 10;
```

**Expected:**
- [ ] Rows exist after granting trials
- [ ] `event` = 'trial_feature_granted'
- [ ] `metadata` contains feature_id
- [ ] `tier` = 'tier1' (for Tier 1 users)

## 🐛 Troubleshooting

### Issue: Trial grant fails
**Check:**
- [ ] Supabase connection (check `SUPABASE_SERVICE_KEY`)
- [ ] RLS policies allow service role inserts
- [ ] Browser console for errors
- [ ] Network tab for API response

### Issue: Drawer always locked
**Check:**
- [ ] User tier is correctly determined (defaults to Tier 1)
- [ ] Trial cookie is set
- [ ] localStorage has trial data
- [ ] `/api/trial/status` returns active trials

### Issue: Overlay doesn't appear
**Check:**
- [ ] `DrawerGuard` component is imported
- [ ] `getUserTier()` returns correct tier
- [ ] Browser console for errors
- [ ] Component is wrapped correctly

### Issue: Trial doesn't persist
**Check:**
- [ ] Cookie expiration is set correctly
- [ ] localStorage data is valid JSON
- [ ] Trial status API returns active trials
- [ ] Database row exists

## ✅ Success Criteria

All of the following should pass:

- [ ] Migration applied without errors
- [ ] Tables exist in Supabase
- [ ] API endpoints return 200
- [ ] Cookies are set correctly
- [ ] Pricing page trial button works
- [ ] Schema tab shows locked overlay (Tier 1)
- [ ] Schema tab unlocks with trial
- [ ] Mystery Shop tab shows locked overlay (Tier 1)
- [ ] Mystery Shop tab unlocks with trial
- [ ] Trials persist after page refresh
- [ ] Database records are created
- [ ] No console errors
- [ ] No network errors

---

**Once all checks pass, the trial system is ready for production!** 🚀
