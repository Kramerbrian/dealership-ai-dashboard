# Onboarding Flow Audit

## Overview
This document audits the complete onboarding flow, including routes, API endpoints, redirects, and user experience.

---

## Onboarding Routes

### 1. `/onboarding` (Root)
**File:** `app/onboarding/page.tsx`

**Purpose:** Cinematic diagnostic scan experience

**Flow:**
1. User arrives with `?dealer={domain}` param
2. Shows cinematic intro animation
3. Fetches KPI data from `/api/marketpulse/compute`
4. Displays animated scan steps
5. Shows AIV and ATI scores
6. Displays "Activate Pulse Dashboard" CTA

**API Endpoints Called:**
- **GET** `/api/marketpulse/compute?dealer={dealer}`

**Redirect After Completion:**
- **CTA Link:** `/dash?domain={dealer}` (uses `domain` param, not `dealer`)
- **Status:** ✅ **FIXED** - Now uses `domain` param

**Issues Found:**
- ✅ **FIXED:** Redirect was using `dealer` param, now uses `domain`
- ⚠️ **NEEDS VERIFICATION:** Verify `/api/marketpulse/compute` endpoint works
- ⚠️ **NEEDS VERIFICATION:** Check if `dealer` param handling is correct

---

### 2. `/dash/onboarding` (Dashboard Route)
**File:** `app/dash/onboarding/page.tsx`

**Purpose:** Multi-step onboarding form

**Flow:**
1. User arrives with `?domain={domain}` param
2. Shows 4-step form:
   - Step 1: Confirm website
   - Step 2: Location (city, state, store name)
   - Step 3: Numbers (monthly used car sales, avg gross)
   - Step 4: Role selection
3. On completion, redirects to `/dash?domain={domain}`

**API Endpoints Called:**
- **None** - This is a client-side form only
- **TODO:** Should call `/api/user/onboarding-complete` to save data

**Redirect After Completion:**
- **Function:** `finish()` in component
- **Route:** `/dash?domain={domain}`
- **Status:** ✅ **VERIFIED** - Uses `domain` param correctly

**Issues Found:**
- ❌ **CRITICAL:** Form data is not saved to backend
- ❌ **CRITICAL:** No API call to persist onboarding data
- ⚠️ **NEEDS VERIFICATION:** Check if Clerk metadata is updated

---

## API Endpoints

### 1. `/api/marketpulse/compute`
**Method:** GET  
**Query Params:** `dealer` (required)

**Purpose:** Computes market pulse data for onboarding display

**Response:**
```json
{
  "dealer": "string",
  "timestamp": "string",
  "aiv": number,
  "ati": number,
  "metrics": {
    "schemaCoverage": number,
    "trustScore": number,
    "cwv": number,
    "ugcHealth": number,
    "geoIntegrity": number,
    "zeroClick": number
  },
  "summary": "string",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}
```

**Status:** ✅ **VERIFIED** - Endpoint exists

**Issues:**
- ⚠️ Uses `dealer` param but onboarding redirect uses `domain` - **INCONSISTENCY**

---

### 2. `/api/user/onboarding-complete`
**Method:** POST  
**Body:** `{ websiteUrl?: string, googleBusinessProfile?: string, googleAnalytics?: boolean }`

**Purpose:** Marks onboarding as complete and saves form data to Clerk metadata

**Response:**
```json
{
  "ok": boolean,
  "message": "string",
  "metadata": { ... }
}
```

**Status:** ✅ **VERIFIED** - Endpoint exists in `app/api/user/onboarding-complete/route.ts`

**Issues:**
- ❌ **CRITICAL:** `/dash/onboarding` page does NOT call this endpoint
- ⚠️ **NEEDS VERIFICATION:** Verify endpoint actually updates Clerk metadata

---

## Onboarding Flow Diagram

```
User Journey:
    │
    ├─> Landing Page ──> Email Capture ──> Sign In
    │                                           │
    │                                           └─> /onboarding?dealer={domain}
    │                                                       │
    │                                                       ├─> /api/marketpulse/compute?dealer={domain}
    │                                                       │
    │                                                       └─> [Activate Pulse Dashboard] ──> /dash?domain={domain}
    │
    └─> Direct Dashboard Access ──> /dash?domain={domain}
                                            │
                                            └─> (If onboarding incomplete) ──> /dash/onboarding?domain={domain}
                                                                                    │
                                                                                    ├─> [4-Step Form]
                                                                                    │
                                                                                    └─> [Finish] ──> /dash?domain={domain}
                                                                                                        │
                                                                                                        └─> ❌ NO API CALL TO SAVE DATA
```

---

## Issues Found

### Critical Issues ❌

1. **Onboarding Data Not Saved**
   - **Location:** `app/dash/onboarding/page.tsx`
   - **Issue:** Form completion does NOT call `/api/user/onboarding-complete`
   - **Impact:** User data is lost, onboarding status not saved
   - **Fix Required:** Add API call in `finish()` function

2. **Parameter Inconsistency**
   - **Location:** Multiple files
   - **Issue:** `/onboarding` uses `dealer` param, but redirects use `domain`
   - **Impact:** Potential data loss or incorrect domain handling
   - **Status:** ✅ **FIXED** - Redirect now uses `domain` param

### High Priority Issues ⚠️

