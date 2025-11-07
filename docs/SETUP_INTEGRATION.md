# Integration Setup Guide

## ✅ Service Files Created

All service files have been created and are ready to use:

### Data Sources
- ✅ `lib/data-sources/pulse.ts` - Pulse API client
- ✅ `lib/data-sources/ati.ts` - ATI API client
- ✅ `lib/data-sources/cis.ts` - CIS API client
- ✅ `lib/data-sources/probe.ts` - Probe API client

### Services
- ✅ `lib/alerts/slack.ts` - Slack webhook service
- ✅ `lib/telemetry/storage.ts` - Telemetry storage
- ✅ `lib/jobs/processors.ts` - BullMQ job processors
- ✅ `lib/monitoring/queue-monitor.ts` - Queue monitoring

### Updated Files
- ✅ `backend/engine/queue.ts` - Wired to BullMQ
- ✅ `app/api/schema/fix/route.ts` - Full implementation
- ✅ `lib/jobs/worker.ts` - Includes new processors

## 🚀 Setup Steps

### 1. Environment Variables

Copy `.env.example.integration` to `.env.local` and fill in values:

```bash
# Redis (Required for BullMQ)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Data Sources (Optional - will use mocks if not set)
PULSE_API_URL=https://api.pulse.example.com
PULSE_API_KEY=your-key
ATI_API_URL=https://api.ati.example.com
ATI_API_KEY=your-key
CIS_API_URL=https://api.cis.example.com
CIS_API_KEY=your-key
PROBE_API_URL=https://api.probe.example.com
PROBE_API_KEY=your-key

# Slack (Optional - will skip if not set)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Set Up Redis (Upstash)

1. Go to https://console.upstash.com/
2. Create a new Redis database
3. Copy REST URL and REST Token
4. Add to `.env.local`

**Alternative**: Use self-hosted Redis with `REDIS_URL=redis://localhost:6379`

### 3. Create Database Tables

Run migration for new tables:

```bash
npx prisma migrate dev -n "add_telemetry_and_jobs"
```

Or manually create:

```sql
-- Telemetry events
CREATE TABLE IF NOT EXISTS telemetry_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT
);

CREATE INDEX idx_telemetry_tenant ON telemetry_events(tenant_id);
CREATE INDEX idx_telemetry_type ON telemetry_events(event_type);
CREATE INDEX idx_telemetry_timestamp ON telemetry_events(timestamp);

-- Schema fixes
CREATE TABLE IF NOT EXISTS schema_fixes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  field TEXT NOT NULL,
  value TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  fixed_at TIMESTAMPTZ,
  job_id TEXT
);

CREATE INDEX idx_schema_fixes_tenant ON schema_fixes(tenant_id);

-- Reprobe jobs
CREATE TABLE IF NOT EXISTS reprobe_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  job_id TEXT
);

CREATE INDEX idx_reprobe_tenant ON reprobe_jobs(tenant_id);

-- Crawl jobs
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  urls JSONB,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  job_id TEXT
);

CREATE INDEX idx_crawl_tenant ON crawl_jobs(tenant_id);
```

### 4. Initialize Worker

The worker should auto-initialize via `instrumentation.ts`. Verify it's running:

```bash
# Check logs for:
[Worker] Background job worker initialized
```

If not, manually initialize in your app startup:

```typescript
import { initializeJobWorker } from '@/lib/jobs/worker';

// In your app initialization
initializeJobWorker();
```

### 5. Test Integration Points

#### Test Queue
```bash
curl -X POST http://localhost:3000/api/schema/fix \
  -H "Content-Type: application/json" \
  -d '{"url": "/test", "field": "offers.availability", "value": "InStock"}'
```

#### Test Queue Monitoring
```bash
curl http://localhost:3000/api/monitoring/queue
```

#### Test Data Sources
The data sources will automatically use mocks if APIs aren't configured. To test with real APIs:

1. Set environment variables
2. Call API routes that use data sources
3. Check logs for API calls

## 📊 Monitoring

### Queue Health
Visit `/api/monitoring/queue` to check:
- Queue statistics
- Health status
- Issues detected

### Telemetry
Query telemetry events:

```typescript
import { getTelemetryStats } from '@/lib/telemetry/storage';

const stats = await getTelemetryStats(
  tenantId,
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  new Date()
);
```

### Slack Alerts
Alerts are automatically sent for:
- Schema fix completions/failures
- Queue health issues
- High-impact crawl errors

## 🔧 Troubleshooting

### Queue Not Processing
1. Check Redis connection: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Verify worker initialized: Check logs for `[Worker] Background job worker initialized`
3. Check queue stats: `/api/monitoring/queue`

### Data Sources Returning Mocks
1. Verify environment variables are set
2. Check API keys are valid
3. Review logs for API errors
4. Services gracefully fall back to mocks on error

### Slack Not Sending
1. Verify `SLACK_WEBHOOK_URL` is set
2. Test webhook URL manually
3. Check logs for Slack errors
4. Alerts fail silently (won't break the app)

### Telemetry Not Storing
1. Verify `telemetry_events` table exists
2. Check Supabase connection
3. Review logs for database errors
4. Telemetry failures are non-critical

## ✅ Integration Complete

Once setup is complete:
- ✅ Jobs queue to BullMQ
- ✅ Workers process jobs
- ✅ Data sources fetch real data (or use mocks)
- ✅ Slack alerts send notifications
- ✅ Telemetry stores events
- ✅ Queue monitoring tracks health

## Next Steps

1. **Configure APIs**: Set up real data source APIs
2. **Test End-to-End**: Test full workflow from UI → Queue → Processing → Alerts
3. **Monitor**: Set up dashboards for queue health and telemetry
4. **Scale**: Adjust worker concurrency based on load

