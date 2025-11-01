# DealershipAI - Deployment Setup Guide

## 🚀 Immediate Actions

### 1. Environment Variables in Vercel

Set these in your Vercel project dashboard:
- Project → Settings → Environment Variables

**Required Variables:**
```bash
FLEET_API_BASE=https://your-fleet-api.com
X_API_KEY=your-api-key-here
CRON_SECRET=your-secure-cron-secret-here
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
```

**How to Set:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `dealership-ai-dashboard`
3. Navigate to: Settings → Environment Variables
4. Add each variable for **Production**, **Preview**, and **Development**
5. Save and redeploy

### 2. Git Repository Setup

If starting fresh or setting up a new repo:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "feat: landing page hero + instant analyzer skeleton"

# Add remote (if using GitHub/GitLab)
git remote add origin https://github.com/your-username/dealershipai.git

# Push to remote
git push -u origin main
```

### 3. Vercel Deployment

**Option A: Connect GitHub Repo (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import Git Repository
3. Select `dealership-ai-dashboard`
4. Vercel auto-detects Next.js
5. Add environment variables (see step 1)
6. Deploy

**Option B: CLI Deploy**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 4. Test Free Audit Widget

**Add to Landing Page:**
The widget is already integrated in `app/page.tsx`:
```tsx
<FreeAuditWidget />
```

**Test Locally:**
```bash
npm run dev
# Visit http://localhost:3000
# Try: https://www.exampledealer.com
```

**Test in Production:**
1. Visit your deployed site
2. Scroll to hero section
3. Enter a dealership URL
4. Verify API response (check Network tab)

### 5. Test Fleet Dashboard

**Access:**
- URL: `https://your-domain.com/fleet`
- Requires authentication (Clerk)

**Verify:**
- Rooftop list loads (or shows empty state if no data)
- Refresh buttons work
- Metrics display correctly

### 6. Test Cron Jobs

**Manual Trigger:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/fleet-refresh
```

**Expected Response:**
```json
{
  "ok": true,
  "queued": 150,
  "total": 150,
  "when": "2025-01-15T12:00:00.000Z"
}
```

**Vercel Cron Configuration:**
- Already configured in `vercel.json`
- Runs at 8am, 12pm, 4pm ET daily
- Check: Vercel Dashboard → Project → Cron Jobs

### 7. Seed Origins

**Prepare CSV File:**
Create `data/dealers.csv`:
```csv
https://www.dealer1.com
https://www.dealer2.com
https://www.dealer3.com
```

**Run Seed Script:**
```bash
# Set environment variables locally
export FLEET_API_BASE=https://your-fleet-api.com
export X_API_KEY=your-api-key-here

# Run script
node scripts/seed-origins.mjs ./data/dealers.csv
```

**Expected Output:**
```
📋 Found 150 origins to seed
✅ Bulk ingest complete: { ok: true, ... }
```

## 🔧 Troubleshooting

### Free Audit Widget Not Working

**Check:**
1. `FLEET_API_BASE` is set correctly
2. `X_API_KEY` is valid
3. Network tab shows API calls
4. Redis cache is working (optional for MVP)

**Debug:**
```bash
# Check API directly
curl "https://your-app.vercel.app/api/ai-scores?origin=https://test.com"
```

### Fleet Dashboard Empty

**Check:**
1. Fleet API is running and accessible
2. `X_API_KEY` matches fleet API
3. API returns expected format: `{ origins: [...] }`

### Cron Jobs Not Running

**Check:**
1. Vercel Cron Jobs dashboard shows scheduled jobs
2. `CRON_SECRET` matches authorization header
3. Logs show successful execution

**Verify in Vercel:**
- Project → Settings → Cron Jobs
- Check execution history

## ✅ Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Git repository connected
- [ ] First commit made
- [ ] Vercel project deployed
- [ ] Free Audit Widget tested
- [ ] Fleet Dashboard accessible
- [ ] Cron jobs configured
- [ ] Origins seeded (if needed)

## 🎯 Next Steps After Deployment

1. **Monitor Logs**
   - Vercel Dashboard → Project → Logs
   - Watch for errors in first 24 hours

2. **Set Up Alerts**
   - Vercel notifications for deployment failures
   - Cron job failure alerts

3. **Performance Testing**
   - Test with real dealership URLs
   - Verify Redis caching works
   - Check API response times

4. **User Testing**
   - Share landing page with beta users
   - Collect feedback on Free Audit Widget
   - Iterate on UX

## 📝 Notes

- **dAI Rebrand**: Update branding throughout codebase when ready
- **Environment Sync**: Ensure `.env.local` matches Vercel production vars
- **Redis**: Upstash free tier works for MVP, upgrade as needed
- **Fleet API**: Can be internal service or separate Vercel deployment

