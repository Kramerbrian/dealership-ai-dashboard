# DealershipAI Component Documentation

## Overview

This document describes the key React components in the DealershipAI application.

## Component Structure

```
components/
├── ui/              # Reusable UI primitives
├── dashboard/       # Dashboard-specific components
├── landing/         # Landing page components
├── pulse/           # Pulse digest components
└── modes/           # Cognitive mode components
```

## UI Components

### `AccessibleChart`

Wraps charts with accessibility features.

**Props**:
- `title` (string, required): Chart title
- `description` (string, optional): Chart description for screen readers
- `aria-label` (string, optional): Custom ARIA label
- `className` (string, optional): Additional CSS classes

**Usage**:
```tsx
<AccessibleChart
  title="Revenue Trends"
  description="Monthly revenue from January to December 2024"
>
  <LineChart data={data}>
    <Line dataKey="revenue" />
  </LineChart>
</AccessibleChart>
```

---

### `AriaLiveRegion`

Provides screen reader announcements for dynamic content.

**Props**:
- `message` (string | null): Message to announce
- `priority` ('polite' | 'assertive', default: 'polite'): Announcement priority
- `className` (string, optional): Additional CSS classes

**Usage**:
```tsx
<AriaLiveRegion
  message={error ? "An error occurred" : null}
  priority="assertive"
/>
```

---

### `PageErrorBoundary`

Error boundary component for page-level error handling.

**Props**:
- `children` (ReactNode): Child components

**Usage**:
```tsx
<PageErrorBoundary>
  <YourComponent />
</PageErrorBoundary>
```

---

## Dashboard Components

### `DriveMode`

Main triage interface for incident management.

**Features**:
- Category filters
- Role-based weighting
- Incident queue
- Auto-fix actions

**State Management**: Uses `useCognitiveStore` (Zustand)

---

### `DailyPulse`

Displays daily Pulse digest updates.

**Props**:
- `tenant` (string | null): Tenant ID
- `onTopicClick` (function): Callback when topic is clicked

**Usage**:
```tsx
<DailyPulse
  tenant={userId}
  onTopicClick={(topic) => setSelectedTopic(topic)}
/>
```

---

### `ContextDrawer`

Drawer component for displaying Pulse topic details.

**Props**:
- `topic` (PulseTopic | null): Selected topic
- `isOpen` (boolean): Drawer open state
- `onClose` (function): Close handler

---

## Landing Components

### `Hero`

Main hero section with personalization.

**Features**:
- Geo-aware headlines
- Role-based CTAs
- Time-of-day cadence
- Brand hue tinting

---

### `Showcase`

Cinematic showcase of features.

**Features**:
- Intent-based tile ordering
- Smooth animations
- Responsive layout

---

## Hooks

### `useVitals()`

Tracks Core Web Vitals (LCP, CLS, INP).

**Returns**:
```typescript
{
  lcp?: number;
  cls?: number;
  inp?: number;
  stamp: number;
}
```

**Usage**:
```tsx
const vitals = useVitals();
console.log('LCP:', vitals.lcp);
```

---

### `useBrandHue()`

Determines brand hue from domain.

**Returns**:
```typescript
{
  hue: number;
  tint: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
```

---

## Styling

Components use Tailwind CSS with custom design tokens.

**Design System**: Clay UI + Cupertino aesthetic

**Motion**: Framer Motion for animations

---

## Testing

All components should have:
- Unit tests in `__tests__/components/`
- Accessibility testing
- Visual regression tests (optional)

---

## Best Practices

1. **Accessibility**: Always include ARIA labels and keyboard navigation
2. **Performance**: Use dynamic imports for heavy components
3. **Error Handling**: Wrap in error boundaries
4. **Type Safety**: Use TypeScript for all props
5. **Documentation**: Document complex props and usage

---

## Contributing

When adding new components:

1. Create component file
2. Add TypeScript types
3. Write unit tests
4. Update this documentation
5. Add Storybook story (optional)


## Component Library

### UI Components

#### `AccessibleChart`
Wraps charts with accessibility features.

**Props:**
- `title` (string, required): Chart title
- `description` (string, optional): Chart description for screen readers
- `aria-label` (string, optional): Custom ARIA label
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
import { AccessibleChart } from '@/components/ui/AccessibleChart';

<AccessibleChart
  title="Revenue Trends"
  description="Monthly revenue from January to December 2024"
>
  <LineChart data={data}>
    <Line dataKey="revenue" />
  </LineChart>
