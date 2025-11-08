# 🚀 Complete Backend Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables (CRITICAL)

**Set these in Vercel Dashboard:**
Project → Settings → Environment Variables

#### **Required Core Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Fleet API & Redis
FLEET_API_BASE=https://your-fleet-api.com
X_API_KEY=your-api-key-here
CRON_SECRET=your-secure-secret-min-32-chars
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Node Environment
NODE_ENV=production
```

#### **Recommended Variables:**
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

### 2. Database Migration

**Run Prisma migrations:**
```bash
npx prisma migrate deploy
# OR if using Supabase
npx prisma db push
```

### 3. Build Verification

**Test build locally:**
```bash
npm run build
```

---

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

```bash
# If not logged in
npx vercel login

# Deploy to production
npx vercel --prod
```

### Step 2: Verify Deployment

**Check deployment status:**
- Vercel Dashboard → Your Project → Deployments
- Verify latest deployment is "Ready" ✅

### Step 3: Test Backend Endpoints

**Status Check:**
```bash
curl https://your-app.vercel.app/api/status
# Expected: { "ok": true, "service": "dealershipAI_fleet_agent" }
```

**Health Check:**
```bash
curl https://your-app.vercel.app/api/health
```

### Step 4: Verify Cron Jobs

**Check Vercel Cron Configuration:**
- Vercel Dashboard → Project → Settings → Cron Jobs
- Verify all 4 cron jobs are configured:
  - `/api/zero-click/recompute` (every 4 hours)
  - `/api/cron/fleet-refresh` (8am ET)
  - `/api/cron/fleet-refresh` (12pm ET)
  - `/api/cron/fleet-refresh` (4pm ET)

**Manual Test:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/fleet-refresh
```

### Step 5: Test API Routes

**AI Scores API:**
```bash
curl "https://your-app.vercel.app/api/ai-scores?origin=https://test.com"
```

**Orchestrator Status:**
```bash
curl "https://your-app.vercel.app/api/orchestrator/status?dealerId=demo-tenant"
```

---

## ✅ Post-Deployment Verification

### Backend Services Checklist

- [ ] **API Status** - `/api/status` returns 200
- [ ] **AI Scores Proxy** - `/api/ai-scores` working
- [ ] **Fleet Refresh** - Cron jobs scheduled
- [ ] **Orchestrator APIs** - Status, run, autonomy endpoints
- [ ] **Redis Caching** - Cache operations working
- [ ] **Database** - Prisma queries successful
- [ ] **Authentication** - Clerk integration working

### Frontend Integration

- [ ] **Landing Page** - Free Audit Widget loads
- [ ] **Dashboard** - `/dashboard` accessible after auth
- [ ] **Fleet View** - `/fleet` displays rooftops
- [ ] **Intelligence Shell** - Cognitive UI renders

---

## 🔧 Troubleshooting

### Build Failures
```bash
# Check build logs
vercel logs [deployment-url]

# Common fixes:
- Verify all env vars are set
- Check Node.js version (should be 22.x)
- Review dependency conflicts
```

### API Errors
```bash
# Check function logs
vercel logs --follow

# Common issues:
- Missing env vars (check console for undefined)
- Database connection issues
- Redis connection timeout
```

### Cron Job Issues
```bash
# Verify cron secret matches
# Check cron execution logs in Vercel Dashboard
# Ensure path matches vercel.json exactly
```

---

## 📊 Monitoring

### Vercel Analytics
- View function execution times
- Monitor error rates
- Track API usage

### Custom Monitoring
- Set up alerts for critical failures
- Monitor Redis cache hit rates
- Track database query performance

---

## 🎯 Next Steps After Deployment

1. **Load Test** - Verify backend can handle traffic
2. **Monitor Logs** - Watch for errors first 24 hours
3. **Optimize** - Tune cache TTLs and rate limits
4. **Scale** - Adjust function timeouts if needed

