'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export default function WebVitalsTracker() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return null;
}
