# Mystery Shop Guide - Step-by-Step User Journey

## Overview

This document provides a complete step-by-step guide for mystery shopping the DealershipAI platform. Use this to verify the entire user journey from landing page to dashboard completion.

## Pre-Shop Checklist

- [ ] Clear browser cache and cookies
- [ ] Use incognito/private browsing mode
- [ ] Have a test email address ready
- [ ] Note start time for journey tracking

---

## Step 1: Landing Page Experience

### 1.1 Initial Visit
**URL:** `https://dealershipai.com`

**Expected Behavior:**
- [ ] Page loads without errors
- [ ] Headline displays: "dealershipAI provides clarity in a world of digital noise"
- [ ] Subheadline displays: "The future isn't to 'make better dashboards.' - It's to make dashboards obsolete."
- [ ] AI analyzer input field is visible
- [ ] "Analyze" button is present
- [ ] Map placeholder shows (no broken Mapbox errors)

### 1.2 AI Analyzer Interaction
**Action:** Enter a dealership domain (e.g., `toyota-naples.com`)

**Expected Behavior:**
- [ ] Input accepts domain
- [ ] "Analyze" button is clickable
- [ ] Clicking "Analyze" triggers scan
- [ ] Loading state appears
- [ ] Results display after scan completes

### 1.3 Clarity Preview
**Expected Elements:**
- [ ] AI Visibility Index (AVI) score displayed
- [ ] Revenue at Risk amount shown
- [ ] Priority actions listed
- [ ] "Get Full Dashboard" CTA visible

### 1.4 Email Capture (Unlock)
**Action:** Click "Get Full Dashboard" or similar CTA

**Expected Behavior:**
- [ ] Email input field appears
- [ ] Submit button works
- [ ] Success message or redirect occurs
- [ ] Email is captured (check backend logs)

**Test Email:** `mystery-shop-{timestamp}@test.com`

---

## Step 2: Authentication Flow

### 2.1 Sign-In Redirect
**Expected Behavior:**
- [ ] After email capture, redirects to `/sign-in`
- [ ] Clerk sign-in page loads
- [ ] No authentication errors
- [ ] Sign-in form is functional

### 2.2 Authentication Options
**Available Methods:**
- [ ] Google OAuth (if configured)
- [ ] Email/password (if configured)
- [ ] Magic link (if configured)

**Action:** Complete authentication

**Expected Behavior:**
- [ ] Authentication succeeds
- [ ] Redirects to dashboard
- [ ] No infinite redirect loops
- [ ] User session is established

---

## Step 3: Dashboard Entry

### 3.1 Initial Dashboard Load
**URL:** `https://dash.dealershipai.com/dash` or `/dash` after auth

**Expected Behavior:**
- [ ] Dashboard loads without errors
- [ ] Clerk authentication is verified
- [ ] Dashboard shell/navigation appears
- [ ] Pulse overview content loads

### 3.2 Dashboard Navigation
**Expected Navigation Items:**
- [ ] "Pulse" tab (active on `/dash`)
- [ ] "Autopilot" tab (links to `/dash/autopilot`)
- [ ] "AI Story" tab (links to `/dash/insights/ai-story`)

**Action:** Click each navigation item

**Expected Behavior:**
- [ ] Navigation works without errors
- [ ] Active tab is highlighted
- [ ] Page content updates correctly
- [ ] No 404 errors
- [ ] URL updates in browser

---

## Step 4: Pulse Dashboard

### 4.1 Pulse Overview Display
**Expected Elements:**
- [ ] Domain name displayed
- [ ] Score cards (SEO, AEO, GEO, AVI)
- [ ] Revenue at Risk section
- [ ] GBP Health metrics
- [ ] UGC Score
- [ ] Schema Score
- [ ] Competitive Position
- [ ] Priority Actions list

### 4.2 Data Loading
**Expected Behavior:**
- [ ] Data loads from `/api/clarity/stack`
- [ ] No "Failed to load" errors
- [ ] Scores display as numbers (0-100)
- [ ] All sections populate with data
- [ ] Loading states appear during fetch

### 4.3 Pulse Cards
**Expected Elements:**
- [ ] Pulse cards grid displays
- [ ] Cards show severity (low/medium/high/critical)
- [ ] Each card has:
  - Title
  - Summary
  - Why it matters
  - Recommended action
  - Estimated impact

**Action:** Click on a pulse card

**Expected Behavior:**
- [ ] Card expands or opens detail view
- [ ] More information displays
- [ ] No errors occur

---

## Step 5: Onboarding Flow

### 5.1 Onboarding Entry
**URL:** `/dash/onboarding` or redirect from landing

**Expected Behavior:**
- [ ] Onboarding page loads
- [ ] Multi-step form displays
- [ ] Step 1 is active
- [ ] Progress indicator shows

### 5.2 Onboarding Steps
**Step 1: Domain Input**
- [ ] Input field for dealership domain
- [ ] Validation works
- [ ] "Next" button enabled after valid input

**Step 2: Location**
- [ ] City/State input fields
- [ ] Location validation
- [ ] "Next" button works

**Step 3: Brand Selection**
- [ ] Brand dropdown or input
- [ ] Selection works
- [ ] "Next" button works

**Step 4: Metrics Review**
- [ ] Displays fetched KPI data
- [ ] Metrics are accurate
- [ ] "Continue" button works

**Step 5: Completion**
- [ ] Success message displays
- [ ] "Go to Dashboard" button appears

### 5.3 Onboarding Completion Redirect
**Action:** Click "Go to Dashboard" or complete final step

**Expected Behavior:**
- [ ] Redirects to `/dash` (Pulse overview)
- [ ] Dashboard loads with user's data
- [ ] No redirect loops
- [ ] Domain from onboarding is used

