# Trial System Integration Guide

## Overview

The trial system allows Tier 1 users to temporarily unlock premium features (like Schema Auditor) for 24 hours. This system includes:

- **Supabase migrations** for `telemetry` and `trial_features` tables with RLS
- **API endpoints** for granting and checking trial status
- **Middleware** that mirrors trial cookies to headers
- **Client helpers** for checking trial status
- **Drawer guard component** for feature gating

## Files Created/Updated

### 1. Supabase Migration
- `supabase/migrations/20250115000004_telemetry_trials_rls.sql`
  - Creates `telemetry` and `trial_features` tables
  - Sets up RLS policies (deny-by-default, service role bypass)
  - Adds indexes for performance

### 2. API Endpoints
- `app/api/trial/grant/route.ts` - Grants a 24h trial feature
- `app/api/trial/status/route.ts` - Returns active trials from cookies

### 3. Middleware
- `middleware.ts` - Mirrors `dai_trial_*` cookies to `x-dai-trial-*` headers

### 4. Client Utilities
- `lib/utils/trial-feature.ts` - Client-side helpers:
  - `isTrialActive(featureId)` - Sync check (localStorage)
  - `fetchActiveTrials()` - Async check (API)
  - `isTrialActiveAsync(featureId)` - Async check for specific feature

### 5. Components
- `components/schema-drawer-guard.tsx` - Drop-in guard component for Schema panel

## Usage Example

### Wrap Schema Tab with Guard

```tsx
import { SchemaDrawerGuard } from '@/components/schema-drawer-guard';

// In TabbedDashboard.tsx
const SchemaTab = () => {
  const userTier = 1; // Get from auth/session
  
  return (
    <SchemaDrawerGuard tier={userTier}>
      <div className="space-y-6">
        {/* Your existing schema audit UI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schema Markup Status */}
          <motion.div className="glass-card p-6">
            {/* ... */}
          </motion.div>
        </div>
      </div>
    </SchemaDrawerGuard>
  );
};
```

### Manual Trial Check

```tsx
import { isTrialActive, fetchActiveTrials } from '@/lib/utils/trial-feature';

// Sync check (localStorage)
const canAccess = isTrialActive('schema_fix');

// Async check (API + cookies)
const activeTrials = await fetchActiveTrials();
const canAccess = activeTrials.includes('schema_fix');
```

### Grant Trial from Component

```tsx
const handleGrantTrial = async () => {
  const response = await fetch('/api/trial/grant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify({
      feature_id: 'schema_fix',
    }),
  });

  const data = await response.json();
  if (data.success) {
    // Store in localStorage for immediate client-side checks
    localStorage.setItem(`dai:trial:schema_fix`, JSON.stringify({
      feature_id: data.data.feature_id,
      unlocked_at: new Date().toISOString(),
      expires_at: data.data.expires_at,
    }));
    
    // Refresh UI or redirect
    window.location.reload();
  }
};
```

## Feature IDs

Common feature IDs:
- `schema_fix` - Schema Auditor + JSON-LD Fix Generator
- `zero_click_drawer` - Interactive Zero-Click Drawer
- `competitor_analysis` - Top-5 Competitor Battle Plan
- `mystery_shop` - Mystery Shop Simulator
- `autonomous_fix_engine` - Autonomous Fix Engine

## How It Works

1. **User requests trial** (Tier 1 user clicks "Borrow a Pro feature for 24h")
2. **API grants trial** (`POST /api/trial/grant`)
   - Inserts row in `trial_features` table
   - Sets `dai_trial_<feature_id>` cookie with JSON payload
   - Returns success with expiration timestamp
3. **Client stores in localStorage** (for fast client-side checks)
4. **Middleware mirrors to headers** (for server-side checks)
5. **Guard component checks access**
   - Tier ≥ 2: Always unlocked
   - Tier 1 + Active trial: Unlocked
   - Tier 1 + No trial: Shows locked state with CTA

## Database Schema

### `trial_features` Table
```sql
CREATE TABLE trial_features (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, feature_id)
);
```

### `telemetry` Table
```sql
CREATE TABLE telemetry (
  id UUID PRIMARY KEY,
  event TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  surface TEXT,
  at TIMESTAMPTZ DEFAULT NOW(),
  ip INET,
  ua TEXT,
  user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

## Security

- **RLS Policies**: Deny-by-default, service role bypass for server-side inserts
- **Cookie Security**: HttpOnly cookies (client-side can't directly access, but middleware reads them)
- **Rate Limiting**: Trial grant endpoint is rate-limited via `createApiRoute`
- **Validation**: Zod schemas validate all inputs

## Testing

1. **Run migration**: Apply `20250115000004_telemetry_trials_rls.sql` to Supabase
2. **Test grant**: `POST /api/trial/grant` with `{ feature_id: 'schema_fix' }`
3. **Test status**: `GET /api/trial/status` should return active trials
4. **Test guard**: Wrap SchemaTab with `SchemaDrawerGuard` and verify locking/unlocking

## Next Steps

- [ ] Integrate `SchemaDrawerGuard` into `TabbedDashboard.tsx` SchemaTab
- [ ] Create similar guards for other premium features (Zero-Click Drawer, Mystery Shop)
- [ ] Add trial expiration notifications
- [ ] Add telemetry tracking for trial usage

