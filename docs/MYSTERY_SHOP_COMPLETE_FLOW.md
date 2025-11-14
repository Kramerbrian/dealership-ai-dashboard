# Mystery Shop: Complete User Journey Analysis

## Step-by-Step User Flow

### Step 1: Landing Page Entry
**URL**: `https://dealershipai.com/`  
**Component**: `HeroSection_CupertinoNolan` + `LandingAnalyzer`

**User Actions**:
1. User sees cinematic hero with animated chat window
2. User can either:
   - Enter domain in hero section → Click "Launch" → Redirects to `/onboarding?dealer=...`
   - Scroll down → Enter domain in analyzer → Click "Analyze my visibility" → Shows results

**Expected Behavior**:
- Hero section redirects to onboarding with dealer param
- Analyzer shows Clarity Stack Panel + AI Intro Card
- Both paths should lead to dashboard

**Current Status**: ✅ Working

---

### Step 2: Onboarding Page
**URL**: `/onboarding?dealer=naplestoyota.com&aiv=0.88&ati=0.82`  
**Component**: `app/onboarding/page.tsx`

**User Actions**:
1. Sees cinematic intro animation (1.8s)
2. Sees scan animation with 5 steps:
   - Analyzing dealership visibility...
   - Schema accuracy: Calculating...
   - Trust confidence: Measuring...
   - Competitor rank: Analyzing...
   - Calibration complete
3. Sees AIV and ATI scores
4. Clicks "Activate Pulse Dashboard" button

**Expected Behavior**:
- Fetches data from `/api/marketpulse/compute?dealer=...`
- Shows animated scan steps
- Displays AIV and ATI scores
- Redirects to dashboard after completion

**Current Redirect**: `/dash?dealer=...`  
**Issue**: Should redirect to `/pulse` or `/dashboard` for Pulse cards

**Current Status**: ⚠️ Redirect mismatch

---

### Step 3: Dashboard Entry
**URL**: `/dash?dealer=naplestoyota.com`  
**Component**: `app/dash/page.tsx`

**User Actions**:
1. User lands on dashboard
2. Should see Pulse cards

**Expected Behavior**:
- Shows `DealershipAI_PulseDecisionInbox` component
- Displays Pulse cards from `/api/pulse`
- Shows actionable insights

**Current Status**: ⚠️ Needs verification

---

### Step 4: Pulse Dashboard
**URL**: `/pulse`  
**Component**: `app/(dashboard)/pulse/page.tsx` → `PulseInbox`

**User Actions**:
1. Views Pulse Decision Inbox
2. Sees filtered cards (all, critical, kpi, incident, market, system)
3. Can interact with cards:
   - Open thread
   - Fix issue
   - Assign
   - Snooze
   - Mute

**Expected Behavior**:
- Fetches from `/api/pulse` (GET)
- Displays cards with proper filtering
- Shows digest banner with summary
- Thread drawer opens on click

**Current Status**: ✅ Working (needs testing)

---

## Issues Identified

### Issue 1: Onboarding Redirect Mismatch
**Problem**: Onboarding redirects to `/dash` but Pulse cards are at `/pulse`  
**Location**: `app/onboarding/page.tsx:276`  
**Fix**: Change redirect to `/pulse?dealer=...` or `/dashboard?dealer=...`

### Issue 2: Dashboard Route Confusion
**Problem**: Multiple dashboard routes (`/dash`, `/dashboard`, `/pulse`)  
**Location**: Various files  
**Fix**: Standardize on `/pulse` for Pulse cards, `/dashboard` for main dashboard

### Issue 3: Pulse API Response Format
**Problem**: `PulseInbox` expects `{ items: PulseCard[] }` but API returns `{ cards: PulseCard[] }`  
**Location**: `app/components/pulse/PulseInbox.tsx:48-51`  
**Fix**: Update component to handle `cards` instead of `items`

### Issue 4: Missing Dealer Context
**Problem**: Pulse API calls don't pass `dealerId` from URL params  
**Location**: `app/components/pulse/PulseInbox.tsx`  
**Fix**: Extract dealer from URL and pass to API

### Issue 5: No Error Handling
**Problem**: No error states or retry logic in Pulse components  
**Location**: Multiple components  
**Fix**: Add error boundaries and retry logic

---

## Fixes Required

1. ✅ Fix onboarding redirect to `/pulse`
2. ✅ Fix Pulse API response format handling
3. ✅ Add dealer context to Pulse API calls
4. ✅ Add error handling and loading states
5. ✅ Test complete flow end-to-end

---

## Testing Checklist

- [ ] Landing page hero section works
- [ ] Landing page analyzer works
- [ ] Onboarding page loads with dealer param
- [ ] Onboarding scan animation completes
- [ ] Onboarding redirects to Pulse dashboard
- [ ] Pulse dashboard loads cards
- [ ] Pulse cards are filterable
- [ ] Pulse card actions work (open, fix, assign, snooze, mute)
- [ ] Thread drawer opens correctly
- [ ] Error states display properly
- [ ] Loading states display properly

---

## Next Steps

1. Apply fixes to identified issues
2. Test complete flow locally
3. Verify all API endpoints work
4. Check error handling
5. Document any remaining issues

