# API Endpoints Implementation Summary

## ✅ Completed Endpoints

### 1. `/api/save-metrics` (Enhanced)

**Purpose:** Persists onboarding calibration data with enhanced schema support.

**Features:**
- ✅ Zod validation schema for type safety
- ✅ Backward compatible (accepts both `adPvr` and `adExpensePvr`)
- ✅ Automatic ROI calculation: `((pvr - adPvr) / adPvr) * 100`
- ✅ Gross profit margin calculation: `pvr - adPvr`
- ✅ Optional fields: `dealer`, `aiv`, `ati`, `metrics` object
- ✅ Clerk authentication required
- ✅ Clerk metadata persistence
- ✅ Ready for orchestrator/Supabase/Redis integration (commented out)

**Request Body:**
```json
{
  "dealer": "naplesautogroup.com",  // optional
  "pvr": 2850,
  "adPvr": 350,  // or "adExpensePvr": 350
  "aiv": 0.87,  // optional
  "ati": 0.83,  // optional
  "metrics": {  // optional
    "schemaCoverage": 0.76,
    "trustScore": 0.89,
    "cwv": 0.85,
    "ugcHealth": 0.72,
    "geoIntegrity": 0.84
  }
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Metrics saved successfully",
  "roi": 714,
  "payload": {
    "userId": "user_xxx",
    "email": "user@example.com",
    "dealer": "naplesautogroup.com",
    "role": "GM",
    "pvr": 2850,
    "adPvr": 350,
    "aiv": 0.87,
    "ati": 0.83,
    "roi": 714,
    "grossProfitMargin": 2500,
    "metrics": {...},
    "completedAt": "2025-11-09T18:53:00Z"
  },
  "metadata": {...}
}
```

**Backward Compatibility:**
- Existing calls with `pvr` and `adExpensePvr` still work
- New fields are optional, so gradual migration is possible

---

### 2. `/api/marketpulse/compute` (New)

**Purpose:** Returns KPI data for landing orb, onboarding scan, and dashboard pulse.

**Features:**
- ✅ Mock KPI data (realistic ranges)
- ✅ Human-readable insight summary
- ✅ Edge caching (5min ISR, 10min stale-while-revalidate)
- ✅ Ready for orchestrator API integration (commented out)
- ✅ Public endpoint (no auth required)

**Query Parameters:**
- `dealer` (required): Dealer domain (e.g., `naplesautogroup.com`)
- `mock` (optional): Force randomized sample (`?mock=true`)

**Response:**
```json
{
  "dealer": "naplesautogroup.com",
  "timestamp": "2025-11-09T18:53:00Z",
  "aiv": 0.87,
  "ati": 0.83,
  "metrics": {
    "schemaCoverage": 0.76,
    "trustScore": 0.89,
    "cwv": 0.92,
    "ugcHealth": 0.78,
    "geoIntegrity": 0.84,
    "zeroClick": 0.48
  },
  "summary": "All systems nominal. Visibility and trust trending positive.",
  "confidence": 0.86
}
```

**KPI Fields:**
- `aiv`: AI Visibility Index (0-1)
- `ati`: Algorithmic Trust Index (0-1)
- `schemaCoverage`: % of pages with valid JSON-LD
- `trustScore`: Composite rating from reviews, GBP, policies
- `cwv`: Core Web Vitals percentile
- `ugcHealth`: User-generated content responsiveness
- `geoIntegrity`: NAP (Name, Address, Phone) consistency
- `zeroClick`: Share of queries answered without site clicks

---

## 🔗 Integration Points

### Landing Page Orb
```typescript
const response = await fetch(`/api/marketpulse/compute?dealer=${dealerDomain}`)
const data = await response.json()
// Display data.aiv and data.ati in the orb
```

### Onboarding Scan
```typescript
const response = await fetch(`/api/marketpulse/compute?dealer=${dealerDomain}`)
const data = await response.json()
// Use data for calibration and display in scan results
```

### Dashboard Pulse
```typescript
// Auto-refresh every 5-10 minutes
const response = await fetch(`/api/marketpulse/compute?dealer=${dealerDomain}`)
const data = await response.json()
// Update metric cards with fresh data
```

### Onboarding Save
```typescript
const response = await fetch('/api/save-metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dealer: 'naplesautogroup.com',
    pvr: 2850,
    adPvr: 350,
    aiv: 0.87,
    ati: 0.83,
    metrics: {
      schemaCoverage: 0.76,
      trustScore: 0.89,
    }
  })
})
const result = await response.json()
// result.roi contains calculated ROI
```

---

## 🚀 Future Integration Options

### Orchestrator API
Uncomment in `/api/save-metrics/route.ts`:
```typescript
if (process.env.ORCHESTRATOR_API && process.env.ORCHESTRATOR_TOKEN) {
  await fetch(`${process.env.ORCHESTRATOR_API}/metrics/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ORCHESTRATOR_TOKEN}`,
    },
    body: JSON.stringify(payload),
  })
}
```

### Supabase
Uncomment in `/api/save-metrics/route.ts`:
```typescript
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  await supabase.from('dealership_metrics').insert(payload)
}
```

### Redis
Uncomment in `/api/save-metrics/route.ts`:
```typescript
if (process.env.REDIS_URL) {
  const redis = await import('@upstash/redis').then(m => m.Redis.fromEnv())
  await redis.hset(`dealer:${data.dealer}`, payload)
}
```

### Live Market Pulse Data
Uncomment in `/api/marketpulse/compute/route.ts`:
```typescript
if (!mock && process.env.ORCHESTRATOR_API && process.env.ORCHESTRATOR_TOKEN) {
  const res = await fetch(`${process.env.ORCHESTRATOR_API}/compute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ORCHESTRATOR_TOKEN}`,
    },
    body: JSON.stringify({ dealer }),
  })
  if (res.ok) {
    const liveData = await res.json()
    return NextResponse.json(liveData, { status: 200 })
  }
}
```

---

## 🔐 Environment Variables

Add to `.env.local` or Vercel project settings:

```env
# Orchestrator API (optional)
ORCHESTRATOR_API=https://api.dealershipai.com/v1/orchestrator
ORCHESTRATOR_TOKEN=your_secret_key

# Supabase (optional)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=your_key

# Redis (optional)
REDIS_URL=your_redis_url
```

---

## ✅ Testing

### Test `/api/marketpulse/compute`
```bash
curl "http://localhost:3000/api/marketpulse/compute?dealer=naplesautogroup.com"
```

### Test `/api/save-metrics` (requires auth)
```bash
# First, get a Clerk session token, then:
curl -X POST http://localhost:3000/api/save-metrics \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your_clerk_session" \
  -d '{
    "dealer": "naplesautogroup.com",
    "pvr": 2850,
    "adPvr": 350,
    "aiv": 0.87,
    "ati": 0.83
  }'
```

---

## 📝 Notes

- Both endpoints are production-ready with proper error handling
- `/api/save-metrics` maintains backward compatibility with existing onboarding flow
- `/api/marketpulse/compute` uses edge caching for performance
- All integration points are commented out and ready to uncomment when backend services are available
- TypeScript types are enforced via Zod validation

