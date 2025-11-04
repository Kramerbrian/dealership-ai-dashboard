# ⚡ Quick Slack Setup - 5 Minutes

## Step 1: Get Slack Credentials (2 minutes)

### Get Bot Token
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app (or create new)
3. **OAuth & Permissions** → Copy **Bot User OAuth Token**
   - Looks like: `xoxb-your-slack-bot-token-here`

### Get Signing Secret
1. Same app → **Basic Information**
2. Scroll to **App Credentials**
3. Copy **Signing Secret**
   - Looks like: `abc123def456ghi789jkl012mno345pqr678`

### Get Webhook URL
1. Same app → **Incoming Webhooks**
2. Toggle **ON** → **Add New Webhook to Workspace**
3. Select channel (e.g., `#ai-ops`)
4. Copy **Webhook URL**
   - Looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

---

## Step 2: Add to Environment (1 minute)

### Local Development

```bash
# Copy example file
cp .env.slack.example .env.local

# Edit .env.local and add your values
nano .env.local
```

**Add these lines**:
```bash
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-hereyour-actual-token-here
SLACK_SIGNING_SECRET=your-actual-secret-here
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/ACTUAL/WEBHOOK
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Production

1. Go to [vercel.com](https://vercel.com) → Your project
2. **Settings** → **Environment Variables**
3. Add each variable (select all environments)
4. **Redeploy**

---

## Step 3: Configure Slack App (1 minute)

### Add Scopes
1. Same app → **OAuth & Permissions**
2. Add these scopes:
   - `chat:write`
   - `chat:write.interactive`
   - `commands`
   - `users:read`
   - `users:read.email`
3. **Reinstall App** to workspace

### Configure Slash Command
1. Same app → **Slash Commands**
2. **Create New Command**:
   - Command: `/dealershipai`
   - Request URL: `https://dash.dealershipai.com/api/slack/command`
   - Description: "Get DealerAI status or KPIs"

### Enable Interactivity
1. Same app → **Interactivity & Shortcuts**
2. Toggle **ON**
3. Request URL: `https://dash.dealershipai.com/api/slack/actions`

---

## Step 4: Test (1 minute)

```bash
# Test configuration
npm run test:slack

# Test workflow
npm run test:slack-workflow
```

**Expected**: All tests pass ✅

---

## Step 5: Test in Slack

1. Type in Slack: `/dealershipai status test-dealer`
2. Should see: Metrics with action buttons
3. Click: "Run Schema Fix" button
4. Watch: Message updates to "Running..." then "Completed ✅"

---

## ✅ Done!

Your Slack integration is now ready. Messages will update in real-time as tasks complete.

---

## 🆘 Troubleshooting

**"Invalid signature"**:
- Check `SLACK_SIGNING_SECRET` is correct
- Restart dev server after adding env vars

**"Missing scope"**:
- Add scopes in Slack app settings
- Reinstall app to workspace

**Buttons not working**:
- Check Interactivity is enabled
- Verify Request URL is correct
- Check worker is running: `npm run worker:orchestrator`

---

**Quick Reference**: See `ENV_VARIABLES_SLACK.md` for detailed information

