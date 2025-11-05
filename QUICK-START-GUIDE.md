# DealershipAI Orchestrator 3.0 - Quick Start Guide

## 🚀 Quick Setup (30 minutes)

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase or self-hosted)
- Redis (Upstash or self-hosted)
- Clerk account (for authentication)
- Vercel account (for deployment)

---

## 1. Install Dependencies (2 min)

```bash
npm install next@14 react@18 framer-motion lucide-react recharts
npm install @clerk/nextjs prom-client ioredis
npm install @prisma/client prisma
npm install -D @types/node @types/react @types/react-dom typescript
```

---

## 2. File Structure & Copy Locations

### Core Application Files

```
app/
├── api/
│   ├── attribution/route.ts          # ✅ Already created
│   ├── explain/route.ts              # ✅ Already created
│   ├── explainChart.ts               # ✅ Already created
│   ├── alert/route.ts                # Mount alertWebhook.ts here
│   └── dashboard/metrics/route.ts    # ✅ Already created
├── dashboards/
│   └── explain/
│       ├── ExplainCard.tsx           # ✅ Already created
│       └── ExplainChart.tsx          # ✅ Already created
└── (marketing)/
    └── pricing/
        └── page.tsx                  # Needs tier name updates

components/
├── dashboard/
│   ├── ROIDashboard.tsx              # ✅ Already created
│   ├── RecommendedActions.tsx        # ✅ Already created
│   ├── AIVBreakdown.tsx              # ✅ Already created
│   ├── MetricDetailModal.tsx         # ✅ Already created
│   ├── SignalComparison.tsx          # ✅ Already created
│   └── DashboardSkeleton.tsx         # ✅ Already created
└── ui/
    ├── tooltip.tsx                   # ✅ Exists
    └── card.tsx                      # ✅ Exists

lib/
├── attribution/
│   └── revenue-calculator.ts         # ✅ Already created
└── db.ts                             # Prisma client setup

backend/
├── services/
│   ├── schemaMetrics.ts              # ✅ Already created
│   ├── adaptiveRemediation.ts        # ✅ Already created
│   └── explainabilityService.ts      # ✅ Already created
├── api/
│   ├── alertWebhook.ts               # ✅ Already created
│   ├── explain.ts                    # ✅ Already created
│   └── explainChart.ts               # ✅ Already created
└── delegates/
    └── schemaRefreshDelegate.ts      # ✅ Already created

docker/
├── prometheus.yml                    # ✅ Updated
├── alertmanager/
│   └── alertmanager.yml              # ✅ Updated
└── prometheus/
    ├── validation-rules.yml          # ✅ Already created
    └── validation-alerts.yml         # ✅ Already created

database/
└── migrations/
    └── 001_schema_validation_system.sql  # ✅ Already created

charts/dealershipai/
├── templates/
│   ├── orchestrator-event-configmap.yaml  # ✅ Already created
│   └── hook-validate-json.yaml           # ✅ Already created
├── files/
│   └── orchestrator_event_system.json    # ✅ Already created
└── values.yaml                            # ✅ Already created
```

---

## 3. Environment Variables Setup (5 min)

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dealershipai"
POSTGRES_URL="${DATABASE_URL}"

# Redis
REDIS_URL="redis://localhost:6379"
# OR for Upstash:
# REDIS_URL="rediss://default:token@host:port"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
PERPLEXITY_API_KEY="pplx-..."

# Orchestrator
ORCHESTRATOR_URL="http://localhost:3001"
SCHEMA_ENGINE_URL="https://chat.openai.com/g/g-68cf0309aaa08191b390fbd277335d28"

# Prometheus
PROMETHEUS_URL="http://localhost:9090"
PROM_PUSHGATEWAY="http://localhost:9091"

# Slack
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
SLACK_BOT_TOKEN="xoxb-..."

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Feature Flags
NEXT_PUBLIC_ENABLE_EEAT="true"
NEXT_PUBLIC_ENABLE_AUTO_FIX="true"
NEXT_PUBLIC_ENABLE_RL_POLICY="true"
```

For Vercel deployment, add these same variables in the Vercel dashboard.

---

## 4. Database Setup (10 min)

### Run Migrations

```bash
# If using Prisma
npx prisma generate
npx prisma migrate dev

# Or run SQL directly
psql $DATABASE_URL -f database/migrations/001_schema_validation_system.sql
```

### Verify Tables Created

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'validation_failures',
  'schema_failure_clusters',
  'remediation_rewards',
  'decision_explanations',
  'feature_importance_history',
  'explainability_drift_log',
  'causal_attribution_log',
  'policy_simulation_grid',
  'bayesopt_runs',
  'compliance_ledger'
);
```

---

## 5. Mount Backend Routes (5 min)

### Update `backend/server.js`

Add these routes:

```javascript
import express from 'express';
import alertWebhook from './api/alertWebhook';
import explainRouter from './api/explain';
import explainChartRouter from './api/explainChart';
import { registerSchemaMetrics } from './services/schemaMetrics';

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/alert', alertWebhook);
app.use('/api/explain', explainRouter);
app.use('/api/explain/chart', explainChartRouter);

// Register Prometheus metrics
registerSchemaMetrics(app);

// ... rest of server.js
```

