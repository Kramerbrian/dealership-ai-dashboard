# 🚀 DealershipAI Demo Ready Checklist - 30 Minutes

## ✅ Quick Setup Steps

### 1. **Environment Variables (Vercel Dashboard)**
Go to: https://vercel.com/[your-project]/settings/environment-variables

**Required:**
```bash
# Clerk Authentication (CRITICAL)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
CLERK_SECRET_KEY=sk_live_... (or sk_test_...)

# Fleet API (Optional - will use demo data if not set)
FLEET_API_BASE=https://your-fleet-api.com (optional)
X_API_KEY=your_api_key (optional)
DEFAULT_TENANT=demo-dealer-001
```

**Quick Test:**
- If Clerk keys are missing → Sign-in won't work
- If Fleet API is missing → Will show demo data (safe for demo)

### 2. **Clerk Dashboard Setup** (5 minutes)
1. Go to: https://dashboard.clerk.com
2. Select your application
3. **Configure Sign-in/Sign-up URLs:**
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/onboarding`
   - After sign-up: `/onboarding`

4. **Enable OAuth Providers** (optional but recommended):
   - Google OAuth
   - GitHub OAuth

### 3. **Deploy to Vercel** (2 minutes)
```bash
# If not already deployed
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

### 4. **Test Critical Paths** (5 minutes)

#### A. Landing Page
- ✅ Visit: `https://dealershipai.com`
- ✅ Should load without errors
- ✅ Should show sign-in/sign-up buttons

#### B. Sign Up Flow
- ✅ Click "Sign Up"
- ✅ Complete Clerk sign-up
- ✅ Should redirect to `/onboarding`

#### C. Onboarding Flow
- ✅ Visit: `https://dealershipai.com/onboarding`
- ✅ Should show welcome screen
- ✅ Can progress through steps
- ✅ Should redirect to `/dashboard` after completion

#### D. Dashboard Access
- ✅ Visit: `https://dealershipai.com/dashboard`
- ✅ Should require authentication
- ✅ Should show dashboard content

#### E. Fleet Dashboard
- ✅ Visit: `https://dealershipai.com/fleet`
- ✅ Should show Fleet table (demo data if no API)
- ✅ Evidence cards should render
- ✅ Verify toggle should work

#### F. Bulk Upload
- ✅ Visit: `https://dealershipai.com/fleet/uploads`
- ✅ CSV upload should work
- ✅ Preview should show
- ✅ Commit button should be visible

### 5. **Common Issues & Quick Fixes**

#### Issue: "Clerk not configured"
**Fix:** Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to Vercel env vars

#### Issue: "Unauthorized" on API routes
**Fix:** Make sure user is signed in via Clerk

#### Issue: "Fleet API error"
**Fix:** This is OK - system will use demo data. Or add `FLEET_API_BASE` env var.

#### Issue: Onboarding redirects to dashboard
**Fix:** Check localStorage - if `onboarding_complete` is set, clear it

#### Issue: Toast notifications not showing
**Fix:** Toaster component is in layout.tsx - should work automatically

### 6. **Demo Flow Script**

1. **Start at Landing** (`/`)
   - "Welcome to DealershipAI"
   - Show sign-up CTA

2. **Sign Up** (`/sign-up`)
   - Use Clerk sign-up
   - Show OAuth options

3. **Onboarding** (`/onboarding`)
   - Walk through steps
   - Show website URL input
   - Show optional integrations

4. **Dashboard** (`/dashboard`)
   - Show main dashboard
   - Navigate to Fleet

5. **Fleet Dashboard** (`/fleet`)
   - Show origins table
   - Show evidence cards
   - Click verify toggle

6. **Bulk Upload** (`/fleet/uploads`)
   - Upload sample CSV
   - Show preview
   - Demonstrate commit

### 7. **Sample CSV for Demo**

Create `demo-origins.csv`:
```csv
origin,tenant
https://demo-dealership.com,demo-dealer-001
https://example-dealer.com,demo-dealer-001
```

### 8. **Quick Health Check**

Run these checks:
```bash
# Check build
npm run build

# Check for TypeScript errors (if any)
npm run lint

# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### 9. **Fallback Demo Data**

If Fleet API is not configured:
- ✅ Origins API returns demo data automatically
- ✅ Verify API returns demo success
- ✅ All UI components render correctly
- ✅ No errors shown to user

### 10. **Last-Minute Checklist**

- [ ] Clerk keys set in Vercel
- [ ] Deployed to production
- [ ] Landing page loads
- [ ] Sign-up works
- [ ] Onboarding flow works
- [ ] Dashboard accessible
- [ ] Fleet dashboard shows data
- [ ] Bulk upload page loads
- [ ] No console errors

## 🎯 Demo Highlights

1. **SSO Authentication**: Show Clerk sign-in with Google/GitHub
2. **Onboarding Flow**: Smooth multi-step setup
3. **Fleet Dashboard**: Evidence cards, verification toggles
4. **Bulk Upload**: CSV preview and commit
5. **Real-time Updates**: SWR data fetching

## 🚨 Emergency Fixes

### If sign-in doesn't work:
1. Check Clerk dashboard → Application → Settings
2. Verify redirect URLs match
3. Check Vercel env vars are deployed

### If API routes fail:
1. System automatically uses demo data
2. No user-facing errors
3. Demo continues smoothly

### If build fails:
1. Check `npm run build` locally
2. Fix TypeScript errors
3. Re-deploy

## 📞 Support Contacts

- **Clerk Support**: https://clerk.com/docs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: See `FLEET_DASHBOARD_SETUP.md`

---

**Status**: ✅ Ready for Demo
**Last Updated**: Just now
**Estimated Setup Time**: 10-15 minutes

