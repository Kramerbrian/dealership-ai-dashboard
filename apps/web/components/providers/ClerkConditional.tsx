'use client';

import { ReactNode, useState, useEffect } from 'react';

/**
 * Conditional wrapper for Clerk components
 * Only renders children if we're on a domain where Clerk is active
 */
export function ClerkConditional({ children }: { children: ReactNode }) {
  const [isDashboardDomain, setIsDashboardDomain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if we're on dashboard domain (where Clerk is active)
    const hostname = window.location.hostname;
    const isDashboard = 
      hostname === 'dash.dealershipai.com' ||
      hostname === 'localhost' ||
      hostname.startsWith('localhost:') ||
      hostname.includes('vercel.app');
    
    setIsDashboardDomain(isDashboard);
  }, []);

  // Don't render during SSR or if not dashboard domain
  if (!mounted || !isDashboardDomain) {
    return null;
  }

  return <>{children}</>;
}

