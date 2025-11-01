# ACP PLG Integration - Deployment Checklist

**Branch**: `feature/orchestrator-diagnostics-ai-scores-clean`
**Status**: Ready for deployment
**Date**: 2025-11-01

---

## Pre-Deployment Checklist

### 1. Code Review ✓
- [x] All code committed and pushed
- [x] Documentation complete ([docs/ACP_PLG_INTEGRATION.md](./docs/ACP_PLG_INTEGRATION.md))
- [x] Implementation summary created ([ACP_PLG_IMPLEMENTATION_SUMMARY.md](./ACP_PLG_IMPLEMENTATION_SUMMARY.md))
- [x] Test script created ([scripts/test-acp-plg-integration.sh](./scripts/test-acp-plg-integration.sh))
- [ ] Pull request created and reviewed
- [ ] All tests passing

### 2. Environment Variables
Add the following to Vercel (or your deployment platform):

#### Required Variables
```bash
# App URLs
NEXT_PUBLIC_URL=https://dealershipai.com
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...  # Optional

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# ACP (Agentic Commerce Protocol)
ACP_MERCHANT_ID=dealershipai
ACP_WEBHOOK_SECRET=...  # From OpenAI ACP dashboard
```

#### Verification Commands
```bash
# Verify all required env vars are set in Vercel
vercel env ls

# Add missing variables
vercel env add STRIPE_SECRET_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... etc
```

---

## Deployment Steps

### Step 1: Apply Database Migration ⏳

#### Option A: Using psql (Recommended)
```bash
# 1. Get your Supabase database URL from dashboard
# Settings → Database → Connection string (use "Connection pooling")

# 2. Apply migration
psql "postgresql://postgres.[project-ref]:5432/postgres?sslmode=require" \
  -f supabase/migrations/20251101000000_acp_plg_integration.sql

# 3. Verify tables were created
psql "postgresql://postgres.[project-ref]:5432/postgres?sslmode=require" \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tenants', 'orders', 'events', 'pulse_events', 'plg_metrics', 'kpi_daily');"
```

#### Option B: Using Supabase SQL Editor
```bash
1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of: supabase/migrations/20251101000000_acp_plg_integration.sql
4. Paste and click "Run"
5. Verify success message in console
```

#### Verification Queries
```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tenants', 'orders', 'events', 'pulse_events', 'plg_metrics', 'kpi_daily')
ORDER BY table_name;

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('sync_account_status', 'track_plg_event', 'calculate_activation_rate', 'calculate_mrr')
ORDER BY routine_name;

-- Check RLS policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'orders', 'events', 'pulse_events')
ORDER BY tablename, policyname;

-- Insert test data
INSERT INTO kpi_daily (day) VALUES (CURRENT_DATE) ON CONFLICT (day) DO NOTHING;
SELECT * FROM kpi_daily ORDER BY day DESC LIMIT 1;
```

**Status**: ⏳ Pending
- [ ] Migration applied successfully
- [ ] Tables verified
- [ ] Functions verified
- [ ] RLS policies verified

---

### Step 2: Configure Webhooks ⏳

#### Stripe Webhook
```bash
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: https://dealershipai.com/api/stripe/webhook
4. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
5. Copy webhook signing secret
6. Add to Vercel: STRIPE_WEBHOOK_SECRET=whsec_...
```

**Events to Monitor**:
- ✅ `checkout.session.completed` - Activates Pro tier, creates order
- ✅ `customer.subscription.created` - Tracks trial start
- ✅ `customer.subscription.updated` - Updates subscription status
- ✅ `customer.subscription.deleted` - Tracks churn

**Status**: ⏳ Pending
- [ ] Webhook endpoint added
- [ ] Events selected
- [ ] Secret added to Vercel
- [ ] Test webhook sent successfully

---

#### ACP Webhook
```bash
1. Go to: https://platform.openai.com/settings/agentic-commerce
2. Register merchant:
   - Merchant ID: dealershipai
   - Business Name: DealershipAI
   - Webhook URL: https://dealershipai.com/api/webhooks/acp
3. Configure webhook events:
   - agentic.order.created
   - agentic.order.completed
   - agentic.order.canceled
   - agentic.order.refunded
4. Copy webhook secret
5. Add to Vercel: ACP_WEBHOOK_SECRET=...
```

**Events to Monitor**:
- ✅ `agentic.order.created` - Order initiated by AI agent
- ✅ `agentic.order.completed` - Order completed, activate subscription
- ✅ `agentic.order.canceled` - Order canceled
- ✅ `agentic.order.refunded` - Order refunded

**Status**: ⏳ Pending
- [ ] Merchant registered
- [ ] Webhook configured
- [ ] Secret added to Vercel
- [ ] Test webhook sent successfully

