# 🚀 DealershipAI Ultra-Prompt — Finalization + Optimization

**Purpose:** Bring the entire DealershipAI system (dashboard, scoring engine, automations, CI/CD, branding) to a final production-ready state.

---

## 1️⃣ Core Context
Repos: `dealership-ai`, `dealershipai-dashboard`, `dealershipai-agent-kit`
Stack: Next.js 14 App Router + TypeScript + Tailwind + Prisma/Drizzle + Supabase + Stripe + Clerk + Vercel
Architecture: Multi-tenant / RBAC (owner | admin | manager | marketing agent | superadmin)
Design: Cupertino minimalism — glass-blur, SF Pro, soft gradients, fluid motion
Tagline: **"Where signal replaces noise."**

---

## 2️⃣ Environment Workflow
```bash
./scripts/setup-env.sh
./scripts/sync-vercel-env.sh --force
vercel env ls
vercel --pre
vercel --prod
```

`.env.template` maintains parity across dev / preview / prod.

CI/CD = GitHub Actions → preview + production using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## 3️⃣ Scoring Engine (dAI Model)

File: `lib/scoring/algorithm.ts`

| Metric  | Purpose                        |
| ------- | ------------------------------ |
| **ATI** | Algorithmic Trust Index        |
| **AIV** | AI Visibility Index            |
| **VLI** | Vehicle Listing Integrity      |
| **OI**  | Offer Integrity                |
| **GBP** | Google Business Profile Health |
| **RRS** | Review & Reputation Score      |
| **WX**  | Web Experience                 |
| **IFR** | Inventory Freshness Recency    |
| **CIS** | Clarity Intelligence Score     |

Penalties: Policy violations, Parity failures, Feed staleness
Learning: Elastic Net → softmax weights (weekly)
Output: `score_report.json` per tenant (0-100)

---

## 4️⃣ Dashboard Routes

```
/[tenant]/dashboard
  /intelligence
  /ai-health
  /visibility
  /clarity
```

Hover KPIs, Cupertino motion, light default / dark toggle.
Data via `/api/ai-scores`, `/api/ai/answer-intel`, `/api/seo/report`.

---

## 5️⃣ API Endpoints

* `/api/stripe/webhook` — verified signature + subscription events
* `/api/clerk/webhook` — user/org lifecycle sync
* `/api/seo/hooks/metrics` — GA4 + Search Console updates
* `/api/ai/answer-intel` — SGE / Gemini / Perplexity probes
* `/api/tenants/[id]/scores` — tenant aggregates

---

## 6️⃣ Database Schema

Tables: tenants, users, subscriptions, ai_scores, avi_reports, seo_variant_metrics
RLS: enforced on `tenant_id`
Views: mv_weekly_variant, mv_visibility_leaderboard
Triggers: nightly AI score refresh, weekly weight retrain.

---

## 7️⃣ Automations

* Daily: AI Overviews sync, GBP checks, schema parity, CWV deltas
* Weekly: Elasticity training + dashboard refresh

---

## 8️⃣ Branding + Landing

Landing: `app/(marketing)/page.tsx`

> **Clarity = how well you're seen.**
> **Trust = how much the system believes you.**
> CTA: "Run Your Free Visibility Audit"
> Visual: sapphire-glass orb / Cupertino gradient
> Audit Modal → `/api/audit`

---

## 9️⃣ Documentation

`/docs` includes:

* `README.md` – env + CI/CD
* `ONBOARDING.md` – tenant setup
* `SCORING.md` – metrics + weights
* `AUTOMATIONS.md` – schedules
* `API.md` – routes + payloads

---

## 🔟 Quality Gate

✅ Env vars synced
✅ Webhooks verified
✅ CI/CD green
✅ Dashboard renders
✅ Scores per tenant
✅ Docs complete

---

### 🧭 Final Action Command

```
Finalize the full DealershipAI project.
1. Audit repos for missing envs / routes / pages.
2. Complete scoring engine and verify outputs.
3. Confirm Cupertino UI parity.
4. Validate Stripe + Clerk webhooks.
5. Run end-to-end preview + prod deploys.
6. Generate /docs pack.
7. Emit release-ready JSON summary of keys, weights, endpoints.
```

---
