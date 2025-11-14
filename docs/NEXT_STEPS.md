# Next Steps - Orchestrator System Deployment

## ✅ Completed

- ✅ Orchestrator background function created
- ✅ Orchestrator console component created
- ✅ Supabase schema file created
- ✅ Test scripts and documentation created
- ✅ All code committed to git

---

## 🚀 Immediate Next Steps

### Step 1: Deploy Supabase Schema (Choose One Method)

**Method A: Dashboard (Recommended - Fastest)**
1. Go to: https://app.supabase.com/project/gzlgfghpkbqlhgfozjkb/sql
2. Copy entire contents of `supabase/schema.sql`
3. Paste into SQL editor
4. Click "Run"
5. ✅ Verify tables created in Table Editor

**Method B: Fix Migration History (If using CLI)**
```bash
# Pull remote migrations to sync
supabase db pull

# Then push new migration
supabase db push
```

**Verification:**
```sql
-- Run in Supabase SQL editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dealer_master', 'dealer_metrics_daily', 'copilot_events', 'orchestrator_log');
```

---

### Step 2: Set Environment Variables

**Local (.env.local):**
```bash
# Run interactive setup
./scripts/setup-env-orchestrator.sh

# Or manually add to .env.local:
OPENAI_API_KEY=sk-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
VERCEL_TOKEN=vercel_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Production (Vercel Dashboard):**
1. Go to: Vercel Dashboard → Project Settings → Environment Variables
2. Add all variables from above
3. Select: Production, Preview, Development
4. Save

**Where to get keys:**
- **OPENAI_API_KEY**: https://platform.openai.com/api-keys
- **SLACK_WEBHOOK_URL**: https://api.slack.com/apps → Incoming Webhooks → #deployments
- **VERCEL_TOKEN**: https://vercel.com/account/tokens
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → Service Role Key

---

### Step 3: Test Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run automated tests
./scripts/test-orchestrator.sh

# Or test manually:
curl http://localhost:3000/api/orchestrator/status | jq '.'
curl -X POST http://localhost:3000/api/orchestrator-background
```

**Expected Results:**
- ✅ Status endpoint returns `{"ok": true}`
- ✅ Orchestrator runs successfully
- ✅ `public/system-state.json` is created
- ✅ No errors in console

---

### Step 4: Deploy to Production

```bash
# Push to GitHub (triggers Vercel deployment)
git push origin main
```

**After deployment:**
1. Verify cron job: Vercel Dashboard → Settings → Cron Jobs
   - Should see: `/api/orchestrator-background` scheduled for `0 1 * * *`
2. Test orchestrator console: `https://your-domain.vercel.app/pulse/meta/orchestrator-console`
   - Must be logged in as admin (Clerk role: `admin`)
3. Monitor first cron run: Check Vercel logs at 01:00 UTC

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase schema deployed (7 tables created)
- [ ] Environment variables set in `.env.local` (for local testing)
- [ ] Environment variables set in Vercel (for production)
- [ ] Local tests pass (`./scripts/test-orchestrator.sh`)
- [ ] Build passes (`npm run build`)
- [ ] All changes committed to git
- [ ] Ready to push to main branch

---

## 🎯 Post-Deployment Verification

After pushing to production:

1. **Check Vercel Deployment**
   - Go to: Vercel Dashboard → Deployments
   - Verify latest deployment succeeded
   - Check build logs for errors

2. **Verify Cron Job**
   - Go to: Vercel Dashboard → Settings → Cron Jobs
   - Confirm `/api/orchestrator-background` is listed
   - Schedule: `0 1 * * *` (01:00 UTC daily)

3. **Test Orchestrator Console**
   - Visit: `https://your-domain.vercel.app/pulse/meta/orchestrator-console`
   - Must be logged in with Clerk role: `admin`
   - Verify job status cards display
   - Test "Run Now" button

4. **Monitor First Run**
   - Wait for 01:00 UTC (or trigger manually)
   - Check Vercel logs: Project → Deployments → Functions
   - Look for `/api/orchestrator-background` execution
   - Check Slack `#deployments` channel for notification

---

## 🐛 Troubleshooting

**Migration history mismatch:**
- Use dashboard method (Method A) - simpler and faster
- Or run: `supabase db pull` then `supabase db push`

**Build fails:**
- Check for missing dependencies: `npm install`
- Verify TypeScript errors: `npm run build`

**Orchestrator console not accessible:**
- Verify Clerk authentication
- Check user role is `admin` in Clerk dashboard
- Verify route exists: `/pulse/meta/orchestrator-console`

**Environment variables not working:**
- Restart dev server after adding to `.env.local`
- Verify variables are set in Vercel Dashboard
- Check variable names match exactly (case-sensitive)

---

## 📚 Documentation Reference

- **Quick Start**: `docs/QUICK_START_ORCHESTRATOR.md`
- **Testing Guide**: `docs/TESTING_ORCHESTRATOR.md`
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **Supabase Deployment**: `docs/SUPABASE_DEPLOYMENT.md`
- **Internal Operations**: `README_INTERNAL.md`

---

## 🎉 Success Criteria

You'll know everything is working when:

- ✅ Supabase tables exist and are queryable
- ✅ Orchestrator status endpoint returns data
- ✅ Orchestrator console displays job history
- ✅ Manual orchestrator trigger completes successfully
- ✅ Cron job runs automatically at 01:00 UTC
- ✅ Slack notifications appear in `#deployments` channel
- ✅ `public/system-state.json` is updated after each run

---

**Ready to proceed!** Start with Step 1 (Supabase schema deployment) and work through each step sequentially.

