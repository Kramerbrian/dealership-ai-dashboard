# Production API Endpoints Documentation

## Overview

This document describes the production-ready API endpoints for telemetry, alerts, and Fix-Now pipeline functionality.

**Base URL**: `https://your-domain.com/api` (or `http://localhost:3000/api` for development)

**Authentication**: All endpoints require tenant isolation via `x-tenant-id` header or session-based auth.

---

## Telemetry Endpoints

### POST `/api/telemetry/log`

Logs telemetry events to Supabase for analytics and monitoring.

**Request Headers:**
```
Content-Type: application/json
x-tenant-id: <tenant-id> (optional, if using header-based auth)
```

**Request Body:**
```json
{
  "name": "event_name",
  "meta": {
    "key": "value",
    "custom": "data"
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (tenant isolation failed)
- `500` - Server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/telemetry/log \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: your-tenant-id" \
  -d '{
    "name": "button_click",
    "meta": {
      "button": "fix_it",
      "page": "diagnostics"
    }
  }'
```

**Storage:**
Events are stored in Supabase `telemetry_events` table with:
- `tenant_id` - Tenant identifier
- `event_name` - Event name
- `event_metadata` - JSON metadata
- `created_at` - Timestamp

---

## Alert Endpoints

### POST `/api/alerts/evaluate`

Evaluates metrics against alert rules and sends Slack notifications.

**Request Headers:**
```
Content-Type: application/json
x-tenant-id: <tenant-id>
```

**Request Body:**
```json
{
  "scsPct": 75,
  "topMissingField": "offers.availability",
  "gcs": {
    "carmax": 15.2,
    "yours": 6.1,
    "segment": "midsize SUV"
  },
  "fiveXX24h": 0
}
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "scs_floor",
      "notify": ["#seo-ops@slack", "gm@dealer.com"],
      "text": "SCS dropped to 75. Top fix: offers.availability"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

**Alert Rules:**
1. **scs_floor**: Triggers when `scsPct < 80`
2. **ai_visibility_gap**: Triggers when `gcs.carmax >= 2 * gcs.yours`
3. **serve_errors**: Triggers when `fiveXX24h > 3`

**Slack Integration:**
- Automatically sends notifications to channels specified in `notify` array
- Channels must include `@slack` suffix (e.g., `#seo-ops@slack`)
- Requires `SLACK_WEBHOOK_URL` environment variable

**Example:**
```bash
curl -X POST http://localhost:3000/api/alerts/evaluate \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: your-tenant-id" \
  -d '{
    "scsPct": 75,
    "topMissingField": "offers.availability"
  }'
```

---

## Fix-Now Pipeline Endpoints

### POST `/api/schema/fix`

Queues a schema fix job via BullMQ.

**Request Headers:**
```
Content-Type: application/json
x-tenant-id: <tenant-id>
```

**Request Body:**
```json
{
  "url": "https://example.com/inventory/vehicle-123",
  "field": "offers.availability",
  "value": "InStock"
}
```

**Response:**
```json
{
  "accepted": true,
  "jobId": "schema-fix-1234567890",
  "message": "Schema fix queued successfully",
  "estimatedCompletion": "2-5 minutes"
}
```

**Status Codes:**
- `202` - Accepted (job queued)
- `400` - Bad request (missing fields)
- `401` - Unauthorized
- `500` - Server error

**Job Processing:**
- Job is queued in BullMQ with high priority
- Worker processes job asynchronously
- Updates schema JSON-LD on target URL
- Reprobes and updates SCS/RI on completion

**Example:**
```bash
curl -X POST http://localhost:3000/api/schema/fix \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: your-tenant-id" \
  -d '{
    "url": "https://example.com/inventory",
    "field": "offers.availability",
    "value": "InStock"
  }'
```

---

### POST `/api/jobs/reprobe`

Queues a reprobe job to refresh metrics.

**Request Headers:**
```
Content-Type: application/json
x-tenant-id: <tenant-id>
```

**Request Body:**
```json
{
  "scope": "schema",
  "url": "https://example.com/inventory" // optional
}
```

