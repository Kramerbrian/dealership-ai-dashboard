# 🧪 End-to-End Testing Guide

## Pre-Deployment Testing

### 1. Local Development Server
```bash
npm run dev
```

### 2. Test Landing Page (`http://localhost:3000`)

#### Basic Functionality
- [ ] Page loads without errors
- [ ] Navigation menu works (desktop & mobile)
- [ ] "Get Your Free Report" button visible
- [ ] Features section displays correctly
- [ ] Pricing section displays correctly

#### URL Validation
- [ ] Enter invalid URL → Shows error message
- [ ] Enter valid URL → Accepts input
- [ ] Submit form → Shows preview results

#### Exit Intent Modal
- [ ] Move mouse to top of page → Modal appears
- [ ] Wait 45 seconds → Modal appears
- [ ] Click "Get Free Report" → Focuses input field

#### Last AIV Badge
- [ ] First visit → No badge
- [ ] After scan → Badge appears on next visit

---

### 3. Test Authentication Flow

#### Sign Up
1. Click "Get Your Free Report" or "Sign Up"
2. Complete Clerk sign-up form
3. **Expected:** Redirected to `/onboarding`

#### Sign In
1. Click "Sign In"
2. Enter credentials
3. **Expected:** 
   - If onboarding incomplete → `/onboarding`
   - If onboarding complete → `/dashboard`

#### Sign Out
1. Click user menu → Sign Out
2. **Expected:** Redirected to `/`

---

### 4. Test Onboarding Flow (`http://localhost:3000/onboarding`)

#### Access Control
- [ ] Signed-out user → Redirected to sign-in
- [ ] Signed-in user → Can access onboarding

#### Step 1: Welcome
- [ ] Page loads with welcome message
- [ ] Progress bar shows 20%
- [ ] "Next" button works

#### Step 2: Website URL
- [ ] Input field accepts URL
- [ ] Invalid URL → Shows error (red border)
- [ ] Valid URL → Error clears
- [ ] Can skip (if optional)
- [ ] "Next" button enabled when valid

#### Step 3: Google Business Profile
- [ ] Input field accepts URL
- [ ] Can skip
- [ ] "Connect" button works

#### Step 4: Google Analytics
- [ ] Checkbox toggles
- [ ] Can skip
- [ ] "Continue" button works

#### Step 5: Complete
- [ ] Shows success message
- [ ] "Go to Dashboard" button works
- [ ] Clicking button:
  - Saves to localStorage
  - Calls `/api/user/onboarding-complete`
  - Redirects to `/dashboard`

#### Data Persistence
- [ ] Check browser console → No errors
- [ ] Check Network tab → API call succeeds
- [ ] Check Clerk dashboard → Metadata updated:
  ```json
  {
    "onboarding_complete": true,
    "domain": "example.com",
    "dealershipUrl": "https://example.com"
  }
  ```

---

### 5. Test Middleware Redirects

#### Scenario 1: Incomplete Onboarding
1. Sign in as new user
2. Try to access `http://localhost:3000/dashboard`
3. **Expected:** Redirected to `/onboarding`

#### Scenario 2: Complete Onboarding
1. Complete onboarding flow
2. Access `http://localhost:3000/dashboard`
3. **Expected:** Dashboard loads successfully

#### Scenario 3: Public Routes
1. Sign out
2. Access `http://localhost:3000/`
3. **Expected:** Landing page loads

#### Scenario 4: Protected Routes
1. Sign out
2. Try to access `http://localhost:3000/dashboard`
3. **Expected:** Redirected to sign-in

---

### 6. Test API Endpoints

#### `/api/user/onboarding-complete` (POST)
```bash
curl -X POST http://localhost:3000/api/user/onboarding-complete \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "websiteUrl": "https://example.com",
    "googleBusinessProfile": "https://maps.google.com/...",
    "googleAnalytics": true
  }'
```
- [ ] Returns `{ ok: true, metadata: {...} }`
- [ ] Clerk metadata updated

#### `/api/user/onboarding-complete` (GET)
```bash
curl http://localhost:3000/api/user/onboarding-complete \
  -H "Cookie: __session=..."
```
- [ ] Returns `{ ok: true, completed: true/false }`

#### `/api/scan/quick` (POST)
```bash
curl -X POST http://localhost:3000/api/scan/quick \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```
- [ ] Returns preview results
- [ ] No authentication required

---

## Post-Deployment Testing

### Production URL Testing

1. **Landing Page**
   - Visit `https://your-domain.com`
   - Test all features from local testing

2. **Authentication**
   - Sign up new user
   - Verify redirect to `/onboarding`
   - Complete onboarding
   - Verify redirect to `/dashboard`

3. **Middleware**
   - Test all redirect scenarios
   - Verify protected routes work

4. **API Endpoints**
   - Test all endpoints with production URLs
   - Verify CORS headers (if applicable)

---

## Common Issues & Solutions

### Issue: Onboarding not redirecting
**Solution:** Check middleware.ts - ensure `onboarding_complete` check is correct

### Issue: Metadata not saving
**Solution:** 
- Check Clerk API key permissions
- Verify `updateUserMetadata` function
- Check Vercel logs for errors

### Issue: Build fails
**Solution:**
- Check for missing dependencies
- Verify environment variables
- Check Next.js version compatibility

### Issue: Middleware redirect loop
**Solution:**
- Ensure `/onboarding` is in protected routes
- Check onboarding completion check logic
- Verify Clerk session is valid

---

## Performance Testing

### Lighthouse Scores (Target)
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Load Testing
- Test with multiple concurrent users
- Monitor API response times
- Check Vercel function execution times

---

## Security Testing

- [ ] Authentication required for protected routes
- [ ] Onboarding completion enforced
- [ ] API endpoints properly secured
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed

---

**Status: Ready for Testing** ✅
