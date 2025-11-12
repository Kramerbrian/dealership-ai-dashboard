# ⚡ Quick Production Deploy - 5 Steps

## Step 1: Set Environment Variables (5 min)

**Vercel Dashboard → Project → Settings → Environment Variables**

Add these **required** variables for **Production**:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
FLEET_API_BASE=https://...
X_API_KEY=...
CRON_SECRET=...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealershipai.com
```

## Step 2: Run Database Migration (2 min)

```bash
npx prisma generate
npx prisma migrate deploy
```

## Step 3: Build & Verify (3 min)

```bash
npm run build
# Check for errors
```

## Step 4: Deploy (2 min)

```bash
npx vercel --prod
```

## Step 5: Test (5 min)

```bash
# Health check
curl https://your-app.vercel.app/api/status

# Test landing page
open https://your-app.vercel.app

# Test dashboard (requires auth)
open https://your-app.vercel.app/dashboard
```

**Total Time: ~17 minutes**

---

## ✅ Production Checklist

- [ ] Environment variables set
- [ ] Database migrated
- [ ] Build successful
- [ ] Deployed to Vercel
- [ ] Health endpoint working
- [ ] Landing page loads
- [ ] Dashboard accessible (with auth)
- [ ] Cron jobs configured

---

**See `PRODUCTION_READINESS_CHECKLIST.md` for complete checklist.**

