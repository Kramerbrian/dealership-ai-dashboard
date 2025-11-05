# Additions in Patch 2

## 🚀 New Features

### Competitive Graph API
- **Route**: `/api/graph/relations`
- **Purpose**: Store and retrieve overlap edges (comention/serp/traffic/review)
- **Methods**: GET (list relations), POST (create/update relation)

### Market Pulse Cron
- **Route**: `/api/pulse/weekly`
- **Schedule**: Every Monday at 1:00 PM UTC (Vercel cron)
- **Purpose**: Weekly baseline to power velocity tiles and trend analysis

### Win Probability Calculator
- **Route**: `/api/win-prob`
- **Library**: `lib/winprob.ts`
- **Purpose**: CFO-facing gauge that estimates likelihood of winning AI-origin leads
- **Formula**: Weighted combination of AI Visibility (30%), Review Trust (25%), Schema Coverage (20%), GBP Health (15%), Zero-Click (10%)

### Executive Mode Dashboard
- **Route**: `/dashboard/exec`
- **Purpose**: Board-room mode that converts technical metrics into $$ context
- **Features**: Revenue at Risk, Revenue Recovered, Win Probability

### Agent Memory System
- **Route**: `/api/memory/set`
- **Component**: `app/dashboard/_coach/MemoryCoach.tsx`
- **Purpose**: Persistent memory for AI coach to remember user actions and context

### Zero-Click Inclusion API
- **Route**: `/api/zero-click/inclusion`
- **Purpose**: Intent-specific inclusion checks for AI Overviews
- **Query**: `?q=buy,service,trade` (comma-separated intents)

### Map Overlay Component
- **Component**: `components/MapOverlay.tsx`
- **Purpose**: Competitive ring visualization with score-colored pins
- **Status**: Stub ready for Google Maps integration

### Mystery Shop 360
- **Route**: `/api/mystery/360`
- **Purpose**: Multi-surface shop request (website, GBP, reviews, etc.)

## 🎨 Theme System

### Theme Module
- **File**: `lib/theme.ts`
- **Hook**: `hooks/useDealerTheme.ts`
- **API**: `/api/v1/theme/[dealerId]`
- **Features**:
  - Adaptive theming (light/dark/system)
  - Dealership-level brand overrides
  - Automatic OS preference detection
  - CSS variable injection

## 📊 Database Schema

The Prisma schema includes new models:
- `Tenant` - Multi-tenant organization
- `Profile` - User profiles linked to tenants
- `Connection` - External service connections (GBP, GA4, GSC)
- `OnboardingRun` - Step-by-step onboarding state
- `Competitor` - Competitive intelligence
- `Insight` - AI-generated insights and alerts
- `Action` - Actionable tasks (schema fixes, GBP updates, mystery shops)
- `PulseMetric` - Weekly performance snapshots
- `Relation` - Competitive graph edges
- `Memory` - Agent memory for context persistence

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Apply Database Migrations**
   ```bash
   npm run prisma:push
   # or
   npx prisma migrate dev --name add_patch2_models
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

### API Endpoints
- `GET /api/win-prob?ai=62&rt=68&sc=72&gbp=85&zc=58` - Win probability calculator
- `GET /api/graph/relations?tenantId=xxx` - Competitive graph edges
- `GET /api/pulse/weekly` - Weekly pulse metrics (cron endpoint)
- `GET /api/competitors/watch` - Competitor monitoring (cron endpoint)
- `GET /api/zero-click/inclusion?q=buy,service,trade` - Zero-click inclusion rates
- `POST /api/mystery/360` - Create mystery shop request
- `POST /api/memory/set` - Set agent memory
- `GET /api/v1/theme/[dealerId]` - Fetch dealership theme

### Dashboard Pages
- `/dashboard` - Main dashboard with Daily Focus
- `/dashboard/competitors` - Competitive benchmarking
- `/dashboard/exec` - Executive mode with board-room metrics

## 🔄 Next Steps

1. **Replace Synthetic Values**
   - Wire win probability to actual AI scores
   - Connect pulse metrics to real GBP/GA4 data
   - Replace mock zero-click data with real API calls

2. **Wire Memory Coach**
   - Connect to actual user actions
   - Pull from last-step context
   - Show personalized tips based on history

3. **Render Map Overlay**
   - Integrate Google Maps API
   - Add score-colored pins
   - Show competitive rings

4. **Theme Integration**
   - Apply theme on app initialization
   - Add theme toggle in settings
   - Test dealership-level overrides

## 📝 Environment Variables

Add to `.env.local` or Vercel:
```
THEME_API_KEY=sk-orch-xxxxx
ORCHESTRATOR_URL=https://api.dealershipai.cloud
```

## 🎯 Key Improvements

- **Executive-Friendly**: Metrics converted to revenue context
- **Competitive Intelligence**: Graph-based competitor tracking
- **Agent Memory**: Context-aware coaching
- **Adaptive Theming**: Brand customization per dealership
- **Zero-Click Tracking**: Intent-specific inclusion monitoring
- **Automated Pulse**: Weekly metrics via cron jobs

