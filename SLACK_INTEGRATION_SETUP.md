# 🧩 Slack Integration Setup Guide

## ✅ Implementation Complete

**Status**: ✅ **READY FOR CONFIGURATION**

---

## 📋 What Was Created

### 1. ✅ Slack Command Handler
**File**: `app/api/slack/command/route.ts`

**Features**:
- `/dealershipai status <dealer>` - Shows precision & KPI with action buttons
- `/dealershipai arr <dealer>` - Shows hourly ARR gain
- Help message for unknown commands
- Slack signature verification
- Interactive buttons for orchestrator actions

### 2. ✅ Slack Actions Handler
**File**: `app/api/slack/actions/route.ts`

**Features**:
- Handles button clicks from Slack messages
- Verifies Slack signatures
- Maps actions to orchestrator tasks
- Calls orchestrator API
- Returns success/error responses

### 3. ✅ Prometheus Utilities
**File**: `lib/slack/prometheus.ts`

**Functions**:
- `queryPrometheus()` - Query Prometheus metrics
- `getDealerPrecision()` - Get GNN precision for dealer
- `getDealerARRGain()` - Get ARR gain for dealer
- `getDealerMetrics()` - Get all metrics at once

### 4. ✅ Orchestrator Client
**File**: `lib/slack/orchestrator.ts`

**Functions**:
- `queueOrchestratorTask()` - Queue a task in orchestrator
- `getOrchestratorTaskStatus()` - Get task status

---

## 🔧 Slack App Configuration

### Step 1: Create/Update Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create new app or select existing
3. **App Name**: DealershipAI Bot

### Step 2: Configure Slash Command

1. **Slash Commands** → **Create New Command**
2. **Command**: `/dealershipai`
3. **Request URL**: `https://YOUR_DOMAIN/api/slack/command`
4. **Short Description**: "Get DealerAI status or KPIs"
5. **Usage Hint**: `status <dealer> or arr <dealer>`

### Step 3: Enable Interactivity

1. **Interactivity & Shortcuts** → Toggle **ON**
2. **Request URL**: `https://YOUR_DOMAIN/api/slack/actions`
3. **Options Load URL**: (leave blank for now)

### Step 4: Bot Token Scopes

Add these scopes:
- `commands` - Slash commands
- `chat:write` - Send messages
- `chat:write.interactive` - Interactive buttons
- `users:read` - Read user info
- `users:read.email` - Read user emails

### Step 5: Install App

1. **Install App to Workspace**
2. Copy **Bot User OAuth Token** (`xoxb-...`)
3. Copy **Signing Secret**

---

## 🔐 Environment Variables

Add to your `.env` file:

```bash
# Slack Configuration
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Prometheus (optional, defaults to localhost)
PROMETHEUS_URL=http://prometheus:9090

# Orchestrator (optional, defaults to localhost)
ORCHESTRATOR_URL=http://orchestrator:3001
ORCHESTRATOR_AUTH_TOKEN=your_auth_token_if_needed
```

---

## 🧪 Testing

### Test Command Endpoint

```bash
# Test with curl (will fail signature, but checks route)
curl -X POST https://YOUR_DOMAIN/api/slack/command \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=status naples-honda"
```

### Test Actions Endpoint

```bash
# Test with curl (will fail signature, but checks route)
curl -X POST https://YOUR_DOMAIN/api/slack/actions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "payload=..."
```

### Test in Slack

1. Install app to your workspace
2. Type: `/dealershipai status naples-honda`
3. Should see metrics with action buttons
4. Click a button (e.g., "Run Schema Fix")
5. Should see success message

---

## 📊 Usage Examples

### Status Command

```
/dealershipai status naples-honda
```

**Response:**
```
Dealer: naples-honda
GNN Precision: 92.4%

[Run Schema Fix] [Run UGC Audit] [Forecast ARR]
```

### ARR Command

```
/dealershipai arr naples-honda
```

**Response:**
```
Dealer: naples-honda
ARR Gain (1h): $4,820.11
```

### Action Buttons

When user clicks "Run Schema Fix":
- Calls `/api/slack/actions`
- Verifies signature
- Queues task in orchestrator
- Returns success message

---

## 🔒 Security Features

### ✅ Implemented

1. **Signature Verification**: All requests verified with HMAC-SHA256
2. **Timestamp Check**: Prevents replay attacks (5 minute window)
3. **Constant-Time Comparison**: Prevents timing attacks
4. **HTTPS Only**: Should be deployed with HTTPS

### ⚠️ Security Notes

- **Never expose** `SLACK_SIGNING_SECRET` in client-side code
- **Always use HTTPS** in production
- **Validate** all user inputs
- **Rate limit** endpoints if needed

---

## 🚀 Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Deploy application
3. Update Slack app URLs to production domain
4. Reinstall Slack app to refresh permissions

### Self-Hosted Deployment

1. Set environment variables
2. Deploy with HTTPS (required by Slack)
3. Update Slack app URLs
4. Test endpoints

---

## 🐛 Troubleshooting

### Issue: "Invalid signature"

**Solution**: 
- Check `SLACK_SIGNING_SECRET` is correct
- Ensure raw body is preserved (not parsed as JSON first)
- Verify timestamp is within 5 minutes

### Issue: "Unknown action"

**Solution**:
- Check action name matches task map
- Verify payload structure

### Issue: "Orchestrator connection failed"

**Solution**:
- Check `ORCHESTRATOR_URL` is correct
- Verify orchestrator is running
- Check network connectivity
- Verify auth token if required

---

## 📝 Next Steps

### Optional Enhancements

1. **Message Updates**: Update Slack message when task completes
2. **Role-Based Actions**: Check user permissions before allowing actions
3. **Task Status Updates**: Poll orchestrator and update message with progress
4. **Natural Language**: Add GPT integration for conversational queries
5. **Thread Support**: Post updates in threads

---

## ✅ Status

**Implementation**: ✅ **COMPLETE**
**Configuration**: ⏳ **REQUIRES SLACK APP SETUP**
**Testing**: ⏳ **REQUIRES SLACK WORKSPACE**

**Ready for**: Production deployment after Slack app configuration

---

**Created**: November 4, 2025

