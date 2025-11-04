# 🔐 Slack Integration - Environment Variables

## Required Environment Variables

### 1. SLACK_BOT_TOKEN
**Purpose**: OAuth token for Slack bot API access  
**Required for**: Updating messages, posting to channels  
**How to get**: 
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app → **OAuth & Permissions**
3. Copy **Bot User OAuth Token** (`xoxb-...`)

**Example**:
```bash
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
```

---

### 2. SLACK_SIGNING_SECRET
**Purpose**: Verify Slack requests are authentic  
**Required for**: Signature verification on `/api/slack/command` and `/api/slack/actions`  
**How to get**:
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app → **Basic Information**
3. Scroll to **App Credentials**
4. Copy **Signing Secret**

**Example**:
```bash
SLACK_SIGNING_SECRET=abc123def456ghi789jkl012mno345pqr678
```

---

### 3. SLACK_WEBHOOK_URL
**Purpose**: Post messages to Slack channels (for leaderboard, alerts)  
**Required for**: Weekly leaderboard posts, alert notifications  
**How to get**:
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app → **Incoming Webhooks**
3. Toggle **Activate Incoming Webhooks** ON
4. Click **Add New Webhook to Workspace**
5. Select channel (e.g., `#ai-ops`)
6. Copy **Webhook URL**

**Example**:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Optional Environment Variables

### 4. SLACK_LEADERBOARD_CHANNEL
**Purpose**: Channel for weekly leaderboard posts  
**Default**: `#ai-ops`  
**Example**:
```bash
SLACK_LEADERBOARD_CHANNEL=#exec-board
```

---

### 5. NEXT_PUBLIC_APP_URL
**Purpose**: Base URL for Slack callback endpoints  
**Required for**: Orchestrator to call `/api/slack/update`  
**Example**:
```bash
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
```

**For local development**:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 6. GRAFANA_URL
**Purpose**: Base URL for Grafana links in Slack messages  
**Default**: `https://grafana.dealershipai.com`  
**Example**:
```bash
GRAFANA_URL=https://grafana.dealershipai.com
```

---

## Complete .env Example

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_LEADERBOARD_CHANNEL=#ai-ops

# App Configuration
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
GRAFANA_URL=https://grafana.dealershipai.com

# Orchestrator (if needed)
ORCHESTRATOR_URL=http://orchestrator:3001
ORCHESTRATOR_AUTH_TOKEN=your_auth_token_if_needed

# Redis (for BullMQ)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

---

## Vercel Configuration

### Setting Environment Variables in Vercel

1. Go to your project in [vercel.com](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `SLACK_BOT_TOKEN`
   - **Value**: `xoxb-your-token`
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for all variables
5. **Redeploy** for changes to take effect

### Quick Copy-Paste for Vercel

```bash
# Production
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_LEADERBOARD_CHANNEL=#ai-ops
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
GRAFANA_URL=https://grafana.dealershipai.com
```

---

## Local Development Setup

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Add Slack variables

```bash
# .env.local
SLACK_BOT_TOKEN=xoxb-your-dev-token
SLACK_SIGNING_SECRET=your-dev-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_LEADERBOARD_CHANNEL=#dev-testing
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Restart dev server

```bash
npm run dev
```

---

## Verification

### Test Slack Bot Token

```bash
curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  https://slack.com/api/auth.test
```

**Expected response**:
```json
{
  "ok": true,
  "url": "https://your-workspace.slack.com/",
  "team": "Your Team",
  "user": "DealershipAI Bot",
  ...
}
```

### Test Webhook URL

```bash
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message from DealershipAI"}'
```

**Expected**: Message appears in Slack channel

---

## Security Notes

### ⚠️ Important

- **Never commit** `.env` files to git
- **Never expose** tokens in client-side code
- **Rotate tokens** if exposed
- **Use different tokens** for dev/staging/production
- **Restrict webhook URLs** to specific channels

### Token Rotation

If a token is compromised:

1. Revoke token in Slack app settings
2. Generate new token
3. Update environment variables
4. Redeploy application

---

## Troubleshooting

### Issue: "Invalid signature"

**Solution**:
- Check `SLACK_SIGNING_SECRET` is correct
- Ensure raw body is preserved (not parsed as JSON first)
- Verify timestamp is within 5 minutes

### Issue: "Missing scope"

**Solution**:
- Add required scopes in Slack app settings:
  - `chat:write`
  - `chat:write.interactive`
  - `commands`
  - `users:read`
- Reinstall app to workspace

### Issue: "Webhook not working"

**Solution**:
- Verify webhook URL is correct
- Check webhook is enabled in Slack app
- Verify channel exists and bot has access

---

## ✅ Checklist

- [ ] `SLACK_BOT_TOKEN` configured
- [ ] `SLACK_SIGNING_SECRET` configured
- [ ] `SLACK_WEBHOOK_URL` configured
- [ ] Bot scopes added in Slack app
- [ ] App installed to workspace
- [ ] Webhook channel selected
- [ ] Environment variables set in Vercel (if deploying)
- [ ] Tested token with `auth.test` API
- [ ] Tested webhook with curl command

---

**Last Updated**: November 4, 2025

