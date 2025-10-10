# 🚀 Deployment Checklist - DealershipAI

## ✅ Configuration Files Created

All configuration files are now in place:

- ✅ [.env.example](.env.example) - Template for all environment variables
- ✅ [vercel.json](vercel.json) - Vercel configuration with 6 cron jobs
- ✅ [supabase/config.toml](supabase/config.toml) - Supabase local dev config
- ✅ [.github/workflows/deploy.yml](.github/workflows/deploy.yml) - CI/CD pipeline
- ✅ [next.config.js](next.config.js) - Already configured properly

**Latest Commit:** `d6bd3f1` - "feat: add deployment configuration and CI/CD pipeline"

---

## 📋 Deployment Steps

### 1. Fix Current Build Errors (Immediate)

The deployment is currently failing. Check the Vercel dashboard:

```bash
# Open Vercel dashboard to see build errors
open "https://vercel.com/brian-kramers-projects/dealership-ai-dashboard"
```

**Common issues to check:**
- TypeScript errors (currently ignoring with `ignoreBuildErrors: true`)
- Missing dependencies
- Import errors
- Environment variable issues

### 2. Apply Database Migrations

Choose one of these methods:

#### Method A: Supabase Dashboard (Easiest)

1. Open SQL Editor:
   ```bash
   open "https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"
   ```

2. Run these migrations in order:
   - [supabase/migrations/20250109_add_cron_monitoring_tables.sql](supabase/migrations/20250109_add_cron_monitoring_tables.sql)
   - [supabase/migrations/20250109_add_system_alerts_table.sql](supabase/migrations/20250109_add_system_alerts_table.sql)

#### Method B: Supabase CLI

```bash
supabase link --project-ref gzlgfghpkbqlhgfozjkb
supabase db push
```

#### Method C: psql (If you have DB password)

```bash
# Get connection string from Supabase Settings → Database
PGPASSWORD='your-password' psql 'your-connection-string' \
  -f supabase/migrations/20250109_add_cron_monitoring_tables.sql

PGPASSWORD='your-password' psql 'your-connection-string' \
  -f supabase/migrations/20250109_add_system_alerts_table.sql
```

### 3. Verify Vercel Environment Variables

All required variables should already be set. Verify:

```bash
npx vercel env ls
```

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `OPENAI_API_KEY` ✓
- `ANTHROPIC_API_KEY` ✓
- `NEXT_PUBLIC_APP_URL` ✓
- All others from `.env.example`

### 4. Set Up GitHub Actions Secrets (Optional - for CI/CD)

If you want automated deployments via GitHub Actions:

1. Go to GitHub: https://github.com/Kramerbrian/dealership-ai-dashboard/settings/secrets/actions

2. Add these secrets:
   ```
   NEXT_PUBLIC_APP_NAME
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   ANTHROPIC_API_KEY
   VERCEL_TOKEN (get from https://vercel.com/account/tokens)
   VERCEL_ORG_ID (from Vercel Settings)
   VERCEL_PROJECT_ID (from Vercel Settings)
   ```

### 5. Link GitHub to Vercel (If not already done)

1. Go to Vercel: https://vercel.com/new
2. Import from GitHub: `Kramerbrian/dealership-ai-dashboard`
3. Authorize Vercel GitHub App
4. Vercel will auto-deploy on every push to `main`

### 6. Link GitHub to Supabase (Optional)

1. Go to Supabase: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/integrations
2. Click "GitHub" integration
3. Link repository
4. Migrations in `/supabase/migrations` will be tracked

---

## 🔍 Verification Steps

After deployment succeeds:

### 1. Check Vercel Cron Jobs

```bash
open "https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/functions"
```

Verify 6 cron jobs are listed:
- ✅ `/api/train/reinforce` (daily)
- ✅ `/api/train/evaluate` (weekly)
- ✅ `/api/anomaly/reviews` (every 6 hours)
- ✅ `/api/predict/forecast` (weekly)
- ✅ `/api/reports/roi` (monthly)
- ✅ `/api/governance/check` (every 4 hours)

### 2. Test API Endpoints

