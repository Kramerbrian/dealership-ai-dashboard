# 🔐 Clerk Multi-Domain Setup Guide

## Overview

This guide explains how to configure Clerk authentication for multi-domain support between:
- **dealershipai.com** (main domain - marketing/landing)
- **dash.dealershipai.com** (dashboard subdomain - requires authentication)

## ✅ What's Already Configured

1. **Clerk Middleware** (`app/middleware.ts`)
   - ✅ Protects dashboard routes on both domains
   - ✅ Handles onboarding flow
   - ✅ Redirects unauthenticated users to sign-in
   - ✅ Domain-aware routing

2. **ClerkProvider** (`app/layout.tsx`)
   - ✅ Configured with domain detection
   - ✅ Auto-detects hostname for proper session handling

3. **Configuration** (`lib/clerk-config.ts`)
   - ✅ Multi-domain configuration
   - ✅ Redirect URLs defined
   - ✅ Helper functions for domain routing

## 🚀 Step-by-Step Setup

### Step 1: Get Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign in or create an account
3. Create a new application: **"DealershipAI"**
4. Copy your API keys:
   - **Publishable Key** (starts with `pk_live_` or `pk_test_`)
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)

### Step 2: Configure Clerk Dashboard

#### A. Add Allowed Domains

In Clerk Dashboard → **Settings → Domains**:

1. Add **Primary Domain**:
   ```
   dealershipai.com
   ```

2. Add **Additional Domains**:
   ```
   dash.dealershipai.com
   ```

3. For local development:
   ```
   localhost
   localhost:3000
   ```

#### B. Configure Redirect URLs

In Clerk Dashboard → **Settings → Redirect URLs**:

**Allowed Redirect URLs:**
```
https://dealershipai.com
https://dealershipai.com/dashboard
https://dealershipai.com/sign-in
https://dealershipai.com/sign-up
https://dash.dealershipai.com
https://dash.dealershipai.com/dashboard
https://dash.dealershipai.com/sign-in
https://dash.dealershipai.com/sign-up
http://localhost:3000
http://localhost:3000/dashboard
http://localhost:3000/sign-in
http://localhost:3000/sign-up
```

**Sign-in URL:**
```
/sign-in
```

**Sign-up URL:**
```
/sign-up
```

**After Sign-in URL:**
```
/dashboard
```

**After Sign-up URL:**
```
/dashboard
```

#### C. Configure OAuth Providers (Optional)

1. **Google OAuth**:
   - Go to **Settings → OAuth**
   - Enable Google
   - Add your Google OAuth credentials

2. **GitHub OAuth** (Optional):
   - Enable GitHub
   - Add GitHub OAuth credentials

### Step 3: Set Environment Variables

Add to `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Optional: Clerk Frontend API (if using custom UI)
NEXT_PUBLIC_CLERK_FRONTEND_API=dealershipai.com
```

### Step 4: Set Vercel Environment Variables

For **production deployment**, add environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```

4. Apply to **Production**, **Preview**, and **Development** environments
5. Redeploy your application

### Step 5: Configure DNS (if not already done)

Ensure your domains point to Vercel:

1. **dealershipai.com** → Vercel project
2. **dash.dealershipai.com** → Same Vercel project (or separate if needed)

In Vercel:
- Go to **Settings → Domains**
- Add both domains
- Configure DNS records as instructed

## 🔍 How It Works

### Domain Detection

The middleware automatically detects which domain is being accessed:

```typescript
const hostname = req.headers.get('host') || '';
const isDashboardDomain = hostname.includes('dash.') || hostname.includes('dashboard.');
const isMainDomain = hostname.includes('dealershipai.com') && !isDashboardDomain;
```

### Route Protection

**Dashboard Domain (`dash.dealershipai.com`):**
- ✅ All routes require authentication (except public routes)
- ✅ Unauthenticated users → redirected to sign-in on main domain
- ✅ Onboarding flow works before full authentication

**Main Domain (`dealershipai.com`):**
- ✅ Public routes (/, /sign-in, /sign-up) are accessible
- ✅ Protected routes (dashboard, API) require authentication
- ✅ Marketing/landing pages are public

### Authentication Flow

1. User visits `dash.dealershipai.com/dashboard`
2. Middleware checks authentication
3. If not authenticated → redirects to `dealershipai.com/sign-in?redirect_url=...`
4. User signs in on main domain
5. After sign-in → redirects back to `dash.dealershipai.com/dashboard`

### Session Sharing

Clerk automatically shares sessions across domains when configured correctly. The session cookie is set for both:
- `dealershipai.com`
- `dash.dealershipai.com`

## 🧪 Testing

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Visit `http://localhost:3000/dashboard`
   - Should redirect to `/sign-in`
   - Sign in with Clerk
   - Should redirect back to `/dashboard`

