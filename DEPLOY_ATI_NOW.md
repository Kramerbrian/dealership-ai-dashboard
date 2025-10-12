# Deploy ATI - Quick Start Guide

## Two Options: Automated Script or Manual Steps

---

## Option 1: Automated Script (Recommended)

```bash
cd /Users/briankramer/dealership-ai-dashboard
./scripts/deploy-ati.sh
```

The script will guide you through:
1. ✅ Checking Supabase credentials
2. ✅ Applying database migration
3. ✅ Building the project
4. ✅ Deploying to Vercel
5. ✅ Verifying cron jobs
6. ✅ Testing endpoints

---

## Option 2: Manual Steps

### Step 1: Get Your Supabase Project ID

```bash
# Extract project ID from .env
grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'/' -f3 | cut -d'.' -f1
```

**Result**: Your project ID (e.g., `gzlgfghpkbqlhgfozjkb`)

---

### Step 2: Apply Database Migration

**Option A: SQL Editor (Easiest)**

1. Open Supabase SQL Editor:
   ```bash
   # Replace [PROJECT_ID] with your actual project ID
   open "https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new"
   ```

2. Copy contents of:
   ```
   supabase/migrations/20250115000005_ati_signals.sql
   ```

3. Paste into SQL Editor and click **Run**

4. Verify table created:
   ```bash
   open "https://supabase.com/dashboard/project/[PROJECT_ID]/editor"
   ```
   Look for `ati_signals` table in the left sidebar.

**Option B: psql (Advanced)**

```bash
# Get your database password from Supabase dashboard
# Settings > Database > Database Password

# Replace [PROJECT_ID] and [PASSWORD]
PGPASSWORD='[PASSWORD]' psql \
  "postgresql://postgres.[PROJECT_ID]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20250115000005_ati_signals.sql
```

---

### Step 3: Build the Project

```bash
cd /Users/briankramer/dealership-ai-dashboard
npm run build
```

**Expected**: ✅ Build completes successfully

---

### Step 4: Deploy to Vercel

```bash
# Login if needed
npx vercel login

# Deploy to production
vercel --prod
```

**Expected**: Deployment URL (e.g., `https://dealership-ai-dashboard.vercel.app`)

---

### Step 5: Verify Cron Jobs

```bash
vercel crons ls --prod
```

**Expected Output**:
```
✓ /api/cron/dtri-nightly (0 3 * * *)
✓ /api/cron/ncm-sync (0 2 * * 1)
✓ /api/cron/ada-training (0 4 * * 1)
✓ /api/cron/aemd-analysis (0 5 * * *)
✓ /api/cron/sentinel-monitor (0 */6 * * *)
✓ /api/cron/ati-analysis (0 6 * * 1)  ← NEW
```

---

### Step 6: Test ATI Endpoint

```bash
# Replace with your actual values
DEPLOYMENT_URL="https://yourdomain.com"
TENANT_ID="your-tenant-uuid"

# Test latest endpoint
curl "$DEPLOYMENT_URL/api/tenants/$TENANT_ID/ati/latest"
```

**Expected Response**:
```json
{
  "data": {
    "date_week": "2025-01-13",
    "precision_pct": 92.00,
    "consistency_pct": 88.00,
    "recency_pct": 75.00,
    "authenticity_pct": 85.00,
    "alignment_pct": 90.00,
    "ati_pct": 87.40
  },
  "error": null
}
```

**If no data yet**: `{"data": null, "error": null}` - This is expected before first cron run.

---

### Step 7: Trigger Manual ATI Analysis (Optional)

```bash
# Replace with your admin API key and deployment URL
ADMIN_API_KEY="your-admin-key"
DEPLOYMENT_URL="https://yourdomain.com"

curl -X POST "$DEPLOYMENT_URL/api/cron/ati-analysis" \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

**Expected Response**:
```json
{
  "message": "ATI analysis complete for 15 tenants",
  "duration_ms": 2340,
  "results": {
    "processed": 15,
    "errors": 0,
    "tenants": [
      {"tenant_id": "abc-123", "ati_pct": 87.40},
      ...
    ]
  }
}
```

---

### Step 8: Verify in Dashboard

```bash
# Open dashboard
open "$DEPLOYMENT_URL/dashboard"
```

**Expected**: Four metrics displayed:
1. **AIV** - Algorithmic Visibility Index
2. **ATI** - Algorithmic Trust Index ← NEW
3. **CRS** - Composite Reputation Score (updated with ATI)
4. **Elasticity** - Revenue per AIV point

---

## Troubleshooting

### Migration fails: "relation already exists"
The table is already created. Check if data exists:
```sql
SELECT COUNT(*) FROM ati_signals;
```

### Cron job not showing
1. Check `vercel.json` has the ATI cron entry
2. Redeploy: `vercel --prod`
3. Wait 1-2 minutes for cron to register

### Endpoint returns 500 error
1. Check Vercel logs: `vercel logs --prod`
2. Verify environment variables are set in Vercel dashboard
3. Check Supabase connection is working

### No ATI data yet
This is normal before first cron run. Options:
1. Wait until Monday 6 AM for automatic run
2. Trigger manually (Step 7 above)
3. Check if tenants exist: `SELECT * FROM tenants WHERE status='active'`

---

## Post-Deployment Checklist

- [ ] ati_signals table exists in Supabase
- [ ] RLS policies active (check Supabase Authentication > Policies)
- [ ] Cron job scheduled (vercel crons ls --prod)
- [ ] Endpoint responds (even if no data yet)
- [ ] Dashboard displays ATI tile (may show "—" until first run)
- [ ] Build has no errors

---

## Next Steps

### Immediate (Today)
1. Monitor first automatic run (next Monday 6 AM)
2. Verify ATI appears in dashboard
3. Check calculation accuracy

### This Week
1. Implement ATI trend chart visualization
2. Add five-pillar breakdown component
3. Test with real tenant data

### This Month
1. Add Sentinel trigger for ATI <60
2. Build competitor ATI tracking
3. Implement automated recommendations

---

## Quick Commands Reference

```bash
# Apply migration
open "https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new"

# Build
npm run build

# Deploy
vercel --prod

# Check crons
vercel crons ls --prod

# Test endpoint
curl "https://yourdomain.com/api/tenants/[TENANT_ID]/ati/latest"

# Trigger manually
curl -X POST "https://yourdomain.com/api/cron/ati-analysis" \
  -H "Authorization: Bearer $ADMIN_API_KEY"

# Check logs
vercel logs --prod --follow

# View table
open "https://supabase.com/dashboard/project/[PROJECT_ID]/editor"
```

---

## Support

**Documentation**:
- [ATI_IMPLEMENTATION_GUIDE.md](ATI_IMPLEMENTATION_GUIDE.md) - Complete guide
- [ATI_QUICK_REFERENCE.md](ATI_QUICK_REFERENCE.md) - One-page summary
- [ATI_IMPLEMENTATION_COMPLETE.md](ATI_IMPLEMENTATION_COMPLETE.md) - Implementation status

**Automated Script**:
```bash
./scripts/deploy-ati.sh
```

---

**Your Algorithmic Trust Index is ready to deploy!** 🚀

*All systems operational. All pillars measured. All trust signals monitored.*

---

*DealershipAI v5.0 - Command Center*
*ATI Deployment Guide*
*January 2025*
