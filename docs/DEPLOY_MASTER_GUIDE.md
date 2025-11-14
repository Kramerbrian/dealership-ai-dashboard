# DealershipAI Master Deployment Guide

## Overview

The **Master Deployment Manifest** (`/manifests/dealershipai-deploy-master.json`) orchestrates the complete post-landing system deployment, including:

- Clerk authentication middleware
- Onboarding workflow
- Pulse Dashboard
- Meta-orchestrator intelligence stack
- Agent systems (correlation, causal, recommender)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Landing Page (Pre-Deploy)                   │
│         https://dealershipai.com                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         Master Deployment Manifest                       │
│    /manifests/dealershipai-deploy-master.json            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Deployment Targets                          │
│  • Onboarding (/app/onboarding/)                         │
│  • Clerk Middleware (/middleware.ts)                     │
│  • Pulse Dashboard (/app/pulse/)                         │
│  • Meta-Orchestrator (/lib/meta-orchestrator.ts)         │
│  • Agent Systems                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         CI/CD Pipeline                                   │
│    .github/workflows/dealershipai-deploy-master.yml      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         Production Deployment                            │
│         dash.dealershipai.com                            │
└─────────────────────────────────────────────────────────┘
```

## Deployment Sequence

### Phase 1: Pre-Deploy Validation

1. **Verify Landing Page**
   - Landing page live at `https://dealershipai.com`
   - Text rotator active
   - Ambient audio muted by default
   - Lighthouse score ≥ 90

2. **Validate Manifests**
   ```bash
   npm run manifests:validate
   ```

3. **Check Branch**
   - Must be on `main` branch
   - All changes committed

### Phase 2: Build & Test

1. **Install Dependencies**
   ```bash
   npm ci --legacy-peer-deps
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Type Check & Lint**
   ```bash
   npm run type-check
   npm run lint
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

### Phase 3: Orchestration

1. **Run Meta-Orchestrator**
   ```bash
   node lib/meta-orchestrator.ts
   ```

2. **Validate System State**
   - Check `/public/system-state.json`
   - Verify all jobs executed successfully

### Phase 4: Deployment Health Index (DHI)

Calculate DHI before deployment:

```
DHI = (Build Status × 40) + (Orchestrator Status × 30) + (Validation Status × 30)
```

**Threshold:** DHI ≥ 80 required for deployment (unless `force_deploy` is enabled)

### Phase 5: Vercel Deployment

1. **Deploy to Production**
   ```bash
   vercel --prod --confirm
   ```

2. **Verify Environment Variables**
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_FRONTEND_API`
   - `OPENAI_API_KEY`
   - `SLACK_WEBHOOK_URL`

### Phase 6: Post-Deploy Validation

1. **Health Checks**
   - Dashboard accessible: `https://dash.dealershipai.com/api/health`
   - Onboarding route responds correctly
   - Clerk authentication working

2. **Performance Validation**
   - Lighthouse CI on dashboard
   - p95 latency < 150ms
   - Accessibility score ≥ 95

3. **Functional Tests**
   - First login → redirects to `/onboarding`
   - Returning user → redirects to `/pulse/dashboard`
   - Pulse cards load within 1.5s

## Onboarding Workflow

The onboarding flow consists of 5 steps:

1. **Connect Google Business Profile**
   - OAuth flow to connect GBP
   - Pulls initial visibility metrics

2. **Run AI Visibility Scan**
   - Triggers `/api/ai-scores`
   - Generates baseline AIV, AEO, GEO scores

3. **Review Pulse Metrics**
   - Displays live Pulse cards
   - Copilot explains metrics in context

4. **Enable Auto-Fix**
   - Activates automated schema optimizations
   - Enables photo optimization

5. **Complete Setup**
   - Saves personalization token
   - Redirects to `/pulse/dashboard`

## Clerk Middleware

The middleware (`/middleware.ts`) protects all authenticated routes:

- **Protected Routes:**
  - `/pulse/*`
  - `/onboarding/*`
  - `/api/pulse/*`

- **Headers Injected:**
  - `x-dealer-id`
  - `x-user-role`
  - `x-session-id`

- **Role-Based Access:**
  - **Admin:** View all dealers
  - **Dealer:** Self only
  - **Analyst:** Reports only

- **Session Management:**
  - Hourly JWT rotation
  - Session persistence via Clerk
  - On failure → redirect to `/sign-in`

## Pulse Dashboard

The Pulse Dashboard is the command center that fuses:

- **Pulse Grid:** Tiles for AI Visibility, Trust, Conversion, Operations, Growth
- **Copilot Column:** Contextual chat + hints, sentiment feedback
- **Voice Orb:** Manual trigger for quotes (5% Easter-egg chance)
- **Forecast Panel:** Live predictive analytics (AIV → Appointments)
- **Meta Console:** Orchestrator results, latency, tone balance

### Data Sources

- `/api/ai-scores` - AI Visibility metrics
- `/data/lighthouse-history.json` - Performance trends
- `/api/ugc-health` - Review & UGC health
- `/api/traffic-metrics` - Site traffic data

### Real-Time Updates

Each tile subscribes to `/api/pulse-stream` (SSE) for real-time updates.

## Meta-Orchestrator

The orchestrator (`/lib/meta-orchestrator.ts`) executes jobs defined in system manifests:

### Linked Manifests

- `dealershipai-master-manifest.json`
- `dealershipai-hyper-optimization-manifest.json`
- `dealershipai-meta-intelligence-manifest.json`

### Outputs

- `/public/system-state.json` - Current system state
- `/data/orchestration-history.json` - Execution history

### Governance

- **Validator:** `/lib/governance-validator.ts`
- **Safe Mode Handler:** `/lib/safe-mode-handler.ts`
- **Policies:** `/policies/governance.yml`

## Agent Systems

The deployment includes several agent systems:

- **Correlation Agent:** `/agents/correlation-agent/correlation_agent.py`
- **Causal Agent:** `/agents/causal-agent/causal_inference.py`
- **Recommender Agent:** `/agents/recommender-agent/generate_insights.ts`
- **Dealer Twin:** `/api/dealer-twin`
- **Knowledge Graph:** `/scripts/graph-sync.ts`
- **Executive Reports:** `/scripts/executive-report.ts`

## Success Criteria

The deployment is considered successful when:

- **Lighthouse Performance:** ≥ 90
- **Copilot Sentiment:** ≥ 0.8
- **Forecast Accuracy:** ≤ ±5%
- **Accessibility:** ≥ 95
- **Uptime:** ≥ 99.99%

## Manual Deployment

If you need to deploy manually:

```bash
# 1. Checkout main branch
git checkout main

# 2. Build
npm run build

# 3. Validate manifests
npm run manifests:validate

# 4. Run orchestrator
node lib/meta-orchestrator.ts

# 5. Validate deployment
node scripts/validate-deployment.js

# 6. Commit and push
git add .
git commit -m "deploy: full system post-landing"
git push origin main

# 7. Deploy to Vercel
vercel --prod --confirm
```

## CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/dealershipai-deploy-master.yml`) automatically:

1. Validates manifests
2. Verifies landing page
3. Builds and tests
4. Runs meta-orchestrator
5. Calculates DHI
6. Deploys to Vercel
7. Runs post-deploy checks
8. Posts summary to Slack

### Workflow Triggers

- **Push to main:** Automatically triggers on changes to:
  - `manifests/dealershipai-deploy-master.json`
  - `app/**`
  - `components/**`
  - `lib/**`
  - `middleware.ts`

- **Manual Dispatch:** Can be triggered manually with options:
  - `skip_validation`: Skip pre-deploy validation
  - `force_deploy`: Force deployment even if checks fail

## Troubleshooting

### Build Fails

1. Check Node version (must be 20)
2. Verify all dependencies installed: `npm ci --legacy-peer-deps`
3. Check Prisma schema: `npx prisma generate`
4. Review build logs for specific errors

### DHI Below Threshold

1. Review orchestrator output: `public/system-state.json`
2. Check validation results: `scripts/validate-deployment.js`
3. Review build logs for warnings
4. Use `force_deploy` only if necessary

### Post-Deploy Checks Fail

1. Wait 30-60 seconds for deployment to stabilize
2. Check Vercel deployment logs
3. Verify environment variables are set
4. Test health endpoint manually: `curl https://dash.dealershipai.com/api/health`

### Clerk Authentication Issues

1. Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_FRONTEND_API` are set
2. Check middleware configuration in `middleware.ts`
3. Verify domain configuration in Clerk dashboard
4. Check browser console for authentication errors

## Next Steps

After successful deployment:

1. Monitor Slack channel `#deployments` for notifications
2. Check `/pulse/meta/executive-console` for system metrics
3. Review executive reports: `/reports/daily-summary.pdf`
4. Monitor orchestrator execution: `public/system-state.json`

## Support

For issues or questions:

1. Check deployment logs in GitHub Actions
2. Review Vercel deployment logs
3. Check Slack notifications
4. Review system state: `public/system-state.json`