---

#### Clerk Webhook
```bash
1. Go to: https://dashboard.clerk.com/
2. Select your application
3. Go to: Webhooks → Add Endpoint
4. Endpoint URL: https://dealershipai.com/api/clerk/webhook
5. Select events:
   - user.created
   - user.updated
   - user.deleted
6. Copy webhook signing secret
7. Add to Vercel: CLERK_WEBHOOK_SECRET=whsec_...
```

**Events to Monitor**:
- ✅ `user.created` - Auto-provision tenant, track signup
- ✅ `user.updated` - Update user profile
- ✅ `user.deleted` - Soft delete, cancel subscriptions

**Status**: ⏳ Pending
- [ ] Webhook endpoint added
- [ ] Events selected
- [ ] Secret added to Vercel
- [ ] Test webhook sent successfully

---

### Step 3: Deploy Application ⏳

```bash
# 1. Merge to main branch
git checkout main
git pull origin main
git merge feature/orchestrator-diagnostics-ai-scores-clean

# 2. Push to trigger deployment
git push origin main

# 3. Monitor deployment
vercel --prod

# 4. Check deployment logs
vercel logs --prod
```

**Status**: ⏳ Pending
- [ ] Branch merged to main
- [ ] Deployment triggered
- [ ] Deployment successful
- [ ] No errors in logs

---

### Step 4: Verification Testing ⏳

#### Run Automated Tests
```bash
# Set environment variables
export CLERK_TOKEN="your_test_user_token"
export ACP_WEBHOOK_SECRET="your_acp_webhook_secret"
export SUPABASE_DB_URL="postgresql://..."

# Run test script
./scripts/test-acp-plg-integration.sh production

# Expected output:
# ✓ API is healthy
# ✓ Checkout session created
# ✓ PLG metrics retrieved
# ✓ PLG events retrieved
# ✓ Custom event tracked
# ✓ Tables verified
```

#### Manual Testing Checklist

##### 1. User Signup Flow
```bash
1. Open: https://dealershipai.com
2. Click "Sign Up"
3. Complete registration form
4. Verify:
   - User created in Clerk
   - Tenant created in Supabase (check tenants table)
   - Event logged in events table
   - PLG event in pulse_events table
```

##### 2. Checkout Flow
```bash
1. Log in as test user
2. Navigate to /pricing
3. Click "Upgrade to Pro"
4. Complete checkout (use Stripe test card: 4242 4242 4242 4242)
5. Verify:
   - Stripe subscription created
   - Tenant upgraded to PRO in Supabase
   - Order record created in orders table
   - Conversion event in events table
   - PLG metrics updated in kpi_daily
```

##### 3. ACP Flow (Agent Purchase)
```bash
1. Simulate agent purchase via ACP webhook:
   curl -X POST https://dealershipai.com/api/webhooks/acp \
     -H "Content-Type: application/json" \
     -H "x-acp-signature: [signature]" \
     -H "x-acp-timestamp: $(date +%s)" \
     -d '{
       "event": "agentic.order.completed",
       "data": {
         "orderId": "acp_test_123",
         "amount": 49900,
         "metadata": {"userId": "user_test", "plan": "pro"}
       }
     }'

2. Verify:
   - Order created with source='agentic'
   - Tenant upgraded
   - ACP order count incremented in kpi_daily
```

##### 4. PLG Metrics Dashboard
```bash
1. Open dashboard: https://dash.dealershipai.com
2. Navigate to PLG metrics section
3. Verify metrics display:
   - Signups count
   - Trials count
   - Paid conversions
   - Activation rate
   - Trial-to-paid rate
   - Agentic conversion rate
   - MRR
   - Churn rate
```

##### 5. Event Feed
```bash
1. Open dashboard event feed
2. Verify recent events display:
   - user.created
   - trial.started
   - conversion.completed
   - subscription.canceled (if any)
```

**Status**: ⏳ Pending
- [ ] Automated tests pass
- [ ] User signup flow verified
- [ ] Checkout flow verified
- [ ] ACP flow verified
- [ ] PLG metrics display correctly
- [ ] Event feed displays correctly

---

### Step 5: Monitoring Setup ⏳

#### Sentry Error Tracking
```bash
# 1. Create Sentry project (if not exists)
# 2. Add Sentry DSN to Vercel
vercel env add NEXT_PUBLIC_SENTRY_DSN production

# 3. Verify error tracking
# Trigger test error: https://dealershipai.com/api/test-error
# Check Sentry dashboard for error

# 4. Set up alerts
# Sentry → Alerts → Create Alert Rule:
#   - Error rate > 10/min
#   - Notify: Slack / Email
```

