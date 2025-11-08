# DealershipAI Visibility Dashboard

**Version:** 1.4.0-p13n (Part 2 + Personalization)

## Overview
DealershipAI is a comprehensive AI visibility platform for automotive dealerships. It monitors presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot while providing actionable insights to recover revenue at risk.

## Features

### Core Capabilities
- **AI Visibility Tracking**: Monitor 5 AI platforms
- **Pulse Engine**: Identify→Solve→Actionable framework
- **Competitor Analysis**: Radius-based segmentation (10→25mi)
- **Schema Validation**: JSON-LD audit for Product, FAQPage, AutoDealer
- **GA4 Integration**: OAuth + token refresh + traffic analysis
- **Reviews Management**: GBP integration with reply latency tracking
- **Personalization Engine**: Role-based UI + easter eggs

### Integrations
- ✅ Clerk Authentication (tenant-scoped)
- ✅ Supabase (token persistence)
- ✅ Upstash Redis (caching layer)
- ✅ Google OAuth (GA4 + future GBP)
- ✅ GA4 Data API (auto-refresh tokens)

## Quick Start

```bash
# Clone and install
npm install

# Copy environment template
cp .env.example .env.local

# Add your keys to .env.local
# - Clerk (auth)
# - Supabase (persistence)
# - Upstash (cache)
# - Google OAuth (GA4)

# Run migrations
cd supabase
supabase migration up

# Start dev server
npm run dev
```

## Architecture

### Clay Principles
1. **Identify**: Pulse cards surface issues with $ impact
2. **Solve**: FixTierDrawer shows preview, ETA, expected ROI
3. **Actionable**: One-click Fix→Apply→Undo with Impact Ledger

### File Structure
```
app/
  api/
    competitors/       # Radius-based ranking
    pulse/snapshot/    # Feed merger (all adapters)
    ga4/summary/       # OAuth + auto-refresh
    reviews/summary/   # GBP place_id
    visibility/        # 4-engine presence
    schema/validate/   # JSON-LD audit
    oauth/ga4/         # Google OAuth flow
lib/
  adapters/           # Schema, GA4, Reviews, Visibility
  auth/               # Clerk tenant gating
  cache.ts            # Upstash Redis
  db/                 # Supabase admin client
  integrations/       # Token store helpers
  google/             # OAuth + GA4 API
  p13n/               # Personalization + easter eggs
configs/
  dealer_segment_table.json
  onboardingFlow.json
```

### Personalization Engine

#### Easter Eggs (Film References)
- **Deep Insight**: "You mustn't be afraid to dream a little bigger." (Inception)
- **Auto-Remediation**: "Come with me if you want to fix this." (Terminator)
- **Self-Healing**: "Hasta la vista, error." (Terminator 2)
- **Mission Complete**: "Are you not entertained?" (Gladiator)
- **Aggressive Pull**: "I drink your milkshake." (There Will Be Blood)

**Rules:**
- Context-triggered (not random)
- Max 1 per user per 24h
- Never blocks task completion
- Dry wit, never slapstick

#### Cognitive Modes
- `standard`: Default experience
- `reducedMotion`: Accessibility mode
- `lowContrast`: Focus-friendly palette

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

Add environment variables in Vercel dashboard.

### Environment Variables
```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE=

# Optional (enables features)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
GA4_PROPERTY_ID=
```

## API Routes

### Tenant-Gated (Clerk)
- `GET /api/competitors?brand=Toyota` - Radius ranking
- `GET /api/pulse/snapshot?domain=example.com` - Full feed
- `GET /api/ga4/summary?domain=example.com` - GA4 metrics
- `GET /api/reviews/summary?placeId=ChIJ...` - Review stats
- `GET /api/visibility/presence?domain=example.com` - 4 engines

### Public
- `GET /api/schema/validate?domain=example.com` - JSON-LD audit
- `GET /robots.txt` - AI-friendly crawl rules
- `GET /sitemap.xml` - Dynamic sitemap

## Development

### Add New Adapter
1. Create `lib/adapters/yourAdapter.ts`
2. Export `yourAdapterToPulses()` function
3. Import in `app/api/pulse/snapshot/route.ts`
4. Add to `Promise.all()` array

### Add New Integration
1. Add OAuth route in `app/api/oauth/[provider]/`
2. Store tokens via `upsertIntegration()`
3. Create summary route in `app/api/[provider]/summary/`
4. Wire adapter to snapshot

## Telemetry

All routes log:
- Tenant ID
- Route path
- Latency (ms)
- Cache hit/miss
- Error states

## License
Proprietary - DealershipAI © 2025

## Support
For questions: support@dealershipai.com