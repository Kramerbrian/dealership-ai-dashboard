# 🚀 DealershipAI Full SaaS Setup - Step by Step

## Current Status
✅ **Deployed**: https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app  
⏳ **Next**: Add Clerk keys → Full production setup

---

## Phase 1: Authentication Setup (5 minutes)

### Step 1: Add Clerk Keys to Vercel

**Option A: Web Dashboard (Recommended)**
1. Open: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
2. Click **Add New**
3. Add these variables:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Value: `pk_test_xxxxxxxxxxxxxxxxxxxxx` (from Clerk dashboard)
   - Environment: **Production** ✓
   - Click **Save**

   **Variable 2:**
   - Key: `CLERK_SECRET_KEY`
   - Value: `sk_test_xxxxxxxxxxxxxxxxxxxxx` (from Clerk dashboard)
   - Environment: **Production** ✓
   - Click **Save**

**Option B: CLI (Interactive)**
```bash
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste your publishable key when prompted

npx vercel env add CLERK_SECRET_KEY production
# Paste your secret key when prompted
```

### Step 2: Configure Clerk Redirects
1. Go to: https://dashboard.clerk.com
2. Select your app → **Configure** → **URLs**
3. Add to **Allowed Origins:**
   - `https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app`
   - `https://dealershipai.com` (for later)
4. Set **Redirect URLs:**
   - After sign in: `/dashboard`
   - After sign up: `/dashboard`

### Step 3: Redeploy and Test
```bash
npx vercel --prod
```
**Test:** Visit your URL → Click "Sign Up" → Complete registration

---

## Phase 2: Database Setup (10 minutes)

### Step 1: Create Supabase Account
1. Go to: https://supabase.com
2. Click **Start your project** (free tier)
3. Sign in with GitHub
4. Create project:
   - **Name:** `dealershipai-production`
   - **Database Password:** Save securely!
   - **Region:** Choose closest to users
   - **Pricing:** Free

### Step 2: Get Database URL
1. In Supabase dashboard → **Settings** → **Database**
2. Scroll to **Connection string**
3. Copy the URI (looks like: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`)

### Step 3: Add to Vercel
```bash
# Add to Vercel environment variables:
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:5432/postgres
```

### Step 4: Set Up Database Schema
```bash
# Copy production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Optional: Seed with demo data
npx prisma db seed
```

---

## Phase 3: Caching Setup (5 minutes)

### Step 1: Create Upstash Account
1. Go to: https://upstash.com
2. Sign up (free tier: 10K commands/day)
3. Click **Create Database**
4. Settings:
   - **Name:** `dealershipai-redis`
   - **Type:** Regional
   - **Consistency:** Eventual

### Step 2: Get Credentials
1. After creation → **Details**
2. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### Step 3: Add to Vercel
```bash
# Add to Vercel environment variables:
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

---

## Phase 4: Payment Setup (15 minutes)

### Step 1: Create Stripe Account
1. Go to: https://stripe.com
2. Sign up → Activate account
3. Complete business info

### Step 2: Get API Keys
1. **Developers** → **API keys**
2. Toggle to **Test mode** (for now)
3. Copy:
   - **Publishable key:** `pk_test_xxxxx`
   - **Secret key:** `sk_test_xxxxx`

### Step 3: Add to Vercel
```bash
# Add to Vercel environment variables:
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

### Step 4: Configure Webhooks
1. **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **URL:** `https://your-domain.vercel.app/api/stripe/webhook`
4. **Events:** Select these:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** → Add to Vercel

### Step 5: Create Products
1. **Products** → **Add product**
2. Create:
   - **Pro:** $499/month
   - **Enterprise:** $999/month
3. Copy Product IDs → Add to environment variables

---

## Phase 5: Optional Services (10 minutes)

### Google APIs (Optional)
```bash
# Google Search Console API
GOOGLE_SEARCH_CONSOLE_CREDENTIALS={"type":"service_account",...}

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXX
```

### Error Tracking (Optional)
```bash
# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx

# Email Service
RESEND_API_KEY=re_xxxxx
```

---

## Phase 6: Custom Domain (10 minutes)

### Step 1: Add Domain in Vercel
1. **Settings** → **Domains**
2. Add domain: `dealershipai.com`
3. Vercel provides DNS records

### Step 2: Update DNS
Go to your DNS provider and add:
- **A Record:** `@` → Vercel IP
- **CNAME:** `www` → `cname.vercel-dns.com`

### Step 3: Update Clerk URLs
1. Add `https://dealershipai.com` to Clerk allowed origins
2. Update redirect URLs

---

## Complete Environment Variables Checklist

Copy this and fill in your values:

```bash
# Authentication (Clerk) - REQUIRED
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://dealershipai.com/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://dealershipai.com/dashboard

# Database (Supabase) - REQUIRED
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:5432/postgres

# Caching (Upstash Redis) - REQUIRED
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Payments (Stripe) - REQUIRED
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXX

# Optional Services
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
RESEND_API_KEY=re_xxx

# Google APIs (Optional)
GOOGLE_SEARCH_CONSOLE_CREDENTIALS={"type":"service_account",...}

# Security
ENCRYPTION_KEY=32-character-hex-string
CRON_SECRET=random-secret-for-cron-webhooks
```

---

## Testing Checklist

After each phase, test:

### Authentication ✅
- [ ] Can sign up
- [ ] Can sign in
- [ ] Can sign out
- [ ] Redirects work

### Database ✅
- [ ] Data persists
- [ ] Queries are fast
- [ ] Migrations work

### Caching ✅
- [ ] Redis connects
- [ ] Cache operations work

### Payments ✅
- [ ] Can start checkout
- [ ] Webhook receives events
- [ ] User tier updates

### End-to-End ✅
- [ ] Complete user journey works
- [ ] All APIs return real data
- [ ] Performance is good

---

## Cost Breakdown

### Free Tier (Month 1)
- ✅ Vercel: Free
- ✅ Supabase: Free (500MB DB)
- ✅ Upstash: Free (10K commands/day)
- ✅ Clerk: Free (10K MAU)
- ❌ Stripe: 2.9% + $0.30 per transaction

### With 10 Customers ($5K MRR)
- Stripe fees: ~$50
- Various services: ~$20
- **Total Cost:** ~$70
- **Net Profit:** $4,930/month (98.6% margin)

---

## Quick Commands Reference

```bash
# Deploy updates
npx vercel --prod

# View logs
npx vercel logs

# Pull environment variables
npx vercel env pull .env.production

# Database management
npx prisma studio
npx prisma db push
npx prisma generate

# Test Redis
node -e "const r=require('@upstash/redis');new r.Redis({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN}).ping().then(console.log);"

# Test Stripe webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Next Steps After Setup

1. **Week 1:** Test all features thoroughly
2. **Week 2:** Connect real Google APIs
3. **Week 3:** Beta launch with 5-10 dealers
4. **Month 2:** Public launch and marketing

---

**Status**: 🎯 Ready for Phase 1 (Clerk Setup)  
**Time**: 45 minutes total for complete setup  
**Next**: Start with Phase 1 above

