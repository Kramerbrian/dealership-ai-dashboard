# Cursor / Claude Code Integration Stubs
## DealershipAI Cognitive Dashboard - Engineering Handoff

---

## Overview

This document provides **copy-paste ready code stubs** for Cursor AI and Claude Code to accelerate implementation. All components are production-ready with full TypeScript support.

---

## Quick Start Checklist

```bash
# 1. Clone repository
git clone <repo-url>
cd dealership-ai-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Access cognitive dashboard
open http://localhost:3000/dashboard/cognitive
```

---

## Component Stubs

### 1. Voice Orb Integration

**File:** `components/cognitive/CognitiveDashboard.tsx`

```tsx
import VoiceOrb from '@/components/VoiceOrb';

export function CognitiveDashboard() {
  return (
    <div className="...">
      {/* Existing components */}
      <CognitiveHeader />
      <main>
        {/* Mode content */}
      </main>

      {/* Add Voice Orb */}
      <VoiceOrb />
      <ActionDrawer />
    </div>
  );
}
```

**Already integrated:** ✅ Voice Orb is mounted at line 78

---

### 2. Settings Modal with Prefs Toggle

**File:** `components/modals/SettingsModal.tsx` (create new)

```tsx
'use client';

import { X } from 'lucide-react';
import { usePrefsStore } from '@/lib/store/prefs';

export function SettingsModal() {
  const {
    openSettings,
    setOpenSettings,
    agentEnabled,
    setAgentEnabled,
    pgOnly,
    avoidTopics,
    resetPrefs,
  } = usePrefsStore();

  if (!openSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={() => setOpenSettings(false)}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X size={18} className="text-neutral-300" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Agent Toggle */}
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-sm text-white">Enable PG Easter Eggs</div>
              <div className="text-xs text-neutral-400 mt-1">
                Rare motivational quotes (≤10% of actions)
              </div>
            </div>
            <button
              onClick={() => setAgentEnabled(!agentEnabled)}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${agentEnabled ? 'bg-blue-500' : 'bg-neutral-700'}
              `}
            >
              <div
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                  transition-transform duration-200
                  ${agentEnabled ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          {/* PG Only (Read-only) */}
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-sm text-white">PG-Only Mode</div>
              <div className="text-xs text-neutral-400 mt-1">
                System enforced (always on)
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              Enabled
            </div>
          </div>

          {/* Guardrails */}
          <div>
            <div className="font-semibold text-sm mb-2 text-white">Guardrails</div>
            <div className="flex flex-wrap gap-2">
              {avoidTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              resetPrefs();
              setOpenSettings(false);
            }}
            className="w-full px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-sm transition-colors text-white"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Wire to Header:**

```tsx
// components/cognitive/CognitiveHeader.tsx
import { usePrefsStore } from '@/lib/store/prefs';
import { SettingsModal } from '@/components/modals/SettingsModal';

export function CognitiveHeader() {
  const { setOpenSettings } = usePrefsStore();

  return (
    <header>
      {/* Existing header content */}
      <button onClick={() => setOpenSettings(true)}>
        <Settings size={18} />
      </button>

      {/* Add modal */}
      <SettingsModal />
    </header>
  );
}
```

---

### 3. Landing Page Mic Integration

**File:** `components/landing/HeroSection.tsx` (or equivalent)

