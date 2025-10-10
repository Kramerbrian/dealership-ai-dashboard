# AOER Orchestrator System - Deployment Guide

## Overview

The AOER (Answer Engine Optimization Rating) Orchestrator is a self-improving analytics system that continuously computes and updates visibility metrics for dealerships. This guide covers the complete deployment process.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel API    │    │  AOER Worker    │    │   Supabase      │
│                 │    │                 │    │                 │
│ /api/aoer/queue │───▶│ Queue Processor │───▶│ aoer_summary    │
│ /api/aoer/cron  │    │ AOER Computer   │    │ metrics_events  │
│ /api/aoer/summary│   │ Metrics Logger  │    │ aoer_queue      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Expected Results Checklist

| Check                           | Expected Result                          |
| ------------------------------- | ---------------------------------------- |
| Worker starts                   | "AOER Orchestrator worker active"        |
| Queue job                       | `[AOER] Queued recompute for tenant ...` |
| Worker log                      | `[AOER] ✅ Completed recompute for ...`   |
| Supabase `aoer_summary` updated | `updated_at` within 2 min of cron        |
| Dashboard updates               | Live tile refresh via Realtime           |
| `metrics_events` grows          | new row per run                          |

## Deployment Steps

### 1. Environment Setup

Create the following environment variables in Vercel:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis Configuration (for queue management)
REDIS_URL=your_redis_url

# Worker Configuration
RUN_CRON=true

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_key
```

### 2. Database Migration

Run the Supabase migration to create AOER tables:

```bash
# Apply the migration
supabase db push

# Or manually run the SQL
psql $SUPABASE_URL -f supabase/migrations/20241220000002_aoer_tables.sql
```

### 3. Deploy to Vercel

```bash
# Deploy the application
vercel --prod

# Verify deployment
vercel ls
```

### 4. Start the Worker

The worker can be started in several ways:

#### Option A: Vercel Cron Job (Recommended)
The worker runs automatically via Vercel cron jobs defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/aoer/cron",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### Option B: Manual Worker Process
```bash
# Start the worker locally
node scripts/run-aoer-worker.js

# Or test the enqueue function
node -e "import('./workers/aoerOrchestrator.worker.js').then(m=>m.enqueueTenantRecompute('e1a63d30-4a8b-4bb9-86e8-48c7238a54de'))"
```

### 5. Test the System

Run the comprehensive test suite:

```bash
# Test the complete AOER system
node scripts/test-aoer-system.js

# Test just the enqueue function
node test-aoer-simple.js
```

## API Endpoints

### Queue Management
- `POST /api/aoer/queue` - Queue a tenant for recomputation
- `GET /api/aoer/queue?tenantId={id}` - Get queue status for a tenant

### AOER Data
- `GET /api/aoer/summary?tenantId={id}` - Get AOER summary for a tenant

### Automation
- `GET /api/aoer/cron` - Trigger manual cron job (queues all tenants)

## Database Schema

### aoer_summary
Stores computed AOER scores for each tenant:
```sql
CREATE TABLE aoer_summary (
    id UUID PRIMARY KEY,
    tenant_id UUID UNIQUE,
    aoer_score DECIMAL(5,2),
    visibility_risk DECIMAL(3,2),
    last_updated TIMESTAMPTZ,
    metrics JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### metrics_events
Tracks all AOER computation events:
```sql
CREATE TABLE metrics_events (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    event_type VARCHAR(50),
    event_data JSONB,
    created_at TIMESTAMPTZ
);
```

### aoer_queue
Manages the recomputation queue:
```sql
CREATE TABLE aoer_queue (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    priority VARCHAR(10),
    status VARCHAR(20),
    retry_count INTEGER,
    max_retries INTEGER,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

## Monitoring and Verification

### 1. Check Worker Status
```bash
# Check if worker is running
curl https://your-domain.vercel.app/api/aoer/queue?tenantId=test-tenant

# Expected response:
{
  "tenantId": "test-tenant",
  "queueStatus": {
    "pending": 0,
    "processing": 0,
    "completed": 1,
    "failed": 0
  }
}
```

### 2. Verify Database Updates
```sql
-- Check AOER summaries
SELECT * FROM aoer_summary ORDER BY updated_at DESC LIMIT 10;

-- Check metrics events
SELECT * FROM metrics_events WHERE event_type = 'aoer_recompute' ORDER BY created_at DESC LIMIT 10;

-- Check queue status
SELECT status, COUNT(*) FROM aoer_queue GROUP BY status;
```

### 3. Test Real-time Updates
The system should update the dashboard in real-time when AOER scores are recomputed. Check that:
- Dashboard tiles refresh automatically
- New metrics events appear in the logs
- AOER scores are updated within 2 minutes of cron execution

## Troubleshooting

### Common Issues

1. **Worker not starting**
   - Check environment variables are set correctly
   - Verify Supabase connection
   - Check Redis connection (if using Redis queue)

2. **Queue jobs not processing**
   - Verify the worker process is running
   - Check database permissions
   - Review error logs in `aoer_failures` table

3. **AOER scores not updating**
   - Check if `aiv_raw_signals` table has data
   - Verify the `compute_aoer_for_tenant` function works
   - Check for errors in the `update_aoer_summary` function

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View logs
vercel logs

# Test database connection
node -e "console.log(process.env.SUPABASE_URL)"

# Test AOER computation
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.rpc('compute_aoer_for_tenant', { tenant_uuid: 'test-tenant' }).then(console.log);
"
```

## Performance Optimization

### Queue Management
- Use priority levels: `urgent` > `high` > `medium` > `low`
- Implement exponential backoff for retries
- Monitor queue depth and processing times

### Database Optimization
- Index frequently queried columns
- Use connection pooling
- Implement data retention policies

### Caching Strategy
- Cache AOER summaries for 5 minutes
- Use Redis for queue management
- Implement dashboard data caching

## Security Considerations

- Use Row Level Security (RLS) on all tables
- Validate tenant access in all API endpoints
- Log all sensitive operations
- Use service role keys only for worker processes

## Scaling Considerations

- Deploy multiple worker instances for high throughput
- Use Redis for distributed queue management
- Implement horizontal scaling for database connections
- Monitor resource usage and scale accordingly

## Success Metrics

The system is working correctly when:

1. ✅ Worker starts and logs "AOER Orchestrator worker active"
2. ✅ Queue jobs are processed and logged
3. ✅ AOER summaries are updated in the database
4. ✅ Dashboard tiles refresh automatically
5. ✅ Metrics events are logged for each computation
6. ✅ Cron jobs run every 6 hours without errors

## Next Steps

After successful deployment:

1. Monitor the system for 24-48 hours
2. Verify all expected results are achieved
3. Set up alerting for failures
4. Document any customizations
5. Plan for scaling based on usage patterns

---

**Deployment Status**: ✅ Ready for Production
**Last Updated**: December 20, 2024
**Version**: 1.0.0
