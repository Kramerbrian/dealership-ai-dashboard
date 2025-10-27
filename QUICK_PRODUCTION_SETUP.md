# 🚀 DealershipAI Quick Production Setup

## Current Status ✅
- **Platform Deployed:** https://dealership-ai-dashboard-20c8hhwxz-brian-kramer-dealershipai.vercel.app
- **Build Status:** ✅ Successful
- **Ready for:** Environment variables and external services

## Step 1: Environment Variables (Vercel Dashboard)

### 1.1 Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `dealership-ai-dashboard` project
3. Click **Settings** → **Environment Variables**

### 1.2 Add These Variables

#### Required for Basic Functionality
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

#### Database (Choose One)
**Option A: Vercel Postgres**
```
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

**Option B: Supabase**
```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

#### Redis (Upstash)
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

#### Stripe (For Billing)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

## Step 2: Quick Service Setup

### 2.1 Clerk Authentication (5 minutes)
1. Go to [clerk.com](https://clerk.com)
2. Create new application
3. Copy keys to Vercel environment variables

### 2.2 Database Setup (5 minutes)
**Easiest: Vercel Postgres**
1. Vercel dashboard → Storage → Create Postgres
2. Copy connection string to `DATABASE_URL`

**Alternative: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string and keys

### 2.3 Redis Setup (3 minutes)
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy URL and token to Vercel

### 2.4 Stripe Setup (10 minutes)
1. Go to [stripe.com](https://stripe.com)
2. Create products:
   - **PRO:** $99/month
   - **ENTERPRISE:** $299/month
3. Set up webhook: `https://your-domain.com/api/stripe/webhook`
4. Copy keys to Vercel

## Step 3: Database Migration

### 3.1 Run Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed with sample data
npm run db:seed
```

### 3.2 Verify Connection
```bash
# Test database connection
npx prisma db pull
```

## Step 4: Custom Domain (Optional)

### 4.1 Add Domain in Vercel
1. Project settings → Domains
2. Add `dealershipai.com`
3. Configure DNS as instructed

### 4.2 DNS Records
```
A Record: @ → 76.76.19.61
CNAME: www → cname.vercel-dns.com
```

## Step 5: Test Everything

### 5.1 Test Core Features
- [ ] User registration/login
- [ ] QAI score calculation
- [ ] Dashboard navigation
- [ ] Tier-based features
- [ ] Stripe checkout

### 5.2 Test API Endpoints
```bash
# Test QAI calculation
curl -X POST https://your-domain.com/api/qai/calculate \
  -H "Content-Type: application/json" \
  -d '{"domain": "test-dealership.com"}'
```

## Step 6: Go Live! 🚀

### 6.1 Launch Sequence
1. **Soft Launch:** Test with 5-10 users
2. **Beta Launch:** Invite 50 dealerships
3. **Public Launch:** Full marketing campaign

### 6.2 Monitor Success
- User signups per day
- Conversion rate (Free → Paid)
- Revenue per user
- System performance
- User feedback

## Quick Commands

### Setup Database
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Test Production
```bash
npm run build
npm run test:ci
```

### Deploy Updates
```bash
vercel --prod
```

## Troubleshooting

### Common Issues
1. **Build Fails:** Check environment variables
2. **Database Error:** Verify connection string
3. **Redis Error:** Check Upstash credentials
4. **Stripe Error:** Verify webhook URL

### Quick Fixes
```bash
# Check environment variables
vercel env ls

# Redeploy with new variables
vercel --prod

# Check logs
vercel logs
```

---

## 🎯 Success Metrics

Track these after launch:
- **Signups:** Target 10+ per day
- **Conversion:** 5% Free → Paid
- **Revenue:** $5,000+ MRR
- **Performance:** <2s load time
- **Uptime:** >99.9%

**Your DealershipAI platform is ready to capture the automotive AI search market!** 🚀

## Support Resources
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Clerk Docs:** [clerk.com/docs](https://clerk.com/docs)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **Upstash Docs:** [docs.upstash.com](https://docs.upstash.com)
