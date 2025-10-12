# 🚀 Deploy DealershipAI - Quick Guide

## ⚡ Three-Step Deployment

### Step 1: Database Migration
```bash
# Get your Supabase project ID from .env
grep "NEXT_PUBLIC_SUPABASE_URL" .env

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql/new"

# Copy and paste the migration file:
# supabase/migrations/20250112000001_beta_calibration_and_sentinel.sql

# Click "Run" in SQL Editor
```

**What this creates:**
- 7 tables (dtri_config, dtri_calibration_log, sentinel_events, etc.)
- 4 views (sentinel_active_alerts, beta_calibration_summary, etc.)
- RLS policies for security
- Indexes for performance

---

### Step 2: Vercel Environment Variables
```bash
# Add required environment variables
vercel env add REDIS_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add BASE_URL
vercel env add ADMIN_API_KEY

# Optional but recommended
vercel env add SENTINEL_WEBHOOK_URL  # For Slack/Discord alerts
```

**Get these values from:**
- `REDIS_URL`: Upstash Redis dashboard
- `SUPABASE_*`: Supabase project settings
- `BASE_URL`: Your production domain (e.g., `https://dealershipai.com`)
- `ADMIN_API_KEY`: Generate a secure random string

---

### Step 3: Deploy
```bash
# Deploy to production
vercel --prod

# ✅ That's it! Your platform is live.
```

---

## 🧪 Test Your Deployment

```bash
# Replace YOURDOMAIN with your actual domain

# 1. Test Beta Recalibration
curl -X POST https://YOURDOMAIN/api/beta/recalibrate

# 2. Test Sentinel Monitor
curl -X POST https://YOURDOMAIN/api/cron/sentinel-monitor

# 3. Test Tier API (get a witty message!)
curl "https://YOURDOMAIN/api/tier?userId=test&plan=PRO"

# Expected response:
# {
#   "tierInfo": {
#     "wittyMessage": "PRO tier: Because 'amateur hour' is what your competitors are doing."
#   }
# }
```

---

## 📊 Verify Autonomous Systems

### Check Vercel Cron Jobs
```bash
vercel crons ls

# Should show:
# - /api/cron/dtri-nightly        (Daily 3 AM)
# - /api/cron/ncm-sync            (Monday 2 AM)
# - /api/cron/ada-training        (Monday 4 AM)
# - /api/cron/aemd-analysis       (Daily 5 AM)
# - /api/cron/sentinel-monitor    (Every 6 hours)
```

### Check Database Tables
```sql
-- Run in Supabase SQL Editor
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%dtri%' OR tablename LIKE '%sentinel%'
ORDER BY tablename;

-- Expected:
-- dtri_analysis
-- dtri_audit_log
-- dtri_calibration_log
-- dtri_config
-- sentinel_alert_history
-- sentinel_config
-- sentinel_events
```

---

## 🎯 Post-Deployment Checklist

- [ ] Database migration successful (7 tables + 4 views)
- [ ] Vercel environment variables added
- [ ] Production deployment complete
- [ ] Cron jobs scheduled and visible in Vercel
- [ ] Test endpoints return 200 status
- [ ] Witty messages appear in tier API
- [ ] Supabase tables populated

---

## 🐛 Troubleshooting

### "Migration failed"
**Solution:** Copy migration SQL manually into Supabase SQL Editor.

### "Cron jobs not running"
**Solution:** Check `vercel.json` has correct cron configuration:
```json
{
  "crons": [
    {
      "path": "/api/cron/sentinel-monitor",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### "403 Forbidden on API calls"
**Solution:** Check RLS policies in Supabase:
```sql
-- Verify service role has access
SELECT * FROM pg_policies
WHERE tablename IN ('dtri_config', 'sentinel_events');
```

### "No witty messages"
**Solution:** Make sure tier API is deployed. Test locally first:
```bash
npm run dev
curl "http://localhost:3000/api/tier?userId=test&plan=PRO"
```

---

## 📱 Monitor Your Deployment

### Vercel Dashboard
```
https://vercel.com/dashboard
```
- View deployment logs
- Check cron execution
- Monitor function usage

### Supabase Dashboard
```
https://supabase.com/dashboard/project/[PROJECT_ID]
```
- View database tables
- Check query performance
- Monitor RLS policies

### BullMQ Dashboard (if Redis configured)
```
npm run dtri:worker  # Start locally to view jobs
```

---

## 🎉 Success!

Once deployed, your autonomous systems will:

- **Beta Recalibration**: Update DTRI coefficients every Sunday at 3 AM
- **Sentinel Monitor**: Check 4 triggers every 6 hours:
  - Review response time (→ CRISIS SOW)
  - VDP PageSpeed (→ OPTIMIZATION SOW)
  - Economic TSM (→ DEFENSIVE MODE)
  - Competitive DTRI (→ ATTACK SOW)
- **DTRI Nightly**: Analyze all dealers daily at 3 AM
- **AEMD Analysis**: Calculate AI visibility daily at 5 AM

---

## 🎭 Test the Witty UX

```bash
# Get different witty messages by refreshing
for i in {1..5}; do
  echo "Message $i:"
  curl -s "https://YOURDOMAIN/api/tier?userId=test&plan=PRO" | jq '.tierInfo.wittyMessage'
  echo ""
done
```

**Example outputs:**
- "PRO tier: Because 'amateur hour' is what your competitors are doing."
- "You're in the smart tier. Not that the other tiers aren't smart. They're just... less smart."
- "Intelligence tier: It's not just a clever name. (Okay, it kind of is.)"

---

## 📖 Full Documentation

- `BUILD_SUCCESS_SUMMARY.md` - Complete deployment guide
- `BETA_CALIBRATION_SENTINEL_IMPLEMENTATION.md` - Autonomous systems
- `SESSION_TIER_WITTY_UX_SUMMARY.md` - Tier management
- `AUTONOMOUS_SYSTEMS_QUICK_REF.md` - Quick command reference

---

**Deploy Time:** ~10 minutes
**Status:** ✅ Production Ready
**Vibe:** 🎭 Ryan Reynolds Approved

Let's ship it! 🚀
