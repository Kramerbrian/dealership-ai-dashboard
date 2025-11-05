# Redis Pub/Sub Implementation Summary

## ✅ Completed Tasks

### 1. Fixed Redis Pub/Sub Bus Implementation for Redis v5+
- **File**: `lib/events/bus.ts`
- **Changes**: Updated subscribe pattern to use Redis v5+ API:
  - Uses `sub.on('message', ...)` handler pattern
  - Properly subscribes to channels with `await sub.subscribe()`
  - Maintains safe fallback to in-memory EventEmitter if Redis is unavailable

### 2. Updated SSE Endpoint to Listen to Event Bus
- **File**: `app/api/realtime/events/route.ts`
- **Changes**:
  - Changed runtime from `edge` to `nodejs` (required for EventEmitter access)
  - Added event bus listeners for `ai-scores:update` and `msrp:change` channels
  - Implements proper cleanup on client disconnect
  - Supports dealerId filtering for AI score updates
  - Includes heartbeat to keep connection alive

### 3. Added Publish Calls to MSRP Sync
- **File**: `lib/jobs/orchestrator-worker.ts` (processMSRPSync function)
- **Changes**:
  - Publishes MSRP change events for each price change detected
  - Limits to 10 events per sync to prevent overwhelming the system
  - Includes VIN, old/new prices, and delta percentage

### 4. Added Publish Calls to Score Engine
- **Files**:
  - `lib/jobs/ai-score-calculator.ts` (processAIScoreCalculation)
  - `lib/jobs/orchestrator-worker.ts` (processAIScoreRecompute)
- **Changes**:
  - Publishes AI score update events after calculation
  - Includes VIN, dealerId, reason, and score metrics (AVI, ATI, CIS)
  - Batch processing support for score recompute (up to 10 events)

### 5. Created Redis Health Check Endpoint
- **File**: `app/api/diagnostics/redis/route.ts`
- **Features**:
  - Checks if REDIS_URL is configured
  - Verifies Redis module availability
  - Reports event bus initialization status
  - Returns status: `configured` or `fallback-local`

### 6. Redis Package Already Installed
- **File**: `package.json`
- **Status**: Redis v5.9.0 is already in dependencies ✅

## Usage

### Environment Variable
```bash
export REDIS_URL="redis://user:pass@host:6379/0"
# or for Upstash
export REDIS_URL="rediss://default:password@host.upstash.io:6379"
```

### Testing

1. **Check Redis Status**:
   ```bash
   curl http://localhost:3000/api/diagnostics/redis | jq
   ```

2. **Test SSE Stream**:
   ```bash
   curl -N "http://localhost:3000/api/realtime/events?dealerId=TEST"
   ```

3. **Trigger MSRP Sync** (via orchestrator):
   ```bash
   curl -X POST http://localhost:3000/api/orchestrate \
     -H "Content-Type: application/json" \
     -d '{"task": "msrp_sync", "dealerId": "TEST"}'
   ```

4. **Trigger AI Score Recompute**:
   ```bash
   curl -X POST http://localhost:3000/api/orchestrate \
     -H "Content-Type: application/json" \
     -d '{"task": "ai_score_recompute", "dealerId": "TEST"}'
   ```

## Architecture

```
┌─────────────────┐
│  MSRP Sync      │───publish("msrp")───┐
│  Score Engine   │───publish("ai")─────┤
└─────────────────┘                     │
                                         ▼
                                    ┌─────────┐
                                    │  Redis  │
                                    │ Pub/Sub │
                                    └─────────┘
                                         │
                                         ▼
                                    ┌─────────┐
                                    │  Event  │
                                    │  Bus    │
                                    └─────────┘
                                         │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
            │  SSE Stream │   │  Other       │   │  Future      │
            │  (Node.js)  │   │  Consumers   │   │  Consumers   │
            └──────────────┘   └──────────────┘   └──────────────┘
```

## Fallback Behavior

If `REDIS_URL` is not set:
- ✅ Uses in-memory EventEmitter (single-instance mode)
- ✅ All functionality works locally
- ✅ No Redis dependency required for development
- ⚠️ Multi-instance deployments require Redis for event distribution

## Event Types

### AI Score Update Event
```typescript
{
  vin: string;
  dealerId?: string;
  reason: string;
  avi: number;  // AI Visibility Index
  ati: number;  // AI Trust Index
  cis: number;  // Competitive Intelligence Score
  ts: string;   // ISO timestamp
}
```

### MSRP Change Event
```typescript
{
  vin: string;
  old?: number | null;
  new: number;
  deltaPct?: number | null;
  ts: string;
}
```

## Production Deployment

1. **Set REDIS_URL** in Vercel environment variables
2. **Deploy** - Redis Pub/Sub will initialize automatically
3. **Verify** - Check `/api/diagnostics/redis` endpoint
4. **Monitor** - Watch logs for "[events] Redis Pub/Sub initialized successfully"

## Notes

- Multi-instance safe once Redis is configured
- Single-instance environments work with local emitter
- No changes needed to existing consumers
- Graceful degradation if Redis fails (falls back to local emit)

