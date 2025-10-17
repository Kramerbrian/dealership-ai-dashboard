# DealershipAI Ecosystem Architecture (2026 Build)

## 🏗 Master Repository Layout

```
dealershipAI/
│
├── app/
│   ├── (public)/                   # Marketing / anonymous routes
│   │   ├── page.tsx                # Main landing (dealershipAI.com)
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Footer.tsx
│   │   └── pricing/page.tsx        # Tier comparison (Ignition, Momentum, Hyperdrive)
│   │
│   ├── (auth)/                     # SSO entry
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (onboarding)/               # Fun Savannah-Bananas style flow
│   │   ├── onboarding/page.tsx
│   │   └── steps/
│   │       ├── 1-profile.tsx
│   │       ├── 2-integrations.tsx
│   │       └── 3-confirm.tsx
│   │
│   ├── (dashboard)/                # Authenticated routes (dashboard.dealershipAI.com)
│   │   ├── zeropoint/page.tsx      # "Grand Central" Command Center
│   │   ├── intelligence/page.tsx   # AI Visibility + QAI* core dashboard
│   │   ├── content/page.tsx        # Content Optimizer (broken links, CTAs, etc.)
│   │   ├── agents/page.tsx         # dAI Agents manager
│   │   ├── playbooks/page.tsx      # Playbook Composer
│   │   ├── api-units/page.tsx      # API Unit Store
│   │   ├── settings/page.tsx       # User/org settings
│   │   ├── reports/page.tsx        # Executive reports + exports
│   │   ├── competitive/page.tsx    # UGC + Market comparison
│   │   ├── alerts/page.tsx         # AI + Compliance alerts
│   │   ├── billing/page.tsx        # Billing summary (embedded in settings)
│   │   └── stubs/                  # Future modules
│   │       ├── blockdrive/page.tsx # OTT/CTV/Blockchain marketing module
│   │       ├── mystery-shop/page.tsx
│   │       ├── fixed-ops/page.tsx
│   │       ├── trends/page.tsx
│   │       └── export-api/page.tsx
│   │
│   ├── api/                        # Next.js API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── ai-scores/route.ts
│   │   ├── content-audit/route.ts
│   │   ├── billing/
│   │   │   └── buy-units/route.ts
│   │   ├── playbooks/route.ts
│   │   ├── agents/run-playbook/route.ts
│   │   ├── site-inject/route.ts
│   │   ├── crawl-graph/route.ts
│   │   ├── alerts/route.ts
│   │   ├── reports/route.ts
│   │   └── webhooks/[event]/route.ts
│   │
│   ├── layout.tsx                  # Global shell (CSP, Cupertino UI)
│   └── middleware.ts               # Tenant, SSO, and plan gating
│
├── components/                     # Global reusable UI
│   ├── NavBar.tsx
│   ├── Sidebar.tsx
│   ├── TrialNudgeBanner.tsx
│   ├── SettingsBilling.tsx
│   ├── BlurGate.tsx
│   ├── PlaybookComposer.tsx
│   ├── ContentOptimizer.tsx
│   ├── DealershipDashboard2026.tsx
│   ├── CompetitiveUGC.tsx
│   ├── ZeroClickTab.tsx
│   └── AIHealthPanel.tsx
│
├── lib/
│   ├── plans.ts                    # Ignition / Momentum / Hyperdrive tier config
│   ├── rbac.ts                     # Role + tier permissions
│   ├── quota.ts                    # Usage tracking + Redis counters
│   ├── scoring.ts                  # QAI*, HRP, PIQR, AEMD formulas
│   ├── nav.ts                      # Tabs + feature gating
│   ├── agents.ts                   # Orchestrator client logic
│   ├── siteInject.ts               # JSON-LD injector client
│   ├── apiUnits.ts                 # Unit pricing + calc utilities
│   └── utils.ts                    # Generic helpers
│
├── styles/
│   └── globals.css                 # Tailwind + Cupertino tokens
│
├── public/
│   ├── logos/                      # dealershipAI emblem, favicons
│   ├── illustrations/              # dashboard mockups, onboarding art
│   └── robots.txt
│
├── docker/
│   ├── docker-compose.yml          # local Redis, Postgres
│   ├── redis.conf
│   └── README.md
│
├── prisma/                         # DB schema
│   ├── schema.prisma               # tenants, users, locations, plans, quotas, playbooks
│   └── seed.ts
│
├── scripts/
│   ├── seed-demo-data.ts           # for trial/demo mode
│   ├── sync-aiv.ts                 # background AI visibility job
│   └── refresh-competitors.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Core Flow Overview

| Phase                   | Route                         | Purpose                                       |
| ----------------------- | ----------------------------- | --------------------------------------------- |
| **Marketing**           | `/`                           | LP with "Login" + "Create Account"            |
| **SSO / Auth**          | `/auth/signin` `/auth/signup` | OAuth or email magic link                     |
| **Onboarding**          | `/onboarding`                 | Collect site + integrations (GA4, GBP, Pixel) |
| **Landing after SSO**   | `/zeropoint`                  | Grand Central for dashboards, upgrades, APIs  |
| **Dashboard core**      | `/intelligence`               | QAI*, AI visibility, SEO/AEO/GEO metrics      |
| **Content optimizer**   | `/content`                    | Scans for CTAs, 404s, stock photos, schema    |
| **Agents / Playbooks**  | `/agents` `/playbooks`        | Automations and chained workflows             |
| **Billing / API store** | `/api-units` `/settings`      | Buy units, manage plan, billing               |
| **Expansion modules**   | `/stubs/...`                  | Placeholder routes for future products        |

## 🔑 Key Architecture Traits

1. **SSO-based PLG**
   All new and returning users route through the same Auth.js SSO; sessions hold role, tier, tenantId, and trial expiry.

2. **Tenant isolation**
   Per-location billing (tenantId + locationId); Redis quotas per location; RLS in Postgres.

3. **Dynamic feature gating**
   `lib/rbac.ts` + `lib/plans.ts` jointly decide visible tabs and permissions.

4. **BlurGate + TrialNudge**
   Trials keep dashboards visible but blurred; upgrade CTAs inline.

5. **API-first**
   Each major dashboard component has a dedicated API route for isolation, caching, and rate limits.

6. **Auto-fix pipeline**
   `/api/site-inject` and `/api/agents/run-playbook` handle verified schema/content injections.

7. **Edge caching & revalidation**
   Realtime endpoints (`ai-scores`) use per-plan TTLs from `lib/plans.ts`.

8. **Agent orchestration**
   * `reviewResponder`, `schemaFix` for Momentum+
   * `mysteryShop`, `playbookRunner` for Hyperdrive

9. **Predictive + Prescriptive analytics**
   QAI*, HRP, PIQR, and AEMD calculations live in `/lib/scoring.ts` and feed `/api/ai-scores`.

10. **ZeroPoint extensibility**
    Every new product (BlockDrive, Fixed Ops, CTV, API Hub) mounts as a tile inside `/zeropoint/page.tsx`.

## 🚀 How to Expand Later

| Future Product               | Folder              | Notes                                |
| ---------------------------- | ------------------- | ------------------------------------ |
| **BlockDrive CTV / OTT**     | `/stubs/blockdrive` | Blockchain attribution dashboard     |
| **Fixed Ops AI**             | `/stubs/fixed-ops`  | Service lane acquisition metrics     |
| **AI PR & Social**           | `/stubs/social`     | Reputation + media coverage tracking |
| **Advertising Intelligence** | `/stubs/ads`        | CTV + Paid search ROI comparison     |
| **DealerGPT Copilot**        | `/stubs/agent-chat` | AI chat workspace for dealer staff   |

## 🔒 Data & Compliance

* RLS in Postgres on `tenant_id`.
* OAuth scopes per integration (GA4, GBP, GSC).
* Audit logs for every API call and fix injection.
* Retention by tier (30 / 180 / 365 days).
* GDPR + CCPA compliance with export/delete endpoints.

## 🧩 External Integrations

| System                          | Integration Route                  |
| ------------------------------- | ---------------------------------- |
| Google GA4                      | `/onboarding/steps/2-integrations` |
| GBP / GMB                       | `/api/gmb-sync`                    |
| Facebook Pixel                  | `/onboarding` optional             |
| OpenAI / Anthropic / Perplexity | `/api/ai-scores`                   |
| Redis (cache/quota)             | `/lib/quota.ts`                    |
| Slack / Teams                   | `/api/webhooks/alerts`             |

## 🧠 DevOps & Deployment

| Layer          | Tech                                             |
| -------------- | ------------------------------------------------ |
| **Frontend**   | Next.js 14 (App Router), Tailwind, Framer Motion |
| **Backend**    | Next.js API Routes, Redis, Postgres              |
| **Auth**       | NextAuth (SSO: Google, Microsoft, Email)         |
| **Infra**      | Vercel + Upstash (Redis) + Supabase/Postgres     |
| **Jobs**       | Scheduled via Vercel Cron / Upstash QStash       |
| **Monitoring** | Sentry + Vercel Analytics                        |
| **CI/CD**      | GitHub Actions → Vercel Deploy Hooks             |

## 📊 PLG / Growth Hooks

* Trial metrics: `trial_started`, `trial_converted`, `blur_view`, `upgrade_clicked`.
* Daily digest emails (AI visibility trend, site health).
* Referral program link in header ("Invite a Friend → +50 queries").
* "DealerGPT Copilot" teaser chat inside ZeroPoint (read-only in trial).

## 🎯 User Flows

### Returning User
`dealershipAI.com → Login → SSO → dashboard.dealershipai.com/zeropoint`

### First-time User
`dealershipAI.com → Create Account → SSO signup → Onboarding (GA4, FB Pixel, GBP URL, GSC, CRM) → /zeropoint`

Both flows use the same SSO and land on **ZeroPoint Command Center**. Primary CTA = **Open Intelligence Dashboard → dash.dealershipai.com**.

## 🔧 Development Guidelines

1. **Always use TypeScript** for type safety
2. **Follow the established patterns** in existing components
3. **Implement proper error handling** and loading states
4. **Use the RBAC system** for all permission checks
5. **Cache aggressively** with proper TTLs per plan tier
6. **Log all significant actions** for audit trails
7. **Test with multiple tenant scenarios** for isolation
8. **Follow the established API patterns** for consistency

## 📈 Performance Targets

- **LCP**: < 2.5s on 3G
- **CLS**: < 0.1
- **API Response**: < 200ms p95
- **Cache Hit Rate**: > 80%
- **Uptime**: 99.9% SLA

## 🛡️ Security Checklist

- [ ] RLS enabled on all tenant tables
- [ ] Input validation on all API endpoints
- [ ] Rate limiting per tenant/IP
- [ ] Audit logging for sensitive operations
- [ ] Secure session management
- [ ] CSP headers configured
- [ ] Secrets properly managed
- [ ] Regular security audits

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
