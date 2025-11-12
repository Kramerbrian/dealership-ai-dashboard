# Figma Component Specifications
## DealershipAI Cognitive Dashboard - Design Handoff

---

## Overview

This document provides complete specifications for implementing the **Cupertino × ChatGPT fusion interface** in Figma. All measurements, colors, and motion specs included.

---

## Design System Tokens

### Colors

```figma
// Base Neural Palette
neural-950: #0A0A0A
neural-900: #121212
neural-800: #1E1E1E
neural-700: #2A2A2A
neural-600: #3A3A3A
neural-500: #4A4A4A
neural-400: #888888

// Clarity Gradient (Primary Accent)
clarity-blue: #3B82F6
clarity-cyan: #06B6D4

// Urgency Levels
critical: #EF4444
high: #F59E0B
medium: #06B6D4
low: #6B7280

// Status Colors
success: #10B981
warning: #F59E0B
error: #EF4444
info: #3B82F6
```

### Typography

```figma
// Font Family
Primary: SF Pro Display, -apple-system, Inter, sans-serif

// Weights
Light: 300
Regular: 400
Medium: 500
Semibold: 600
Bold: 700

// Sizes & Line Heights
h1: 28px / 36px (light)
h2: 20px / 28px (semibold)
h3: 18px / 24px (semibold)
body: 14px / 20px (regular)
small: 12px / 16px (regular)
tiny: 10px / 14px (medium)

// Tabular Numbers
For metrics: font-variant-numeric: tabular-nums
```

### Spacing Scale

```figma
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
```

### Radii

```figma
sm: 4px
md: 8px
lg: 12px
xl: 16px
2xl: 20px
full: 9999px
```

### Shadows

```figma
// Glass morphism soft shadow
soft: 0 4px 16px rgba(0, 0, 0, 0.2)

// Elevated card
elevated: 0 8px 24px rgba(0, 0, 0, 0.15)

// Voice Orb rings (by state)
idle: 0 0 28px rgba(59, 130, 246, 0.25)
listening: 0 0 40px rgba(6, 182, 212, 0.35)
speaking: 0 0 44px rgba(59, 130, 246, 0.45)
thinking: 0 0 36px rgba(59, 130, 246, 0.25)
```

---

## Component Specifications

### 1. CognitiveHeader (Mode Switcher)

**Layout:**
- Height: 64px (h-16)
- Padding: 24px horizontal (px-6)
- Border-bottom: 1px solid neural-800
- Background: neural-900/80 with backdrop-blur-xl

**Left Section: Clarity Score**
```
[Circular Badge] [Metadata]

Badge:
- Size: 48px × 48px (w-12 h-12)
- Border-radius: full (50%)
- Background: linear-gradient(135deg, clarity-blue, clarity-cyan)
- Font: 20px bold tabular-nums
- Color: white
- Content: "78"

Metadata (right of badge):
- Label: "Clarity Score" (10px uppercase tracking-wide neural-400)
- Value: "78" (14px semibold white)
- Delta: "↑4" (12px, success color if positive, error if negative)
```

**Center Section: Mode Pills**
```
Container:
- Background: neural-800/50
- Border-radius: full
- Padding: 4px
- Display: flex gap-8px

Pills (4 total):
- Width: auto (px-6)
- Height: 32px (py-2)
- Border-radius: full
- Font: 14px medium
- Default: text-neutral-400
- Active: text-white with animated gradient background

Active Pill Background:
- Background: linear-gradient(90deg, clarity-blue, clarity-cyan)
- Animation: layoutId="activeMode" (Framer Motion)
- Transition: spring (damping: 30, stiffness: 300)

Icons (16px):
- Drive: Power
- Autopilot: Zap
- Insights: BarChart3
- Pulse: Activity
```

**Right Section: Controls**
```
[Voice Toggle] [Settings]

Voice Toggle:
- Size: 40px × 40px (h-10 w-10)
- Border-radius: 12px (xl)
- Default: text-neutral-400 hover:bg-neural-800
- Active: bg-clarity-blue text-white shadow-lg shadow-clarity-blue/40
- Icon: Zap (18px)

Settings:
- Size: 40px × 40px
- Border-radius: 12px
- Color: text-neutral-400 hover:bg-neural-800 hover:text-white
- Icon: Settings (18px)
```

