# 🚀 Vercel Deployment Guide

## Quick Deployment Steps

### 1. **Automatic Deployment (Recommended)**

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Fix build errors and prepare for deployment"
git push origin main
```

**Vercel will:**
- Detect the push to `main` branch
- Run build command from `vercel.json`: 
  ```bash
  cd apps/web && npm install --legacy-peer-deps && npx prisma generate && NEXT_TELEMETRY_DISABLED=1 next build
  ```
- Deploy to production automatically

### 2. **Manual Deployment via Vercel CLI**

If you prefer manual control:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 3. **Monitor Deployment**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `dealership-ai-dashboard`
3. Click on "Deployments" tab
4. Watch the build progress in real-time
5. Check build logs for any errors

### 4. **Verify Environment Variables**

Before deployment, ensure these are set in Vercel:

**Go to:** Project Settings → Environment Variables

**Required Variables:**
- `NEXT_PUBLIC_MAPBOX_KEY` - Mapbox API token
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key  
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Optional:**
- `NEXT_PUBLIC_BASE_URL` - Base URL for API calls
- `UPSTASH_REDIS_REST_URL` - Redis URL (if using)
- `UPSTASH_REDIS_REST_TOKEN` - Redis token (if using)

**Important:** Set these for **Production**, **Preview**, and **Development** environments.

### 5. **Post-Deployment Verification**

After successful deployment:

**Landing Page:**
- ✅ Visit `https://dealershipai.com/`
- ✅ Verify domain input form appears
- ✅ Test "Analyze my visibility" button
- ✅ Check Mapbox map loads
- ✅ Verify Clarity Stack panel displays

**Dashboard (Requires Auth):**
- ✅ Visit `https://dealershipai.com/dash`
- ✅ Verify Clerk sign-in redirect works
- ✅ After sign-in, check Pulse Overview displays
- ✅ Test navigation:
  - `/dash/onboarding`
  - `/dash/autopilot`
  - `/dash/insights/ai-story`

**API Routes:**
- ✅ Test `/api/clarity/stack?domain=example.com`
- ✅ Test `/api/ai-story?tenant=example`

## Troubleshooting

### Build Fails

1. **Check Vercel Build Logs**
   - Go to Deployment → Build Logs
   - Look for error messages
   - Common issues:
     - Missing environment variables
     - TypeScript errors
     - Missing dependencies

2. **Test Build Locally**
   ```bash
   cd apps/web
   npm install --legacy-peer-deps
   npx prisma generate --schema=prisma/schema.prisma
   NEXT_TELEMETRY_DISABLED=1 npm run build
   ```

3. **Fix and Redeploy**
   - Fix errors locally
   - Commit and push
   - Vercel will rebuild automatically

### Runtime Errors

1. **Check Function Logs**
   - Vercel Dashboard → Functions tab
   - Look for runtime errors

2. **Verify Environment Variables**
   - Ensure all required vars are set
   - Check variable names match exactly

3. **Check API Routes**
   - Test endpoints directly
   - Verify database connections
   - Check external API keys

## Current Status

✅ **Import paths fixed:**
- `apps/web/app/(admin)/admin/driftguard/page.tsx` - Fixed DriftTrendSpark import
- `apps/web/app/(dashboard)/layout.tsx` - Fixed BrandColorContext import
- `apps/web/app/(deck)/inevitability/page.tsx` - Already using correct path
- `apps/web/components/modals/SettingsModal.tsx` - Already using correct path

✅ **Dependencies installed**
✅ **npm audit fix completed** (0 vulnerabilities)

## Next Steps

1. **Commit and push:**
   ```bash
   git add .
   git commit -m "Fix import paths for deployment"
   git push origin main
   ```

2. **Monitor Vercel deployment** in dashboard

3. **Verify deployment** after build completes

**Estimated Time:** 5-10 minutes for deployment