#### GA4 Event Tracking
```bash
# 1. Add GA4 measurement ID to Vercel
vercel env add NEXT_PUBLIC_GA4_ID production

# 2. Verify events in GA4:
#   - checkout_initiated
#   - checkout_completed
#   - acp_order_completed
#   - subscription_canceled

# 3. Set up custom reports in GA4
#   - PLG Funnel Report
#   - Revenue Attribution Report
#   - Agentic Commerce Report
```

#### Database Monitoring
```sql
-- Create daily KPI monitoring query
CREATE OR REPLACE VIEW plg_daily_summary AS
SELECT
  day,
  signups,
  trials,
  paid,
  acp_orders,
  ROUND(activation_rate, 2) AS activation_rate,
  ROUND(trial_to_paid_rate, 2) AS trial_to_paid_rate,
  ROUND(agentic_conversion_rate, 2) AS agentic_conversion_rate,
  mrr / 100.0 AS mrr_dollars
FROM kpi_daily
ORDER BY day DESC
LIMIT 30;

-- Check daily
SELECT * FROM plg_daily_summary;
```

**Status**: ⏳ Pending
- [ ] Sentry configured and verified
- [ ] GA4 events verified
- [ ] Database monitoring queries created
- [ ] Alerts configured

---

## Post-Deployment Checklist

### Week 1: Monitor Closely
- [ ] Check webhook logs daily (Stripe, ACP, Clerk)
- [ ] Monitor error rates in Sentry
- [ ] Verify KPI calculations are accurate
- [ ] Check for failed payments
- [ ] Monitor database performance

### Week 2: Optimize
- [ ] Review conversion rates
- [ ] Identify bottlenecks in funnel
- [ ] Optimize webhook processing if needed
- [ ] Add indexes if queries are slow
- [ ] Set up automated alerts

### Week 3: Scale
- [ ] Review infrastructure scaling needs
- [ ] Optimize database queries
- [ ] Add caching if needed
- [ ] Document learnings
- [ ] Train team on new metrics

---

## Rollback Plan

If issues arise, follow this rollback procedure:

### 1. Disable Webhooks
```bash
# Disable webhooks temporarily in:
# - Stripe Dashboard
# - ACP Dashboard
# - Clerk Dashboard
```

### 2. Revert Code
```bash
git checkout main
git revert [commit-hash]
git push origin main
```

### 3. Database Rollback (if needed)
```sql
-- Drop tables (careful!)
DROP TABLE IF EXISTS kpi_daily CASCADE;
DROP TABLE IF EXISTS plg_metrics CASCADE;
DROP TABLE IF EXISTS pulse_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS sync_account_status(JSONB);
DROP FUNCTION IF EXISTS track_plg_event(TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS calculate_activation_rate(DATE, DATE);
DROP FUNCTION IF EXISTS calculate_mrr();
```

### 4. Notify Team
```bash
# Post in Slack:
"⚠️ ACP PLG Integration rolled back due to [issue].
Investigating and will redeploy once resolved."
```

---

## Success Metrics

Track these metrics to measure deployment success:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Activation Rate | >15% | - | ⏳ |
| Trial-to-Paid | >25% | - | ⏳ |
| Agentic Conversion | >8% | - | ⏳ |
| Webhook Success Rate | >99% | - | ⏳ |
| API Error Rate | <1% | - | ⏳ |
| Average Response Time | <500ms | - | ⏳ |

---

## Documentation Links

- **[ACP PLG Integration Guide](./docs/ACP_PLG_INTEGRATION.md)** - Complete technical documentation
- **[Implementation Summary](./ACP_PLG_IMPLEMENTATION_SUMMARY.md)** - Overview of changes
- **[Test Script](./scripts/test-acp-plg-integration.sh)** - Automated testing
- **[Stripe Docs](https://stripe.com/docs/api)** - Stripe API reference
- **[ACP Docs](https://platform.openai.com/docs/agentic-commerce)** - ACP specifications
- **[Clerk Docs](https://clerk.com/docs)** - Authentication

---

## Support Contacts

- **Engineering Lead**: [Name / Slack Handle]
- **Product Manager**: [Name / Slack Handle]
- **DevOps**: [Name / Slack Handle]
- **On-Call Rotation**: [PagerDuty / Slack Channel]

---

## Sign-Off

Once all items are complete, sign off on deployment:

- [ ] **Engineer**: _________________ Date: _______
- [ ] **Tech Lead**: _________________ Date: _______
- [ ] **Product Manager**: _________________ Date: _______

---

**Last Updated**: 2025-11-01
**Version**: 1.0.0
**Status**: Ready for Deployment

🤖 Generated with [Claude Code](https://claude.com/claude-code)
