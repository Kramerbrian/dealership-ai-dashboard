# ✅ `/api/analyze` Endpoint Ready

## 🎯 What Was Added

### 1. **Simple Cache Layer** (`lib/cache.ts`)
- In-memory cache with optional Upstash Redis
- 24h TTL by default
- City key extraction for GEO pooling
- Falls back to memory if Redis unavailable

### 2. **Rate Limiting** (`lib/rateLimit.ts`)
- Token bucket algorithm
- 20 requests per minute per IP (configurable)
- In-memory buckets (no Redis required)

### 3. **Analyze Endpoint** (`app/api/analyze/route.ts`)
- **City-pooled baseline**: Caches results per city for 24h
- **Dealer variance**: Applies ±5% variance per dealership
- **Rate limited**: 20 req/min per IP
- **Returns**: Overall score, platform scores, critical issues, revenue impact

### 4. **Share-to-Unlock Modal** (`components/share/ShareUnlockModal.tsx`)
- Twitter/X sharing
- LinkedIn sharing
- Unlock confirmation
- Viral growth mechanism

### 5. **New Landing Page** (`app/page.tsx`)
- Instant domain analysis
- Results display with platform scores
- Critical issues with revenue impact
- Share-to-Unlock CTA
- Product, pricing, FAQ sections

## 🚀 Usage

### Test Locally
```bash
npm run dev
# Visit http://localhost:3000
# Enter a domain (e.g., "naplesautogroup.com")
# Click "Analyze"
```

### API Endpoint
```bash
curl "http://localhost:3000/api/analyze?domain=naplesautogroup.com"
```

### Response Format
```json
{
  "ok": true,
  "dealership": "naplesautogroup.com",
  "location": "FL NAPLES",
  "overall": 87,
  "rank": 2,
  "of": 8,
  "platforms": [
    { "name": "ChatGPT", "score": 92, "status": "Excellent" },
    { "name": "Claude", "score": 88, "status": "Good" },
    ...
  ],
  "issues": [
    {
      "title": "Missing AutoDealer Schema",
      "impact": 8500,
      "effort": "2 hours"
    },
    ...
  ]
}
```

## 🔧 Configuration

### Optional: Upstash Redis
```bash
# Add to .env.local
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**Benefits:**
- Persistent cache across server restarts
- Shared cache across multiple instances
- Better for production scaling

**Without Redis:**
- Uses in-memory cache (works fine for single instance)
- Cache cleared on server restart
- Still fully functional

## 📊 How It Works

1. **City Pooling**: First request for a city creates a baseline (cached 24h)
2. **Dealer Variance**: Each dealership gets ±5% variance based on domain hash
3. **Rate Limiting**: 20 requests per minute per IP address
4. **Caching**: Results cached per city key for 24 hours

## 🎨 Features

- ✅ Instant analysis (no external API calls)
- ✅ Realistic scores (city-pooled + dealer variance)
- ✅ Revenue impact calculations
- ✅ Rate limiting (prevents abuse)
- ✅ Share-to-Unlock (viral growth)
- ✅ SEO optimized (JSON-LD structured data)

## 🔜 Next Steps

The user mentioned these potential additions:
1. `/api/telemetry` → Supabase writes (event log with funnel metrics)
2. `/api/pulse/impacts`, `/api/pulse/radar`, `/api/schema/validate` (dAI Schema Engine stubs)
3. `/onboarding` stepper (Clerk SSO + share-to-unlock integrated)
4. `/admin/analytics` (downloadable CSV + funnel viz)
5. Zustand for UI state management

Say **"add onboarding + supabase telemetry + rate-limit"** to ship the next drop!

---

**Status:** ✅ **READY** - Test at `http://localhost:3000`

