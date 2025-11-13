'use client';
import { useEffect, useRef, useState } from 'react';

export type Vitals = { lcp?: number; cls?: number; inp?: number; stamp: number };

export function useVitals() {
  const [v, setV] = useState<Vitals>({ stamp: Date.now() });
  const clsValue = useRef(0);

  useEffect(() => {
    // LCP
    const lcpObs = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1) as PerformanceEntry & { renderTime?: number; loadTime?: number } | undefined;
      if (last) {
        const time = (last as any).renderTime || (last as any).loadTime;
        setV((s) => ({ ...s, lcp: Number(time.toFixed(2)), stamp: Date.now() }));
      }
    });
    try {
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Silently fail if not supported
    }

    // CLS
    const clsObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (entry && !entry.hadRecentInput && entry.value) {
          clsValue.current += entry.value;
        }
      }
      setV((s) => ({ ...s, cls: Number(clsValue.current.toFixed(3)), stamp: Date.now() }));
    });
    try {
      clsObs.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Silently fail if not supported
    }

    // INP (Event Timing)
    const inpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { duration?: number })[];
      const worst = entries.reduce((m, e) => Math.max(m, e.duration || 0), 0);
      if (worst) setV((s) => ({ ...s, inp: Number(worst.toFixed(0)), stamp: Date.now() }));
    });
    try {
      inpObs.observe({ type: 'event', buffered: true, durationThreshold: 0 } as PerformanceObserverInit);
    } catch (e) {
      // Silently fail if not supported
    }

    return () => {
      lcpObs.disconnect();
      clsObs.disconnect();
      inpObs.disconnect();
    };
  }, []);

  return v;
}
