# Pulse Cards API Documentation

## Overview

The Pulse Cards system translates `/api/clarity/stack` data into actionable, dealer-friendly Pulse cards. This provides a storytelling layer on top of raw metrics.

## Endpoints

### 1. `/api/analyzePulseTelemetry`

Analyzes clarity stack data and generates Pulse cards.

#### GET `/api/analyzePulseTelemetry?domain=exampledealer.com&tenant=default&role=default`

Fetches clarity stack data and transforms it into Pulse cards.

**Query Parameters:**
- `domain` (required): Dealer domain
- `tenant` (optional): Tenant ID, defaults to 'default'
- `role` (optional): User role, defaults to 'default'

**Response:**
```json
{
  "success": true,
  "cards": [
    {
      "key": "avi",
      "title": "AI Visibility Index",
      "severity": "high",
      "summary": "Your overall AI visibility score is 52/100. AI knows you exist, but you are easy to skip.",
      "whyItMatters": "Higher visibility means more shoppers see you in AI answers instead of your competitors.",
      "recommendedAction": "Improve schema on VDPs and add clear answers on service pages.",
      "estimatedImpact": "$23,000/month at risk",
      "category": "Visibility"
    },
    // ... more cards
  ],
  "summary": {
    "totalCards": 6,
    "bySeverity": {
      "critical": 0,
      "high": 2,
      "medium": 3,
      "low": 1
    },
    "byCategory": {
      "Visibility": 1,
      "Schema": 1,
      "GBP": 1,
      "UGC": 1,
      "Competitive": 1,
      "Narrative": 1
    },
    "revenueAtRisk": 23000,
    "overallAVI": 52
  },
  "metadata": {
    "tenant": "default",
    "role": "default",
    "timestamp": "2025-11-13T...",
    "domain": "exampledealer.com"
  }
}
```

#### POST `/api/analyzePulseTelemetry`

Analyzes provided clarity stack data.

**Body:**
```json
{
  "clarityData": {
    "domain": "exampledealer.com",
    "scores": { "seo": 68, "aeo": 54, "geo": 41, "avi": 52 },
    "revenue_at_risk": { "monthly": 23000, "annual": 276000 },
    "schema": { "score": 61, "issues": ["Vehicle schema missing on many VDPs"] },
    "ugc": { "score": 82, "recent_reviews_90d": 38, "issues": [] },
    "gbp": { "health_score": 78, "rating": 4.3, "review_count": 487 },
    "competitive": { "rank": 3, "total": 7, "leaders": [{ "name": "Scanlon Hyundai", "avi": 87 }], "gap_to_leader": 35 },
    "ai_intro_current": "This dealership has solid reviews...",
    "ai_intro_improved": "This dealership is seen as a trusted local store..."
  },
  "tenant": "default",
  "role": "default"
}
```

**Response:** Same as GET endpoint.

---

### 2. `/api/getPulseMetrics`

Returns aggregated Pulse metrics for a dealer domain.

#### GET `/api/getPulseMetrics?domain=exampledealer.com&tenant=default&role=default`

**Query Parameters:**
- `domain` (required): Dealer domain
- `tenant` (optional): Tenant ID
- `role` (optional): User role

**Response:**
```json
{
  "success": true,
  "metrics": {
    "scores": {
      "avi": 52,
      "seo": 68,
      "aeo": 54,
      "geo": 41
    },
    "revenue": {
      "atRiskMonthly": 23000,
      "atRiskAnnual": 276000
    },
    "components": {
      "schema": 61,
      "gbp": 78,
      "ugc": 82
    },
    "competitive": {
      "rank": 3,
      "total": 7,
      "gapToLeader": 35,
      "leaderName": "Scanlon Hyundai",
      "leaderAVI": 87
    },
    "pulse": {
      "totalCards": 6,
      "criticalCount": 0,
      "highCount": 2,
      "mediumCount": 3,
      "lowCount": 1,
      "categories": {
        "Visibility": 1,
        "Schema": 1,
        "GBP": 1,
        "UGC": 1,
        "Competitive": 1,
        "Narrative": 1
      }
    },
    "health": {
      "overall": "fair",
      "needsAttention": 2,
      "topPriority": [
        {
          "key": "avi",
          "title": "AI Visibility Index",
          "action": "Improve schema on VDPs and add clear answers on service pages."
        }
      ]
    },
    "trends": {
      "aviChange": 0,
      "revenueRiskChange": 0,
      "competitiveRankChange": 0
    }
  },
  "metadata": {
    "domain": "exampledealer.com",
    "tenant": "default",
    "role": "default",
    "timestamp": "2025-11-13T..."
  }
}
```

#### POST `/api/getPulseMetrics`

Returns metrics for provided clarity stack data.

**Body:** Same as POST `/api/analyzePulseTelemetry`

**Response:** Same as GET endpoint.

---

## Pulse Card Schema

```typescript
type PulseCard = {
  key: string;                     // unique ID, e.g. "avi", "schema_health"
  title: string;                   // short label for the card
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;                 // 1–2 sentence overview in plain English
  whyItMatters: string;            // one sentence: impact in the real world
  recommendedAction: string;       // one clear next step
  estimatedImpact?: string;        // e.g. "$20K/mo" or "+6–10 visibility points"
  category:
    | 'Visibility'
    | 'Schema'
    | 'GBP'
    | 'UGC'
    | 'Competitive'
    | 'Narrative';
};
```

## Card Generation Logic

Cards are generated from clarity stack data using the `buildPulseCardsFromClarity` helper:

1. **AVI Card** - From `scores.avi` + `revenue_at_risk.monthly`
2. **Schema Card** - From `schema.score` + `schema.issues[0]`
3. **GBP Card** - From `gbp.health_score` + `gbp.rating` + `gbp.review_count`
4. **UGC Card** - From `ugc.score` + `ugc.recent_reviews_90d`
5. **Competitive Card** - From `competitive.rank` + `competitive.total` + `competitive.leaders`
6. **AI Intro Card** - From `ai_intro_current` + `ai_intro_improved`

## Severity Mapping

- **80+** → `low`
- **60-79** → `medium`
- **40-59** → `high`
- **<40** → `critical`

## Usage Examples

### Fetch Pulse Cards

```typescript
// GET request
const response = await fetch('/api/analyzePulseTelemetry?domain=exampledealer.com');
const { cards, summary } = await response.json();

// POST request
const response = await fetch('/api/analyzePulseTelemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clarityData: clarityStackData })
});
const { cards } = await response.json();
```

### Get Aggregated Metrics

```typescript
const response = await fetch('/api/getPulseMetrics?domain=exampledealer.com');
const { metrics } = await response.json();

console.log(metrics.health.overall); // "fair"
console.log(metrics.pulse.criticalCount); // 0
console.log(metrics.health.topPriority); // Array of critical cards
```

## Integration with Dashboard

These endpoints can be used in:

1. **Pulse Dashboard** - Display cards in a grid/list
2. **Priority Actions** - Show top priority cards
3. **Health Overview** - Display overall health metrics
4. **Trend Analysis** - Track changes over time (when trends are implemented)

## Related Files

- `types/pulse.ts` - PulseCard type definition
- `lib/pulse/fromClarity.ts` - Card generation helper
- `app/api/clarity/stack/route.ts` - Clarity stack data source
- `app/api/pulse/snapshot/route.ts` - Pulse snapshot endpoint

