# Modal Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented for modal components in DealershipAI, including loading states, data caching, and prefetching strategies.

## Optimizations Implemented

### 1. Skeleton Loading States

Instead of generic spinners, modals now use contextual skeleton loaders that match the final content layout.

**Components:**
- `ModalSkeleton` - Reusable skeleton component with variants
- Variants: `default`, `chart`, `table`, `list`

**Usage:**
```typescript
import { ModalSkeleton } from '@/components/ui/ModalSkeleton';

{loading && !data ? (
  <ModalSkeleton variant="chart" />
) : (
  <ModalContent data={data} />
)}
```

**Benefits:**
- Better perceived performance
- Reduced layout shift
- More professional appearance

### 2. Data Caching with `useModalData`

Custom hook that implements intelligent caching for modal data.

**Features:**
- Automatic caching (5-minute default)
- Request deduplication
- Abort controller for cleanup
- Cache invalidation support

**Usage:**
```typescript
import { useModalData } from '@/lib/hooks/useModalData';

const { data, loading, error, refetch, invalidate } = useModalData(
  async () => {
    const res = await fetch('/api/seo-data');
    return res.json();
  },
  {
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => console.log('Data loaded:', data),
  }
);
```

### 3. Prefetching on Hover

Prefetch modal data when user hovers over trigger buttons.

**Usage:**
```typescript
import { useModalPrefetch } from '@/lib/hooks/useModalData';

const { prefetch, cancelPrefetch } = useModalPrefetch(
  () => fetch('/api/modal-data').then(r => r.json()),
  { enabled: true }
);

<button
  onMouseEnter={prefetch}
  onMouseLeave={cancelPrefetch}
  onClick={() => setIsOpen(true)}
>
  Open Modal
</button>
```

**Benefits:**
- Data ready when modal opens
- Faster perceived load time
- Better user experience

### 4. Lazy Loading Heavy Components

Load heavy chart libraries and components only when needed.

**Example:**
```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(
  () => import('./HeavyChart'),
  {
    loading: () => <ModalSkeleton variant="chart" />,
    ssr: false,
  }
);
```

### 5. Optimized Re-renders

**Memoization:**
```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);

// Memoize callbacks
const handleAction = useCallback(() => {
  // Action logic
}, [dependencies]);
```

**Component Splitting:**
- Split large modals into smaller components
- Use React.memo for stable components
- Avoid unnecessary re-renders

## Performance Metrics

### Target Metrics
- **Modal Open Time:** < 200ms (with prefetch) or < 500ms (without)
- **Data Load Time:** < 1s for initial load
- **Skeleton Display:** < 100ms after modal open
- **Cache Hit Rate:** > 70% for repeat opens

### Monitoring
- Track modal open times in analytics
- Monitor cache hit rates
- Alert on slow modal loads (> 1s)

## Best Practices

### 1. Data Fetching
- ✅ Fetch data only when modal opens
- ✅ Use caching to avoid redundant requests
- ✅ Prefetch on hover for better UX
- ✅ Cancel requests on modal close

### 2. Loading States
- ✅ Show skeleton loaders matching final layout
- ✅ Display loading state immediately
- ✅ Handle error states gracefully
- ✅ Provide retry mechanisms

### 3. Component Structure
- ✅ Keep modal content components lightweight
- ✅ Lazy load heavy dependencies
- ✅ Use code splitting for large modals
- ✅ Minimize bundle size

### 4. State Management
- ✅ Clear state on modal close
- ✅ Avoid storing unnecessary data
- ✅ Use local state for UI-only data
- ✅ Cache API responses appropriately

## Implementation Examples

### Optimized SEO Modal
```typescript
function SEOModalContent({ isOpen, onClose, domain }: Props) {
  const { data, loading, error, refetch } = useModalData(
    () => fetchSEOData(domain),
    {
      enabled: isOpen,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (!isOpen) return null;

  return (
    <Modal>
      {loading && !data ? (
        <ModalSkeleton variant="chart" />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <SEOContent data={data} />
      )}
    </Modal>
  );
}
```

### Prefetch on Button Hover
```typescript
function Dashboard() {
  const { prefetch } = useModalPrefetch(
    () => fetchSEOData(domain),
    { enabled: true }
  );

  return (
    <button
      onMouseEnter={prefetch}
      onClick={() => setSEOModalOpen(true)}
    >
      View SEO Analysis
    </button>
  );
}
```

## Troubleshooting

### Slow Modal Opens
1. Check network tab for slow API calls
2. Verify caching is working
3. Check for unnecessary re-renders
4. Profile component render times

### High Memory Usage
1. Ensure cleanup on modal close
2. Check for memory leaks in effects
3. Verify abort controllers are used
4. Monitor component unmounting

### Cache Not Working
1. Verify `staleTime` is set correctly
2. Check cache invalidation logic
3. Ensure cache key is unique
4. Verify data structure matches

## Future Optimizations

- [ ] Implement React Query for better caching
- [ ] Add service worker for offline support
- [ ] Implement virtual scrolling for long lists
- [ ] Add progressive loading for large datasets
- [ ] Implement request queuing for multiple modals

