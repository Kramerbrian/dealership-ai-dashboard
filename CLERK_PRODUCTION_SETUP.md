# Clerk Production Setup Guide

## ✅ Changes Applied

### 1. Updated `app/layout.tsx`
The ClerkProvider now uses the correct props:
```tsx
<ClerkProvider
  fallbackRedirectUrl="/dashboard"
  signInUrl="/auth/signin"
  signUpUrl="/auth/signup"
>
  {children}
</ClerkProvider>
```

### 2. Created `middleware.ts`
Proper middleware configuration for production:
```ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/public(.*)",
    "/api/ai-scores(.*)",
    "/api/calculator(.*)",
    "/api/newsletter(.*)",
  ],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

## 🔧 Required Manual Steps

### Step 1: Update Environment Variables

**For Local Development (.env.local):**
```bash
# Replace the keyless/test keys with production keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_LIVE_KEY
```

**For Vercel Production:**
1. Go to: https://vercel.com/[your-team]/dealership-ai-dashboard/settings/environment-variables
2. Add/Update these variables for **Production** environment:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...`
   - `CLERK_SECRET_KEY` = `sk_live_...`
3. **Delete** any test keys (`pk_test_...`, `sk_test_...`)

### Step 2: Configure Clerk Dashboard

1. Go to: https://dashboard.clerk.com/
2. Select your **production instance** (not test)
3. Navigate to **Domains** section
4. Add these allowed domains:
   - `dealershipai.com`
   - `www.dealershipai.com`
   - `[your-app].vercel.app` (optional for preview deployments)

### Step 3: Update Sign-In/Sign-Up URLs

In Clerk Dashboard → **Paths**:
- Sign-in URL: `/auth/signin`
- Sign-up URL: `/auth/signup`
- After sign-in URL: `/dashboard`
- After sign-up URL: `/dashboard`

### Step 4: Deploy to Vercel

```bash
# Pull latest environment variables (verify they're correct)
vercel env pull .env.production.local

# Deploy to production
vercel --prod
```

### Step 5: Verify Production

After deployment, check:
- ✅ No "keyless mode" message in browser console
- ✅ No "development keys" warnings
- ✅ No deprecated prop warnings for `afterSignInUrl`
- ✅ Sign-in/sign-up redirects to `/dashboard`
- ✅ Authentication works on production domain

## 🚨 Common Issues

### Issue: Still seeing "keyless mode"
**Solution:** 
- Verify you set the environment variables in Vercel
- Redeploy after setting variables
- Check you're using `pk_live_` not `pk_test_`

### Issue: "Invalid publishable key"
**Solution:**
- Make sure the key matches your production Clerk instance
- Verify no hardcoded test keys in code

### Issue: Redirects not working
**Solution:**
- Clear browser cache and cookies
- Verify Clerk Dashboard paths match your routes
- Check middleware.ts is not blocking auth routes

## 📋 Verification Checklist

- [ ] Updated `app/layout.tsx` with `fallbackRedirectUrl`
- [ ] Created `middleware.ts` in root directory
- [ ] Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Vercel (production)
- [ ] Set `CLERK_SECRET_KEY` in Vercel (production)
- [ ] Removed all test keys from Vercel
- [ ] Added domains to Clerk Dashboard
- [ ] Updated Clerk paths to use `/auth/signin` and `/auth/signup`
- [ ] Deployed to production with `vercel --prod`
- [ ] Tested sign-in flow on production domain
- [ ] Verified no console warnings about keyless/test mode

## 🔗 Quick Links

- **Clerk Dashboard**: https://dashboard.clerk.com/
- **Vercel Project Settings**: https://vercel.com/[your-team]/dealership-ai-dashboard/settings
- **Production URL**: https://dealershipai.com

---

**Note:** The application is currently running in keyless/development mode. Follow the steps above to configure production Clerk authentication.

