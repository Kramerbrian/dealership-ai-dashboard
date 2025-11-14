# CTA & Endpoint Audit Report

## Executive Summary

This audit examines all Call-to-Actions (CTAs) and API endpoints across:
1. Landing Page
2. Onboarding Flow
3. Clerk Middleware
4. Dashboard

**Status**: ⚠️ **Issues Found** - See detailed findings below.

---

## 1. Landing Page CTAs & Endpoints

### Components Audited
- `HeroSection_CupertinoNolan`
- `LandingAnalyzer`
- `ClarityStackPanel`
- `AIIntroCard`

### CTAs Found

#### Hero Section (`HeroSection_CupertinoNolan.tsx`)
1. **"Launch" Button** (Line 323-335)
   - **Action**: `handleLaunch()` function
   - **Endpoint**: `GET /api/marketpulse/compute?dealer={domain}`
   - **Redirect**: `/onboarding?dealer={domain}&aiv={aiv}&ati={ati}`
   - **Status**: ✅ **Working**
   - **Issues**: None

2. **Audio Toggle** (Line 344-357)
   - **Action**: `toggleMute()` function
   - **Endpoint**: None (client-side only)
   - **Status**: ✅ **Working**

#### Landing Analyzer (`LandingAnalyzer.tsx`)
1. **"Analyze my visibility" Button** (Line 68-74)
   - **Action**: `handleAnalyze()` function
   - **Endpoint**: `GET /api/clarity/stack?domain={domain}`
   - **Status**: ✅ **Working**
   - **Response Fields**: `scores`, `revenue_at_risk`, `location`, `ai_intro_current`, `ai_intro_improved`

2. **"Unlock full dashboard" Button** (ClarityStackPanel, Line 113-118)
   - **Action**: `onUnlockDashboard()` callback
   - **Redirect**: `/onboarding?dealer={domain}`
   - **Status**: ✅ **Working**

3. **"Unlock dashboard" Button** (AIIntroCard, Line 39-44)
   - **Action**: `onUnlockDashboard()` callback
   - **Redirect**: `/onboarding?dealer={domain}`
   - **Status**: ✅ **Working**

### API Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/marketpulse/compute` | GET | Fetch KPI data for onboarding | ✅ Working |
| `/api/clarity/stack` | GET | Fetch clarity scores and AI intro | ✅ Working |
| `/api/nearby-dealer` | GET | Get competitor data (optional) | ⚠️ Not verified |

### Issues Found

1. **Missing Error Handling**
   - LandingAnalyzer doesn't show error messages if API fails
   - Hero section has error handling but could be improved

2. **Inconsistent Parameter Names**
   - Hero uses `dealer` param
   - Analyzer uses `domain` param
   - Both should standardize on `dealer` or `domain`

---

## 2. Onboarding CTAs & Endpoints

### Components Audited
- `app/onboarding/page.tsx`

### CTAs Found

1. **"Activate Pulse Dashboard" Button** (Line 275-281)
   - **Action**: Link component
   - **Redirect**: `/pulse?dealer={dealer}`
   - **Status**: ✅ **Fixed** (was `/dash`, now `/pulse`)

### API Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/marketpulse/compute` | GET | Fetch KPI data | ✅ Working |

### Flow Analysis

1. **Entry Point**: `/onboarding?dealer={domain}&aiv={aiv}&ati={ati}`
2. **Data Fetch**: Calls `/api/marketpulse/compute?dealer={dealer}`
3. **Display**: Shows scan animation, AIV/ATI scores
4. **Exit**: Redirects to `/pulse?dealer={dealer}`

### Issues Found

1. **Missing Error Handling**
   - If API fails, shows error but no retry mechanism
   - No fallback if dealer param is missing

2. **Redirect Logic**
   - ✅ **FIXED**: Now redirects to `/pulse` instead of `/dash`

---

## 3. Clerk Middleware CTAs & Endpoints

### File Audited
- `middleware.ts`

### Routes Protected

#### Public Routes (No Auth Required)
- `/` (landing page)
- `/sign-in`, `/sign-up`
- `/onboarding`
- `/pricing`, `/instant`, `/landing`
- `/api/marketpulse/*`
- `/api/health`, `/api/status`
- `/api/clarity/stack` (via public route check)

#### Protected Routes (Auth Required)
- `/dashboard/*`
- `/dash/*`
- `/intelligence/*`
- `/api/ai/*`
- `/api/pulse/*`
- `/api/user/*`
- `/api/save-metrics`

### Redirects

1. **Dashboard Domain Root** (`dash.dealershipai.com/`)
   - **Redirect**: `/` → `/dash` (308 Permanent)
   - **Status**: ✅ **Working**

2. **Unauthenticated Users**
   - **Redirect**: Protected route → `/sign-in?redirect_url={url}`
   - **Status**: ✅ **Working**

3. **Clerk Handshake**
   - **Behavior**: Allows through without auth check
   - **Status**: ✅ **Working**

