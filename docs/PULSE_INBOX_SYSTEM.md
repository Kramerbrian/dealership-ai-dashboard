# Pulse Inbox System

## Overview

The Pulse Inbox system allows agentic automation to push actionable insights directly into the dashboard's Pulse snapshot. Agent tiles appear **above** baseline registry tiles, ensuring urgent insights are seen first.

## Architecture

### Redis Structure

```
pulse:inbox:${tenant}  →  List of JSON-encoded tile objects
```

Each tile in the inbox is a JSON object:
```json
{
  "key": "inbox_abc123",
  "title": "Agent Proposal",
  "kpi": "AI Visibility dropped 12%",
  "delta": "-12%",
  "actions": ["review", "fix"],
  "ts": 1701234567890,
  "severity": "high",
  "category": "visibility"
}
```

### API Endpoints

#### `GET /api/pulse/snapshot?tenant=${tenant}&role=${role}`

Returns merged snapshot with:
- **Agent tiles** (from `pulse:inbox:${tenant}`) - prepended first
- **Baseline tiles** (from registry + warehouse) - appended after

Response shape:
```json
{
  "ok": true,
  "snapshot": {
    "header": {
      "saved_month_usd": 34800,
      "risk_usd": 61200,
      "model": "ayv-2025.11.1",
      "last_update": "2025-11-06T..."
    },
    "tiles": [
      // Agent tiles first
      { "key": "inbox_abc123", "label": "Agent Proposal", ... },
      // Then baseline tiles
      { "key": "rar", "label": "Revenue at Risk", ... }
    ],
    "registry_version": "1.0",
    "timestamp": "...",
    "tenant": "default"
  }
}
```

#### `POST /api/pulse/inbox/push`

Push agent tiles into the inbox.

Request:
```json
{
  "tenant": "toyota-naples",
  "tile": {
    "title": "AI Visibility dropped 12%",
    "kpi": "Current: 78% (was 90%)",
    "delta": "-12%",
    "actions": ["review", "fix"],
    "severity": "high"
  }
}
```

Or batch:
```json
{
  "tenant": "toyota-naples",
  "tiles": [
    { "title": "Tile 1", ... },
    { "title": "Tile 2", ... }
  ]
}
```

## Usage Examples

### From CronJob / Automation Script

```bash
curl -X POST https://dealershipai.com/api/pulse/inbox/push \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "toyota-naples",
    "tile": {
      "title": "Spike in 500 errors detected",
      "kpi": "Error rate: 2.3% (threshold: 1%)",
      "delta": "+130%",
      "actions": ["review", "open_incident"],
      "severity": "high",
      "category": "errors"
    }
  }'
```

### From Node.js / TypeScript

```typescript
import { pushInboxTile } from '@/lib/pulse/inbox';

await pushInboxTile('toyota-naples', {
  title: 'AI Visibility dropped 12%',
  kpi: 'Current: 78% (was 90%)',
  delta: '-12%',
  actions: ['review', 'fix'],
  severity: 'high',
  category: 'visibility',
});
```

### From Agentic Orchestrator

```typescript
// In your orchestrator agent
if (anomalyDetected) {
  await pushInboxTile(tenantId, {
    title: `Anomaly: ${anomalyType}`,
    kpi: `Z-score: ${zScore.toFixed(2)}`,
    delta: `${changePercent}%`,
    actions: ['review', 'auto_fix'],
    severity: zScore > 3 ? 'high' : 'medium',
    category: anomalyType,
  });
}
```

## Registry System

Tiles are defined in `lib/pulse/registry.ts`:

```typescript
export const REGISTRY = {
  version: '1.0',
  roleOrders: {
    default: ['rar', 'oci', 'refund_delta', ...],
    gm: ['rar', 'oci', 'refund_delta'],
    marketing: ['freshness', 'cache_hit', ...],
  },
  tiles: {
    rar: {
      label: 'Revenue at Risk',
      units: 'usd',
      thresholds: { green: 10000, yellow: 50000 },
    },
    // ...
  },
};
```

## Tenant Strategy

### Option 1: Tenant = Namespace (Default)

```bash
# CronJob uses Kubernetes namespace
TENANT_ID=$(kubectl get namespace -o jsonpath='{.items[0].metadata.name}')
```

### Option 2: Explicit Tenant IDs

```yaml
# CronJob manifest
env:
  - name: TENANT_ID
    value: "toyota-naples"
```

The snapshot endpoint accepts `?tenant=${tenant}` or falls back to `default`.

## Tile Behavior

### Current: Prepend (Default)

Agent tiles appear **above** baseline tiles. Best for "urgent insight first."

### Future Options

- **Blend by severity**: Sort by severity → z-score → error_count
- **Separate section**: Dedicated "Agent Proposals" block

## Integration with Orchestrator

When your Kubernetes CronJob detects anomalies:

1. **Collect logs** → Parse for patterns
2. **Call agent** → `/v1/assist` endpoint analyzes
3. **Push tiles** → `POST /api/pulse/inbox/push`
4. **Dashboard updates** → Next snapshot fetch shows new tiles

## Limits

- **Max inbox size**: 50 tiles per tenant (auto-trimmed)
- **TTL**: None (tiles persist until cleared or trimmed)
- **Rate limiting**: Inherits from API rate limits

## Clearing Inbox

```typescript
import { clearInbox } from '@/lib/pulse/inbox';

await clearInbox('toyota-naples');
```

Or via Redis directly:
```bash
redis-cli DEL pulse:inbox:toyota-naples
```

