# 🧪 Testing Instructions - Cognitive Interface 3.0

**Status:** Server is running but returning 500 errors  
**Action Required:** Check server logs and fix errors before testing

---

## 🔍 Step 1: Diagnose Server Issues

```bash
# Run diagnostic script
./scripts/diagnose-server.sh

# Or manually check:
# 1. Look at terminal running 'npm run dev' for errors
# 2. Check browser console (F12) for errors
# 3. Verify environment variables are set
```

---

## 🚀 Step 2: Fix Server Errors

### Common Issues:

1. **Missing Environment Variables:**
   ```bash
   # Check if .env.local exists
   ls -la .env.local
   
   # Required variables:
   # - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   # - CLERK_SECRET_KEY
   # - SUPABASE_URL
   # - SUPABASE_SERVICE_ROLE
   ```

2. **Build Errors:**
   ```bash
   # Clear and rebuild
   rm -rf .next
   npm run build
   ```

3. **Port Conflicts:**
   ```bash
   # Kill existing process
   lsof -ti:3000 | xargs kill -9
   
   # Restart server
   npm run dev
   ```

---

## ✅ Step 3: Verify Server is Healthy

Once server is fixed:

```bash
# Run automated tests
./scripts/test-cognitive-interface.sh

# Or test manually:
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

---

## 🧪 Step 4: Manual Testing Flow

### 1. Open Browser
- Navigate to: **http://localhost:3000**
- Open DevTools (F12 → Console tab)

### 2. Test Landing Page
- [ ] Page loads without errors
- [ ] Clerk SignIn/SignUp buttons visible
- [ ] No red errors in console

### 3. Test Sign Up
- [ ] Click "Sign Up"
- [ ] Complete Clerk authentication
- [ ] Should redirect to `/onboarding`

### 4. Test Onboarding
- [ ] Step 1: Enter dealer URL → Click "Scan"
- [ ] Step 2: Share or enter email
- [ ] Step 3: Select competitors
- [ ] Step 4: Enter PVR metrics:
  - Monthly PVR Revenue: `500000`
  - Monthly Ad Expense PVR: `50000`
- [ ] Step 5: Click "Launch Orchestrator"

### 5. Test Cinematic Sequence
- [ ] Phase 1: TronAcknowledgment (wait 2s, skip available)
- [ ] Phase 2: OrchestratorReadyState (click PROCEED)
- [ ] Phase 3: PulseAssimilation (watch pulses load)
- [ ] Phase 4: SystemOnlineOverlay (click ENTER DASHBOARD)

### 6. Test Skip Functionality
- [ ] Wait 2 seconds on any phase
- [ ] Click "SKIP" button (top-right)
- [ ] Should go directly to `/dashboard`

### 7. Test Error Scenarios
- [ ] Invalid PVR: Try negative numbers → Should show error
- [ ] Network: Disable network, try saving → Should show error but continue
- [ ] Empty data: Check if flow continues with no pulses

---

## 📊 Automated Testing

### Run Full Test Suite:
```bash
# Shell script (Bash)
./scripts/test-cognitive-interface.sh

# Node.js script
node scripts/test-cognitive-interface-api.js
```

### Expected Results:
- ✅ Server Status: PASS
- ✅ Landing Page: PASS
- ✅ Routes: PASS
- ✅ API Endpoints: PASS
- ✅ Error Handling: PASS

---

## 🐛 Troubleshooting

### Server Returns 500:
1. Check terminal running `npm run dev` for errors
2. Verify environment variables are set
3. Check for TypeScript errors: `npm run type-check`
4. Clear cache: `rm -rf .next && npm run dev`

### Tests Fail:
1. Ensure server is running: `lsof -ti:3000`
2. Check server logs for errors
3. Verify routes are accessible
4. Check API endpoints manually

### Console Errors:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify Clerk keys are correct

---

## ✅ Success Criteria

**All tests pass when:**
- ✅ Server returns 200 OK
- ✅ All routes are accessible
- ✅ API endpoints validate correctly
- ✅ No console errors
- ✅ Full flow works end-to-end
- ✅ Skip functionality works
- ✅ Error handling works

---

## 📝 Next Steps

1. **Fix server errors** (if any)
2. **Run diagnostic script** to verify health
3. **Run automated tests** to verify functionality
4. **Manual test** the full flow
5. **Document any issues** found

**Once server is healthy, follow the testing guide!** 🚀

