# 🚀 Vercel Production Setup Guide

## Current Status ✅
- **Platform Deployed:** https://dealership-ai-dashboard-20c8hhwxz-brian-kramer-dealershipai.vercel.app
- **Vercel CLI:** ✅ Authenticated as brian-9561
- **Build Status:** ✅ Successful

## Step 1: Add Environment Variables in Vercel Dashboard

### 1.1 Access Your Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `dealership-ai-dashboard` project
3. Click on **Settings** → **Environment Variables**

### 1.2 Add These Environment Variables

#### Required Variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://username:password@host:5432/database_name
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

#### Optional Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_GA_ID=G-...
```

## Step 2: Set Up External Services

### 2.1 PostgreSQL Database
**Option A: Vercel Postgres (Recommended)**
1. Go to Vercel dashboard → Storage
2. Create new Postgres database
3. Copy connection string to `DATABASE_URL`

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database

### 2.2 Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST URL and token

### 2.3 Stripe Setup
1. Go to [stripe.com](https://stripe.com) dashboard
2. Create products and prices:
   - **PRO Plan:** $99/month
   - **ENTERPRISE Plan:** $299/month
3. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Step 3: Database Migration

### 3.1 Run Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed database
npm run db:seed
```

### 3.2 Verify Database Connection
```bash
# Test database connection
npx prisma db pull
```

## Step 4: Custom Domain Setup

### 4.1 Add Domain in Vercel
1. Go to project settings → Domains
2. Add `dealershipai.com`
3. Configure DNS records as instructed

### 4.2 DNS Configuration
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## Step 5: Test Production Deployment

### 5.1 Redeploy with Environment Variables
```bash
# Redeploy to apply environment variables
npx vercel --prod
```

### 5.2 Test Core Features
- [ ] User registration/login
- [ ] QAI score calculation
- [ ] Dashboard navigation
- [ ] Tier-based feature gating
- [ ] Stripe checkout flow

## Step 6: Monitoring Setup

### 6.1 Vercel Analytics
- Automatic with Vercel deployment
- Monitor page views, performance, and errors

### 6.2 Optional Monitoring
- **Sentry:** Error tracking
- **Google Analytics:** User behavior
- **Upstash Redis:** Cache monitoring

## Quick Commands

### Check Deployment Status
```bash
npx vercel ls
```

### View Deployment Logs
```bash
npx vercel logs [deployment-url]
```

### Redeploy
```bash
npx vercel --prod
```

### Check Environment Variables
```bash
npx vercel env ls
```

## Troubleshooting

### Common Issues
1. **Build Failures:** Check environment variables
2. **Database Connection:** Verify connection string
3. **Redis Connection:** Check Upstash credentials
4. **Stripe Webhooks:** Verify webhook URL and secret

### Support Resources
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Clerk Documentation: [clerk.com/docs](https://clerk.com/docs)
- Upstash Documentation: [docs.upstash.com](https://docs.upstash.com)

---

## 🎯 Next Steps

1. **Add environment variables** in Vercel dashboard
2. **Set up external services** (Database, Redis, Stripe)
3. **Configure custom domain** (dealershipai.com)
4. **Test the live platform**
5. **Start acquiring customers!**

**Your DealershipAI platform is ready for production!** 🚀
