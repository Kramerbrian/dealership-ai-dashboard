# Pulse Cards Dashboard - Test Checklist

## ✅ Pre-Test Setup

### 1. Environment Variables
Verify `.env.local` has:
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_KEY`

### 2. Start Dev Server
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] No TypeScript compilation errors
- [ ] Server accessible at `http://localhost:3000`

---

## 🧪 Test 1: Authentication & Access

### Test Case: Unauthenticated Access
1. Open incognito/private window
2. Navigate to `http://localhost:3000/drive`
3. **Expected:** Redirected to Clerk sign-in page

### Test Case: Authenticated Access
1. Sign in with Clerk
2. Navigate to `http://localhost:3000/drive`
3. **Expected:** 
   - [ ] Page loads without redirect
   - [ ] Header shows "DealershipAI • Drive"
   - [ ] Navigation buttons visible (Dashboard, Onboarding)

---

## 🧪 Test 2: Pulse Cards Loading

### Test Case: API Call
1. Open browser DevTools → Network tab
2. Navigate to `/drive`
3. **Expected:**
   - [ ] API call to `/api/pulse/snapshot` appears
   - [ ] Response status: `200 OK`
   - [ ] Response body contains `{ ok: true, snapshot: { pulses: [...] } }`

### Test Case: Loading State
1. Navigate to `/drive`
2. **Expected:**
   - [ ] Loading skeletons appear (3 cards)
   - [ ] Skeleton cards have pulse animation
   - [ ] Cards disappear when data loads

### Test Case: Pulse Cards Render
1. Wait for loading to complete
2. **Expected:**
   - [ ] Pulse cards appear (at least 1 card)
   - [ ] Each card shows:
     - [ ] Headline (title)
     - [ ] Subhead (diagnosis)
     - [ ] Impact metric (e.g., "$8.2K/mo")
     - [ ] Effort metric (e.g., "2min")
     - [ ] Severity indicator (color-coded border)
     - [ ] "Fix" button (primary)
     - [ ] "Explain" button (secondary)

---

## 🧪 Test 3: Pulse Card Interactions

### Test Case: Fix Button
1. Click "Fix" on any pulse card
2. **Expected:**
   - [ ] Fix drawer opens (modal overlay)
   - [ ] Drawer shows:
     - [ ] Summary (headline)
     - [ ] Diff (diagnosis + prescription)
     - [ ] "Apply" button
     - [ ] "Cancel" button

### Test Case: Apply Fix
1. Open fix drawer
2. Click "Apply"
3. **Expected:**
   - [ ] Drawer closes
   - [ ] Impact Ledger updates (right sidebar)
   - [ ] New entry appears with:
     - [ ] Action description
     - [ ] Revenue delta (e.g., "$8.2K/mo")
     - [ ] Timestamp
   - [ ] Easter egg may appear (if triggered)

### Test Case: Cancel Fix
1. Open fix drawer
2. Click "Cancel" or click outside drawer
3. **Expected:**
   - [ ] Drawer closes
   - [ ] No changes to ledger

### Test Case: Explain Button
1. Click "Explain" on any pulse card
2. **Expected:**
   - [ ] Console log appears (for now)
   - [ ] No errors in console

---

## 🧪 Test 4: Impact Ledger

### Test Case: Empty State
1. Navigate to `/drive` (fresh session)
2. **Expected:**
   - [ ] Right sidebar shows "Impact Ledger"
   - [ ] Empty state: "No actions yet"

### Test Case: After Applying Fix
1. Apply a fix (see Test 3)
2. **Expected:**
   - [ ] Ledger shows new entry
   - [ ] Entry displays:
     - [ ] Action name
     - [ ] Revenue impact
     - [ ] Timestamp

---

## 🧪 Test 5: Error Handling

### Test Case: API Error
1. Temporarily break API (e.g., wrong endpoint)
2. Navigate to `/drive`
3. **Expected:**
   - [ ] Error caught gracefully
   - [ ] Empty state shows: "No pulse recommendations available"
   - [ ] Helpful message: "Complete onboarding to start receiving AI-powered insights"
   - [ ] No console errors (or handled errors only)

### Test Case: No Data
1. Mock API to return empty pulses array
2. Navigate to `/drive`
3. **Expected:**
   - [ ] Empty state appears
   - [ ] Message guides user to complete onboarding

---

## 🧪 Test 6: Responsive Design