---

## 6. Update Next.js API Routes (5 min)

### Create `app/api/alert/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import alertWebhook from '@/backend/api/alertWebhook';

export async function POST(req: NextRequest) {
  // Proxy to backend alert webhook
  const body = await req.json();
  // ... handle alert webhook logic
  return NextResponse.json({ received: true });
}
```

---

## 7. Test Locally (10 min)

### Start Development Server

```bash
npm run dev
```

### Test Endpoints

```bash
# Test attribution API
curl http://localhost:3000/api/attribution?dealership=test-dealer-123

# Test explainability API
curl http://localhost:3000/api/explain/recent

# Test schema metrics
curl http://localhost:3000/api/metrics/schema
```

### Verify Database Connections

```bash
# Test Prisma connection
npx prisma studio
# Opens at http://localhost:5555
```

---

## 8. Deploy to Vercel (5 min)

### Initial Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel deploy

# Set production alias
vercel alias
```

### Environment Variables

Add all `.env.local` variables in Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add each variable for Production, Preview, and Development

### Verify Deployment

```bash
# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## 9. Post-Deployment Setup

### Configure Prometheus (if self-hosted)

```bash
# Update docker/prometheus.yml with your endpoints
# Restart Prometheus
docker-compose restart prometheus
```

### Set Up Alertmanager Webhooks

1. Update `docker/alertmanager/alertmanager.yml` with your Slack webhook
2. Restart Alertmanager:
   ```bash
   docker-compose restart alertmanager
   ```

### Import Grafana Dashboards

1. Access Grafana (usually `http://localhost:3002`)
2. Import dashboard JSONs:
   - `grafana/dashboards/orchestrator-validation.json`
   - `grafana/dashboards/gnn-analytics.json`

---

## 10. Verify System Health

### Check All Services

```bash
# Check API health
curl https://your-domain.vercel.app/api/health

# Check metrics endpoint
curl https://your-domain.vercel.app/api/metrics/schema

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM decision_explanations;"
```

### Monitor Logs

```bash
# Vercel logs
vercel logs --follow

# Local logs
npm run dev
# Check browser console for errors
```

---

## 11. Feature Flags & Configuration

### Update Feature Flags

Edit `.env.local` or Vercel environment variables:

```bash
NEXT_PUBLIC_ENABLE_EEAT=true
NEXT_PUBLIC_ENABLE_AUTO_FIX=true
NEXT_PUBLIC_ENABLE_RL_POLICY=true
NEXT_PUBLIC_ENABLE_EXPLAINABILITY=true
```

### Configure Autonomy Mode

Create `config/autonomy_mode.yaml`:

```yaml
mode: supervised
thresholds:
  health_index_apply: 2.0
  causal_impact_min: 0.0
  fairness_variance_max: 5.0
  guardrail_required: true
approvals:
  require_human_review: true
  approval_channel: "#exec-board"
  approval_timeout_hours: 4
```

---

## 12. Testing Checklist

- [ ] Attribution API returns valid JSON
- [ ] ROI Dashboard renders correctly
- [ ] Explainability API responds
- [ ] Schema metrics endpoint works
- [ ] Database migrations completed
- [ ] Alertmanager webhook receives alerts
- [ ] Grafana dashboards load
- [ ] Prometheus scrapes metrics
- [ ] Slack notifications work
- [ ] Environment variables loaded

---

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/dbname
```

**Redis Connection Failed**
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

**API Routes 404**
- Check file paths match Next.js App Router structure
- Ensure `route.ts` files are in `app/api/*/` directories

**Metrics Not Appearing**
- Verify Prometheus can reach `/api/metrics/schema`
- Check `registerSchemaMetrics(app)` is called

---

## Next Steps

1. **Configure Analytics**: Set up Mixpanel/GA4 tracking
2. **Set Up Monitoring**: Configure PagerDuty or similar
3. **Train RL Models**: Run initial RL policy training
4. **Enable Auto-Fix**: Test with canary dealers first
5. **Review Governance**: Set up compliance logging

---

## Support

- **Documentation**: See `docs/` directory
- **API Reference**: `/api/docs` endpoint (when implemented)
- **Slack**: #ai-ops channel for support

---

## Quick Command Reference

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma generate            # Generate Prisma client
npx prisma migrate dev         # Run migrations
npx prisma studio              # Open database GUI

# Deployment
vercel deploy                  # Deploy to Vercel
vercel logs                    # View logs
vercel env pull                # Pull env vars locally

# Testing
npm test                       # Run tests (when configured)
curl http://localhost:3000/api/health  # Health check
```

---

**Total Setup Time: ~30 minutes** ⏱️

Once complete, your DealershipAI Orchestrator 3.0 is live with:
- ✅ Adaptive remediation system
- ✅ RL policy training
- ✅ Explainability service
- ✅ ROI attribution dashboard
- ✅ Governance & health monitoring
- ✅ Self-healing webhooks

