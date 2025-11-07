# Weaponization Checklist - Implementation Status

## ✅ Completed

### 1. Always-On Intelligence (Cron + Backfills)
- ✅ Vercel cron configuration in `vercel.json`
- ✅ `/api/cron/refresh-presence` - Every 30 minutes
- ✅ `/api/cron/refresh-schema` - Every 2 hours
- ✅ `/api/cron/refresh-ga4` - Every hour at :15
- ✅ `/api/cron/refresh-reviews` - Every hour at :45

### 2. Telemetry → Alerts → Slack
- ✅ `/api/reports/delta-brief` - Nightly report with Slack milestones
- ✅ `/lib/slack/milestones.ts` - Slack webhook integration
- ✅ Auto-post on AIV +10, $5K+ recovered, engine drops

### 3. Reports
- ✅ `/api/reports/delta-brief` - Daily score changes, pulses closed, integrations
- ✅ `/api/reports/model-nutrition` - Weekly patterns, best fixes, registry version

### 4. Fix Engine (Apply/Autopilot) Hardening
- ✅ `/api/fix/apply` - Idempotent with `Idempotency-Key` header
- ✅ `/api/fix/undo` - 10-minute undo window with Redis TTL
- ✅ Dry-run mode (`simulate=true`)
- ✅ Redis-backed idempotency and undo tokens

### 5. Billing & Gating (Stripe)
- ✅ `/api/billing/checkout` - Stripe checkout session creation
- ✅ `/api/billing/webhook` - Handle subscription events
- ✅ `/lib/billing/plan.ts` - Plan utilities (`getPlan`, `gate`)
- ✅ `/lib/billing/gates.ts` - Feature gating logic
- ✅ `/components/gates/TierGate.tsx` - Client-side visual gate
- ✅ `/components/billing/UpgradeButton.tsx` - Upgrade button component

### 6. GPT Actions Wiring
- ✅ `/api/orchestrator/snapshot` - Current snapshot endpoint
- ✅ `/api/pulse/recommend` - Pulse recommendations
- ✅ `/api/fix/apply` - Apply fixes
- ✅ `/api/ledger/receipt` - Impact ledger receipts

### 7. Competitor Map + Cohort Benchmarks
- ✅ `/api/benchmarks` - Cohort percentiles by segment

## 🔄 TODO (Next Steps)

### 1. Security & Guardrails
- [ ] Rate limits per route (60/min/tenant)
- [ ] CSP headers globally
- [ ] Sentry integration for error tracking

### 2. A/B Harness + Feature Flags
- [ ] Feature flags: `pulse_explain_first`, `autopilot_visible`, `aiv_hover_terms`
- [ ] A/B infra: sticky assignment by tenant
- [ ] Measure TTFI (time-to-first-fix), fixes/session

### 3. DevOps & Health
- [ ] Enhanced `/api/health` with Redis/DB checks
- [ ] Cache TTL enforcement: presence 120s, schema 2h, GA4 60s, reviews 2-5min
- [ ] Backpressure: degrade to cached if upstream > 2s p95

### 4. Accessibility + Web Vitals
- [ ] Core Web Vitals block in Drive modal
- [ ] Reduced motion check
- [ ] Crossfade drawers

## 📝 Environment Variables Required

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Slack alerts (optional)
TELEMETRY_WEBHOOK=https://hooks.slack.com/services/...

# Upstash Redis (already configured)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Cron secret
CRON_SECRET=your-secret-here
```

## 🎯 KPIs to Track

- `time_to_first_fix_sec_p50`: <= 60
- `fixes_per_session`: >= 1.5
- `abandonment`: <= 5%
- `integrations_by_day7`: >= 2
- `retention_d7`: >= 60%
- `api_p95_ms`: <= 2000

