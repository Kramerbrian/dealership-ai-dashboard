'use client';

/**
 * Web Vitals Reporter Component
 * Automatically reports Core Web Vitals metrics
 */

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/monitoring/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    // Only report in browser
    if (typeof window !== 'undefined') {
      reportWebVitals();
    }
  }, []);

  return null; // This component doesn't render anything
}
