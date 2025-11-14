# Pulse Feed Contract

**Purpose:** Canonical contract that all GPTs must follow when working with Pulse Events.

**Last Updated:** November 2025

---

## Overview

All real-time signals flow through a canonical `PulseEvent` object. This contract ensures consistency across all GPTs and services in the DealershipAI ecosystem.

---

## PulseEvent Schema

### Required Fields

```typescript
interface PulseEvent {
  id: string;                    // Unique identifier (e.g., "pulse_evt_toyota_camry_lease_2025_11_15_SET")
  ts: string;                    // ISO timestamp, UTC (e.g., "2025-11-13T03:05:00Z")
  dealer_id: string;             // Dealer identifier (e.g., "crm_naples_toyota")
  brand: string;                 // Brand name (e.g., "Toyota")
  level: PulseLevel;             // Severity level
  kind: PulseKind;               // Event type
  source: string;                // Source system (e.g., "aim_vindex_suite")
  tags: string[];                // Tags for routing and guardrails
  summary: string;               // Short human-readable description
  details: Record<string, any>;  // Domain-specific payload (JSON object)
  metrics: Record<string, number>; // Numeric metrics (e.g., deltas)
  dedupe_key: string;            // Deduplication key
  thread_ref: ThreadReference;   // Threading information
}
```

### Type Definitions

**PulseLevel:**
- `"critical"` - Immediate action required
- `"high"` - Important, should be addressed soon
- `"medium"` - Moderate priority
- `"low"` - Low priority
- `"info"` - Informational only

**PulseKind:**
- `"kpi_delta"` - KPI change detected
- `"incident_opened"` - New incident
- `"incident_resolved"` - Incident resolved
- `"market_signal"` - Market/OEM program change
- `"auto_fix"` - Auto-fix executed
- `"sla_breach"` - SLA violation
- `"system_health"` - System health event

**ThreadReference:**
```typescript
{
  type: "market" | "kpi" | "incident";
  key: string;  // Thread identifier
}
```

---

## Dealer Context Envelope

Every GPT must assume this envelope is present in context when reacting to a Pulse Event:

```json
{
  "dealer_id": "crm_naples_toyota",
  "name": "Germain Toyota of Naples",
  "slug": "germain-toyota-of-naples",
  "tier": "enterprise",
  "brands": ["Toyota"],
  "geo": {
    "city": "Naples",
    "state": "FL",
    "dma": "Fort Myers-Naples"
  },
  "inventory_profile": {
    "new_units": 183,
    "used_units": 247,
    "model_mix": {
      "camry": 28,
      "corolla": 22,
      "rav4": 31,
      "tacoma": 19
    }
  },
  "scores": {
    "aiv": 78,
    "ati": 82,
    "cvi": 61,
    "ori": 59,
    "gri": 72
  },
  "competitive_set": [
    "autonation-toyota-fort-myers",
    "germain-honda",
    "fort-myers-nissan"
  ],
  "pulse_ruleset_id": "toyota_default_v1",
  "auto_fix_policy_id": "tier3_enterprise_default_v1",
  "auto_fix_enabled": true,
  "channels": {
    "slack_webhook": "https://hooks.slack.com/services/FAKE/FAKE/FAKE",
    "email_alert": "gm@germaintoyotaofnaples.com"
  }
}
```

### Rules for Dealer Context

1. **Never invent dealer IDs** - Use the `dealer_id` from the envelope
2. **Respect tier and policy** - Check `tier`, `auto_fix_policy_id`, and `auto_fix_enabled`
3. **Use authoritative data** - Don't override brands, geo, or scores
4. **Target actions correctly** - All proposed actions must target the correct `dealer_id`

---

## Event Flow

### 1. Event Emission

**AIM VIN-DEX Pulse Suite** emits PulseEvents to `/api/pulse/ingest`:

```typescript
POST /api/pulse/ingest
Content-Type: application/json

{
  "id": "pulse_evt_...",
  "ts": "2025-11-13T03:05:00Z",
  "dealer_id": "crm_naples_toyota",
  // ... rest of PulseEvent
}
```

### 2. Guardrail Processing

**Orchestrator 3.0** applies guardrails:

- Checks `tags` against guardrail rules
- May upgrade `level` (e.g., `high` → `critical`)
- Determines routing based on `kind` and `tags`
- Sets `auto_fix_allowed` based on policy

### 3. Fan-Out Routing

Events are routed to appropriate GPTs:

- **AIM GPT** - For valuation/math (market signals, pricing)
- **Pulse Engine GPT** - For cards + dashboards (all events)
- **Schema Engineer GPT** - For auto-fixes (when `auto_fix_allowed: true`)

### 4. Downstream Processing

All downstream GPTs must:

