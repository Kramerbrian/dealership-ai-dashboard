# 🚀 Complete Backend Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Database Setup

**Required:**
- [ ] PostgreSQL database provisioned (Supabase, Neon, or custom)
- [ ] `DATABASE_URL` set in Vercel
- [ ] `DIRECT_URL` set in Vercel (same as DATABASE_URL for Prisma migrations)

**Migration:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma studio  # Optional: view database
```

### ✅ 2. Environment Variables (Vercel Dashboard)

**Critical Variables (Required):**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Fleet API & Services
FLEET_API_BASE=https://your-fleet-api.com
X_API_KEY=your-api-key-here
CRON_SECRET=your-secure-secret-min-32-chars

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Node Environment
NODE_ENV=production
```

**Recommended Variables:**
```bash
# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App URLs
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com

# Analytics
NEXT_PUBLIC_GA=G-XXXXXXXXXX
```

**How to Set:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add each variable for **Production**, **Preview**, and **Development**
5. Save and redeploy

### ✅ 3. Prisma Schema Migration

**Run migrations:**
```bash
# Development (creates migration files)
npx prisma migrate dev --name backend_deployment

# Production (applies migrations)
npx prisma migrate deploy
```

**Verify:**
```bash
# Check database connection
npx prisma db pull

# View database (optional)
npx prisma studio
```

### ✅ 4. Build Verification

**Test build locally:**
```bash
npm install
npm run build
```

**Expected:** Build succeeds with no errors

---

## 🚀 Deployment Steps

### Step 1: Run Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy-backend.sh

# Run deployment
./scripts/deploy-backend.sh
```

**OR deploy manually:**

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Build
npm run build

# 5. Deploy to Vercel
npx vercel --prod
```

### Step 2: Verify Deployment

**Check Vercel Dashboard:**
- [ ] Latest deployment is "Ready" ✅
- [ ] No build errors
- [ ] All environment variables present
- [ ] Function logs show no critical errors

**Check URLs:**
- Landing Page: `https://your-domain.com`
- Dashboard: `https://your-domain.com/dashboard`
- Status API: `https://your-domain.com/api/status`

---

## 🧪 Post-Deployment Testing

### Test 1: Status Endpoint
```bash
curl https://your-app.vercel.app/api/status
# Expected: { "ok": true, "service": "dealershipAI_fleet_agent" }
```

### Test 2: Health Check
```bash
curl https://your-app.vercel.app/api/health
# Expected: Health status response
```

### Test 3: AI Scores Proxy
```bash
curl "https://your-app.vercel.app/api/ai-scores?origin=https://example.com"
# Expected: AI scores JSON response or error message
```

### Test 4: Cron Job Test
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/fleet-refresh
# Expected: { "ok": true, "queued": N, ... }
```

### Test 5: Database Connection
```bash
# Check if Prisma can connect
# This is verified during migration
```

### Test 6: Fleet Dashboard
- [ ] Visit `/fleet` page (requires auth)
- [ ] Verify rooftop list loads
- [ ] Test refresh functionality

---

## 🔧 Cron Jobs Configuration

**Verify in Vercel:**
- Project → Settings → Cron Jobs

**Expected Cron Jobs:**
1. `/api/zero-click/recompute` - Every 4 hours
2. `/api/cron/fleet-refresh` - 8:00 ET daily
3. `/api/cron/fleet-refresh` - 12:00 ET daily
4. `/api/cron/fleet-refresh` - 16:00 ET daily

**Verify Cron Execution:**
- Check Vercel Dashboard → Cron Jobs → Execution History
- Should show successful executions

---

## 📊 Monitoring & Logs

### Vercel Logs
- **Location:** Vercel Dashboard → Project → Logs
- **Check for:**
  - API route errors
  - Database connection issues
  - Missing environment variables

### Database Monitoring
- Monitor connection pool usage
- Check query performance
- Set up alerts for connection failures

### API Monitoring
- Track response times
- Monitor error rates
- Set up alerts for 5xx errors

---

## 🐛 Troubleshooting

### Build Failures
**Issue:** Build fails during deployment
**Solution:**
1. Check build logs in Vercel
2. Verify all dependencies in `package.json`
3. Ensure Node.js version matches `package.json` engines

### Database Connection Errors
**Issue:** "Can't reach database server"
**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database firewall rules
3. Ensure `DIRECT_URL` matches `DATABASE_URL`

### Missing Environment Variables
**Issue:** "Environment variable not found"
**Solution:**
1. Check Vercel Dashboard → Environment Variables
2. Ensure variables are set for correct environment (Production/Preview)
3. Redeploy after adding variables

### Prisma Migration Failures
**Issue:** "Migration failed"
**Solution:**
1. Check database connection
2. Verify schema is compatible
3. Run `npx prisma migrate reset` (development only)
4. Check migration history: `npx prisma migrate status`

---

## ✅ Completion Checklist

- [ ] Database provisioned and connected
- [ ] All environment variables set in Vercel
- [ ] Prisma migrations applied successfully
- [ ] Build completes without errors
- [ ] Deployed to Vercel production
- [ ] Status endpoint returns 200 OK
- [ ] Health check endpoint works
- [ ] AI scores proxy responds
- [ ] Cron jobs configured and running
- [ ] Fleet dashboard accessible
- [ ] No critical errors in logs
- [ ] Monitoring alerts configured

---

## 🎯 Next Steps

1. **Monitor first 24 hours:**
   - Watch Vercel logs for errors
   - Check cron job execution
   - Monitor database connections

2. **Performance Optimization:**
   - Enable Redis caching
   - Optimize database queries
   - Set up CDN for static assets

3. **Security Hardening:**
   - Review API authentication
   - Enable rate limiting
   - Set up WAF rules

4. **Documentation:**
   - Update API documentation
   - Create runbook for common issues
   - Document environment variable changes

---

## 📚 Additional Resources

- **Deployment Guide:** `DEPLOYMENT_SETUP_GUIDE.md`
- **Environment Setup:** `ENV_SETUP_GUIDE.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Architecture:** `ARCHITECTURE.md`

---

**🎉 Backend Deployment Complete!**

All systems operational. Monitor closely for the first 24-48 hours.

