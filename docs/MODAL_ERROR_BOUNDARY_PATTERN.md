# Modal Error Boundary Pattern

## Overview

All modal components in DealershipAI are wrapped with error boundaries to prevent modal crashes from breaking the entire application. This ensures a graceful user experience even when unexpected errors occur.

## Standard Pattern

### Implementation Structure

```typescript
'use client';

import { ModalErrorBoundary } from '@/components/modals/ModalErrorBoundary';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... other props
}

// Internal content component (no error boundary)
function ModalContent({ isOpen, onClose, ... }: ModalProps) {
  // Original modal logic here
  // All the modal's UI and functionality
  
  return (
    <div>
      {/* Modal content */}
    </div>
  );
}

// Wrapped export (with error boundary)
export default function Modal(props: ModalProps) {
  if (!props.isOpen) return null;
  
  return (
    <ModalErrorBoundary modalName="Modal Name" onClose={props.onClose}>
      <ModalContent {...props} />
    </ModalErrorBoundary>
  );
}
```

## Key Components

### 1. ModalErrorBoundary

Located at: `components/modals/ModalErrorBoundary.tsx`

**Features:**
- Catches React errors in modal children
- Displays user-friendly error UI
- Provides "Try Again" and "Close" actions
- Logs errors to Sentry (if configured)
- Tags errors with modal name for debugging

**Props:**
- `children`: ReactNode - The modal content to wrap
- `onClose`: () => void - Callback to close the modal
- `modalName`: string (optional) - Name for error tracking

### 2. Error Fallback UI

When an error occurs, users see:
- Clear error message
- Modal name (for context)
- "Try Again" button (resets error state)
- "Close" button (closes modal)

## Protected Modals

The following modals are currently protected with error boundaries:

1. ✅ **ADIModal** - Authority Domain Index analysis
2. ✅ **OnboardingModal** - User onboarding flow
3. ✅ **DAICognitiveDashboardModal** - Cognitive dashboard
4. ✅ **SEOModal** - SEO analysis and metrics
5. ✅ **GEOModal** - Generative Engine Optimization
6. ✅ **AEOModal** - AI Engine Optimization
7. ✅ **KPIModal** - KPI detail views
8. ✅ **RecommendationsModal** - Action recommendations

**Note:** AIVModal uses a specialized `AIVErrorBoundary` component.

## Benefits

1. **Isolation**: Modal errors don't crash the entire application
2. **User Experience**: Users see friendly error messages instead of blank screens
3. **Recovery**: Users can try again or close the modal gracefully
4. **Debugging**: Errors are tagged with modal names for easier tracking
5. **Monitoring**: Integration with error tracking services (Sentry)

## When to Add Error Boundaries

Add error boundaries to:
- ✅ All modal components
- ✅ Complex dashboard components with data fetching
- ✅ Components that use third-party libraries
- ✅ Components with user input processing

## Best Practices

1. **Always wrap modal exports**: The exported component should wrap the content component
2. **Use descriptive modal names**: Helps with error tracking and debugging
3. **Pass onClose prop**: Ensures error boundary can close the modal
4. **Keep content component pure**: The internal component should focus on UI logic
5. **Test error scenarios**: Verify error boundaries work in development

## Example: Adding Error Boundary to New Modal

```typescript
// Before
export default function NewModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return <div>Modal content</div>;
}

// After
import { ModalErrorBoundary } from '@/components/modals/ModalErrorBoundary';

function NewModalContent({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return <div>Modal content</div>;
}

export default function NewModal(props: Props) {
  if (!props.isOpen) return null;
  
  return (
    <ModalErrorBoundary modalName="New Modal" onClose={props.onClose}>
      <NewModalContent {...props} />
    </ModalErrorBoundary>
  );
}
```

## Error Tracking Integration

The ModalErrorBoundary automatically logs errors to Sentry when available:

```typescript
if (typeof window !== 'undefined' && (window as any).Sentry) {
  (window as any).Sentry.captureException(error, {
    tags: { component: 'modal', modalName: this.props.modalName },
    contexts: { react: { componentStack: errorInfo.componentStack } }
  });
}
```

## Testing Error Boundaries

To test error boundaries in development:

1. Add a deliberate error in a modal component
2. Open the modal
3. Verify the error boundary catches it
4. Check that error UI appears
5. Test "Try Again" and "Close" buttons

```typescript
// Test error in modal
function TestModalContent() {
  throw new Error('Test error boundary');
  return <div>This won't render</div>;
}
```

## Related Files

- `components/modals/ModalErrorBoundary.tsx` - Error boundary component
- `components/ui/ErrorBoundary.tsx` - General error boundary (for non-modal use)
- `components/dashboard/AIVErrorBoundary.tsx` - Specialized error boundary for AIVModal

