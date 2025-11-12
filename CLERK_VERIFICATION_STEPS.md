# 🔐 Clerk Configuration Verification Steps

## Quick Verification Guide

### Step 1: Access Clerk Dashboard
1. Go to **https://dashboard.clerk.com**
2. Sign in with your Clerk account
3. Select your application: **dealership-ai-dashboard**

### Step 2: Check Paths Configuration
1. Navigate to **Configure → Paths** (left sidebar)
2. Look for these settings:

#### Sign In Paths
- **After Sign In:** Should be `/onboarding`
- **Fallback Redirect URL:** Should be `/onboarding` or `/`

#### Sign Up Paths
- **After Sign Up:** Should be `/onboarding`
- **Fallback Redirect URL:** Should be `/onboarding` or `/`

### Step 3: Verify Environment Variables
These should be set in Vercel (already verified):
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` = `/onboarding`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` = `/onboarding`

### Step 4: Test the Flow

#### Test Sign Up
1. Visit production URL
2. Click "Get Your Free Report" or "Sign Up"
3. Complete Clerk sign-up form
4. **Expected Result:** Redirected to `/onboarding`

#### Test Sign In
1. Sign out (if signed in)
2. Click "Sign In"
3. Enter credentials
4. **Expected Result:** 
   - If onboarding incomplete → `/onboarding`
   - If onboarding complete → `/dashboard`

### Step 5: Verify User Metadata
1. In Clerk Dashboard, go to **Users**
2. Find your test user
3. Click on the user
4. Go to **Metadata** tab
5. Check `publicMetadata`:
   ```json
   {
     "onboarding_complete": true,
     "domain": "example.com",
     "dealershipUrl": "https://example.com"
   }
   ```

## Troubleshooting

### Issue: Users not redirected to `/onboarding`
**Solution:**
1. Check Clerk Dashboard → Configure → Paths
2. Verify "After Sign In" and "After Sign Up" are set to `/onboarding`
3. Check Vercel environment variables are set correctly
4. Clear browser cache and try again

### Issue: Redirect loop
**Solution:**
1. Check middleware.ts logic
2. Verify `onboarding_complete` check is correct
3. Ensure `/onboarding` doesn't require completion

### Issue: Metadata not updating
**Solution:**
1. Check `/api/user/onboarding-complete` endpoint logs
2. Verify Clerk API key has write permissions
3. Check Vercel function logs for errors

## Current Configuration Status

✅ Environment variables set in Vercel
✅ Middleware configured correctly
✅ Onboarding API endpoint ready
⚠️  **Action Required:** Verify Clerk Dashboard paths are set to `/onboarding`

---

**Next:** Test the complete flow and verify redirects work as expected.

