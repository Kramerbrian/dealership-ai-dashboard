# 📤 Add TELEMETRY_WEBHOOK to Vercel

## Quick Setup

### Option 1: Use the Script (Easiest)

```bash
./scripts/add-telemetry-webhook.sh
```

Follow the prompts to enter your Slack webhook URL.

---

### Option 2: Vercel CLI

```bash
# Get your Slack webhook URL first:
# https://api.slack.com/apps → Your App → Incoming Webhooks

# Then add it:
vercel env add TELEMETRY_WEBHOOK production
# Paste the webhook URL when prompted
```

---

### Option 3: Vercel Dashboard

1. Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. Click "Add New"
3. Name: `TELEMETRY_WEBHOOK`
4. Value: Your Slack webhook URL (starts with `https://hooks.slack.com/services/...`)
5. Environment: Select "Production"
6. Click "Save"

---

## Get Your Slack Webhook URL

1. Go to https://api.slack.com/apps
2. Select your app (or create a new one)
3. Go to "Incoming Webhooks" in the left sidebar
4. Toggle "Activate Incoming Webhooks" to ON
5. Click "Add New Webhook to Workspace"
6. Select the channel where you want alerts
7. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)

---

## Test the Webhook

After adding, test it:

```bash
curl -X POST $TELEMETRY_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test from DealershipAI"}'
```

Or use the test script:

```bash
npm run test:slack
```

---

## What It Does

The `TELEMETRY_WEBHOOK` sends alerts for:
- ✅ AIV score increases (+10 or more)
- ✅ Revenue recovery ($5K+/month)
- ✅ Engine drops (>10 points in 24h)
- ✅ Daily delta brief milestones

---

**Note**: The webhook is optional. The system will work without it, but you won't get Slack alerts.