**Scope Options:**
- `"schema"` - Reprobes schema validation
- `"cwv"` - Reprobes Core Web Vitals
- `"crawl"` - Reprobes crawl errors

**Response:**
```json
{
  "accepted": true,
  "jobId": "reprobe-1234567890",
  "received": {
    "scope": "schema"
  }
}
```

**Status Codes:**
- `202` - Accepted (job queued)
- `401` - Unauthorized
- `500` - Server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/jobs/reprobe \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: your-tenant-id" \
  -d '{
    "scope": "schema"
  }'
```

---

## Data Source Endpoints

### GET `/api/data/pulse`

Fetches real-time visibility metrics from Pulse service.

**Query Parameters:**
- `scope` - `"all"` | `"schema"` | `"cwv"` | `"crawl"` (default: `"all"`)

**Response:**
```json
{
  "tenantId": "tenant-123",
  "scope": "all",
  "timestamp": "2024-01-15T10:30:00Z",
  "metrics": {
    "visibility": 0.72,
    "proximity": 0.68,
    "authority": 0.85,
    "scsPct": 88,
    "gcs": {
      "carmax": 12.5,
      "yours": 6.2,
      "segment": "midsize SUV"
    },
    "fiveXX24h": 0
  },
  "sources": ["Cars.com", "CarMax", "AutoTrader"]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### GET `/api/data/ati`

Fetches trust and authority metrics from ATI service.

**Response:**
```json
{
  "tenantId": "tenant-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "ati": {
    "score": 87.3,
    "trust": 0.85,
    "authority": 0.82,
    "reputation": 0.89
  },
  "trends": {
    "weekOverWeek": 2.1,
    "monthOverMonth": 5.3
  }
}
```

---

### GET `/api/data/cis`

Fetches citation intelligence from CIS service.

**Query Parameters:**
- `segment` - Vehicle segment filter (default: `"all"`)

**Response:**
```json
{
  "tenantId": "tenant-123",
  "segment": "midsize SUV",
  "timestamp": "2024-01-15T10:30:00Z",
  "citations": {
    "total": 1247,
    "bySource": {
      "Cars.com": 342,
      "CarMax": 289
    },
    "generative": {
      "chatgpt": 45,
      "perplexity": 38
    }
  },
  "voi": {
    "echoPark": 0.38,
    "carmax": 0.42
  }
}
```

---

### GET `/api/data/probe`

Fetches crawl and validation data from Probe service.

**Query Parameters:**
- `type` - `"all"` | `"crawl"` | `"schema"` | `"cwv"` (default: `"all"`)

**Response:**
```json
{
  "tenantId": "tenant-123",
  "type": "all",
  "timestamp": "2024-01-15T10:30:00Z",
  "crawl": {
    "errors": [],
    "totalUrls": 1247,
    "crawled": 1198,
    "successRate": 0.961
  },
  "schema": {
    "scsPct": 88,
    "missingFields": [],
    "malformedFields": []
  },
  "cwv": {
    "lcp_ms": 2300,
    "cls": 0.08,
    "inp_ms": 180
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (tenant isolation failed)
- `500` - Internal Server Error

**Error Handling Features:**
- Graceful fallbacks (telemetry logs to console if Supabase unavailable)
- Non-blocking Slack notifications (fire-and-forget)
- Job queue fallbacks (returns job ID even if queue fails)

---

## Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Optional:**
- `SLACK_WEBHOOK_URL` - Slack webhook for alerts
- `UPSTASH_REDIS_REST_URL` - Redis URL for BullMQ
- `UPSTASH_REDIS_REST_TOKEN` - Redis token for BullMQ

---

## Testing

Use the provided test script:

```bash
npm run test:endpoints
# or
tsx scripts/test-production-endpoints.ts
```

The script automatically:
- Handles authentication
- Tests all endpoints
- Reports success/failure
- Shows detailed results

---

## Rate Limiting

Endpoints are rate-limited per tenant:
- Telemetry: 100 requests/minute
- Alerts: 10 requests/minute
- Fix-Now: 20 requests/minute

---

## Support

For issues or questions, contact the development team or check the main documentation.

