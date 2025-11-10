# 🔍 Production Verification Guide

## ✅ Deployment Status

**Production URL**: https://dealership-ai-dashboard-9k8nebqaw-brian-kramer-dealershipai.vercel.app

**Build Status**: ✅ Ready (completed successfully)

**Deployment Time**: ~3 minutes

---

## 🚨 Current Issues

### 1. Homepage Returns 500 Error
**Status**: Needs investigation

**Possible Causes**:
- Missing environment variables in Vercel
- Database connection issues (Prisma)
- Clerk authentication configuration
- Missing API keys

### 2. Health Check Returns 503
**Status**: Service unavailable

**Root Cause**: Health check depends on:
- Database connection (Prisma)
- Redis connection (Upstash)
- Optional: Anthropic/OpenAI API keys

---

## 🔧 Required Environment Variables

### Critical (Must Have)

```bash
# Database (Required for Prisma)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication (Required for Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Redis (Required for caching/rate limiting)
UPSTASH_REDIS_REST_URL=https://stable-whippet-17537.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUSBAAIncDJmMjViZTZkMGUwMzA0ODBjOGI5YjBmYjU0ZTg1N2U3OHAyMTc1Mzc
```

### Optional (Nice to Have)

```bash
# Supabase (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI APIs (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
NEXT_PUBLIC_GA=G-...
```

---

## 📋 Verification Checklist

### Step 1: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select project: `dealership-ai-dashboard`
3. Navigate to: **Settings** → **Environment Variables**
4. Verify all critical variables are set for **Production** environment

### Step 2: Test Production Endpoints

```bash
# Test homepage
curl -I https://dealership-ai-dashboard-9k8nebqaw-brian-kramer-dealershipai.vercel.app/

# Test health endpoint (should return 200 or 207)
curl https://dealership-ai-dashboard-9k8nebqaw-brian-kramer-dealershipai.vercel.app/api/health

# Test public API
curl https://dealership-ai-dashboard-9k8nebqaw-brian-kramer-dealershipai.vercel.app/api/scan/quick
```

### Step 3: Check Vercel Logs

```bash
# View recent logs
npx vercel logs https://dealership-ai-dashboard-9k8nebqaw-brian-kramer-dealershipai.vercel.app

# Or view in Vercel Dashboard:
# Project → Deployments → Click deployment → View Function Logs
```

### Step 4: Verify Database Connection

If using Prisma:
```bash
# Check if DATABASE_URL is set
npx vercel env ls

# Test database connection locally first
npx prisma db pull
```

---

## 🛠️ Troubleshooting Steps

### Issue: Homepage 500 Error

**Check**:
1. Vercel Function Logs for error details
2. Missing environment variables
3. Client-side errors in browser console
4. Server-side errors in Vercel logs

**Fix**:
1. Add missing environment variables
2. Redeploy after adding variables
3. Check for TypeScript/runtime errors

### Issue: Health Check 503

**Check**:
1. Database connection (DATABASE_URL)
2. Redis connection (UPSTASH_REDIS_REST_URL)
3. Prisma client generation

**Fix**:
1. Ensure DATABASE_URL is correct
2. Verify Redis credentials
3. Health check will return "degraded" if optional services fail (this is OK)

### Issue: Authentication Not Working

**Check**:
1. Clerk keys are set correctly
2. Clerk dashboard has production URL added
3. Redirect URLs configured in Clerk

**Fix**:
1. Add production URL to Clerk dashboard
2. Update redirect URLs
3. Verify keys match between Vercel and Clerk

---

## ✅ Success Criteria

### Homepage
- [ ] Returns 200 status
- [ ] Page loads without errors
- [ ] Free Audit Widget works
- [ ] Sign up/Sign in buttons work

### Authentication
- [ ] Sign up creates new user
- [ ] Sign in works
- [ ] Protected routes require auth
- [ ] Onboarding redirect works

### API Endpoints
- [ ] `/api/health` returns 200 or 207
- [ ] `/api/scan/quick` works
- [ ] `/api/visibility/presence` works
- [ ] All public APIs respond

### Dashboard
- [ ] `/dashboard` loads for authenticated users
- [ ] `/onboarding` works
- [ ] All components render
- [ ] No console errors

---

## 📊 Monitoring

### Vercel Analytics
1. Go to: **Analytics** tab in Vercel dashboard
2. Enable Vercel Analytics (already in code)
3. Monitor:
   - Page views
   - Function invocations
   - Error rates
   - Response times

### Error Tracking
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **PostHog** for analytics

---

## 🚀 Next Steps After Verification

1. **Set Up Custom Domain** (if needed)
   - Add `dealershipai.com` in Vercel
   - Configure DNS records
   - Update Clerk redirect URLs

2. **Enable Analytics**
   - Vercel Analytics (automatic)
   - Google Analytics 4 (if configured)

3. **Set Up Monitoring**
   - Error tracking (Sentry)
   - Uptime monitoring
   - Performance monitoring

4. **Test All Features**
   - Landing page scan
   - User signup flow
   - Onboarding workflow
   - Dashboard features
   - API endpoints

---

## 📞 Support

If issues persist:
1. Check Vercel Function Logs
2. Review error messages in browser console
3. Verify all environment variables are set
4. Test locally with production environment variables
5. Check Vercel status page: https://vercel-status.com

---

**Last Updated**: 2025-01-08
**Status**: Production deployment complete, verification in progress

