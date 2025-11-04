# 🔄 Slack Integration - Complete Setup Guide

## ✅ Implementation Complete

**Status**: ✅ **READY FOR PRODUCTION**

---

## 📋 What Was Implemented

### 1. ✅ Slack Message Update System
- Real-time message updates (running → completed/failed)
- Progress bars for long-running tasks
- Retry buttons for failed tasks
- Grafana links for completed tasks

### 2. ✅ Orchestrator Worker Integration
- Worker processes tasks with Slack updates
- Progress tracking and status updates
- Automatic Slack message updates on completion/failure

### 3. ✅ Testing & Verification
- Integration test script
- Workflow test script
- Environment variable verification

---

## 🔧 Setup Instructions

### Step 1: Configure Environment Variables

See `ENV_VARIABLES_SLACK.md` for detailed instructions.

**Required**:
```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
```

**Optional**:
```bash
SLACK_LEADERBOARD_CHANNEL=#ai-ops
GRAFANA_URL=https://grafana.dealershipai.com
```

### Step 2: Verify Configuration

```bash
# Run integration tests
npm run test:slack

# Run workflow tests
npm run test:slack-workflow
```

### Step 3: Start Orchestrator Worker

```bash
# Start worker (processes tasks and updates Slack)
npm run worker:orchestrator
```

### Step 4: Test in Slack

1. **Test command**:
   ```
   /dealershipai status naples-honda
   ```

2. **Click button** (e.g., "Run Schema Fix")

3. **Watch message update**:
   - Immediately: "⚙️ Task running..."
   - Progress: "⚙️ Task running... (50%)"
   - Complete: "✅ Task completed successfully"

---

## 🎯 Integration with Orchestrator

### Option 1: Use Provided Worker

The `lib/jobs/orchestrator-worker.ts` file provides a complete worker implementation:

```bash
npm run worker:orchestrator
```

### Option 2: Integrate into Existing Worker

Add to your existing BullMQ worker:

```typescript
import { updateSlackStatus } from '@/lib/jobs/orchestrator-worker';

worker.on('completed', async (job) => {
  const { slackContext, payload } = job.data;
  
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(
      slackContext,
      'completed',
      job.data.type,
      payload.dealerId,
      {
        taskId: job.id,
        grafanaUrl: `https://grafana.dealershipai.com/d/gnn-analytics?dealer=${payload.dealerId}`,
      }
    );
  }
});

worker.on('failed', async (job, error) => {
  const { slackContext, payload } = job.data;
  
  if (slackContext?.channel && slackContext?.ts) {
    await updateSlackStatus(
      slackContext,
      'failed',
      job.data.type,
      payload.dealerId,
      {
        error: error.message,
        taskId: job.id,
      }
    );
  }
});

worker.on('progress', async (job, progress) => {
  const { slackContext, payload } = job.data;
  
  if (slackContext?.channel && slackContext?.ts && progress > 0) {
    await updateSlackStatus(
      slackContext,
      'running',
      job.data.type,
      payload.dealerId,
      { progress, taskId: job.id }
    );
  }
});
```

---

## 📊 Message Lifecycle

### Example: Schema Fix Task

**1. User clicks button**:
```
⚙️ Task schema_fix queued for naples-honda via Orchestrator...
```

**2. Task starts** (immediate update):
```
⚙️ Task schema_fix running for naples-honda... (0%)
```

**3. Progress updates** (optional):
```
⚙️ Task schema_fix running for naples-honda... (30%)
```

**4. Task completes**:
```
✅ Task schema_fix completed successfully for naples-honda.
Task ID: task-abc123
View in Grafana →
```

### Example: Failed Task

**1. Task starts**:
```
⚙️ Task ugc_audit running for naples-honda... (0%)
```

**2. Task fails**:
```
❌ Task ugc_audit failed for naples-honda.
Error: Database connection timeout

[Retry Task] [View Logs]
```

---

## 🧪 Testing

### Test 1: Integration Tests

```bash
npm run test:slack
```

**Tests**:
- ✅ Slack authentication
- ✅ Webhook functionality
- ✅ Endpoint availability
- ✅ Error handling

### Test 2: Workflow Test

```bash
npm run test:slack-workflow
```

**Tests**:
- ✅ Endpoint availability
- ✅ Slack authentication
- ✅ Webhook posting
- ✅ Script availability

### Test 3: Manual Testing

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Start worker** (in another terminal):
   ```bash
   npm run worker:orchestrator
   ```

3. **Test in Slack**:
   - Type: `/dealershipai status test-dealer`
   - Click: "Run Schema Fix" button
   - Watch: Message updates in real-time

---

## 🚀 Production Deployment

### 1. Set Environment Variables in Vercel

1. Go to Vercel dashboard
2. **Settings** → **Environment Variables**
3. Add all required variables
4. **Redeploy**

### 2. Deploy Worker

**Option A: Vercel Cron Jobs** (for scheduled tasks)
- Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/jobs/orchestrator",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option B: Separate Worker Service**
- Deploy worker as separate service
- Use PM2 or systemd for process management
- Keep running 24/7

### 3. Monitor

- Check worker logs
- Monitor Slack channel for updates
- Verify message updates work
- Check error rates

---

## 📝 Troubleshooting

### Issue: Messages not updating

**Check**:
- ✅ `SLACK_BOT_TOKEN` is set and valid
- ✅ Worker is running
- ✅ Orchestrator is calling update endpoint
- ✅ Slack context is being passed to jobs

**Debug**:
```bash
# Check worker logs
npm run worker:orchestrator

# Check endpoint
curl -X POST http://localhost:3000/api/slack/update \
  -H "Content-Type: application/json" \
  -d '{"channel":"C123","ts":"123.456","status":"completed","task":"test","dealer":"test"}'
```

### Issue: "Invalid signature" errors

**Solution**:
- Verify `SLACK_SIGNING_SECRET` is correct
- Ensure raw body is preserved (not parsed as JSON first)
- Check timestamp is within 5 minutes

### Issue: Worker not processing jobs

**Check**:
- ✅ Redis connection is configured
- ✅ Queue exists and has jobs
- ✅ Worker is connected to correct queue
- ✅ Jobs have correct data structure

---

## ✅ Checklist

### Configuration
- [ ] `SLACK_BOT_TOKEN` configured
- [ ] `SLACK_SIGNING_SECRET` configured
- [ ] `SLACK_WEBHOOK_URL` configured
- [ ] `NEXT_PUBLIC_APP_URL` set
- [ ] Environment variables set in Vercel

### Testing
- [ ] Integration tests pass (`npm run test:slack`)
- [ ] Workflow tests pass (`npm run test:slack-workflow`)
- [ ] Manual test in Slack successful
- [ ] Message updates work in real-time

### Deployment
- [ ] Worker deployed (or scheduled)
- [ ] Environment variables set in production
- [ ] Monitoring set up
- [ ] Error alerts configured

---

## 📚 Related Documentation

- `ENV_VARIABLES_SLACK.md` - Environment variables guide
- `SLACK_INTEGRATION_SETUP.md` - Initial setup guide
- `SLACK_REAL_TIME_UPDATES.md` - Update system details
- `lib/jobs/orchestrator-worker.ts` - Worker implementation

---

**Status**: ✅ **READY FOR PRODUCTION**

**Last Updated**: November 4, 2025

