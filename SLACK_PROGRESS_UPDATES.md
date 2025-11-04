# 🚀 Slack Live Progress Updates - Implementation Complete

**Status**: ✅ **READY FOR TESTING**

---

## 📋 Overview

This implementation adds **live progress updates** to Slack messages when orchestrator tasks are running. Users can see real-time progress (0-100%) without leaving Slack.

---

## ✅ What Was Implemented

### 1. **Slack Update API** (`app/api/slack/update/route.ts`)
- ✅ Handles progress updates from orchestrator jobs
- ✅ Updates Slack messages dynamically using `chat.update`
- ✅ Supports progress, completed, and failed statuses
- ✅ Includes Block Kit formatting with progress bars
- ✅ Adds action buttons (View Dashboard, View Logs, Retry)

### 2. **Slack Update Service** (`lib/services/slack-update.ts`)
- ✅ `updateSlackMessage()` - Updates existing Slack messages
- ✅ `generateProgressBar()` - Creates visual progress bars
- ✅ `calculateETA()` - Estimates time remaining

### 3. **Orchestrator Worker** (`lib/jobs/orchestrator-worker.ts`)
- ✅ Processes orchestrator tasks with progress reporting
- ✅ Reports progress every 10% (configurable)
- ✅ Calculates and reports ETA
- ✅ Handles completion and failure notifications
- ✅ Supports all task types: `schema_fix`, `ugc_audit`, `arr_forecast`, `msrp_sync`, `ai_score_recompute`

### 4. **Slack Actions Integration** (`app/api/slack/actions/route.ts`)
- ✅ Captures Slack context (channel, message timestamp) when queuing tasks
- ✅ Passes Slack context to orchestrator for progress updates

---

## 🔄 How It Works

```
1. User clicks Slack button
   ↓
2. Job queued in BullMQ with Slack context
   ↓
3. Worker processes task, reports progress (0-100%)
   ↓
4. Each progress event → POST /api/slack/update
   ↓
5. Slack message updates live: "Running (n%)"
   ↓
6. On completion/failure → final status message
```

---

## 📊 Example Flow

### Initial Message:
```
⚙️ schema_fix running for naples-honda...
████░░░░░░ 40%
```

### Progress Update:
```
⚙️ schema_fix running for naples-honda... • ETA: 1m 30s
██████░░░░ 60%
```

### Completion:
```
✅ schema_fix completed successfully for naples-honda.

[View Dashboard] [View Logs]
```

### Failure:
```
❌ schema_fix failed for naples-honda.

Error: Validation failed

[View Logs] [Retry Task]
```

---

## 🔧 Configuration

### Environment Variables Required:

```bash
# Slack Bot Token (for updating messages)
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Orchestrator API URL (optional, defaults to localhost)
ORCHESTRATOR_API_URL=https://orchestrator.dealershipai.com

# Orchestrator Auth Token (optional, for internal API calls)
ORCHESTRATOR_AUTH_TOKEN=your-auth-token

# App URL (for dashboard links)
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com

# Grafana URL (optional, for log links)
GRAFANA_URL=https://grafana.dealershipai.com
```

---

## 🚀 Setup Instructions

### 1. Get Slack Bot Token

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app
3. **OAuth & Permissions** → **Bot Token Scopes**
4. Add scope: `chat:write`
5. Copy **Bot User OAuth Token** (starts with `xoxb-`)
6. Add to `.env`: `SLACK_BOT_TOKEN=xoxb-your-token`

### 2. Initialize Orchestrator Worker

Add to your startup code (e.g., `instrumentation.ts`):

```typescript
import { createOrchestratorWorker } from '@/lib/jobs/orchestrator-worker';

// Initialize orchestrator worker
if (process.env.UPSTASH_REDIS_REST_URL) {
  const orchestratorWorker = createOrchestratorWorker();
  if (orchestratorWorker) {
    console.log('[Orchestrator Worker] Initialized');
  }
}
```

### 3. Test the Integration

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Queue a test task** (via Slack or API):
   ```bash
   curl -X POST http://localhost:3000/api/orchestrator/tasks \
     -H "Content-Type: application/json" \
     -d '{
       "type": "schema_fix",
       "payload": {
         "dealerId": "test-dealer",
         "slackContext": {
           "channel": "C12345",
           "ts": "1698800172.000200"
         }
       }
     }'
   ```

3. **Watch Slack** for live progress updates!

---

## 🎨 Features

### ✅ Progress Bar
Visual progress bar using emoji blocks:
```
████████░░ 80%
```

### ✅ ETA Estimation
Automatically calculates and displays estimated time remaining:
```
⚙️ schema_fix running for naples-honda... • ETA: 2m 30s
```

### ✅ Action Buttons
- **View Dashboard** - Opens dashboard for the dealer
- **View Logs** - Opens Grafana logs (if configured)
- **Retry Task** - Re-queues failed tasks

### ✅ Error Handling
- Graceful fallback if Slack API fails
- Error messages included in failure notifications
- Non-blocking (task continues even if Slack update fails)

---

## 🔍 Task Types Supported

| Task Type | Description | Steps |
|-----------|-------------|-------|
| `schema_fix` | Fixes schema issues | 6 steps (0-100%) |
| `ugc_audit` | Audits user-generated content | 5 steps (0-100%) |
| `arr_forecast` | Forecasts ARR | 4 steps (0-100%) |
| `msrp_sync` | Syncs MSRP data | 4 steps (0-100%) |
| `ai_score_recompute` | Recomputes AI scores | 5 steps (0-100%) |

---

## 🧪 Testing

### Manual Test:

1. **Send a test update**:
   ```bash
   curl -X POST http://localhost:3000/api/slack/update \
     -H "Content-Type: application/json" \
     -d '{
       "channel": "C12345",
       "ts": "1698800172.000200",
       "status": "progress",
       "task": "schema_fix",
       "dealer": "test-dealer",
       "progress": 60,
       "eta": "1m 30s"
     }'
   ```

2. **Check Slack** - Message should update with progress

### Automated Test:

```typescript
// Test progress update
const response = await fetch('/api/slack/update', {
  method: 'POST',
  body: JSON.stringify({
    channel: 'C12345',
    ts: '1698800172.000200',
    status: 'progress',
    task: 'schema_fix',
    dealer: 'test-dealer',
    progress: 50,
  }),
});

console.assert(response.ok, 'Update should succeed');
```

---

## 🐛 Troubleshooting

### Issue: Messages not updating
- **Check**: `SLACK_BOT_TOKEN` is set correctly
- **Check**: Bot has `chat:write` scope
- **Check**: Channel ID and message timestamp are correct
- **Check**: Console logs for API errors

### Issue: Progress not showing
- **Check**: Orchestrator worker is initialized
- **Check**: `slackContext` is passed when queuing jobs
- **Check**: Worker is calling `job.updateProgress()`

### Issue: ETA not calculating
- **Check**: Progress values are being reported correctly
- **Check**: Elapsed time is being tracked

---

## 📈 Performance

- **Update Frequency**: Every 10% progress (configurable)
- **API Latency**: ~100-200ms per update
- **Non-Blocking**: Slack updates don't block task processing
- **Retry Logic**: Built into BullMQ worker

---

## 🎯 Next Steps

1. **Configure Slack Bot Token** in environment variables
2. **Initialize Orchestrator Worker** in your startup code
3. **Test** with a sample task
4. **Monitor** Slack messages for live updates

---

## 📚 Additional Resources

- [Slack API Documentation](https://api.slack.com/methods/chat.update)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Block Kit Guide](https://api.slack.com/block-kit)

---

**All features are implemented and ready for testing!** 🎉