**Current Issue:** ⚠️ Verify redirect goes to `/dash` not `/dashboard`

---

## Step 6: Autopilot Page

### 6.1 Autopilot Access
**URL:** `/dash/autopilot`

**Expected Behavior:**
- [ ] Page loads without errors
- [ ] Autopilot panel displays
- [ ] Domain context is preserved
- [ ] Navigation remains visible

### 6.2 Autopilot Content
**Expected Elements:**
- [ ] Autopilot summary/description
- [ ] Active fixes or actions
- [ ] Status indicators
- [ ] Action buttons (if applicable)

---

## Step 7: AI Story Page

### 7.1 AI Story Access
**URL:** `/dash/insights/ai-story`

**Expected Behavior:**
- [ ] Page loads without errors
- [ ] AI Story content displays
- [ ] Before/After comparison shows
- [ ] Navigation remains visible

### 7.2 AI Story Content
**Expected Elements:**
- [ ] "How AI Currently Describes You" section
- [ ] "How AI Should Describe You" section
- [ ] Comparison or timeline view
- [ ] Improvement recommendations

---

## Step 8: API Endpoint Verification

### 8.1 Clarity Stack API
**URL:** `/api/clarity/stack?domain=test.com`

**Expected Response:**
```json
{
  "domain": "test.com",
  "scores": {
    "seo": 75,
    "aeo": 68,
    "geo": 72,
    "avi": 71
  },
  "gbp": { ... },
  "ugc": { ... },
  "schema": { ... },
  "competitive": { ... },
  "revenue_at_risk": { ... }
}
```

**Check:**
- [ ] Endpoint returns 200 status
- [ ] Response format matches expected schema
- [ ] All required fields present
- [ ] No CORS errors

### 8.2 Pulse API Endpoints
**URLs to Test:**
- `/api/analyzePulseTelemetry?domain=test.com`
- `/api/getPulseMetrics?domain=test.com`
- `/api/pulse/snapshot?tenant=default`

**Expected Behavior:**
- [ ] All endpoints return valid JSON
- [ ] No 404 or 500 errors
- [ ] Response format matches component expectations

---

## Step 9: Error Scenarios

### 9.1 Unauthenticated Access
**Action:** Try to access `/dash` without signing in

**Expected Behavior:**
- [ ] Redirects to `/sign-in`
- [ ] No dashboard content visible
- [ ] Redirect URL preserved for after login

### 9.2 Invalid Domain
**Action:** Enter invalid domain in analyzer

**Expected Behavior:**
- [ ] Validation error displays
- [ ] User-friendly error message
- [ ] Form doesn't submit

### 9.3 API Failure
**Action:** Simulate API failure (disable network)

**Expected Behavior:**
- [ ] Error message displays
- [ ] User can retry
- [ ] No blank screen
- [ ] Graceful degradation

---

## Step 10: Complete Journey Test

### 10.1 Full Flow
1. [ ] Land on `dealershipai.com`
2. [ ] Enter domain in analyzer
3. [ ] View clarity preview
4. [ ] Submit email for unlock
5. [ ] Complete sign-in
6. [ ] Land on dashboard
7. [ ] View Pulse overview
8. [ ] Navigate to Autopilot
9. [ ] Navigate to AI Story
10. [ ] Complete onboarding (if not done)
11. [ ] Verify redirect to dashboard after onboarding

### 10.2 Data Persistence
**Check:**
- [ ] Domain persists across pages
- [ ] User data loads correctly
- [ ] Navigation state maintained
- [ ] No data loss on refresh

---

## Issues to Document

### Current Known Issues
1. ⚠️ **Onboarding Redirect:** Verify redirect goes to `/dash` not `/dashboard`
2. ⚠️ **Pulse API Mismatch:** Check if components call correct endpoints
3. ⚠️ **Dashboard Routing:** Verify all routes work correctly

### Issue Tracking Template
```
Issue #: [Number]
Location: [Page/Component]
Description: [What's wrong]
Steps to Reproduce: [How to see it]
Expected: [What should happen]
Actual: [What actually happens]
Severity: [Critical/High/Medium/Low]
Status: [Open/Fixed/In Progress]
```

---

## Success Criteria

### Must Have (Critical)
- [ ] Landing page loads without errors
- [ ] Authentication works end-to-end
- [ ] Dashboard loads after login
- [ ] All navigation links work
- [ ] API endpoints return data
- [ ] Onboarding completes and redirects correctly

### Should Have (High Priority)
- [ ] All Pulse cards display
- [ ] Data loads correctly
- [ ] No console errors
- [ ] Responsive design works
- [ ] Loading states appear

### Nice to Have (Medium Priority)
- [ ] Smooth animations
- [ ] Fast load times
- [ ] Error messages are helpful
- [ ] Accessibility features work

---

## Testing Checklist Summary

**Landing Page:**
- [ ] Loads correctly
- [ ] Analyzer works
- [ ] Email capture works

**Authentication:**
- [ ] Sign-in works
- [ ] Redirects correctly
- [ ] Session persists

**Dashboard:**
- [ ] Loads after auth
- [ ] Navigation works
- [ ] All pages accessible

**Onboarding:**
- [ ] Multi-step flow works
- [ ] Redirects to `/dash` after completion
- [ ] Data persists

**API Endpoints:**
- [ ] All endpoints return data
- [ ] No mismatches between components and APIs
- [ ] Error handling works

---

## Notes

- Test with different browsers (Chrome, Firefox, Safari)
- Test on mobile devices
- Test with slow network (throttle in DevTools)
- Document any visual bugs or UX issues
- Note performance issues (slow loads, laggy interactions)

---

**Last Updated:** $(date)
**Version:** 1.0
**Status:** Active