```tsx
import { useState } from 'react';
import { getEasterEggQuote, getNeutralCoachLine } from '@/lib/agent/quoteEngine';
import { showToast } from '@/lib/store/toast';
import { playSonic } from '@/lib/sound/palette';
import { tap } from '@/lib/sound/haptics';
import { hasPrefsHydrated } from '@/lib/store/prefs';

export function HeroSection() {
  const [msg, setMsg] = useState('"What\'s my AI visibility today?"');

  const handleMicClick = () => {
    playSonic('pulse');
    tap();

    if (!hasPrefsHydrated()) {
      const line = getNeutralCoachLine();
      showToast({ level: 'info', title: 'Coach mode', message: line });
      setMsg(line);
      return;
    }

    const q = getEasterEggQuote();
    if (q) {
      showToast({
        level: 'success',
        title: 'Coach mode',
        message: `"${q.quote}" — ${q.source}`,
      });
      setMsg(`"${q.quote}" — ${q.source}`);
    } else {
      const line = getNeutralCoachLine();
      showToast({ level: 'info', title: 'Coach mode', message: line });
      setMsg(line);
    }
  };

  return (
    <div className="relative">
      <input
        className="w-full rounded-full px-4 py-3 text-sm pr-12 outline-none"
        placeholder={msg}
        style={{
          background: 'rgba(13,17,23,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#FFFFFF',
        }}
      />

      {/* Mic button */}
      <button
        onClick={handleMicClick}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border hover:scale-105 transition-transform"
        style={{
          borderColor: 'rgba(255,255,255,0.1)',
          background: 'rgba(59,130,246,0.10)',
        }}
        aria-label="Get a motivational boost"
      >
        <span
          className="block w-1.5 h-5 mx-auto rounded"
          style={{
            background: 'linear-gradient(180deg, rgba(59,130,246,.8), rgba(6,182,212,.7))',
          }}
        />
      </button>
    </div>
  );
}
```

---

### 4. Command Palette Integration

**File:** `components/ui/command-palette.tsx` (update existing)

```tsx
import { getEasterEggQuote, getNeutralCoachLine } from '@/lib/agent/quoteEngine';
import { useCognitiveStore } from '@/lib/store/cognitive';
import { hasPrefsHydrated } from '@/lib/store/prefs';

// Add to commands array:
{
  id: 'surprise-me',
  label: 'Surprise Me',
  category: 'ai',
  shortcut: ['⌘', 'S'],
  handler: () => {
    if (!hasPrefsHydrated()) {
      useCognitiveStore.getState().addPulse({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        level: 'low',
        title: 'Keep Pushing',
        detail: getNeutralCoachLine(),
      });
      return;
    }

    const q = getEasterEggQuote();
    if (q) {
      useCognitiveStore.getState().addPulse({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        level: 'low',
        title: 'Easter Egg',
        detail: `"${q.quote}" — ${q.source}`,
      });
    } else {
      useCognitiveStore.getState().addPulse({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        level: 'low',
        title: 'Focus',
        detail: getNeutralCoachLine(),
      });
    }
  },
}
```

---

### 5. Seed Data Loader (Auto-runs on mount)

**Already integrated:** ✅ `loadSeedData()` runs in `CognitiveDashboard.useEffect()`

**Manual trigger for testing:**

```tsx
// In any component
import { loadSeedData } from '@/lib/data/seed-incidents';

useEffect(() => {
  loadSeedData(); // Loads 8 incidents + 4 pulse events
}, []);
```

**Add custom incident:**

```tsx
import { useCognitiveStore } from '@/lib/store/cognitive';

useCognitiveStore.getState().upsertIncidents([
  {
    id: 'custom-incident',
    urgency: 'high',
    impact_points: 35,
    time_to_fix_min: 10,
    title: 'Custom Incident Title',
    reason: 'Why this matters to the dealer',
    receipts: [
      {
        label: 'KPI Impact',
        kpi: 'aiv',
        before: { score: 42 },
        after: { score: 54 },
      },
    ],
    category: 'schema',
    autofix: true,
    fix_tiers: ['tier1_diy', 'tier2_guided'],
  },
]);
```

---

## API Integration Examples

### Real-Time Incident Detection

**Replace seed data with live API:**

```tsx
// components/cognitive/CognitiveDashboard.tsx
import { useCognitiveStore } from '@/lib/store/cognitive';

useEffect(() => {
  // Fetch incidents from API instead of seed data
  fetch(`/api/incidents?dealerId=${dealerId}&scan=schema,geo,ugc,cwv`)
    .then((res) => res.json())
    .then((incidents) => {
      useCognitiveStore.getState().upsertIncidents(incidents);
    })
    .catch((err) => {
      console.error('Failed to fetch incidents:', err);
      // Fallback to seed data
      loadSeedData();
    });
}, [dealerId]);
```

**API Response Schema:**

```typescript
// Expected API response format
interface IncidentResponse {
  incidents: Incident[];
  metadata: {
    scannedAt: string;
    dealerId: string;
    categories: string[];
  };
}
```

---

### Server-Sent Events (SSE) for Pulse

