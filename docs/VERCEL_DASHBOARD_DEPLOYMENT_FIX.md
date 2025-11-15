# Vercel Dashboard Deployment Fix

## Root Cause Analysis

### Issue Identified

Vercel is not deploying the dashboard because:

1. **Single Project Architecture**: You're using ONE Vercel project for both landing (`dealershipai.com`) and dashboard (`dash.dealershipai.com`)
2. **Root Directory**: Vercel is building from root (`.`), which is correct
3. **Route Structure**: Dashboard routes are in `app/(dashboard)/` but may not be accessible
4. **Domain Routing**: Middleware handles domain-based routing, but routes must exist in root `app/` directory

### Current Structure

```
/
├── app/                    # Root Next.js app (landing + dashboard)
│   ├── page.tsx           # Landing page
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── dashboard/
│   │   ├── pulse/
│   │   └── onboarding/
│   └── api/               # Shared API routes
├── apps/
│   └── dashboard/         # Separate dashboard app (NOT being used by Vercel)
│       └── app/
├── vercel.json            # Root Vercel config (used by deployment)
└── middleware.ts          # Domain-based routing
```

## The Problem

Vercel is deploying from root and using `app/` directory, which is correct. However:

1. **Dashboard routes exist** in `app/(dashboard)/dashboard/` and `app/(dashboard)/pulse/`
2. **Middleware routes** `dash.dealershipai.com/` → `/dash` (but `/dash` route may not exist)
3. **Component imports** in `apps/dashboard/app/page.tsx` reference `@/components/DealershipAI_PulseDecisionInbox` which may not exist

## Solutions

### Solution 1: Fix Root App Structure (Recommended)

Since you're using a single Vercel project, ensure all routes are in root `app/`:

1. **Verify routes exist**:
   - ✅ `app/(dashboard)/dashboard/page.tsx` - Should render dashboard
   - ✅ `app/(dashboard)/pulse/page.tsx` - Should render Pulse inbox
   - ✅ `app/onboarding/page.tsx` - Should render onboarding

2. **Fix middleware redirect**:
   - Current: `dash.dealershipai.com/` → `/dash`
   - Should be: `dash.dealershipai.com/` → `/dashboard` or `/pulse`

3. **Verify components exist**:
   - Check if `components/DealershipAI_PulseDecisionInbox.tsx` exists
   - If not, create it or update imports

### Solution 2: Create Separate Vercel Project

If you want isolated deployments:

1. **Create new Vercel project** for dashboard
2. **Set root directory** to `apps/dashboard`
3. **Configure domain** to `dash.dealershipai.com`
4. **Deploy separately** from landing

## Immediate Fix Steps

### Step 1: Check Vercel Dashboard Settings

1. Go to: https://vercel.com/[your-team]/[your-project]/settings
2. **Root Directory**: Should be `.` (empty or just a dot)
3. **Build Command**: `npm install --legacy-peer-deps && prisma generate && NEXT_TELEMETRY_DISABLED=1 next build`
4. **Output Directory**: `.next` (default)

### Step 2: Verify Routes Exist

```bash
# Check if dashboard routes exist
ls -la app/(dashboard)/dashboard/
ls -la app/(dashboard)/pulse/

# Check if components exist
ls -la components/DealershipAI_PulseDecisionInbox.*
```

### Step 3: Fix Middleware Redirect

Update `middleware.ts` to redirect to correct route:

```typescript
// Current (line 93-98)
if (pathname === '/') {
  const dashUrl = new URL(req.url);
  dashUrl.pathname = '/dash';  // ❌ This route may not exist
  return NextResponse.redirect(dashUrl, 308);
}

// Should be:
if (pathname === '/') {
  const dashUrl = new URL(req.url);
  dashUrl.pathname = '/pulse';  // ✅ Or /dashboard
  return NextResponse.redirect(dashUrl, 308);
}
```

### Step 4: Verify Component Imports

Check if `DealershipAI_PulseDecisionInbox` component exists:

```bash
find . -name "*DealershipAI_PulseDecisionInbox*" -type f
```

If it doesn't exist, create it or update the import in `app/(dashboard)/dashboard/page.tsx`.

### Step 5: Test Build Locally

```bash
# Test build
npm run build

# Check for errors
npm run build 2>&1 | grep -i error
```

### Step 6: Trigger Deployment

```bash
# Option 1: Git push (auto-deploy)
git add .
git commit -m "Fix dashboard deployment"
git push origin main

# Option 2: Manual deploy
vercel --prod
```

## Diagnostic Checklist

- [ ] Root directory in Vercel dashboard is `.` (not `apps/dashboard` or `apps/web`)
- [ ] `app/(dashboard)/dashboard/page.tsx` exists
- [ ] `app/(dashboard)/pulse/page.tsx` exists
- [ ] `components/DealershipAI_PulseDecisionInbox.tsx` exists
- [ ] Middleware redirects `dash.dealershipai.com/` to correct route
- [ ] Build command works locally (`npm run build`)
- [ ] Environment variables are set in Vercel
- [ ] Domain `dash.dealershipai.com` is added to Vercel project

## Common Errors

### Error: "Module not found: Can't resolve '@/components/...'"
**Fix**: Component doesn't exist or path alias is wrong. Check `tsconfig.json` paths.

### Error: "Route not found"
**Fix**: Route doesn't exist in `app/` directory. Create it or fix middleware redirect.

### Error: "Build failed"
**Fix**: Check build logs in Vercel dashboard. Usually missing dependencies or TypeScript errors.

## Next Steps

1. ✅ Check Vercel dashboard root directory setting
2. ✅ Verify all routes exist in `app/` directory
3. ✅ Fix middleware redirect if needed
4. ✅ Test build locally
5. ✅ Deploy and verify

