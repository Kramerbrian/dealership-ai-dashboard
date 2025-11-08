# AI Scores Integration Guide

## Overview

This guide shows how to integrate live AIV/ATI/CRS metrics from the DealershipAI API into your Next.js dashboard using doctrine-compliant components.

## Quick Start

### 1. Using the Hook

```typescript
import { useAIScores } from "@/app/(dashboard)/hooks/useAIScores";

function MyComponent() {
  const { scores, loading, error, refresh } = useAIScores(
    "https://naplesfordfl.com",  // domain (optional)
    "toyota-naples"              // dealerId (optional)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>AIV Score: {scores?.aiv_score}</p>
      <p>ATI Score: {scores?.ati_score}</p>
      <p>CRS Score: {scores?.crs}</p>
    </div>
  );
}
```

### 2. Using the PulseCard Component (Doctrine-Compliant)

```typescript
import AIVATIPulseCard from "@/app/(dashboard)/components/metrics/AIVATIPulseCard";

function Dashboard() {
  return (
    <AIVATIPulseCard
      domain="https://naplesfordfl.com"
      dealerId="toyota-naples"
      onDrillDown={() => {
        // Open detailed view or modal
        console.log("User wants more details");
      }}
    />
  );
}
```

### 3. Using the Platform Breakdown Component

```typescript
import PlatformBreakdownCard from "@/app/(dashboard)/components/metrics/PlatformBreakdownCard";

function Dashboard() {
  return (
    <PlatformBreakdownCard
      domain="https://naplesfordfl.com"
      dealerId="toyota-naples"
    />
  );
}
```

## API Endpoint

The components fetch data from:

```
GET /api/ai-scores?origin=https://dealer.com&dealerId=toyota-naples
```

This endpoint:
- Proxies to `https://api.gpt.dealershipai.com/api/ai-scores`
- Caches responses for 3 minutes
- Rate limits to 15 requests per minute per IP
- Validates URLs for SSRF protection

## Response Format

```json
{
  "timestamp": "2025-11-06T10:32:44Z",
  "model_version": "AIVATI-RL-v1.3",
  "dealerId": "toyota-naples",
  "aiv_score": 0.92,
  "ati_score": 0.89,
  "crs": 0.905,
  "kpi_scoreboard": {
    "QAI_star": 4.6,
    "VAI_Penalized": 0.84,
    "PIQR": 0.91,
    "HRP": 0.88,
    "OCI": 0.93
  },
  "platform_breakdown": [
    { "platform": "chatgpt", "score": 91, "confidence": "HIGH" },
    { "platform": "claude", "score": 88, "confidence": "HIGH" },
    { "platform": "perplexity", "score": 84, "confidence": "MEDIUM" },
    { "platform": "gemini", "score": 90, "confidence": "HIGH" },
    { "platform": "copilot", "score": 77, "confidence": "MEDIUM" },
    { "platform": "grok", "score": 68, "confidence": "LOW" }
  ],
  "zero_click_inclusion_rate": 73.4,
  "ugc_health_score": 82,
  "revenue_at_risk_monthly_usd": 47120,
  "aiv_formula_reference": "Algorithmic_Visibility_Index_Augmented_By_FastSearch_RankEmbed.docx",
  "status": "operational"
}
```

## Doctrine Compliance

The `AIVATIPulseCard` component follows the DealershipAI Design Doctrine:

✅ **Law 1: Every Pixel is a Verb**
- Headline shows outcome in plain English
- Auto-Fix button enables immediate action
- Click anywhere to drill down

✅ **Law 2: Every Insight Self-Validates**
- Shows impact: "$47K/mo at risk"
- Explains cause: "AI Visibility is limiting your presence"
- Prescribes action: "Address gaps to recover $47K/mo"

✅ **Law 3: Remove Friction**
- 7 elements max per card
- Instant comprehension (< 3 seconds)
- One-click actions

## Integration Examples

### Example 1: Standalone Dashboard Page

```typescript
// app/(dashboard)/ai-scores/page.tsx
"use client";

import AIVATIPulseCard from "@/app/(dashboard)/components/metrics/AIVATIPulseCard";
import PlatformBreakdownCard from "@/app/(dashboard)/components/metrics/PlatformBreakdownCard";

export default function AIScoresPage() {
  const domain = "https://naplesfordfl.com";
  const dealerId = "toyota-naples";

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">AI Performance Metrics</h1>
        
        <AIVATIPulseCard
          domain={domain}
          dealerId={dealerId}
          onDrillDown={() => {
            // Navigate to detailed view
            window.location.href = "/dashboard/ai-scores/detail";
          }}
        />
        
        <PlatformBreakdownCard
          domain={domain}
          dealerId={dealerId}
        />
      </div>
    </div>
  );
}
```

### Example 2: Embedded in Cognitive Control Center

Already integrated! See `app/(dashboard)/command-center/cognitive-control-center.tsx`

### Example 3: With Custom Error Handling

```typescript
"use client";

import { useAIScores } from "@/app/(dashboard)/hooks/useAIScores";
import { AlertCircle } from "lucide-react";

export default function CustomAIScores() {
  const { scores, loading, error, refresh } = useAIScores(
    "https://naplesfordfl.com",
    "toyota-naples"
  );

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
        <div className="flex items-center gap-2 text-red-300">
          <AlertCircle size={18} />
          <span>Failed to load scores. Please try again.</span>
        </div>
        <button
          onClick={() => refresh()}
          className="mt-2 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="animate-pulse">Loading AI scores...</div>;
  }

  return (
    <div>
      {/* Your custom UI here */}
    </div>
  );
}
```

## Environment Variables

Make sure these are set in your `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
# or in production:
# NEXT_PUBLIC_API_BASE_URL=https://dealership-ai-dashboard.vercel.app/api

# Fleet API (for direct backend calls)
FLEET_API_BASE=https://api.gpt.dealershipai.com
X_API_KEY=your_api_key_here
```

## Testing

### Local Testing

```bash
# Start your Next.js dev server
npm run dev

# In another terminal, test the API endpoint
curl "http://localhost:3000/api/ai-scores?origin=https://naplesfordfl.com&dealerId=toyota-naples"
```

### Component Testing

The components use `useSWR` for automatic:
- Caching (5-minute refresh interval)
- Revalidation on reconnect
- Error retry logic

## Performance

- **Initial Load**: ~200-500ms (cached)
- **Cache Hit**: < 50ms
- **Bundle Size**: ~15KB (gzipped)
- **Re-renders**: Minimal (SWR handles updates)

## Troubleshooting

### Issue: "Failed to load AI scores"

**Solutions:**
1. Check API endpoint is accessible
2. Verify domain/dealerId parameters
3. Check browser console for CORS errors
4. Verify environment variables are set

### Issue: Scores showing as 0 or undefined

**Solutions:**
1. Check API response format matches expected structure
2. Verify scores are in 0-1 or 0-100 format
3. Check normalization logic in component

### Issue: Rate limiting errors

**Solutions:**
1. Reduce refresh frequency
2. Increase cache TTL
3. Use server-side rendering for initial load

## Next Steps

1. ✅ Components created and integrated
2. ✅ Hook created with SWR caching
3. ✅ Doctrine-compliant UI
4. 🔄 Add more detailed drill-down views
5. 🔄 Add comparison views (vs competitors)
6. 🔄 Add historical trend charts
7. 🔄 Add export functionality

## Related Documentation

- [Design Doctrine Implementation Guide](./DOCTRINE_IMPLEMENTATION_GUIDE.md)
- [Design Doctrine Specification](../configs/ux/DealershipAI_Design_Doctrine_v1.0.json)

