# DealershipAI - Complete Deployment Guide

Complete guide for deploying DealershipAI to production using Vercel, Clerk, Supabase, and Stripe.

---

## 🚀 Quick Deploy (5 Minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Clerk account (free tier: 10k MAU)
- Supabase account (free tier: 500MB)
- Stripe account (test mode free)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/dealershipai-dashboard)

---

## 📋 Step-by-Step Setup

### 1️⃣ Database Setup (Supabase)

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save these credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API)

#### Run Database Migration
```sql
-- Run this in Supabase SQL Editor

-- Dealers table
CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    dealership_name TEXT,
    dealership_url TEXT,
    tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL REFERENCES dealers(clerk_user_id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    tier TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session usage tracking
CREATE TABLE session_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL REFERENCES dealers(clerk_user_id),
    month TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clerk_user_id, month)
);

-- AI visibility scores
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL REFERENCES dealers(clerk_user_id),
    seo_score INTEGER,
    aeo_score INTEGER,
    geo_score INTEGER,
    eeat_score JSONB,
    scan_date TIMESTAMPTZ DEFAULT NOW(),
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_dealers_clerk_user_id ON dealers(clerk_user_id);
CREATE INDEX idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX idx_session_usage_clerk_user_id ON session_usage(clerk_user_id);
CREATE INDEX idx_scores_clerk_user_id ON scores(clerk_user_id);

-- RPC function to increment session usage
CREATE OR REPLACE FUNCTION increment_session_usage(
    user_id TEXT,
    month TEXT
)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    INSERT INTO session_usage (clerk_user_id, month, count)
    VALUES (user_id, month, 1)
    ON CONFLICT (clerk_user_id, month)
    DO UPDATE SET count = session_usage.count + 1;

    SELECT count INTO current_count
    FROM session_usage
    WHERE clerk_user_id = user_id AND session_usage.month = month;

    RETURN current_count;
END;
$$ LANGUAGE plpgsql;
```

---

### 2️⃣ Authentication Setup (Clerk)

#### Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Create new application
3. Choose authentication methods:
   - ✅ Email
   - ✅ Google
   - ✅ Optional: GitHub, Microsoft

#### Configure Clerk
1. **Get API Keys** (Settings → API Keys):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

2. **Set up Webhooks** (Settings → Webhooks):
   - Create endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Subscribe to events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - Save `CLERK_WEBHOOK_SECRET`

3. **Configure URLs** (Settings → Paths):
   - Sign in URL: `/sign-in`
   - Sign up URL: `/sign-up`
   - After sign in: `/dashboard`
   - After sign up: `/dashboard`

---

### 3️⃣ Payment Setup (Stripe)

#### Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Get API keys (Developers → API keys):
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`

#### Create Products & Prices
```bash
# Install Stripe CLI
stripe login

# Create Professional tier
stripe products create \
  --name "DealershipAI Professional" \
  --description "Full 3-pillar analysis with 25 AI chat sessions"

stripe prices create \
  --product prod_xxx \
  --unit-amount 49900 \
  --currency usd \
  --recurring-interval month

# Save as: STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx

# Create Enterprise tier
stripe products create \
  --name "DealershipAI Enterprise" \
  --description "Daily monitoring with 125 AI chat sessions"

stripe prices create \
  --product prod_yyy \
  --unit-amount 99900 \
  --currency usd \
  --recurring-interval month

# Save as: STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_yyy
```

#### Set up Webhooks
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Save `STRIPE_WEBHOOK_SECRET`

---

### 4️⃣ AI Provider Setup

#### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Save as `ANTHROPIC_API_KEY`
4. **Cost**: ~$0.001 per session (Haiku)

#### OpenAI (GPT-4) - Optional
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Save as `OPENAI_API_KEY`
4. **Cost**: ~$0.015 per validation query

---

### 5️⃣ Deploy to Vercel

#### Option A: Deploy from GitHub

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/dealershipai.git
git push -u origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**:
   Copy all variables from `.env` to Vercel:
   - Settings → Environment Variables
   - Paste each variable
   - Make sure to set for `Production`, `Preview`, and `Development`

#### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add ANTHROPIC_API_KEY
# ... add all variables

# Deploy to production
vercel --prod
```

---

### 6️⃣ Configure Webhooks (Post-Deployment)

#### Update Clerk Webhook
1. Clerk Dashboard → Webhooks
2. Update endpoint URL to: `https://your-domain.vercel.app/api/webhooks/clerk`
3. Test webhook