3. **Missing Error Handling**
   - **Location:** `app/onboarding/page.tsx`
   - **Issue:** API failures may not be handled gracefully
   - **Impact:** Poor user experience on errors
   - **Fix Required:** Add comprehensive error handling

4. **No Loading States**
   - **Location:** `app/dash/onboarding/page.tsx`
   - **Issue:** Form submission may not show loading state
   - **Impact:** Users may click multiple times
   - **Fix Required:** Add loading state during form submission

5. **Clerk Metadata Not Updated**
   - **Location:** `app/dash/onboarding/page.tsx`
   - **Issue:** Onboarding completion doesn't update Clerk metadata
   - **Impact:** User may be redirected back to onboarding
   - **Fix Required:** Call `/api/user/onboarding-complete` endpoint

### Medium Priority Issues ⚠️

6. **Parameter Naming Inconsistency**
   - **Location:** `/api/marketpulse/compute`
   - **Issue:** Uses `dealer` param but other endpoints use `domain`
   - **Impact:** Confusion, potential bugs
   - **Recommendation:** Standardize on `domain` param

7. **No Form Validation**
   - **Location:** `app/dash/onboarding/page.tsx`
   - **Issue:** Form fields may not be validated
   - **Impact:** Invalid data may be submitted
   - **Fix Required:** Add client-side validation

---

## Testing Checklist

### `/onboarding` Route
- [ ] Visit `/onboarding?dealer=test.com`
- [ ] Verify cinematic intro displays
- [ ] Verify API call to `/api/marketpulse/compute?dealer=test.com`
- [ ] Verify scan animation plays
- [ ] Verify AIV and ATI scores display
- [ ] Click "Activate Pulse Dashboard"
- [ ] Verify redirects to `/dash?domain=test.com` (not `dealer`)
- [ ] Test with missing `dealer` param
- [ ] Test with invalid domain

### `/dash/onboarding` Route
- [ ] Visit `/dash/onboarding?domain=test.com`
- [ ] Verify form displays
- [ ] Complete Step 1 (Website)
- [ ] Complete Step 2 (Location)
- [ ] Complete Step 3 (Numbers)
- [ ] Complete Step 4 (Role)
- [ ] Click "Finish"
- [ ] Verify redirects to `/dash?domain=test.com`
- [ ] **CRITICAL:** Verify API call to `/api/user/onboarding-complete` (currently missing)
- [ ] Test form validation
- [ ] Test with missing `domain` param

### API Endpoints
- [ ] Test `/api/marketpulse/compute?dealer=test.com`
- [ ] Verify returns correct data structure
- [ ] Test `/api/user/onboarding-complete` (POST)
- [ ] Verify updates Clerk metadata
- [ ] Test error handling

### Redirect Flow
- [ ] Test onboarding → dashboard redirect
- [ ] Verify `domain` parameter is preserved
- [ ] Test sign-in → onboarding redirect
- [ ] Verify domain parameter flows through

---

## Recommendations

### 1. Fix Critical Issues (Immediate)
1. **Add API Call to Save Onboarding Data**
   ```typescript
   // In app/dash/onboarding/page.tsx finish() function
   async function finish() {
     // Save onboarding data
     const response = await fetch('/api/user/onboarding-complete', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         websiteUrl: domain,
         // ... other form data
       })
     });
     
     if (response.ok) {
       const qs = new URLSearchParams();
       if (domain) qs.set('domain', domain);
       router.push(qs.toString() ? `/dash?${qs.toString()}` : '/dash');
     } else {
       // Handle error
     }
   }
   ```

2. **Standardize Parameter Names**
   - Change `/api/marketpulse/compute` to use `domain` param instead of `dealer`
   - Or update onboarding page to use `domain` param consistently

### 2. Improve Error Handling
- Add try-catch blocks around API calls
- Show user-friendly error messages
- Add retry mechanisms for failed API calls

### 3. Add Form Validation
- Validate email format (if email field exists)
- Validate required fields
- Show validation errors inline

### 4. Add Loading States
- Show loading spinner during API calls
- Disable form submission during processing
- Show success/error messages

### 5. Add Analytics
- Track onboarding completion rate
- Track which step users drop off
- Track time to complete onboarding

---

## Code Changes Required

### 1. Fix `/dash/onboarding/page.tsx`
```typescript
async function finish() {
  try {
    // Save onboarding data
    const response = await fetch('/api/user/onboarding-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteUrl: domain,
        location: { city, state, storeName },
        metrics: { monthlyUsed, avgGross },
        role
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save onboarding data');
    }
    
    const qs = new URLSearchParams();
    if (domain) qs.set('domain', domain);
    router.push(qs.toString() ? `/dash?${qs.toString()}` : '/dash');
  } catch (error) {
    console.error('Onboarding save error:', error);
    // Show error message to user
  }
}
```

### 2. Standardize Parameter Names
- Update `/api/marketpulse/compute` to accept `domain` param (or keep `dealer` but document it)
- Update `/onboarding` page to use consistent param name

---

## Next Steps

1. **Fix Critical Issues:**
   - Add API call to save onboarding data
   - Fix parameter inconsistencies

2. **Test Complete Flow:**
   - Test landing → email → sign-in → onboarding → dashboard
   - Verify all redirects work
   - Verify data is saved

3. **Improve Error Handling:**
   - Add comprehensive error handling
   - Add loading states
   - Add form validation

---

**Last Updated:** $(date)  
**Status:** Critical Issues Found - Fixes Required  
**Priority:** High

