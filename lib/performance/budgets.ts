/**
 * Performance Budget Configuration
 * Defines thresholds for Core Web Vitals and other metrics
 */

export interface PerformanceBudget {
  lcp: { good: number; needsImprovement: number }; // milliseconds
  cls: { good: number; needsImprovement: number }; // score
  inp: { good: number; needsImprovement: number }; // milliseconds
  fcp: { good: number; needsImprovement: number }; // milliseconds
  ttfb: { good: number; needsImprovement: number }; // milliseconds
}

export const PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: {
    good: 2500, // 2.5 seconds
    needsImprovement: 4000, // 4 seconds
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  inp: {
    good: 200, // 200ms
    needsImprovement: 500, // 500ms
  },
  fcp: {
    good: 1800, // 1.8 seconds
    needsImprovement: 3000, // 3 seconds
  },
  ttfb: {
    good: 800, // 800ms
    needsImprovement: 1800, // 1.8 seconds
  },
};

export function getRating(
  metric: keyof PerformanceBudget,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const budget = PERFORMANCE_BUDGET[metric];
  
  if (value <= budget.good) {
    return 'good';
  } else if (value <= budget.needsImprovement) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

export function calculateOverallScore(vitals: {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
}): number {
  const metrics = ['lcp', 'cls', 'inp', 'fcp', 'ttfb'] as const;
  const scores: number[] = [];

  for (const metric of metrics) {
    const value = vitals[metric];
    if (value !== undefined) {
      const rating = getRating(metric, value);
      if (rating === 'good') scores.push(100);
      else if (rating === 'needs-improvement') scores.push(50);
      else scores.push(0);
    }
  }

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