3. **Test onboarding:**
   - Visit `http://localhost:3000/onboarding`
   - Complete onboarding flow
   - Should redirect to `/dashboard` when complete

### Production Testing

1. **Test main domain:**
   - Visit `https://dealershipai.com`
   - Should load landing page (no auth required)

2. **Test dashboard domain:**
   - Visit `https://dash.dealershipai.com/dashboard`
   - Should redirect to sign-in if not authenticated
   - After sign-in, should access dashboard

3. **Test cross-domain:**
   - Sign in on `dealershipai.com`
   - Visit `dash.dealershipai.com/dashboard`
   - Should be authenticated (session shared)

## 🔧 Troubleshooting

### Issue: "Redirect URL not allowed"

**Solution:**
1. Check Clerk Dashboard → Settings → Redirect URLs
2. Ensure all URLs are added (including localhost for dev)
3. Make sure URLs match exactly (including https/http)

### Issue: Session not shared between domains

**Solution:**
1. Verify both domains are added in Clerk Dashboard
2. Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
3. Ensure cookies are set for the correct domain (check browser DevTools)

### Issue: "Unauthorized" on dashboard

**Solution:**
1. Check middleware is running (check Vercel logs)
2. Verify `CLERK_SECRET_KEY` is set in environment variables
3. Check that protected routes are correctly defined in middleware

### Issue: Onboarding loop

**Solution:**
1. Check `dai_step` cookie is being set correctly
2. Verify onboarding completion sets step to '3'
3. Check middleware logic for onboarding redirects

## 📊 Protected Routes

The following routes require authentication:

- `/dashboard/*` - All dashboard pages
- `/intelligence/*` - Intelligence dashboard
- `/admin/*` - Admin pages
- `/api/dashboard/*` - Dashboard API
- `/api/ai/*` - AI API endpoints
- `/api/onboarding/*` - Onboarding API
- `/api/competitors/*` - Competitor API
- `/api/focus/*` - Focus API
- `/api/upsell/*` - Upsell API
- And more (see `app/middleware.ts` for full list)

## 🔒 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all secrets
3. **Enable MFA** in Clerk Dashboard for production
4. **Set session timeout** appropriately (24 hours default)
5. **Monitor Clerk Dashboard** for suspicious activity
6. **Use HTTPS** in production (required for Clerk)

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Multi-Domain Guide](https://clerk.com/docs/authentication/multi-domain)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## ✅ Checklist

Before going live:

- [ ] Clerk API keys added to `.env.local`
- [ ] Clerk API keys added to Vercel environment variables
- [ ] All domains added in Clerk Dashboard
- [ ] All redirect URLs configured in Clerk Dashboard
- [ ] DNS configured for both domains
- [ ] Tested authentication flow on main domain
- [ ] Tested authentication flow on dashboard domain
- [ ] Tested cross-domain session sharing
- [ ] Tested onboarding flow
- [ ] MFA enabled (optional but recommended)
- [ ] Session timeout configured
- [ ] Error handling tested

---

**Ready to deploy!** 🚀