```bash
BASE_URL="https://dealership-ai-dashboard-brian-kramers-projects.vercel.app"

# Executive Summary
curl "$BASE_URL/api/monitoring/system-health?query=executive-summary" | jq

# Control Rules (R² < 0.7, RMSE > 3.5)
curl "$BASE_URL/api/monitoring/system-health?query=control-rules" | jq

# Cron Health
curl "$BASE_URL/api/cron/health" | jq

# Check Alerts
curl -X POST "$BASE_URL/api/monitoring/alerts" \
  -H "Content-Type: application/json" \
  -d '{"check": "all"}' | jq
```

### 3. Verify Database Tables

Run in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'cron_job_health',
  'cron_job_executions',
  'system_alerts',
  'review_anomalies',
  'forecasts',
  'model_audit'
);

-- Should return 6 rows

-- Check cron jobs initialized
SELECT * FROM cron_job_health;

-- Should return 6 jobs (retrain-aiv, evaluate-aiv, etc.)
```

### 4. Test Monitoring Dashboard

If you've added the dashboard component to your app:

```bash
open "https://dealership-ai-dashboard-brian-kramers-projects.vercel.app/monitoring"
```

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Vercel build completes without errors
- ✅ All 6 cron jobs show "Active" status
- ✅ API endpoints return 200 OK
- ✅ Database tables exist and are populated
- ✅ Executive summary returns system status
- ✅ No critical alerts present

---

## 🐛 Troubleshooting

### Vercel Build Failing?

1. **Check build logs:**
   ```bash
   npx vercel logs
   ```

2. **Common fixes:**
   - TypeScript errors: Fix or temporarily set `ignoreBuildErrors: false` in `next.config.js`
   - Missing dependencies: Run `pnpm install` and commit `pnpm-lock.yaml`
   - Import errors: Check all imports are correct
   - Environment variables: Ensure all required vars are set in Vercel

### Cron Jobs Not Showing?

- Ensure you're on Vercel **Pro plan** (required for crons)
- Check `vercel.json` is in repository root
- Verify deployment succeeded
- Redeploy if necessary: `npx vercel --prod`

### Database Connection Errors?

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase project is not paused
- Test connection: `curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/`

### GitHub Actions Not Running?

- Check workflow file syntax: `.github/workflows/deploy.yml`
- Verify secrets are set in GitHub
- Check Actions tab: https://github.com/Kramerbrian/dealership-ai-dashboard/actions

---

## 📚 Documentation Reference

- [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) - Original deployment guide
- [VERCEL_CRON_SETUP.md](VERCEL_CRON_SETUP.md) - Cron configuration details
- [MONITORING_SYSTEM_GUIDE.md](MONITORING_SYSTEM_GUIDE.md) - Monitoring guide
- [COMPLETE_SYSTEM_SUMMARY.md](COMPLETE_SYSTEM_SUMMARY.md) - System overview

---

## 🎉 Next Steps After Successful Deployment

### Immediate
1. ✅ Verify all endpoints respond
2. ✅ Check cron jobs are active
3. ✅ Review initial metrics

### This Week
1. Add monitoring dashboard to your app
2. Set up Slack/email notifications
3. Run first evaluation manually
4. Monitor cron job executions

### This Month
1. Analyze month-over-month improvements
2. Review success criteria (≥10% accuracy, ≥15% ROI, ≥0.8 R²)
3. Optimize based on evaluation results
4. Create custom reports

---

## 🔐 Security Notes

- **Never commit `.env.local`** - Already in `.gitignore`
- **Service role key** stays server-side only
- **API keys** only in Vercel environment variables
- **GitHub Actions secrets** encrypted at rest
- **Webhook signatures** verified in API routes

---

## 📞 Need Help?

1. Check Vercel logs: `npx vercel logs`
2. Review Supabase logs in dashboard
3. Test endpoints manually with curl
4. Check GitHub Actions logs
5. Review error messages in `system_alerts` table

---

**Your autonomous AIV monitoring system is ready to deploy! 🚀**

Once the build succeeds, the system will:
- ✅ Train daily at midnight UTC
- ✅ Evaluate weekly on Sundays
- ✅ Scan for anomalies every 6 hours
- ✅ Generate forecasts weekly
- ✅ Create ROI reports monthly
- ✅ Check governance thresholds every 4 hours
- ✅ Monitor 24/7 for issues

**Set it and forget it!** 🎯
