# 🎯 DealershipAI Front-End Integration Plan

**Status:** In Progress  
**Last Updated:** 2025-11-13

---

## ✅ Completed

### 1. Core Infrastructure
- ✅ SEO Components created ([components/seo/JsonLd.tsx](components/seo/JsonLd.tsx), [components/seo/SeoBlocks.ts](components/seo/SeoBlocks.ts))
- ✅ Analyzer API endpoint created ([app/api/analyze/route.ts](app/api/analyze/route.ts))
- ✅ Production APIs deployed and tested
- ✅ Security vulnerabilities fixed (0 remaining)
- ✅ Playwright test suite created

### 2. Backend APIs (All Live)
- ✅ `/api/schema` - Schema validation
- ✅ `/api/explain/*` - 7 metric definitions
- ✅ `/api/assistant` - Claude AI with dAI persona
- ✅ `/api/orchestrator/train` - HMAC-protected webhooks

---

## 📋 Next Steps

### Phase 1: Dashboard Components (2-3 hours)

**Priority: HIGH**

1. **Create Dashboard Components**
   ```bash
   components/dashboard/
   ├── SignalTicker.tsx         # Real-time Pulse signals
   ├── TrustScoreHero.tsx        # Main trust score display
   ├── Delta Indicator.tsx        # Delta indicators
   ├── PillarCard.tsx            # SEO/AEO/GEO/QAI cards
   ├── MetricTrendSpark.tsx      # Sparkline charts
   ├── OCIFinancialPanel.tsx     # Revenue at risk
   ├── PulseCardsPanel.tsx       # Pulse cards grid
   └── DashboardShell.tsx        # Main dashboard layout
   ```

2. **Wire to Real Data**
   - Connect TrustScoreHero to `/api/explain/ai-visibility-score`
   - Connect PillarCards to `/api/explain/*` endpoints
   - Connect OCIFinancialPanel to `/api/explain/revenue-at-risk`
   - Connect PulseCardsPanel to `/api/pulse/stream`

3. **Create Dashboard Page**
   ```typescript
   // app/(dashboard)/dashboard/page.tsx
   import DashboardShell from '@/components/dashboard/DashboardShell';
   export default function DashboardPage() {
     return <DashboardShell />;
   }
   ```

### Phase 2: Enhanced Landing Page (1-2 hours)

**Priority: HIGH**

1. **Update Landing Page**
   - Add SEO JsonLd blocks (already created)
   - Wire analyzer form to `/api/analyze`
   - Add loading states
   - Add error handling
   - Style report display

2. **Test Flow**
   ```
   User enters domain → POST /api/analyze → Display results
   → "Open Dashboard" button → Navigate to /dashboard
   ```

### Phase 3: Fleet Management (2-3 hours)

**Priority: MEDIUM**

1. **Create Fleet Page**
   ```typescript
   // app/(dashboard)/fleet/page.tsx
   - Multi-dealership table view
   - CSV upload for bulk origins
   - Individual dealership drill-down
   - Aggregate trust scores
   ```

2. **Wire to APIs**
   - `/api/origins` for dealership list
   - `/api/analyze` for individual scores
   - Bulk analysis endpoint

### Phase 4: Voice Orb Integration (2-3 hours)

**Priority: LOW**

1. **ElevenLabs Integration**
   - Voice orb UI component
   - Speech-to-text for queries
   - Text-to-speech for responses
   - Integration with `/api/assistant`

2. **Environment Setup**
   ```bash
   npx vercel env add ELEVENLABS_API_KEY production
   ```

### Phase 5: Settings & Governance (3-4 hours)

**Priority: LOW**

1. **Settings Modal**
   - User preferences
   - Notification settings
   - API key management
   - Autonomy mode controls

2. **Pop Culture Agent Integration**
   - dAI personality settings
   - Truth Bombs toggle
   - Context configuration

---

## 🚀 Quick Implementation Guide

### Step 1: Create Dashboard Components (Now)

```bash
# Copy components from JSON skeleton
# Files already prepared in integration plan

# Test locally
npm run dev
# Open http://localhost:3000/dashboard
```

### Step 2: Wire Real Data

```typescript
// components/dashboard/TrustScoreHero.tsx
const { data } = useSWR('/api/explain/ai-visibility-score');
<TrustScoreHero 
  score={data?.benchmarks?.excellent || 88}
  delta={+4.2}
  trustLabel="Strong"
/>
```

### Step 3: Deploy

```bash
git add .
git commit -m "feat: Add dashboard components and analyzer API"
git push origin main
```

---

## 📊 Component Dependency Map

```
Landing Page (/)
├── JsonLd (SEO)
├── SeoBlocks (schema)
└── Analyzer Form → /api/analyze

Dashboard (/dashboard)
├── DashboardShell
│   ├── SignalTicker → /api/pulse/stream
│   ├── TrustScoreHero → /api/explain/ai-visibility-score
│   ├── PillarCards (4x) → /api/explain/*
│   ├── PulseCardsPanel → /api/pulse/stream
│   └── OCIFinancialPanel → /api/explain/revenue-at-risk
│
Fleet (/fleet)
├── Fleet Table → /api/origins
└── CSV Upload → /api/analyze (bulk)

Settings (/settings)
├── Governance Console
└── Autonomy Settings
```

---

## 🧪 Testing Strategy

### 1. Component Tests
```bash
# Run Playwright tests
npx playwright test tests/landing-page.spec.ts

# Test dashboard
npx playwright test tests/dashboard.spec.ts (to be created)
```

### 2. API Integration Tests
```bash
# Test analyzer
curl -X POST https://dealershipai.com/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"domain":"terryreidhyundai.com"}' | jq

# Test explain APIs
curl https://dealershipai.com/api/explain/ai-visibility-score | jq
```

### 3. Performance Tests
```bash
# Run Lighthouse
npx @lhci/cli autorun --collect.url=https://dealershipai.com
```

---

## 📝 Environment Variables Needed

```bash
# Already set
ANTHROPIC_API_KEY          ✅
CLERK_SECRET_KEY           ✅
DATABASE_URL               ✅
UPSTASH_REDIS_REST_URL     ✅

# To be added (optional)
ELEVENLABS_API_KEY         ⏳ (for Voice Orb)
SENTRY_DSN                 ⏳ (for error tracking)
```

---

## 🎯 Success Criteria

- ✅ Landing page analyzer works with real API
- ⏳ Dashboard displays live trust scores
- ⏳ Pulse cards show real-time signals
- ⏳ Fleet page shows multi-dealership view
- ⏳ All components mobile-responsive
- ⏳ Lighthouse score > 90
- ⏳ Zero console errors

---

## 🔗 Key Files

### Created
- `/components/seo/JsonLd.tsx`
- `/components/seo/SeoBlocks.ts`
- `/app/api/analyze/route.ts`
- `/tests/landing-page.spec.ts`

### To Create
- `/components/dashboard/DashboardShell.tsx`
- `/components/dashboard/SignalTicker.tsx`
- `/components/dashboard/TrustScoreHero.tsx`
- `/components/dashboard/PillarCard.tsx`
- `/components/dashboard/PulseCardsPanel.tsx`
- `/app/(dashboard)/dashboard/page.tsx`
- `/app/(dashboard)/fleet/page.tsx`

---

**Next Action:** Create dashboard components and wire to real APIs