</AccessibleChart>
```

---

#### `AriaLiveRegion`
Provides screen reader announcements for dynamic content.

**Props:**
- `message` (string | null): Message to announce
- `priority` ('polite' | 'assertive', default: 'polite'): Announcement priority
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
import { AriaLiveRegion } from '@/components/ui/AriaLiveRegion';

<AriaLiveRegion
  message={error ? "Error occurred" : null}
  priority="assertive"
/>
```

---

#### `PageErrorBoundary`
Error boundary component for page-level error handling.

**Props:**
- `children` (ReactNode): Child components

**Usage:**
```tsx
import { PageErrorBoundary } from '@/components/ui/PageErrorBoundary';

<PageErrorBoundary>
  <YourComponent />
</PageErrorBoundary>
```

---

### Dashboard Components

#### `DriveMode`
Main triage interface for incident management.

**Features:**
- Category filters
- Role-based weighting
- One-tap reset
- Daily Pulse integration
- Context drawer

**State Management:**
- Uses `useCognitiveStore` from `@/lib/store/cognitive`
- Persists filters and preferences

---

#### `DailyPulse`
Displays daily agentic updates as horizontally scrollable cards.

**Props:**
- `tenant` (string | null): Tenant ID
- `onTopicClick` (function): Callback when topic is clicked

**Usage:**
```tsx
import DailyPulse from '@/components/pulse/DailyPulse';

<DailyPulse
  tenant={userId}
  onTopicClick={(topic) => setSelectedTopic(topic)}
/>
```

---

#### `ContextDrawer`
Drawer component displaying full context and actions for a Pulse topic.

**Props:**
- `topic` (PulseTopic | null): Selected topic
- `isOpen` (boolean): Drawer open state
- `onClose` (function): Close handler

---

### Cognitive Components

#### `CognitiveHeader`
Header component with Pulse mode indicator.

**Features:**
- Mode switching
- Pulse status
- User context

---

#### `ActionDrawer`
Drawer for action execution and details.

**Features:**
- Incident details
- Fix actions
- Evidence display

---

## Hooks

### `useVitals()`
Tracks Core Web Vitals (LCP, CLS, INP) in real-time.

**Returns:**
```typescript
{
  lcp?: number;
  cls?: number;
  inp?: number;
  stamp: number;
}
```

**Usage:**
```tsx
import { useVitals } from '@/lib/hooks/useVitals';

function MyComponent() {
  const vitals = useVitals();
  return <div>LCP: {vitals.lcp}ms</div>;
}
```

---

### `useBrandHue()`
Gets brand hue from domain for consistent theming.

**Returns:**
```typescript
{
  hue: number;
  tint: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
```

---

### `useReducedMotion()`
Detects user's motion preference.

**Returns:**
```typescript
boolean // true if prefers-reduced-motion
```

---

## Utilities

### `createFocusTrap(container)`
Traps focus within a container (for modals/drawers).

**Returns:** Cleanup function

**Usage:**
```tsx
import { createFocusTrap } from '@/lib/accessibility/focus-trap';

useEffect(() => {
  const cleanup = createFocusTrap(modalRef.current);
  return cleanup;
}, []);
```

---

## Design Tokens

### Clay UI System

Located in `lib/ui/clay.tsx`:

- **Colors**: Primary, secondary, accent, surface, text
- **Motion**: Presets for animations
- **Components**: Container, Card, Button, Input, Segmented, KPI, Grid

**Usage:**
```tsx
import { Clay } from '@/lib/ui/clay';

<Clay.Card>
  <Clay.CardHeader>Title</Clay.CardHeader>
  <Clay.CardBody>Content</Clay.CardBody>
</Clay.Card>
```

---

## Best Practices

### Accessibility
1. Always use `AccessibleChart` for charts
2. Use `AriaLiveRegion` for dynamic announcements
3. Implement focus traps for modals
4. Provide alt text for images
5. Use semantic HTML

### Performance
1. Lazy load heavy components
2. Use `useVitals()` to monitor performance
3. Optimize images with Next.js Image
4. Code split routes

### State Management
1. Use Zustand for global state
2. Use React Query for server state
3. Persist user preferences
4. Clear state on logout

---

## Component Organization

```
components/
├── ui/              # Reusable UI primitives
├── dashboard/       # Dashboard-specific components
├── pulse/           # Pulse digest components
├── modes/           # Cognitive mode components
├── landing/         # Landing page components
└── seo/             # SEO components
```

