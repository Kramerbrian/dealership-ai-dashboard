# 🚀 Production Deployment Steps - Executable Guide

**Purpose:** Step-by-step commands to get to 100% production mode

---

## Step 1: Fix Build Issues (5 minutes)

```bash
# Clean build cache
rm -rf .next node_modules/.cache

# Verify TypeScript
npm run type-check

# Test build
npm run build

# If build succeeds, proceed. If errors, fix them first.
```

---

## Step 2: Verify Environment Variables (10 minutes)

### Check in Vercel Dashboard

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Verify these are set:

**Required:**
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Recommended:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_GA`

### Or use CLI:
```bash
vercel env ls production
```

---

## Step 3: Run Database Migrations (5 minutes)

### Option A: Via Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations from `supabase/migrations/` folder
3. Or run:

```sql
-- Run all migrations in order
-- 001_add_share_events.sql
-- 002_add_pulse_system.sql (if exists)
```

### Option B: Via Prisma CLI

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-connection-string"
export DIRECT_URL="your-production-direct-connection-string"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

---

## Step 4: Test API Endpoints (10 minutes)

```bash
# Get your production URL
PROD_URL="https://your-app.vercel.app"

# Test health check
curl "$PROD_URL/api/health"

# Test orchestrator status
curl "$PROD_URL/api/orchestrator?dealerId=demo-dealer-123"

# Test mystery shop
curl -X POST "$PROD_URL/api/mystery-shop" \
  -H "Content-Type: application/json" \
  -d '{"dealerId":"demo-dealer-123","scenario":"full"}'
```

All should return HTTP 200 with valid JSON.

---

## Step 5: Configure Custom Domain (15 minutes)

### In Vercel Dashboard:

1. Go to: Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `dealershipai.com`
4. Follow DNS configuration:
   - Add A record or CNAME as instructed
   - Wait for DNS propagation (usually < 5 minutes)
5. Verify SSL certificate is issued (automatic)

### Update Environment Variables:

```bash
# Update in Vercel dashboard:
NEXTAUTH_URL=https://dealershipai.com
NEXT_PUBLIC_APP_URL=https://dealershipai.com
```

### Update Clerk:

1. Go to Clerk Dashboard → Applications → Redirect URLs
2. Add: `https://dealershipai.com/*`
3. Update Sign-in/Sign-up URLs

---

## Step 6: Verify Monitoring (5 minutes)

### Sentry:
1. Go to Sentry dashboard
2. Trigger a test error (or wait for real error)
3. Verify error appears

### PostHog:
1. Go to PostHog dashboard
2. Navigate your site
3. Verify events are tracked

### Vercel Analytics:
1. Go to Vercel Dashboard → Analytics
2. Verify traffic is being tracked

---

## Step 7: Final Production Test (15 minutes)

### Test Critical User Flows:

1. **Landing Page**
   - Visit: `https://dealershipai.com`
   - Test instant analyzer
   - Verify share-to-unlock works

2. **Authentication**
   - Sign up new account
   - Sign in
   - Verify redirect works

3. **Dashboard**
   - Navigate to `/orchestrator`
   - Test all tabs:
     - AI CSO Status
     - HAL Chat
     - Mystery Shop
   - Verify data loads

4. **API Endpoints**
   - Test all endpoints return valid responses
   - Check response times (< 2s for most)

---

## Step 8: Set Up Monitoring Alerts (10 minutes)

### Uptime Monitoring:

1. **UptimeRobot** (free):
   - Add monitor: `https://dealershipai.com/api/health`
   - Set alert: Email/SMS if down
   - Check interval: 5 minutes

2. **Or use Vercel's built-in monitoring**

### Error Alerts:

1. **Sentry**:
   - Configure alerts for critical errors
   - Set up Slack/email notifications

2. **PostHog**:
   - Set up anomaly detection
   - Configure alerts

---

## Step 9: Performance Verification (10 minutes)

```bash
# Run Lighthouse audit
npm install -g @lhci/cli
lhci autorun --collect.url=https://dealershipai.com

# Or use online tool:
# https://pagespeed.web.dev/
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Step 10: Launch! 🚀

### Final Checklist:

- [ ] All builds succeed
- [ ] All migrations applied
- [ ] All env vars set
- [ ] All API endpoints tested
- [ ] Custom domain working
- [ ] Monitoring active
- [ ] Performance acceptable
- [ ] Documentation complete

### Deploy:

```bash
# Push to main branch (auto-deploys via Vercel)
git add .
git commit -m "Production ready - v1.0.0"
git push origin main
```

### Monitor First Hour:

- Watch error logs
- Monitor performance
- Check user feedback
- Be ready to rollback if needed

---

## 🆘 Rollback Plan

If critical issues arise:

```bash
# Option 1: Revert to previous deployment
# In Vercel dashboard → Deployments → Previous deployment → Promote to Production

# Option 2: Revert git commit
git revert HEAD
git push origin main
```

---

## ✅ Success Criteria

You're 100% production ready when:

1. ✅ All tests pass
2. ✅ No build errors
3. ✅ All endpoints return 200
4. ✅ Custom domain works
5. ✅ Monitoring active
6. ✅ Performance scores > 90
7. ✅ No critical errors in logs

---

**Estimated Total Time:** 90 minutes  
**Complexity:** Medium  
**Risk:** Low (with proper testing)

---

**Ready to proceed? Start with Step 1!**

