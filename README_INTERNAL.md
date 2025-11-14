# 📘 DealershipAI Internal README

### *Onboarding, Deployment, and Operations Guide*

---

## 🧭 1. System Overview

DealershipAI is a **self-optimizing, cinematic platform** composed of:

| Layer                   | Purpose                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| **Landing Page**        | Public, cinematic marketing experience.                                           |
| **Clerk Middleware**    | Authentication and session injection for dashboard.                               |
| **Onboarding Workflow** | First-time dealer setup; connects Google Business Profile & runs visibility scan. |
| **Pulse Dashboard**     | Real-time analytics, Copilot coaching, and forecasting.                           |
| **Copilot + VoiceOrb**  | AI coaching layer with tone control, humor throttling, and PLG feedback.          |
| **Meta-Orchestrator**   | Executes jobs defined in all manifests, validates governance, and reports health. |
| **Supabase**            | Central data store for telemetry, metrics, and orchestration logs.                |

---

## ⚙️ 2. Repository Layout

```
/app                     → Next.js 13 App Router
  /onboarding            → onboarding flow
  /pulse                 → Pulse dashboard
  /api                   → Edge/Server routes
/components              → UI components
/hooks                   → React hooks (Copilot, telemetry, theme)
/lib                     → Core logic (orchestrator, governance, soundscape)
/manifests               → JSON manifests (master, roadmap, hyper-opt, meta-intel)
/scripts                 → Utility + CI scripts
/supabase                → SQL schema + migrations
/.github/workflows       → CI/CD pipelines
```

---

## 🔐 3. Authentication (Clerk Middleware)

* Location: `/middleware.ts`
* Protects all routes under `/pulse/*` and `/onboarding/*`.
* Injects headers:
  `x-dealer-id`, `x-user-role`, `x-session-id`
* Role matrix:

| Role        | Access                                           |
| ----------- | ------------------------------------------------ |
| **admin**   | all dashboards, orchestrator console, meta pages |
| **dealer**  | own Pulse data + Copilot                         |
| **analyst** | aggregated analytics only                        |

---

## 🧩 4. Onboarding Workflow

**Files:**

`/app/onboarding/page.tsx`, `/app/onboarding/components/DAICopilot.tsx`

**Steps**

1. **Connect GBP** – OAuth to Google Business Profile.
2. **Run AI Scan** – calls `/api/ai-scores`.
3. **Review Pulse Metrics** – Copilot explains AIV, AEO, GEO.
4. **Enable Auto-Fix** – runs `/api/runAutoFix`.
5. **Complete Setup** – stores personalization token → redirect to `/pulse/dashboard`.

**Telemetry**

Each step posts a `copilot_event` record to Supabase.

---

## 📊 5. Pulse Dashboard

**Files:** `/components/PulseDashboard.tsx`, `/components/PulseCard.tsx`

**Feeds:**

* `/api/ai-scores` – AI visibility
* `/data/lighthouse-history.json` – Forecast accuracy
* `/api/ugc-health` – Reviews / reputation
* `/api/traffic-metrics` – GA4 / ad conversions

**Copilot Integration:**

`/components/DAICopilot.tsx` + `/components/VoiceOrb.tsx`

**Admin Console:**

`/pulse/meta/orchestrator-console.tsx` – view orchestrator jobs, trigger manual runs (admins only).

---

## 🧠 6. Orchestrator

**File:** `/lib/meta-orchestrator.ts`

* Builds dependency graph from all manifests.
* Executes jobs → writes `/public/system-state.json`.
* Updates `lastRun` + `success` in each manifest.
* Posts Slack summaries to `#deployments`.

**Background Function:**

`/lib/orchestrator-background.ts`

– runs nightly via Vercel Cron.

**Console UI:**

`/pulse/meta/orchestrator-console.tsx`

– shows job history, durations, and run status.

---

## 🧾 7. Supabase Data Model

