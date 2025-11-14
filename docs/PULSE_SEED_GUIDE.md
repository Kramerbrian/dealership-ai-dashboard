# Pulse System Seed Guide

## Quick Start

### 1. Run Database Migrations

```bash
npx prisma migrate dev
```

### 2. Seed the Database

```bash
npm run db:seed
```

This will create:
- ✅ User: `seed@germaintoyotaofnaples.com`
- ✅ Dealer: `crm_naples_toyota` (Germain Toyota of Naples)
- ✅ Guardrail Ruleset: `toyota_default_v1`
- ✅ Auto-Fix Policy: `tier3_enterprise_default_v1`
- ✅ Pulse Tasks: 2 test tasks

### 3. Fire Test PulseEvents

#### Option A: Browser (Easiest)

Visit: `http://localhost:3000/api/pulse/debug/seed` (POST request)

Or use the browser console:
```javascript
fetch('/api/pulse/debug/seed', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

#### Option B: cURL

**Toyota OEM Program Change:**
```bash
curl -X POST http://localhost:3000/api/pulse/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "id": "pulse_evt_toyota_camry_lease_2025_11_15_SET",
    "ts": "2025-11-13T03:05:00Z",
    "dealer_id": "crm_naples_toyota",
    "brand": "Toyota",
    "level": "critical",
    "kind": "market_signal",
    "source": "aim_vindex_suite",
    "tags": ["oem_program_change", "toyota", "camry", "lease", "incentive", "SET_region"],
    "summary": "New SET Toyota Camry lease subvention announced for Naples DMA.",
    "details": {
      "program_type": "lease",
      "region": "SET",
      "effective_from": "2025-11-15",
      "effective_to": "2026-01-02",
      "msrp_cap": 36500,
      "rebate_delta": 750,
      "mf_delta_bps": -35,
      "residual_delta_pct": 1.0,
      "headline": "2025 Camry LE lease $299/mo for 36 months, $2,999 due at signing"
    },
    "metrics": {
      "estimated_used_price_impact_pct": -2.7,
      "near_new_gap_target_ratio": 0.87
    },
    "dedupe_key": "toyota_camry_lease_SET_2025-11-15",
    "thread_ref": {
      "type": "market",
      "key": "oem_toyota_camry_lease"
    }
  }'
```

**AI Visibility Drop:**
```bash
curl -X POST http://localhost:3000/api/pulse/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "id": "pulse_evt_aiv_drop_2025_11_13_naples_toyota",
    "ts": "2025-11-13T10:15:00Z",
    "dealer_id": "crm_naples_toyota",
    "brand": "Toyota",
    "level": "high",
    "kind": "kpi_delta",
    "source": "aim_visibility_monitor",
    "tags": ["ai_visibility_drop", "chatgpt", "perplexity", "zero_click"],
    "summary": "AI Visibility Score dropped 7 points vs last 7 days.",
    "details": {
      "aiv_prev": 78,
      "aiv_current": 71,
      "window": "7d",
      "platforms": {
        "chatgpt": { "prev": 0.42, "current": 0.34 },
        "perplexity": { "prev": 0.39, "current": 0.31 },
        "gemini": { "prev": 0.47, "current": 0.45 }
      }
    },
    "metrics": {
      "aiv_delta": -7,
      "zero_click_coverage_delta": -6
    },
    "dedupe_key": "aiv_drop_7pt_2025-11-13_naples_toyota",
    "thread_ref": {
      "type": "kpi",
      "key": "ai_visibility"
    }
  }'
```

### 4. Verify Cards Appear

Visit: `http://localhost:3000/triage?dealerId=crm_naples_toyota`

You should see:
- ✅ One **CRITICAL** "Camry lease subvention" card
- ✅ One **CRITICAL** "AI Visibility Score dropped 7 points" card

---

## "Is the Loop Alive?" Checklist

Run in this order:

1. ✅ `npx prisma migrate dev`
2. ✅ `npm run db:seed`
3. ✅ Fire both PulseEvents (via `/api/pulse/debug/seed` or cURL)
4. ✅ Visit `/triage?dealerId=crm_naples_toyota`
5. ✅ See two cards appear

**If all steps pass, you're in "this thing actually moves" territory! 🚀**

---

## Troubleshooting

### Seed Fails

**Error:** `Table "GuardrailRuleset" does not exist`
- **Fix:** Run `npx prisma migrate dev` first

**Error:** `User already exists`
- **Fix:** This is fine - seed uses `upsert`, so it's idempotent

### Events Don't Appear in Triage

1. Check `/api/pulse/ingest` is working:
   ```bash
   curl -X POST http://localhost:3000/api/pulse/ingest \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. Check `/api/pulse/list?dealerId=crm_naples_toyota`:
   ```bash
   curl http://localhost:3000/api/pulse/list?dealerId=crm_naples_toyota
   ```

3. Check database directly:
   ```bash
   npx prisma studio
   ```
   Look for `pulse_cards` table

### Guardrails Not Applied

- Verify `GuardrailRuleset` table exists and has `toyota_default_v1`
- Check that `dealer_id` matches `crm_naples_toyota`
- Verify `/api/pulse/ingest` is loading guardrails correctly

---

## Next Steps

After seed is working:

1. **Integrate with AIM VIN-DEX GPT** - Wire it to POST PulseEvents
2. **Wire Pulse Engine GPT** - Process events into cards
3. **Connect Schema Engineer GPT** - Auto-fix when `auto_fix_allowed: true`
4. **Set up Slack webhooks** - Get notifications for critical events
5. **Add more dealers** - Seed additional test data

---

## Files Created

- `prisma/seed.ts` - Main seed script
- `app/api/pulse/debug/seed/route.ts` - Browser-friendly test endpoint
- `docs/PULSE_SEED_GUIDE.md` - This guide

## Package.json Changes

Added:
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

Run with: `npm run db:seed`

