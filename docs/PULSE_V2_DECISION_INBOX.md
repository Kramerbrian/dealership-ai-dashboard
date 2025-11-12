# Pulse v2: Decision Inbox

## Overview

Pulse v2 transforms the real-time event ticker into a **decision inbox** - an actionable feed of insights that require dealer attention. Instead of showing every event, Pulse surfaces only signal (KPI shifts, incidents, market moves) with one-click actions.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────┐
│           PULSE DECISION INBOX              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ PulseInbox   │  │ PulseStore   │       │
│  │  Component   │◄─┤   (Zustand)  │       │
│  └──────────────┘  └──────────────┘       │
│         ▲                  ▲               │
│         │                  │               │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  PulseCard   │  │ PulseThread  │       │
│  │  Component   │  │   Drawer     │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│              API LAYER                      │
│  POST /api/pulse - Ingest cards             │
│  GET /api/pulse - Fetch inbox               │
├─────────────────────────────────────────────┤
│           DATABASE LAYER                    │
│  • pulse_cards (with RLS)                   │
│  • pulse_threads (correlation)              │
│  • pulse_mutes (DND)                        │
│  • pulse_incidents (auto-promotion)         │
└─────────────────────────────────────────────┘
```

## Key Features

### 1. Clean Signal Taxonomy

**PulseCard Types:**
- `kpi_delta` - KPI changed beyond threshold
- `incident_opened` - New incident created
- `incident_resolved` - Incident fixed
- `market_signal` - Competitor activity detected
- `auto_fix` - Automated fix applied
- `sla_breach` - SLA target missed
- `system_health` - System status update

**Severity Levels:**
- `critical` - Immediate action required
- `high` - Action needed today
- `medium` - Can wait 1-2 days
- `low` - FYI / nice-to-know
- `info` - System notifications

### 2. Auto-Promotion Rules

**Automatic Incident Creation:**

```typescript
// KPI Delta → Incident (when |delta| >= 6)
if (card.kind === 'kpi_delta' && Math.abs(delta) >= 6) {
  CREATE INCIDENT {
    title: 'AIV dropped 8 points',
    category: 'ai_visibility',
    urgency: 'high',
    autofix: true,
    fix_tiers: ['tier1_diy', 'tier2_guided', 'tier3_dfy']
  }
}

// SLA Breach → Incident (always)
if (card.kind === 'sla_breach') {
  CREATE INCIDENT {
    urgency: 'high',
    impact_points: 5000,
    autofix: false
  }
}
```

### 3. Deduplication & Bundling

**10-Minute Window:**
- Cards with same `dedupe_key` within 10 minutes are collapsed
- Only the first occurrence is shown
- Prevents notification spam

**Example:**
```typescript
const card1 = {
  dedupe_key: 'schema-scan-20251112',
  title: 'Schema scan completed',
  ts: '2025-11-12T10:00:00Z'
};

const card2 = {
  dedupe_key: 'schema-scan-20251112',
  title: 'Schema scan completed',
  ts: '2025-11-12T10:05:00Z'
};
// card2 is collapsed (within 10-min window)
```

### 4. Threading & Correlation

**Thread Types:**
- `incident` - All events related to an incident
- `kpi` - All events for a KPI trend
- `market` - All events for a competitor

**Example Thread:**
```typescript
const thread = {
  type: 'incident',
  id: 'inc-001',
  events: [
    { kind: 'incident_opened', title: 'AIV dropped 8 points' },
    { kind: 'auto_fix', title: 'Schema fix applied' },
    { kind: 'kpi_delta', title: 'AIV recovered +5 points' },
    { kind: 'incident_resolved', title: 'AIV issue resolved' }
  ]
};
```

### 5. One-Click Actions

**Available Actions:**
- `open` - View thread history
- `fix` - Trigger automated fix
- `assign` - Assign to team member
- `snooze` - Hide for 15m/1h/end of day
- `mute` - Permanently silence this signal

**Card Example:**
```typescript
const card: PulseCard = {
  id: 'card-001',
  level: 'high',
  kind: 'kpi_delta',
  title: 'AIV dropped 8 points',
  detail: 'Visibility score declined across all segments',
  delta: -8,
  actions: ['open', 'fix', 'snooze', 'mute'],
  receipts: [
    { label: 'Before', kpi: 'AIV', before: 72 },
    { label: 'After', kpi: 'AIV', after: 64 }
  ]
};
```

### 6. Keyboard Navigation

**Shortcuts:**
- `?` - Toggle keyboard mode
- `j` / `k` - Navigate down/up
- `Enter` - Execute primary action
- `m` - Mute card (24 hours)
- `h` - Open thread history
- `Esc` - Close drawer/exit keyboard mode

### 7. Do Not Disturb (DND)

**DND Windows:**
- 30 minutes
- 2 hours
- Until end of day

**During DND:**
- Critical alerts still shown
- All other notifications silenced
- Visual indicator in UI

### 8. Digest Mode

**Morning Digest Summary:**
- Daily rollup of all cards
- Grouped by category (KPI, Incidents, Market)
- Net KPI changes calculated
- Incidents resolved vs. opened
- SLA breaches highlighted

**Example Digest:**
```
Today's Summary:
• AIV: +2.3 net change
• 3 incidents resolved
• 1 SLA risk
• 2 market signals (Smith Ford activity)
```

## Database Schema

### pulse_cards
```sql
CREATE TABLE pulse_cards (
  id UUID PRIMARY KEY,
  dealer_id TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  level TEXT CHECK (level IN ('critical', 'high', 'medium', 'low', 'info')),
  kind TEXT CHECK (kind IN ('kpi_delta', 'incident_opened', ...)),
  title TEXT NOT NULL,
  detail TEXT,
  delta NUMERIC,
  thread_type TEXT,
  thread_id TEXT,
  actions JSONB,
  dedupe_key TEXT,
  ttl_sec INTEGER,
  expires_at TIMESTAMPTZ,
  context JSONB,
  receipts JSONB,
  created_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);
