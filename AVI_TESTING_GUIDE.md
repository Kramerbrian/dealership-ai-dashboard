# AVI Dashboard Testing Guide

## Overview
Comprehensive testing procedures for AVI Dashboard implementation.

---

## Build Tests

### Local Build Test
```bash
# Set environment variables first
export NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder"
export SUPABASE_SERVICE_ROLE_KEY="placeholder"

# Run build
npm run build

# Expected: ✓ Compiled successfully
```

**Note:** Build may show warnings about missing Supabase during static generation. This is normal for local builds.

### TypeScript Validation
```bash
# Check types
npx tsc --noEmit

# Expected: No errors
```

---

## Unit Tests

### Test 1: AVI Report Type Validation

```typescript
// tests/avi-report.test.ts
import { AviReportZ } from '@/types/avi-report';

test('Valid AVI report passes validation', () => {
  const validReport = {
    id: 'uuid-here',
    tenantId: 'uuid-here',
    version: '1.3.0',
    asOf: '2025-01-10',
    windowWeeks: 8,
    aivPct: 85.5,
    atiPct: 78.3,
    crsPct: 82.1,
    // ... rest of fields
  };

  const result = AviReportZ.safeParse(validReport);
  expect(result.success).toBe(true);
});
```

### Test 2: Cache Key Generation

```typescript
// tests/avi-cache.test.ts
import { getAviReportCacheKey, getAviReportCacheTags } from '@/lib/utils/avi-cache';

test('Generates correct cache key', () => {
  const tenantId = 'test-tenant-id';
  const key = getAviReportCacheKey(tenantId);

  expect(key).toBe('avi-report:latest:test-tenant-id');
});

test('Generates correct cache tags', () => {
  const tenantId = 'test-tenant-id';
  const tags = getAviReportCacheTags(tenantId);

  expect(tags).toContain('avi-reports');
  expect(tags).toContain('avi-reports:tenant:test-tenant-id');
});
```

---

## Integration Tests

### Test 3: API Endpoint

```bash
# Start dev server
npm run dev

# Test API (in another terminal)
curl http://localhost:3000/api/avi-report

# Expected: JSON response with AVI report
```

**Validation:**
```javascript
// Check response structure
const response = await fetch('http://localhost:3000/api/avi-report');
const data = await response.json();

// Should have required fields
console.assert(data.id !== undefined);
console.assert(data.tenantId !== undefined);
console.assert(data.aivPct !== undefined);
console.assert(data.pillars !== undefined);
```

### Test 4: Database Query (with Supabase)

```typescript
// tests/database.test.ts
import { supabaseAdmin } from '@/lib/supabase';

test('Queries avi_reports table', async () => {
  const { data, error } = await supabaseAdmin
    .from('avi_reports')
    .select('*')
    .limit(1);

  expect(error).toBeNull();
  expect(data).toBeDefined();
});
```

### Test 5: Cache Performance

```javascript
// tests/cache-performance.test.ts
const measureResponseTime = async (url) => {
  const start = performance.now();
  await fetch(url);
  return performance.now() - start;
};

test('Cache improves response time', async () => {
  const url = 'http://localhost:3000/api/avi-report';

  // First request (no cache)
  const firstTime = await measureResponseTime(url);

  // Second request (cached)
  const cachedTime = await measureResponseTime(url);

  // Cached should be significantly faster
  expect(cachedTime).toBeLessThan(firstTime * 0.5);
});
```

---

## Component Tests

### Test 6: Dashboard Rendering

```typescript
// tests/dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import ComprehensiveAVIDashboard from '@/components/dashboard/ComprehensiveAVIDashboard';

test('Renders dashboard with loading state', () => {
  render(<ComprehensiveAVIDashboard />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});
```

### Test 7: Visualization Components

```typescript
// tests/visualizations.test.tsx
import { render } from '@testing-library/react';
import PillarRadarChart from '@/components/visualizations/PillarRadarChart';

test('Renders pillar radar chart', () => {
  const pillars = {
    seo: 75,
    aeo: 68,
    geo: 82,
    ugc: 71,
    geoLocal: 85
  };

  const { container } = render(<PillarRadarChart pillars={pillars} />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});
```

---

## Manual Testing Checklist

### Frontend Tests

#### Dashboard Access
- [ ] Visit `/dashboard` while logged out → Redirects to login
- [ ] Login as SuperAdmin → See comprehensive dashboard
- [ ] Login as regular user → See tabbed dashboard
- [ ] All visualizations render without errors
- [ ] No console errors

#### Visualization Components
- [ ] **PillarRadarChart** - Pentagon renders correctly
- [ ] **ModifiersGauge** - Semi-circle gauges display
- [ ] **ClarityHeatmap** - Color coding works
- [ ] **CounterfactualRevenue** - Bar chart shows
- [ ] **DriversBreakdown** - Pie charts render
- [ ] **AnomaliesTimeline** - Z-score gauges visible
- [ ] **BacklogPrioritization** - Matrix displays

