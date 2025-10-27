# 🚀 CLERK PRODUCTION ACTIVATION GUIDE

## Step 1: Get Production Clerk Keys

### 1.1 Access Clerk Dashboard
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in to your account
3. Select your **PRODUCTION** instance (not the development one)

### 1.2 Get API Keys
1. Navigate to **API Keys** in the left sidebar
2. Copy the **Publishable Key** (starts with `pk_live_...`)
3. Copy the **Secret Key** (starts with `sk_live_...`)

## Step 2: Configure Vercel Environment Variables

### 2.1 Access Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `dealership-ai-dashboard` project
3. Go to **Settings** → **Environment Variables**

### 2.2 Set Production Keys
Add these environment variables for **Production** environment:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```

**⚠️ CRITICAL:** Remove any `pk_test_` or `sk_test_` values!

## Step 3: Configure Domains in Clerk

### 3.1 Remove Domains from Development Instance
1. Go to your **DEVELOPMENT** Clerk instance
2. Navigate to **Domains** → **Satellites**
3. Remove any domains that are already registered

### 3.2 Add Domains to Production Instance
1. Go to your **PRODUCTION** Clerk instance
2. Navigate to **Domains** → **Satellites**
3. Add these domains:
   - `dealershipai.com`
   - `www.dealershipai.com`
   - Your Vercel preview domain (e.g., `dealership-ai-dashboard.vercel.app`)

## Step 4: Update Clerk Configuration

### 4.1 Verify app/layout.tsx
Ensure your `ClerkProvider` is configured correctly:

```tsx
<ClerkProvider
  fallbackRedirectUrl="/dashboard"
  signInUrl="/auth/signin"
  signUpUrl="/auth/signup"
>
```

### 4.2 Verify middleware.ts
Ensure your middleware is using the latest Clerk configuration:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/signin(.*)',
  '/auth/signup(.*)',
  '/pricing(.*)',
  '/test-auth(.*)',
  '/test-oauth(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

## Step 5: Deploy to Production

### 5.1 Redeploy to Vercel
```bash
npx vercel --prod
```

### 5.2 Verify Production Deployment
1. Visit your production URL
2. Check browser console for Clerk warnings
3. Test authentication flow
4. Verify no "development keys" warnings

## Step 6: Test Authentication Flow

### 6.1 Test Sign Up
1. Go to your production URL
2. Click "Sign Up"
3. Complete the sign-up process
4. Verify redirect to `/dashboard`

### 6.2 Test Sign In
1. Sign out
2. Click "Sign In"
3. Complete the sign-in process
4. Verify redirect to `/dashboard`

## Step 7: Configure Email Templates (Optional)

### 7.1 Customize Email Templates
1. Go to Clerk Dashboard → **Email Templates**
2. Customize sign-up, sign-in, and password reset emails
3. Add your branding and messaging

### 7.2 Configure Social Providers
1. Go to **User & Authentication** → **Social Connections**
2. Enable Google, GitHub, or other providers
3. Configure OAuth credentials

## Troubleshooting

### Issue: "Clerk has been loaded with development keys"
**Solution:** Ensure you're using `pk_live_` and `sk_live_` keys in Vercel environment variables

### Issue: "Invalid publishable key"
**Solution:** Verify the key is copied correctly and matches your production instance

### Issue: Domain not working
**Solution:** Ensure the domain is added to your production Clerk instance, not development

### Issue: 404 errors after sign-in
**Solution:** Verify `fallbackRedirectUrl="/dashboard"` is set in ClerkProvider

## Success Indicators

✅ No "development keys" warnings in console
✅ No "afterSignInUrl deprecated" warnings
✅ Authentication flow works end-to-end
✅ Users can sign up and access dashboard
✅ Production keys are being used

## Next Steps After Clerk Configuration

1. **Set up Supabase Production Database**
2. **Configure Redis/Upstash for caching**
3. **Test all API endpoints**
4. **Launch waitlist and start collecting emails**

---

**🎯 GOAL:** Get your first $499 deal within 24 hours of going live!