---

### 2. Incident Card (DriveMode)

**Layout:**
```
Container:
- Background: neural-900/50 with backdrop-blur-sm
- Border: 1px solid neural-800
- Border-radius: 20px (2xl)
- Padding: 24px (p-6)
- Hover: border-neural-700
- Entrance: fade-in + slide-up (delay: idx × 40ms)
```

**Header Row:**
```
[Icon Badge] [Title + Metadata] [Auto-Fix Badge?]

Icon Badge:
- Size: 36px × 36px
- Border-radius: 8px
- Background: linear-gradient(135deg, clarity-blue, clarity-cyan)
- Icon: AlertCircle (20px white)

Title:
- Font: 18px semibold
- Color: white

Urgency Badge (inline):
- Font: 10px medium uppercase
- Padding: 4px 8px
- Border-radius: full
- Border: 1px
- Colors:
  critical: bg-red-500/20 text-red-300 border-red-500/30
  high: bg-amber-500/20 text-amber-300 border-amber-500/30
  medium: bg-cyan-500/20 text-cyan-300 border-cyan-500/30
  low: bg-neutral-600/30 text-neutral-300 border-neutral-500/40
```

**Metadata Row:**
```
Reason (description):
- Font: 14px regular
- Color: neutral-300
- Margin-top: 4px

Stats Row:
- Font: 10px regular
- Color: neutral-500
- Margin-top: 8px
- Format: "Impact: {points} • Time: {minutes} min • Category: {name}"
- Highlight impact in emerald-400
```

**CTA Row (Tier Buttons):**
```
Grid: 3 columns, gap-12px, margin-top-20px

Tier 1 (DIY) Button:
- Padding: 8px 16px
- Border-radius: 8px
- Border: 1px solid neural-700
- Background: transparent
- Hover: bg-neural-800
- Color: neutral-200
- Icon: Info (16px)
- Label: "Show Me Why / How"

Tier 2 (Auto-Fix) Button:
- Padding: 8px 16px
- Border-radius: 8px
- Background: linear-gradient(90deg, clarity-blue, clarity-cyan)
- Hover: shadow-lg shadow-clarity-blue/40
- Color: white
- Icon: Wrench (16px)
- Label: "Deploy Fix"

Tier 3 (DFY) Button:
- Same as Tier 1 style
- Icon: Rocket (16px)
- Label: "Assign to dAI Team"
```

---

### 3. Voice Orb

**Position:**
- Fixed: right-24px bottom-80px (right-6 bottom-20)
- Z-index: 40

**Speech Bubble (Conditional):**
```
Container:
- Max-width: 320px
- Margin-bottom: 12px
- Border-radius: 20px (2xl)
- Border: 1px solid surface-border (rgba(255,255,255,0.1))
- Background: neural-900/60 with backdrop-blur
- Padding: 16px (p-4)
- Shadow: soft (0 4px 16px rgba(0,0,0,0.2))
- Animation: fade-in + slide-in-from-bottom (200ms)
- aria-live: polite

Text:
- Font: 14px regular
- Color: white
- Line-height: 20px
```

**Orb Button:**
```
Size: 56px × 56px (w-14 h-14)
Border-radius: full
Border: 1px solid surface-border
Background (outer): radial-gradient(
  60% 60% at 50% 50%,
  rgba(59,130,246,0.28),
  rgba(6,182,212,0.14) 40%,
  transparent 70%
)
Box-shadow: varies by state (see Shadows above)
Transition: box-shadow 220ms cubic-bezier(0.25,0.1,0.25,1)

Inner Pulse (absolute inset-8px):
- Border-radius: full
- Background (enabled):
  radial-gradient(
    60% 60% at 50% 50%,
    rgba(6,182,212,0.35),
    rgba(59,130,246,0.18) 40%,
    transparent 70%
  )
- Background (disabled):
  radial-gradient(
    60% 60% at 50% 50%,
    rgba(59,130,246,0.20),
    rgba(6,182,212,0.10) 40%,
    transparent 70%
  )
- Filter: blur(0.2px)

Hover: scale(1.05)
```