**Project:** [https://gzlgfghpkbqlhgfozjkb.supabase.co](https://gzlgfghpkbqlhgfozjkb.supabase.co)

**Key Tables**

| Table                     | Purpose                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `dealer_master`           | Dealer registry (brand, region).                                          |
| `dealer_metrics_daily`    | Daily KPIs: leads, appointments, impressions, conversions, AIV, AEO, GEO. |
| `aggregate_metrics_daily` | Global averages for correlation.                                          |
| `copilot_events`          | Copilot + feedback telemetry.                                             |
| `correlation_results`     | ML agent outputs.                                                         |
| `mood_report`             | Sentiment aggregation.                                                    |
| `orchestrator_log`        | Job history.                                                              |

**Retention:** 365 days (see cron job in schema).

**Region:** U.S. only.

---

## 🚀 8. CI/CD Deployment Workflow

**File:** `.github/workflows/dealershipai-deploy-master.yml`

Steps:

1. Validate all manifests.
2. Run orchestrator.
3. Build & deploy to Vercel.
4. Lighthouse check (≥ 90).
5. Governance validation.
6. Auto-rollback on failure.
7. Slack summary → `#deployments`.

---

## 🧩 9. Governance & Safe Mode

**Validator:** `/lib/governance-validator.ts`

**Policies:** `/policies/governance.yml`

**Safe Mode Handler:** `/lib/safe-mode-handler.ts`

If Lighthouse < 90 or governance fails →

rollback via `vercel rollback` and Slack alert.

---

## 🧮 10. Data Intelligence Agents

| Agent                 | File                                             | Output                      |
| --------------------- | ------------------------------------------------ | --------------------------- |
| **Correlation Agent** | `/agents/correlation-agent/correlation_agent.py` | `correlation_results` table |
| **Causal Agent**      | `/agents/causal-agent/causal_inference.py`       | `impact` field              |
| **Recommender**       | `/agents/recommender-agent/generate_insights.ts` | `/data/insight-feed.json`   |
| **Dealer Twin**       | `/api/dealer-twin`                               | `/data/dealer-twins.json`   |

---

## 📈 11. Daily & Weekly Jobs

| Schedule          | Job                        | Description                          |
| ----------------- | -------------------------- | ------------------------------------ |
| Nightly 01:00 UTC | Orchestrator Background    | runs orchestrator + governance check |
| Nightly 02:00 UTC | Correlation Agent          | learns new correlations              |
| Daily 05:00 UTC   | Lighthouse CI              | ensures ≥ 90 performance             |
| Friday 09:00 UTC  | Executive Summary Workflow | posts Slack + HTML report            |

---

## 🔔 12. Slack Notifications

All messages → `#deployments` channel.

| Trigger                 | Message                                                    |
| ----------------------- | ---------------------------------------------------------- |
| Successful deploy       | "✅ DealershipAI Deployment Complete"                       |
| Rollback                | "⚠️ Auto-Rollback executed due to performance regression." |
| Safe-mode entry         | "🛑 System entered SAFE MODE."                             |
| Orchestrator completion | "✅ Nightly Orchestration Complete."                        |

---

## 🧭 13. Access Levels

| Role        | Access Scope                                   |
| ----------- | ---------------------------------------------- |
| **Admin**   | Everything, including orchestrator console.    |
| **Dealer**  | Own Pulse dashboard + Copilot.                 |
| **Analyst** | Aggregate dashboards, no orchestrator control. |

---

## 🧰 14. Local Development

```bash
npm install
npm run dev
vercel dev
```

Test orchestrator locally:

```bash
node lib/meta-orchestrator.ts
```

Run governance check:

```bash
node lib/governance-validator.js
```

---

## 🧠 15. Common Operations

| Task                      | Command                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| Validate manifests        | `npm run manifests:validate`                                     |
| Manual deploy             | `vercel --prod --confirm`                                        |
| Force rollback            | `vercel rollback`                                                |
| Trigger orchestrator      | `curl https://dash.dealershipai.com/api/orchestrator-background` |
| View orchestrator console | `/pulse/meta/orchestrator-console` (admin only)                  |

---

## 🧩 16. Internal Guidelines

* **Editorial review:** New Copilot lines generated by models must be approved in *Copilot Studio* before release.
* **Telemetry:** All events are anonymized; only hashed dealerId stored.
* **Humor frequency:** ≤ 5 %.
* **Tone packs:** professional, witty, cinematic.
* **Region enforcement:** U.S. routing only.

---

## 📅 17. Quarterly Review Checklist

1. Review manifest versions and success metrics.
2. Regenerate Lighthouse baseline.
3. Audit retention policies and Supabase cron.
4. Evaluate Copilot feedback analytics.
5. Refresh tone packs and narrative arcs.
6. Deliver quarterly digest to executives via Slack link.

---

## ✅ 18. Summary

When all workflows, policies, and schemas are in place:

* Deploys are automatic after manifest validation.
* Governance + Lighthouse failures trigger instant rollback.
* Supabase stores compliant, U.S.-routed telemetry with 365-day retention.
* Copilot continues to learn correlations between AIV/AEO/GEO and business outcomes.
* The orchestrator manages every agent and keeps leadership informed.

---

This README becomes your internal **living documentation** — update it with each new manifest version so every engineer, analyst, and designer can understand how the cinematic intelligence stack operates end-to-end.

