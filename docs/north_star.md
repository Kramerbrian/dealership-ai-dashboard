# DealershipAI North Star Design System

**Canonical reference for all UI/UX, copy, and component patterns**

## Core Principles

### 1. Liquid-Glass Aesthetic
- **Backdrop blur**: `backdrop-blur-xl` with `bg-white/80` or `bg-slate-900/60`
- **Borders**: Subtle borders `border-gray-200` or `border-slate-800` with soft shadows
- **Depth**: Layered cards with `shadow-sm` → `shadow-md` on hover
- **Transparency**: Glass-like surfaces that show content beneath

### 2. Morph + Orbit Animations
- **Morph**: Smooth shape transitions using `transition-all duration-300`
- **Orbit**: Circular/spiral motion for loading states, progress indicators
- **Micro-interactions**: Button press feedback, card hover elevation
- **Page transitions**: Fade-in with slight upward motion

### 3. Audio Palette
- **Boot**: Subtle startup sound (0.5s, gentle chime)
- **Success**: Positive feedback (1s, ascending tone)
- **Warn**: Alert notification (0.8s, moderate urgency)
- **Autonomy**: AI action confirmation (1.2s, futuristic)
- **Hover**: Optional micro-sound on interactive elements (0.1s, soft click)

### 4. Mobile Timeline Flow
- **Progressive disclosure**: 3-4 screens max per flow
- **Swipe navigation**: Horizontal card stacks
- **Thumb-friendly**: CTAs in bottom 1/3 of screen
- **Quick wins first**: Show value before asking for commitment

### 5. WOW Onboarding Sequence
- **Preflight Bundle**: "Hands-free 2–4am" automated setup
- **Instant results**: Show Trust Score within 30 seconds
- **Delight moments**: Easter eggs, witty copy, smooth animations
- **Autonomy**: User feels in control, not overwhelmed

### 6. Tone & Voice
- **Confident but approachable**: "Your AI visibility, mastered"
- **Action-oriented**: "Fix now" not "Learn more"
- **Specific over generic**: "87.3% Trust Score" not "Great score!"
- **Human-first**: Acknowledge pain points, celebrate wins

## Component Patterns

### Cards
- **Default**: `rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm`
- **Hover**: `hover:shadow-md transition-all duration-200`
- **Dark mode**: `bg-slate-900/60 border-slate-800`

### Buttons
- **Primary**: `bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors`
- **Secondary**: `bg-gray-100 hover:bg-gray-200 text-gray-900`
- **Ghost**: `border border-gray-300 hover:bg-gray-50`

### Typography
- **Headings**: `text-2xl font-semibold text-gray-900` (h1), `text-xl font-semibold` (h2)
- **Body**: `text-base text-gray-600`
- **Mono numbers**: `font-mono tabular-nums` for scores/metrics

### Animations
- **Fade in**: `animate-fade-in` (0.4s ease-out)
- **Slide up**: `animate-slide-up` (0.5s ease-out, 20px offset)
- **Morph**: Transform scale + border-radius transitions
- **Orbit**: Circular rotation for loading states

## KPI Display Rules

### Tier 1 (5–6 KPIs max)
- Primary metrics only: Trust Score, AI Visibility, Zero-Click Rate
- Large, prominent display
- Immediate action items visible

### Tier 2 (Diagnosis Drawer)
- Detailed breakdowns, historical trends
- Slide-up drawer from bottom
- "View details" → opens drawer with full analysis

## Onboarding Flow

### Preflight Bundle Modal
1. **Entry**: After first login/analysis
2. **Message**: "Set up automated monitoring? Runs 2–4am, hands-free."
3. **Actions**: 
   - "Yes, automate it" → Enable preflight
   - "Maybe later" → Dismiss (reappears after 3 days)
4. **Success**: Confirmation with "Monitoring active" status

## Accessibility

- **Reduced motion**: Respect `prefers-reduced-motion` media query
- **Focus states**: Clear outline on keyboard navigation
- **Screen readers**: Semantic HTML, ARIA labels where needed
- **Audio optional**: All audio can be disabled via user preference

## Implementation Checklist

- [x] North Star principles documented
- [ ] Token map created (`ui/northStar.ts`)
- [ ] `useReducedMotion()` hook implemented
- [ ] Global CSS media queries added
- [ ] Preflight Bundle modal component
- [ ] Diagnosis Drawer component
- [ ] Audio palette initialized (optional)
- [ ] Component library updated to use tokens

---

**Remember**: This is the North Star. Default to these patterns unless explicitly overridden for a specific use case.