**Quick Intents Row:**
```
Position: margin-top-8px
Display: flex gap-24px justify-center
Font: 10px regular
Color: text-secondary (rgba(255,255,255,0.6))
Hover: opacity-100
```

---

### 4. ActionDrawer (Side Panel)

**Layout:**
```
Position: fixed right-0 top-0
Size: height-100vh width-100vw max-width-xl (576px)
Background: neural-900
Border-left: 1px solid neural-800
Padding: 24px (p-6)
Transform: translateX(100%) when closed, translateX(0) when open
Transition: 300ms ease-out
Z-index: 40
```

**Overlay:**
```
Position: absolute inset-0
Background: black/40 with backdrop-blur-sm
Opacity: 0 when closed, 1 when open
Click: close drawer
```

**Header:**
```
Display: flex items-center justify-between
Margin-bottom: 24px

Label:
- Font: 12px medium
- Color: neutral-400
- Text: "Action Drawer"

Close Button:
- Size: 32px × 32px
- Border-radius: 8px
- Hover: bg-neural-800
- Icon: X (18px, neutral-300)
```

**Content Sections (Type: howto):**
```
Title + Icon Badge:
- Badge: 32px × 32px, gradient, icon FileText (20px)
- Title: 20px semibold
- Subtitle: 10px neutral-500 (category + urgency)

"Why This Matters" Card:
- Border-radius: 12px (xl)
- Border: 1px solid neural-800
- Background: neural-900/50
- Padding: 16px (p-4)
- Label: "Why This Matters" (12px semibold)
- Text: {reason} (14px neutral-300)

Data Receipts (foreach receipt):
- Border-radius: 12px
- Border: 1px solid neural-800
- Background: neural-900/30
- Padding: 12px (p-3)
- Label: {receipt.label} (12px neutral-400)
- KPI: {receipt.kpi} (10px font-mono clarity-blue)
- Before/After Grid:
  - Grid: 2 columns gap-8px
  - Font: 10px font-mono
  - Before: text-red-400
  - After: text-emerald-400
```

---

### 5. PulseStream (Event Feed)

**Container:**
```
Height: 100vh
Padding: 24px (p-6)
Overflow-y: auto
Space-y: 12px (gap between events)
```

**Empty State:**
```
Display: flex items-center justify-center
Max-width: 448px (max-w-md) centered

Icon Badge:
- Size: 64px × 64px
- Border-radius: full
- Background: linear-gradient(135deg, clarity-blue, clarity-cyan)
- Icon: Activity (32px white)
- Margin: 0 auto 16px

Title: "Pulse Stream" (20px semibold)
Description: "Real-time system events..." (14px neural-400)
```

**Event Card:**
```
Container:
- Border-radius: 20px (2xl)
- Border: 1px solid neural-800
- Background: neural-900/50 with backdrop-blur-sm
- Padding: 16px (p-4)
- Hover: border-neural-700
- Entrance: fade-in + slide-in-from-left (delay: idx × 20ms)

Header Row:
[Icon] [Title + Badge]

Icon (by level):
- critical: AlertCircle (red-400)
- high: TrendingUp (amber-400)
- medium: Info (cyan-400)
- low: CheckCircle (neutral-500)
- Size: 16px

Title:
- Font: 14px semibold
- Color: white

Urgency Badge:
- Same as Incident Card badge styles

Detail:
- Font: 14px regular
- Color: neutral-300
- Margin-top: 8px

Metadata Row:
- Font: 10px regular
- Color: neutral-500
- Format: "{timestamp} • {kpi} • Δ{delta}"
- KPI in font-mono clarity-blue
- Delta in emerald-400 semibold
```

---

## Motion Specifications

### Page Transitions (Mode Switching)

```
AnimatePresence mode="wait"

Entrance:
- initial: { opacity: 0, x: -24 }
- animate: { opacity: 1, x: 0 }
- transition: { duration: 0.32, ease: 'easeOut' }

Exit:
- exit: { opacity: 0, x: 24 }
- transition: { duration: 0.32, ease: 'easeOut' }
```

### Incident Card Stagger

```
Each card (indexed):
- initial: { opacity: 0, y: 20 }
- animate: { opacity: 1, y: 0 }
- transition: { delay: index × 0.04 }
```

