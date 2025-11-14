# Copilot Theme System - End-to-End Testing Guide

## Overview

The Copilot theme system dynamically adjusts UI colors, typography, and ambiance based on:
- **Mood**: Derived from KPI metrics (AIV, forecast changes)
- **Tone**: Influenced by mood, feedback score, time of day, and region
- **CSS Variables**: Updated in real-time to reflect mood/tone

## System Components

1. **`lib/copilot-context.ts`** - Mood derivation logic
2. **`lib/theme-controller.ts`** - CSS variable updates
3. **`hooks/useThemeSignal.ts`** - React hook wrapper
4. **`app/styles/theme.css`** - CSS variable definitions
5. **`components/DAICopilot.tsx`** - Main component using the system

## Testing Methods

### 1. Automated Test Script

Run the Node.js test script:

```bash
npx ts-node scripts/test-copilot-theme.ts
```

**What it tests:**
- ✅ Mood derivation for 5 scenarios (positive, urgent, celebratory, reflective, neutral)
- ✅ Tone selection based on mood and context
- ✅ CSS variable application (in browser environment)

**Expected output:**
```
🧪 Copilot Theme System - End-to-End Test
============================================================

📋 Testing: Positive Mood - High AIV
   Metrics: AIV=85, Forecast=12
   ✅ Mood: positive (expected: positive)
   ✅ Tone: witty
   ✅ CSS Variables: accent=34 197 94, brightness=0.9

📊 Test Results: 15 passed, 0 failed
   Success Rate: 100.0%
✅ All tests passed! Theme system is working correctly.
```

### 2. Interactive Test Page

Visit `/test/copilot-theme` in your browser for a visual, interactive test.

**Features:**
- 🎛️ Sliders to adjust AIV, forecast change, feedback score
- 🌍 Region selector (south, midwest, west, northeast)
- 📊 Real-time mood/tone display
- 🎨 Live CSS variable values
- 👁️ Visual theme preview
- 🤖 Live DAICopilot component

**How to use:**
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/test/copilot-theme`
3. Adjust sliders to see mood changes
4. Observe CSS variables updating in real-time
5. Check the visual preview for theme changes
6. Use quick test scenario buttons for preset combinations

### 3. Integration Test

Test the Copilot in the actual dashboard:

1. Navigate to `/dash` (or wherever `PulseOverview` is used)
2. The `DAICopilot` component should appear in the bottom-right
3. Observe theme changes as metrics update
4. Check browser DevTools → Elements → `:root` to see CSS variables

**Expected behavior:**
- Copilot appears after metrics load
- Theme updates when mood changes
- CSS variables reflect current mood:
  - `--accent-rgb`: Color based on mood
  - `--accent-glow`: Glow color matching accent
  - `--vignette-brightness`: Background brightness
  - `--heading-weight`: Typography weight

## Mood Scenarios

### Positive Mood
- **Trigger**: AIV > 80 OR forecast change > +5
- **Tone**: Witty (or regional variant if feedback > 0.6)
- **Color**: Green (`34 197 94`)
- **Brightness**: 0.9

### Urgent Mood
- **Trigger**: Forecast change < -15 OR AIV < 50
- **Tone**: Direct
- **Color**: Red (`239 68 68`)
- **Brightness**: 0.5

### Celebratory Mood
- **Trigger**: Forecast change > +20 AND AIV > 90
- **Tone**: Enthusiastic
- **Color**: Gold/Yellow (`251 191 36`)
- **Brightness**: 1.0

### Reflective Mood
- **Trigger**: Forecast change < -8 OR AIV < 65
- **Tone**: Cinematic (if after 6pm) or Professional
- **Color**: Purple (`139 92 246`)
- **Brightness**: 0.6

### Neutral Mood
- **Trigger**: Default (no other conditions met)
- **Tone**: Professional
- **Color**: Blue (`59 130 246`)
- **Brightness**: 0.75

## Regional Tone Variants

When mood is "positive" and feedback > 0.6, tone can vary by region:

- **South**: `southern` - Warm, hospitable
- **Midwest**: `midwest` - Down-to-earth, practical
- **West/Northeast**: `coastal` - Fast-paced, direct

## CSS Variables Reference

```css
:root {
  --accent-rgb: 59 130 246;        /* RGB values (space-separated) */
  --accent-glow: rgba(59,130,246,0.15); /* Glow color */
  --vignette-brightness: 0.75;      /* Background brightness (0-1) */
  --heading-weight: 450;          /* Font weight */
}
```

## Troubleshooting

### Theme not updating
1. Check browser console for errors
2. Verify `useThemeSignal` is called at component top level
3. Ensure `app/styles/theme.css` is imported in layout
4. Check that `applyThemeSignal` is being called

### Mood not changing
1. Verify metrics are being fetched (`/api/ai-scores`)
2. Check `deriveCopilotMood` is receiving correct inputs
3. Review mood thresholds in `lib/copilot-context.ts`

### CSS variables not visible
1. Open DevTools → Elements → `:root`
2. Check if variables are set inline (they should be)
3. Verify CSS classes using variables (`.theme-bg`, `.glow-shadow`)

## Next Steps

After testing:
1. ✅ Verify all 5 mood scenarios work
2. ✅ Confirm CSS variables update correctly
3. ✅ Test regional tone variants
4. ✅ Check visual theme preview
5. ✅ Validate Copilot component in dashboard

## Related Files

- `components/DAICopilot.tsx` - Main component
- `components/dashboard/PulseOverview.tsx` - Integration point
- `lib/copilot-context.ts` - Mood logic
- `lib/theme-controller.ts` - Theme application
- `hooks/useThemeSignal.ts` - React hook
- `app/styles/theme.css` - CSS definitions

