# DealershipAI - Next Steps Summary

## ✅ Completed

### 1. OEM Agent System
- **Schema definitions** (`lib/oem/schema.ts`) - Structured JSON schema for OEM model updates
- **Monitor endpoint** (`app/api/oem/monitor/route.ts`) - Watches OEM pressrooms and triggers parsing
- **Parser endpoint** (`app/api/oem/parse/route.ts`) - Standalone parsing endpoint
- **Transformer** (`lib/oem/transformer.ts`) - Converts OEM JSON to Pulse inbox tiles
- **Brand routing** (`lib/oem/brand-routing.ts`) - Routes updates to correct dealer rooftops

### 2. Master Deployment System
- **Deployment manifest** (`manifests/dealershipai-deploy-master.json`) - Complete deployment blueprint
- **CI/CD workflow** (`.github/workflows/dealershipai-deploy-master.yml`) - Automated deployment with auto-rollback
- **Deployment guide** (`docs/DEPLOY_MASTER_GUIDE.md`) - Comprehensive deployment documentation

### 3. Orchestrator Infrastructure
- **Background API** (`app/api/orchestrator-background/route.ts`) - Daily Vercel cron endpoint
- **Console dashboard** (`app/(dashboard)/pulse/meta/orchestrator-console/page.tsx`) - Admin monitoring interface
- **Status API** (`app/api/orchestrator/status/route.ts`) - Enhanced with job details
- **Telemetry schema** (`supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql`) - 365-day retention with auto-cleanup

## 🚀 Immediate Next Steps

### 1. Run Database Migration
```bash
# Apply the telemetry schema migration
psql $DATABASE_URL -f supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql

# Or via Supabase CLI
supabase db push
```

### 2. Configure Environment Variables
Add to Vercel:
- `CRON_SECRET` - Secret for cron job authentication
- `VERCEL_TOKEN` - For rollback functionality
- `VERCEL_PROJECT_ID` - For rollback functionality

### 3. Test Orchestrator Console
1. Deploy to Vercel
2. Visit `/pulse/meta/orchestrator-console`
3. Verify system state loads correctly
4. Test manual trigger button

### 4. Test OEM Monitor
```bash
# Test parsing a Toyota pressroom page
curl -X POST http://localhost:3000/api/oem/parse \
  -H "Content-Type: application/json" \
  -d '{
    "oem": "Toyota",
    "url": "https://pressroom.toyota.com/the-2026-toyota-tacoma-adventure-awaits/"
  }'

# Test full monitoring workflow
curl -X POST http://localhost:3000/api/oem/monitor \
  -H "Content-Type: application/json" \
  -d '{
    "oem": "Toyota",
    "model": "Tacoma",
    "filterByModel": false
  }'
```

### 5. Set Up Brand-to-Tenant Mappings
Update `lib/oem/brand-routing.ts` to query your database:
```typescript
// Replace TODO with actual Prisma query
const dealers = await prisma.dealer.findMany({
  where: { brands: { has: brand } },
  select: { id: true, domain: true }
});
```

## 📋 Pending Tasks

### 1. OEM Documentation
Create `docs/OEM_AGENT_SYSTEM.md` with:
- Architecture overview
- Setup instructions
- API usage examples
- Brand routing configuration
- Troubleshooting guide

### 2. Integrate OEM Monitor with Cron
Add to `vercel.json`:
```json
{
  "path": "/api/oem/monitor",
  "schedule": "0 6 * * *"  // Daily at 6 AM UTC
}
```

### 3. Enhance Orchestrator Background
- Add Supabase telemetry logging
- Implement retry logic for failed jobs
- Add job dependency validation

### 4. Console Dashboard Enhancements
- Add job execution history graph
- Show governance policy violations
- Display safe mode activation history
- Add export functionality for reports

## 🔧 Configuration Checklist

### Vercel Cron Jobs
- [x] `/api/orchestrator-background` - Daily at 1 AM UTC
- [ ] `/api/oem/monitor` - Daily at 6 AM UTC (pending)
- [x] `/api/nightly-lighthouse` - Daily at 3 AM UTC

### Environment Variables Required
- [x] `SLACK_WEBHOOK_URL` - For notifications
- [x] `OPENAI_API_KEY` - For OEM parsing
- [ ] `CRON_SECRET` - For cron authentication
- [ ] `VERCEL_TOKEN` - For rollback
- [ ] `VERCEL_PROJECT_ID` - For rollback

### Database Setup
- [ ] Run telemetry migration
- [ ] Configure pg_cron extension (if available)
- [ ] Set up RLS policies for admin access
- [ ] Test cleanup function manually

## 📊 Monitoring & Validation

### Test Orchestrator Background
```bash
# Manual trigger
curl -X POST https://dash.dealershipai.com/api/orchestrator-background \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Check System State
```bash
# View current state
curl https://dash.dealershipai.com/api/orchestrator/status | jq '.'
```

### Verify Console Access
1. Ensure user has admin role in Clerk
2. Visit `/pulse/meta/orchestrator-console`
3. Verify data loads and auto-refresh works

## 🎯 Success Criteria

### Orchestrator System
- [ ] Background job runs daily without errors
- [ ] Console dashboard displays real-time data
- [ ] Governance validation works correctly
- [ ] Auto-rollback triggers on failures
- [ ] Slack notifications sent successfully

### OEM Agent System
- [ ] Can parse Toyota pressroom pages
- [ ] Generates correct Pulse tiles
- [ ] Routes to correct dealer tenants
- [ ] Integrates with existing Pulse inbox

### Deployment System
- [ ] CI/CD workflow runs on push to main
- [ ] Auto-rollback works on Lighthouse < 90
- [ ] Deployment validation passes
- [ ] Slack notifications sent

## 📚 Documentation to Create

1. **OEM Agent System Guide** - Complete setup and usage
2. **Orchestrator Console User Guide** - How to use the admin dashboard
3. **Telemetry Schema Reference** - Database schema documentation
4. **Deployment Troubleshooting** - Common issues and solutions

## 🔗 Related Files

- Master Deployment Manifest: `manifests/dealershipai-deploy-master.json`
- Deployment Guide: `docs/DEPLOY_MASTER_GUIDE.md`
- OEM Schema: `lib/oem/schema.ts`
- Orchestrator Background: `app/api/orchestrator-background/route.ts`
- Console Dashboard: `app/(dashboard)/pulse/meta/orchestrator-console/page.tsx`
- Telemetry Schema: `supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql`

