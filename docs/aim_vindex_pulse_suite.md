# AIM VIN-DEX Pulse Suite

**Signal Router for Agentic Intelligence**

The AIM VIN-DEX Pulse Suite is the canonical signal routing and orchestration layer that feeds:
- **Orchestrator 3.0** (autonomous task execution)
- **AIM GPT** (conversational AI)
- **Pulse Engine** (dashboard cards & narratives)
- **Schema Engineer** (auto-fix for schema/GBP/CMS)

This document defines the public contract, lifecycle, and deployment configuration.

---

## 1. Public Contract

### Endpoint
```
POST /api/pulse/ingest
```

### Payload Schema
```typescript
interface PulseEventPayload {
  event_id: string;
  dealer_id: string;
  event_type: 'schema_error' | 'gbp_drift' | 'competitor_move' | 'user_action' | 'system_alert';
  severity: 'info' | 'warning' | 'critical';
  data: Record<string, any>;
  metadata?: {
    source?: string;
    timestamp?: string;
    user_id?: string;
  };
}
```

### Response
```typescript
interface PulseIngestResponse {
  success: boolean;
  pulse_id: string;
  routed_to: string[]; // ['orchestrator3', 'aim_gpt', 'pulse_engine', 'schema_engineer']
  timestamp: string;
}
```

---

## 2. Lifecycle: Ingest → Validate → Orchestrate → Act

1. **Ingest**
   - `/api/pulse/ingest` captures live OEM / market / CRM feeds and creates canonical `PulseEvent` records.

2. **Validate & Orchestrate**
   - Orchestrator 3.0 validates events against brand/dealer guardrails.
   - Events are converted into `PulseTask` queue items.
   - Cron endpoint `/api/cron/pulse-tasks` drains the queue in batches (size controlled by `PULSE_TASK_BATCH_SIZE`).

3. **Agentic Execution (Act – Phase 1)**
   - Each `PulseTask` calls **one** GPT agent via the shared `llmClient`:
     - `aim_gpt` → valuation intelligence (spreads, risk, Best End User confidence).
     - `pulse_engine` → narrative + triage card copy.
     - `schema_engine` → auto-fix plan (schema / GBP / CMS).
   - All agents use typed JSON contracts defined in `lib/agents/contracts.ts`.

4. **Persistence**
   - Agent responses are persisted into dedicated tables:
     - `aimRecommendations` – valuation and pricing recommendations.
     - `pulseCards` – rendered narrative + actions for UI.
     - `autoFixActions` – structured `SchemaEngineAction[]` for executor.

5. **UI Streaming & Triage**
   - Pulse Engine UI renders triage cards and actionables as a real-time stream.
   - Operators see: what changed, why it matters, and what to do next.

6. **Executor Layer (Act – Phase 2)**
   - A downstream executor applies `SchemaEngineAction[]` to real systems:
     - Schema (JSON-LD) injection.
     - GBP updates.
     - Site CMS / landing page offer blocks.
   - All changes remain governed by the dealer's `AutoFixPolicy` and OEM/brand guardrails.

7. **Environment & Canonical Integrity**
   - Core env vars:
     - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
     - Model overrides: `AIM_GPT_MODEL`, `PULSE_ENGINE_MODEL`, `SCHEMA_ENGINE_MODEL`
     - `PULSE_TASK_BATCH_SIZE`
   - Canonical manifest:
     - `/infra/canonical/AIM_VIN-DEX_Pulse_Suite.manifest.yml`
     - `integrity_hash`: `c6e712f8a8f2d0b3b45d924af47a20c19bdfc18ce2cce1ab4a1a8a5d08fa5b99`
   - Verification endpoint:
     - `https://registry.dealershipai.io/verify?canonical_id=AIM_VIN-DEX_Pulse_Suite`

8. **Scope & Release Tagging**
   - Scope:
     - Ingestion → **contract-verified**
     - Orchestration → **guardrail-verified**
     - Streaming → **stream-verified**
     - Persistence → **DB-verified**
     - UI → **UX-validated**
   - Canonical release tagging:
     ```bash
     git tag -a v2025.11.13-canonical -m "AIM VIN-DEX Pulse Suite Canonical Release"
     git push origin v2025.11.13-canonical
     ```
   - Registry auto-registers this tag as the canonical build for `AIM_VIN-DEX_Pulse_Suite`.

---

## 3. Routing Rules

| Event Type         | Orchestrator 3.0 | AIM GPT | Pulse Engine | Schema Engineer |
|--------------------|------------------|---------|--------------|-----------------|
| `schema_error`     | ✅ (high)         | ✅       | ✅            | ✅ (primary)     |
| `gbp_drift`        | ✅ (high)         | ✅       | ✅            | ✅ (primary)     |
| `competitor_move`  | ✅ (medium)       | ✅       | ✅            | ❌               |
| `user_action`      | ✅ (low)          | ✅       | ✅            | ❌               |
| `system_alert`     | ❌               | ❌       | ✅            | ❌               |

**Priority Definitions:**
- **High**: Execute immediately with self-healing retries
- **Medium**: Queue for batch processing within 5 minutes
- **Low**: Background learning, no immediate action

---

## 4. Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...                    # For Orchestrator 3.0 task planning
DATABASE_URL=postgresql://...             # Prisma database connection

