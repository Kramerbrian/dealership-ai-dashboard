# Orchestrator Deployment Oversight

## Overview

The Orchestrator now includes deployment verification and monitoring capabilities to oversee landing page deployments. It automatically checks deployment health and uses AI to analyze and recommend fixes.

## Features

### 1. **Deployment Verification**
- Checks landing page accessibility
- Verifies API endpoints (`/api/clarity/stack`)
- Validates Mapbox configuration
- Tests component health (`/api/health`)

### 2. **AI-Powered Analysis**
- Analyzes deployment status
- Identifies critical issues
- Provides actionable recommendations
- Suggests next steps

### 3. **Real-time Monitoring**
- Continuous health checks
- Status reporting (healthy/degraded/failed)
- Error tracking and reporting

## API Endpoints

### Verify Deployment Status

```bash
GET /api/orchestrator/deploy/verify?url=https://dealershipai.com
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "url": "https://dealershipai.com",
  "checks": {
    "landingPage": true,
    "mapbox": true,
    "api": true,
    "components": true
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Monitor with AI Analysis

```bash
POST /api/orchestrator/deploy/monitor
Content-Type: application/json

{
  "type": "verify-deployment",
  "input": "Verify landing page deployment and provide analysis"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Overall assessment: Landing page is healthy...",
  "model": "gpt-4o",
  "deploymentStatus": {
    "status": "healthy",
    "checks": { ... }
  },
  "verificationTime": 1234,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Usage in Code

### Direct Function Call

```typescript
import { verifyLandingPageDeployment, monitorDeployment } from '@/lib/ai/orchestrator';

// Simple verification
const status = await verifyLandingPageDeployment('https://dealershipai.com');
console.log(status.status); // 'healthy' | 'degraded' | 'failed'

// AI-powered monitoring
const task = {
  type: 'verify-deployment' as const,
  input: 'Verify and analyze deployment',
};
const analysis = await monitorDeployment(task);
console.log(analysis.output); // AI analysis
```

### Via Orchestrator Task

```typescript
import { executeAITask } from '@/lib/ai/orchestrator';

const task = {
  type: 'verify-deployment',
  input: 'Check landing page deployment status',
  priority: 'quality',
};

const result = await executeAITask(task);
// result.output contains AI analysis
// result.metadata.deploymentStatus contains health checks
```

## Deployment Status Types

### `healthy`
All checks pass:
- ✅ Landing page loads (200 OK)
- ✅ API endpoints respond
- ✅ Mapbox configured
- ✅ Components healthy

### `degraded`
Some checks fail but core functionality works:
- ⚠️ 1-2 checks failing
- ✅ Core features still accessible

### `failed`
Critical issues:
- ❌ 3+ checks failing
- ❌ Landing page inaccessible
- ❌ API endpoints down

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Verify Deployment
  run: |
    curl -X GET "https://dealershipai.com/api/orchestrator/deploy/verify" \
      | jq '.status'
```

### Vercel Post-Deploy Hook

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/orchestrator/deploy/verify",
    "schedule": "*/5 * * * *"
  }]
}
```

## Monitoring Dashboard

The orchestrator can be integrated into admin dashboards:

```typescript
// In admin dashboard component
const { data } = useSWR('/api/orchestrator/deploy/verify', fetcher, {
  refreshInterval: 60000, // Check every minute
});

if (data?.status === 'failed') {
  // Show alert
}
```

## Next Steps

1. **Set up monitoring**: Add cron job to check deployment every 5 minutes
2. **Create alerts**: Integrate with PagerDuty/Slack for failed deployments
3. **Dashboard integration**: Add deployment status widget to admin panel
4. **Automated fixes**: Extend orchestrator to auto-fix common deployment issues

## Environment Variables

Required for deployment verification:
- `NEXT_PUBLIC_BASE_URL` - Base URL for checks
- `NEXT_PUBLIC_MAPBOX_KEY` or `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox verification

Optional:
- `ORCHESTRATOR_API` - External orchestrator service
- `OPENAI_API_KEY` - For AI analysis (if using OpenAI)

