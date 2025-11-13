# GitHub Actions Healthcheck Setup

**Purpose:** Automated production health monitoring that alerts you when the app is broken.

**Last Updated:** November 2025

---

## Quick Start

### 1. Basic Setup (No Secrets Required)

The healthcheck workflow works out of the box with a default production URL. Just push to `main` and it will run automatically.

**Default URL:** `https://dealershipai.com`

### 2. Configure Production URL (Recommended)

If your production URL is different:

1. Go to **GitHub → Your Repository → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Name: `PRODUCTION_URL`
4. Value: Your production URL (e.g., `https://your-app.vercel.app` or `https://dealershipai.com`)
5. Click **"Add secret"**

The workflow will now use this URL instead of the default.

---

## Slack Notifications (Optional)

### Step 1: Create Slack Incoming Webhook

1. Go to https://api.slack.com/apps
2. Create a new app or select existing app
3. Go to **"Incoming Webhooks"**
4. Toggle **"Activate Incoming Webhooks"** to ON
5. Click **"Add New Webhook to Workspace"**
6. Select the channel where you want notifications
7. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 2: Add Webhook to GitHub Secrets

1. Go to **GitHub → Your Repository → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Your Slack webhook URL
5. Click **"Add secret"**

### Step 3: Test

1. Push a commit that breaks the healthcheck (or manually fail it)
2. You should receive a Slack message like:

```
❌ DealershipAI Production Healthcheck Failed

URL: https://dealershipai.com/api/health
Status Code: 500

Failed Checks:
{"env": {...}, "clarity": {...}}
```

---

## How It Works

### Trigger Events

The workflow runs on:

1. **Push to `main`** - Automatically checks production after code is merged
2. **Manual trigger** - You can run it manually from GitHub Actions UI
3. **Workflow dispatch** - Can be triggered via API or other workflows

### What It Checks

1. **HTTP Status** - Must be 200
2. **JSON Response** - Must have `ok: true`
3. **Endpoint Reachability** - Must be able to connect to `/api/health`

### Failure Conditions

The workflow fails if:

- ❌ Cannot connect to the health endpoint
- ❌ HTTP status code is not 200
- ❌ Response JSON has `ok: false`
- ❌ Response is not valid JSON

### Success Conditions

The workflow passes if:

- ✅ HTTP status code is 200
- ✅ Response JSON has `ok: true`
- ✅ All critical checks pass

---

## Viewing Results

### In GitHub Actions

1. Go to **GitHub → Your Repository → Actions**
2. Click on **"Production Healthcheck"** workflow
3. View the latest run
4. Click on the run to see detailed logs

### In Slack

If configured, you'll see:
- ✅ Success: No message (workflow passes silently)
- ❌ Failure: Alert message with details

### In Pull Requests

If the workflow runs on a PR, it will:
- Add a comment with healthcheck status
- Show pass/fail in PR checks

---

## Customization

### Change Production URL

Edit `.github/workflows/healthcheck.yml`:

```yaml
env:
  APP_URL: ${{ secrets.PRODUCTION_URL || 'https://your-default-url.com' }}
```

### Add Email Notifications

Add a step after the Slack notification:

```yaml
- name: Send email on failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Production Healthcheck Failed
    to: your-email@example.com
    from: GitHub Actions
    body: |
      Production healthcheck failed for ${{ secrets.PRODUCTION_URL }}
      
      See: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### Add More Checks

You can add additional checks in the workflow:

```yaml
- name: Check landing page
  run: |
    curl -f "$APP_URL" || exit 1

- name: Check dashboard redirect
  run: |
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/dash")
    if [ "$CODE" -ne 302 ] && [ "$CODE" -ne 200 ]; then
      echo "Dashboard redirect check failed: $CODE"
      exit 1
    fi
```

### Change Trigger Branch

Edit `.github/workflows/healthcheck.yml`:

```yaml
on:
  push:
    branches: [ main, production ]  # Add more branches
```

### Run on Schedule

Add a cron schedule:

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
```

---

## Troubleshooting

### Workflow Not Running

**Issue:** Workflow doesn't trigger on push to `main`

**Solutions:**
- Check that `.github/workflows/healthcheck.yml` exists
- Verify the file is committed to `main` branch
- Check GitHub Actions is enabled for your repository

### Always Failing

**Issue:** Healthcheck always fails even when app is healthy

**Solutions:**
- Check the workflow logs for the actual error
- Verify `PRODUCTION_URL` secret is set correctly
- Test the health endpoint manually: `curl https://your-url.com/api/health`
- Check that the health endpoint returns `{ ok: true }`

### Slack Notifications Not Working

**Issue:** No Slack messages on failure

**Solutions:**
- Verify `SLACK_WEBHOOK_URL` secret is set
- Test the webhook URL manually: `curl -X POST -H 'Content-type: application/json' --data '{"text":"test"}' YOUR_WEBHOOK_URL`
- Check Slack app permissions
- Check workflow logs for Slack-related errors

### Timeout Issues

**Issue:** Workflow times out

**Solutions:**
- Increase timeout: `timeout-minutes: 10` (default is 5)
- Check if production URL is reachable
- Verify network connectivity from GitHub Actions runners

---

## Best Practices

1. **Set Production URL Secret** - Don't hardcode URLs in workflows
2. **Use Slack for Critical Alerts** - Get notified immediately when production breaks
3. **Monitor Regularly** - Check workflow runs weekly to ensure they're working
4. **Test Failures** - Occasionally test that failure notifications work
5. **Keep Secrets Secure** - Never commit secrets to the repository

---

## Related Documentation

- `docs/VERCEL_ENV_CHECKLIST.md` - Environment variables setup
- `apps/web/app/api/health/route.ts` - Health endpoint implementation
- `apps/web/app/healthcheck/page.tsx` - Human-readable healthcheck page

