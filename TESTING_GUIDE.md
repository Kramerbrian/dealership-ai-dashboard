# 🧪 Cognitive Interface 3.0 - Testing Guide

**Date:** 2025-11-09  
**Purpose:** End-to-end testing guide for the cinematic PLG UX flow

---

## 🎯 Full Flow Test

### 1. Landing Page → Clerk Auth

**Steps:**
1. Navigate to `/`
2. Verify Clerk SignIn/SignUp buttons are visible
3. Click "Sign Up" or "Sign In"
4. Complete Clerk authentication
5. Verify redirect to `/onboarding`

**Expected:**
- ✅ Landing page loads with FreeAuditWidget
- ✅ Clerk buttons are functional
- ✅ After auth, redirects to onboarding

---

### 2. Onboarding Flow

**Step 1: Dealer URL**
- Enter a valid dealership URL (e.g., `https://toyotaofnaples.com`)
- Click "Scan"
- Verify it proceeds to Step 2

**Step 2: Unlock Report**
- Choose "Share to unlock" or enter email
- Verify it proceeds to Step 3

**Step 3: Competitors**
- Select 3-5 competitors (optional)
- Click "Continue"
- Verify it proceeds to Step 4

**Step 4: PVR Metrics** ⭐ NEW
- Enter Monthly PVR Revenue (e.g., `500000`)
- Enter Monthly Ad Expense PVR (e.g., `50000`)
- Click "Continue"
- **Verify:**
  - ✅ API call to `/api/save-metrics` succeeds
  - ✅ Metrics saved to Clerk metadata
  - ✅ Proceeds to Step 5

**Step 5: Complete**
- Verify "Launch Orchestrator" button appears
- Click "Launch Orchestrator"
- Verify redirect to `/dashboard/preview`

**Error Cases:**
- Test with invalid PVR values (negative, NaN, strings)
- Test with network failure
- Verify error message appears but flow continues

---

### 3. Cinematic Sequence (`/dashboard/preview`)

#### Phase 1: TronAcknowledgment
**Expected:**
- ✅ Black screen with Tron-style grid
- ✅ "SYSTEM ACKNOWLEDGED" text
- ✅ Progress bar animates over 3 seconds
- ✅ Skip button appears after 2 seconds (top-right)
- ✅ Auto-transitions to Ready State after 3s

**Test Skip:**
- Click "SKIP" button
- Verify redirect to `/dashboard`

#### Phase 2: OrchestratorReadyState
**Expected:**
- ✅ Status grid shows: ORCHESTRATOR, PULSE ENGINE, COGNITIVE CORE
- ✅ All show "READY" status
- ✅ "PROCEED" button visible
- ✅ Skip button available

**Test:**
- Click "PROCEED" → Should go to PulseAssimilation
- Click "SKIP" → Should go to dashboard

#### Phase 3: PulseAssimilation
**Expected:**
- ✅ Shows "PULSE ASSIMILATION" title
- ✅ If loading: Shows "LOADING PULSE DATA..." with animated dots
- ✅ If error: Shows warning message but continues
- ✅ Pulse cards animate in sequentially (800ms each)
- ✅ Each pulse shows title and impact
- ✅ "ASSIMILATION COMPLETE" when done
- ✅ Auto-transitions to SystemOnlineOverlay

**Test Cases:**
- **With pulses**: Verify animation works
- **No pulses**: Verify "NO PULSES TO ASSIMILATE" message
- **Loading**: Verify loading state appears
- **Error**: Verify error message but flow continues
- **Skip**: Verify skip button works

#### Phase 4: SystemOnlineOverlay
**Expected:**
- ✅ Overlay appears with "SYSTEM ONLINE"
- ✅ Status lines: ORCHESTRATOR: ACTIVE, etc.
- ✅ "ENTER DASHBOARD" button
- ✅ Clicking button redirects to `/dashboard`

---

### 4. Error Handling Tests

#### API Error Tests
1. **Invalid PVR Values:**
   - Try negative numbers → Should show error
   - Try NaN/strings → Should show error
   - Try missing values → Should show error

2. **Network Failure:**
   - Disable network during pulse fetch
   - Verify error message appears
   - Verify flow continues (doesn't block)

3. **Authentication Error:**
   - Test without Clerk session
   - Verify proper error handling

#### Component Error Tests
1. **Error Boundary:**
   - Trigger component error
   - Verify error boundary catches it
   - Verify retry button works
   - Verify "Go to Dashboard" button works

2. **Loading States:**
   - Verify loading appears during async operations
   - Verify loading clears after completion

---

### 5. Personalization Tests

**Brand Hue:**
- Test with different domains
- Verify consistent hue per domain
- Verify colors propagate to all components

**Test Domains:**
- `toyotaofnaples.com` → Should generate consistent hue
- `hondadealer.com` → Should generate different hue
- `null/undefined` → Should use default blue (200)

---

### 6. Skip Functionality Tests

**Timing:**
- Verify skip button appears after 2 seconds
- Verify skip works on all phases

**Navigation:**
- Verify skip always goes to `/dashboard`
- Verify no data loss when skipping

---

## 🐛 Known Issues / Edge Cases

### Edge Cases to Test
1. **Empty Domain:**
   - User completes onboarding without domain
   - Verify default hue is used

2. **No Pulse Data:**
   - API returns empty pulses array
   - Verify "NO PULSES TO ASSIMILATE" message
   - Verify flow continues

3. **Slow Network:**
   - Simulate slow 3G
   - Verify loading states appear
   - Verify timeout handling

4. **Multiple Rapid Clicks:**
   - Click skip multiple times rapidly
   - Verify no duplicate navigations

---

## 📊 Success Criteria

### Functional
- ✅ All phases transition correctly
- ✅ Skip option works on all phases
- ✅ Error handling doesn't block flow
- ✅ Loading states appear appropriately
- ✅ Personalization works correctly

### User Experience
- ✅ Smooth animations
- ✅ Clear error messages
- ✅ Non-blocking errors
- ✅ Fast skip option
- ✅ Consistent branding

### Technical
- ✅ No console errors
- ✅ Proper error logging
- ✅ Type safety maintained
- ✅ Performance acceptable

---

## 🚀 Quick Test Script

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to landing
open http://localhost:3000

# 3. Test flow:
# - Sign up with Clerk
# - Complete onboarding (including PVR)
# - Experience cinematic sequence
# - Test skip option
# - Test error scenarios
```

---

## 📝 Test Results Template

```
Date: __________
Tester: __________

Landing → Auth: [ ] Pass [ ] Fail
Onboarding Flow: [ ] Pass [ ] Fail
PVR Input: [ ] Pass [ ] Fail
Cinematic Sequence: [ ] Pass [ ] Fail
Skip Option: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail
Personalization: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
```

---

## ✅ Ready for Production

All enhancements are complete. The system is ready for:
- ✅ End-to-end testing
- ✅ User acceptance testing
- ✅ Production deployment

**Next:** Run through the full flow and document any issues found.
