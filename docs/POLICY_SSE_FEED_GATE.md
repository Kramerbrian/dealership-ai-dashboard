# Policy Apply SSE & Feed Gate System

## Overview

This system provides real-time policy application with Server-Sent Events (SSE) progress streaming and a live feed gate status chip for the dashboard. It enables dealerships to apply compliance policies to their VDP inventory with full visibility into the process.

## Architecture

### Components

1. **Policy Apply API** (`/api/policy/apply`) - Applies policies to violations
2. **SSE Stream** (`/api/policy/apply/stream`) - Real-time progress updates
3. **Event Logging** (`policy_apply_events` table) - Persistent event storage
4. **Feed Gate Summary** (`/api/gate/summary`) - Live gate status
5. **Feed Gate Chip** - Dashboard component with CTA

### Database Schema

```sql
-- Policy Apply Events Table
CREATE TABLE policy_apply_events (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  kind text NOT NULL,            -- START, BLOCK, RELEASE, DONE, ERROR
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Syndication Gate Table (referenced by feed gate)
CREATE TABLE syndication_gate (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  vin text,
  blocked boolean DEFAULT false,
  severity integer,
  -- ... other fields
);
```

## API Endpoints

### Policy Apply

```bash
# Apply policy to violations
curl -X POST /api/policy/apply \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "00000000-0000-0000-0000-000000000000",
    "dryRun": false
  }'
```

**Response:**
```json
{
  "ok": true,
  "summary": {
    "blocks": 5,
    "releases": 12,
    "total": 17
  },
  "results": [...],
  "policyVersion": "current"
}
```

### SSE Stream

```bash
# Connect to real-time progress stream
curl -N /api/policy/apply/stream?tenantId=00000000-0000-0000-0000-000000000000
```

**SSE Events:**
```
event: open
data: ok

id: 1
event: START
data: {"policyVersion":"current","dryRun":false,"timestamp":"2024-01-01T00:00:00.000Z"}

id: 2
event: BLOCK
data: {"vin":"1HGBH41JXMN109186","rule":"PRICE_DELTA","severity":3}

id: 3
event: RELEASE
data: {"vin":"1HGBH41JXMN109187","rule":"PRICE_DELTA","severity":1}

id: 4
event: DONE
data: {"blocks":5,"releases":12,"total":17}

event: close
data: ok
```

### Feed Gate Summary

```bash
# Get gate status summary
curl /api/gate/summary?tenantId=00000000-0000-0000-0000-000000000000
```

**Response:**
```json
{
  "ok": true,
  "released": 150,
  "blocked": 5,
  "sev3": 2,
  "sev2": 2,
  "sev1": 1,
  "total": 155
}
```

## UI Components

### PolicyApplySSE Component

```tsx
import PolicyApplySSE from '@/app/components/panels/PolicyApplySSE';

<PolicyApplySSE tenantId="00000000-0000-0000-0000-000000000000" />
```

**Features:**
- Real-time event display
- Connection status indicator
- Event categorization with colors
- Automatic reconnection
- Event history (last 200 events)

### FeedGateChip Component

```tsx
import FeedGateChip from '@/app/components/FeedGateChip';

<FeedGateChip 
  tenantId="00000000-0000-0000-0000-000000000000" 
  onManage={() => router.push('/dashboard/approvals')} 
/>
```

**Features:**
- Live status polling (30s intervals)
- Color-coded status (green/red)
- Severity breakdown display
- One-click navigation to approvals
- Loading states

### DashboardHeader Integration

```tsx
import DashboardHeader from '@/app/components/DashboardHeader';

<DashboardHeader 
  tenantId="00000000-0000-0000-0000-000000000000"
  title="DealershipAI"
/>
```

## Event Types

### Policy Apply Events

| Event | Description | Payload |
|-------|-------------|---------|
| `START` | Policy application begins | `{policyVersion, dryRun, timestamp}` |
| `BLOCK` | VDP blocked by policy | `{vin, vdp_url, rule, severity, delta_price}` |
| `RELEASE` | VDP released by policy | `{vin, vdp_url, rule, severity}` |
| `DONE` | Policy application complete | `{blocks, releases, total, timestamp}` |
| `ERROR` | Error occurred | `{error, message}` |

