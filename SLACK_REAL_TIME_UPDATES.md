# 🔄 Slack Real-Time Message Updates - Complete

## ✅ Implementation Summary

**Status**: ✅ **READY FOR USE**

---

## 📊 What Was Created

### 1. ✅ Slack Update Library

**File**: `lib/slack/update.ts`

**Functions**:
- `updateSlackMessage()` - Update Slack message via API
- `formatTaskStatusMessage()` - Format status messages
- `createTaskStatusBlocks()` - Create rich message blocks with progress bars and buttons

**Features**:
- Progress bars for running tasks
- Retry buttons for failed tasks
- Grafana links for completed tasks
- Rich formatting with emojis

### 2. ✅ Update API Route

**File**: `app/api/slack/update/route.ts`

**Endpoint**: `POST /api/slack/update`

**Accepts**:
```json
{
  "channel": "C12345",
  "ts": "1698800172.000200",
  "status": "running" | "completed" | "failed",
  "task": "schema_fix",
  "dealer": "naples-honda",
  "progress": 50,
  "error": "Optional error message",
  "taskId": "task-123",
  "grafanaUrl": "https://grafana.dealershipai.com/..."
}
```

### 3. ✅ Actions Route Enhanced

**File**: `app/api/slack/actions/route.ts` (updated)

**Changes**:
- Captures Slack context (channel, ts) from button clicks
- Sends context to orchestrator for status updates
- Immediately updates message to "running" status
- Orchestrator can call back to update status

### 4. ✅ Weekly Leaderboard Workflow

**Files**:
- `.github/workflows/weekly-leaderboard.yml` - GitHub Actions workflow
- `scripts/generate-leaderboard.js` - Generate leaderboard from database
- `scripts/post-leaderboard-to-slack.js` - Post to Slack

**Features**:
- Runs every Monday at 9 AM EST
- Generates top 10 dealers leaderboard
- Posts to Slack automatically
- Manual trigger via workflow_dispatch

---

## 🔧 Integration with Orchestrator

### Orchestrator Worker Hook

When a BullMQ job completes, call the update endpoint:

```typescript
import fetch from 'node-fetch';

worker.on('completed', async (job) => {
  const { slackContext, dealer, task } = job.data;

  if (slackContext?.channel && slackContext?.ts) {
    await fetch(`${process.env.APP_URL}/api/slack/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: slackContext.channel,
        ts: slackContext.ts,
        status: 'completed',
        task,
        dealer,
        taskId: job.id,
        grafanaUrl: `https://grafana.dealershipai.com/d/gnn-analytics?dealer=${dealer}`,
      }),
    });
  }
});

worker.on('failed', async (job, error) => {
  const { slackContext, dealer, task } = job.data;

  if (slackContext?.channel && slackContext?.ts) {
    await fetch(`${process.env.APP_URL}/api/slack/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: slackContext.channel,
        ts: slackContext.ts,
        status: 'failed',
        task,
        dealer,
        error: error.message,
        grafanaUrl: `https://grafana.dealershipai.com/d/gnn-analytics?dealer=${dealer}`,
      }),
    });
  }
});
```

### Progress Updates (Optional)

For long-running tasks, send progress updates:

```typescript
// During task execution
job.updateProgress(37); // 37% complete

// In worker
worker.on('progress', async (job, progress) => {
  const { slackContext, dealer, task } = job.data;

  if (slackContext?.channel && slackContext?.ts && progress > 0) {
    await fetch(`${process.env.APP_URL}/api/slack/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: slackContext.channel,
        ts: slackContext.ts,
        status: 'running',
        task,
        dealer,
        progress,
      }),
    });
  }
});
```

---

## 🎯 Message Lifecycle Examples

### Example 1: Successful Task

**1. User clicks "Run Schema Fix"**
```
⚙️ Task schema_fix queued for naples-honda via Orchestrator...
```

**2. Message updates immediately (via actions route)**
```
⚙️ Task schema_fix running for naples-honda... (0%)
```

**3. Progress updates (optional)**
```
⚙️ Task schema_fix running for naples-honda... (50%)
```

**4. Task completes (orchestrator callback)**
```
✅ Task schema_fix completed successfully for naples-honda.
Task ID: task-abc123
View in Grafana →
```

### Example 2: Failed Task

**1. User clicks button → Running**
```
⚙️ Task ugc_audit running for naples-honda... (0%)
```

**2. Task fails (orchestrator callback)**
```
❌ Task ugc_audit failed for naples-honda.
Error: Database connection timeout

[Retry Task] [View Logs]
```

---

## 📝 Environment Variables

Add to `.env`:

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_LEADERBOARD_CHANNEL=#ai-ops  # Optional, defaults to #ai-ops

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com

# Orchestrator (if needed)
ORCHESTRATOR_URL=http://orchestrator:3001
```

---

## 🧪 Testing

### Test Update Endpoint

```bash
curl -X POST http://localhost:3000/api/slack/update \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "C12345",
    "ts": "1698800172.000200",
    "status": "completed",
    "task": "schema_fix",
    "dealer": "naples-honda",
    "taskId": "test-123"
  }'
```

### Test Leaderboard Generation

```bash
# Generate leaderboard
node scripts/generate-leaderboard.js

# Post to Slack
SLACK_WEBHOOK_URL=your_webhook node scripts/post-leaderboard-to-slack.js
```

---

## 📊 Weekly Leaderboard Features

### Automatic Schedule
- Runs every Monday at 9:00 AM EST (13:00 UTC)
- Can be manually triggered via GitHub Actions

### Output
- Markdown file: `leaderboards/leaderboard-w{week}-{year}.md`
- JSON file: `leaderboards/leaderboard-w{week}-{year}.json`
- Slack post: Formatted message to #ai-ops (or configured channel)

### Metrics Included
- AI Visibility Score (ranked)
- Revenue at Risk
- Trend (7-day change)
- Top 10 dealers

---

## 🚀 Next Steps

### 1. Configure Environment
- Add `SLACK_BOT_TOKEN` to environment
- Set `SLACK_WEBHOOK_URL` for leaderboard posts
- Configure `NEXT_PUBLIC_APP_URL` for callbacks

### 2. Integrate with Orchestrator
- Update BullMQ workers to call update endpoint
- Add progress tracking if needed
- Test end-to-end flow

### 3. Test Workflow
- Test button clicks in Slack
- Verify message updates
- Test leaderboard generation

### 4. Optional Enhancements
- [ ] Progress bars with percentage
- [ ] Retry buttons for failed tasks
- [ ] Grafana links for completed tasks
- [ ] Task logs in Slack threads
- [ ] Multi-task tracking

---

## ✅ Status

**Implementation**: ✅ **COMPLETE**
**Integration**: ⏳ **REQUIRES ORCHESTRATOR SETUP**
**Testing**: ⏳ **READY FOR TESTING**

**Ready for**: Production use after orchestrator integration

---

**Created**: November 4, 2025

