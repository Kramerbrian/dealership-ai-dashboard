# GPT-5 Integration with DealershipAI

## Overview

This document outlines the complete integration of OpenAI GPT-5 with DealershipAI's Algorithmic Visibility Index™ system, including service token authentication, RBAC, and real-time metrics computation.

## 🏗️ Architecture

### GPT Proxy Flow
```
GPT-5 → https://dashboard.yourdomain.com/gpt-proxy → Supabase
```

### Service Token Architecture
| Actor           | Capability                   | Mechanism                                  |
| --------------- | ---------------------------- | ------------------------------------------ |
| Owner/Admin     | full                         | JWT scope = `role:admin`                   |
| Manager         | read + prioritize            | RBAC check in `/api/tenants/*`             |
| Marketing Agent | view AOER + tasks            | restricted token                           |
| GPT             | acts under a *service* token | `role:system` user with RLS = tenant scope |

## 🔧 Implementation

### 1. GPT Metrics Fetcher (`src/lib/fetchers/gptMetrics.ts`)

```typescript
export async function fetchGptMetrics(tenantId: string) {
  const r = await fetch("/api/gpt/run", {
    method: "POST",
    body: JSON.stringify({
      prompt: `Compute AIV/ATI/CRS/Elasticity for tenant ${tenantId}`
    }),
  });
  const { data } = await r.json();
  return data; // { aiv, ati, crs, elasticity, r2, drivers }
}
```

### 2. SWR Integration

```typescript
const { data, isLoading } = useSWR(`/gptMetrics/${tenantId}`, fetchGptMetrics);
<MetricCard title="AIV" value={`${data?.aiv.toFixed(1)}%`} />;
```

### 3. GPT Proxy API (`app/api/gpt/run/route.ts`)

- **Service Token Authentication**: Validates `x-service-token` header
- **RBAC Enforcement**: GPT acts under `role:system` with tenant scope
- **Supabase Integration**: Fetches tenant data with service role key
- **GPT-5 Reasoning**: Uses reasoning effort (low/medium/high)
- **Response Parsing**: Extracts metrics and recommendations from GPT output

### 4. Database Schema (`database/gpt-analysis-schema.sql`)

- **`gpt_analysis_results`**: Stores GPT-5 analysis results
- **`service_tokens`**: Manages service token authentication
- **`rbac_roles`**: Defines role-based access control
- **`user_roles`**: Maps users to roles and capabilities
- **RLS Policies**: Row-level security for multi-tenant data

## 🔐 Security & Authentication

### Service Token Setup

1. **Generate Service Token**:
```bash
# Generate secure service token
openssl rand -hex 32
```

2. **Environment Variables**:
```env
GPT_SERVICE_TOKEN=your-secure-service-token-here
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

3. **Database Configuration**:
```sql
INSERT INTO service_tokens (token_name, token_hash, role, capabilities, tenant_scope) VALUES
  ('gpt-service-token', 'hashed_token_value', 'role:system', 
   ARRAY['compute_metrics', 'access_tenant_data'], ARRAY[]::UUID[]);
```

### RBAC Implementation

```typescript
// Check user capabilities
const hasCapability = await check_user_capability(userId, 'compute_metrics');

// Service token validation
const serviceToken = request.headers.get('x-service-token');
if (serviceToken !== process.env.GPT_SERVICE_TOKEN) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 📊 Metrics & Analysis

### GPT-5 Analysis Types

1. **Comprehensive**: Full AIV™, ATI™, CRS, Elasticity analysis
2. **AIV**: Algorithmic Visibility Index optimization
3. **ATI**: Algorithmic Trust Index enhancement
4. **Elasticity**: Revenue impact analysis
5. **SHAP**: Driver analysis and feature importance

### Response Format

```json
{
  "data": {
    "aiv": 79.2,
    "ati": 81.3,
    "crs": 80.25,
    "elasticity": 5000,
    "r2": 0.85,
    "drivers": {
      "aiv": [
        {"feature": "AEO Score", "impact": 25.5, "direction": "positive"}
      ],
      "ati": [
        {"feature": "Review Legitimacy", "impact": 18.75, "direction": "positive"}
      ]
    },
    "regime": "Normal",
    "confidenceInterval": [4200, 5800],
    "lastUpdated": "2025-01-27T10:30:00Z"
  }
}
```

## 🎯 Dashboard Integration

### Enhanced Algorithmic Visibility Tab

- **Real-time Metrics**: SWR-powered data fetching with 30s refresh
- **Interactive Cards**: AIV™, ATI™, CRS, Elasticity, R², Regime status
- **SHAP Drivers**: Top 5 impact factors with direction indicators
- **Confidence Intervals**: 95% CI for elasticity analysis
- **Export Functionality**: JSON export of complete analysis
- **Manual Refresh**: Force GPT-5 recomputation

### Metric Cards

```typescript
<AIVMetricCard value={data?.aiv} loading={isLoading} />
<ATIMetricCard value={data?.ati} loading={isLoading} />
<CRSMetricCard value={data?.crs} loading={isLoading} />
<ElasticityMetricCard value={data?.elasticity} loading={isLoading} />
<R2MetricCard value={data?.r2} loading={isLoading} />
<RegimeMetricCard regime={data?.regime} loading={isLoading} />
```

