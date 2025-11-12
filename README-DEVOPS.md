# DealershipAI Market Pulse™ - Developer Ops Edition

**Production-Ready Dashboard for AI Visibility Optimization**

🚀 **Quick Start:** `./scripts/bootstrap.sh` → Auto-configures environment in <5 minutes

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Core Stack](#core-stack)
3. [Environment Variables](#environment-variables)
4. [Development Commands](#development-commands)
5. [Directory Structure](#directory-structure)
6. [API Endpoints](#api-endpoints)
7. [CI/CD & Automation](#cicd--automation)
8. [Operational Cadence](#operational-cadence)
9. [Monitoring & Health Checks](#monitoring--health-checks)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone and bootstrap
git clone https://github.com/Kramerbrian/dealership-ai-dashboard.git
cd dealership-ai-dashboard
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh

# Starts dev server on http://localhost:3000
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local

# Update .env.local with your API keys

# Start development
npm run dev
```

### Option 3: OpenAI Agent / Cursor
```bash
# For autonomous agent operation
# Load cursor.json or openai-agent.yaml
# Agent will self-configure and manage deployments
```

---

## 🧩 Core Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | React meta-framework with SSR/SSG |
| **Language** | TypeScript (strict mode) | Type safety and IntelliSense |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first CSS + GPU-accelerated animations |
| **Auth** | Clerk | OAuth with custom domain support |
| **Database** | Supabase PostgreSQL | Postgres with realtime subscriptions |
| **Cache** | Upstash Redis | Serverless Redis for rate limiting |
| **Deployment** | Vercel | Edge functions + auto-scaling |
| **CI/CD** | GitHub Actions | Automated testing, building, deployment |
| **Monitoring** | Slack + GitHub | Real-time notifications |

---

## 🔐 Environment Variables

Create `.env.local` in project root:

```bash
# ============================================================================
# App Configuration
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================================================
# Authentication (Clerk) - REQUIRED
# ============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***

# Custom domain (production only)
NEXT_PUBLIC_CLERK_DOMAIN=dealershipai.com

# ============================================================================
# Database (Supabase) - REQUIRED
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://***supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ***
SUPABASE_SERVICE_ROLE_KEY=eyJ***

# Connection pooling (production)
DATABASE_URL=postgresql://postgres.***:6543/postgres?pgbouncer=true

# ============================================================================
# Cache (Upstash Redis) - OPTIONAL but recommended
# ============================================================================
UPSTASH_REDIS_REST_URL=https://***.upstash.io
UPSTASH_REDIS_REST_TOKEN=***

# ============================================================================
# AI Providers - OPTIONAL
# ============================================================================
OPENAI_API_KEY=sk-***
ANTHROPIC_API_KEY=sk-ant-***
PERPLEXITY_API_KEY=pplx-***
GOOGLE_API_KEY=AIza***

# ============================================================================
# External APIs - OPTIONAL
# ============================================================================
GOOGLE_PLACES_API_KEY=AIza***
YELP_API_KEY=***

# ============================================================================
# CI/CD & Monitoring
# ============================================================================
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/***
VERCEL_TOKEN=***
VERCEL_ORG_ID=team_***
VERCEL_PROJECT_ID=prj_***

# ============================================================================
# Orchestrator (for autonomous agents)
# ============================================================================
ORCHESTRATOR_API=https://api.dealershipai.com
ORCHESTRATOR_TOKEN=***
```

---

## 💻 Development Commands

### Core Development
```bash
# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Lint + auto-fix
npm run lint:fix
```

### Database Operations
```bash
# Start local Supabase stack
npx supabase start

# Stop local Supabase
npx supabase stop

# View local database
npx supabase db reset

# Push migrations to remote
npx supabase db push

# Pull schema from remote
npx supabase db pull

# Create new migration
npx supabase migration new migration_name
```

### Testing & Auditing
```bash
# Run endpoint audit (all 182 APIs)
node scripts/audit-all-endpoints.js

# Run schema health report
node scripts/schema-health-report.js

# Test specific endpoint
curl http://localhost:3000/api/health

# Test MarketPulse compute
curl "http://localhost:3000/api/marketpulse/compute?dealer=test.com&mock=true"
```

### Deployment
```bash
# Deploy to Vercel preview
npx vercel

# Deploy to production
npx vercel --prod

# View deployment logs
npx vercel logs https://your-deployment-url.vercel.app

# Rollback deployment
npx vercel rollback
```

---

## 📁 Directory Structure

```
dealership-ai-dashboard/
├── app/                          # Next.js 14 App Router
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   └── layout.tsx            # Dashboard layout + auth
│   ├── (marketing)/              # Marketing route group
│   │   ├── page.tsx              # Landing page
│   │   └── onboarding/page.tsx   # Onboarding flow
│   └── api/                      # API routes (182 endpoints)
│       ├── marketpulse/          # MarketPulse compute engine
│       ├── pulse/                # Pulse dashboard APIs
│       ├── ai/                   # AI visibility APIs
│       ├── metrics/              # Metrics & KPIs
│       ├── health/               # Health checks
│       └── ...                   # 72 total categories
│
├── components/                   # React components
│   ├── SystemOnlineOverlay.tsx   # Brand-tinted welcome animation
│   ├── pulse/                    # Pulse dashboard components
│   └── ui/                       # Reusable UI components
│
├── contexts/                     # React contexts
│   └── BrandColorContext.tsx     # Deterministic brand colors
│
├── lib/                          # Utilities & services
│   ├── seo/                      # SEO & structured data
│   │   ├── structured-data.ts    # JSON-LD schema templates
│   │   └── citations.json        # Citation registry
│   ├── adapters/                 # External service adapters
│   ├── cache.ts                  # Redis caching
│   ├── logger.ts                 # Structured logging
│   └── ratelimit.ts              # Rate limiting
│
├── functions/                    # OpenAI function calling
│   └── orchestratorTools.js      # Tool definitions
│
├── server/                       # Server-side runtime
│   └── orchestratorAgent.js      # OpenAI Assistants integration
│
├── scripts/                      # Automation scripts
│   ├── bootstrap.sh              # Automated environment setup
│   ├── audit-all-endpoints.js    # Endpoint health testing
│   ├── schema-health-report.js   # Schema coverage audit
│   └── deploy-production.sh      # Production deployment
│
├── .github/workflows/            # CI/CD pipelines
│   ├── deploy.yml                # Main deployment workflow
│   └── schema-health.yml         # Weekly schema audits
│
├── supabase/                     # Database configuration
│   ├── config.toml               # Supabase project config
│   └── migrations/               # SQL migrations
│
├── middleware.ts                 # Edge middleware (auth, routing)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── openai-agent.yaml             # OpenAI agent configuration
└── cursor.json                   # Cursor IDE configuration
```

---

## 🔗 API Endpoints

### Health & Status
- `GET /api/health` - System health check
- `GET /api/status` - Detailed status (DB, Redis, Clerk)
- `GET /api/system/status` - Full system diagnostics
- `GET /api/system/endpoints` - List all endpoints

### MarketPulse Engine
- `GET /api/marketpulse/compute?dealer={domain}&mock=true` - Compute KPIs
- `GET /api/pulse/score` - Overall Pulse score
- `GET /api/pulse/trends` - Trend analysis
- `GET /api/pulse/radar` - Pulse radar visualization
- `GET /api/pulse/snapshot` - Current snapshot

### Metrics & Analytics
- `GET /api/metrics/eeat` - E-E-A-T score
- `GET /api/metrics/qai` - Quality AI Index
- `GET /api/metrics/oel` - Organic Engagement Lift
- `GET /api/metrics/piqr` - Performance IQ Rating
- `GET /api/metrics/rar` - Revenue At Risk

### AI Visibility
- `GET /api/ai/visibility-index` - AI Visibility Index
- `GET /api/ai/metrics` - AI platform metrics
- `POST /api/ai/analyze` - Analyze website
- `GET /api/ai/health` - AI health status

### Schema & SEO
- `GET /api/schema/status` - Schema deployment status
- `POST /api/schema/validate` - Validate schema markup
- `POST /api/schema/request` - Request schema generation
- `GET /api/schema` - Get all schema markup

### Full Endpoint List
See [BACKEND_AUDIT_REPORT.md](BACKEND_AUDIT_REPORT.md) for complete list of all 182 endpoints with categories and status.

---

## ⚙️ CI/CD & Automation

### GitHub Actions Workflows

**1. Main Deployment** (`.github/workflows/deploy.yml`)
- Triggers: Push to `main`, `develop`, or PR to `main`
- Steps:
  1. Run tests (type-check, lint, unit tests)
  2. Build application
  3. Deploy preview (for PRs) or production (for `main`)
  4. Run post-deployment health check
  5. Send Slack notification

**2. Weekly Schema Health** (`.github/workflows/schema-health.yml`)
- Triggers: Every Monday 1PM UTC, manual dispatch
- Steps:
  1. Run `schema-health-report.js`
  2. Extract metrics (Schema Coverage, E-E-A-T)
  3. Send Slack notification with results
  4. Upload audit report as artifact (90-day retention)

### Required GitHub Secrets

Configure at: `https://github.com/YOUR_ORG/dealership-ai-dashboard/settings/secrets/actions`

| Secret Name | Description | Where to Get |
|------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel CLI access token | [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `npx vercel link` → check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `npx vercel link` → check `.vercel/project.json` |
| `SLACK_WEBHOOK` | Slack webhook URL | [Slack Apps → Incoming Webhooks](https://api.slack.com/messaging/webhooks) |

### Manual Triggers

```bash
# Trigger deployment workflow
gh workflow run deploy.yml --ref main

# Trigger schema health audit
gh workflow run schema-health.yml
```

---

## 📊 Operational Cadence

| Frequency | Task | Command | Output |
|-----------|------|---------|--------|
| **Daily** | Lighthouse + Core Web Vitals | `npm run lighthouse` | Performance metrics |
| **Weekly** | Schema Health Audit | Auto (GitHub Actions) | Slack report + artifact |
| **Weekly** | Endpoint Health Test | `node scripts/audit-all-endpoints.js` | 182-endpoint report |
| **Monthly** | Dependency updates | `npm outdated && npm update` | Updated packages |
| **Monthly** | Security audit | `npm audit && npm audit fix` | Vulnerability report |
| **Quarterly** | Orchestrator refresh | Manual | Updated KPI weights |

---

## 🔍 Monitoring & Health Checks

### Automated Monitoring

**Endpoint Health** - Run automatically in CI/CD:
```bash
node scripts/audit-all-endpoints.js
```
- Tests all 182 endpoints
- Generates JSON + Markdown reports
- Alerts on >10% failure rate

**Schema Health** - Weekly automated report:
```bash
node scripts/schema-health-report.js
```
- Checks E-E-A-T score
- Validates JSON-LD coverage
- Alerts if <90% coverage

### Manual Health Checks

```bash
# Quick system check
curl http://localhost:3000/api/health

# Full diagnostics
curl http://localhost:3000/api/system/status

# Database connectivity
curl http://localhost:3000/api/probe/verify

# MarketPulse engine
curl "http://localhost:3000/api/marketpulse/compute?dealer=test.com&mock=true"
```

### Slack Notifications

All CI/CD events post to `#deployments` channel:
- ✅ Successful deployments
- ❌ Failed builds/deploys
- ⚠️ Schema coverage <90%
- 📊 Weekly health reports

---

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails: "Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

**2. All API Endpoints Return 404**
```bash
# Check Next.js build output
npm run build

# Verify route files exist
find app/api -name "route.ts" | wc -l  # Should be 182

# Redeploy to production
npx vercel --prod
```

**3. Clerk Auth Not Working**
```bash
# Verify environment variables
grep CLERK .env.local

# Check middleware configuration
cat middleware.ts | grep -A 5 "clerkMiddleware"

# Test auth endpoint
curl http://localhost:3000/api/auth/me
```

**4. Supabase Connection Errors**
```bash
# Test connection
npx supabase status

# Reset local database
npx supabase db reset

# Verify environment variables
grep SUPABASE .env.local
```

**5. Redis Rate Limiting Not Working**
```bash
# Verify Upstash connection
curl -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
  "$UPSTASH_REDIS_REST_URL/ping"

# Test rate limit endpoint
for i in {1..10}; do curl http://localhost:3000/api/test; done
```

### Debugging Tips

**Enable verbose logging:**
```bash
# .env.local
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG=true
```

**Check build artifacts:**
```bash
# View build output
ls -lah .next/server/app/api/

# Check route manifests
cat .next/routes-manifest.json | jq '.staticRoutes'
```

**Monitor real-time logs:**
```bash
# Vercel logs
npx vercel logs https://your-deployment.vercel.app --follow

# Local dev logs
npm run dev | grep -i error
```

---

## 🚀 Production Deployment Checklist

- [ ] Run `npm run build` locally - verify no errors
- [ ] Run `node scripts/audit-all-endpoints.js` - all endpoints pass
- [ ] Run `node scripts/schema-health-report.js` - coverage ≥90%
- [ ] Update `.env.production` with production values
- [ ] Verify GitHub secrets configured
- [ ] Test Clerk authentication on staging
- [ ] Verify Supabase migrations applied
- [ ] Check Redis connection
- [ ] Deploy to Vercel: `npx vercel --prod`
- [ ] Run post-deployment health check
- [ ] Verify custom domain DNS records
- [ ] Test critical user flows
- [ ] Monitor Slack for deployment notifications

---

## 📚 Additional Resources

- **Main README:** [README.md](README.md) - Project overview
- **Backend Audit:** [BACKEND_AUDIT_REPORT.md](BACKEND_AUDIT_REPORT.md) - Endpoint health
- **Deployment Guide:** [FINAL_DEPLOYMENT_STEPS.md](FINAL_DEPLOYMENT_STEPS.md)
- **System Overlay:** [docs/SYSTEM_ONLINE_OVERLAY.md](docs/SYSTEM_ONLINE_OVERLAY.md)
- **GitHub Actions:** [docs/GITHUB_ACTIONS_SETUP.md](docs/GITHUB_ACTIONS_SETUP.md)

---

## 👥 Team Onboarding

**New Engineer Onboarding (<10 minutes):**

1. **Clone repo**: `git clone https://github.com/Kramerbrian/dealership-ai-dashboard.git`
2. **Bootstrap**: `./scripts/bootstrap.sh`
3. **Configure secrets**: Update `.env.local` with Clerk, Supabase, Redis keys
4. **Start dev**: `npm run dev`
5. **Verify**: Visit http://localhost:3000 → should see landing page
6. **Read docs**: Review this README + [CLAUDE.md](CLAUDE.md)

**Key Files to Understand:**
1. `app/(dashboard)/dashboard/page.tsx` - Main dashboard
2. `app/api/marketpulse/compute/route.ts` - Core KPI engine
3. `middleware.ts` - Auth + routing logic
4. `lib/seo/structured-data.ts` - Schema markup
5. `components/SystemOnlineOverlay.tsx` - Brand UX

---

## 📞 Support

- **Issues:** https://github.com/Kramerbrian/dealership-ai-dashboard/issues
- **Documentation:** [Full docs](https://github.com/Kramerbrian/dealership-ai-dashboard/tree/main/docs)
- **Slack:** #dealershipai-dev

---

**Status:** ✅ Production-Ready
**Last Updated:** 2025-11-12
**Version:** 3.0.0 (Orchestrator)
**Maintainer:** DealershipAI Team
