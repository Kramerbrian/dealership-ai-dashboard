# 🚀 DealershipAI Production Setup Guide

## Overview
This guide will walk you through setting up all production services for DealershipAI to go from mock data to fully functional SaaS platform.

**Estimated Time:** 30-45 minutes  
**Cost:** Free tier for most services (scales automatically)

---

## Step 1: Configure Vercel Environment Variables

### A. Access Vercel Dashboard
1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable below

### B. Clerk Authentication Keys

#### Get Your Keys
1. Go to: https://dashboard.clerk.com/apps
2. Select your app: `dealership-ai-dashboard`
3. Go to **API Keys** section

#### Add to Vercel
```bash
# Add these 4 variables:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx

# Optional: Force redirect URLs
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://your-domain.vercel.app/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://your-domain.vercel.app/dashboard

# Environment: Production (select from dropdown)
```

#### Configure Redirect URLs in Clerk
1. Go to **URLs** in Clerk dashboard
2. Add these URLs:
   - **Sign-in URL:** `https://your-domain.vercel.app/auth/signin`
   - **Sign-up URL:** `https://your-domain.vercel.app/auth/signup`
   - **After sign-in:** `https://your-domain.vercel.app/dashboard`
   - **After sign-up:** `https://your-domain.vercel.app/dashboard`

---

## Step 2: Set Up Supabase PostgreSQL Database

### A. Create Supabase Account
1. Go to: https://supabase.com
2. Click **Start your project** (free tier is fine)
3. Sign in with GitHub/Google
4. Create new project:
   - **Name:** `dealershipai-production`
   - **Database Password:** Save this securely!
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (to start)

### B. Get Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Copy the URI (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

### C. Add to Vercel Environment Variables
```bash
# Add to Vercel:
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Also add for migrations:
DIRECT_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-us-east-1.xxxx.supabase.co:5432/postgres
```

### D. Set Up Database Schema
```bash
# On your local machine or Vercel:
cd /Users/stephaniekramer/dealership-ai-dashboard

# Copy production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Optional: Seed with demo data
npx prisma db seed
```

### E. Run Migrations (One-Time Setup)
```bash
# Update vercel.json to include Prisma generate in build
npx prisma migrate deploy
```

---

## Step 3: Set Up Upstash Redis

### A. Create Upstash Account
1. Go to: https://upstash.com
2. Sign up (free tier: 10,000 commands/day)
3. Click **Create Database**
4. Settings:
   - **Name:** `dealershipai-redis`
   - **Type:** Regional (closest to Vercel region)
   - **Consistency:** Eventual (faster)
   - **Multi-Zone:** Disabled (save costs)