### Mode Pill Active Background

```
Framer Motion layoutId="activeMode"

Background element:
- Position: absolute inset-0
- Background: linear-gradient(90deg, clarity-blue, clarity-cyan)
- Border-radius: full
- Transition: spring { damping: 30, stiffness: 300 }
```

### Voice Orb Hover

```
Transform: scale(1.05)
Transition: transform 180ms ease-out
```

### Drawer Open/Close

```
Panel:
- Transform: translateX(100%) closed, translateX(0) open
- Transition: 300ms ease-out

Overlay:
- Opacity: 0 closed, 1 open
- Transition: opacity 300ms
```

---

## Responsive Breakpoints

```figma
Mobile: < 640px
  - Stack mode pills vertically
  - Drawer full width
  - Incident cards single column

Tablet: 640px - 1024px
  - Mode pills horizontal
  - Drawer max-width: 576px
  - Incident cards single column

Desktop: > 1024px
  - Full layout as specified
  - Drawer max-width: 576px (xl)
  - Incident cards single column (max-width: 1280px / 5xl)
```

---

## Accessibility Specifications

### Focus Rings

```
All interactive elements:
- outline: 2px solid clarity-blue
- outline-offset: 2px
- Visible on keyboard focus (:focus-visible)
```

### ARIA Labels

```
Voice Orb:
- aria-label: "Enable voice coach" / "Disable voice coach"

Speech Bubble:
- aria-live: "polite"

Mode Pills:
- aria-pressed: true/false

Drawer Close:
- aria-label: "Close action drawer"
```

### Color Contrast

```
All text meets WCAG AA:
- White on neural-900: 15.7:1 (AAA)
- neutral-300 on neural-900: 7.2:1 (AA)
- clarity-blue on neural-900: 4.8:1 (AA)
```

---

## Export Assets

### Icons (Lucide React)

```
Required icons @ 16px, 18px, 20px, 32px:
- Power, Zap, BarChart3, Activity, Settings
- AlertCircle, Wrench, Rocket, Info
- CheckCircle, TrendingUp, FileText, Send
- X (close)

Export as SVG with:
- Stroke-width: 2px
- Stroke-linecap: round
- Stroke-linejoin: round
```

### Gradients

```
Primary Accent:
linear-gradient(90deg, #3B82F6 0%, #06B6D4 100%)

Radial Orb (enabled):
radial-gradient(
  60% 60% at 50% 50%,
  rgba(6,182,212,0.35) 0%,
  rgba(59,130,246,0.18) 40%,
  transparent 70%
)

Background Radial:
radial-gradient(
  circle at top,
  rgba(59,130,246,0.18) 0%,
  transparent 55%
)
```

---

## Figma Plugin Recommendations

1. **Variables Sync** - Export design tokens as CSS/JSON
2. **Iconify** - Lucide icon library integration
3. **Motion** - Framer Motion animation previews
4. **A11y** - Accessibility contrast checker

---

## Handoff Checklist

- [ ] All color variables defined in Figma
- [ ] Typography styles created and named
- [ ] Component variants for all states
- [ ] Auto-layout applied to all containers
- [ ] Spacing tokens used consistently
- [ ] Motion specs documented
- [ ] Accessibility annotations added
- [ ] Export settings configured
- [ ] Dev mode enabled for inspect
- [ ] Comments added for complex interactions

---

## Design File Structure

```
Pages:
├─ 🎨 Design System
│  ├─ Colors
│  ├─ Typography
│  ├─ Spacing
│  └─ Components
├─ 📱 Dashboard Views
│  ├─ Drive Mode
│  ├─ Autopilot Mode
│  ├─ Insights Mode
│  └─ Pulse Mode
├─ 🔧 Components
│  ├─ CognitiveHeader
│  ├─ Incident Card
│  ├─ Voice Orb
│  ├─ Action Drawer
│  └─ Pulse Event
└─ 📐 Specs
   ├─ Motion Specs
   ├─ Responsive Breakpoints
   └─ Accessibility
```

---

**Status:** Ready for Figma implementation
**Last Updated:** 2025-11-12
**Version:** 1.0.0
