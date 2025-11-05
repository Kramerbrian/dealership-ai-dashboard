# CTA Integration Guide

## Quick Integration Steps

### 1. Basic Usage (Already Integrated)

The advanced optimizations are already integrated into `SimplifiedLandingPage.tsx`. Here's what was added:

#### ✅ Social Proof & Risk Reversal
```tsx
<RiskReversalBadge />
<SocialProofCounter />
```

#### ✅ Urgency Timer
```tsx
<UrgencyTimer expiresInMinutes={30} />
```

#### ✅ Performance Optimizations
Automatically initialized in `useEffect` hook.

### 2. Using AdvancedCTA Component

Replace any existing button with the `AdvancedCTA` component:

**Before:**
```tsx
<button className="px-8 py-4 bg-blue-600 text-white rounded-xl">
  Analyze Free
</button>
```

**After:**
```tsx
<AdvancedCTA
  variant="hero"
  onClick={handleAnalyze}
  showSocialProof={true}
  showUrgency={false}
  showPulse={false}
>
  Analyze Free
</AdvancedCTA>
```

### 3. Tracking CTA Performance

All CTAs are automatically tracked. To manually track:

```tsx
import { ctaTracker } from '@/lib/analytics/cta-tracking';

// Track impression (automatic on viewport entry)
ctaTracker.trackImpression('hero-cta', 'variant-a');

// Track click
ctaTracker.trackClick('hero-cta', 'variant-a', {
  source: 'hero-section',
  scrollDepth: 0
});

// Track hover
ctaTracker.trackHoverStart('hero-cta');
// ... later
ctaTracker.trackHoverEnd('hero-cta', 'variant-a');
```

### 4. Adding Data Attributes

Add these data attributes to any CTA for automatic tracking:

```tsx
<button
  data-cta-id="hero-analyze"
  data-cta-variant="gradient-blue"
  onClick={handleAnalyze}
>
  Analyze Free
</button>
```

### 5. Performance Optimizations

The performance optimizations run automatically, but you can also initialize manually:

```tsx
import { initCTAPerformanceOptimizations } from '@/lib/performance/cta-optimizer';

useEffect(() => {
  initCTAPerformanceOptimizations();
}, []);
```

## Advanced Features

### Custom Social Proof

```tsx
<SocialProofCounter 
  baseCount={847}
  incrementInterval={3000}
/>
```

### Custom Urgency Timer

```tsx
<UrgencyTimer 
  expiresInMinutes={15}
  showDays={false}
/>
```

### Conversion Funnel Tracking

```tsx
const funnelStage = useConversionFunnel();
// Returns: 'awareness' | 'interest' | 'consideration' | 'action'

useEffect(() => {
  if (funnelStage === 'action') {
    // Show stronger CTA
  }
}, [funnelStage]);
```

## Analytics Dashboard

### View Metrics

```tsx
import { ctaTracker } from '@/lib/analytics/cta-tracking';

// Get metrics for specific CTA
const metrics = ctaTracker.getMetrics('hero-cta', 'variant-a');

// Get all metrics
const allMetrics = ctaTracker.getAllMetrics();

// Export for analysis
const json = ctaTracker.exportMetrics();
```

### Heatmap Data

```tsx
import { ctaHeatmap } from '@/lib/analytics/cta-tracking';

// Get click positions
const positions = ctaHeatmap.getHeatmapData('hero-cta');
// Returns: [x1, y1, x2, y2, ...] normalized to 0-100
```

## A/B Testing Integration

The AdvancedCTA component works seamlessly with A/B testing:

```tsx
<ABTestWrapper
  testId="cta-button-test"
  variants={ctaButtonVariants}
>
  <AdvancedCTA
    variant="hero"
    onClick={handleAnalyze}
  >
    Analyze Free
  </AdvancedCTA>
</ABTestWrapper>
```

## Mobile Optimization

Mobile-specific features are automatically enabled:
- Haptic feedback on tap
- Touch-optimized sizes (min 44x44px)
- Sticky mobile CTA
- Swipe gestures

## Best Practices

1. **Always use data attributes** for tracking
2. **Test different variants** with A/B testing
3. **Monitor metrics** weekly
4. **Iterate based on data** not assumptions
5. **Keep CTAs above the fold** when possible
6. **Use urgency sparingly** to avoid fatigue
7. **Test on mobile** devices regularly

## Expected Results

After implementing these optimizations:
- **Week 1:** Baseline metrics
- **Week 2:** +20-30% improvement
- **Week 4:** +40-60% improvement
- **Week 8:** +60-100% improvement

## Troubleshooting

### CTAs not tracking
- Check browser console for errors
- Verify data attributes are present
- Ensure analytics script is loaded

### Performance issues
- Check network tab for prefetch requests
- Verify lazy loading is working
- Check Intersection Observer support

### Animations not working
- Verify CSS animations are loaded
- Check Tailwind config
- Ensure no CSS conflicts

