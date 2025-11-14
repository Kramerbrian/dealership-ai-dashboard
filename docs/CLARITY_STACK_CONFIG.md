# Clarity Stack Configuration

**PLG Landing + Dashboard Integration**

## System Overview

The Clarity Stack provides SEO, AEO, GEO, and AVI scores for both:
- **PLG Landing Page**: Light scan (no auth) to lure users
- **Dashboard**: Full analysis with Pulse tiles and competitive battle plan

## Architecture Decisions Needed

### 1. Automation Mode

**Current Default**: Mode B (Agentic SRE with guardrails)

Choose one:
- **A) Bare-metal SRE**: Cron → raw output → human
- **B) Agentic SRE**: Cron → `/v1/assist` → agent summarizes → Pulse insights
- **C) Full Autopilot**: Agent analyzes + calls tools + auto-updates tiles

**Action**: Set `AUTOMATION_MODE` env var or update `lib/agents/orchestrator.ts`

---

### 2. Tenant ID Convention

**Current Default**: Option 1 (Tenant = namespace)

Choose one:
- **Option 1**: Tenant = Kubernetes namespace (`dealershipai`)
  - Stores under: `pulse:changes:dealershipai`
- **Option 2**: Tenant = explicit env var in CronJob
  - Stores under: `pulse:changes:toyota-naples`

**Action**: Update CronJob manifest or set `TENANT_ID` env var

---

### 3. Agent Tile Behavior

**Current Default**: A (Prepend - agent tiles above system tiles)

Choose one:
- **A) Prepend**: Agent tiles appear above system tiles
- **B) Blend by severity**: Sorted by actions → z-scores → error_count
- **C) Separate section**: Dedicated "Agent Proposals" block

**Action**: Update `components/pulse/PulseInbox.tsx` merge logic

---

### 4. Real-time Streaming

**Current Default**: No (polling every 5s)

Choose one:
- **Yes**: Add `/api/agentic/stream` SSE endpoint + `usePulseStream()` hook
- **No**: Continue with polling

**Action**: Create streaming endpoint if yes

---

### 5. Incident Auto-Creation

**Current Default**: B (Only propose incidents)

Choose one:
- **A) Auto-open SEV2**: Slack/Jira/PagerDuty on spikes
- **B) Only propose**: Agent suggests, human approves
- **C) Auto-open SEV1 only**: Critical issues only

**Action**: Update `lib/agents/incident-manager.ts`

---

## Required Logs for Anomaly Detection

To enable full anomaly detection, provide:

```bash
kubectl -n dealershipai logs deploy/orchestrator --all-containers --since=24h \
  | grep 'POST https' \
  | grep -i completions \
  | head -5
```

**Status**: ⏳ Waiting for log output

---

## Current Implementation

### API Endpoint

**`GET /api/clarity/stack?domain=example.com&light=true`**

Returns:
```json
{
  "scores": {
    "seo": 68,
    "aeo": 54,
    "geo": 41,
    "avi": 52
  },
  "revenue_at_risk": {
    "monthly": 24800,
    "annual": 297600
  },
  "insights": [
    "Your schema is missing on 84% of VDPs.",
    "You're outranked in AI-style answers by 3 local competitors.",
    "You're likely leaving ~$23K/mo on the table."
  ],
  "competitive": {
    "rank": 3,
    "total": 12,
    "top_competitors": [...]
  }
}
```

### Components

- **`components/pulse/ClarityStackTiles.tsx`**: SEO/AEO/GEO/UGC/Schema/Competitive tiles
- **`components/pulse/CompetitiveBattlePlan.tsx`**: Battle plan drawer with tiering

### Tiering

- **Free**: SEO/AEO/GEO/AVI visible, 1 competitor, basic Pulse cards
- **Pro**: Full competitor set, schema auto-gen, Autopilot suggestions
- **Enterprise**: Multi-rooftop, full Autopilot, governance PDFs

---

## Next Steps

1. **Provide kubectl logs** (see above)
2. **Confirm automation mode**: A / B / C
3. **Confirm tenant strategy**: Namespace / Explicit
4. **Confirm tile behavior**: A / B / C
5. **Confirm realtime**: Yes / No
6. **Confirm incident rule**: A / B / C

Once confirmed, I will:
- Wire final CronJob manifest
- Tune agentic anomaly prompts
- Update snapshot & changes endpoints
- Configure Pulse UI behavior
- Lock Autopilot guardrails
- Finalize Orchestrator 3.0 contracts

---

**Last Updated**: 2025-11-13

