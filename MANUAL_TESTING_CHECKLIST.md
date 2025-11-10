# 🧪 Manual Testing Checklist

## Production URL
**https://dealership-ai-dashboard-qkaslz71g-brian-kramer-dealershipai.vercel.app**

---

## 1️⃣ Landing Page Testing

### URL: `/` (Root)

#### URL Validation
- [ ] Enter invalid URL (e.g., "not-a-url") → Should show error message
- [ ] Enter valid URL without protocol (e.g., "example.com") → Should accept
- [ ] Enter valid URL with protocol (e.g., "https://example.com") → Should accept
- [ ] Submit invalid URL → Should not proceed
- [ ] Submit valid URL → Should show "Analyzing..." state

#### Mobile Menu
- [ ] On mobile/tablet view, hamburger menu appears
- [ ] Click hamburger → Menu opens
- [ ] Click outside menu → Menu closes
- [ ] Press Escape key → Menu closes
- [ ] All menu links work correctly

#### Exit Intent Modal
- [ ] Move mouse to top of page (exit intent) → Modal appears
- [ ] Wait 45 seconds without interaction → Modal appears
- [ ] Click "Get Free Report" in modal → Focuses input field
- [ ] Click close (×) → Modal closes
- [ ] Modal doesn't appear if already shown

#### Last AIV Badge
- [ ] First visit → No badge shown
- [ ] After completing a scan → Badge appears on next visit
- [ ] Badge shows correct last AIV score

#### Other Features
- [ ] Preview results display after scan
- [ ] "Get Your Free Report" button works
- [ ] Navigation links work (Features, Pricing, How it works)
- [ ] Page loads without console errors

---

## 2️⃣ Sign Up Flow

### Steps:
1. Click "Get Your Free Report" or "Sign Up"
2. Complete Clerk sign-up form
3. Verify redirect

### Expected Behavior
- [ ] Clerk sign-up modal/page appears
- [ ] Can enter email and password
- [ ] Email verification works (if enabled)
- [ ] After sign-up completion → **Redirected to `/onboarding`**
- [ ] URL shows: `https://...vercel.app/onboarding`
- [ ] User is authenticated (can see user menu/profile)

### If Issues
- Check browser console for errors
- Verify Clerk redirect URL is set to `/onboarding`
- Check Vercel logs for authentication errors

---

## 3️⃣ Onboarding Flow

### URL: `/onboarding`

### Step 1: Welcome
- [ ] Page loads with welcome message
- [ ] Progress bar shows 20% (Step 1 of 5)
- [ ] "Next" button works

### Step 2: Website URL
- [ ] Input field accepts URL
- [ ] Invalid URL → Shows red border + error message
- [ ] Valid URL → Error clears, green state
- [ ] Can skip (if optional)
- [ ] "Next" button enabled when valid URL entered

### Step 3: Google Business Profile
- [ ] Input field accepts URL
- [ ] Can skip
- [ ] "Connect" button works (if URL provided)

### Step 4: Google Analytics
- [ ] Checkbox toggles
- [ ] Can skip
- [ ] "Continue" button works

### Step 5: Complete
- [ ] Shows success message
- [ ] "Go to Dashboard" button visible
- [ ] Clicking button:
  - [ ] Shows loading state
  - [ ] **Redirects to `/dashboard`**
  - [ ] No console errors

### Data Persistence
- [ ] Open browser DevTools → Network tab
- [ ] Complete onboarding
- [ ] Verify API call to `/api/user/onboarding-complete` succeeds (200)
- [ ] Check response contains `{ ok: true, metadata: {...} }`
- [ ] Verify Clerk metadata updated:
  - Go to Clerk Dashboard → Users → Select your user
  - Check `publicMetadata` contains:
    ```json
    {
      "onboarding_complete": true,
      "domain": "example.com",
      "dealershipUrl": "https://example.com"
    }
    ```

---

## 4️⃣ Sign In Flow

### Test Case 1: User with Incomplete Onboarding
1. Sign out (if signed in)
2. Sign in with user that hasn't completed onboarding
3. **Expected:** Redirected to `/onboarding`

### Test Case 2: User with Complete Onboarding
1. Sign out
2. Sign in with user that has completed onboarding
3. **Expected:** Redirected to `/dashboard` (or allowed access)

### Verification
- [ ] Sign in modal/page appears
- [ ] Can enter credentials
- [ ] After sign in → Redirects based on onboarding status
- [ ] Middleware correctly enforces onboarding requirement

---

## 5️⃣ Dashboard Access

### Test Case 1: Without Onboarding
1. Sign in as user without onboarding
2. Try to access `/dashboard` directly
3. **Expected:** Redirected to `/onboarding`

### Test Case 2: With Onboarding
1. Complete onboarding
2. Access `/dashboard`
3. **Expected:** Dashboard loads successfully
4. [ ] Can see dashboard content
5. [ ] User data displays correctly
6. [ ] No console errors

---

## 6️⃣ Middleware Testing

### Protected Routes
- [ ] `/dashboard` requires authentication
- [ ] `/dashboard` requires onboarding completion
- [ ] `/admin` requires authentication
- [ ] `/onboarding` requires authentication (but not completion)

### Public Routes
- [ ] `/` accessible without auth
- [ ] `/sign-in` accessible without auth
- [ ] `/sign-up` accessible without auth
- [ ] API endpoints work as expected

---

## 7️⃣ Clerk Configuration Verification

### In Clerk Dashboard (https://dashboard.clerk.com)

#### Paths Configuration
- [ ] Navigate to **Configure → Paths**
- [ ] **After Sign In:** Set to `/onboarding`
- [ ] **After Sign Up:** Set to `/onboarding`
- [ ] **Fallback URLs:** Set appropriately

#### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Set
- [ ] `CLERK_SECRET_KEY` - Set
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` - Set to `/onboarding`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` - Set to `/onboarding`

---

## 8️⃣ Error Handling

### Test Error Scenarios
- [ ] Invalid URL in onboarding → Shows error
- [ ] Network error → Shows appropriate message
- [ ] API failure → Graceful fallback
- [ ] Missing environment variables → Appropriate error

---

## 📊 Testing Results Summary

### Landing Page
- Status: ⬜ Not Tested / ✅ Pass / ❌ Fail
- Notes: _________________________

### Sign Up Flow
- Status: ⬜ Not Tested / ✅ Pass / ❌ Fail
- Notes: _________________________

### Onboarding Flow
- Status: ⬜ Not Tested / ✅ Pass / ❌ Fail
- Notes: _________________________

### Sign In Flow
- Status: ⬜ Not Tested / ✅ Pass / ❌ Fail
- Notes: _________________________

### Clerk Configuration
- Status: ⬜ Not Tested / ✅ Pass / ❌ Fail
- Notes: _________________________

---

## 🐛 Issues Found

### Issue 1
- **Description:** _________________________
- **Steps to Reproduce:** _________________________
- **Expected:** _________________________
- **Actual:** _________________________
- **Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low

### Issue 2
- **Description:** _________________________
- **Steps to Reproduce:** _________________________
- **Expected:** _________________________
- **Actual:** _________________________
- **Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low

---

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] Clerk configuration verified
- [ ] User flows working end-to-end
- [ ] No blocking issues found

**Tester:** _________________________  
**Date:** _________________________  
**Status:** ⬜ Ready for Production / ⬜ Needs Fixes