```

### pulse_threads
```sql
CREATE TABLE pulse_threads (
  id UUID PRIMARY KEY,
  dealer_id TEXT NOT NULL,
  thread_type TEXT CHECK (thread_type IN ('incident', 'kpi', 'market')),
  thread_id TEXT NOT NULL,
  title TEXT,
  event_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### pulse_mutes
```sql
CREATE TABLE pulse_mutes (
  id UUID PRIMARY KEY,
  dealer_id TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_by TEXT
);
```

### pulse_incidents
```sql
CREATE TABLE pulse_incidents (
  id UUID PRIMARY KEY,
  dealer_id TEXT NOT NULL,
  pulse_card_id UUID REFERENCES pulse_cards(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
  impact_points INTEGER,
  confidence NUMERIC(3, 2),
  autofix BOOLEAN,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  receipts JSONB
);
```

## API Endpoints

### POST /api/pulse
**Ingest pulse cards with auto-promotion**

**Request:**
```json
POST /api/pulse?dealerId=demo-tenant
[
  {
    "level": "high",
    "kind": "kpi_delta",
    "title": "AIV dropped 8 points",
    "detail": "Visibility score declined",
    "delta": -8,
    "dedupe_key": "aiv-drop-20251112",
    "ttl_sec": 86400,
    "context": { "kpi": "AIV" },
    "receipts": [
      { "label": "Before", "kpi": "AIV", "before": 72 },
      { "label": "After", "kpi": "AIV", "after": 64 }
    ]
  }
]
```

**Response:**
```json
{
  "success": true,
  "cardsReceived": 1,
  "cardsIngested": 1,
  "promotedIncidents": 1,
  "incidents": [
    {
      "id": "inc-001",
      "title": "AIV -8",
      "category": "ai_visibility",
      "urgency": "high",
      "autofix": true
    }
  ]
}
```

### GET /api/pulse
**Fetch pulse inbox with filtering**

**Request:**
```
GET /api/pulse?dealerId=demo-tenant&filter=all&limit=50
```

**Response:**
```json
{
  "cards": [
    {
      "id": "card-001",
      "ts": "2025-11-12T10:00:00Z",
      "level": "high",
      "kind": "kpi_delta",
      "title": "AIV dropped 8 points",
      "delta": -8,
      "actions": ["open", "fix"],
      "thread": { "type": "kpi", "id": "aiv-trend" }
    }
  ],
  "filter": "all",
  "limit": 50,
  "digest": {
    "digest_date": "2025-11-12",
    "critical_count": 1,
    "aiv_net_change": -8,
    "incidents_opened": 1,
    "incidents_resolved": 0
  }
}
```

## Usage Example

### Sending Pulse Cards

```typescript
// From backend service
await fetch('/api/pulse?dealerId=demo-tenant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    {
      level: 'high',
      kind: 'kpi_delta',
      title: 'AIV dropped 8 points',
      delta: -8,
      dedupe_key: 'aiv-drop-20251112',
      ttl_sec: 86400, // Expire after 24 hours
      thread: { type: 'kpi', id: 'aiv-trend' },
      actions: ['open', 'fix', 'snooze'],
      receipts: [
        { label: 'Before', kpi: 'AIV', before: 72 },
        { label: 'After', kpi: 'AIV', after: 64 }
      ]
    }
  ])
});
```

### Fetching in UI

```typescript
// In component
useEffect(() => {
  const fetchPulse = async () => {
    const response = await fetch('/api/pulse?dealerId=demo-tenant&filter=all');
    const data = await response.json();
    addManyPulse(data.cards);
  };

  fetchPulse();
  const interval = setInterval(fetchPulse, 30000); // Refresh every 30s
  return () => clearInterval(interval);
}, []);
```

## Testing

### Sample Pulse Cards

```typescript
// KPI Delta (auto-promotes to incident)
{
  level: 'high',
  kind: 'kpi_delta',
  title: 'AIV dropped 8 points',
  delta: -8,
  dedupe_key: 'aiv-drop-20251112',
  ttl_sec: 86400
}

// Market Signal
{
  level: 'medium',
  kind: 'market_signal',
  title: 'Competitor launched new inventory page',
  detail: 'Smith Ford added 45 new vehicles',
  thread: { type: 'market', id: 'smith-ford-activity' },
  dedupe_key: 'smith-ford-inventory-20251112',
  ttl_sec: 604800
}

// System Health
{
  level: 'info',
  kind: 'system_health',
  title: 'Schema scan completed',
  detail: '23/25 schema types detected (+2 from last scan)',
  dedupe_key: 'schema-scan-20251112-10',
  ttl_sec: 43200
}

// Incident Resolved
{
  level: 'info',
  kind: 'incident_resolved',
  title: 'Missing LocalBusiness schema added',
  detail: 'Auto-fix applied and verified',
  thread: { type: 'incident', id: 'inc-001' }
}
```

## Best Practices

### 1. TTL Management
- **Critical alerts:** 1 hour (3600 sec)
- **High priority:** 24 hours (86400 sec)
- **Medium priority:** 7 days (604800 sec)
- **Info/system:** 12 hours (43200 sec)

### 2. Dedupe Keys
Use format: `{category}-{identifier}-{date}`

Examples:
- `aiv-drop-20251112`
- `schema-scan-20251112-10`
- `smith-ford-inventory-20251112`

### 3. Thread Naming
Use descriptive, stable IDs:
- `aiv-trend` (not `trend-001`)
- `smith-ford-activity` (not `competitor-1`)
- `inc-schema-missing` (not `inc-001`)

### 4. Receipt Format
Always include before/after values for KPI deltas:

```typescript
receipts: [
  { label: 'Before', kpi: 'AIV', before: 72 },
  { label: 'After', kpi: 'AIV', after: 64 }
]
```

## Migration from Pulse v1

### v1 (Ticker)
```typescript
// Old: All events shown in real-time
<PulseTicker events={allEvents} />
```

### v2 (Decision Inbox)
```typescript
// New: Filtered, actionable cards with lifecycle
<PulseInbox dealerId="demo-tenant" autoRefresh={true} />
```

### Key Differences

| Feature | Pulse v1 | Pulse v2 |
|---------|----------|----------|
| **Event Stream** | All events | Filtered signals |
| **Persistence** | In-memory | Database-backed |
| **Deduplication** | None | 10-minute window |
| **Threading** | None | Incident/KPI/Market |
| **Actions** | View only | One-click actions |
| **Auto-promotion** | None | KPI → Incident |
| **Keyboard Nav** | None | j/k/Enter/m/h |
| **DND Mode** | None | 30m/2h/EOD |
| **Digest** | None | Daily summary |

## Roadmap

### Phase 1 (COMPLETE)
- ✅ Database schema
- ✅ API with deduplication
- ✅ PulseInbox component
- ✅ Keyboard navigation
- ✅ Auto-promotion rules
- ✅ DND mode
- ✅ Digest mode

### Phase 2 (Future)
- [ ] Real-time WebSocket updates
- [ ] Mobile push notifications
- [ ] Email digest delivery
- [ ] Custom auto-promotion rules
- [ ] Team assignment workflow
- [ ] SLA tracking dashboard

### Phase 3 (Future)
- [ ] ML-powered prioritization
- [ ] Predictive incident detection
- [ ] Smart bundling (AI clustering)
- [ ] Voice/Slack integration
- [ ] Multi-tenant admin panel

## Summary

Pulse v2 transforms the event stream into a **decision inbox** with:
- Clean signal taxonomy (8 card types)
- Auto-promotion rules (KPI → Incident)
- Deduplication & bundling (10-min window)
- Threading & correlation (incident/kpi/market)
- One-click actions (open/fix/assign/snooze/mute)
- Keyboard navigation (j/k/Enter/m/h)
- DND mode (30m/2h/EOD)
- Digest mode (daily summary)

**Result:** Dealers get actionable insights, not noise. Every card requires a decision. Zero information overload.