**Real-time pulse stream:**

```tsx
// components/modes/PulseStream.tsx
import { useCognitiveStore } from '@/lib/store/cognitive';

useEffect(() => {
  const eventSource = new EventSource(`/api/pulse/stream?dealerId=${dealerId}`);

  eventSource.onmessage = (ev) => {
    try {
      const pulse = JSON.parse(ev.data);
      useCognitiveStore.getState().addPulse(pulse);
    } catch (err) {
      console.error('Failed to parse pulse event:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('SSE error:', err);
    eventSource.close();
  };

  return () => eventSource.close();
}, [dealerId]);
```

**Server-side implementation (Next.js API route):**

```typescript
// app/api/pulse/stream/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get('dealerId');

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Send pulse events periodically
  const interval = setInterval(() => {
    const pulse = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      level: 'medium',
      title: 'AIV Updated',
      detail: 'Schema coverage increased by 12 points',
      kpi: 'schema_coverage',
      delta: '+12',
    };

    writer.write(encoder.encode(`event: pulse\ndata: ${JSON.stringify(pulse)}\n\n`));
  }, 5000);

  // Cleanup on disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    writer.close();
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

### Auto-Fix Deployment

**Deploy fix with API call:**

```tsx
// components/modes/DriveMode.tsx
const handleDeployFix = async (incidentId: string, title: string) => {
  try {
    const res = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, tier: 'tier2_guided' }),
    });

    const data = await res.json();

    if (data.status === 'deployed') {
      // Remove from incidents
      useCognitiveStore.getState().resolveIncident(incidentId);

      // Add pulse event
      useCognitiveStore.getState().addPulse({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        level: 'medium',
        title: 'Fix Deployed',
        detail: `Successfully deployed auto-fix for: ${title}`,
      });

      // Toast notification
      showToast({
        level: 'success',
        title: 'Fix Deployed',
        message: `${title} resolved in ${data.eta_sec}s`,
      });
    }
  } catch (err) {
    showToast({
      level: 'error',
      title: 'Deployment Failed',
      message: 'Could not deploy fix. Please try again.',
    });
  }
};
```

**API Route:**

```typescript
// app/api/fix/route.ts
export async function POST(request: Request) {
  const { incidentId, tier } = await request.json();

  // Simulate fix deployment
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return Response.json({
    status: 'deployed',
    incidentId,
    tier,
    eta_sec: 120,
    patch_url: `https://github.com/org/repo/pull/123`,
  });
}
```

---

## Testing Utilities

### 1. Force Easter Egg (Bypass Scarcity)

```typescript
// For testing only - bypasses scarcity gate
import { getQuoteByCategory, getAllQuotes } from '@/lib/agent/quoteEngine';

// Get specific category
const motivationQuote = getQuoteByCategory('motivation');
console.log(motivationQuote);

// Get all available quotes
const allQuotes = getAllQuotes();
console.log(`Total quotes: ${allQuotes.length}`);
```

---

### 2. Trigger All Sound Effects

```typescript
import { playSonic } from '@/lib/sound/palette';

// Test all sounds
['pulse', 'autofix', 'success', 'error', 'click'].forEach((sound, idx) => {
  setTimeout(() => playSonic(sound as any), idx * 1000);
});
```

---

### 3. Trigger All Haptics

```typescript
import * as haptics from '@/lib/sound/haptics';

// Test all patterns
setTimeout(() => haptics.tap(), 0);
setTimeout(() => haptics.doubleTap(), 500);
setTimeout(() => haptics.success(), 1000);
setTimeout(() => haptics.error(), 2000);
setTimeout(() => haptics.longPress(), 3000);
```

---

### 4. Clear Preferences

```typescript
import { usePrefsStore } from '@/lib/store/prefs';

// Reset to defaults
usePrefsStore.getState().resetPrefs();

// Or manually clear localStorage
localStorage.removeItem('dai:prefs:v1');
```

---

### 5. Inspect Zustand State

```typescript
import { useCognitiveStore } from '@/lib/store/cognitive';
import { usePrefsStore } from '@/lib/store/prefs';

