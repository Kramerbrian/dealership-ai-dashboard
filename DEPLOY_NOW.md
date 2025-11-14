# 🚀 Deploy Now - Complete Action Plan

## ✅ Pre-Deployment Checklist

All code is ready:
- ✅ Orchestrator system implemented
- ✅ Supabase schema created
- ✅ Test scripts ready
- ✅ Documentation complete
- ✅ All changes committed

---

## Step 1: Deploy Supabase Schema (2 minutes)

### Quick Copy-Paste Method:

1. **Open Supabase SQL Editor:**
   https://app.supabase.com/project/gzlgfghpkbqlhgfozjkb/sql

2. **Copy this entire file:**
   ```bash
   cat supabase/schema.sql
   ```

3. **Paste into SQL editor and click "Run"**

4. **Verify tables created:**
   - Go to: Table Editor
   - Should see 7 tables:
     - `dealer_master`
     - `dealer_metrics_daily`
     - `aggregate_metrics_daily`
     - `copilot_events`
     - `correlation_results`
     - `mood_report`
     - `orchestrator_log`

---

## Step 2: Set Environment Variables (5 minutes)

### Local (.env.local):

Run interactive setup:
```bash
./scripts/setup-env-orchestrator.sh
```

Or manually add to `.env.local`:
```bash
OPENAI_API_KEY=sk-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
VERCEL_TOKEN=vercel_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Production (Vercel):

1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

2. Add these variables (click "Add New"):
   - `OPENAI_API_KEY` → Value from OpenAI dashboard
   - `SLACK_WEBHOOK_URL` → Value from Slack app
   - `VERCEL_TOKEN` → Value from Vercel account tokens
   - `SUPABASE_SERVICE_ROLE_KEY` → Value from Supabase dashboard

3. Select environments: **Production, Preview, Development**

4. Click "Save"

**Where to get keys:**
- OpenAI: https://platform.openai.com/api-keys
- Slack: https://api.slack.com/apps → Incoming Webhooks → #deployments
- Vercel: https://vercel.com/account/tokens
- Supabase: Dashboard → Settings → API → Service Role Key

---

## Step 3: Test Locally (Optional but Recommended)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
./scripts/test-orchestrator.sh
```

**Expected:**
- ✅ Status endpoint works
- ✅ Orchestrator runs successfully
- ✅ No errors in console

---

## Step 4: Deploy to Production

```bash
# Push to GitHub (triggers Vercel deployment)
git push origin main
```

**After push:**
1. Watch Vercel dashboard for deployment
2. Wait for build to complete (2-3 minutes)
3. Verify deployment succeeded

---

## Step 5: Post-Deployment Verification

### 5.1 Verify Cron Job

1. Go to: Vercel Dashboard → Project → Settings → Cron Jobs
2. Should see: `/api/orchestrator-background`
3. Schedule: `0 1 * * *` (01:00 UTC daily)

### 5.2 Test Orchestrator Console

1. Visit: `https://your-domain.vercel.app/pulse/meta/orchestrator-console`
2. Must be logged in as **admin** (Clerk role)
3. Verify:
   - Page loads without errors
   - Job status cards display
   - "Run Now" button visible

### 5.3 Monitor First Run

**Option A: Wait for scheduled run**
- First run: Next 01:00 UTC
- Check Vercel logs: Project → Deployments → Functions
- Look for `/api/orchestrator-background` execution

**Option B: Trigger manually**
```bash
curl -X POST https://your-domain.vercel.app/api/orchestrator-background
```

**Check Slack:**
- Should receive notification in `#deployments` channel
- Message: "✅ DealershipAI Nightly Orchestration Complete"

---

## 🎯 Success Indicators

You'll know everything works when:

- ✅ Supabase tables exist and are queryable
- ✅ Orchestrator status endpoint returns data
- ✅ Orchestrator console displays (admin only)
- ✅ Manual trigger completes successfully
- ✅ Cron job appears in Vercel dashboard
- ✅ Slack notifications work
- ✅ `public/system-state.json` updates after runs

---

## 🐛 Quick Troubleshooting

**"Tables already exist"**
- ✅ Normal - schema uses `CREATE TABLE IF NOT EXISTS`
- Safe to re-run

**"Unauthorized" error**
- Normal for cron endpoints in production
- Use manual trigger for testing

**"Environment variable not found"**
- Verify variable name matches exactly
- Restart dev server after adding to `.env.local`
- Check Vercel dashboard for production vars

**"Cron job not showing"**
- Verify `vercel.json` has cron entry
- Check deployment succeeded
- May take a few minutes to appear

---

## 📞 Need Help?

- **Full Guide**: `docs/NEXT_STEPS.md`
- **Testing**: `docs/TESTING_ORCHESTRATOR.md`
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **Internal Ops**: `README_INTERNAL.md`

---

**Ready to deploy!** Start with Step 1 (Supabase schema) and work through each step.
