# DealershipAI North Star

**Core Philosophy:**
> **Stop designing pages. Design conversations.**
> 
> **Stop showing data. Show decisions.**
> 
> **Stop optimizing screens. Optimize cognition.**

---

## Vision Statement

DealershipAI is a **Cognitive Ops Platform** — each rooftop operates with an embedded **AI Chief Strategy Officer** that continuously audits, predicts, fixes, and explains its own decisions.

This is not a dashboard. This is a **living cognitive environment** — a self-orchestrating operating system for dealership visibility and trust.

---

## Design Principles

### 1. **Liquid-Glass Aesthetic**

- **Glassmorphism** with backdrop blur (`backdrop-blur-xl`)
- **Transparency layers** (`bg-white/5` or `bg-slate-800/80`)
- **Subtle borders** (`border-white/10`)
- **Depth through elevation** (shadow-sm → shadow-xl)
- **Light refraction effects** (gradient overlays, subtle glows)

**Implementation:**
```css
.glass-dark {
  @apply dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10;
}
```

---

### 2. **Morph + Orbit Motion**

- **Morph:** Smooth shape transitions (rectangles → circles, expand → contract)
- **Orbit:** Elements orbit central hubs (Trust Score, AI CSO Core)
- **Spring physics** (Framer Motion: `spring({ stiffness: 300, damping: 30 })`)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for natural motion
- **Duration:** 300ms base, 150ms for micro-interactions

**Visual Hierarchy:**
- Central core = Trust Score / AI CSO
- Orbital layers = Pillars (SEO, AEO, GEO, QAI)
- Peripheral = Actions, Insights, Predictions

---

### 3. **Audio Palette**

| Sound | Trigger | Purpose |
|-------|---------|---------|
| **boot** | System initialization | Welcome, system ready |
| **success** | Action completed | Positive feedback |
| **warn** | Anomaly detected | Attention required |
| **autonomy** | Auto-fix deployed | AI action taken |
| **hover** | UI element hover | Tactile feedback (optional) |

**Implementation Notes:**
- Keep audio subtle and optional (volume slider)
- Respect `prefers-reduced-motion` for accessibility
- Use Web Audio API for dynamic pitch/volume based on score magnitude

---

### 4. **Mobile Timeline**

- **Horizontal swipe** = time travel (past → present → future)
- **Vertical scroll** = depth (surface → signals → raw data)
- **Pinch to zoom** = scale (dealer → region → industry)
- **Pull to refresh** = force re-orchestration

**Gestures:**
- Swipe right = next metric
- Swipe left = previous metric
- Long press = context menu
- Double tap = expand detail

---

### 5. **WOW Onboarding**

**"Plug & Think" — 5-minute cognitive integration:**

1. **Domain Entry** (30s)
   - Single input: dealership domain
   - Auto-discovery: name, location, brands, competitors

2. **Orchestration Run** (2min)
   - AI CSO performs initial scan
   - Shows live progress: "Scanning... → Diagnosing... → Prescribing..."

3. **First ASR** (30s)
   - Display top 3 recommendations
   - "Click to deploy" for Enterprise

4. **Trust Score Reveal** (1min)
   - Animated reveal of Trust Score
   - Contextual explanation of what drives it

5. **Command Center Tour** (1min)
   - Interactive walkthrough of HAL Chat
   - "Try asking: 'What's my AI visibility?'"

**Total Time:** 5 minutes to cognitive integration

---

## Technical Implementation

### Theme Tokens (`lib/design-tokens.ts`)

```typescript
export const DTRI_THEME = {
  light: { /* ... */ },
  dark: { /* ... */ },
  typography: { /* ... */ },
  spacing: { /* ... */ },
  borderRadius: { /* ... */ },
  transitions: { /* ... */ }
};
```

### Motion Tokens (`ui/northStar.ts`)

```typescript
export const northStarTokens = {
  motion: {
    fade: { duration: 300, ease: [0.4, 0, 0.2, 1] },
    morph: { duration: 500, spring: { stiffness: 300, damping: 30 } },
    orbit: { duration: 2000, ease: 'linear', repeat: Infinity }
  },
  audio: {
    boot: { src: '/audio/boot.mp3', volume: 0.3 },
    success: { src: '/audio/success.mp3', volume: 0.2 },
    warn: { src: '/audio/warn.mp3', volume: 0.4 },
    autonomy: { src: '/audio/autonomy.mp3', volume: 0.25 },
    hover: { src: '/audio/hover.mp3', volume: 0.1 }
  },
  layout: {
    cardRadii: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.07)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)'
    }
  }
};
```

### Reduced Motion Hook

```typescript
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
}
```

**Usage:**
```tsx
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

---

## Marketing Copy

### Hero Tagline

> **DealershipAI — The Cognitive Ops Platform for Automotive Leaders.**
> 
> Every dealer now has an embedded **AI Chief Strategy Officer.**

### Value Proposition

> You already have a GM, GSM, and F&I Manager.
> 
> Now you have your **AI Chief Strategy Officer** — always on, never guessing.

### Features

1. **Perceives:** System constantly scans AI platforms, reviews, and signals
2. **Predicts:** 30-60-90 day forecasts for trust, visibility, and revenue risk
3. **Prescribes:** Autonomous Strategy Recommendations with ROI calculations
4. **Executes:** Auto-Fix Engine deploys safe changes autonomously
5. **Explains:** Every decision comes with rationale, evidence, and confidence scores

---

## Architecture Lock

### Environment Variables

```env
PLATFORM_MODE=CognitiveOps
ORCHESTRATOR_ROLE=AI_CSO
AUTONOMY_INTERVAL_HOURS=6
```

### API Middleware

Every API request includes:
```ts
response.headers.set('X-Orchestrator-Role', 'AI_CSO');
```

### Data Model

```sql
CREATE TABLE orchestrator_state (
  dealer_id UUID REFERENCES dealers(id),
  last_scan TIMESTAMPTZ,
  confidence NUMERIC,
  autonomy_enabled BOOLEAN DEFAULT true,
  current_mode TEXT DEFAULT 'AI_CSO',
  PRIMARY KEY (dealer_id)
);
```

---

## Future Enhancements

### Phase 1: Explainability Mode
- Click any metric → see model inputs, data sources, confidence intervals
- Causal graphs showing why scores changed

### Phase 2: Holo-Layer Visuals
- WebGPU 3D data clusters
- Rotation reveals causal paths

### Phase 3: Neural Briefings
- Auto-generated 90-second video summaries
- Voice clone of dealer's tone

### Phase 4: Trust Kernel
- Cryptographic signing of all insights
- Auditable provenance for every recommendation

---

## Canon

This document is **immutable canon**. All features, designs, and implementations must align with these principles.

**RFC Requirement:** Every PR must include:
```
# aligns-with: CognitiveOpsPlatform
```

---

**Last Updated:** 2025-01-31  
**Version:** 1.0.0
