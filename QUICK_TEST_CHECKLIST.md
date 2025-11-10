# 🧪 Quick Test Checklist - Cognitive Interface 3.0

**Server:** http://localhost:3000  
**Date:** Run this checklist after `npm run dev` starts

---

## ✅ Pre-Flight Checks

- [ ] Dev server is running (check terminal for "Ready" message)
- [ ] No build errors in terminal
- [ ] Browser console is open (F12 → Console tab)

---

## 🎯 Test Flow 1: Happy Path

### Step 1: Landing Page (`/`)
- [ ] Navigate to http://localhost:3000
- [ ] Page loads without errors
- [ ] Clerk SignIn/SignUp buttons are visible
- [ ] FreeAuditWidget is visible
- [ ] No console errors

### Step 2: Sign Up
- [ ] Click "Sign Up" button
- [ ] Clerk modal appears
- [ ] Complete sign up (email/password or OAuth)
- [ ] Redirects to `/onboarding` after sign up

### Step 3: Onboarding Flow

**Step 1 - Dealer URL:**
- [ ] Enter valid URL: `https://toyotaofnaples.com`
- [ ] Click "Scan"
- [ ] Proceeds to Step 2

**Step 2 - Unlock Report:**
- [ ] Choose "Share to unlock" OR enter email
- [ ] Proceeds to Step 3

**Step 3 - Competitors:**
- [ ] Select 3-5 competitors (optional)
- [ ] Click "Continue"
- [ ] Proceeds to Step 4

**Step 4 - PVR Metrics:** ⭐
- [ ] Enter Monthly PVR Revenue: `500000`
- [ ] Enter Monthly Ad Expense PVR: `50000`
- [ ] Click "Continue"
- [ ] **Check Network tab:** POST to `/api/save-metrics` succeeds (200)
- [ ] Proceeds to Step 5

**Step 5 - Complete:**
- [ ] "Launch Orchestrator" button visible
- [ ] Click "Launch Orchestrator"
- [ ] Redirects to `/dashboard/preview`

### Step 4: Cinematic Sequence

**Phase 1 - TronAcknowledgment:**
- [ ] Black screen with Tron grid appears
- [ ] "SYSTEM ACKNOWLEDGED" text visible
- [ ] Progress bar animates
- [ ] **After 2 seconds:** Skip button appears (top-right)
- [ ] Auto-transitions after 3 seconds

**Phase 2 - OrchestratorReadyState:**
- [ ] Status grid shows: ORCHESTRATOR, PULSE ENGINE, COGNITIVE CORE
- [ ] All show "READY"
- [ ] "PROCEED" button visible
- [ ] Skip button still visible
- [ ] Click "PROCEED" → Goes to PulseAssimilation

**Phase 3 - PulseAssimilation:**
- [ ] "PULSE ASSIMILATION" title visible
- [ ] If loading: "LOADING PULSE DATA..." with animated dots
- [ ] Pulse cards animate in sequentially
- [ ] Each shows title and impact
- [ ] "ASSIMILATION COMPLETE" when done
- [ ] Auto-transitions to SystemOnlineOverlay

**Phase 4 - SystemOnlineOverlay:**
- [ ] Overlay appears with "SYSTEM ONLINE"
- [ ] Status lines visible
- [ ] "ENTER DASHBOARD" button visible
- [ ] Click button → Redirects to `/dashboard`

---

## 🐛 Test Flow 2: Skip Functionality

### Test Skip on Each Phase
- [ ] **TronAcknowledgment:** Wait 2s, click SKIP → Goes to `/dashboard`
- [ ] **OrchestratorReadyState:** Click SKIP → Goes to `/dashboard`
- [ ] **PulseAssimilation:** Click SKIP → Goes to `/dashboard`

**Expected:**
- Skip button appears after 2 seconds
- Skip works on all phases
- No errors in console
- Navigation is instant

---

## ⚠️ Test Flow 3: Error Scenarios

### Error Test 1: Invalid PVR Values
1. Go to Onboarding Step 4
2. Enter invalid values:
   - [ ] Negative number: `-1000` → Should show error
   - [ ] String: `abc` → Should show error
   - [ ] Empty field → Button disabled
3. **Expected:** Error message, cannot proceed

### Error Test 2: Network Failure
1. Open DevTools → Network tab
2. Set to "Offline" mode
3. Try to save PVR metrics
4. **Expected:**
   - [ ] Error message appears
   - [ ] User can still continue (non-blocking)
   - [ ] Alert shows: "Failed to save metrics..."

### Error Test 3: Empty Pulse Data
1. Complete onboarding
2. Go to PulseAssimilation phase
3. If no pulses returned:
   - [ ] Shows "NO PULSES TO ASSIMILATE"
   - [ ] Flow continues (doesn't block)
   - [ ] Transitions to SystemOnlineOverlay

### Error Test 4: Component Error
1. Trigger a component error (if possible)
2. **Expected:**
   - [ ] Error boundary catches it
   - [ ] Shows error screen with "RETRY" and "GO TO DASHBOARD"
   - [ ] No white screen of death

---

## 🎨 Test Flow 4: Personalization

### Test Brand Hue
- [ ] Complete flow with domain: `toyotaofnaples.com`
- [ ] Note the brand color (hue)
- [ ] Complete flow again with same domain
- [ ] **Expected:** Same hue (consistent)
- [ ] Try different domain: `hondadealer.com`
- [ ] **Expected:** Different hue

---

## 📊 Console Checks

While testing, check browser console (F12):
- [ ] No red errors
- [ ] No TypeScript errors
- [ ] API calls succeed (200 status)
- [ ] No memory leaks (if testing multiple times)

---

## 🚀 Quick Test Commands

```bash
# 1. Start server (if not running)
npm run dev

# 2. Open browser
open http://localhost:3000

# 3. Test endpoints directly (optional)
curl http://localhost:3000/api/health
```

---

## ✅ Success Criteria

**All tests pass if:**
- ✅ Full flow works end-to-end
- ✅ Skip option works on all phases
- ✅ Error handling doesn't block flow
- ✅ Loading states appear appropriately
- ✅ No console errors
- ✅ Personalization works consistently

---

## 📝 Notes Section

**Issues Found:**
```
_________________________________
_________________________________
```

**Performance:**
- [ ] Page load time: _____ seconds
- [ ] Cinematic sequence duration: _____ seconds
- [ ] API response time: _____ ms

**Browser/Device:**
- [ ] Browser: __________
- [ ] Device: __________
- [ ] Screen size: __________

---

## 🎯 Next Steps After Testing

1. **If all tests pass:** ✅ Ready for production
2. **If issues found:** Document in notes, fix, retest
3. **If performance issues:** Optimize, retest

**Ready to test!** 🚀