### Feed Gate Status

| Status | Color | Description |
|--------|-------|-------------|
| `Feed clear` | Green | No blocked VDPs |
| `Feed gated: X VDPs` | Red | X VDPs blocked by policy |

## Configuration

### Environment Variables

```bash
# Required for SSE stream
POSTGRES_HTTP_URL=https://your-project.supabase.co/rest/v1/rpc/execute_sql
POSTGRES_TOKEN=your-service-role-key

# Database connection
DATABASE_URL=postgresql://...
```

### Vercel Configuration

```json
{
  "functions": {
    "app/api/policy/apply/stream/route.ts": {
      "runtime": "edge",
      "maxDuration": 30
    }
  }
}
```

## Usage Examples

### Basic Policy Application

```typescript
// Apply policy programmatically
const response = await fetch('/api/policy/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenantId: 'your-tenant-id',
    dryRun: false
  })
});

const result = await response.json();
console.log('Applied policy:', result.summary);
```

### SSE Stream Integration

```typescript
// Connect to progress stream
const es = new EventSource('/api/policy/apply/stream?tenantId=your-tenant-id');

es.addEventListener('START', (e) => {
  console.log('Policy application started:', e.data);
});

es.addEventListener('BLOCK', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Blocked VDP ${data.vin}: ${data.rule}`);
});

es.addEventListener('DONE', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Completed: ${data.blocks} blocked, ${data.releases} released`);
  es.close();
});
```

### Feed Gate Status

```typescript
// Get current gate status
const response = await fetch('/api/gate/summary?tenantId=your-tenant-id');
const status = await response.json();

if (status.blocked > 0) {
  console.log(`Feed gated: ${status.blocked} VDPs blocked`);
  console.log(`Severity breakdown: Sev3:${status.sev3} Sev2:${status.sev2} Sev1:${status.sev1}`);
} else {
  console.log('Feed clear - all VDPs ready for syndication');
}
```

## Security

### Row Level Security (RLS)

All database operations are protected by RLS policies:

```sql
-- Policy apply events
CREATE POLICY policy_apply_events_tenant_select ON policy_apply_events
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

-- Syndication gate
CREATE POLICY syndication_gate_tenant_select ON syndication_gate
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
```

### Tenant Isolation

- All queries filtered by `tenant_id`
- SSE streams isolated per tenant
- No cross-tenant data leakage

## Performance

### SSE Stream

- **Edge Runtime**: Optimized for real-time streaming
- **Polling Interval**: 1 second for new events
- **Connection Management**: Automatic cleanup on disconnect
- **Event Batching**: Up to 100 events per poll

### Feed Gate

- **Polling Frequency**: 30 seconds for status updates
- **Caching**: Client-side state management
- **Efficient Queries**: Aggregated counts with indexes

## Monitoring

### Health Checks

```bash
# Test SSE stream
curl -N /api/policy/apply/stream?tenantId=test-tenant

# Test gate summary
curl /api/gate/summary?tenantId=test-tenant
```

### Error Handling

- **Connection Errors**: Automatic reconnection with exponential backoff
- **Database Errors**: Graceful degradation with error events
- **Invalid Requests**: Proper HTTP status codes and error messages

## Testing

### Manual Testing

```bash
# Run test script
./scripts/test-policy-apply.sh

# Test individual components
curl -X POST /api/policy/apply -d '{"tenantId":"test"}'
curl /api/gate/summary?tenantId=test
```

### Demo Page

Visit `/policy-demo` for an interactive demonstration of both systems.

## Future Enhancements

- [ ] WebSocket support for bidirectional communication
- [ ] Policy versioning and rollback
- [ ] Bulk policy operations
- [ ] Advanced filtering and search
- [ ] Integration with external approval workflows
- [ ] Real-time notifications via webhooks
