/**
 * Performance Optimization Checklist
 * Tracks optimization opportunities and impact
 */

export interface OptimizationOpportunity {
  id: string;
  name: string;
  category: 'performance' | 'conversion' | 'quality' | 'efficiency';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'complete';
  description: string;
  expectedImpact: string;
}

export const optimizationChecklist: OptimizationOpportunity[] = [
  // Performance
  {
    id: 'perf-1',
    name: 'Memoize Expensive Calculations',
    category: 'performance',
    impact: 'high',
    effort: 'low',
    status: 'pending',
    description: 'Use useMemo for expensive calculations (validation, filtering, formatting)',
    expectedImpact: '30-50% reduction in re-renders, smoother interactions'
  },
  {
    id: 'perf-2',
    name: 'Memoize Callback Functions',
    category: 'performance',
    impact: 'high',
    effort: 'low',
    status: 'pending',
    description: 'Use useCallback for event handlers passed to child components',
    expectedImpact: 'Prevent unnecessary child re-renders, better performance'
  },
  {
    id: 'perf-3',
    name: 'Code Splitting Optimization',
    category: 'performance',
    impact: 'high',
    effort: 'medium',
    status: 'pending',
    description: 'Split large components, lazy load non-critical features',
    expectedImpact: '40-60% reduction in initial bundle size'
  },
  {
    id: 'perf-4',
    name: 'Font Optimization',
    category: 'performance',
    impact: 'high',
    effort: 'low',
    status: 'pending',
    description: 'Preload fonts, use font-display: swap, subset fonts',
    expectedImpact: '50-70% faster font loading, better LCP'
  },
  {
    id: 'perf-5',
    name: 'Critical CSS Inlining',
    category: 'performance',
    impact: 'medium',
    effort: 'medium',
    status: 'pending',
    description: 'Inline critical CSS for above-the-fold content',
    expectedImpact: '20-30% faster First Contentful Paint'
  },
  
  // Conversion
  {
    id: 'conv-1',
    name: 'Progressive Profiling',
    category: 'conversion',
    impact: 'high',
    effort: 'medium',
    status: 'pending',
    description: 'Collect email after showing results, not before',
    expectedImpact: '+15-25% conversion on initial scan'
  },
  {
    id: 'conv-2',
    name: 'Smart Exit Intent',
    category: 'conversion',
    impact: 'medium',
    effort: 'low',
    status: 'pending',
    description: 'Context-aware exit offers based on scroll depth and time',
    expectedImpact: '+8-15% recovery rate'
  },
  {
    id: 'conv-3',
    name: 'Mobile CTA Optimization',
    category: 'conversion',
    impact: 'high',
    effort: 'medium',
    status: 'pending',
    description: 'Optimize mobile CTAs with better touch targets and positioning',
    expectedImpact: '+20-30% mobile conversion'
  },
  
  // Quality
  {
    id: 'qual-1',
    name: 'Error Boundary Improvements',
    category: 'quality',
    impact: 'medium',
    effort: 'low',
    status: 'pending',
    description: 'Add error boundaries around critical sections',
    expectedImpact: 'Better error recovery, improved UX'
  },
  {
    id: 'qual-2',
    name: 'Type Safety Improvements',
    category: 'quality',
    impact: 'medium',
    effort: 'medium',
    status: 'pending',
    description: 'Add stricter TypeScript types, remove any types',
    expectedImpact: 'Fewer runtime errors, better IDE support'
  },
  
  // Efficiency
  {
    id: 'eff-1',
    name: 'Bundle Size Analysis',
    category: 'efficiency',
    impact: 'high',
    effort: 'low',
    status: 'pending',
    description: 'Analyze and optimize bundle size, remove unused dependencies',
    expectedImpact: '30-40% smaller bundle, faster load times'
  },
  {
    id: 'eff-2',
    name: 'API Request Deduplication',
    category: 'efficiency',
    impact: 'high',
    effort: 'low',
    status: 'pending',
    description: 'Ensure all API calls use React Query for automatic deduplication',
    expectedImpact: '30-40% reduction in duplicate API calls'
  }
];

