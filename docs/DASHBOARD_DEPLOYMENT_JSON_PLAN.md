# Dashboard Deployment Plan - JSON Implementation

**Status:** Ready to Execute  
**Domain:** `dash.dealershipai.com`  
**Structure:** Monorepo with `apps/dashboard`

## 📋 Overview

This plan deploys **only the dashboard app** to `dash.dealershipai.com` using:
- **Vercel Project:** Root Directory = `apps/dashboard`
- **Clerk Authentication:** Single Clerk app for dashboard
- **Monorepo Structure:** Dashboard isolated in `apps/dashboard`

## ✅ Files Created

### 1. Dashboard Middleware
**Location:** `apps/dashboard/middleware.ts`
- Protects all dashboard routes
- Redirects unauthenticated users to Clerk sign-in
- Public routes: `/api/webhook`, `/api/health`, `/api/status`

### 2. Dashboard Layout
**Location:** `apps/dashboard/app/layout.tsx`
- Wraps app with `ClerkProvider`
- Uses `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLERK_FRONTEND_API`

### 3. Package Configuration
**Location:** `apps/dashboard/package.json`
- Already exists with all dependencies
- Includes Clerk SDK

### 4. Vercel Configuration
**Location:** `apps/dashboard/vercel.json`
- Build and install commands
- Security headers

## 🚀 Deployment Steps

### Step 1: Verify Dashboard App Structure

```bash
# Check structure
ls -la apps/dashboard/
ls -la apps/dashboard/app/
```

**Required:**
- ✅ `apps/dashboard/package.json`
- ✅ `apps/dashboard/middleware.ts`
- ✅ `apps/dashboard/app/layout.tsx`
- ✅ `apps/dashboard/app/page.tsx` (or dashboard routes)

### Step 2: Configure Clerk Dashboard

1. **Visit:** https://dashboard.clerk.dev
2. **Settings → Domain & Cookies:**
   - **Cookie Domain:** `.dealershipai.com` (for SSO) or `dash.dealershipai.com` (dashboard-only)
   - **Allowed Origins:**
     - `https://dash.dealershipai.com`
     - `http://localhost:3001` (dev)
   - **Redirect URLs:**
     - `https://dash.dealershipai.com/sign-in`
     - `https://dash.dealershipai.com/sign-up`

### Step 3: Create Vercel Project

**Option A: Vercel Dashboard**
1. Go to: https://vercel.com/new
2. Import: `Kramerbrian/dealership-ai-dashboard`
3. **Root Directory:** `apps/dashboard`
4. Framework: Next.js (auto-detected)
5. Complete import

**Option B: Vercel CLI**
```bash
cd apps/dashboard
vercel --prod --yes
```

**Option C: Use Script**
```bash
./scripts/deploy-dashboard-vercel.sh
```

### Step 4: Add Environment Variables

**In Vercel Dashboard:**
- Project Settings → Environment Variables

**Required:**
```bash
NEXT_PUBLIC_CLERK_FRONTEND_API=<CLERK_FRONTEND_API>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<CLERK_SECRET_KEY>
```

**Via CLI:**
```bash
cd apps/dashboard
vercel env add NEXT_PUBLIC_CLERK_FRONTEND_API production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

### Step 5: Add Domain

**In Vercel Dashboard:**
- Project Settings → Domains
- Add: `dash.dealershipai.com`
- Follow verification instructions

**DNS Configuration:**
- **Type:** CNAME
- **Host:** `dash`
- **Value:** `cname.vercel-dns.com`
- **TTL:** 600

### Step 6: Deploy

```bash
# Option 1: Git push (auto-deploy)
git add apps/dashboard/
git commit -m "Deploy dashboard to dash.dealershipai.com"
git push origin main

# Option 2: Vercel CLI
cd apps/dashboard
vercel --prod

# Option 3: Use script
./scripts/deploy-dashboard-vercel.sh
```

### Step 7: Test

```bash
# Test domain
curl -I https://dash.dealershipai.com

# Test authentication
# 1. Visit https://dash.dealershipai.com
# 2. Should redirect to sign-in if not authenticated
# 3. After sign-in, should show dashboard
```

## ✅ Verification Checklist

- [ ] Dashboard app exists at `apps/dashboard`
- [ ] Middleware file created
- [ ] Layout file created with ClerkProvider
- [ ] Package.json includes Clerk SDK
- [ ] Vercel project created with root directory = `apps/dashboard`
- [ ] Environment variables set in Vercel
- [ ] Domain added in Vercel
- [ ] DNS CNAME record created
- [ ] Deployment successful
- [ ] Authentication works
- [ ] Dashboard loads after sign-in

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
1. Root directory is `apps/dashboard`
2. Package.json exists
3. Dependencies are installed

**Fix:**
```bash
cd apps/dashboard
npm install
npm run build
```

### Issue: Domain Not Resolving

**Check:**
1. DNS CNAME record is correct
2. Domain added in Vercel
3. SSL certificate issued (takes ~5 min)

**Fix:**
```bash
# Check DNS
dig dash.dealershipai.com

# Verify in Vercel
vercel domains ls
```

### Issue: Authentication Not Working

**Check:**
1. Clerk keys are set correctly
2. Allowed origins include `dash.dealershipai.com`
3. Middleware is protecting routes

**Fix:**
- Verify Clerk Dashboard settings
- Check environment variables in Vercel
- Review middleware configuration

## 📝 File Templates

All required files have been created:
- ✅ `apps/dashboard/middleware.ts`
- ✅ `apps/dashboard/app/layout.tsx`
- ✅ `apps/dashboard/package.json` (updated)
- ✅ `apps/dashboard/vercel.json`

## 🔗 Related Documentation

- **Full Deployment:** `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- **Clerk SSO:** `docs/CLERK_SSO_SETUP.md`
- **Quick Deploy:** `DEPLOY_NOW.md`

---

**Status:** ✅ Files created, ready to deploy  
**Next:** Configure Clerk, create Vercel project, deploy

