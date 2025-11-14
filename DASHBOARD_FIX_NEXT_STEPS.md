# Dashboard Fix - Next Steps

## Issue Fixed ✅

**Problem:** Build failing due to missing `mapbox-gl` dependency  
**Solution:** Disabled Mapbox component, replaced with placeholder

## Completed

1. ✅ Fixed `DealerFlyInMap.tsx` - Removed Mapbox import, added placeholder
2. ✅ Verified dashboard page structure (`app/dash/page.tsx`)
3. ✅ Verified API endpoint (`app/api/clarity/stack/route.ts`)

## Next Steps

### 1. Test Build Locally
```bash
npm run build
```

If build succeeds, proceed. If errors remain, check:
- Missing dependencies
- TypeScript errors
- Import issues

### 2. Verify Dashboard Components

Check these files are correct:
- ✅ `app/dash/page.tsx` - Main dashboard page
- ✅ `components/dashboard/DashboardShell.tsx` - Layout wrapper
- ✅ `components/dashboard/PulseOverview.tsx` - Main content
- ✅ `app/api/clarity/stack/route.ts` - Data endpoint

### 3. Test Dashboard Locally

```bash
# Start dev server
npm run dev

# Visit dashboard
open http://localhost:3000/dash
```

**Expected behavior:**
- Redirects to `/sign-in` if not authenticated
- Shows dashboard after Clerk login
- Displays Pulse overview with scores

### 4. Check Environment Variables

Verify these are set in `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # optional
```

### 5. Deploy to Vercel

Once local build works:

```bash
# Commit changes
git add .
git commit -m "fix: Remove Mapbox dependency, add placeholder"
git push origin main
```

### 6. Post-Deploy Verification

After Vercel deployment:

**Landing Page:**
- [ ] `https://dealershipai.com` loads
- [ ] No console errors
- [ ] Map placeholder shows (not broken)

**Dashboard:**
- [ ] `https://dash.dealershipai.com` redirects to sign-in
- [ ] After login, dashboard loads
- [ ] Pulse overview displays data
- [ ] Navigation works

### 7. If Dashboard Still Not Working

**Check these:**

1. **Clerk Authentication:**
   ```bash
   # Verify Clerk keys in Vercel
   # Check middleware.ts is protecting /dash routes
   ```

2. **API Endpoint:**
   ```bash
   # Test clarity stack endpoint
   curl https://dealershipai.com/api/clarity/stack?domain=test.com
   ```

3. **Console Errors:**
   - Open browser DevTools
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Build Logs:**
   - Check Vercel build logs
   - Look for TypeScript errors
   - Check for missing dependencies

## Common Issues & Fixes

### Issue: "Cannot find module 'mapbox-gl'"
**Fix:** ✅ Already fixed - Mapbox component disabled

### Issue: "Failed to load clarity stack"
**Fix:** Check `/api/clarity/stack` endpoint is working

### Issue: "Unauthorized" on dashboard
**Fix:** Verify Clerk keys are set in Vercel

### Issue: Dashboard shows blank page
**Fix:** 
- Check browser console for errors
- Verify `PulseOverview` component renders
- Check API response format matches component props

## Files Modified

- `components/landing/DealerFlyInMap.tsx` - Disabled Mapbox, added placeholder

## Testing Checklist

- [ ] Local build succeeds (`npm run build`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Dashboard redirects to sign-in when not logged in
- [ ] Dashboard loads after Clerk login
- [ ] Pulse overview displays scores
- [ ] No console errors in browser
- [ ] Vercel build succeeds
- [ ] Production dashboard works

## Need Help?

If dashboard still doesn't work:
1. Share build error output
2. Share browser console errors
3. Share Vercel build logs
4. Check if `/api/clarity/stack` returns data