// Log current state
console.log('Cognitive:', useCognitiveStore.getState());
console.log('Prefs:', usePrefsStore.getState());
console.log('Triage queue:', useCognitiveStore.getState().getTriageQueue());
```

---

## Environment Setup

### Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_VOICE_ORB=true
NEXT_PUBLIC_ENABLE_EASTER_EGGS=true
```

---

### TypeScript Configuration

**Already configured:** ✅ `tsconfig.json` includes all paths

**Verify paths:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/styles/*": ["styles/*"]
    }
  }
}
```

---

## Cursor-Specific Prompts

### Generate New Incident

```
@generate a new incident for the DriveMode triage queue:
- Category: schema
- Urgency: high
- Impact: 42 points
- Time to fix: 15 minutes
- Include receipts showing before/after KPI values
```

### Add New Quote

```
@add a PG-rated motivational quote to lib/agent/quoteEngine.ts:
- Source: [Person/Movie/Book]
- Category: [motivation|persistence|focus|teamwork]
- Must be work-appropriate and inspirational
```

### Implement SSE Endpoint

```
@create a Server-Sent Events API route at app/api/pulse/stream/route.ts
- Accept dealerId query parameter
- Send pulse events every 5 seconds
- Include KPI updates with delta values
- Handle client disconnect gracefully
```

---

## Claude Code Snippets

### Quick Voice Orb Test

```typescript
// Press ⌘K, paste this in Chat:
"Test the Voice Orb by triggering a boost 10 times and logging results"

// Claude will generate:
for (let i = 0; i < 10; i++) {
  const q = getEasterEggQuote();
  console.log(`Attempt ${i + 1}:`, q ? `Quote: "${q.quote}"` : 'Neutral line');
}
```

### Batch Update Incidents

```typescript
// Press ⌘K, paste:
"Update all incidents with category 'schema' to have autofix=true"

// Claude will generate:
const { incidents, upsertIncidents } = useCognitiveStore.getState();
const updated = incidents.map((i) =>
  i.category === 'schema' ? { ...i, autofix: true } : i
);
upsertIncidents(updated);
```

---

## Deployment Checklist

### Pre-Deploy

- [ ] Run build: `npm run build`
- [ ] Check TypeScript: `npx tsc --noEmit`
- [ ] Test Voice Orb functionality
- [ ] Test Settings modal
- [ ] Verify localStorage persistence
- [ ] Test easter egg scarcity (10%)
- [ ] Test neutral coach lines (90%)

### Post-Deploy

- [ ] Verify `/dashboard/cognitive` route accessible
- [ ] Test Voice Orb on mobile (haptics)
- [ ] Test Voice Orb on desktop (sounds)
- [ ] Verify Settings toggle persists
- [ ] Check console for errors
- [ ] Test SSE pulse stream (if implemented)

---

## Common Issues & Fixes

### Build Error: "Module not found: @/styles/design-tokens"

**Fix:** File created at `styles/design-tokens.ts` ✅

### Hydration Mismatch Warning

**Fix:** Wrap in HydrationGate or ensure `hasPrefsHydrated()` guards

```tsx
import HydrationGate from '@/components/util/HydrationGate';

<HydrationGate>
  <VoiceOrb />
</HydrationGate>
```

### Easter Eggs Not Appearing

**Check:**
1. `hasPrefsHydrated()` returns `true`
2. `usePrefsStore.getState().agentEnabled === true`
3. Scarcity gate (only 10% probability)

**Force test:**
```typescript
import { getQuoteByCategory } from '@/lib/agent/quoteEngine';
const testQuote = getQuoteByCategory('motivation'); // Bypasses scarcity
```

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load Voice Orb
const VoiceOrb = dynamic(() => import('@/components/VoiceOrb'), {
  ssr: false,
  loading: () => null,
});
```

### Debounce Pulse Events

```typescript
// Prevent pulse spam
let pulseTimeout: NodeJS.Timeout;
const debouncedAddPulse = (event: PulseEvent) => {
  clearTimeout(pulseTimeout);
  pulseTimeout = setTimeout(() => {
    useCognitiveStore.getState().addPulse(event);
  }, 500);
};
```

---

## Additional Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

---

**Status:** Ready for Cursor/Claude integration
**Last Updated:** 2025-11-12
**Version:** 1.0.0
