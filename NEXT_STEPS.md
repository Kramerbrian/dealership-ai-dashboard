# 🚀 Next Steps - Quick Start Guide

## Status: Ready for Configuration ✅

All code is complete. You just need to configure Supabase and test.

---

## Step 1: Apply Database Migrations (5 minutes)

### Migration 1: AEMD & Accuracy Monitoring

1. Open [Supabase SQL Editor](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of: `supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql`
6. Paste into SQL Editor
7. Click **Run** (or press Cmd+Enter)
8. ✅ Should see: "Success. No rows returned"

### Migration 2: API Monetization (Optional - only if you want monetization)

1. In same SQL Editor
2. Click **New Query**
3. Copy the contents of: `supabase/migrations/20250111000002_add_api_keys_and_usage.sql`
4. Paste into SQL Editor
5. Click **Run**
6. ✅ Should see: "Success. No rows returned"

---

## Step 2: Add Environment Variables (2 minutes)

### Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (left sidebar)
4. Click **API**
5. Copy these two values:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **Service Role Key** (long string starting with `eyJ...`)

### Add to `.env.local`

```bash
# Open .env.local in your editor
nano .env.local

# Add these lines (replace with your actual values):
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Save and close (Ctrl+X, then Y, then Enter if using nano)

---

## Step 3: Restart Development Server (1 minute)

```bash
# Kill any existing Next.js processes
pkill -f "next dev"

# Start fresh dev server
npm run dev
```

---

## Step 4: Test the System (3 minutes)

### Test Internal APIs (No auth required)

```bash
# Test AEMD metrics POST
curl -X POST http://localhost:3000/api/aemd-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "report_date": "2025-01-11",
    "ctr_p3": 4.5,
    "ctr_fs": 3.2,
    "total_vdp_views": 1200,
    "vdp_views_ai": 450,
    "total_assisted_conversions": 85,
    "assisted_conversions_paa": 25,
    "omega_def": 1.0
  }'

# Test AEMD metrics GET
curl http://localhost:3000/api/aemd-metrics?tenant_id=test-tenant

# Test Accuracy monitoring POST
curl -X POST http://localhost:3000/api/accuracy-monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "issue_detection_accuracy": 0.88,
    "ranking_correlation": 0.72,
    "consensus_reliability": 0.92,
    "variance": 3.5
  }'

# Test Accuracy monitoring GET
curl http://localhost:3000/api/accuracy-monitoring?tenant_id=test-tenant
```

### View Dashboard

Open browser: http://localhost:3000/monitoring?tenant=test-tenant

---

## Step 5: Test API Monetization (Optional)

Only if you applied migration #2:

### Generate Your First API Key

Create file: `scripts/generate-test-api-key.ts`

```typescript
import { generateApiKey } from '@/lib/api-auth';

async function main() {
  const result = await generateApiKey(
    'test-tenant',
    'Test API Key',
    'free',
    {
      description: 'Testing API access',
      expiresInDays: 365,
      scopes: ['read']
    }
  );

  if (result) {
    console.log('✅ API Key Generated!');
    console.log('Full Key:', result.apiKey);
    console.log('Prefix:', result.keyPrefix);
    console.log('\n⚠️  SAVE THIS KEY - It won\'t be shown again!\n');
  } else {
    console.error('❌ Failed to generate API key');
  }
}

main();
```

Run it:
```bash
npx ts-node scripts/generate-test-api-key.ts
```

### Test Authenticated Endpoint

```bash
# Replace YOUR_API_KEY with the key from previous step
curl -X GET "http://localhost:3000/api/v1/aemd-metrics?limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Expected response:
```json
{
  "success": true,
  "version": "v1",
  "data": [...],
  "stats": {...},
  "pagination": {...}
}
```

Check rate limit headers:
```bash
# Should see headers like:
# X-RateLimit-Remaining: 999
# X-RateLimit-Tier: free
```

---

## Troubleshooting

### Error: "fetch failed" or connection errors
- Check that `.env.local` has correct Supabase URL and key
- Restart dev server after adding env vars
- Verify Supabase project is running (check dashboard)

### Error: "relation does not exist"
- Migrations not applied yet
- Run SQL migrations in Supabase SQL Editor

### Error: "API key not found"
- Generate an API key first using the script above
- Make sure you're using the full key (starts with `sk_live_`)

### Port conflicts
- If dev server won't start: `pkill -f "next dev"`
- Check what's using port 3000: `lsof -i :3000`

---

## What You Have Now

✅ **AEMD Metrics System**
- Calculate AI Economic Metric Dashboard scores
- Track FS, AIO, PAA components
- Store historical data

✅ **Accuracy Monitoring System**
- Track issue detection accuracy (88%)
- Monitor ranking correlation (72%)
- Check consensus reliability (92%)
- Auto-generate alerts when below thresholds

✅ **Complete Dashboard**
- AEMD score tile with breakdown
- Heatmap for segments
- FastSearch clarity gauges
- Trust & accuracy monitoring
- Active alerts banner

✅ **API Monetization Foundation** (Optional)
- API key authentication
- Rate limiting by tier (free/pro/enterprise)
- Usage tracking for billing
- Versioned endpoints (`/api/v1/`)

✅ **Multi-Channel Alerting**
- Email (Resend)
- Slack webhooks
- Custom webhooks
- Console logging

---

## Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `app/api/aemd-metrics/route.ts` | Internal AEMD API |
| `app/api/accuracy-monitoring/route.ts` | Internal accuracy API |
| `app/api/v1/aemd-metrics/route.ts` | Authenticated AEMD API |
| `src/components/dashboard/AEMDMonitoringDashboard.tsx` | Dashboard component |
| `src/lib/api-auth.ts` | Authentication library |
| `src/lib/governance.ts` | Governance framework |
| `src/lib/alerting/accuracy-alerts.ts` | Alert system |

### Documentation

| File | Description |
|------|-------------|
| `AEMD_ACCURACY_MONITORING_GUIDE.md` | Complete implementation guide |
| `AEMD_QUICK_REFERENCE.md` | Developer quick reference |
| `API_MONETIZATION_READY.md` | Monetization setup guide |
| `DEPLOY_AEMD.md` | Deployment instructions |

---

## When Ready to Launch

1. ✅ Test all endpoints thoroughly
2. ✅ Verify dashboard loads and displays data
3. ✅ Test alert system with below-threshold values
4. ✅ Review governance metrics
5. ✅ (Optional) Set up Stripe for billing
6. ✅ (Optional) Create customer-facing API key UI
7. ✅ Deploy to Vercel/production

---

## Need Help?

Check the comprehensive documentation files created:
- `AEMD_ACCURACY_MONITORING_GUIDE.md` - Full system guide
- `API_MONETIZATION_READY.md` - Monetization setup
- `AEMD_SYSTEM_FLOW.md` - Architecture diagrams

All systems are ready. Just configure Supabase credentials and test! 🚀
