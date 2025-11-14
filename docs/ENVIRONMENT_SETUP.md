# Environment Variables Setup Guide

## Required for Orchestrator System

### 1. SLACK_WEBHOOK_URL

**Purpose:** Sends orchestrator completion and rollback notifications to Slack

**How to get:**
1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Go to "Incoming Webhooks"
4. Activate Incoming Webhooks
5. Add New Webhook to Workspace
6. Select `#deployments` channel
7. Copy webhook URL

**Set in:**
- Vercel Dashboard → Project Settings → Environment Variables
- Add to: Production, Preview, Development

**Format:**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

---

### 2. VERCEL_TOKEN

**Purpose:** Allows orchestrator to trigger rollbacks via Vercel CLI

**How to get:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "DealershipAI Orchestrator"
4. Scope: Full Account (or specific project)
5. Copy token

**Set in:**
- Vercel Dashboard → Project Settings → Environment Variables
- Add to: Production only (or Preview if testing)

**Format:**
```
vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security:** This token has deployment control. Keep it secret.

---

### 3. SUPABASE_SERVICE_ROLE_KEY

**Purpose:** Allows orchestrator to write logs and metrics to Supabase

**How to get:**
1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api
2. Under "Project API keys"
3. Copy "service_role" key (NOT the anon key)
4. ⚠️ This key bypasses RLS - keep it secret

**Set in:**
- Vercel Dashboard → Project Settings → Environment Variables
- Add to: Production, Preview, Development

**Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0cmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTk5OTk5OSwiZXhwIjoxOTYxNTc1OTk5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Quick Setup Script

```bash
# Set all three in Vercel CLI (if you have it installed)
vercel env add SLACK_WEBHOOK_URL production
vercel env add VERCEL_TOKEN production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Or use Vercel Dashboard:
1. Go to Project → Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)
4. Save

---

## Verification

After setting variables, verify they're accessible:

```bash
# Test orchestrator endpoint (will fail without proper setup, but confirms route exists)
curl https://your-domain.vercel.app/api/orchestrator-background
```

Check Vercel logs after first cron run to confirm variables are loaded.

---

## Security Notes

- **Never commit** these values to git
- Use Vercel's environment variable encryption
- Rotate tokens quarterly
- Use different tokens for production vs. preview
- Service role key has full database access - restrict to server-side only

