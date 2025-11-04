# A/B Testing Framework

## Overview

A comprehensive A/B testing framework for data-driven optimization of the landing page. Tests headline variations, CTA buttons, and subheadlines with statistical significance tracking.

## Features

✅ **Consistent User Assignment** - Users always see the same variant  
✅ **Statistical Significance** - Z-test for conversion rate differences  
✅ **Automatic Winner Detection** - Identifies winners at 95% confidence  
✅ **Google Analytics Integration** - Tracks impressions and conversions  
✅ **LocalStorage Persistence** - Results persist across sessions  
✅ **Dashboard View** - Visual results dashboard  

## Active Tests

### 1. Headline Test (`headline-test`)
- **Control**: "Stop Being Invisible to AI Car Shoppers"
- **Variant 1**: "Win More Car Sales from AI-Powered Recommendations"
- **Min Sample Size**: 200 impressions
- **Confidence Level**: 95%

### 2. CTA Button Test (`cta-button-test`)
- **Control**: "Analyze Free"
- **Variant 1**: "Get Your AI Score"
- **Min Sample Size**: 300 impressions
- **Confidence Level**: 95%

### 3. Subheadline Test (`subheadline-test`)
- **Control**: "ChatGPT, Gemini, Perplexity... recommending competitors"
- **Variant 1**: "67% of car shoppers start with AI assistants"
- **Min Sample Size**: 200 impressions
- **Confidence Level**: 95%

## Usage

### View Results Dashboard

```tsx
import { ABTestDashboard } from '@/components/ab-testing/ABTestDashboard';

<ABTestDashboard showAllTests={true} />
```

### Track Conversions

```tsx
import { useABTestConversion } from '@/components/ab-testing/ABTestWrapper';

const { trackConversion } = useABTestConversion('headline-test');

// Track when user completes analysis
trackConversion('headline-control', { domain: 'example.com' });
```

### Add New Test

1. Create variants in `lib/ab-testing/tests.ts`:

```tsx
export const myTestVariants: TestVariant[] = [
  {
    id: 'my-test-control',
    name: 'Control',
    component: <OriginalComponent />,
    weight: 50
  },
  {
    id: 'my-test-variant',
    name: 'Variant',
    component: <NewComponent />,
    weight: 50
  }
];
```

2. Register test in `initializeABTests()`:

```tsx
abTesting.registerTest({
  id: 'my-test',
  name: 'My Test',
  description: 'Testing something new',
  variants: myTestVariants,
  active: true,
  startDate: new Date(),
  minSampleSize: 200,
  confidenceLevel: 0.95
});
```

3. Use in component:

```tsx
<ABTestWrapper
  testId="my-test"
  variants={myTestVariants}
  defaultVariant="my-test-control"
>
  <DefaultComponent />
</ABTestWrapper>
```

## Statistical Significance

The framework uses a **Z-test for proportions** to determine statistical significance:

- **Confidence Levels**: 90%, 95%, 99%, 99.9%
- **Minimum Sample Size**: Configurable per test
- **Winner Detection**: Automatic when confidence ≥ 95%

## Results Storage

- **LocalStorage**: Results persist across sessions
- **Google Analytics**: Events tracked for analysis
- **Dashboard**: Real-time results visualization

## Next Steps

1. Monitor results in dashboard
2. Wait for statistical significance (200-300 impressions)
3. Review winner recommendations
4. Promote winning variant to control
5. Start new tests for continuous optimization

## Best Practices

✅ Test one element at a time  
✅ Maintain 50/50 split initially  
✅ Wait for statistical significance before making decisions  
✅ Document test hypotheses  
✅ Review results weekly  
✅ Don't run too many tests simultaneously  

