# Vercel Dashboard Deployment Issue - Diagnosis & Fix

## Problem

Vercel is not deploying the dashboard because:

1. **Root Directory Not Configured**: The root `vercel.json` doesn't specify `rootDirectory`
2. **Monorepo Structure**: Dashboard is in `apps/dashboard/` but Vercel is building from root
3. **Missing Project Configuration**: No separate Vercel project for dashboard domain

## Current Setup

### Root Configuration (`vercel.json`)
- ❌ No `rootDirectory` specified
- ✅ Build command configured
- ✅ Framework: Next.js
- ❌ Deploys entire repo (landing + dashboard together)

### Dashboard Configuration (`apps/dashboard/vercel.json`)
- ✅ Exists with build commands
- ❌ Not being used (Vercel reads root `vercel.json` first)

## Solution Options

### Option 1: Single Project with Root Directory (Recommended)

Update root `vercel.json` to specify root directory:

```json
{
  "version": 2,
  "rootDirectory": ".",
  "buildCommand": "npm install --legacy-peer-deps && prisma generate && NEXT_TELEMETRY_DISABLED=1 next build",
  ...
}
```

**Pros**: Simple, one project, domain-based routing via middleware
**Cons**: Both landing and dashboard deploy together

### Option 2: Separate Dashboard Project (For Isolation)

Create a separate Vercel project for dashboard:

1. **Vercel Dashboard**: Create new project
2. **Root Directory**: `apps/dashboard`
3. **Domain**: `dash.dealershipai.com`
4. **Build Command**: From `apps/dashboard/package.json`

**Pros**: Isolated deployments, separate scaling
**Cons**: More complex, two projects to manage

## Recommended Fix: Option 1 (Single Project)

Since you're using middleware for domain-based routing, keep it as one project.

### Step 1: Verify Root Directory in Vercel Dashboard

1. Go to: https://vercel.com/[your-team]/[your-project]/settings
2. Find **"Root Directory"** in Build & Development Settings
3. **Set to**: `.` (empty or just a dot)
4. **Save**

### Step 2: Update Root vercel.json

Add `rootDirectory` explicitly (even though `.` is default):

```json
{
  "version": 2,
  "rootDirectory": ".",
  ...
}
```

### Step 3: Verify Build Settings

In Vercel Dashboard → Settings → Build & Development:

- **Framework Preset**: Next.js
- **Build Command**: `npm install --legacy-peer-deps && prisma generate && NEXT_TELEMETRY_DISABLED=1 next build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install --legacy-peer-deps`
- **Development Command**: `npm run dev`

### Step 4: Check Domain Configuration

1. **Vercel Dashboard** → Project → Settings → Domains
2. **Verify**: `dash.dealershipai.com` is added
3. **DNS**: CNAME `dash` → `cname.vercel-dns.com`

### Step 5: Verify Environment Variables

Required for dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_FRONTEND_API` (if using)
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Common Issues

### Issue 1: Build Fails with "Cannot find module"
**Cause**: Root directory wrong, dependencies not installed
**Fix**: Set root directory to `.` and ensure `package.json` is in root

### Issue 2: Dashboard Routes 404
**Cause**: Middleware not routing correctly
**Fix**: Verify `middleware.ts` handles `dash.dealershipai.com` domain

### Issue 3: Clerk Auth Not Working
**Cause**: Missing environment variables or wrong domain config
**Fix**: Add Clerk env vars and configure domain in Clerk dashboard

## Quick Diagnostic Commands

```bash
# Check Vercel project link
cat .vercel/project.json 2>/dev/null || echo "Not linked"

# Check build locally
npm run build

# Check for build errors
npm run build 2>&1 | grep -i error
```

## Next Steps

1. ✅ Fix root directory in Vercel dashboard
2. ✅ Verify build command works locally
3. ✅ Check environment variables are set
4. ✅ Trigger new deployment
5. ✅ Test `dash.dealershipai.com`