### B. Get Credentials
1. After creating database, click **Details**
2. Copy:
   - **UPSTASH_REDIS_REST_URL** (looks like: `https://xxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string of characters)

### C. Add to Vercel
```bash
# Add to Vercel environment variables:
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Environment: Production
```

### D. Install Upstash in Project
```bash
# Already installed via package.json
# But verify it's there:
npm list @upstash/redis
```

---

## Step 4: Configure Stripe for Payments

### A. Create Stripe Account
1. Go to: https://stripe.com
2. Sign up → Activate account
3. Complete business info

### B. Get API Keys
1. Go to **Developers** → **API keys**
2. Toggle to **Test mode** (for now)
3. Copy:
   - **Publishable key:** `pk_test_xxxxx`
   - **Secret key:** `sk_test_xxxxx`

### C. Add to Vercel
```bash
# Add to Vercel:
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# For production, switch to live keys:
# pk_live_xxxxx and sk_live_xxxxx
```

### D. Configure Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **URL:** `https://your-domain.vercel.app/api/stripe/webhook`
4. **Events to send:** Select these:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### E. Create Products in Stripe
1. Go to **Products**
2. Create products matching your tiers:

**Level 2 (Pro):**
- Name: "DealershipAI Pro"
- Price: $499/month
- Billing: Recurring

**Level 3 (Enterprise):**
- Name: "DealershipAI Enterprise"
- Price: $999/month
- Billing: Recurring

3. Copy Product IDs and add to environment variables:
```bash
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

---

## Step 5: Configure Google APIs (Optional but Recommended)

### A. Google Search Console API
1. Go to: https://console.cloud.google.com
2. Create new project: `DealershipAI`
3. Enable **Google Search Console API**
4. Create credentials → Service Account
5. Download JSON key file
6. Add contents to Vercel: `GOOGLE_SEARCH_CONSOLE_CREDENTIALS={...}`

### B. Google Business Profile API
1. In same Google Cloud project, enable **Google My Business API**
2. Enable **Places API**
3. Same credentials work for both

### C. Google Analytics (GA4)
1. Go to: https://analytics.google.com
2. Create new property → **Measurement ID** (G-XXXXXXX)
3. Add to Vercel: `NEXT_PUBLIC_GA_ID=G-XXXXXXX`

---

## Step 6: Additional Services (Optional)

### A. Sentry (Error Tracking)
1. Go to: https://sentry.io (free tier: 5K events/month)
2. Create project → Next.js
3. Copy DSN
4. Add to Vercel: `SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx`

### B. PostHog (Product Analytics)
1. Go to: https://posthog.com (free tier: 1M events/month)
2. Create project
3. Copy API key
4. Add to Vercel: `NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx`

### C. Resend (Email)
1. Go to: https://resend.com (free tier: 100 emails/day)
2. Create API key
3. Add to Vercel: `RESEND_API_KEY=re_xxxxx`

---

## Step 7: Update Vercel Build Settings

### A. Update `package.json` Scripts
```json
{
  "scripts": {
    "build": "prisma generate && prisma db push && next build",
    "postbuild": "prisma generate"
  }
}
```

### B. Configure Vercel
1. Go to **Settings** → **General**
2. Under **Build & Development Settings**:
   - **Node Version:** 18.x
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

---

## Step 8: Deploy Updated Configuration

### A. Commit Changes
```bash
cd /Users/stephaniekramer/dealership-ai-dashboard

# Add all environment configurations
git add prisma/schema.production.prisma
git add PRODUCTION_SETUP_GUIDE.md

# Commit
git commit -m "Add production configuration and setup guide"

# Don't push yet - add environment variables first
```

### B. Add Environment Variables in Vercel
Use the Vercel dashboard to add all variables from Steps 1-5 above.

### C. Redeploy
```bash
# Trigger new deployment with environment variables
npx vercel --prod --yes
```

---

## Step 9: Test Production Features

### Test Authentication
1. Visit: https://your-domain.vercel.app
2. Click **Sign Up**
3. Complete registration
4. Should redirect to `/dashboard`

### Test Database Connection
```bash
# In production logs or local:
curl https://your-domain.vercel.app/api/test-db
# Should return: {"connected": true}
```

### Test Redis Connection
```bash
curl https://your-domain.vercel.app/api/test-redis
# Should return: {"connected": true}
```

### Test Stripe
1. Go to dashboard
2. Click **Upgrade to Pro**
3. Test checkout flow
4. Verify webhook receives event

---

## Step 10: Configure Custom Domain (Optional)

### A. Add Domain in Vercel
1. Go to **Settings** → **Domains**
2. Add domain: `dealershipai.com`
3. Vercel provides DNS records

### B. Update DNS Records
Go to your DNS provider and add:
- **A Record:** `@` → Vercel IP
- **CNAME:** `www` → `cname.vercel-dns.com`

### C. SSL Certificate
Vercel automatically provisions SSL (takes 1-24 hours)

---

## Complete Environment Variables Checklist

Copy this entire section and fill in with your actual values:

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://your-domain.com/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://your-domain.com/dashboard

# Database (Supabase)
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:5432/postgres

# Caching (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Payments (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXX

# Optional Services
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
RESEND_API_KEY=re_xxx

# Google APIs (optional)
GOOGLE_SEARCH_CONSOLE_CREDENTIALS={"type":"service_account",...}

# Encryption
ENCRYPTION_KEY=32-character-hex-string-for-credential-encryption

# Cron Secret
CRON_SECRET=random-secret-for-cron-webhook-authentication
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection locally
npx prisma db push
npx prisma studio  # Opens database browser
```

### Redis Connection Issues
```bash
# Test Redis connection
node -e "const {Redis} = require('@upstash/redis'); const r = new Redis({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN}); r.ping().then(console.log);"
```

### Stripe Webhook Issues
```bash
# Install Stripe CLI locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook
stripe trigger checkout.session.completed
```

---

## Cost Breakdown (Month 1)

**Free Tier Options:**
- ✅ Vercel: Free (until > $20/mo usage)
- ✅ Supabase: Free (500MB database + 2GB bandwidth)
- ✅ Upstash: Free (10K commands/day)
- ✅ Clerk: Free (10K MAU + unlimited organizations)
- ❌ Stripe: 2.9% + $0.30 per transaction (no free tier)
- ❌ Sentry: Free (5K events/month)
- ❌ PostHog: Free (1M events/month)

**Total Monthly Cost:** ~$0-50 (before customers)

**With 10 Customers ($5K MRR):**
- Stripe fees: $50
- Various services: $0-20
- **Total Cost:** ~$70
- **Net Profit:** $4,930/month (98.6% margin)

---

## Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] Database password is strong and unique
- [ ] Stripe webhooks are verified with signature
- [ ] Clerk authentication is configured correctly
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled
- [ ] Secrets are rotated regularly

---

## Next Steps After Setup

1. **Test All Features** (Week 1)
   - Authentication flows
   - Payment flows
   - API endpoints
   - Database operations

2. **Connect Real Data** (Week 2)
   - Google Search Console
   - Google Business Profile
   - Replace mock data

3. **Beta Launch** (Week 3)
   - Invite 5-10 dealers
   - Gather feedback
   - Iterate

4. **Public Launch** (Month 2)
   - Marketing site live
   - Start acquiring customers
   - Monitor metrics

---

## Success Criteria

✅ **Authentication** - Users can sign up and sign in  
✅ **Database** - Data persists and queries are fast  
✅ **Payments** - Users can upgrade tiers  
✅ **Analytics** - You can track user behavior  
✅ **APIs** - All endpoints return real data  
✅ **Performance** - Page load < 2s  
✅ **Uptime** - 99.9%+

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Upstash Docs:** https://docs.upstash.com
- **Stripe Docs:** https://stripe.com/docs
- **Clerk Docs:** https://clerk.com/docs

---

## Quick Reference Commands

```bash
# Deploy to production
npx vercel --prod

# View logs
npx vercel logs

# Open dashboard
npx vercel --open

# Pull environment variables
npx vercel env pull .env.production

# Database management
npx prisma studio  # Browse database
npx prisma db push  # Push schema changes
npx prisma generate  # Generate client

# Test Redis
node -e "const r=require('@upstash/redis');new r.Redis({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN}).ping().then(console.log);"
```

---

**Status**: 🎯 Ready for Production Setup  
**Next**: Follow steps 1-10 above  
**Time**: 30-45 minutes total
