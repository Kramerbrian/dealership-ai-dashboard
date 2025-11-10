# 🔐 Clerk Configuration Guide

## Current Configuration

### Redirect URLs

These should be configured in your Clerk Dashboard:

1. **After Sign In:** `/onboarding`
2. **After Sign Up:** `/onboarding`
3. **After Onboarding:** `/dashboard` (handled by app logic)

## How to Configure

### Step 1: Access Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Select your application: **dealership-ai-dashboard**

### Step 2: Configure Paths
1. Navigate to **Configure → Paths**
2. Set the following:

#### Sign In Paths
- **After Sign In:** `/onboarding`
- **Fallback Redirect URL:** `/onboarding`

#### Sign Up Paths
- **After Sign Up:** `/onboarding`
- **Fallback Redirect URL:** `/onboarding`

### Step 3: Verify Environment Variables

Check that these are set in Vercel:

```bash
# Check current values
vercel env ls | grep CLERK
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` (should be `/onboarding`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` (should be `/onboarding`)

### Step 4: Update via CLI (if needed)

```bash
# Set redirect URLs
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL production
# Enter: /onboarding

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL production
# Enter: /onboarding
```

## How It Works

### User Flow

1. **New User Signs Up**
   - Clerk redirects to `/onboarding` (via `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL`)
   - User completes onboarding
   - App redirects to `/dashboard` (via `router.push('/dashboard')`)

2. **Existing User Signs In**
   - Clerk redirects to `/onboarding` (via `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL`)
   - Middleware checks `onboarding_complete` in Clerk metadata
   - If complete → allows access to `/dashboard`
   - If incomplete → redirects to `/onboarding`

3. **Onboarding Complete**
   - API saves `onboarding_complete: true` to Clerk metadata
   - App redirects to `/dashboard`
   - Middleware allows access

## Testing the Configuration

### Test Sign Up Flow
1. Visit production URL
2. Click "Get Your Free Report" or "Sign Up"
3. Complete Clerk sign-up form
4. **Expected:** Redirected to `/onboarding`

### Test Sign In Flow
1. Click "Sign In"
2. Enter credentials
3. **Expected:** 
   - If onboarding incomplete → `/onboarding`
   - If onboarding complete → `/dashboard`

### Test Middleware
1. Try accessing `/dashboard` directly (while signed in but onboarding incomplete)
2. **Expected:** Redirected to `/onboarding`

## Troubleshooting

### Issue: Users not redirected to onboarding
**Solution:** 
- Check `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` is set to `/onboarding`
- Verify in Clerk dashboard → Configure → Paths

### Issue: Redirect loop
**Solution:**
- Check middleware logic in `middleware.ts`
- Verify `onboarding_complete` check is correct
- Ensure `/onboarding` is in protected routes but doesn't require completion

### Issue: Metadata not saving
**Solution:**
- Check Clerk API key permissions
- Verify `updateUserMetadata` function in `lib/clerk.ts`
- Check Vercel function logs for errors

## Current Status

✅ Environment variables set in Vercel
✅ Middleware configured
✅ Onboarding flow complete
⚠️  **Action Required:** Verify redirect URLs in Clerk Dashboard

---

**Next Step:** Visit Clerk Dashboard and verify redirect URLs are set correctly.

