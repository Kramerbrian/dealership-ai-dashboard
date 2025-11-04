'use client';

import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

/**
 * Client-side wrapper for error boundary
 * Use this to wrap server components in layout.tsx
 */
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedErrorBoundary level="page">
      {children}
    </EnhancedErrorBoundary>
  );
}

