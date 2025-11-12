# AIV Strip Usage Examples

## Quick Start

```tsx
import AIVStrip from "@/components/visibility/AIVStrip"

// Basic usage
<AIVStrip domain={domain} />

// With custom thresholds
<AIVStrip 
  domain={domain}
  thresholds={{
    ChatGPT: { warn: 85, critical: 75 }
  }}
/>
```

## Integration Patterns

### 1. Dashboard Header

```tsx
import AIVStrip from "@/components/visibility/AIVStrip"

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

### 2. Landing Page Results

```tsx
import dynamic from "next/dynamic"

const AIVStrip = dynamic(() => import("@/components/visibility/AIVStrip"), { 
  ssr: false 
})

// In your results section (when status === 'done')
<div className="mt-4 p-6 bg-white rounded-lg">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">AI Visibility Results</h3>
    <AIVStrip domain={domain} className="justify-end" />
  </div>
  {/* Rest of results */}
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

### 4. Compact Inline Version

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-full">
  <AIVStrip domain={domain} className="text-xs" />
</div>
```

### 5. In Card Component

```tsx
<div className="p-6 bg-white rounded-lg border border-gray-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Engine Presence</h3>
  </div>
  <AIVStrip domain={domain} />
</div>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `domain` | `string` | No | `undefined` | Domain to check visibility for |
| `className` | `string` | No | `""` | Additional CSS classes |
| `thresholds` | `Partial<Thresholds>` | No | `DEFAULT_THRESHOLDS` | Custom warn/critical thresholds per engine |

## Thresholds Type

```typescript
type Thresholds = {
  ChatGPT: { warn: number; critical: number }
  Perplexity: { warn: number; critical: number }
  Gemini: { warn: number; critical: number }
  Copilot: { warn: number; critical: number }
}
```

## Default Thresholds

```typescript
{
  ChatGPT: { warn: 80, critical: 70 },
  Perplexity: { warn: 75, critical: 65 },
  Gemini: { warn: 75, critical: 70 },
  Copilot: { warn: 72, critical: 65 }
}
```

## Color Coding

- **Green**: Presence >= warn threshold (good)
- **Amber**: Presence < warn but >= critical (warning)
- **Red**: Presence < critical (critical)

## Features

- ✅ Automatic color coding based on thresholds
- ✅ AIV composite score (weighted average)
- ✅ Time ago display ("5m ago")
- ✅ Loading skeleton UI
- ✅ Respects tenant engine preferences (via API)
- ✅ Custom threshold overrides

## API Response Format

The component expects this format from `/api/visibility/presence`:

```json
{
  "domain": "example.com",
  "engines": [
    { "name": "ChatGPT", "presencePct": 85 },
    { "name": "Perplexity", "presencePct": 78 },
    { "name": "Gemini", "presencePct": 72 },
    { "name": "Copilot", "presencePct": 68 }
  ],
  "lastCheckedISO": "2024-01-15T10:30:00.000Z",
  "connected": true
}
```

## Testing

```bash
# Test the API
curl "http://localhost:3000/api/visibility/presence?domain=example.com"
```

## Next Steps

1. Add to your dashboard header
2. Add to landing page results
3. Connect to real visibility service (replace stub in API route)
4. Load tenant preferences from database
5. Add "Explain" link to open Visibility Drawer

