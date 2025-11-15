# Landing Page CTA & Endpoint Audit

## Overview
This document audits all CTAs (Call-to-Action buttons/links) and their associated API endpoints on the landing page.

---

## Landing Page Files

### Primary Landing Pages
1. **`app/page.tsx`** - Root landing page
2. **`app/(marketing)/page.tsx`** - Marketing route landing page
3. **`components/landing/LandingAnalyzer.tsx`** - Main analyzer component

---

## CTAs Identified

### 1. Domain Analyzer CTA
**Location:** `components/landing/LandingAnalyzer.tsx`

**CTA Text:** "Analyze" or similar

**Action:**
- User enters domain
- Clicks "Analyze" button
- Triggers domain analysis

**Endpoint Called:**
- **Primary:** `/api/clarity/stack?domain={domain}`
- **Alternative:** `/api/analyze?domain={domain}` (if exists)
- **Alternative:** `/api/scan/quick?domain={domain}` (if exists)

**Expected Behavior:**
- [ ] Shows loading state
- [ ] Displays analysis results
- [ ] Shows preview scores (AVI, SEO, AEO, GEO)
- [ ] Displays revenue at risk
- [ ] Shows "Get Full Dashboard" CTA after results

**Status:** ⚠️ **NEEDS VERIFICATION**
- Verify which endpoint is actually called
- Check if endpoint returns expected data structure
- Verify error handling

---

### 2. Email Capture CTA
**Location:** After analysis results or as unlock mechanism

**CTA Text:** "Get Full Dashboard" or "Unlock Dashboard"

**Action:**
- User clicks CTA
- Email input appears (or redirects to sign-in)
- Email is captured

**Endpoint Called:**
- **Primary:** `/api/capture-email` (POST)
- **Body:** `{ email: string, domain?: string }`

**Expected Behavior:**
- [ ] Email input field appears
- [ ] Email is validated
- [ ] Email is sent to backend
- [ ] Success message or redirect occurs
- [ ] Redirects to `/sign-in` or `/onboarding`

**Status:** ⚠️ **NEEDS VERIFICATION**
- Verify endpoint exists and works
- Check email validation
- Verify redirect flow

---

### 3. Sign-In CTA
**Location:** After email capture or direct link

**CTA Text:** "Sign In" or "Get Started"

**Action:**
- Redirects to Clerk sign-in
- Or shows sign-in form

**Endpoint Called:**
- **Clerk:** `/sign-in` (Clerk route)
- **Custom:** `/api/auth/signin` (if custom auth)

**Expected Behavior:**
- [ ] Redirects to Clerk sign-in page
- [ ] After sign-in, redirects to dashboard
- [ ] Domain parameter preserved in redirect

**Status:** ✅ **VERIFIED** (if using Clerk)

---

### 4. Direct Dashboard Access
**Location:** Various places (header, footer, etc.)

**CTA Text:** "Dashboard" or "View Dashboard"

**Action:**
- Direct link to `/dash`
- May require authentication

**Endpoint Called:**
- **Route:** `/dash?domain={domain}`
- **API:** `/api/clarity/stack?domain={domain}` (server-side)

**Expected Behavior:**
- [ ] If not authenticated, redirects to `/sign-in`
- [ ] If authenticated, loads dashboard
- [ ] Domain parameter preserved

**Status:** ✅ **VERIFIED**

---

## API Endpoints Used

### 1. `/api/clarity/stack`
**Method:** GET  
**Query Params:** `domain` (required), `tenant?`, `role?`

**Purpose:** Returns complete clarity stack data for a domain

**Response Structure:**
```json
{
  "domain": "string",
  "scores": { "seo": number, "aeo": number, "geo": number, "avi": number },
  "gbp": { "health_score": number, ... },
  "ugc": { "score": number, ... },
  "schema": { "score": number, ... },
  "competitive": { "rank": number, ... },
  "revenue_at_risk": { "monthly": number, "annual": number },
  "ai_intro_current": "string",
  "ai_intro_improved": "string"
}
```

**Status:** ✅ **VERIFIED** - Endpoint exists and returns correct structure

---

### 2. `/api/capture-email`
**Method:** POST  
**Body:** `{ email: string, domain?: string }`

**Purpose:** Captures user email for lead generation

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Status:** ⚠️ **NEEDS VERIFICATION**
- Check if endpoint exists
- Verify email validation
- Check if email is stored/forwarded

---

### 3. `/api/analyze`
**Method:** POST (or GET)  
**Query/Body:** `{ domain: string }`

**Purpose:** Alternative analysis endpoint (if exists)

**Status:** ❓ **UNKNOWN** - Need to verify if this exists

---

### 4. `/api/scan/quick`
**Method:** GET  
**Query Params:** `domain` (required)

