# 🚀 Quick Deploy Checklist

## Immediate Setup (5 minutes)

### 1. Environment Variables (Vercel Dashboard)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **5 required variables**:
```bash
FLEET_API_BASE=https://your-fleet-api.com
X_API_KEY=your-api-key-here
CRON_SECRET=your-secure-secret-min-32-chars
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**⚠️ Important:** Set for **Production**, **Preview**, and **Development** environments.

### 2. First Commit

```bash
git add app/page.tsx components/landing/FreeAuditWidget.tsx lib/types/AiScores.ts app/api/ai-scores/ lib/redis.ts
git commit -m "feat: landing page hero + instant analyzer skeleton"
git push
```

### 3. Deploy to Vercel

**Option A: Auto-deploy from Git**
- Connect repo to Vercel (if not already)
- Push to main branch → auto-deploys

**Option B: Manual CLI deploy**
```bash
npx vercel --prod
```

### 4. Verify Deployment

✅ **Landing Page:** `https://your-domain.com`  
✅ **Free Audit Widget:** Scroll to hero section, test with `https://www.exampledealer.com`  
✅ **Fleet Dashboard:** `https://your-domain.com/fleet` (requires auth)  
✅ **Status Endpoint:** `https://your-domain.com/api/status`

### 5. Test Cron Jobs

```bash
# Get your CRON_SECRET from Vercel env vars
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/fleet-refresh
```

**Expected:** `{ "ok": true, "queued": 0, "total": 0 }`

## 🎯 What's Live

- ✅ **Landing Page Hero** with Free Audit Widget
- ✅ **AI Scores API Proxy** with Redis caching
- ✅ **Fleet Dashboard** (5k rooftops support)
- ✅ **Bulk Origins API** (CSV/JSON ingest)
- ✅ **Cron Fleet Refresh** (8am, 12pm, 4pm ET)
- ✅ **Auto-Fix Engine** stub ready
- ✅ **Seed Script** for bulk imports

## 📝 Next Steps

1. **Seed Origins** (when ready):
   ```bash
   node scripts/seed-origins.mjs ./data/dealers.csv
   ```

2. **Monitor Logs**: Vercel Dashboard → Project → Logs

3. **Test with Real Data**: Use actual dealership URLs

## 🔗 Resources

- **Full Guide:** See `DEPLOYMENT_SETUP_GUIDE.md`
- **Environment Setup:** See `ENV_SETUP_GUIDE.md`
- **Testing:** See `TESTING_GUIDE.md`

