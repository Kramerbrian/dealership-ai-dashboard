# GitHub Actions Deployment Setup

## Overview

This workflow automatically builds, deploys, and notifies your team whenever code is pushed to the `main` branch.

## Workflow Features

✅ **Automated Build** - Runs `setup.sh build` with full validation
✅ **Vercel Deployment** - Deploys to production automatically
✅ **Slack Notifications** - Success/failure alerts to your team channel
✅ **Smoke Tests** - Verifies build artifacts before deployment
✅ **Manual Trigger** - Can be triggered manually via GitHub UI

## Required GitHub Secrets

Configure these secrets in **GitHub → Settings → Secrets → Actions**:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel CLI access token | [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Run `npx vercel link` and check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `npx vercel link` and check `.vercel/project.json` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL | [Slack Apps → Incoming Webhooks](https://api.slack.com/messaging/webhooks) |

## Setting Up Vercel Secrets

### 1. Get Vercel Token

```bash
# Login to Vercel
npx vercel login

# Create a new token at:
# https://vercel.com/account/tokens

# Name it: "GitHub Actions Deploy"
# Copy the token value
```

### 2. Link Your Project

```bash
# Link the project (if not already linked)
npx vercel link

# This creates .vercel/project.json with your IDs
cat .vercel/project.json
```

**Example `.vercel/project.json`:**
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

Copy the `orgId` and `projectId` values to GitHub Secrets.

## Setting Up Slack Notifications

### 1. Create Incoming Webhook

1. Go to your Slack workspace
2. Visit [Slack Apps](https://api.slack.com/apps)
3. Click **Create New App** → **From scratch**
4. Name it: "DealershipAI Deployments"
5. Select your workspace
6. In the app settings, go to **Incoming Webhooks**
7. Toggle **Activate Incoming Webhooks** to **On**
8. Click **Add New Webhook to Workspace**
9. Select the channel (e.g., `#deployments`)
10. Copy the webhook URL

### 2. Add to GitHub Secrets

```
https://github.com/YOUR_ORG/dealership-ai-dashboard/settings/secrets/actions
```

- Click **New repository secret**
- Name: `SLACK_WEBHOOK_URL`
- Value: Paste the webhook URL
- Click **Add secret**

## Workflow Triggers

### Automatic Trigger
Push to `main` branch:
```bash
git push origin main
```

### Manual Trigger
1. Go to GitHub → Actions
2. Select "🚗 DealershipAI Orchestrator 3.0 — Build, Deploy & Notify"
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Click **Run workflow**

## Slack Notification Examples

### Success Message
```
🚀 DealershipAI Orchestrator 3.0 Deployed Successfully

Environment: Production
Branch: main
URL: https://dealershipai.vercel.app
Commit: abc1234567890
```

### Failure Message
```
❌ Deployment Failed: DealershipAI Orchestrator 3.0 on branch main

Branch: main
Commit: abc1234567890
Error: Build or deploy failed. Check Actions logs.
```

## Workflow Steps

1. **Checkout repo** - Pulls latest code
2. **Setup Node.js** - Installs Node 18 with npm cache
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Run setup script** - Executes `setup.sh build` for validation
5. **Smoke test** - Verifies `.next/` directory exists
6. **Deploy to Vercel** - Pushes to production
7. **Notify Slack** - Posts success/failure message

## Troubleshooting

### Build Fails

**Error:** `setup.sh: not found`

**Fix:** Ensure `setup.sh` exists and is executable:
```bash
chmod +x setup.sh
git add setup.sh
git commit -m "Make setup.sh executable"
git push
```

### Vercel Deployment Fails

**Error:** `Error: No token found`

**Fix:** Verify `VERCEL_TOKEN` secret is set correctly in GitHub.

### Slack Notification Fails

**Error:** `Error: Bad request`

**Fix:** Verify `SLACK_WEBHOOK_URL` is correct and hasn't expired.

**Test webhook manually:**
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_SLACK_WEBHOOK_URL
```

### Build Timeout

**Error:** `The job was canceled because it ran longer than the maximum execution time`

**Fix:** Increase timeout in workflow file:
```yaml
timeout-minutes: 20  # Increase from 15
```

## Best Practices

1. **Use branch protection** - Require PR reviews before merging to `main`
2. **Test locally first** - Run `npm run build` before pushing
3. **Monitor Actions** - Check GitHub Actions tab regularly
4. **Keep secrets updated** - Rotate Vercel tokens periodically
5. **Use environments** - Consider separate staging/production workflows

## Advanced: Schema Health Reporting

To add schema health reporting after deployment, add this step before Slack notification:

```yaml
- name: 🧮 Run Schema Health Report
  id: audit
  run: |
    node scripts/schema-health-report.js > report.log
    echo "audit_out<<EOF" >> $GITHUB_OUTPUT
    tail -n 20 report.log >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT
  continue-on-error: true

- name: 🧠 Parse KPI values
  id: kpi
  run: |
    SCHEMA=$(grep -Eo 'Schema Coverage: [0-9.]+' report.log | awk '{print $3}')
    EEAT=$(grep -Eo 'E-E-A-T Score: [0-9.]+' report.log | awk '{print $3}')
    echo "schema_cov=${SCHEMA:-N/A}" >> $GITHUB_OUTPUT
    echo "eeat_score=${EEAT:-N/A}" >> $GITHUB_OUTPUT
```

Then update Slack payload to include KPIs:
```yaml
{ "title": "Schema Coverage", "value": "${{ steps.kpi.outputs.schema_cov }}%", "short": true },
{ "title": "E-E-A-T Score", "value": "${{ steps.kpi.outputs.eeat_score }}%", "short": true }
```

## Status Badge

Add this to your README.md:

```markdown
![Deploy Status](https://github.com/YOUR_ORG/dealership-ai-dashboard/actions/workflows/deploy.yml/badge.svg)
```

## Related Documentation

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

**Status:** ✅ Ready for use
**Last Updated:** 2025-11-11