**Purpose:** Quick scan endpoint (if exists)

**Status:** ❓ **UNKNOWN** - Need to verify if this exists

---

### 5. `/api/marketpulse/compute`
**Method:** GET  
**Query Params:** `dealer` (required)

**Purpose:** Computes market pulse data for onboarding

**Response:**
```json
{
  "dealer": "string",
  "timestamp": "string",
  "aiv": number,
  "ati": number,
  "metrics": { ... },
  "summary": "string",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}
```

**Status:** ✅ **VERIFIED** - Used in onboarding flow

---

## CTA Flow Diagram

```
Landing Page
    │
    ├─> [Enter Domain] ──> [Analyze Button]
    │                           │
    │                           ├─> /api/clarity/stack?domain=...
    │                           │
    │                           └─> [Show Results]
    │                                       │
    │                                       ├─> [Get Full Dashboard CTA]
    │                                       │
    │                                       └─> /api/capture-email
    │                                                   │
    │                                                   └─> /sign-in
    │                                                           │
    │                                                           └─> /onboarding?dealer=...
    │                                                                   │
    │                                                                   └─> /dash?domain=...
    │
    └─> [Sign In] ──> /sign-in ──> /dash?domain=...
```

---

## Issues Found

### 1. Missing Endpoint Verification
- [ ] Verify `/api/capture-email` exists and works
- [ ] Check if `/api/analyze` exists (alternative endpoint)
- [ ] Check if `/api/scan/quick` exists (alternative endpoint)

### 2. CTA Redirect Flow
- [ ] Verify email capture → sign-in redirect works
- [ ] Check if domain parameter is preserved through redirects
- [ ] Verify onboarding → dashboard redirect uses correct param (`domain` not `dealer`)

### 3. Error Handling
- [ ] Check if API errors are handled gracefully
- [ ] Verify loading states appear during API calls
- [ ] Check if invalid domains show helpful error messages

### 4. Analytics/Tracking
- [ ] Verify CTA clicks are tracked (if using analytics)
- [ ] Check if email captures are logged
- [ ] Verify conversion tracking works

---

## Testing Checklist

### Domain Analyzer CTA
- [ ] Enter valid domain → Click "Analyze"
- [ ] Verify loading state appears
- [ ] Verify results display correctly
- [ ] Check API endpoint called matches expected
- [ ] Test with invalid domain
- [ ] Test with empty domain

### Email Capture CTA
- [ ] Click "Get Full Dashboard" after analysis
- [ ] Verify email input appears
- [ ] Enter valid email → Submit
- [ ] Verify email is captured
- [ ] Check redirect to sign-in
- [ ] Test with invalid email format
- [ ] Test with empty email

### Sign-In Flow
- [ ] After email capture, verify redirect to `/sign-in`
- [ ] Complete sign-in
- [ ] Verify redirect to dashboard or onboarding
- [ ] Check domain parameter is preserved

### Direct Dashboard Access
- [ ] Click "Dashboard" link (if authenticated)
- [ ] Verify loads `/dash` with domain
- [ ] If not authenticated, verify redirect to sign-in

---

## Recommendations

### 1. Standardize Endpoint Usage
- **Recommendation:** Use `/api/clarity/stack` as the primary analysis endpoint
- **Action:** Remove or deprecate alternative endpoints if they exist
- **Benefit:** Single source of truth for clarity data

### 2. Improve Error Handling
- **Recommendation:** Add comprehensive error handling for all API calls
- **Action:** Show user-friendly error messages
- **Benefit:** Better user experience when things go wrong

### 3. Add Loading States
- **Recommendation:** Ensure all CTAs show loading states
- **Action:** Add spinners/loading indicators during API calls
- **Benefit:** Users know the system is working

### 4. Preserve Domain Parameter
- **Recommendation:** Ensure domain parameter flows through entire journey
- **Action:** Verify all redirects preserve `domain` param
- **Benefit:** Seamless user experience

### 5. Add Analytics Tracking
- **Recommendation:** Track CTA clicks and conversions
- **Action:** Add event tracking for all CTAs
- **Benefit:** Better understanding of user behavior

---

## Next Steps

1. **Verify Endpoints:**
   ```bash
   # Test clarity stack endpoint
   curl "http://localhost:3000/api/clarity/stack?domain=test.com"
   
   # Test email capture endpoint
   curl -X POST "http://localhost:3000/api/capture-email" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","domain":"test.com"}'
   ```

2. **Test CTA Flows:**
   - Manually test each CTA
   - Verify redirects work correctly
   - Check domain parameter preservation

3. **Fix Issues:**
   - Address any missing endpoints
   - Fix redirect flows
   - Improve error handling

---

**Last Updated:** $(date)  
**Status:** In Progress  
**Next Review:** After endpoint verification

