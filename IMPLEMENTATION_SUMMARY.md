# Trial System Implementation Summary

## ✅ Completed Tasks

### 1. Supabase Migration
**File:** `supabase/migrations/20250115000004_telemetry_trials_rls.sql`

- ✅ Created `telemetry` table with RLS policies
- ✅ Created `trial_features` table with RLS policies  
- ✅ Added indexes for performance
- ✅ Set up deny-by-default RLS with service role bypass

**To Apply:**
```bash
# Option 1: Supabase CLI (if linked)
supabase db push

# Option 2: Manual via Supabase Dashboard
# Copy SQL from migration file and run in SQL Editor
```

### 2. API Endpoints
**Files Created:**
- ✅ `app/api/trial/grant/route.ts` - Grants 24h trial features
- ✅ `app/api/trial/status/route.ts` - Returns active trials from cookies

**Endpoints:**
- `POST /api/trial/grant` - Accepts `{ feature_id }`, returns trial data
- `GET /api/trial/status` - Returns `{ active: string[] }`

### 3. Middleware Integration
**File:** `middleware.ts`

- ✅ Parses `dai_trial_*` cookies as JSON
- ✅ Validates expiration dates
- ✅ Mirrors active trials to `x-dai-trial-*` headers

### 4. Client Utilities
**File:** `lib/utils/trial-feature.ts`

- ✅ `isTrialActive(featureId)` - Sync check via localStorage
- ✅ `fetchActiveTrials()` - Async API check
- ✅ `isTrialActiveAsync(featureId)` - Async check for specific feature

### 5. Drawer Guard Components
**Files Created:**
- ✅ `components/drawer-guard.tsx` - Generic guard component
- ✅ `components/schema-drawer-guard.tsx` - Re-exported for convenience

**Features:**
- Unlocks on Tier ≥ requiredTier OR Tier 1 with active trial
- Shows locked overlay with CTA for Tier 1
- One-click trial grant button
- Upgrade button to pricing page

### 6. Dashboard Integration
**File:** `components/dashboard/TabbedDashboard.tsx`

**Integrated Guards:**
- ✅ **Schema Tab** - Wrapped with `DrawerGuard` (Tier 2 required)
- ✅ **Mystery Shop Tab** - Wrapped with `DrawerGuard` (Tier 2 required)

**Helper Function:**
- ✅ `getUserTier()` - Maps subscription plan to numeric tier (1, 2, 3)

### 7. Pricing Page Integration
**File:** `app/(marketing)/pricing/page.tsx`

- ✅ "Borrow a Pro feature for 24h" button calls `/api/trial/grant`
- ✅ Stores trial data in localStorage after grant
- ✅ Handles both button and modal trial grants
- ✅ Uses correct API format (`feature_id`)

## 📋 Feature IDs

Common feature IDs configured:
- `schema_fix` - Schema Auditor + JSON-LD Fix Generator
- `mystery_shop` - Mystery Shop Simulator
- `zero_click_drawer` - Interactive Zero-Click Drawer
- `competitor_analysis` - Top-5 Competitor Battle Plan
- `autonomous_fix_engine` - Autonomous Fix Engine

## 🧪 Testing Checklist

### Migration
- [ ] Run `supabase db push` or apply migration manually
- [ ] Verify `telemetry` table exists
- [ ] Verify `trial_features` table exists
- [ ] Check RLS policies are enabled

### API Endpoints
- [ ] Test `POST /api/trial/grant` with `{ feature_id: "schema_fix" }`
- [ ] Verify cookie is set
- [ ] Verify database row is created
- [ ] Test `GET /api/trial/status` returns active trials

### Pricing Page
- [ ] Navigate to `/pricing`
- [ ] Click "Borrow a Pro feature for 24h" (Tier 1)
- [ ] Verify trial is granted
- [ ] Verify success message appears

### Dashboard Guards
- [ ] Navigate to `/dashboard` as Tier 1 user
- [ ] Click "Schema" tab - should show locked overlay
- [ ] Click "Try for 24 hours" - should unlock
- [ ] Refresh page - should remain unlocked
- [ ] Click "Mystery Shop" tab - should show locked overlay
- [ ] Click "Try for 24 hours" - should unlock

### Middleware
- [ ] Grant a trial
- [ ] Check request headers include `x-dai-trial-*`
- [ ] Verify expired trials don't set headers

## 🚀 Next Steps

### Optional Enhancements

1. **Add Zero-Click Drawer Guard**
   - If Zero-Click Drawer is a separate tab/component, wrap it with `DrawerGuard`
   - Example: `<DrawerGuard tier={userTier} featureId="zero_click_drawer" requiredTier={2}>`

2. **Add Trial Expiration Notifications**
   - Show banner when trial expires soon
   - Remind users to upgrade

3. **Add Telemetry Tracking**
   - Track trial usage metrics
   - Track conversion from trial to upgrade

4. **Automatic Cleanup**
   - Cron job to clean expired trials
   - Optional: Add to Supabase Edge Functions

5. **Additional Premium Features**
   - Wrap other premium features with `DrawerGuard`
   - Configure feature IDs and required tiers

## 📝 Usage Examples

### Wrap a Component with Drawer Guard

```tsx
import { DrawerGuard } from '@/components/drawer-guard';

const MyPremiumFeature = () => {
  const userTier = getUserTier(); // 1, 2, or 3
  
  return (
    <DrawerGuard 
      tier={userTier} 
      featureId="my_feature" 
      requiredTier={2}
    >
      {/* Your premium feature UI */}
    </DrawerGuard>
  );
};
```

### Check Trial Status Programmatically

```tsx
import { isTrialActive, fetchActiveTrials } from '@/lib/utils/trial-feature';

// Sync check
const canAccess = isTrialActive('schema_fix');

// Async check
const activeTrials = await fetchActiveTrials();
const canAccess = activeTrials.includes('schema_fix');
```

### Grant Trial from Code

```tsx
const handleGrantTrial = async () => {
  const response = await fetch('/api/trial/grant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature_id: 'schema_fix' }),
  });
  
  const data = await response.json();
  if (data.success) {
    // Store in localStorage
    localStorage.setItem(`dai:trial:schema_fix`, JSON.stringify({
      feature_id: data.data.feature_id,
      unlocked_at: new Date().toISOString(),
      expires_at: data.data.expires_at,
    }));
  }
};
```

## 🎯 Summary

The trial system is **fully implemented and integrated**:

- ✅ Database schema with RLS
- ✅ API endpoints for granting and checking trials
- ✅ Middleware for cookie-to-header mirroring
- ✅ Client utilities for checking trial status
- ✅ Generic drawer guard component
- ✅ Schema and Mystery Shop tabs protected
- ✅ Pricing page integrated with trial grants

**Ready for testing and deployment!**
