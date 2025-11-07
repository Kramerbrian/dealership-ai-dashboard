# Local Testing Guide - Dashboard Features

This guide walks you through testing the new Visibility and Health dashboard features locally.

## Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure you have all required environment variables
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Database Migration** (when ready)
   ```bash
   npx prisma migrate dev -n "dealer_scores_health"
   ```

## Testing Routes

### 1. Relevance Overlay
**URL**: `http://localhost:3000/dashboard/visibility/relevance-overlay`

**Expected Behavior**:
- Page loads with feature toggle check
- Displays table of marketplace sources ranked by Relevance Index (RI)
- Shows visibility, proximity, authority, and schema weight columns
- Displays canon soundbite: "What to fix next — before competitors even realize."

**Test Cases**:
- ✅ Page renders without errors
- ✅ Table displays mock data (Cars.com, CarMax, AutoTrader, CarGurus)
- ✅ RI values are calculated correctly
- ✅ Feature toggle redirect works (disable `relevance_overlay` in `feature_toggles.json`)

### 2. Marketplace Citations
**URL**: `http://localhost:3000/dashboard/visibility/marketplaces`

**Expected Behavior**:
- Page loads with feature toggle check
- Displays 4 categories of marketplace sources:
  - Retail Listing Surfaces
  - Valuation & Appraisal Anchors
  - Data & Trust Authorities
  - Service & Parts

**Test Cases**:
- ✅ Page renders without errors
- ✅ All 4 categories display correctly
- ✅ Marketplace data loads from `data/marketplaces.json`
- ✅ Feature toggle redirect works

### 3. Core Web Vitals
**URL**: `http://localhost:3000/dashboard/health/core-web-vitals`

**Expected Behavior**:
- Page loads with feature toggle check
- Displays plain-English performance metrics:
  - Speed (LCP): Loads in ≈ X seconds
  - Stability (CLS): Page stays steady
  - Response (INP): Reacts in X seconds
- Shows emoji status indicators (🟢/🟡)

**Test Cases**:
- ✅ Page renders without errors
- ✅ All 3 metrics display with proper formatting
- ✅ Status indicators show correct colors
- ✅ LCP delta calculation works (if `lcp_delta_ms` is present)
- ✅ Feature toggle redirect works

### 4. Health Diagnostics
**URL**: `http://localhost:3000/dashboard/health/diagnostics`

**Expected Behavior**:
- Page loads with feature toggle check
- Displays 3-panel diagnostic view:
  - Crawl Errors: Table with code, URL, frequency, last seen, impact
  - Schema Validation: Missing and malformed fields
  - Core Web Vitals: Summary of LCP, CLS, INP

**Test Cases**:
- ✅ Page renders without errors
- ✅ All 3 panels display correctly
- ✅ Crawl errors table shows mock data
- ✅ Schema validation lists display properly
- ✅ CWV summary matches Core Web Vitals page
- ✅ Feature toggle redirect works

## API Route Testing

### Test with Mock Data (Default)

All API routes will return mock data if:
- No database tables exist yet
- No real data is found for the tenant
- An error occurs during data fetch

**Test API Routes Directly**:
```bash
# Relevance Overlay
curl http://localhost:3000/api/visibility/relevance

# Core Web Vitals
curl http://localhost:3000/api/health/cwv

# Crawl Errors
curl http://localhost:3000/api/health/crawl

# Schema SCS
curl http://localhost:3000/api/schema/scs

# Marketplace Citations
curl http://localhost:3000/api/visibility/marketplaces
```

**Expected**: All routes return JSON with mock data (or 401 if not authenticated).

### Test with Real Data (After Migration)

1. **Run Migration**:
   ```bash
   npx prisma migrate dev -n "dealer_scores_health"
   ```

2. **Seed Test Data** (optional):
   ```sql
   -- Insert test relevance scores
   INSERT INTO "DealerSourceScore" (id, "tenantId", source, date, visibility, proximity, authority, "scsPct")
   VALUES 
     ('test-1', 'your-tenant-id', 'Cars.com', NOW(), 0.68, 0.55, 0.81, 92),
     ('test-2', 'your-tenant-id', 'CarMax', NOW(), 0.84, 0.32, 0.91, 88);

   -- Insert test CWV data
   INSERT INTO "CoreWebVitals" (id, "tenantId", "lcpMs", cls, "inpMs", "capturedAt")
   VALUES 
     ('cwv-1', 'your-tenant-id', 2600, 0.12, 180, NOW());

   -- Insert test crawl issues
   INSERT INTO "CrawlIssue" (id, "tenantId", code, url, frequency, "lastSeen", impact)
   VALUES 
     ('crawl-1', 'your-tenant-id', 404, '/test-page', 5, NOW(), 'High');
   ```

3. **Verify Real Data**:
   - API routes should return real data instead of mocks
   - Pages should display real data from database

## Feature Toggle Testing

**Location**: `app/config/feature_toggles.json`

**Test Each Toggle**:
1. Set toggle to `false`
2. Visit corresponding page
3. Verify redirect to `/dashboard`
4. Set toggle back to `true`
5. Verify page loads normally

**Toggles to Test**:
- `relevance_overlay`
- `marketplace_suppression`
- `core_web_vitals_plain_english`
- `health_diagnostics_modal`

## Tenant Isolation Testing

**Critical**: All API routes must enforce tenant isolation.

**Test Steps**:
1. Log in as Tenant A
2. Visit `/dashboard/visibility/relevance-overlay`
3. Verify only Tenant A's data is shown
4. Log in as Tenant B
5. Verify Tenant B sees different data (or no data if none exists)

**Security Check**:
- API routes should return 401 if not authenticated
- API routes should return 403 if no tenant association found
- Cross-tenant data access should be impossible

## Common Issues & Solutions

### Issue: "Failed to load relevance data"
**Solution**: Check that:
- `NEXT_PUBLIC_APP_URL` is set correctly
- API route is accessible
- Authentication is working

### Issue: "Unauthorized" errors
**Solution**: 
- Ensure you're logged in
- Check Clerk authentication is configured
- Verify tenant_id exists in users table

### Issue: Pages show mock data after migration
**Solution**:
- Verify database tables exist
- Check tenant_id matches your logged-in user
- Verify data was inserted correctly

### Issue: Feature toggle redirects not working
**Solution**:
- Check `app/config/feature_toggles.json` exists
- Verify JSON syntax is valid
- Ensure toggle key matches page check

## Performance Testing

**Cache Testing**:
- Pages use `revalidate = 300` (5-minute SSG)
- API routes use `revalidate = 60` (1-minute cache)
- Verify pages load quickly on first visit
- Verify data refreshes after cache expires

**Load Testing**:
- Test with multiple tenants
- Test with large datasets (100+ sources)
- Verify pagination/limiting works correctly

## Next Steps After Testing

1. ✅ All pages render correctly
2. ✅ Feature toggles work
3. ✅ API routes return data (mock or real)
4. ✅ Tenant isolation is enforced
5. ✅ Navigation is integrated (see Navigation Integration below)

## Navigation Integration

The new routes are available at:
- `/dashboard/visibility/relevance-overlay`
- `/dashboard/visibility/marketplaces`
- `/dashboard/health/core-web-vitals`
- `/dashboard/health/diagnostics`

To add to your dashboard navigation, see `app/config/nav.additions.ts` and merge into your existing sidebar/nav component.

