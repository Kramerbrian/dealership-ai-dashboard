'use client';

import { ReactNode, useEffect, useState } from 'react';

interface WorkOSProviderProps {
  children: ReactNode;
}

/**
 * WorkOS Provider Component
 * Provides WorkOS context to client components
 * Note: WorkOS handles most auth via redirects, this is mainly for client-side state
 */
export function WorkOSProvider({ children }: WorkOSProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // WorkOS doesn't need a provider like Clerk
  // Auth is handled via redirects and session cookies
  // This component exists for consistency and future extensibility
  return <>{children}</>;
}

