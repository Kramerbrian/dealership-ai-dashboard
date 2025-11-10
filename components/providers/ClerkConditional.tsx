'use client';

import { ReactNode } from 'react';

/**
 * Conditional wrapper for Clerk components
 * Only renders children if we're on a domain where Clerk is active
 */
export function ClerkConditional({ children }: { children: ReactNode }) {
  // Check if we're on dashboard domain (where Clerk is active)
  const isDashboardDomain = typeof window !== 'undefined' && (
    window.location.hostname === 'dash.dealershipai.com' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.startsWith('localhost:') ||
    window.location.hostname.includes('vercel.app')
  );

  // Only render Clerk components on dashboard domain
  if (!isDashboardDomain) {
    return null;
  }

  return <>{children}</>;
}

