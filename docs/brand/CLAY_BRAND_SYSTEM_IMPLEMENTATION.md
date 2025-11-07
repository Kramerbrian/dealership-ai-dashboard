# Clay Brand System Implementation - Complete ✅

## Overview

The Clay Global GTM + UX/Brand methodology has been merged into dealershipAI's canon and packaged as a Cursor-import JSON bundle. This system aligns with the North-Star UI (liquid-glass Cupertino aesthetic, Morph + Orbit Realignment motion, auditory palette, role-based focus feed) and locks branding + UX rules across landing, dashboard, and design system.

---

## Files Created

### 1. Core Bundle
- **`cursor_patch_clay_brand_system.json`** - Complete Cursor-import bundle with all files

### 2. Brand Documentation
- **`docs/brand/README.md`** - Brand & UX canon overview
- **`docs/brand/gtm-checklist.md`** - Clay-style GTM checklist
- **`docs/brand/ai-method.md`** - AI-infused creative methodology
- **`docs/brand/brand-guidelines.md`** - Visual & verbal guidelines

### 3. Brand Data
- **`data/brand/brandbook.json`** - Complete brandbook with:
  - Voice & tone rules
  - Visual identity (liquid-glass Cupertino)
  - Motion models (Morph, Orbit Realignment)
  - Auditory palette
  - Copy patterns (CWV blocks, hover cards)
  - Role-specific views
  - GTM pillars

### 4. Design System
- **`styles/design-tokens.json`** - Design tokens:
  - Color palette (dark theme with accent colors)
  - Radius, shadow, spacing
  - Motion (duration, curves)
  - Typography scale

### 5. UX Patterns
- **`docs/ux/patterns.md`** - UX patterns:
  - Action-first cards
  - Real-time visibility
  - Role-specific layouts
  - Motion & audio
  - Accessibility

### 6. Landing Page
- **`app/(marketing)/landing/page.tsx`** - Landing page component
- **`app/pages/landing/hero.json`** - Hero content (headline, subhead, CTA)

---

## Core Principles Implemented

### 1. Brand × UX = One System
- Visual and verbal identity encoded in design system
- Not layered on top, but integrated

### 2. Clarity → Action
- Every screen answers: *what should I do next?*
- Actions: fix, compare, simulate, export

### 3. Zero-Click Era Ready
- Optimize for AI surfaces first
- Product teaches with hover cards + 'Show me why' drawers

### 4. Human, Fast, Consistent
- Liquid-glass calm
- Bold hierarchy
- Motion with purpose
- Accessible defaults

### 5. AI as a Creative Partner
- Ideation, research, automation, personalization
- Editorial control preserved

---

## Locked Taglines

- **Canon hero**: *Your real-time dealership diagnostic dashboard.*
- **Sound bite**: *dealershipAI doesn't just show where you stand — it shows you what to fix next to win the click (or zero-click) before your competitors even realize what's happening.*

---

## Design Tokens

### Colors
- Background: `#0B0C0F`
- Surface: `#0F1116`
- Card: `#141722`
- Accent: `#6AB3FF`
- Success: `#3CD185`
- Warn: `#FFC857`
- Danger: `#FF6B6B`

### Motion
- Fast: 140ms
- Base: 220ms
- Slow: 360ms
- Curve: `cubic-bezier(0.2, 0.8, 0.2, 1)`

### Typography
- Font: Inter, ui-sans-serif, system-ui
- Sizes: 12/14/16/18/22/28/36

---

## Role-Specific Views

### GM
- Relevance Overlay
- Revenue at Risk
- Evidence Packets

### Marketing
- Generative Citations
- CWV (Core Web Vitals)
- Schema Fix-Now

### Used Car Director
- Valuation & Anchors
- VIN Overlap
- RI Simulator

### Service Director
- Search Visibility (services)
- Parts Fitment
- OCI

---

## GTM Pillars

1. **Discovery** - Stakeholder interviews, role maps
2. **Positioning** - Hero, RTB bullets, proof
3. **Design System** - Tokens, components, motion/audio
4. **Activation** - Landing hero, explainers, playbooks

---

## Success Metrics

- Trial activations
- Schema fixes executed
- AI citation share lift
- Lead volume
- RO count

---

## Next Steps (Optional)

1. **Figma Export Token Script** - Sync `styles/design-tokens.json` with Figma library
2. **Role-Based Onboarding Tour** - Use Clay GTM narrative (Discovery → Positioning → System → Activation) as product walkthrough

---

## Usage

### Import in Cursor
1. Open Cursor
2. Import `cursor_patch_clay_brand_system.json`
3. All files will be created automatically

### Use Design Tokens
```typescript
import tokens from '@/styles/design-tokens.json';

const bgColor = tokens.color.bg; // #0B0C0F
const accentColor = tokens.color.accent; // #6AB3FF
```

### Use Brandbook
```typescript
import brandbook from '@/data/brand/brandbook.json';

const hero = brandbook.brand.voice.examples.hero;
const cta = brandbook.brand.voice.examples.cta_primary;
```

---

## Status

✅ **COMPLETE** - All files created and ready for use
✅ **Brand Canon** - Locked taglines and voice rules
✅ **Design System** - Tokens and patterns defined
✅ **UX Patterns** - Action-first, role-specific layouts
✅ **Landing Page** - Wired to canon hero & sound bite

The Clay Brand System is now integrated into dealershipAI's codebase and ready to guide all brand and UX decisions.