# Optional
PULSE_ORCHESTRATOR_MODEL=gpt-4o-mini     # Override default GPT-4o-mini
PULSE_BATCH_SIZE=10                      # Max events processed per batch
PULSE_RETRY_ATTEMPTS=3                   # Self-healing retry count
PULSE_DEBUG=true                         # Enable verbose logging
```

### Canonical Manifest

The canonical deployment manifest is versioned and hashed:

```yaml
# Location: /infra/canonical/AIM_VIN-DEX_Pulse_Suite.manifest.yml
version: "2025.11.13"
integrity: "sha256:c6e712f8a8f2d0b3b45d924af47a20c19bdfc18ce2cce1ab4a1a8a5d08fa5b99"
git_tag: "v2025.11.13-canonical"
```

To verify integrity:

```bash
# From project root
cd /infra/canonical
shasum -a 256 AIM_VIN-DEX_Pulse_Suite.manifest.yml
```

Expected output:
```
c6e712f8a8f2d0b3b45d924af47a20c19bdfc18ce2cce1ab4a1a8a5d08fa5b99  AIM_VIN-DEX_Pulse_Suite.manifest.yml
```

---

## 5. Integration Examples

### Example 1: Schema Error Detection

```typescript
// In your schema monitoring service
async function onSchemaErrorDetected(dealerId: string, error: any) {
  await fetch('https://dash.dealershipai.com/api/pulse/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: crypto.randomUUID(),
      dealer_id: dealerId,
      event_type: 'schema_error',
      severity: 'critical',
      data: {
        error_type: error.type,
        field: error.field,
        expected: error.expected,
        actual: error.actual,
      },
      metadata: {
        source: 'schema_monitor_v1',
        timestamp: new Date().toISOString(),
      },
    }),
  });
}
```

### Example 2: GBP Drift Alert

```typescript
// In your GBP monitoring service
async function onGBPDriftDetected(dealerId: string, drift: any) {
  await fetch('https://dash.dealershipai.com/api/pulse/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: crypto.randomUUID(),
      dealer_id: dealerId,
      event_type: 'gbp_drift',
      severity: 'warning',
      data: {
        field_name: drift.field,
        cms_value: drift.cmsValue,
        gbp_value: drift.gbpValue,
        last_sync: drift.lastSync,
      },
      metadata: {
        source: 'gbp_monitor_v1',
        timestamp: new Date().toISOString(),
      },
    }),
  });
}
```

### Example 3: User Action Tracking

```typescript
// In your user analytics service
async function trackUserAction(userId: string, dealerId: string, action: string) {
  await fetch('https://dash.dealershipai.com/api/pulse/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: crypto.randomUUID(),
      dealer_id: dealerId,
      event_type: 'user_action',
      severity: 'info',
      data: {
        action_type: action,
        user_id: userId,
      },
      metadata: {
        source: 'analytics_v1',
        timestamp: new Date().toISOString(),
        user_id: userId,
      },
    }),
  });
}
```

---

## 6. Monitoring & Observability

### Metrics Tracked

- **Ingest Rate**: Events per second by event_type
- **Routing Latency**: Time from ingest to first component receive
- **Success Rate**: % events successfully processed by each component
- **Self-Healing Rate**: % tasks auto-recovered by Orchestrator 3.0
- **Schema Fix Rate**: % schema_errors auto-resolved by Schema Engineer

### Dashboard

View live metrics at:
```
https://dash.dealershipai.com/admin/pulse-metrics
```

### Alerts

Critical alerts are routed to:
- Slack: `#pulse-alerts` (high severity only)
- PagerDuty: On-call rotation (critical only)
- Email: Engineering team (daily digest)

---

## 7. Testing

### Unit Tests

```bash
npm test -- pulse-suite
```

### Integration Tests

```bash
npm run test:integration -- pulse-ingest
```

### Manual Testing

```bash
# Send a test event
curl -X POST https://dash.dealershipai.com/api/pulse/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "test-123",
    "dealer_id": "demo-dealer",
    "event_type": "schema_error",
    "severity": "critical",
    "data": {
      "error_type": "missing_field",
      "field": "telephone"
    },
    "metadata": {
      "source": "manual_test"
    }
  }'
```

---

## 8. Deployment

### Vercel Production

The Pulse Suite is deployed as part of the main Next.js application:

```bash
vercel --prod
```

### Git Tagging

All canonical releases are tagged:

```bash
git tag -a v2025.11.13-canonical -m "AIM VIN-DEX Pulse Suite v2025.11.13"
git push origin v2025.11.13-canonical
```

### Rollback

To rollback to a previous canonical version:

```bash
vercel rollback <DEPLOYMENT_URL>
```

---

## 9. Changelog

### v2025.11.13 (Canonical)
- Initial canonical release
- Integrated Orchestrator 3.0 routing
- Added Schema Engineer auto-fix
- Implemented 8-phase lifecycle
- Published public contract

---

## 10. Support

For questions or issues with the AIM VIN-DEX Pulse Suite:

- **Documentation**: This file (canonical)
- **Code**: `lib/pulse/`, `app/api/pulse/`, `lib/agent/orchestrator3.ts`
- **Contact**: Engineering team via Slack `#pulse-dev`

---

**Canonical Hash**: `c6e712f8a8f2d0b3b45d924af47a20c19bdfc18ce2cce1ab4a1a8a5d08fa5b99`
**Git Tag**: `v2025.11.13-canonical`
**Last Updated**: 2025-11-13
