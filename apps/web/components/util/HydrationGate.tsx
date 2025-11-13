'use client';

import { useEffect, useState } from 'react';

/**
 * HydrationGate - Prevents hydration mismatch flicker
 * Waits one frame before rendering children to ensure
 * Zustand persist has hydrated from localStorage
 */
export default function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
