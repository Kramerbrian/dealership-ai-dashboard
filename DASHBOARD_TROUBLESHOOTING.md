# Dashboard Troubleshooting Guide

## Current Status

✅ **Fixed:** Mapbox syntax error in `DealerFlyInMap.tsx`

## Quick Fixes Applied

1. ✅ Removed `mapbox-gl` import
2. ✅ Replaced map with placeholder component
3. ✅ Fixed syntax errors

## Next Steps to Get Dashboard Working

### 1. Verify Build Succeeds
```bash
npm run build
```

If build fails, check:
- TypeScript errors
- Missing imports
- Syntax errors

### 2. Test Dashboard Locally
```bash
npm run dev
# Visit http://localhost:3000/dash
```

**Expected:**
- Redirects to `/sign-in` if not authenticated
- Shows dashboard after Clerk login

### 3. Check Dashboard Components

**Main Files:**
- `app/dash/page.tsx` - Dashboard page (server component)
- `components/dashboard/DashboardShell.tsx` - Layout wrapper (client component)
- `components/dashboard/PulseOverview.tsx` - Main content (client component)
- `app/api/clarity/stack/route.ts` - Data API endpoint

### 4. Common Issues & Fixes

#### Issue: "Cannot find module"
**Fix:** Run `npm install` to ensure all dependencies are installed

#### Issue: "Failed to load clarity stack"
**Fix:** Check `/api/clarity/stack` endpoint returns data:
```bash
curl http://localhost:3000/api/clarity/stack?domain=test.com
```

#### Issue: Dashboard shows blank page
**Fix:**
1. Check browser console for errors
2. Verify Clerk authentication is working
3. Check API response format matches component props

#### Issue: "Unauthorized" error
**Fix:** Verify Clerk keys in `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 5. Verify API Endpoint

Test the clarity stack endpoint:
```bash
# Local
curl http://localhost:3000/api/clarity/stack?domain=test.com

# Production (after deploy)
curl https://dealershipai.com/api/clarity/stack?domain=test.com
```

**Expected Response:**
```json
{
  "domain": "test.com",
  "scores": { "seo": 75, "aeo": 68, "geo": 72, "avi": 71 },
  "gbp": { "health_score": 80, ... },
  "ugc": { "score": 72, ... },
  "schema": { "score": 68, ... },
  "competitive": { "rank": 3, "total": 10, ... },
  "revenue_at_risk": { "monthly": 24000, ... }
}
```

### 6. Check Component Props

`PulseOverview` expects:
```typescript
{
  domain: string;
  scores: { seo: number; aeo: number; geo: number; avi: number };
  gbp: { health_score: number; ... };
  ugc: { score: number; recent_reviews_90d: number };
  schema: { score: number };
  competitive: { rank: number; total: number };
  revenueMonthly: number;
}
```

Verify `app/dash/page.tsx` passes correct props.

### 7. Deploy to Vercel

Once local build works:
```bash
git push origin main
```

Monitor Vercel build logs for errors.

### 8. Post-Deploy Checklist

- [ ] Build succeeds in Vercel
- [ ] `https://dash.dealershipai.com` redirects to sign-in
- [ ] After login, dashboard loads
- [ ] Pulse overview displays data
- [ ] No console errors in browser
- [ ] Navigation works

## Debug Commands

```bash
# Check for TypeScript errors
npm run type-check

# Check for lint errors
npm run lint

# Test API endpoint
curl http://localhost:3000/api/clarity/stack?domain=test.com | jq

# Check build output
npm run build 2>&1 | tee build.log
```

## Still Not Working?

1. **Share build error output**
2. **Share browser console errors**
3. **Share Vercel build logs**
4. **Check if `/api/clarity/stack` returns data**

## Files Modified

- ✅ `components/landing/DealerFlyInMap.tsx` - Fixed syntax, removed Mapbox

