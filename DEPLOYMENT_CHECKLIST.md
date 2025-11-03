# 🚀 Production Deployment Checklist

Complete step-by-step checklist for deploying DealershipAI to production.

---

## 📋 Pre-Deployment

### 1. Code Preparation ✅
- [x] All production optimizations implemented
- [x] Structured logging utility created
- [x] API response caching utilities created
- [x] Core Web Vitals tracking enabled
- [x] Database indexes migration created
- [x] Production build tested locally
- [x] Bundle analysis completed

### 2. Environment Variables Setup 🔴

**Add to Vercel Dashboard** (Production, Preview, Development):

#### Required Variables:
```bash
# Core App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXTAUTH_URL=https://dealershipai.com

# Database
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### Optional but Recommended:
```bash
# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=...
SENTRY_PROJECT=...
LOGTAIL_TOKEN=...

# Rate Limiting & Caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
KV_URL=https://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Analytics
NEXT_PUBLIC_GA=G-...
```

**Action:** 
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable for all environments
3. Verify with: `tsx scripts/verify-env-vars.ts`

---

### 3. Database Setup 🟡

#### Apply Database Indexes:
1. Go to Supabase Dashboard → SQL Editor
2. Open: `supabase/migrations/20250115000001_production_indexes.sql`
3. Copy and paste SQL into editor
4. Click "Run" to execute
5. Verify indexes created:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('users', 'dealerships', 'scores', 'subscriptions', 'audits')
   ORDER BY tablename, indexname;
   ```

#### Verify Database Connection:
```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Push schema if needed
npx prisma db push
```

**Action Required:** Run migration SQL in Supabase

---

## 🔧 Build & Test

### 4. Local Build Test ✅
```bash
# Already completed
npm run build
```

**Status:** ✅ Build successful

### 5. Bundle Analysis ✅
```bash
# Already completed
ANALYZE=true npm run build
# Check bundle-analysis.html in project root
```

**Status:** ✅ Analysis complete

### 6. Environment Variables Verification
```bash
# Verify all required variables are set
tsx scripts/verify-env-vars.ts
```

**Expected Output:**
```
✅ All required environment variables are set!
```

**Action:** Run verification script before deploying

---

## 🚀 Deployment Steps

### 7. Deploy to Vercel Production

```bash
# Deploy to production
vercel --prod

# Or use Vercel Dashboard:
# - Go to Deployments tab
# - Click "Redeploy" on latest deployment
# - Select "Production" environment
```

**After Deployment:**
1. Wait for build to complete
2. Check deployment logs for errors
3. Verify deployment URL is accessible

---

### 8. Post-Deployment Verification

#### Health Check:
```bash
curl https://dealershipai.com/api/health

# Expected response:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "database": { "status": "healthy" }
#   }
# }
```

#### Database Connection:
```bash
# Should return healthy status
curl https://dealershipai.com/api/health | jq '.data.database.status'
# Expected: "healthy"
```

#### Core Functionality:
- [ ] Landing page loads
- [ ] Sign-in page works
- [ ] Sign-up flow completes
- [ ] Dashboard loads
- [ ] API endpoints respond

---

## 📊 Monitoring Setup

### 9. Enable Monitoring Services

#### Sentry (Error Tracking):
1. Sign up at https://sentry.io
2. Create project (Next.js)
3. Copy DSN
4. Add to Vercel env vars:
   - `SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
5. Redeploy

#### LogTail (Structured Logging):
1. Sign up at https://logtail.com
2. Create source
3. Copy token
4. Add `LOGTAIL_TOKEN` to Vercel
5. Redeploy

#### Google Analytics:
1. Verify `NEXT_PUBLIC_GA` is set in Vercel
2. Check GA4 dashboard for events
3. Verify Web Vitals are tracked

---

## 🔍 Production Verification

### 10. Performance Checks

#### Core Web Vitals:
```bash
# Check Web Vitals endpoint
curl https://dealershipai.com/api/analytics/web-vitals

# Check in browser console for Web Vitals events
```

#### Response Times:
- Health check: < 100ms
- Dashboard API: < 500ms
- Static pages: < 200ms

#### Cache Verification:
```bash
# Check cache headers
curl -I https://dealershipai.com/api/dashboard/overview | grep Cache-Control
# Expected: Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

---

### 11. Security Verification

#### Headers Check:
```bash
curl -I https://dealershipai.com | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"
```

**Expected:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

#### SSL Certificate:
- Verify HTTPS is enforced
- Check certificate validity
- Verify no mixed content warnings

---

### 12. Error Tracking Verification

#### Sentry Test:
1. Go to Sentry dashboard
2. Create test error (or wait for real error)
3. Verify errors appear in dashboard
4. Check stack traces are readable

#### LogTail Test:
1. Trigger API endpoint
2. Check LogTail dashboard for logs
3. Verify structured JSON logs

---

## 📈 Analytics Verification

### 13. Analytics Setup

#### Google Analytics:
- [ ] GA4 events firing
- [ ] Web Vitals tracked
- [ ] Page views recorded
- [ ] Conversion tracking works (if configured)

#### Vercel Analytics:
- [ ] Analytics enabled in Vercel dashboard
- [ ] Page views tracked
- [ ] Performance metrics visible

---

## 🔄 Ongoing Maintenance

### 14. Database Maintenance

#### Regular Tasks:
- [ ] Monitor database connection pool
- [ ] Check slow query logs
- [ ] Review index usage
- [ ] Backup verification

#### Performance Monitoring:
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

### 15. Monitoring Alerts

#### Set Up Alerts For:
- [ ] High error rate (> 1% of requests)
- [ ] Slow response times (> 1s)
- [ ] Database connection failures
- [ ] High memory usage (> 80%)
- [ ] Disk space low (< 20% free)

#### Alert Channels:
- Email
- Slack (if configured)
- PagerDuty (if configured)

---

## 📝 Documentation

### 16. Update Documentation

- [ ] Update README with production URL
- [ ] Document environment variables
- [ ] Add runbook for common issues
- [ ] Update API documentation
- [ ] Create incident response guide

---

## ✅ Final Checklist

Before marking as "Production Ready":

- [ ] All environment variables added
- [ ] Database indexes applied
- [ ] Production build successful
- [ ] Health check passing
- [ ] Core functionality working
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Analytics tracking
- [ ] Security headers verified
- [ ] SSL certificate valid
- [ ] Performance metrics acceptable
- [ ] Documentation updated

---

## 🚨 Rollback Procedure

If deployment fails:

1. **Revert Deployment:**
   ```bash
   # In Vercel Dashboard
   # Go to Deployments → Select previous deployment → Promote to Production
   ```

2. **Check Logs:**
   - Vercel deployment logs
   - Sentry error logs
   - LogTail application logs

3. **Verify Rollback:**
   - Health check endpoint
   - Core functionality
   - Database connectivity

4. **Fix Issues:**
   - Identify root cause
   - Fix in development
   - Test locally
   - Redeploy

---

## 📞 Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **Clerk Support:** https://clerk.com/support
- **Sentry Support:** https://sentry.io/support

---

## 🎯 Success Criteria

Deployment is successful when:

✅ All health checks pass  
✅ Core functionality works  
✅ No critical errors in logs  
✅ Performance metrics acceptable  
✅ Monitoring dashboards active  
✅ Analytics tracking verified  

---

**Last Updated:** $(date)  
**Deployment Status:** Ready to Deploy  
**Next Action:** Add environment variables and apply database indexes
