# DealershipAI Testing Guide

## Quick Start

### 1. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 2. Run Test Script

```bash
# Test all endpoints
./scripts/test-endpoints.sh

# Or test against production
./scripts/test-endpoints.sh https://dash.dealershipai.com
```

## Manual Testing

### Test Orchestrator Status

```bash
curl http://localhost:3000/api/orchestrator/status | jq '.'
```

**Expected Response:**
```json
{
  "ok": true,
  "safeMode": false,
  "safeModeStatus": null,
  "state": {
    "success": true,
    "duration": 45,
    "jobsExecuted": 12,
    "jobsFailed": 0,
    "governancePassed": true,
    "lighthouseScore": 95,
    "safeModeTriggered": false,
    "timestamp": "2025-01-20T12:00:00Z"
  },
  "jobs": {
    "EDGEORCHESTRATION": {
      "id": "EDGEORCHESTRATION",
      "success": true,
      "duration": "2.5s",
      "lastRun": "2025-01-20T12:00:00Z"
    }
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

### Test OEM Parse

**Note:** Requires `OPENAI_API_KEY` environment variable. May take 30-60 seconds.

```bash
curl -X POST http://localhost:3000/api/oem/parse \
  -H "Content-Type: application/json" \
  -d '{
    "oem": "Toyota",
    "url": "https://pressroom.toyota.com/the-2026-toyota-tacoma-adventure-awaits/"
  }' | jq '.'
```

**Expected Response:**
```json
{
  "ok": true,
  "update": {
    "oem": "Toyota",
    "model": "Tacoma",
    "year": 2026,
    "headline_changes": [
      {
        "title": "Black front logo now on TRD Off-Road",
        "detail": "Black front logo now standard on TRD Off-Road, TRD Sport, and TRD Pre-Runner",
        "tag": "styling",
        "is_retail_relevant": true,
        "affected_trims": ["TRD Off-Road", "TRD Sport", "TRD Pre-Runner"]
      }
    ],
    "powertrains": [
      {
        "name": "i-FORCE",
        "hp": 278,
        "torque_lbft": 317,
        "mpg_combined": 23
      },
      {
        "name": "i-FORCE MAX",
        "hp": 326,
        "torque_lbft": 465,
        "mpg_combined": 23
      }
    ],
    "colors": [
      {
        "name": "Heritage Blue",
        "trim_limitation": ""
      },
      {
        "name": "Wave Maker",
        "trim_limitation": "TRD Pro only"
      }
    ],
    "source_url": "https://pressroom.toyota.com/...",
    "extracted_at": "2025-01-20T12:00:00Z"
  }
}
```

### Test Orchestrator Background

**Note:** May require `CRON_SECRET` if configured. Takes 1-5 minutes.

```bash
# Without authentication (if CRON_SECRET not set)
curl -X POST http://localhost:3000/api/orchestrator-background | jq '.'

# With authentication (if CRON_SECRET is set)
curl -X POST http://localhost:3000/api/orchestrator-background \
  -H "Authorization: Bearer $CRON_SECRET" | jq '.'
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "success": true,
    "duration": 45,
    "jobsExecuted": 12,
    "jobsFailed": 0,
    "governancePassed": true,
    "lighthouseScore": 95,
    "safeModeTriggered": false,
    "timestamp": "2025-01-20T12:00:00Z"
  }
}
```

### Test OEM Monitor (Full Workflow)

**Note:** Requires `OPENAI_API_KEY` and may take several minutes.

```bash
curl -X POST http://localhost:3000/api/oem/monitor \
  -H "Content-Type: application/json" \
  -d '{
    "oem": "Toyota",
    "model": "Tacoma",
    "filterByModel": false
  }' | jq '.'
```

**Expected Response:**
```json
{
  "ok": true,
  "updates": 1,
  "tiles_pushed": 15,
  "results": [
    {
      "model": "2026 Tacoma",
      "tenants": ["toyota-naples", "toyota-fort-myers"],
      "tiles": 5
    }
  ]
}
```

## Environment Variables Required

### For Local Testing

Create `.env.local`:

```bash
# OpenAI (for OEM parsing)
OPENAI_API_KEY=sk-...

# Slack (for notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Vercel (for rollback - optional)
VERCEL_TOKEN=...
VERCEL_PROJECT_ID=...

# Cron (for background endpoint - optional)
CRON_SECRET=your-secret-here
```

### For Production

Set in Vercel dashboard:
- `OPENAI_API_KEY`
- `SLACK_WEBHOOK_URL`
- `CRON_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`

## Troubleshooting

### Server Not Running

```bash
# Start dev server
npm run dev

# Check if port 3000 is in use
lsof -i :3000
```

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set
- Check API key is valid and has credits
- Review rate limits

### Orchestrator Background Fails

- Check `lib/meta-orchestrator.ts` exists
- Verify manifest files are valid JSON
- Check file system permissions for `public/system-state.json`

### OEM Parse Timeout

- Increase timeout: `--max-time 120`
- Check network connectivity
- Verify pressroom URL is accessible

## Integration Tests

### Test Full OEM Workflow

```bash
# 1. Parse OEM content
PARSE_RESULT=$(curl -s -X POST http://localhost:3000/api/oem/parse \
  -H "Content-Type: application/json" \
  -d '{"oem": "Toyota", "url": "https://pressroom.toyota.com/..."}')

# 2. Check if parsing succeeded
if echo "$PARSE_RESULT" | jq -e '.ok == true' > /dev/null; then
  echo "✅ Parsing succeeded"
  
  # 3. Monitor and route to tenants
  MONITOR_RESULT=$(curl -s -X POST http://localhost:3000/api/oem/monitor \
    -H "Content-Type: application/json" \
    -d '{"oem": "Toyota", "model": "Tacoma"}')
  
  if echo "$MONITOR_RESULT" | jq -e '.ok == true' > /dev/null; then
    echo "✅ Monitoring and routing succeeded"
  else
    echo "❌ Monitoring failed"
  fi
else
  echo "❌ Parsing failed"
fi
```

### Test Orchestrator Console

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/pulse/meta/orchestrator-console`
3. Verify:
   - System state loads
   - Job status table displays
   - Auto-refresh works
   - Manual trigger button works

## Performance Benchmarks

### Expected Response Times

- **Orchestrator Status**: < 100ms
- **OEM Parse**: 30-60 seconds (depends on OpenAI API)
- **Orchestrator Background**: 1-5 minutes (depends on jobs)
- **OEM Monitor**: 2-10 minutes (depends on URLs and parsing)

### Success Criteria

- ✅ All endpoints return 200 status
- ✅ Orchestrator status loads in < 1s
- ✅ OEM parse completes in < 60s
- ✅ Orchestrator background completes in < 5min
- ✅ No errors in console logs

## Next Steps

After successful testing:

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Configure Cron Jobs**
   - Add to `vercel.json` if not already present
   - Verify cron jobs are active in Vercel dashboard

3. **Monitor Production**
   - Check `/pulse/meta/orchestrator-console` in production
   - Review Slack notifications
   - Monitor Vercel logs

4. **Set Up Alerts**
   - Configure Slack alerts for failures
   - Set up Vercel monitoring
   - Enable error tracking (Sentry, etc.)