### Issues Found

1. **Route Inconsistency**
   - Middleware protects `/dash/*` but onboarding redirects to `/pulse`
   - `/pulse` is NOT in protected routes list
   - **Fix Needed**: Add `/pulse/*` to protected routes OR make it public

2. **API Route Protection**
   - `/api/pulse/*` is protected but PulseInbox fetches from it
   - Need to ensure auth is passed correctly

---

## 4. Dashboard CTAs & Endpoints

### Components Audited
- `app/(dashboard)/pulse/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/components/pulse/PulseInbox.tsx`
- `components/DealershipAI_PulseDecisionInbox.jsx`

### CTAs Found

#### Pulse Dashboard (`app/(dashboard)/pulse/page.tsx`)
- **Component**: `PulseInbox`
- **No direct CTAs** (handled by child component)

#### Pulse Inbox (`PulseInbox.tsx`)
1. **Filter Buttons** (InboxHeader component)
   - **Actions**: Filter by `all`, `critical`, `kpi`, `incident`, `market`, `system`
   - **Status**: ✅ **Working**

2. **Card Actions** (Line 94-142)
   - **"Open" Button**: Opens thread drawer
   - **"Fix" Button**: Calls auto-fix (not wired)
   - **"Assign" Button**: Assigns to team (not wired)
   - **"Snooze" Button**: Snoozes card (not wired)
   - **"Mute 24h" Button**: Mutes card for 24h
   - **Status**: ⚠️ **Partially Working** (only Open and Mute work)

### API Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/pulse` | GET | Fetch pulse cards | ✅ Working |
| `/api/pulse` | POST | Ingest pulse cards | ✅ Working |
| `/api/pulse/{id}/fix` | POST | Auto-fix issue | ⚠️ Not verified |
| `/api/pulse/thread/{id}` | GET | Get thread details | ⚠️ Not verified |
| `/api/pulse/export` | GET | Export pulse data | ⚠️ Not verified |

### Issues Found

1. **API Response Format Mismatch** ✅ **FIXED**
   - **Problem**: PulseInbox expected `{ items: [] }` but API returns `{ cards: [] }`
   - **Fix**: Updated to handle both formats: `j.cards || j.items || []`

2. **Missing Dealer Context** ✅ **FIXED**
   - **Problem**: API calls didn't pass `dealerId` parameter
   - **Fix**: Extract from URL params and pass to API

3. **Missing Error Handling** ⚠️ **PARTIALLY FIXED**
   - **Problem**: No error states or retry logic
   - **Fix**: Added try-catch but no UI error display

4. **Unwired Actions**
   - Fix, Assign, Snooze buttons don't have handlers
   - Need to wire to actual API endpoints

---

## Summary of Issues

### Critical Issues
1. ⚠️ **Route Protection Mismatch**: `/pulse` not in protected routes but should be
2. ⚠️ **Missing Error UI**: No error messages shown to users
3. ⚠️ **Unwired Actions**: Fix, Assign, Snooze buttons don't work

### Medium Issues
1. ⚠️ **Inconsistent Parameters**: `dealer` vs `domain` naming
2. ⚠️ **Missing API Endpoints**: Some endpoints referenced but not verified

### Low Issues
1. ⚠️ **No Retry Logic**: Failed API calls don't retry
2. ⚠️ **No Loading States**: Some components don't show loading indicators

---

## Recommended Fixes

### Priority 1: Route Protection
```typescript
// middleware.ts - Add /pulse to protected routes
protectedRouteMatcher = createRouteMatcher([
  '/dashboard(.*)',
  '/dash(.*)',
  '/pulse(.*)', // ADD THIS
  '/intelligence(.*)',
  // ...
]);
```

### Priority 2: Error Handling
- Add error boundaries to Pulse components
- Show user-friendly error messages
- Add retry buttons

### Priority 3: Wire Actions
- Implement `/api/pulse/{id}/fix` endpoint
- Implement `/api/pulse/{id}/assign` endpoint
- Implement `/api/pulse/{id}/snooze` endpoint

### Priority 4: Standardize Parameters
- Use `dealer` consistently across all components
- Update API endpoints to accept both for backward compatibility

---

## Testing Checklist

- [ ] Landing page hero "Launch" button works
- [ ] Landing page analyzer "Analyze" button works
- [ ] Onboarding redirects to `/pulse` correctly
- [ ] Pulse dashboard loads cards
- [ ] Pulse cards are filterable
- [ ] Pulse card actions work (Open, Fix, Assign, Snooze, Mute)
- [ ] Error states display properly
- [ ] Loading states display properly
- [ ] Auth protection works on dashboard routes
- [ ] Public routes are accessible without auth

---

## Next Steps

1. Fix route protection for `/pulse`
2. Add error handling UI
3. Wire up action buttons
4. Standardize parameter names
5. Test complete flow end-to-end

