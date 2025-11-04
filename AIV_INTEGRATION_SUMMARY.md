# AIV Integration Summary

## ✅ Completed Implementation

### 1. **AIV Calculation Hook** (`lib/hooks/useAIVCalculator.ts`)
- Implements all AIV formulas from the JSON schema
- Calculates AIV_core, AIV_sel, AIV_mods, AIV, and AIVR scores
- Fetches data from multiple sources (API, CSV, JSON)
- React Query integration for caching and auto-refresh
- Provides `recalculate` function for custom inputs

### 2. **AIV API Endpoint** (`app/api/aiv/calculate/route.ts`)
- POST endpoint for calculating AIV scores
- Validates inputs using Zod schema
- Returns computed scores, summaries, and breakdown
- Integrated with rate limiting and performance monitoring

### 3. **AIV Modal Component** (`components/dashboard/AIVModal.tsx`)
- Beautiful modal UI with score cards
- Displays AIV, AIVR, and Revenue at Risk
- Shows detailed breakdown (AIV_core, AIV_sel, AIV_mods, SEO, AEO, GEO, UGC, GeoLocal)
- Formula reference section
- Auto-refreshes every minute when open

### 4. **Dashboard Integration** (`app/components/DealershipAIDashboardLA.tsx`)
- Added "AIV™" tab to navigation
- Added "AIV™ Score" button in header
- Integrated AIVModal component
- State management for modal open/close

### 5. **HAL-9000 Chatbot Integration** (`app/components/HAL9000Chatbot.tsx`)
- Added AIV query handlers:
  - "what is my visibility"
  - "show my ai score"
  - "how visible am I"
  - "aiv"
  - "visibility index"
- Fetches real AIV data from API
- Returns formatted chat summary with scores

### 6. **Redis Pub/Sub Event Bus** (`lib/events/bus.ts`)
- Redis Pub/Sub with local EventEmitter fallback
- Safe initialization with retry logic
- Multi-instance safe when Redis is configured
- Falls back to local mode if REDIS_URL is unset

### 7. **Redis Diagnostics** (`app/api/diagnostics/redis/route.ts`)
- Health check endpoint for Redis status
- Returns configuration and connection status

## 📊 AIV Calculation Formulas

```
AIV_core = 0.25×SEO + 0.30×AEO + 0.25×GEO + 0.10×UGC + 0.05×GeoLocal
AIV_sel = 0.35×SCS + 0.35×SIS + 0.30×SCR
AIV_mods = TemporalWeight × EntityConfidence × CrawlBudgetMult × InventoryTruthMult
AIV = (AIV_core × AIV_mods) × (1 + 0.25×AIV_sel)
AIVR = AIV × (1 + CTR_delta + Conversion_delta)
Revenue_at_Risk = (1 - AIV) × monthly_opportunities × avg_gross_per_unit
```

## 🔧 Usage

### In Components
```tsx
import { useAIVCalculator } from '@/lib/hooks/useAIVCalculator';

const { outputs, isLoading, error, refetch } = useAIVCalculator(dealerId, {
  enabled: true,
  refetchInterval: 60 * 1000, // Optional auto-refresh
});
```

### In API
```typescript
POST /api/aiv/calculate
{
  "dealerId": "naples-toyota",
  "platform_scores": { ... },
  "google_aio_inclusion_rate": 0.62,
  // ... other inputs
}
```

### In Chatbot
Users can ask:
- "What is my visibility?"
- "Show my AI score"
- "How visible am I?"
- "What is my AIV?"

## 📦 Dependencies

- `redis` - Redis client for Pub/Sub (install with `npm install redis`)
- `@tanstack/react-query` - Already installed
- `framer-motion` - Already installed
- `lucide-react` - Already installed

## 🚀 Next Steps

1. **Install Redis package**: `npm install redis`
2. **Set REDIS_URL** (optional): `export REDIS_URL="redis://user:pass@host:6379/0"`
3. **Test AIV calculations**: Navigate to AIV tab in dashboard
4. **Test chatbot**: Ask HAL-9000 about visibility
5. **Test Redis Pub/Sub**: Use diagnostics endpoint to verify

## 📝 Notes

- AIV calculations use the exact formulas from the JSON schema
- All scores are bounded: AIV_sel [0,1], AIV [0,1], AIVR [0,2]
- Revenue at Risk is calculated monthly
- Summaries are auto-generated with contextual information
- Modal can be opened from tab navigation or header button
- Chatbot integration fetches real-time data when queried

