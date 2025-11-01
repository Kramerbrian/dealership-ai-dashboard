# Orchestrator Diagnostics & AI Scores Integration

## Overview

Unified diagnostics system combining MSRP sync monitoring, AI score summaries, and orchestrator health metrics.

**Version:** 2025.11.03
**Status:** ✅ Production Ready

## Quick Start

### API Endpoint

```bash
GET /api/diagnostics/msrp-sync?tenantId=dealer123&includeAiScores=true
Authorization: Bearer <token>
```

### Response Example

```json
{
  "freshnessScore": 95.5,
  "businessIdentityMatch": 100,
  "diagnostics": {
    "lastRun": "2025-11-03T10:30:00Z",
    "count": 1523,
    "avgDeltaPct": 2.3,
    "pulseLatencyMs": 450,
    "aiScoresSummary": {
      "avgAvi": 78.5,
      "avgAti": 82.1,
      "avgCis": 75.8,
      "totalVins": 1523
    },
    "status": "healthy",
    "message": "All systems operational"
  },
  "meta": {
    "timestamp": "2025-11-03T10:35:00Z",
    "version": "2025.11.03",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

## TypeScript SDK Usage

```typescript
import { DiagnosticsAPI } from '@/lib/orchestrator/diagnostics';
import type { AppraiseSDKResponse } from '@/src/types/pulse';

// Get diagnostics with AI scores
const diagnostics: AppraiseSDKResponse = await DiagnosticsAPI.getMsrpSync({
  tenantId: 'dealer123',
  includeAiScores: true
});

console.log('Status:', diagnostics.diagnostics.status);
console.log('Freshness:', diagnostics.freshnessScore);

if (diagnostics.diagnostics.aiScoresSummary) {
  const { avgAvi, avgAti, avgCis } = diagnostics.diagnostics.aiScoresSummary;
  console.log(`Scores - AVI: ${avgAvi}, ATI: ${avgAti}, CIS: ${avgCis}`);
}
```

## Status Levels

| Status | Description | Thresholds |
|--------|-------------|------------|
| `healthy` | All systems operational | Latency < 1s, count > 0 |
| `degraded` | Performance issues | Latency 1-5s |
| `critical` | Service outage | Latency > 5s |
| `unknown` | Unable to determine | No data available |

## Freshness Score Calculation

- **100%**: Data < 1 hour old
- **50%**: Data ~24 hours old
- **0%**: Data > 7 days old

Formula: Linear decay over 7 days from last run timestamp.

## CI/CD Automation

The `.github/workflows/schema-ci.yml` workflow automatically:

1. **On Feature Branch Push:**
   - Runs OpenAPI changelog diff
   - Regenerates TypeScript SDK types
   - Commits and pushes changes

2. **On PR Merge to Main:**
   - Tags the release with the OpenAPI version
   - Creates a GitHub release
   - Publishes SDK types

### Manual Commands

```bash
# Update changelog
npm run diff:changelog

# Generate SDK types
npm run build:sdk

# Validate OpenAPI spec
npm run schema:validate

# Bundle OpenAPI spec
npm run schema:bundle
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/orchestrator-diagnostics-enhancements
```

### 2. Make Changes

- Update `openapi/pulse.yaml`
- Modify TypeScript interfaces in `src/types/pulse.ts`
- Update `lib/orchestrator/diagnostics.ts`

### 3. Generate Changelog and Types

```bash
npm run diff:changelog
npm run build:sdk
```

### 4. Commit and Push

```bash
git add openapi/pulse.yaml src/types/pulse.ts
git commit -m "feat: add new diagnostics feature"
git push origin feature/orchestrator-diagnostics-enhancements
```

### 5. Create Pull Request

GitHub Actions will automatically validate and update the schema.

## Testing

### Integration Tests

```bash
# Test API endpoint
curl -X GET "http://localhost:3000/api/diagnostics/msrp-sync?tenantId=dealer123" \
  -H "Authorization: Bearer <token>"

# Test with AI scores disabled
curl -X GET "http://localhost:3000/api/diagnostics/msrp-sync?includeAiScores=false" \
  -H "Authorization: Bearer <token>"

# Trigger manual sync
curl -X POST "http://localhost:3000/api/diagnostics/msrp-sync" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"dealer123"}'
```

## Key Metrics to Monitor

1. **API Response Time**: Target < 500ms
2. **Error Rate**: Target < 1%
3. **Cache Hit Rate**: Target > 80%
4. **Freshness Score**: Target > 90
5. **Diagnostic Status**: Target 100% healthy

## Related Files

- [openapi/pulse.yaml](../openapi/pulse.yaml) - OpenAPI Specification
- [src/types/pulse.ts](../src/types/pulse.ts) - TypeScript Types
- [lib/orchestrator/diagnostics.ts](../lib/orchestrator/diagnostics.ts) - Core Library
- [app/api/diagnostics/msrp-sync/route.ts](../app/api/diagnostics/msrp-sync/route.ts) - API Route
- [.github/workflows/schema-ci.yml](../.github/workflows/schema-ci.yml) - CI/CD Workflow

## Support

- **GitHub Issues**: https://github.com/dealershipai/dashboard/issues
- **Email**: engineering@dealershipai.com
