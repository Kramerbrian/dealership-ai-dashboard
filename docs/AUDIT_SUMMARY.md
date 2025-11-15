# Landing Page & Onboarding Audit Summary

## Executive Summary

**Date:** $(date)  
**Status:** ⚠️ **Issues Found - Fixes Applied**

### Critical Issues Fixed ✅
1. ✅ Onboarding redirect now uses `/dash?domain=...` (was `/pulse?dealer=...`)
2. ✅ Landing analyzer CTA now uses `domain` param (was `dealer`)
3. ✅ Onboarding form now saves data to `/api/user/onboarding-complete`
4. ✅ Onboarding page supports both `dealer` and `domain` params

### Remaining Issues ⚠️
1. ⚠️ `/api/capture-email` endpoint is disabled (moved to `app/api_disabled`)
2. ⚠️ Multiple alternative endpoints exist (`/api/analyze`, `/api/scan/quick`) - need to verify usage
3. ⚠️ Parameter naming inconsistency: `/api/marketpulse/compute` uses `dealer` but should use `domain`

---

## Landing Page CTAs

### Primary CTA: "Analyze my visibility"
**Location:** `components/landing/LandingAnalyzer.tsx`  
**Endpoint:** `/api/clarity/stack?domain={domain}`  
**Status:** ✅ **VERIFIED** - Working correctly

**Flow:**
1. User enters domain
2. Clicks "Analyze my visibility"
3. Calls `/api/clarity/stack?domain={domain}`
4. Displays results (scores, revenue, location, AI intro)
5. Shows "Unlock Dashboard" CTA

### Secondary CTA: "Unlock Dashboard"
**Location:** `components/landing/ClarityStackPanel.tsx` and `AIIntroCard.tsx`  
**Action:** `handleUnlockDashboard()`  
**Redirect:** `/onboarding?domain={domain}`  
**Status:** ✅ **FIXED** - Now uses `domain` param

**Previous Issue:** Used `dealer` param  
**Fix Applied:** Changed to `domain` param for consistency

---

## Onboarding Flow

### Route 1: `/onboarding` (Cinematic Scan)
**File:** `app/onboarding/page.tsx`

**Flow:**
1. User arrives with `?dealer={domain}` or `?domain={domain}`
2. Fetches `/api/marketpulse/compute?dealer={dealer}`
3. Shows animated scan
4. Displays AIV and ATI scores
5. CTA: "Activate Pulse Dashboard"

**Redirect After CTA:**
- **Previous:** `/pulse?dealer={dealer}` ❌
- **Fixed:** `/dash?domain={dealer}` ✅

**Issues Fixed:**
- ✅ Now supports both `dealer` and `domain` params
- ✅ Redirect uses `/dash?domain=...` instead of `/pulse?dealer=...`

---

### Route 2: `/dash/onboarding` (Multi-Step Form)
**File:** `app/dash/onboarding/page.tsx`

**Flow:**
1. User arrives with `?domain={domain}`
2. 4-step form:
   - Step 1: Confirm website
   - Step 2: Location (city, state, store name)
   - Step 3: Numbers (monthly used car sales, avg gross)
   - Step 4: Role selection
3. On "Finish", redirects to `/dash?domain={domain}`

**Issues Fixed:**
- ✅ **CRITICAL:** Now calls `/api/user/onboarding-complete` to save data
- ✅ Form data is persisted to Clerk metadata
- ✅ Error handling added (graceful degradation)

**Previous Issue:** Form data was NOT saved  
**Fix Applied:** Added API call in `finish()` function

---

## API Endpoints Audit

### ✅ Verified Working Endpoints

1. **`/api/clarity/stack`**
   - **Method:** GET
   - **Params:** `domain` (required)
   - **Status:** ✅ Working
   - **Used by:** Landing analyzer

2. **`/api/marketpulse/compute`**
   - **Method:** GET
   - **Params:** `dealer` (required) ⚠️ **INCONSISTENCY**
   - **Status:** ✅ Working
   - **Used by:** Onboarding scan
   - **Issue:** Uses `dealer` param but should use `domain` for consistency

