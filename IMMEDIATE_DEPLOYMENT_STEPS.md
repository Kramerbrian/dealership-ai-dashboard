# IMMEDIATE DEPLOYMENT STEPS - ACP PLG Integration

**Execute these steps NOW for production deployment**

---

## ⚡ STEP 1: Create Pull Request (2 minutes)

### Option A: GitHub CLI (if authenticated)
```bash
gh pr create \
  --base main \
  --head feature/orchestrator-diagnostics-ai-scores-clean \
  --title "feat: ACP-enabled PLG integration with Supabase" \
  --fill
```

### Option B: GitHub Web UI (RECOMMENDED)
1. **Go to**: https://github.com/Kramerbrian/dealership-ai-dashboard/compare/main...feature/orchestrator-diagnostics-ai-scores-clean
2. **Click**: "Create pull request"
3. **Title**: `feat: ACP-enabled PLG integration with Supabase`
4. **Description**: Copy from [PR_TEMPLATE.md](#pr-template) below
5. **Click**: "Create pull request"

---

## ⚡ STEP 2: Apply Supabase Migration (3 minutes)

### CRITICAL: This must be done BEFORE deploying code

```bash
# Get your Supabase database URL
# Dashboard → Settings → Database → Connection string (use "Connection pooling")

# Apply migration
psql "postgresql://postgres.[project-ref]:5432/postgres?sslmode=require" \
  -f supabase/migrations/20251101000000_acp_plg_integration.sql
```

### Alternative: Supabase SQL Editor
1. **Open**: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new
2. **Copy** entire contents of: `supabase/migrations/20251101000000_acp_plg_integration.sql`
3. **Paste** into editor
4. **Click**: "Run"
5. **Verify**: Check for success message (no errors)

### Verification
```sql
-- Check tables exist (should return 6 rows)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tenants', 'orders', 'events', 'pulse_events', 'plg_metrics', 'kpi_daily')
ORDER BY table_name;

-- Check functions exist (should return 4 rows)
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('sync_account_status', 'track_plg_event', 'calculate_activation_rate', 'calculate_mrr')
ORDER BY routine_name;
```

**STATUS**: ⏳ PENDING - Apply migration now!

---

## ⚡ STEP 3: Configure Webhooks (5 minutes)

### A. Stripe Webhook
1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://dealershipai.com/api/stripe/webhook`
4. **Events to listen to**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. **Click**: "Add endpoint"
6. **Copy**: Signing secret (starts with `whsec_`)
7. **Save for Step 4**: `STRIPE_WEBHOOK_SECRET=whsec_...`

### B. ACP Webhook (OpenAI)
1. **Go to**: https://platform.openai.com/settings/agentic-commerce
2. **Register Merchant**:
   - Merchant ID: `dealershipai`
   - Business Name: `DealershipAI`
3. **Webhook URL**: `https://dealershipai.com/api/webhooks/acp`
4. **Events**:
   - ✅ `agentic.order.created`
   - ✅ `agentic.order.completed`
   - ✅ `agentic.order.canceled`
   - ✅ `agentic.order.refunded`
5. **Copy**: Webhook secret
6. **Save for Step 4**: `ACP_WEBHOOK_SECRET=...`

### C. Clerk Webhook
1. **Go to**: https://dashboard.clerk.com/
2. **Select**: Your application
3. **Navigate**: Webhooks → Add Endpoint
4. **Endpoint URL**: `https://dealershipai.com/api/clerk/webhook`
5. **Events**:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
6. **Click**: "Create"
7. **Copy**: Signing secret (starts with `whsec_`)
8. **Save for Step 4**: `CLERK_WEBHOOK_SECRET=whsec_...`

**STATUS**: ⏳ PENDING - Configure all 3 webhooks!

---

## ⚡ STEP 4: Add Environment Variables to Vercel (3 minutes)

### Required Variables
```bash
# Webhook Secrets (from Step 3)
STRIPE_WEBHOOK_SECRET=whsec_...
ACP_WEBHOOK_SECRET=...
CLERK_WEBHOOK_SECRET=whsec_...

# ACP Configuration
ACP_MERCHANT_ID=dealershipai

# Verify these exist (should already be set)
NEXT_PUBLIC_URL=https://dealershipai.com
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID_PRO=price_...
NEXT_PUBLIC_SUPABASE_URL=https://gzlgfghpkbqlhgfozjkb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Add to Vercel (choose one method)

#### Method A: Vercel CLI
```bash
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste value when prompted

vercel env add ACP_WEBHOOK_SECRET production
# Paste value when prompted

vercel env add ACP_MERCHANT_ID production
# Enter: dealershipai

vercel env add CLERK_WEBHOOK_SECRET production
# Paste value when prompted
```

#### Method B: Vercel Dashboard
1. **Go to**: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. **For each variable**:
   - Click "Add New"
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...`
   - Environment: Production
   - Click "Save"
3. **Repeat** for all 4 variables above

**STATUS**: ⏳ PENDING - Add webhook secrets!

---

## ⚡ STEP 5: Merge PR & Deploy (2 minutes)

### A. Merge Pull Request
1. **Review PR**: Ensure all checks pass
2. **Approve**: (if required by team policy)
3. **Merge**: Click "Squash and merge"
4. **Confirm merge**

### B. Verify Deployment
```bash
# Watch deployment
vercel --prod

# Or monitor in dashboard
# https://vercel.com/brian-kramers-projects/dealership-ai-dashboard
```

### C. Wait for Deployment
- ⏳ Vercel will automatically deploy on merge to main
- ⏱️ Typical deployment time: 2-5 minutes
- 📊 Monitor: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard

**STATUS**: ⏳ PENDING - Merge and deploy!

---

## ⚡ STEP 6: Verification Testing (5 minutes)

### A. Run Automated Tests
```bash
# Set your test user token
export CLERK_TOKEN="your_clerk_token_here"

# Run test suite
./scripts/test-acp-plg-integration.sh production

# Expected output:
# ✓ API is healthy
# ✓ Checkout session created
# ✓ PLG metrics retrieved
# ✓ PLG events retrieved
# ✓ Custom event tracked
```

### B. Manual Verification

#### Test 1: Check API Health
```bash
curl https://dealershipai.com/api/health
# Should return: {"status":"ok"}
```

#### Test 2: Check Database Tables
```sql
-- Connect to Supabase
psql "$SUPABASE_DB_URL"

-- Verify tables
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM pulse_events;
SELECT COUNT(*) FROM plg_metrics;
SELECT COUNT(*) FROM kpi_daily;
```

#### Test 3: Test Checkout Flow
1. **Go to**: https://dealershipai.com/pricing
2. **Click**: "Upgrade to Pro"
3. **Use test card**: `4242 4242 4242 4242`
4. **Complete checkout**
5. **Verify**:
   - Redirect to onboarding
   - Email received
   - Database updated (check tenants table)

#### Test 4: Check Webhook Logs
```bash
# Stripe webhook logs
# https://dashboard.stripe.com/webhooks → Select endpoint → View logs

# Clerk webhook logs
# https://dashboard.clerk.com/apps/[your-app]/webhooks → Select endpoint → View logs

# ACP webhook logs
# https://platform.openai.com/settings/agentic-commerce → View logs
```

**STATUS**: ⏳ PENDING - Run tests after deployment!

---

## 📊 MONITORING (First 24 Hours)

### Critical Metrics to Watch

```bash
# 1. Webhook Success Rate (target: >99%)
# Check webhook dashboards hourly

# 2. API Error Rate (target: <1%)
# Vercel Dashboard → Logs

# 3. Database Performance
SELECT
  'tenants' AS table,
  COUNT(*) AS count,
  pg_size_pretty(pg_total_relation_size('tenants')) AS size
FROM tenants
UNION ALL
SELECT 'orders', COUNT(*), pg_size_pretty(pg_total_relation_size('orders'))
FROM orders;

# 4. PLG Metrics
curl https://dealershipai.com/api/plg/metrics \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

### Alert Conditions
- ❌ Webhook failure rate >1%
- ❌ API errors >10 in 1 hour
- ❌ Database CPU >80%
- ❌ Response time >2s

---

## 🔥 ROLLBACK PROCEDURE (If Needed)

### Emergency Rollback
```bash
# 1. Disable webhooks immediately
# - Stripe Dashboard → Webhooks → Disable endpoint
# - ACP Dashboard → Disable webhook
# - Clerk Dashboard → Webhooks → Disable endpoint

# 2. Revert deployment
vercel rollback [previous-deployment-url]

# 3. Notify team
# Post in Slack: "⚠️ ACP PLG rolled back - investigating"
```

### Database Rollback (ONLY IF NECESSARY)
```sql
-- WARNING: This will delete all ACP PLG data
DROP TABLE IF EXISTS kpi_daily CASCADE;
DROP TABLE IF EXISTS plg_metrics CASCADE;
DROP TABLE IF EXISTS pulse_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
```

---

## ✅ SUCCESS CHECKLIST

- [ ] **Step 1**: Pull request created
- [ ] **Step 2**: Supabase migration applied successfully
- [ ] **Step 3**: All 3 webhooks configured (Stripe, ACP, Clerk)
- [ ] **Step 4**: Environment variables added to Vercel
- [ ] **Step 5**: PR merged and deployed to production
- [ ] **Step 6**: Verification tests passing
- [ ] **Monitoring**: Dashboards showing healthy metrics

---

## 📞 SUPPORT

### If You Get Stuck

1. **Database Issues**: Check Supabase logs and RLS policies
2. **Webhook Failures**: Verify signatures and secrets
3. **Deployment Issues**: Check Vercel logs and environment variables
4. **API Errors**: Review error logs in Vercel dashboard

### Documentation
- [Integration Guide](./docs/ACP_PLG_INTEGRATION.md) - Complete technical documentation
- [Implementation Summary](./ACP_PLG_IMPLEMENTATION_SUMMARY.md) - Overview
- [Deployment Checklist](./ACP_PLG_DEPLOYMENT_CHECKLIST.md) - Full checklist

---

## 🎯 EXPECTED TIMELINE

| Step | Duration | Total |
|------|----------|-------|
| 1. Create PR | 2 min | 2 min |
| 2. Apply migration | 3 min | 5 min |
| 3. Configure webhooks | 5 min | 10 min |
| 4. Add env vars | 3 min | 13 min |
| 5. Merge & deploy | 2 min | 15 min |
| 6. Verification | 5 min | 20 min |

**Total Time to Production: ~20 minutes**

---

## PR Template {#pr-template}

```markdown
# feat: ACP-enabled PLG integration with Supabase

Complete Product-Led Growth funnel with Agentic Commerce Protocol support.

## Summary
Implements full 4-phase PLG funnel: Discover → Try → Buy → Retain

### Core Implementation
- ✅ Supabase schema (6 tables, 4 functions, RLS policies)
- ✅ ACP webhook handler for agentic orders
- ✅ Enhanced Stripe webhook with Supabase sync
- ✅ Enhanced Clerk webhook with tenant provisioning
- ✅ PLG metrics and events API endpoints
- ✅ Comprehensive documentation (400+ lines)
- ✅ Automated test script

### Files Changed
- 11 files changed (+3,145 lines)
- 8 new files created
- 3 existing files enhanced

## Key Features
- ACP delegate payment tokens for agentic commerce
- Multi-tenant RLS policies for data isolation
- Real-time event tracking and aggregation
- Automated KPI rollups (daily)
- Webhook signature verification (Stripe, ACP, Clerk)
- Type-safe APIs with comprehensive error handling

## Database Migration
**CRITICAL**: Apply before deploying:
```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251101000000_acp_plg_integration.sql
```

## Environment Variables Required
- `STRIPE_WEBHOOK_SECRET`
- `ACP_WEBHOOK_SECRET`
- `ACP_MERCHANT_ID`
- `CLERK_WEBHOOK_SECRET`

See: [ACP_PLG_DEPLOYMENT_CHECKLIST.md](./ACP_PLG_DEPLOYMENT_CHECKLIST.md)

## Testing
```bash
./scripts/test-acp-plg-integration.sh production
```

## Metrics to Monitor
- Activation Rate (target: >15%)
- Trial-to-Paid Rate (target: >25%)
- Agentic Conversion Rate (target: >8%)
- Webhook Success Rate (target: >99%)

## Documentation
- [Integration Guide](./docs/ACP_PLG_INTEGRATION.md)
- [Implementation Summary](./ACP_PLG_IMPLEMENTATION_SUMMARY.md)
- [Deployment Checklist](./ACP_PLG_DEPLOYMENT_CHECKLIST.md)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

**Last Updated**: 2025-11-01
**Status**: READY TO EXECUTE
**Estimated Time**: 20 minutes

🚀 BEGIN DEPLOYMENT NOW!
