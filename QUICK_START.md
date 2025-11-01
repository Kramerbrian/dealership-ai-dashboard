# 🚀 Quick Start - PLG Flow + Turnkey Components

## ✅ What's Been Added

### Core PLG Flow
- ✅ Phase 1: Clerk webhook auto-provisioning
- ✅ Phase 2: ACP checkout session with delegate token
- ✅ Phase 3: Stripe + ACP order sync
- ✅ Phase 4: Pulse feed retention tracking

### Turnkey Components
- ✅ Price/PriceChange models for MSRP tracking
- ✅ MSRP sync job route (`/api/jobs/msrp-sync`)
- ✅ Price changes diff API (`/api/price-changes`)
- ✅ Node scheduler (`scripts/scheduler.ts`)
- ✅ Supabase pg_cron SQL migration
- ✅ Test suite (`scripts/test-plg-flow.ts`)

## 🏃 Quick Start (3 Steps)

### 1. Install Dependencies & Migrate

```bash
npm install
npx prisma migrate dev --name add_price_tracking
```

### 2. Configure Cron (Choose One)

**Option A: Supabase pg_cron** (Recommended)
```sql
-- Run in Supabase SQL Editor
-- Edit: supabase/migrations/20251101_pg_cron_msrp_sync.sql
-- Replace YOUR_DASH_DOMAIN with your URL
-- Then execute the SQL
```

**Option B: Node Scheduler** (Fallback)
```bash
npm run start:scheduler
# Or with PM2: pm2 start npm --name "msrp-scheduler" -- run start:scheduler
```

### 3. Verify

```bash
# Test cron endpoint
curl http://localhost:3000/api/jobs/msrp-sync

# Test price changes API
curl "http://localhost:3000/api/price-changes?since=2025-10-25T00:00:00Z"

# Run PLG test suite
npm run test:plg
```

## 📋 Environment Variables Needed

Add to `.env.local`:

```bash
# Cron
CRON_SECRET="your-secret"
JOB_URL="https://your-domain.com/api/jobs/msrp-sync"

# Stripe ACP
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# Clerk
CLERK_WEBHOOK_SECRET="whsec_..."

# Supabase (for pg_cron)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-key"
```

## 🎯 Quick Checks

```bash
# Probe cron health
curl https://your-domain.com/api/diagnostics/msrp-sync

# Weekly diff feed
curl "https://your-domain.com/api/price-changes?dealerId=...&since=2025-10-25T00:00:00Z"

# Live stream (if implemented)
curl -N "https://your-domain.com/api/ai-scores/stream?dealerId=..."
```

## 📚 Full Documentation

- **PLG Flow**: `PLG_FLOW_COMPLETE.md`
- **Turnkey Setup**: `TURNKEY_SETUP.md`
- **Cron Config**: `supabase/migrations/20251101_pg_cron_msrp_sync.sql`

---

**Status**: ✅ All components ready - Just run migrations and configure!
