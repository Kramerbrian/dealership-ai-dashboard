# AIV Strip Integration Guide

## ✅ Components Created

1. **`components/visibility/AIVStrip.tsx`** - Main component
2. **`app/api/visibility/presence/route.ts`** - API endpoint

## Quick Integration

### 1. Add to Dashboard Header

```tsx
import AIVStrip from "@/components/visibility/AIVStrip"

// In your dashboard header component
<header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="h-7 w-7 rounded-full bg-white" />
    <span className="text-white/80">DealershipAI • Drive</span>
  </div>
  <div className="flex items-center gap-6">
    <AIVStrip domain={currentDomain} />
    <button 
      onClick={() => setPrefsOpen(true)} 
      className="px-4 py-2 rounded-full border border-white/20"
    >
      Engine Prefs
    </button>
  </div>
</header>
```

### 2. Add to Landing Page (Results Section)

```tsx
import dynamic from "next/dynamic"

const AIVStrip = dynamic(() => import("@/components/visibility/AIVStrip"), { 
  ssr: false 
})

// In your results section (when status === 'done')
<div className="mt-4">
  <AIVStrip domain={domain} className="justify-end" />
</div>
```

### 3. With Custom Thresholds

```tsx
<AIVStrip 
  domain={domain}
  thresholds={{
    ChatGPT: { warn: 85, critical: 75 },
    Perplexity: { warn: 80, critical: 70 },
    Gemini: { warn: 80, critical: 75 },
    Copilot: { warn: 75, critical: 65 }
  }}
/>
```

## API Endpoint

### GET `/api/visibility/presence`

**Query Parameters:**
- `domain` (optional) - Domain to check

**Response:**
```json
{
  "domain": "example.com",
  "engines": [
    { "name": "ChatGPT", "presencePct": 85, "enabled": true },
    { "name": "Perplexity", "presencePct": 78, "enabled": true },
    { "name": "Gemini", "presencePct": 72, "enabled": true },
    { "name": "Copilot", "presencePct": 68, "enabled": true }
  ],
  "lastCheckedISO": "2024-01-15T10:30:00.000Z",
  "connected": true
}
```

## Features

- ✅ **Color-coded status**: Green (good), Amber (warn), Red (critical)
- ✅ **AIV Composite Score**: Weighted average displayed at the end
- ✅ **Time ago display**: Shows when last checked
- ✅ **Loading states**: Skeleton UI while fetching
- ✅ **Custom thresholds**: Override defaults per tenant
- ✅ **Engine filtering**: Respects tenant engine preferences

## Default Thresholds

```typescript
ChatGPT: { warn: 80, critical: 70 }
Perplexity: { warn: 75, critical: 65 }
Gemini: { warn: 75, critical: 70 }
Copilot: { warn: 72, critical: 65 }
```

## Next Steps

1. **Connect to real visibility service** - Replace synthetic data in `/api/visibility/presence/route.ts`
2. **Load tenant preferences** - Fetch engine prefs from database
3. **Add registry integration** - Load thresholds from `registry.yaml` if available
4. **Add "Explain" link** - Open Visibility Drawer with diagnostics

## Testing

```bash
# Test the API
curl "http://localhost:3000/api/visibility/presence?domain=example.com"

# Test with specific domain
curl "http://localhost:3000/api/visibility/presence?domain=terryreidhyundai.com"
```

