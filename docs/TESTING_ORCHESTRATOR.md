# Testing Orchestrator Endpoints

## Prerequisites

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Wait for server to be ready:**
   - Look for: `✓ Ready in X.Xs`
   - Server should be running on `http://localhost:3000`

---

## Quick Test Script

Run the automated test script:

```bash
./scripts/test-orchestrator.sh
```

Or test manually:

---

## Manual Testing

### 1. Test Orchestrator Status

```bash
curl http://localhost:3000/api/orchestrator/status | jq '.'
```

**Expected Response:**
```json
{
  "ok": true,
  "safeMode": false,
  "safeModeStatus": null,
  "state": { ... },
  "jobs": { ... },
  "timestamp": "2025-01-XX..."
}
```

**What it checks:**
- System state file exists
- Safe mode status
- Job execution history
- Last run timestamp

---

### 2. Test OEM Parsing

```bash
curl -X POST http://localhost:3000/api/oem/parse \
  -H "Content-Type: application/json" \
  -d '{"oem": "Toyota", "url": "https://pressroom.toyota.com/the-2026-toyota-tacoma-adventure-awaits/"}'
```

**Expected Response:**
```json
{
  "ok": true,
  "update": {
    "oem": "Toyota",
    "model": "Tacoma",
    "year": 2026,
    ...
  }
}
```

**What it checks:**
- OpenAI API connection
- OEM content parsing
- Structured output generation
- Error handling

**Note:** Requires `OPENAI_API_KEY` in `.env.local`

---

### 3. Trigger Orchestrator Manually

```bash
curl -X POST http://localhost:3000/api/orchestrator-background
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "success": true,
    "duration": 5,
    "jobsExecuted": 3,
    "jobsFailed": 0,
    "governancePassed": true,
    "lighthouseScore": 95,
    "safeModeTriggered": false,
    "timestamp": "2025-01-XX..."
  }
}
```

**What it checks:**
- Meta-orchestrator execution
- Governance validation
- Lighthouse score reading
- Slack notification (if configured)
- System state file creation

**Note:** 
- Requires `SLACK_WEBHOOK_URL` for notifications (optional)
- Requires `VERCEL_TOKEN` for rollback (optional in dev)
- May take 30-60 seconds to complete

---

## Testing in Production

### Using Vercel CLI

```bash
# Deploy to preview
vercel

# Test preview URL
curl https://your-preview-url.vercel.app/api/orchestrator/status
```

### Using Production URL

```bash
# Test production endpoints
curl https://your-domain.vercel.app/api/orchestrator/status

# Manual trigger (requires CRON_SECRET if configured)
curl -X POST https://your-domain.vercel.app/api/orchestrator-background \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Troubleshooting

### "Connection refused"
- Dev server not running
- Run: `npm run dev`

### "Unauthorized" (production)
- `CRON_SECRET` is set and header missing
- Add header: `Authorization: Bearer $CRON_SECRET`
- Or test locally (no auth required)

### "OPENAI_API_KEY not configured"
- Add to `.env.local`:
  ```
  OPENAI_API_KEY=sk-...
  ```

### "SLACK_WEBHOOK_URL not set"
- Warning only, orchestrator still runs
- Add to `.env.local` for notifications:
  ```
  SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
  ```

### Orchestrator takes too long
- Normal: 30-60 seconds
- Check console logs for progress
- Increase timeout if needed

---

## Expected Console Output

When orchestrator runs, you should see:

```
🚀 Starting background orchestrator...
📋 Executing meta-orchestrator...
🛡️ Validating governance policies...
✅ Governance passed, clearing safe mode
✅ Nightly Orchestration Complete
```

---

## Next Steps

After testing:
1. Verify all endpoints respond correctly
2. Check system-state.json is created
3. Review console logs for errors
4. Test orchestrator console UI at `/pulse/meta/orchestrator-console`

