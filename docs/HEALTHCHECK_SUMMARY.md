# Healthcheck & Monitoring Setup Summary

**Purpose:** Complete overview of the healthcheck and monitoring system for DealershipAI.

**Last Updated:** November 2025

---

## 🎯 What We've Built

### 1. Health Endpoint (`/api/health`)

**Location:** `apps/web/app/api/health/route.ts`

**What it checks:**
- ✅ Environment variables (Mapbox, Clerk, Base URL)
- ✅ Clarity API endpoint (`/api/clarity/stack`)
- ✅ Trust API endpoint (if exists)
- ✅ Assistant API endpoint (if exists)

**Response format:**
```json
{
  "ok": true,
  "checks": {
    "env": {
      "NEXT_PUBLIC_MAPBOX_KEY": true,
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": true,
      "CLERK_SECRET_KEY": true,
      "NEXT_PUBLIC_BASE_URL": true
    },
    "clarity": {
      "ok": true,
      "status": 200,
      "hasScores": true,
      "hasLocation": true,
      "hasIntros": true
    }
  },
  "timestamp": "2025-11-13T22:00:00.000Z"
}
```

**Access:**
- Production: `https://dealershipai.com/api/health`
- Local: `http://localhost:3000/api/health`

---

### 2. Human-Readable Healthcheck Page

**Location:** `apps/web/app/healthcheck/page.tsx`

**What it shows:**
- Visual status indicators (green/red)
- Environment variable status
- Clarity API status
- Trust API status
- Assistant API status
- Raw JSON response (expandable)

**Access:**
- Production: `https://dealershipai.com/healthcheck`
- Local: `http://localhost:3000/healthcheck`

---

### 3. GitHub Actions Automated Healthcheck

**Location:** `.github/workflows/healthcheck.yml`

**What it does:**
- ✅ Runs automatically on every push to `main`
- ✅ Can be triggered manually
- ✅ Checks production health endpoint
- ✅ Fails if `ok: false` or non-200 status
- ✅ Sends Slack notification on failure (optional)
- ✅ Comments on PRs with status (if PR workflow)

**Setup:**
1. **Production URL** (optional): Set `PRODUCTION_URL` secret in GitHub
2. **Slack Webhook** (optional): Set `SLACK_WEBHOOK_URL` secret in GitHub

**View results:**
- GitHub → Actions → "Production Healthcheck"
- Check the latest run for pass/fail status

---

### 4. NPM Scripts

**Local testing:**
```bash
npm run health:check              # Check local health endpoint
npm run health:check:prod         # Check production health endpoint
npm run health:check:vercel       # Check custom URL (set PRODUCTION_URL env var)
```

**Production URL override:**
```bash
PRODUCTION_URL=https://your-app.vercel.app npm run health:check:vercel
```

---

## 📋 Quick Reference

### Manual Healthcheck

**From command line:**
```bash
# Production
curl https://dealershipai.com/api/health | jq '.'

# Local
curl http://localhost:3000/api/health | jq '.'
```

**From browser:**
- Production: https://dealershipai.com/healthcheck
- Local: http://localhost:3000/healthcheck

### Automated Healthcheck

**GitHub Actions:**
- Runs automatically on push to `main`
- Manual trigger: GitHub → Actions → "Production Healthcheck" → "Run workflow"

**Slack notifications:**
- Configure `SLACK_WEBHOOK_URL` secret in GitHub
- Receives alerts when healthcheck fails

---

## 🔧 Configuration

### Required Environment Variables

For healthcheck to pass, these must be set in production:

1. **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** - Required for `/dash`
2. **`CLERK_SECRET_KEY`** - Required for `/dash`
3. **`NEXT_PUBLIC_MAPBOX_KEY`** - Optional (for map features)
4. **`NEXT_PUBLIC_BASE_URL`** - Optional (for server-side API calls)

### GitHub Secrets

**Optional but recommended:**
- `PRODUCTION_URL` - Your production URL (defaults to `https://dealershipai.com`)
- `SLACK_WEBHOOK_URL` - Slack webhook for failure notifications

---

## 🚨 Troubleshooting

### Healthcheck Always Fails

1. **Check endpoint is reachable:**
   ```bash
   curl -I https://dealershipai.com/api/health
   ```

2. **Check response JSON:**
   ```bash
   curl https://dealershipai.com/api/health | jq '.'
   ```

3. **Verify environment variables:**
   - Check Vercel dashboard → Settings → Environment Variables
   - Ensure Clerk keys are set
   - Check that `NEXT_PUBLIC_BASE_URL` matches your domain

4. **Check build logs:**
   - Vercel dashboard → Deployments → Latest → Build Logs
   - Look for errors in `/api/health` or `/api/clarity/stack`

### GitHub Action Not Running

1. **Check workflow file exists:**
   - Verify `.github/workflows/healthcheck.yml` is committed
   - Ensure it's on the `main` branch

2. **Check GitHub Actions is enabled:**
   - Repository → Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is enabled

3. **Check workflow permissions:**
   - The workflow should have read access by default
   - No special permissions needed for healthcheck

### Slack Notifications Not Working

1. **Verify webhook URL:**
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"test"}' \
     $SLACK_WEBHOOK_URL
   ```

2. **Check GitHub secret:**
   - Repository → Settings → Secrets and variables → Actions
   - Verify `SLACK_WEBHOOK_URL` is set correctly

3. **Check workflow logs:**
   - Look for "SLACK_WEBHOOK_URL not set" message
   - Check for curl errors in the notification step

---

## 📚 Related Documentation

- `docs/VERCEL_ENV_CHECKLIST.md` - Environment variables setup
- `docs/GITHUB_ACTIONS_SETUP.md` - GitHub Actions configuration
- `apps/web/app/api/health/route.ts` - Health endpoint implementation
- `apps/web/app/healthcheck/page.tsx` - Healthcheck page implementation

---

## 🎯 Next Steps

### Immediate Actions

1. ✅ Health endpoint is live
2. ✅ Healthcheck page is live
3. ✅ GitHub Action is configured
4. ⏳ Set `PRODUCTION_URL` secret (optional)
5. ⏳ Set `SLACK_WEBHOOK_URL` secret (optional)

### Future Enhancements

- [ ] Add email notifications
- [ ] Add more detailed checks (database, Redis, etc.)
- [ ] Add performance metrics to healthcheck
- [ ] Add uptime monitoring
- [ ] Add alerting thresholds

---

## ✅ Verification Checklist

Before considering the healthcheck system "done":

- [ ] `/api/health` returns `ok: true` in production
- [ ] `/healthcheck` page loads and shows green status
- [ ] GitHub Action runs successfully on push to `main`
- [ ] Slack notifications work (if configured)
- [ ] NPM scripts work locally
- [ ] Documentation is up to date

---

**Status:** ✅ **Complete and Ready for Use**

All components are in place and ready to monitor your production deployment.