#### Update Stripe Webhook
1. Stripe Dashboard → Webhooks
2. Update endpoint URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Send test webhook

#### Test Webhook Endpoints
```bash
# Test Clerk webhook
curl -X POST https://your-domain.vercel.app/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: test" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: test"

# Test Stripe webhook
curl -X POST https://your-domain.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test"
```

---

## 🧪 Testing the Deployment

### 1. Test Authentication
```bash
# Visit your site
open https://your-domain.vercel.app

# Sign up with test email
# Verify user created in:
# - Clerk Dashboard
# - Supabase dealers table
```

### 2. Test Payment Flow
```bash
# Use Stripe test card
# 4242 4242 4242 4242
# Any future date, any CVC

# Subscribe to Professional tier
# Verify in:
# - Stripe Dashboard
# - Supabase subscriptions table
```

### 3. Test AI Analysis
```bash
# Run analysis on test dealership
curl "https://your-domain.vercel.app/api/analyze?url=https://terryreidhyundai.com" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Check response includes:
# - SEO score
# - AEO score
# - GEO score
# - E-E-A-T breakdown
```

### 4. Test Chat Sessions
```bash
# Test agentic chat
curl -X POST "https://your-domain.vercel.app/api/chatbot" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "How can I improve my dealership visibility?"}'

# Verify session count increments in Supabase
```

---

## 🔧 Optional Enhancements

### Redis/Upstash (Caching)

For better performance, add Redis:

1. Create [Upstash](https://upstash.com) account (free tier: 10K commands/day)
2. Create Redis database
3. Get `REDIS_URL`
4. Add to Vercel environment variables

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!
})
```

### Custom Domain

1. Vercel → Settings → Domains
2. Add your domain (e.g., `dealershipai.com`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Update Clerk allowed origins
5. Update Stripe webhook URLs

### Monitoring & Analytics

#### Vercel Analytics
```bash
# Add to package.json
npm install @vercel/analytics

# Add to _app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

#### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs

# Add to next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // your config
}, {
  org: "your-org",
  project: "dealershipai"
})
```

---

## 📊 Cost Breakdown (Per Month)

### Free Tier (0-100 users)
- Vercel: $0 (Hobby plan)
- Clerk: $0 (10k MAU)
- Supabase: $0 (500MB, 2GB bandwidth)
- Upstash: $0 (10k requests/day)
- **Total**: $0/month

### Growth (100-1,000 users)
- Vercel: $20/month (Pro)
- Clerk: $25/month (Essential)
- Supabase: $25/month (Pro)
- Upstash: $10/month
- AI APIs: ~$200/month (1000 users × $0.20)
- **Total**: $280/month

### Scale (1,000-10,000 users)
- Vercel: $20/month
- Clerk: $99/month (Production)
- Supabase: $25/month
- Upstash: $30/month
- AI APIs: ~$2,000/month (10k users × $0.20)
- **Total**: $2,174/month

**Revenue at Scale**:
- 1,000 users × 35% paid × $499 avg = $174,650/month
- Profit: $172,476/month (99% margin)

---

## 🔒 Security Checklist

- [ ] Enable row-level security (RLS) in Supabase
- [ ] Add rate limiting to API routes
- [ ] Validate all webhook signatures
- [ ] Use environment variables for secrets
- [ ] Enable CORS restrictions
- [ ] Set up CSP headers
- [ ] Enable HTTPS only
- [ ] Add API key rotation schedule
- [ ] Set up monitoring alerts
- [ ] Create backup strategy

---

## 🐛 Troubleshooting

### Webhook Not Working
```bash
# Check webhook logs
# Vercel → Your Project → Functions → Select API route

# Test webhook locally
vercel dev
ngrok http 3000
# Update webhook URL to ngrok URL
```

### Database Connection Issues
```bash
# Verify Supabase credentials
psql "postgresql://[CONNECTION_STRING]"

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'dealers';
```

### Authentication Errors
```bash
# Verify Clerk middleware
# Check middleware.ts exists at root

# Verify public routes in middleware
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Clerk Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)

---

## 🆘 Support

- Issues: [GitHub Issues](https://github.com/yourusername/dealershipai/issues)
- Docs: [Documentation](https://docs.dealershipai.com)
- Discord: [Community](https://discord.gg/dealershipai)

---

**🎉 Congratulations!** Your DealershipAI platform is now live and ready to generate $486-$940 profit per paid customer!
