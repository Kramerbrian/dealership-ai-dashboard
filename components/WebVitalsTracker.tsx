'use client';

/**
 * Web Vitals Tracker Component
 * 
 * Client component that initializes Web Vitals tracking
 * Must be 'use client' because web-vitals runs in the browser
 */

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

export function WebVitalsTracker() {
  useEffect(() => {
    // Initialize Web Vitals tracking on mount
    initWebVitals();
  }, []);

  // This component renders nothing
  return null;
}