## 🔄 Data Flow

### 1. User Request
```typescript
const { data, isLoading } = useGptMetrics(tenantId);
```

### 2. SWR Cache Check
- Check if data exists in cache
- Return cached data if fresh (< 30s)
- Otherwise, trigger new request

### 3. API Call
```typescript
fetch("/api/gpt/run", {
  method: "POST",
  headers: { "x-service-token": "gpt-service-token" },
  body: JSON.stringify({ prompt: "Compute metrics...", tenantId })
});
```

### 4. Service Token Validation
- Validate `x-service-token` header
- Check token against database
- Verify `role:system` capabilities

### 5. Supabase Data Fetch
- Use service role key to bypass RLS
- Fetch tenant-specific metrics
- Prepare context for GPT-5

### 6. GPT-5 Analysis
```typescript
const run = await openai.responses.create({
  model: "gpt-5",
  reasoning: { effort: "medium" },
  instructions: createGPT5Instructions(tenantId, context),
  metadata: { tenantId, serviceToken: 'role:system' }
});
```

### 7. Response Processing
- Parse GPT-5 output for metrics
- Extract recommendations
- Store results in database
- Return structured response

### 8. SWR Cache Update
- Update cache with new data
- Trigger re-render of components
- Set refresh interval for next update

## 🚀 Deployment

### Environment Setup

1. **Supabase Configuration**:
```sql
-- Run the schema migration
psql "$DATABASE_URL" -f database/gpt-analysis-schema.sql
```

2. **Environment Variables**:
```env
# GPT Integration
GPT_SERVICE_TOKEN=your-secure-service-token
OPENAI_API_KEY=sk-your-openai-key

# Supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url

# App
NEXT_PUBLIC_APP_URL=https://dashboard.yourdomain.com
```

3. **Service Token Generation**:
```bash
# Generate secure token
openssl rand -hex 32

# Hash token for database storage
echo -n "your-token" | sha256sum
```

### Vercel Deployment

1. **Environment Variables**: Add all required env vars to Vercel
2. **Database Migration**: Run schema migration on production database
3. **Service Token**: Generate and configure production service token
4. **Domain Configuration**: Update `NEXT_PUBLIC_APP_URL` to production domain

## 📈 Monitoring & Analytics

### GPT-5 Usage Tracking

- **Request Logging**: All GPT-5 calls logged with tenant ID
- **Response Storage**: Analysis results stored in `gpt_analysis_results`
- **Error Tracking**: Failed requests logged with error details
- **Performance Metrics**: Response times and success rates

### Business Metrics

- **AIV™ Trends**: Track Algorithmic Visibility Index over time
- **ATI™ Improvements**: Monitor trust index enhancements
- **Elasticity Analysis**: Revenue impact per optimization
- **SHAP Drivers**: Most impactful optimization factors

## 🔧 Troubleshooting

### Common Issues

1. **Service Token Authentication**:
   - Verify `GPT_SERVICE_TOKEN` environment variable
   - Check token hash in database matches
   - Ensure token is active and not expired

2. **Supabase Connection**:
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check RLS policies are properly configured
   - Ensure service role has necessary permissions

3. **GPT-5 API Issues**:
   - Verify `OPENAI_API_KEY` is valid
   - Check API rate limits and usage
   - Monitor GPT-5 model availability

4. **SWR Cache Issues**:
   - Clear browser cache if data appears stale
   - Check network requests in browser dev tools
   - Verify API endpoint is responding correctly

### Debug Mode

Enable debug logging by setting:
```env
DEBUG_GPT_INTEGRATION=true
```

This will log detailed information about:
- Service token validation
- Supabase queries
- GPT-5 API calls
- Response parsing

## 🎯 Best Practices

### Security
- Rotate service tokens regularly
- Use least-privilege access for service tokens
- Monitor service token usage
- Implement rate limiting on GPT endpoints

### Performance
- Use SWR caching to reduce API calls
- Implement request deduplication
- Monitor GPT-5 response times
- Cache analysis results appropriately

### Reliability
- Implement retry logic for failed requests
- Use fallback data when GPT-5 is unavailable
- Monitor system health and alert on failures
- Implement circuit breakers for external APIs

---

## 🎉 Summary

The GPT-5 integration provides DealershipAI with:

✅ **Service Token Authentication**: Secure GPT access with RBAC  
✅ **Real-time Metrics**: SWR-powered AIV™, ATI™, CRS, Elasticity analysis  
✅ **Multi-tenant Security**: RLS-protected data with tenant isolation  
✅ **Interactive Dashboard**: Live metrics with manual refresh capabilities  
✅ **Export Functionality**: JSON export of complete analysis results  
✅ **SHAP Driver Analysis**: Top 5 impact factors for optimization  
✅ **Confidence Intervals**: Statistical validation of elasticity metrics  
✅ **Regime Detection**: System health monitoring with alerts  

The system is now ready for production deployment with enterprise-level security and real-time GPT-5 powered analytics! 🚀