- Treat `PulseEvent + Dealer Context` as source of truth
- Never silently change IDs, brands, or tiers
- Use `dedupe_key` to prevent duplicate processing
- Respect `thread_ref` for grouping related events

---

## Example Events

### Market Signal (OEM Program Change)

See: `canonical/agentic/pulse-events/toyota-lease-program-change.json`

**Characteristics:**
- `kind: "market_signal"`
- `tags: ["oem_program_change", "toyota", "camry", "lease"]`
- `level: "critical"` (upgraded by guardrails)
- `auto_fix_allowed: true` (allows schema injection)

**Guardrail Behavior:**
- Matches `tags_any: ["oem_program_change"]`
- Routes to: `["orchestrator", "aim_gpt", "pulse_engine", "schema_engine"]`
- Escalates to: `["slack", "dashboard"]`

### KPI Delta (AI Visibility Drop)

See: `canonical/agentic/pulse-events/ai-visibility-drop.json`

**Characteristics:**
- `kind: "kpi_delta"`
- `tags: ["ai_visibility_drop", "chatgpt", "perplexity"]`
- `level: "critical"` (upgraded by guardrails)
- `auto_fix_allowed: false` (strategic fix, not auto-inject)

**Guardrail Behavior:**
- Matches `tags_any: ["ai_visibility_drop"]`
- Routes to: `["orchestrator", "pulse_engine"]`
- Escalates to: `["dashboard"]`

---

## GPT Integration Instructions

### For AIM VIN-DEX Pulse Suite GPT

When you detect a relevant market or KPI event:

1. Build a `PulseEvent` JSON object that matches the Pulse Feed Contract
2. Include:
   - `dealer_id` from the Dealer Context Envelope
   - `kind`, `tags`, `metrics`, and `details` appropriate to the event
3. Hand that JSON to the Orchestrator endpoint `/api/pulse/ingest` (or return it to the caller if running inside a GPT without direct HTTP)
4. Never invent your own schema; always obey the Pulse Feed Contract
5. Use `dedupe_key` so repeated OEM bulletins or KPI blips don't spam the dealer

### For dAI Orchestrator GPT 3.0

When processing a PulseEvent:

1. Load the Dealer Context Envelope for the `dealer_id`
2. Apply guardrail rules based on `kind` and `tags`
3. Determine routing based on guardrail output
4. Fan-out to appropriate GPTs (AIM, Pulse Engine, Schema Engineer)
5. Never modify the original `PulseEvent` structure

### For Pulse Engine GPT

When creating pulse cards:

1. Use `PulseEvent` as the source of truth
2. Create cards with `title` from `summary`, `level` from `level`
3. Group by `thread_ref` for related events
4. Use `dedupe_key` to prevent duplicate cards
5. Respect `ttl_sec` and `expires_at` if provided

### For Schema Engineer GPT

When auto-fixing:

1. Check `auto_fix_allowed` from guardrail output
2. Verify `auto_fix_enabled` in Dealer Context
3. Only proceed if both are `true`
4. Target fixes to the `dealer_id` from context
5. Log all changes to `orchestrator_audit_log`

---

## Deduplication

Use `dedupe_key` to prevent duplicate events:

- Format: `{event_type}_{identifier}_{date}` (e.g., `"toyota_camry_lease_SET_2025-11-15"`)
- Same `dedupe_key` within a time window = duplicate
- Orchestrator should suppress duplicates before routing

---

## Threading

Use `thread_ref` to group related events:

- `type: "market"` - Market/OEM program events
- `type: "kpi"` - KPI tracking events
- `type: "incident"` - Incident lifecycle events

Events with the same `thread_ref.key` should be grouped in the UI.

---

## Validation Checklist

Before emitting a PulseEvent, verify:

- [ ] `id` is unique and follows naming convention
- [ ] `ts` is ISO 8601 UTC timestamp
- [ ] `dealer_id` matches a real dealer
- [ ] `level` is one of: `critical`, `high`, `medium`, `low`, `info`
- [ ] `kind` is one of the valid types
- [ ] `tags` array contains relevant tags
- [ ] `summary` is human-readable
- [ ] `details` is a valid JSON object
- [ ] `metrics` contains numeric values
- [ ] `dedupe_key` is set and unique
- [ ] `thread_ref` has valid `type` and `key`

---

## Related Files

- `canonical/agentic/pulse-events/toyota-lease-program-change.json` - Market signal example
- `canonical/agentic/pulse-events/ai-visibility-drop.json` - KPI delta example
- `canonical/agentic/dealer-context-envelope.json` - Dealer context template
- `prisma/seed-pulse.sql` - Seed data with guardrails and policies

---

**Status:** ✅ Canonical Contract - All GPTs must follow this schema

