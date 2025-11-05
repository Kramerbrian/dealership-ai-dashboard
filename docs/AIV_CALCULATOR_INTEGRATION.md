# AIV Calculator Integration Guide

## Overview

The AIV (Algorithmic Visibility Index) Calculator system provides deterministic, front-end safe computation of:
- **AIV™ Score**: Core algorithmic visibility metric
- **AIVR™ Score**: ROI-adjusted visibility score
- **Revenue at Risk**: Monthly revenue estimate based on visibility gaps

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Sources                              │
│  /api/ai-scores  │  /api/leaderboard  │  dealerData prop     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              useAIVCalculator Hook                           │
│  • Deterministic calculations                                │
│  • Front-end safe                                            │
│  • Real-time updates                                         │
└─────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────┐   ┌──────────────────────┐
│   AIVModal.tsx       │   │ /api/agent/visibility│
│  • Dashboard UI      │   │ • Chat context       │
│  • Modal display     │   │ • LLM integration     │
└─────────────────────┘   └──────────────────────┘
```

## Files Created

### 1. `/hooks/useAIVCalculator.ts`
**Purpose**: Core computation hook for React components

**Exports**:
- `AIVInputs` interface
- `AIVOutputs` interface
- `useAIVCalculator()` hook

**Usage**:
```tsx
import { useAIVCalculator, AIVInputs } from '@/hooks/useAIVCalculator';

const inputs: AIVInputs = {
  dealerId: "naples-toyota",
  platform_scores: { chatgpt: 0.86, gemini: 0.84 },
  // ... other inputs
};

const results = useAIVCalculator(inputs);
// results.AIV_score, results.AIVR_score, results.Revenue_at_Risk_USD
```

### 2. `/components/AIVModal.tsx`
**Purpose**: Dashboard modal component displaying AIV metrics

**Props**:
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler
- `dealerData?: Partial<AIVInputs>` - Optional pre-loaded data
- `dealerId?: string` - Dealer identifier (defaults to 'current')

**Features**:
- Real-time AIV score display
- Platform breakdown visualization
- Revenue at Risk calculation
- Key metrics dashboard
- Action buttons for navigation

**Usage**:
```tsx
import AIVModal from '@/components/AIVModal';

function Dashboard() {
  const [showAIV, setShowAIV] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowAIV(true)}>View AIV</button>
      <AIVModal
        isOpen={showAIV}
        onClose={() => setShowAIV(false)}
        dealerId="naples-toyota"
      />
    </>
  );
}
```

### 3. `/app/api/agent/visibility/route.ts`
**Purpose**: Chat agent API endpoint for conversational AI context

**Endpoints**:
- `GET /api/agent/visibility?dealerId=xxx` - Get AIV context for chat
- `POST /api/agent/visibility` - Calculate AIV with custom inputs

**Response**:
```json
{
  "dealerId": "naples-toyota",
  "AIV_summary": "Your current AIV™ is 87.3%...",
  "AIV_score": 0.873,
  "AIVR_score": 0.945,
  "Revenue_at_Risk_USD": 24800,
  "context": {
    "platform_scores": { "chatgpt": 0.86, "gemini": 0.84 },
    "recommendations": ["Improve schema coverage..."]
  },
  "response_template": "Your AI visibility health check shows: ..."
}
```

**Chat Agent Integration**:
```javascript
// In your chat agent code
const visibilityContext = await fetch(
  `/api/agent/visibility?dealerId=${dealerId}`
).then(r => r.json());

const systemPrompt = `
You are a DealershipAI assistant. Current context:
${visibilityContext.AIV_summary}

When users ask about their AI visibility, use this context.
`;
```

## Integration Examples

### Dashboard Integration

```tsx
// In your dashboard component
import AIVModal from '@/components/AIVModal';

