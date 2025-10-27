# 🚀 DealershipAI Production Setup Guide

## Current Status ✅
- **Platform Deployed:** https://dealership-ai-dashboard-20c8hhwxz-brian-kramer-dealershipai.vercel.app
- **Build Status:** ✅ Successful
- **Core Features:** ✅ All implemented

## Step 1: Environment Variables Setup

### 1.1 Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `dealership-ai-dashboard` project
3. Click on **Settings** → **Environment Variables**

### 1.2 Add Required Environment Variables

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

#### Database (PostgreSQL)
```
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

#### Redis (Upstash)
```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

#### Optional Services
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_GA_ID=G-...
```

## Step 2: External Services Setup

### 2.1 PostgreSQL Database

#### Option A: Vercel Postgres (Recommended)
1. Go to Vercel dashboard → Storage
2. Create new Postgres database
3. Copy connection string to `DATABASE_URL`

#### Option B: Supabase (Alternative)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add both `DATABASE_URL` and Supabase keys

#### Option C: Railway/Render (Other options)
- Railway: [railway.app](https://railway.app)
- Render: [render.com](https://render.com)

### 2.2 Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST URL and token
4. Add to Vercel environment variables

### 2.3 Stripe Setup
1. Go to [stripe.com](https://stripe.com) dashboard
2. Create products and prices:
   - **PRO Plan:** $99/month
   - **ENTERPRISE Plan:** $299/month
3. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret

## Step 3: Database Migration

### 3.1 Run Prisma Migrations
```bash
# Install Prisma CLI globally
npm install -g prisma

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

## Step 5: Testing & Verification

### 5.1 Test Core Features
- [ ] User registration/login
- [ ] QAI score calculation
- [ ] Dashboard navigation
- [ ] Tier-based feature gating
- [ ] Stripe checkout flow

### 5.2 Test API Endpoints
```bash
# Test QAI calculation
curl -X POST https://your-domain.com/api/qai/calculate \
  -H "Content-Type: application/json" \
  -d '{"domain": "test-dealership.com"}'

# Test Stripe webhook
curl -X POST https://your-domain.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed"}'
```

### 5.3 Performance Testing
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## Step 6: Monitoring & Analytics

### 6.1 Set Up Monitoring
- **Vercel Analytics:** Automatic
- **Sentry:** Error tracking (optional)
- **Google Analytics:** User behavior (optional)

### 6.2 Set Up Alerts
- Database connection monitoring
- API response time alerts
- Error rate monitoring
- Stripe webhook failure alerts

## Step 7: Security Checklist

### 7.1 Security Verification
- [ ] Environment variables are secure
- [ ] Database connections use SSL
- [ ] API endpoints have proper authentication
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Input validation is in place

### 7.2 Security Audit
```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix --force
```

## Step 8: Launch Preparation

### 8.1 Final Testing
```bash
# Run full test suite
npm run test:ci

# Run E2E tests
npm run test:e2e

# Performance testing
npm run build
```

### 8.2 Launch Checklist
- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] External services connected
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security audit passed

## Step 9: Go Live! 🚀

### 9.1 Launch Sequence
1. **Soft Launch:** Test with limited users
2. **Beta Launch:** Invite select dealerships
3. **Public Launch:** Full marketing campaign

### 9.2 Post-Launch Monitoring
- Monitor user signups
- Track conversion rates
- Monitor system performance
- Collect user feedback
- Iterate and improve

## Troubleshooting

### Common Issues
1. **Build Failures:** Check environment variables
2. **Database Connection:** Verify connection string
3. **Redis Connection:** Check Upstash credentials
4. **Stripe Webhooks:** Verify webhook URL and secret
5. **Domain Issues:** Check DNS propagation

### Support Resources
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Clerk Documentation: [clerk.com/docs](https://clerk.com/docs)
- Upstash Documentation: [docs.upstash.com](https://docs.upstash.com)

---

## 🎯 Success Metrics

After launch, monitor:
- **User Acquisition:** Signups per day
- **Conversion Rate:** Free → Paid conversion
- **Revenue:** Monthly recurring revenue
- **Performance:** Page load times, API response times
- **Uptime:** System availability
- **User Satisfaction:** NPS scores, feedback

**Your DealershipAI platform is ready to capture the automotive AI search market!** 🚀
