# 🚀 Production Action Plan - Next Steps

## Immediate Actions (Next 30 Minutes)

### 1. Set Environment Variables in Vercel

**Critical:** Without these, the backend won't work.

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Copy-paste these into Vercel (replace with your actual values):**

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Fleet API & Redis (REQUIRED)
FLEET_API_BASE=https://your-fleet-api.com
X_API_KEY=your-secure-api-key-here
CRON_SECRET=your-secure-secret-min-32-chars
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Node Environment
NODE_ENV=production

# App URLs
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com
```

**⚠️ Important:** Set these for **Production**, **Preview**, AND **Development** environments.

### 2. Run Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Deploy migrations to production database
npx prisma migrate deploy
```

### 3. Deploy to Vercel

```bash
# Deploy to production
npx vercel --prod

# Or use the automated script
./scripts/deploy-backend.sh
```

---

## Verification Steps (Next 15 Minutes)

### 1. Test Health Endpoints

```bash
# Status check
curl https://your-app.vercel.app/api/status
# Expected: { "ok": true, "service": "dealershipAI_fleet_agent" }

# Health check
curl https://your-app.vercel.app/api/health
```

### 2. Test Core APIs

```bash
# AI Scores API
curl "https://your-app.vercel.app/api/ai-scores?origin=https://example.com"

# Orchestrator Status
curl "https://your-app.vercel.app/api/orchestrator/status?dealerId=demo-tenant"
```

### 3. Test Frontend

- [ ] Visit landing page: `https://your-app.vercel.app`
- [ ] Test Free Audit Widget
- [ ] Sign in/Sign up flow works
- [ ] Dashboard loads (requires auth)

### 4. Verify Cron Jobs

**In Vercel Dashboard:**
- Settings → Cron Jobs
- Should see 4 scheduled jobs:
  - `/api/zero-click/recompute` (every 4 hours)
  - `/api/cron/fleet-refresh` (8am, 12pm, 4pm ET)

---

## Critical API Endpoints to Test

### Public Endpoints
- ✅ `/api/status` - Service status
- ✅ `/api/health` - Health check
- ✅ `/api/ai-scores` - AI scores proxy
- ✅ `/api/scan/quick` - Quick scan

### Protected Endpoints (Require Auth)
- ✅ `/api/orchestrator/status` - Orchestrator status
- ✅ `/api/orchestrator/run` - Run orchestration
- ✅ `/api/orchestrator/autonomy` - Toggle autonomy
- ✅ `/api/origins/bulk` - Bulk origins ingest
- ✅ `/api/refresh` - Refresh single origin

### Cron Endpoints (Require Secret)
- ✅ `/api/cron/fleet-refresh` - Fleet refresh job

---

## Production Checklist Summary

### Infrastructure ✅
- [ ] Environment variables set in Vercel
- [ ] Database migrated
- [ ] Redis configured
- [ ] Clerk authentication working

### Deployment ✅
- [ ] Code deployed to Vercel
- [ ] Build successful
- [ ] No errors in logs

### Testing ✅
- [ ] Health endpoints working
- [ ] Core APIs responding
- [ ] Frontend functional
- [ ] Authentication flow works

### Monitoring ✅
- [ ] Vercel logs accessible
- [ ] Error tracking configured (if using Sentry)
- [ ] Analytics tracking (Google Analytics)

---

## Quick Commands Reference

```bash
# 1. Set up environment (one-time)
# → Go to Vercel Dashboard and add env vars

# 2. Migrate database
npx prisma generate
npx prisma migrate deploy

# 3. Deploy
npx vercel --prod

# 4. Test
curl https://your-app.vercel.app/api/status
curl https://your-app.vercel.app/api/health

# 5. Monitor
# → Check Vercel Dashboard → Logs
```

---

## If Something Goes Wrong

### Build Fails
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Verify DATABASE_URL and DIRECT_URL are set
echo $DATABASE_URL
```

### API Returns 500
- Check Vercel logs: Dashboard → Project → Logs
- Verify environment variables are set
- Check database is accessible

### Cron Jobs Not Running
- Verify CRON_SECRET is set
- Check Vercel Dashboard → Settings → Cron Jobs
- Test manually: `curl -H "Authorization: Bearer YOUR_SECRET" https://your-app.vercel.app/api/cron/fleet-refresh`

---

## Success Criteria

Your backend is **100% production ready** when:

✅ All environment variables set  
✅ Database migrations complete  
✅ Build successful  
✅ Deployed to Vercel  
✅ `/api/status` returns `{ "ok": true }`  
✅ Landing page loads  
✅ Dashboard accessible (with auth)  
✅ Cron jobs configured  
✅ No errors in Vercel logs  

---

## Next Steps After Production

1. **Monitor for 24-48 hours**
   - Watch error logs
   - Check API response times
   - Monitor database performance

2. **Optimize based on usage**
   - Add caching where needed
   - Optimize slow queries
   - Scale resources if needed

3. **Collect feedback**
   - User testing
   - Performance metrics
   - Error patterns

---

## Documentation Files

- **Full Checklist:** `PRODUCTION_READINESS_CHECKLIST.md`
- **Quick Deploy:** `QUICK_PRODUCTION_DEPLOY.md`
- **Environment Setup:** `ENV_SETUP_GUIDE.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Deployment Script:** `scripts/deploy-backend.sh`

---

**🎯 You're ready! Start with Step 1 (Environment Variables) and work through the checklist.**

