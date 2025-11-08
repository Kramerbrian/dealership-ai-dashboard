# GitHub Secrets Setup Guide

## Required Secrets

To enable full functionality of the governance system, add these secrets to your GitHub repository.

### Step 1: Navigate to Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add SLACK_WEBHOOK_URL

**Name:** `SLACK_WEBHOOK_URL`

**Value:** Your Slack Incoming Webhook URL

**How to get it:**
1. Go to https://api.slack.com/apps
2. Create a new app or select existing app
3. Go to **Incoming Webhooks**
4. Activate Incoming Webhooks
5. Click **Add New Webhook to Workspace**
6. Select channel (e.g., `#ux-governance` or `#ai-orchestration`)
7. Copy the webhook URL
8. Paste as the secret value

**Example URL format:**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Add SENDGRID_API_KEY (Optional)

**Name:** `SENDGRID_API_KEY`

**Value:** Your SendGrid API Key

**How to get it:**
1. Go to https://app.sendgrid.com/
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "DealershipAI Governance")
5. Select **Full Access** or **Restricted Access** (Mail Send permission required)
6. Copy the API key (you can only see it once!)
7. Paste as the secret value

**Note:** Also verify your sender email in SendGrid:
- Go to **Settings** → **Sender Authentication**
- Verify `bot@dealershipai.com` (or update `FROM_EMAIL` in workflow)

### Step 4: Verify Secrets

After adding secrets, verify they're set:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see:
   - ✅ `SLACK_WEBHOOK_URL` (required)
   - ✅ `SENDGRID_API_KEY` (optional)

### Step 5: Test Workflows

1. Go to **Actions** tab
2. Select **DealershipAI UX Doctrine Validator**
3. Click **Run workflow** → **Run workflow**
4. Check the run logs to verify:
   - ✅ Secrets are accessible
   - ✅ Slack notification sent (if webhook configured)
   - ✅ Validation completed

## What Happens Without Secrets

### Without SLACK_WEBHOOK_URL
- ✅ Validator still runs
- ✅ Auto-fixes still work
- ❌ No Slack notifications
- ⚠️ Workflow will show warning but won't fail

### Without SENDGRID_API_KEY
- ✅ Monthly report still generates
- ✅ PDF still created
- ✅ Report still committed to repo
- ❌ No email sent to stakeholders
- ⚠️ Email step will skip gracefully

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use repository secrets** (not environment secrets) for this use case
3. **Rotate keys periodically** (every 90 days recommended)
4. **Use restricted API keys** when possible (SendGrid)
5. **Monitor secret usage** in GitHub audit logs

## Troubleshooting

### "Secret not found" error
- Verify secret name matches exactly (case-sensitive)
- Check you're using repository secrets, not environment secrets
- Ensure you have admin access to the repository

### Slack notification not working
- Test webhook URL manually: `curl -X POST -H 'Content-Type: application/json' -d '{"text":"test"}' YOUR_WEBHOOK_URL`
- Check Slack app permissions
- Verify channel exists and bot has access

### SendGrid email failing
- Verify API key has "Mail Send" permission
- Check sender email is verified in SendGrid
- Review SendGrid activity logs
- Ensure recipient email is valid

## Quick Test Commands

Test Slack webhook (replace with your URL):
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Test from DealershipAI Governance"}' \
  YOUR_SLACK_WEBHOOK_URL
```

Test SendGrid API key:
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"bot@dealershipai.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test email"}]}'
```

## Next Steps

Once secrets are configured:

1. ✅ Workflows will run automatically on schedule
2. ✅ You'll receive Slack notifications for each run
3. ✅ Monthly reports will be emailed to stakeholders
4. ✅ All reports are archived in the repository

Monitor the first few runs to ensure everything works correctly!

