# Theme System Architecture

## Overview

DealershipAI Trust OS uses a **dual-theme system** to provide dynamic, context-aware UI theming:

1. **Mood-Based Themes** ([lib/theme-controller.ts](../lib/theme-controller.ts)) - Driven by Copilot context (5 moods, 8 tones)
2. **TSM-Based Themes** ([lib/dynamic-theme.ts](../lib/dynamic-theme.ts)) - Driven by Trust Score Multiplier (3 modes)

Both systems are **unified through shared CSS variables** in [app/styles/theme.css](../app/styles/theme.css).

---

## 1. Mood-Based Theme System

**Purpose**: Reflect AI Copilot personality and dealer performance context

### CSS Variables
```css
--accent-rgb: [r g b]           /* Primary accent color (RGB space-separated) */
--accent-glow: rgba(...)        /* Glow/shadow effect */
--vignette-brightness: [0-1]    /* Background brightness */
--heading-weight: [100-900]     /* Font weight for headings */
```

### 5 Moods
| Mood | Color | Brightness | Use Case |
|------|-------|------------|----------|
| **Positive** | Green (`34 197 94`) | 0.9 | Good progress, momentum |
| **Neutral** | Blue (`59 130 246`) | 0.75 | Baseline, no significant change |
| **Reflective** | Purple (`139 92 246`) | 0.6 | Underperforming, strategic review |
| **Urgent** | Red (`239 68 68`) | 0.5 | Critical decline, immediate action |
| **Celebratory** | Gold (`251 191 36`) | 1.0 | Major breakthrough, celebrate |

### 8 Tones
| Tone | Weight | Use Case |
|------|--------|----------|
| **Professional** | 450 | Standard, formal communication |
| **Witty** | 500 | Playful, engaging (high feedback score) |
| **Cinematic** | 400 | Dramatic, evening hours |
| **Direct** | 550 | No-nonsense, urgent situations |
| **Enthusiastic** | 600 | Energetic, celebratory |
| **Southern** | 500 | Warm, hospitable (regional variant) |
| **Midwest** | 500 | Down-to-earth, practical (regional) |
| **Coastal** | 500 | Fast-paced, trendy (regional) |

### Usage
```typescript
import { applyThemeSignal } from '@/lib/theme-controller';

applyThemeSignal({
  mood: 'urgent',
  tone: 'direct'
});
```

React Hook:
```typescript
import { useThemeSignal } from '@/hooks/useThemeSignal';

useThemeSignal('positive', 'witty');
```

---

## 2. TSM-Based Theme System

**Purpose**: Respond to system-wide trust score alerts and critical issues

### CSS Variables
```css
--theme-primary: #hex          /* Primary UI color */
--theme-secondary: #hex        /* Secondary UI color */
--theme-background: #hex       /* Background color */
--theme-surface: rgba(...)     /* Surface/card background */
--theme-text: #hex             /* Text color */
--theme-accent: #hex           /* Accent/success color */
--theme-warning: #hex          /* Warning color */
--theme-error: #hex            /* Error color */
```

### 3 Modes
| Mode | Primary | Trigger | Use Case |
|------|---------|---------|----------|
| **Normal** | Blue (`#3b82f6`) | TSM ≤ 1.2 | Baseline operational state |
| **Defensive** | Orange (`#f59e0b`) | TSM > 1.2 OR anomaly detected | Elevated caution, monitoring |
| **Critical** | Red (`#ef4444`) | TSM > 1.5 OR 3+ critical alerts | Emergency state, immediate action |

### Usage
```typescript
import { dynamicTheme } from '@/lib/dynamic-theme';

// Update based on TSM
dynamicTheme.updateTheme(1.3, {
  anomalyDetected: true,
  criticalAlerts: 2,
  systemHealth: 0.85
});

// React hook
const { theme, updateTheme } = useDynamicTheme();
```

---

## 3. Theme Unification

Both systems write to shared CSS variables, allowing seamless coexistence:

