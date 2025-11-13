# Next Steps - Orchestrator 3.0 Implementation

## ✅ Completed

1. **Dependencies Added**
   - All required packages added to `apps/web/package.json`
   - Mapbox, Clerk, Zustand, React Query, etc.

2. **Mapbox Day/Night Mode**
   - ✅ `MapStyleToggle` component created
   - ✅ `DealerFlyInMap` updated with legend overlay and mode support
   - ✅ `LandingAnalyzer` integrated with toggle

3. **API Routes**
   - ✅ `/api/marketpulse/compute` - Mock KPI endpoint

4. **Documentation**
   - ✅ Environment variables guide created
   - ✅ Mapbox configuration documented

## 🚀 Ready for Deployment

### Environment Variables Required

Set these in Vercel:

```bash
# Mapbox (required for landing page)
NEXT_PUBLIC_MAPBOX_KEY=your_token
# OR
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token

# Optional: Custom style URLs
NEXT_PUBLIC_MAPBOX_DARK_STYLE=mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y
NEXT_PUBLIC_MAPBOX_LIGHT_STYLE=mapbox://styles/briankramer/cmhxie6qr009n01sa6jz81fur
NEXT_PUBLIC_MAPBOX_LANDING_STYLE=mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y
```

### Build & Deploy

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build
npm run build -- --filter=@dealershipai/web

# Or deploy to Vercel
vercel --prod
```

## 📋 Verification Checklist

After deployment, verify:

- [ ] Landing page loads at `https://dealershipai.com/`
- [ ] Mapbox map displays with fly-in animation
- [ ] Map style toggle works (Night/Day)
- [ ] Clarity Stack panel shows scores
- [ ] AI Intro Card displays
- [ ] Dashboard requires Clerk auth
- [ ] Onboarding flow works (`/dash/onboarding`)

## 🔄 Remaining Tasks (Optional)

1. **Orchestrator 3.0 Integration**
   - Connect to `api.dealershipai.com` when ready
   - Set `ORCHESTRATOR_API` and `ORCHESTRATOR_TOKEN` env vars

2. **Real Data Integration**
   - Replace mock data in `/api/clarity/stack`
   - Connect to actual GBP, schema, reviews APIs

3. **Onboarding Enhancement**
   - Add NolanAcknowledgment → OrchestratorReadyState → PulseAssimilation flow
   - Currently uses simple 4-step flow

## 📚 Documentation

- `docs/ENVIRONMENT_VARIABLES.md` - Complete env var guide
- `apps/web/lib/config/mapbox-styles.ts` - Mapbox style configuration
