# Pulse Cards API - Quick Start

## Overview

The Pulse Cards API transforms `/api/clarity/stack` data into actionable, dealer-friendly cards. This provides a storytelling layer on top of raw metrics.

## Quick Usage

```typescript
// Get Pulse cards
const res = await fetch('/api/analyzePulseTelemetry?domain=exampledealer.com');
const { cards, summary } = await res.json();

// Get aggregated metrics
const metricsRes = await fetch('/api/getPulseMetrics?domain=exampledealer.com');
const { metrics } = await metricsRes.json();
```

## Endpoints

### 1. `/api/analyzePulseTelemetry`

**GET** - Fetches clarity stack and generates Pulse cards
```
GET /api/analyzePulseTelemetry?domain=exampledealer.com&tenant=default&role=default
```

**POST** - Analyzes provided clarity stack data
```json
POST /api/analyzePulseTelemetry
{
  "clarityData": { /* ClarityStackResponse */ },
  "tenant": "default",
  "role": "default"
}
```

**Response:**
```json
{
  "success": true,
  "cards": [ /* Array of PulseCard */ ],
  "summary": {
    "totalCards": 6,
    "bySeverity": { "critical": 0, "high": 2, "medium": 3, "low": 1 },
    "byCategory": { "Visibility": 1, "Schema": 1, ... },
    "revenueAtRisk": 23000,
    "overallAVI": 52
  }
}
```

### 2. `/api/getPulseMetrics`

**GET** - Returns aggregated metrics
```
GET /api/getPulseMetrics?domain=exampledealer.com&tenant=default&role=default
```

**POST** - Returns metrics for provided clarity data
```json
POST /api/getPulseMetrics
{
  "clarityData": { /* ClarityStackResponse */ }
}
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "scores": { "avi": 52, "seo": 68, "aeo": 54, "geo": 41 },
    "revenue": { "atRiskMonthly": 23000, "atRiskAnnual": 276000 },
    "components": { "schema": 61, "gbp": 78, "ugc": 82 },
    "competitive": { "rank": 3, "total": 7, "gapToLeader": 35 },
    "pulse": { "totalCards": 6, "criticalCount": 0, ... },
    "health": { "overall": "fair", "needsAttention": 2, ... }
  }
}
```

## Testing

### Interactive Test Page

Visit: `http://localhost:3000/test/pulse-cards`

Features:
- Test both endpoints
- View cards with severity colors
- See aggregated metrics
- Copy usage examples

### Command Line Test

```bash
# Test script
./scripts/test-pulse-endpoints.sh exampledealer.com

# Manual test
curl "http://localhost:3000/api/analyzePulseTelemetry?domain=exampledealer.com" | jq
curl "http://localhost:3000/api/getPulseMetrics?domain=exampledealer.com" | jq
```

## Card Types

1. **AVI** (Visibility) - Overall AI visibility score
2. **Schema** - Structured data coverage
3. **GBP** - Google Business Profile health
4. **UGC** - Reviews and user-generated content
5. **Competitive** - Market position
6. **Narrative** - How AI describes the dealership

## Severity Levels

- **80+** → `low` (green)
- **60-79** → `medium` (yellow)
- **40-59** → `high` (orange)
- **<40** → `critical` (red)

## Integration Example

```typescript
// In a React component
'use client';

import { useEffect, useState } from 'react';
import type { PulseCard } from '@/types/pulse';

export function PulseDashboard({ domain }: { domain: string }) {
  const [cards, setCards] = useState<PulseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analyzePulseTelemetry?domain=${domain}`)
      .then(res => res.json())
      .then(data => {
        setCards(data.cards || []);
        setLoading(false);
      });
  }, [domain]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map(card => (
        <div key={card.key} className="p-4 border rounded-lg">
          <h3>{card.title}</h3>
          <p>{card.summary}</p>
          <p className="text-sm text-gray-600">{card.recommendedAction}</p>
        </div>
      ))}
    </div>
  );
}
```

## Files

- `types/pulse.ts` - PulseCard type definition
- `lib/pulse/fromClarity.ts` - Card generation helper
- `app/api/analyzePulseTelemetry/route.ts` - Cards endpoint
- `app/api/getPulseMetrics/route.ts` - Metrics endpoint
- `app/test/pulse-cards/page.tsx` - Test page
- `scripts/test-pulse-endpoints.sh` - Test script
- `docs/PULSE_CARDS_API.md` - Full API documentation

## Next Steps

1. ✅ Test endpoints: `./scripts/test-pulse-endpoints.sh`
2. ✅ Visit test page: `/test/pulse-cards`
3. ✅ Integrate into dashboard components
4. ✅ Customize card messages for your use case

