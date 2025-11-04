# Quick Integration Guide

## 🚀 Fastest Path to Production

All improvements are ready. Here's how to use them:

---

## 1. React Query - Migrate One Component (15 min)

**Before** (fetch in useEffect):
```typescript
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);
```

**After** (React Query):
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['dashboard-data'],
  queryFn: () => fetch('/api/data').then(r => r.json()),
});
```

**Benefits**: Automatic caching, deduplication, retry, loading states

---

## 2. Add Cache Tags to API Routes (5 min per route)

```typescript
import { cachedResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

export async function GET(req: NextRequest) {
  const data = await getData();
  
  return cachedResponse(
    data,
    60, // cache for 60s
    300, // stale-while-revalidate for 300s
    [CACHE_TAGS.DASHBOARD_REVIEWS] // Add tags
  );
}
```

---

## 3. Track API Analytics (2 min per route)

```typescript
import { trackAPIRequest } from '@/lib/api-analytics';

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const data = await getData();
    await trackAPIRequest('/api/endpoint', 'GET', 200, Date.now() - start);
    return NextResponse.json(data);
  } catch (error) {
    await trackAPIRequest('/api/endpoint', 'GET', 500, Date.now() - start, { error });
    throw error;
  }
}
```

---

## 4. Enable Real-Time Updates (10 min)

```typescript
import { useRealtimeEvents } from '@/lib/realtime-hooks';

function Dashboard() {
  const { events, isConnected } = useRealtimeEvents();
  
  return (
    <div>
      {isConnected && <Badge>Live</Badge>}
      {/* Use events for real-time updates */}
    </div>
  );
}
```

---

## 5. Use A/B Testing (10 min)

```typescript
import { useABTest } from '@/lib/ab-testing-hooks';

function HeroSection({ userId }: { userId: string }) {
  const { variant, trackEvent } = useABTest('hero-cta-test', userId);
  
  return (
    <>
      {variant === 'A' && <Button>Get Started</Button>}
      {variant === 'B' && <Button>Start Free Trial</Button>}
    </>
  );
}
```

---

## Priority Actions

### This Week:
1. ✅ Migrate `TabbedDashboard.tsx` to React Query
2. ✅ Add cache tags to 3 dashboard routes
3. ✅ Add analytics tracking to 3 routes

### Next Week:
4. ✅ Enable real-time updates in dashboard
5. ✅ Initialize enhanced Sentry
6. ✅ Test performance dashboard

---

**Start with #1 (React Query migration)** - biggest immediate impact!

