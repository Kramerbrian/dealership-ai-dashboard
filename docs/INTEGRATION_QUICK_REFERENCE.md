# Integration Quick Reference

## 🚀 Ready to Wire Up

All endpoints are mock/stub implementations ready to swap for real services.

## Integration Checklist

### ✅ Foundation Complete
- [x] API routes created with tenant isolation
- [x] Components created (RelevanceOverlay, CoreWebVitalsCard, etc.)
- [x] Feature toggles implemented
- [x] Database schema ready (`prisma/schema.additions.prisma`)

### 🔌 Integration Points

#### 1. BullMQ Queue → Redis
**File**: `backend/engine/queue.ts`  
**Action**: Replace stub `enqueue()` with `lib/job-queue.ts`  
**See**: `docs/REAL_DATA_INTEGRATION_GUIDE.md` Section 1

#### 2. "Fix It" Buttons → `/api/schema/fix`
**File**: `app/api/schema/fix/route.ts`  
**Action**: Wire to BullMQ queue  
**See**: `docs/REAL_DATA_INTEGRATION_GUIDE.md` Section 2

#### 3. Real Data Sources
**Files**: `app/api/visibility/relevance/route.ts`, etc.  
**Action**: Replace mock data with Pulse/ATI/CIS/Probe APIs  
**See**: `docs/REAL_DATA_INTEGRATION_GUIDE.md` Section 3

#### 4. Slack Webhooks
**File**: `lib/alerts/slack.ts` (create)  
**Action**: Wire alert notifications  
**See**: `docs/REAL_DATA_INTEGRATION_GUIDE.md` Section 4

#### 5. Telemetry Storage
**File**: `lib/telemetry/storage.ts` (create)  
**Action**: Store events in Supabase  
**See**: `docs/REAL_DATA_INTEGRATION_GUIDE.md` Section 5

#### 6. RI Simulator
**File**: `app/components/RISimulator.tsx`  
**Action**: Wire to real data sources  
**See**: `docs/REAL_DATA_INTEGRATION_GUIDE.md` Section 6

#### 7. Evidence Packets
**File**: `app/api/evidence/packet/route.ts`  
**Status**: ✅ Updated with tenant isolation and real data fetching

## Quick Commands

### Test Locally
```bash
npm run dev
# Visit: http://localhost:3000/dashboard/visibility/relevance-overlay
```

### Run Migration
```bash
npx prisma migrate dev -n "dealer_scores_health"
```

### Check Queue Status
```bash
curl http://localhost:3000/api/jobs/queue
```

## Environment Variables Needed

```bash
# Redis (for BullMQ)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Data Sources
PULSE_API_URL=
PULSE_API_KEY=
ATI_API_URL=
ATI_API_KEY=
CIS_API_URL=
CIS_API_KEY=
PROBE_API_URL=
PROBE_API_KEY=

# Slack
SLACK_WEBHOOK_URL=
SLACK_ALERT_WEBHOOK_URL=

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Files Ready for Integration

### API Routes
- ✅ `/api/visibility/relevance` - Ready for Pulse/ATI data
- ✅ `/api/health/cwv` - Ready for real CWV data
- ✅ `/api/health/crawl` - Ready for crawl service
- ✅ `/api/schema/scs` - Ready for schema validation
- ✅ `/api/schema/fix` - Ready for BullMQ queue
- ✅ `/api/evidence/packet` - ✅ Updated with real data

### Components
- ✅ `RelevanceOverlay.tsx` - Ready for real data
- ✅ `CoreWebVitalsCard.tsx` - Ready for real data
- ✅ `RISimulator.tsx` - Ready to wire to data sources
- ✅ `EvidencePacketButton.tsx` - ✅ Working with real endpoint

### Services (Create)
- 📝 `lib/data-sources/pulse.ts` - Pulse API client
- 📝 `lib/data-sources/ati.ts` - ATI API client
- 📝 `lib/data-sources/cis.ts` - CIS API client
- 📝 `lib/data-sources/probe.ts` - Probe API client
- 📝 `lib/alerts/slack.ts` - Slack webhook service
- 📝 `lib/telemetry/storage.ts` - Telemetry storage
- 📝 `lib/jobs/processors.ts` - BullMQ job processors

## Next Steps

1. **Set up Redis** (Upstash recommended)
2. **Configure API keys** for data sources
3. **Create service files** (see guide)
4. **Wire up BullMQ** (replace stub)
5. **Test integrations** one by one
6. **Monitor** queue and alerts

## Documentation

- **Full Integration Guide**: `docs/REAL_DATA_INTEGRATION_GUIDE.md`
- **Testing Guide**: `docs/LOCAL_TESTING_GUIDE.md`
- **Navigation Guide**: `docs/NAVIGATION_INTEGRATION.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`

## Status

✅ **Foundation**: Complete  
🔌 **Integrations**: Ready to wire  
📊 **Data Sources**: Mock → Real (swap when ready)  
🚀 **Production**: Ready after integrations