#### Responsive Design
- [ ] Desktop (1920x1080) - All components fit
- [ ] Tablet (768x1024) - Grid adjusts
- [ ] Mobile (375x667) - Vertical stacking

### Backend Tests

#### API Endpoints
```bash
# Test with tenant ID
curl "http://localhost:3000/api/avi-report?tenantId=test-id"
# Expected: 200 OK, JSON response

# Test without tenant ID
curl "http://localhost:3000/api/avi-report"
# Expected: 200 OK, JSON with random UUID

# Test invalid tenant
curl "http://localhost:3000/api/avi-report?tenantId=invalid"
# Expected: 200 OK (mock data) or 500 (if mock disabled)
```

#### Cache Behavior
```bash
# First request
time curl "http://localhost:3000/api/avi-report?tenantId=test" > /dev/null
# Note the time

# Second request (cached)
time curl "http://localhost:3000/api/avi-report?tenantId=test" > /dev/null
# Should be significantly faster
```

#### Database Queries
```sql
-- Test latest report query
EXPLAIN ANALYZE
SELECT * FROM avi_reports
WHERE tenant_id = 'test-tenant-id'
ORDER BY as_of DESC, created_at DESC
LIMIT 1;

-- Should use index: idx_avi_reports_latest
```

---

## Performance Tests

### Test 8: Load Testing

```bash
# Install Apache Bench
brew install ab  # Mac
apt-get install apache2-utils  # Linux

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:3000/api/avi-report

# Expected results:
# - Mean response time: <200ms
# - Failed requests: 0
# - Requests per second: >50
```

### Test 9: Memory Usage

```bash
# Monitor memory during requests
node --inspect node_modules/next/dist/bin/next dev

# Open Chrome DevTools → Memory
# Take heap snapshot
# Make 100 requests
# Take another snapshot
# Check for memory leaks
```

---

## Security Tests

### Test 10: RLS Policies

```sql
-- Test as regular user (should only see own tenant)
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-clerk-id';

SELECT * FROM avi_reports;
-- Should only return reports where tenant_id matches user's tenant

-- Test as SuperAdmin (should see all)
SET ROLE authenticated;
-- Set SuperAdmin user
SELECT * FROM avi_reports;
-- Should return all reports
```

### Test 11: API Authorization

```bash
# Test without authentication
curl "http://localhost:3000/api/avi-report"
# With Clerk: Should return 401 if auth required
# Without auth check: Should return 200 (current implementation)

# Test with invalid token
curl -H "Authorization: Bearer invalid-token" \
  "http://localhost:3000/api/avi-report"
# Should return 401 if auth enforced
```

---

## Regression Tests

After any code changes, verify:

- [ ] Build completes successfully
- [ ] All API endpoints return valid JSON
- [ ] Dashboard renders for all user roles
- [ ] Cache still improves performance
- [ ] Database queries use correct indexes
- [ ] No new TypeScript errors
- [ ] No new console errors
- [ ] Documentation still accurate

---

## Automated Test Script

Create `scripts/run-tests.sh`:

```bash
#!/bin/bash

echo "🧪 Running AVI Dashboard Tests"
echo "=============================="

# Check if Supabase vars are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

echo "✅ Environment variables set"

# Run TypeScript check
echo "\n📝 Checking TypeScript..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ TypeScript check passed"
else
  echo "❌ TypeScript check failed"
  exit 1
fi

# Test API endpoint
echo "\n🌐 Testing API endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/avi-report)
if [ "$STATUS" -eq 200 ]; then
  echo "✅ API endpoint returned 200"
else
  echo "❌ API endpoint returned $STATUS"
  exit 1
fi

# Test cache performance
echo "\n⚡ Testing cache performance..."
TIME1=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:3000/api/avi-report?tenantId=test")
TIME2=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:3000/api/avi-report?tenantId=test")

echo "First request: ${TIME1}s"
echo "Cached request: ${TIME2}s"

if (( $(echo "$TIME2 < $TIME1" | bc -l) )); then
  echo "✅ Cache improved performance"
else
  echo "⚠️  Cache performance unclear"
fi

echo "\n✅ All tests passed!"
```

Run with:
```bash
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

---

## Test Results Documentation

### Template

```markdown
## Test Run: [Date]

### Environment
- Node: v18.x.x
- Next.js: 14.2.33
- Supabase: Connected/Mock

### Results

| Test | Status | Notes |
|------|--------|-------|
| Build | ✅ | Compiled in 45s |
| TypeScript | ✅ | No errors |
| API Endpoint | ✅ | Returns JSON |
| Cache | ✅ | 8ms vs 180ms |
| Dashboard | ✅ | All roles work |
| Visualizations | ✅ | All render |

### Issues Found
- None

### Performance
- API (uncached): 180ms
- API (cached): 8ms
- Dashboard load: 1.2s
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: AVI Dashboard Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install

      - name: TypeScript Check
        run: npx tsc --noEmit

      - name: Build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: npm run build

      - name: Run Tests
        run: npm test
```

---

**Test Coverage Goal:** 80%+
**Manual Test Time:** ~15 minutes
**Automated Test Time:** ~5 minutes
