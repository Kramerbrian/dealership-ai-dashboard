# KPI History System

## Overview

The KPI History system provides automated, idempotent aggregation of key performance indicators across all tenants. It runs daily via cron jobs and maintains a historical record of AVI metrics, elasticity data, and VLI integrity scores.

## Architecture

### Database Schema

```sql
-- Tenants table for multi-tenant support
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- KPI history aggregation table
CREATE TABLE kpi_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  aiv_pct numeric(5,2),
  ati_pct numeric(5,2),
  crs_pct numeric(5,2),
  elasticity_usd_per_point numeric(10,2),
  vli_integrity_pct numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, as_of)
);
```

### Key Features

- **Idempotent**: Safe to run multiple times without duplicates
- **Multi-tenant**: RLS enforced with tenant isolation
- **Automated**: Daily cron job at 4 AM UTC
- **Flexible**: Supports both single-tenant and all-tenant processing
- **Secure**: Requires cron secret for execution

## API Endpoints

### Cron Endpoint

```bash
# Single tenant processing
curl -X POST "$BASE_URL/api/internal/cron/kpi-history" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{"tenantId":"00000000-0000-0000-0000-000000000000"}'

# All tenants processing
curl -X POST "$BASE_URL/api/internal/cron/kpi-history" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{}'
```

### Query Endpoint

```bash
# Get KPI history (JSON)
curl "$BASE_URL/api/kpi/history?limit=52&format=json" \
  -H "x-tenant: 00000000-0000-0000-0000-000000000000"

# Export to CSV
curl "$BASE_URL/api/kpi/history?format=csv" \
  -H "x-tenant: 00000000-0000-0000-0000-000000000000" \
  -o kpi-history.csv
```

## Data Sources

The system aggregates data from:

1. **AVI Reports**: Latest weekly AIV, ATI, CRS percentages and elasticity
2. **VLI Audit**: Vehicle listing integrity scores (falls back to 100% if missing)
3. **Clarity JSON**: HRP (Hallucination Risk Probability) from clarity metrics

## Configuration

### Environment Variables

```bash
# Required for cron security
CRON_SECRET=your-secure-cron-secret

# Database connection
DATABASE_URL=postgresql://...
```

### Vercel Configuration

```json
{
  "crons": [
    {
      "path": "/api/internal/cron/kpi-history",
      "schedule": "0 4 * * *",
      "method": "POST",
      "headers": {
        "x-cron-secret": "@cron_secret"
      },
      "body": "{}"
    }
  ]
}
```

## Usage Examples

### Manual Execution

```bash
# Test the system
./scripts/test-kpi-history.sh

# Single tenant refresh
curl -X POST "$BASE_URL/api/internal/cron/kpi-history" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{"tenantId":"your-tenant-id"}'
```

### Programmatic Access

```typescript
import { fillKpiHistory } from '@/jobs/fillKpiHistory';

// Fill history for specific tenant
const result = await fillKpiHistory('tenant-id');
console.log(result); // { ok: true, as_of: '2024-01-01' }

// Fill history for all tenants
const { fillAllKpiHistory } = await import('@/jobs/fillKpiHistory');
const results = await fillAllKpiHistory();
console.log(results); // { ok: 5, total: 10, errors: [] }
```

## Monitoring

### Health Check

```bash
curl "$BASE_URL/api/internal/cron/kpi-history"
# Returns: {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Error Handling

The system handles various error conditions:

- **NO_AVI**: No AVI reports found for tenant
- **FORBIDDEN**: Invalid cron secret
- **INTERNAL_ERROR**: Database or processing errors

### Logging

All operations are logged with:
- Tenant ID
- Timestamp
- Success/failure status
- Error details (if applicable)

## Data Retention

- **KPI History**: Retained indefinitely (aggregated weekly data)
- **AVI Reports**: Source data retained per tenant plan
- **VLI Audit**: Source data retained per tenant plan

## Security

- **RLS**: All queries filtered by tenant_id
- **Authentication**: Cron secret required for execution
- **Authorization**: Tenant isolation enforced
- **Audit**: All operations logged

## Troubleshooting

### Common Issues

1. **"NO_AVI" Error**: Tenant has no AVI reports
   - Solution: Ensure AVI computation job has run

2. **"FORBIDDEN" Error**: Invalid cron secret
   - Solution: Check CRON_SECRET environment variable

3. **Database Errors**: Connection or query issues
   - Solution: Check DATABASE_URL and network connectivity

### Debug Mode

```bash
# Enable debug logging
DEBUG=kpi-history:* npm run dev

# Test with verbose output
./scripts/test-kpi-history.sh
```

## Performance

- **Execution Time**: ~100ms per tenant
- **Memory Usage**: Minimal (streaming processing)
- **Database Load**: Single upsert per tenant per week
- **Concurrency**: Parallel processing for all tenants

## Future Enhancements

- [ ] Real-time metrics streaming
- [ ] Advanced aggregation (monthly, quarterly)
- [ ] Anomaly detection and alerting
- [ ] Custom KPI definitions per tenant
- [ ] Export to external analytics platforms
