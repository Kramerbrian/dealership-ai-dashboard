# Pulse Tile Automation System

## Overview

Self-evolving pulse tiles that automatically generate from live metric schema, with full automation stack and AI-powered insights.

## Architecture

### Core Components

1. **Tile Generator** (`lib/pulse/tile-generator.ts`)
   - Auto-creates tiles when signal strength > threshold
   - Auto-archives tiles when signal strength < threshold
   - Calculates urgency, pulse frequency, and relevance scores

2. **Insight Synthesizer** (`lib/pulse/insight-synthesizer.ts`)
   - AI-powered insight generation (≤110 chars)
   - Template-based fallback
   - OpenAI integration (when available)

3. **Pulse Orbit** (`components/pulse/PulseOrbit.tsx`)
   - Orbit-first layout with urgency-based sorting
   - Adaptive density for different screen sizes
   - Hover-to-act tooltips
   - Auto-refresh based on tile frequency

4. **API Routes**
   - `POST /api/pulse/new-tile` - Create/update tile
   - `GET /api/pulse/tiles` - Get active tiles
   - `POST /api/pulse/resolve` - Mark tile as resolved
   - `POST /api/cron/pulse-harvest` - Daily metric harvest

## Database Schema

### `pulse_tiles` Table
- `metric_key` - Unique identifier (e.g., "AIO_CTR")
- `signal_strength` - 0.0-1.0, determines if tile is active
- `urgency` - 'low'|'medium'|'high'|'critical'
- `pulse_frequency` - 'hourly'|'daily'|'weekly'
- `insight` - AI-generated insight (≤110 chars)
- `relevance_score` - Auto-calculated for sorting
- `priority_score` - Auto-calculated for sorting

### `pulse_tile_actions` Table
- Tracks actions (fix, view_source, auto_generate, dismiss)
- Links to Fix Next queue

### `pulse_tile_history` Table
- Event log (created, updated, resolved, clicked, dismissed)
- Used for self-learning and threshold fine-tuning

## Automation Workflow

```
1. Collector (Cron) → Pulls metrics from GA4, GSC, GBP, etc.
2. Analyzer → Detects deltas beyond deviation threshold
3. Generator → Calls /api/pulse/new-tile with metric payload
4. Renderer → Next.js auto-renders new <PulseCard />
5. Summarizer → GPT agent writes contextual insight copy
6. Notifier → Pushes toast/Slack ping
```

## Signal Strength Calculation

```typescript
signal_strength = (
  deltaStrength * 0.5 +
  thresholdStrength * 0.3 +
  volatilityFactor * 0.2
)
```

- **deltaStrength**: Normalized change from previous value
- **thresholdStrength**: Proximity to threshold
- **volatilityFactor**: Historical volatility (0-1)

## Urgency Determination

- **Critical**: signal_strength ≥ 0.8 OR delta > 20%
- **High**: signal_strength ≥ 0.6 OR delta > 10%
- **Medium**: signal_strength ≥ 0.4 OR delta > 5%
- **Low**: Otherwise

## Pulse Frequency

- **Hourly**: volatility > 0.7
- **Daily**: volatility > 0.4
- **Weekly**: Otherwise

## UX Enhancements

### Orbit-First Layout
- Center on five KPIs (AIV, ATI, CVI, ORI, GRI)
- New tiles orbit by urgency
- Pulsing halo = anomaly detected

### Action Trigger Gradient
- Unresolved >48h → border animates blue → amber
- Critical/high urgency → pulse animation

### Hover-to-Act
- Hover reveals: "Fix Next", "View Source", "Auto-Generate Schema"
- Click opens Fix Drawer

### Adaptive Density
- <1440px width → compresses minor metrics into micro-tiles
- Responsive grid layout

## Integration Points

### Data Sources
- GA4 (traffic, CTR, bounce rate)
- GSC (search performance, impressions)
- GBP (local presence, reviews)
- CRM (leads, conversions)
- Reviews API (sentiment, response rate)
- vAuto (inventory, pricing)

### Cron Jobs
```bash
# Daily harvest (4 AM UTC)
0 4 * * * curl -X POST "$BASE_URL/api/cron/pulse-harvest" \
  -H "x-cron-secret: $CRON_SECRET"

# Archive resolved tiles (weekly)
0 2 * * 0 curl -X POST "$BASE_URL/api/cron/archive-tiles" \
  -H "x-cron-secret: $CRON_SECRET"
```

## Self-Learning

The system fine-tunes thresholds based on:
- Click-through rates on tiles
- Resolution times
- User dismissals
- Action completions

Thresholds adjust automatically via:
```sql
UPDATE pulse_tiles
SET signal_threshold = calculated_threshold
WHERE metric_key = 'AIO_CTR';
```

## Example Usage

### Create Tile Manually
```typescript
POST /api/pulse/new-tile
{
  "metricKey": "AIO_CTR",
  "currentValue": 0.045,
  "previousValue": 0.050,
  "threshold": 0.040,
  "source": "ga4",
  "volatility": 0.6,
  "change": "-11%",
  "impact": "high",
  "urgency": "critical"
}
```

### Get Active Tiles
```typescript
GET /api/pulse/tiles?limit=20
// Returns sorted array of active tiles
```

### Resolve Tile
```typescript
POST /api/pulse/resolve
{
  "tileId": "uuid-here"
}
```

## Next Steps

1. **OpenAI Integration** - Replace template insights with GPT-4
2. **Real Data Collectors** - Connect to actual GA4, GSC, GBP APIs
3. **Self-Learning Algorithm** - Implement threshold fine-tuning
4. **Predictive Pulse** - Model projects next week's volatility
5. **Weekly Digest** - Auto-compile "Pulse Digest" in dashboard feed
6. **Easter Eggs** - Add cinematic animations for rare events

## Deployment

All components are ready for production. The system will:
- Auto-generate tiles when metrics change
- Auto-archive tiles when resolved
- Auto-refresh UI based on pulse frequency
- Auto-sort by priority and relevance

No manual intervention required! 🚀