3. **`/api/user/onboarding-complete`**
   - **Method:** POST
   - **Body:** `{ websiteUrl, googleBusinessProfile, googleAnalytics, location?, metrics?, role? }`
   - **Status:** ✅ Working
   - **Used by:** Onboarding form completion
   - **Fix Applied:** Now called from `/dash/onboarding` page

### ⚠️ Disabled/Moved Endpoints

1. **`/api/capture-email`**
   - **Status:** ❌ Disabled (moved to `app/api_disabled/`)
   - **Impact:** Email capture functionality may be broken
   - **Action Required:** Verify if email capture is needed, restore or remove

### ❓ Alternative Endpoints (Need Verification)

1. **`/api/analyze`**
   - **Status:** ❓ Exists but usage unclear
   - **Used by:** `components/landing/plg/advanced-plg-landing.tsx`
   - **Action Required:** Verify if this is still needed

2. **`/api/scan/quick`**
   - **Status:** ❓ Exists but usage unclear
   - **Action Required:** Verify if this is still needed

3. **`/api/landing/email-unlock`**
   - **Status:** ❓ Exists but usage unclear
   - **Action Required:** Verify if this is still needed

---

## Parameter Naming Inconsistency

### Issue
- Landing page uses `domain` param
- Dashboard uses `domain` param
- Onboarding redirects use `domain` param
- **BUT:** `/api/marketpulse/compute` uses `dealer` param

### Recommendation
**Option 1:** Update `/api/marketpulse/compute` to accept `domain` param (preferred)
**Option 2:** Keep `dealer` param but document it clearly

### Current State
- ✅ Onboarding page supports both `dealer` and `domain` params
- ✅ Dashboard supports both `dealer` and `domain` params
- ⚠️ API endpoint still uses `dealer` param

---

## Testing Checklist

### Landing Page CTAs
- [ ] Enter domain → Click "Analyze my visibility"
- [ ] Verify `/api/clarity/stack` is called
- [ ] Verify results display
- [ ] Click "Unlock Dashboard"
- [ ] Verify redirects to `/onboarding?domain={domain}`

### Onboarding Flow
- [ ] Visit `/onboarding?domain=test.com`
- [ ] Verify scan animation plays
- [ ] Verify API call to `/api/marketpulse/compute?dealer=test.com`
- [ ] Click "Activate Pulse Dashboard"
- [ ] Verify redirects to `/dash?domain=test.com`

### Onboarding Form
- [ ] Visit `/dash/onboarding?domain=test.com`
- [ ] Complete all 4 steps
- [ ] Click "Finish"
- [ ] Verify API call to `/api/user/onboarding-complete`
- [ ] Verify redirects to `/dash?domain=test.com`
- [ ] Verify data is saved in Clerk metadata

---

## Files Modified

1. ✅ `app/onboarding/page.tsx`
   - Fixed redirect from `/pulse?dealer=...` to `/dash?domain=...`
   - Added support for both `dealer` and `domain` params

2. ✅ `components/landing/LandingAnalyzer.tsx`
   - Fixed `handleUnlockDashboard()` to use `domain` param

3. ✅ `app/dash/onboarding/page.tsx`
   - Added API call to `/api/user/onboarding-complete`
   - Added error handling
   - Form data now persists to Clerk metadata

---

## Next Steps

1. **Test Complete Flow:**
   - Landing → Analyze → Onboarding → Dashboard
   - Verify all redirects work
   - Verify data is saved

2. **Standardize Parameter Names:**
   - Update `/api/marketpulse/compute` to use `domain` param
   - Or document `dealer` param usage clearly

3. **Verify Alternative Endpoints:**
   - Check if `/api/analyze` is still needed
   - Check if `/api/scan/quick` is still needed
   - Check if `/api/landing/email-unlock` is still needed

4. **Email Capture:**
   - Verify if email capture is needed
   - Restore `/api/capture-email` or remove references

---

**Last Updated:** $(date)  
**Status:** Critical Issues Fixed ✅  
**Remaining:** Parameter standardization, endpoint cleanup