### Test Case: Mobile View
1. Resize browser to mobile width (< 768px)
2. Navigate to `/drive`
3. **Expected:**
   - [ ] Pulse cards stack vertically
   - [ ] Impact Ledger hidden (or below cards)
   - [ ] Buttons remain clickable
   - [ ] Text readable

### Test Case: Desktop View
1. Resize browser to desktop width (> 1024px)
2. Navigate to `/drive`
3. **Expected:**
   - [ ] Two-column layout (cards left, ledger right)
   - [ ] Cards display side-by-side
   - [ ] Impact Ledger visible in sidebar

---

## 🧪 Test 7: Easter Eggs

### Test Case: Deep Insight Trigger
1. Ensure 3+ pulses with total impact > $15K
2. Navigate to `/drive`
3. **Expected:**
   - [ ] Easter egg message appears: "You mustn't be afraid to dream a little bigger."
   - [ ] Message appears below header
   - [ ] Message auto-dismisses after 4 seconds

### Test Case: Auto-Remediation Trigger
1. Apply a fix (see Test 3)
2. **Expected:**
   - [ ] Easter egg message appears: "Come with me if you want to fix this."
   - [ ] Message appears after fix applied
   - [ ] Message auto-dismisses after 4 seconds

---

## 🧪 Test 8: Integration with Onboarding

### Test Case: Domain from Onboarding
1. Complete onboarding with website URL
2. Navigate to `/drive`
3. **Expected:**
   - [ ] API call includes domain parameter
   - [ ] Pulse cards filtered by domain (if applicable)

### Test Case: Session Storage
1. Complete onboarding
2. Check browser DevTools → Application → Session Storage
3. **Expected:**
   - [ ] `dai:analyzer` key exists (if scan was performed)
   - [ ] Contains domain and issues data

---

## 🧪 Test 9: API Endpoints

### Test `/api/pulse/snapshot`
```bash
curl http://localhost:3000/api/pulse/snapshot \
  -H "Cookie: __session=..." \
  -H "Authorization: Bearer ..."
```
- [ ] Returns `200 OK`
- [ ] Response contains `{ ok: true, snapshot: { pulses: [...] } }`
- [ ] Pulses array has items with required fields:
  - [ ] `id`
  - [ ] `title`
  - [ ] `diagnosis`
  - [ ] `prescription`
  - [ ] `impactMonthlyUSD`
  - [ ] `etaSeconds`
  - [ ] `confidenceScore`
  - [ ] `kind`

### Test `/api/visibility/presence`
```bash
curl "http://localhost:3000/api/visibility/presence?domain=example.com"
```
- [ ] Returns `200 OK`
- [ ] Response contains engines array

### Test `/api/schema/validate`
```bash
curl "http://localhost:3000/api/schema/validate?url=https://example.com"
```
- [ ] Returns `200 OK` or `502` (if SCHEMA_ENGINE_URL not set)

### Test `/api/reviews/summary`
```bash
curl "http://localhost:3000/api/reviews/summary?domain=example.com" \
  -H "Cookie: __session=..."
```
- [ ] Returns `200 OK` (requires auth)
- [ ] Response contains review metrics

### Test `/api/ga4/summary`
```bash
curl "http://localhost:3000/api/ga4/summary?domain=example.com" \
  -H "Cookie: __session=..."
```
- [ ] Returns `200 OK` (requires auth)
- [ ] Response contains GA4 metrics

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch pulses"
**Fix:**
- Check browser console for CORS errors
- Verify authentication (Clerk session)
- Check API route is accessible
- Verify `withAuth` wrapper is working

### Issue: No pulse cards showing
**Fix:**
- Check API response in Network tab
- Verify adapters are returning data
- Check console for errors
- Verify domain parameter is passed

### Issue: Pulse cards not styled correctly
**Fix:**
- Verify Tailwind classes are compiling
- Check `PulseCard` component imports
- Verify dark mode classes are applied

### Issue: Impact Ledger not updating
**Fix:**
- Check React state updates
- Verify `setLedger` is called
- Check drawer `onApply` handler

---

## ✅ Success Criteria

All tests pass when:
- [ ] Drive page loads without errors
- [ ] Pulse cards render correctly
- [ ] API calls succeed
- [ ] Interactions work (Fix, Explain)
- [ ] Impact Ledger tracks fixes
- [ ] Error states handled gracefully
- [ ] Responsive design works
- [ ] Easter eggs trigger

---

**Status**: Ready for Testing
**Last Updated**: 2025-01-07