export default function Dashboard() {
  const [showAIV, setShowAIV] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setShowAIV(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        View AIV Score
      </button>
      
      <AIVModal
        isOpen={showAIV}
        onClose={() => setShowAIV(false)}
        dealerId="current"
      />
    </div>
  );
}
```

### Chat Agent Integration

```typescript
// In your chat agent handler
async function handleChatMessage(message: string, dealerId: string) {
  // Fetch AIV context
  const visibilityResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/agent/visibility?dealerId=${dealerId}`
  );
  const visibilityContext = await visibilityResponse.json();
  
  // Inject into LLM prompt
  const prompt = `
System: You are a DealershipAI assistant. Current dealer context:
${visibilityContext.AIV_summary}

User: ${message}

Provide a helpful response using the visibility context above.
  `;
  
  // Send to LLM...
}
```

### Standalone Hook Usage

```tsx
import { useAIVCalculator, AIVInputs } from '@/hooks/useAIVCalculator';

function CustomComponent() {
  const [inputs, setInputs] = useState<AIVInputs | null>(null);
  
  useEffect(() => {
    // Fetch data
    fetch('/api/ai-scores?dealerId=current')
      .then(r => r.json())
      .then(setInputs);
  }, []);
  
  const results = useAIVCalculator(inputs);
  
  return (
    <div>
      <h2>AIV Score: {(results.AIV_score * 100).toFixed(1)}%</h2>
      <p>{results.modal_summary}</p>
      <p>Revenue at Risk: ${results.Revenue_at_Risk_USD.toLocaleString()}/mo</p>
    </div>
  );
}
```

## Calculation Formula

### AIV Core
```
AIV_core = 
  0.25 * avgPlatform +
  0.3 * google_aio_inclusion_rate +
  0.25 * (ugc_health_score / 100) +
  0.1 * schema_coverage_ratio +
  0.05 * entity_confidence
```

### AIV Selection
```
AIV_sel = 
  0.35 * semantic_clarity_score +
  0.35 * silo_integrity_score +
  0.3 * schema_coverage_ratio
```

### AIV Modifiers
```
AIV_mods = 
  temporal_weight *
  entity_confidence *
  crawl_budget_mult *
  inventory_truth_mult
```

### Final AIV
```
AIV = AIV_core * AIV_mods * (1 + 0.25 * min(1, AIV_sel))
AIV = min(AIV, 1) // Clamp to 1.0
```

### AIVR (ROI-Adjusted)
```
AIVR = AIV * (1 + ctr_delta + conversion_delta)
```

### Revenue at Risk
```
Revenue_at_Risk = (1 - AIV) * monthly_opportunities * avg_gross_per_unit
```

## Data Flow

1. **Input Sources**:
   - `/api/ai-scores` endpoint
   - Direct prop passing
   - Fallback demo data

2. **Computation**:
   - Hook calculates in real-time
   - Updates on input changes
   - Deterministic results

3. **Output**:
   - Modal display (dashboard)
   - Chat context (API)
   - Summary strings for both

## Error Handling

All components include fallback handling:
- **Missing data**: Uses demo/fallback inputs
- **API errors**: Gracefully falls back to defaults
- **Invalid inputs**: Defaults to safe values
- **Network issues**: Shows cached or demo data

## Performance Considerations

- **Hook**: Memoized with `useEffect` dependency on JSON.stringify(inputs)
- **Modal**: Lazy loads data only when opened
- **API**: Edge runtime for fast response times
- **Caching**: API responses cached for 60 seconds

## Testing

### Manual Testing
```bash
# Test API endpoint
curl "http://localhost:3000/api/agent/visibility?dealerId=test"

# Test with custom inputs
curl -X POST http://localhost:3000/api/agent/visibility \
  -H "Content-Type: application/json" \
  -d '{"dealerId":"test","platform_scores":{"chatgpt":0.86}}'
```

### Component Testing
```tsx
// Test modal
<AIVModal
  isOpen={true}
  onClose={() => {}}
  dealerData={{
    platform_scores: { chatgpt: 0.86, gemini: 0.84 },
    google_aio_inclusion_rate: 0.62,
    // ... other inputs
  }}
/>
```

## Next Steps

1. **Connect to real data source**: Update `/api/ai-scores` to return actual dealer metrics
2. **Add to dashboard**: Import `AIVModal` in your main dashboard component
3. **Integrate chat agent**: Use `/api/agent/visibility` in your chat handler
4. **Add analytics**: Track AIV score views and interactions
5. **A/B test**: Test different summary formats and recommendations

## Support

For issues or questions:
- Check calculation formulas match your requirements
- Verify data source format matches `AIVInputs` interface
- Ensure API endpoints return expected data structure
- Review error logs for fallback behavior

