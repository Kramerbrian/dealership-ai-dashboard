# Pricing Page Enhancements

## ✅ Completed

### 1. **ROI Projection Pill**
- Added Revenue-at-Risk display in hero section
- Reads from `localStorage:dai:rar_monthly` (defaults to $47K/mo)
- Updates automatically when dashboard calculates new RAR

### 2. **Visibility Gain Badges**
- Tier 2: +18% visibility badge
- Tier 3: +32% visibility badge
- Shows recovery copy: "+$24K/mo" and "+$42K/mo" respectively

### 3. **"Borrow a Pro Feature" Button**
- Tier 1 exclusive button
- Grants 24-hour trial access to one Pro feature
- Tracks telemetry: `trial_feature_enable`
- Redirects to dashboard after grant

### 4. **Telemetry Integration**
- Modal view tracking: `pricing_modal_view`
- Upgrade click tracking: `pricing_upgrade_click`
- Trial enable tracking: `trial_feature_enable`
- All events stored in Supabase

### 5. **Supabase Telemetry Table**
- Created migration: `20250102000000_create_telemetry_table.sql`
- Includes RLS policies
- Indexes for performance
- Stores event, tier, surface, IP, UA, metadata

### 6. **Trial Feature System**
- Created `trial_features` table
- API endpoints: `/api/trial/grant` and `/api/trial/check`
- React hook: `useTrialFeature`
- Component: `TrialFeatureGate` for locked features

## 📋 Database Migrations

### Telemetry Table
```sql
CREATE TABLE telemetry (
  id UUID PRIMARY KEY,
  event TEXT NOT NULL,
  tier TEXT,
  surface TEXT,
  at TIMESTAMPTZ DEFAULT NOW(),
  ip INET,
  ua TEXT,
  user_id TEXT,
  metadata JSONB
);
```

### Trial Features Table
```sql
CREATE TABLE trial_features (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, feature_id)
);
```

## 🔧 Usage

### Dashboard Integration
When dashboard calculates Revenue-at-Risk, write to localStorage:
```javascript
localStorage.setItem('dai:rar_monthly', String(rarValueInDollars));
```

### Locking Features
Wrap locked features with `TrialFeatureGate`:
```tsx
<TrialFeatureGate
  featureId="competitor_analysis"
  tierRequired="tier2"
  currentTier={userTier}
  featureName="Competitor Analysis"
>
  <CompetitorAnalysisWidget />
</TrialFeatureGate>
```

### Checking Trial Status
Use the hook:
```tsx
const { status, grantTrial } = useTrialFeature('competitor_analysis');
if (status.is_active) {
  // Feature is unlocked
}
```

## 🚀 Next Steps

1. **Run Migrations**
   ```bash
   # Apply Supabase migrations
   supabase migration up
   ```

2. **Set Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   ```

3. **Test Flow**
   - Visit `/pricing`
   - Click "Borrow a Pro feature for 24h"
   - Verify trial is granted
   - Check dashboard for unlocked feature

4. **Optional Enhancements**
   - Per-feature ROI bubbles (hover tooltips)
   - In-modal Stripe checkout
   - Trial expiration notifications
   - Feature usage tracking

## 📊 Telemetry Events

| Event | When | Metadata |
|-------|------|----------|
| `pricing_modal_view` | User opens upgrade modal | `tier`, `surface` |
| `pricing_upgrade_click` | User clicks upgrade CTA | `tier`, `surface` |
| `trial_feature_enable` | User clicks "Borrow" button | `tier`, `surface` |
| `trial_feature_granted` | Trial successfully granted | `feature_id` |

## 🔒 Security

- RLS policies on both tables
- Service key for server-side inserts
- User-scoped queries for client-side
- IP and UA tracking for fraud detection
- Rate limiting on API endpoints

