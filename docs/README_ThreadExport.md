# Dashboard Features Implementation Guide

This document describes the implementation of the Visibility and Health dashboard features for `dash.dealershipAI.com`.

## Overview

The implementation includes:
- **Relevance Overlay**: Shows where dealers stand and what to fix next
- **Marketplace Citations**: Lists generative citation sources
- **Core Web Vitals**: Plain-English performance metrics
- **Health Diagnostics**: Crawl errors, schema validation, and CWV summary

## File Structure

```
app/
├── (dashboard)/
│   ├── visibility/
│   │   ├── relevance-overlay/page.tsx
│   │   └── marketplaces/page.tsx
│   └── health/
│       ├── core-web-vitals/page.tsx
│       └── diagnostics/page.tsx
├── components/
│   ├── RelevanceOverlay.tsx
│   ├── MarketplaceCitationsPanel.tsx
│   └── CoreWebVitalsCard.tsx
├── modals/
│   └── HealthDiagnosticsModal.tsx
├── api/
│   ├── visibility/
│   │   ├── relevance/route.ts
│   │   └── marketplaces/route.ts
│   ├── health/
│   │   ├── cwv/route.ts
│   │   └── crawl/route.ts
│   └── schema/
│       └── scs/route.ts
├── lib/scoring/
│   ├── relevance.ts
│   └── scs.ts
└── config/
    ├── feature_toggles.json
    └── nav.additions.ts

types/
└── metrics.ts

data/
├── marketplaces.json
├── canon/
│   ├── soundbites.json
│   ├── core_web_vitals_block.json
│   ├── relevance_overlay_spec.json
│   └── scs_spec.json
└── hover_cards.json

prisma/
└── schema.additions.prisma
```

## Features

### 1. Relevance Overlay

**Route**: `/dashboard/visibility/relevance-overlay`

**Component**: `RelevanceOverlay.tsx`

**API**: `/api/visibility/relevance`

**Description**: Displays a ranked table of marketplace sources by Relevance Index (RI), calculated as:
```
RI = (Visibility × Proximity × Authority) × (SCS / 100)
```

**Features**:
- Ranks sources by RI score
- Shows visibility, proximity, authority, and schema weight
- Uses canon soundbite: "What to fix next — before competitors even realize."

### 2. Marketplace Citations

**Route**: `/dashboard/visibility/marketplaces`

**Component**: `MarketplaceCitationsPanel.tsx`

**API**: `/api/visibility/marketplaces`

**Description**: Lists marketplace sources organized by category:
- Retail Listing Surfaces
- Valuation & Appraisal Anchors
- Data & Trust Authorities
- Service & Parts

### 3. Core Web Vitals

**Route**: `/dashboard/health/core-web-vitals`

**Component**: `CoreWebVitalsCard.tsx`

**API**: `/api/health/cwv`

**Description**: Plain-English performance metrics:
- **Speed (LCP)**: How fast the biggest thing appears
- **Stability (CLS)**: Measures layout jumps
- **Response (INP)**: How quickly the site responds

Uses the locked canon format from `data/canon/core_web_vitals_block.json`.

### 4. Health Diagnostics

**Route**: `/dashboard/health/diagnostics`

**Component**: `HealthDiagnosticsModal.tsx`

**APIs**: 
- `/api/health/crawl`
- `/api/schema/scs`
- `/api/health/cwv`

**Description**: Three-panel diagnostic view:
- Crawl errors (404s, 502s, etc.)
- Schema validation (missing/malformed fields)
- Core Web Vitals summary

## Feature Toggles

All features are gated by `app/config/feature_toggles.json`:

```json
{
  "marketplace_suppression": true,
  "national_benchmarks": true,
  "compare_mode": true,
  "relevance_overlay": true,
  "health_diagnostics_modal": true,
  "core_web_vitals_plain_english": true
}
```

Pages automatically redirect to `/dashboard` if their toggle is disabled.

## API Routes

All API routes use mocked data initially. Swap to live data sources when ready.

### `/api/visibility/relevance`
Returns relevance nodes with visibility, proximity, authority, and SCS percentage.

### `/api/visibility/marketplaces`
Returns marketplace data from `data/marketplaces.json`.

### `/api/health/cwv`
Returns Core Web Vitals metrics (LCP, CLS, INP).

### `/api/health/crawl`
Returns crawl errors with code, URL, frequency, last seen, and impact.

### `/api/schema/scs`
Returns Schema Confidence Score data including missing/malformed fields.

## Scoring Utilities

### `computeRI()` - Relevance Index
Calculates the composite Relevance Index from visibility, proximity, authority, and SCS.

### `computeSCS()` - Schema Confidence Score
Calculates SCS from parsed fields, expected fields, validation health, and source trust.

## Database Schema

See `prisma/schema.additions.prisma` for:
- `DealerSourceScore`: Time-series relevance scores per tenant/source
- `CrawlIssue`: Crawl error tracking
- `CoreWebVitals`: CWV metrics over time

Run migration:
```bash
npx prisma migrate dev -n "dealer_scores_health"
```

## Navigation

Add to your dashboard navigation using `app/config/nav.additions.ts`:

```typescript
export const DASH_NAV_ADDITIONS = [
  { label: "Visibility", children: [
    { label: "Relevance Overlay", href: "/dashboard/visibility/relevance-overlay" },
    { label: "Marketplace Citations", href: "/dashboard/visibility/marketplaces" }
  ]},
  { label: "Health", children: [
    { label: "Core Web Vitals", href: "/dashboard/health/core-web-vitals" },
    { label: "Diagnostics", href: "/dashboard/health/diagnostics" }
  ]}
];
```

## Multi-Tenant & RBAC

- All API routes should check `tenantId` from session
- Use RLS in Supabase or Prisma filters to prevent cross-tenant reads
- Never expose tenant data without authentication

## Performance & Caching

- Pages use `export const revalidate = 300` (5-minute SSG)
- API routes use `export const revalidate = 60` (1-minute cache)
- Add `Cache-Control` headers for time-series data:
  ```
  Cache-Control: s-maxage=300, stale-while-revalidate=60
  ```

## Testing

1. **Smoke Test**: Visit all routes and verify they render with mocked data
2. **Feature Toggles**: Disable toggles and verify redirects work
3. **API Integration**: Swap mocked APIs with live data sources
4. **Multi-Tenant**: Verify tenant isolation in API routes

## Next Steps

1. Wire live data sources to API routes
2. Add tenant filtering to all API calls
3. Implement compare mode for Relevance Overlay
4. Add suppression UI (visual only, keep signals in backend)
5. Add momentum arrows (month-over-month changes)
6. Create "Show Me Why" hover cards for metrics

## Canon Copy

All canon copy is locked in `data/canon/`:
- `soundbites.json`: Taglines and short slugs
- `core_web_vitals_block.json`: Plain-English CWV format
- `relevance_overlay_spec.json`: RI formula and dimensions
- `scs_spec.json`: SCS formula and inputs

Do not modify these without approval.