### Mood Theme → CSS Variables
```typescript
// lib/theme-controller.ts
root.style.setProperty("--accent-rgb", "239 68 68");
root.style.setProperty("--accent-glow", "rgba(239,68,68,0.25)");
root.style.setProperty("--vignette-brightness", "0.5");
root.style.setProperty("--heading-weight", "550");
```

### TSM Theme → CSS Variables (with cross-sync)
```typescript
// lib/dynamic-theme.ts
root.style.setProperty('--theme-primary', '#ef4444');
root.style.setProperty('--theme-secondary', '#dc2626');

// Also update mood variables for consistency
const primaryRgb = hexToRgb('#ef4444'); // "239 68 68"
root.style.setProperty('--accent-rgb', primaryRgb);
root.style.setProperty('--accent-glow', `rgba(${primaryRgb}, 0.15)`);
```

### Priority Order
1. **Explicit TSM theme updates** take precedence (critical alerts)
2. **Mood-based themes** run continuously based on Copilot context
3. **CSS defaults** in `theme.css` provide fallback

---

## 4. Component Usage

### Using Mood Variables (Copilot-driven)
```tsx
<div className="theme-bg">
  {/* Uses --accent-rgb for radial gradient */}
</div>

<button className="glow-shadow">
  {/* Uses --accent-glow for box shadow */}
</button>

<h1>
  {/* Uses --heading-weight for font weight */}
</h1>
```

### Using TSM Variables (Alert-driven)
```tsx
<div style={{
  backgroundColor: 'var(--theme-background)',
  color: 'var(--theme-text)'
}}>
  <div style={{ backgroundColor: 'var(--theme-surface)' }}>
    {/* Surface card */}
  </div>
</div>
```

### Tailwind with CSS Variables
```tsx
<div className="bg-[var(--theme-primary)] text-[var(--theme-text)]">
  {/* Direct Tailwind usage */}
</div>
```

---

## 5. A/B Testing Integration

Experiments can test theme variations using [lib/experiments](../lib/experiments):

```typescript
import { createExperiment } from '@/lib/experiments';

const experiment = createExperiment(
  'Urgent Mood Color Test',
  'Test red vs blue for urgent mood',
  'theme',
  [
    {
      name: 'Control (Blue)',
      is_control: true,
      allocation: 50,
      config: { accent: '59 130 246', brightness: '0.75' }
    },
    {
      name: 'Variant (Red)',
      is_control: false,
      allocation: 50,
      config: { accent: '239 68 68', brightness: '0.5' }
    }
  ]
);
```

See [INTEGRATION_MANIFEST.md](./INTEGRATION_MANIFEST.md) Week 2 for experiment framework details.

---

## 6. Best Practices

### ✅ DO
- Use CSS variables for all colors/weights
- Let mood themes update continuously
- Let TSM themes override during alerts
- Test theme changes with A/B experiments
- Ensure SSR safety (`typeof document !== 'undefined'`)

### ❌ DON'T
- Hardcode colors in components
- Mix hex and RGB formats inconsistently
- Update themes without checking document availability
- Skip A/B testing for major theme changes
- Use inline styles for static colors

---

## 7. Future Enhancements

- [ ] Studio Mode for visual theme editing (Phase 6)
- [ ] Theme export/import for dealer branding
- [ ] Time-of-day theme transitions (dawn/dusk)
- [ ] Accessibility contrast checker
- [ ] Dark/light mode toggle (currently dark only)

---

## Related Files

- [lib/theme-controller.ts](../lib/theme-controller.ts) - Mood-based theme engine
- [lib/dynamic-theme.ts](../lib/dynamic-theme.ts) - TSM-based theme engine
- [app/styles/theme.css](../app/styles/theme.css) - CSS variable definitions
- [hooks/useThemeSignal.ts](../hooks/useThemeSignal.ts) - React hook for mood themes
- [lib/copilot-context.ts](../lib/copilot-context.ts) - Mood/tone derivation logic
- [lib/experiments](../lib/experiments/) - A/B testing framework
