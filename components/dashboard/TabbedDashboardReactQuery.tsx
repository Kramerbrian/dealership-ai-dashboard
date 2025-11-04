/**
 * TabbedDashboard with React Query Migration Example
 * 
 * This shows how to migrate the existing TabbedDashboard to use React Query
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackFunnelStep } from '@/lib/analytics-funnels';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { invalidateCacheClient } from '@/lib/cache-tags';

interface DashboardMetrics {
  aiVisibility: {
    score: number;
    trend: number;
    breakdown: { seo: number; aeo: number; geo: number };
  };
  revenue: { atRisk: number; potential: number; trend: number };
  performance: { loadTime: number; uptime: number; score: number };
  leads: { monthly: number; trend: number; conversion: number };
}

// Fetch function for React Query
async function fetchDashboardData(timeRange: string): Promise<DashboardMetrics> {
  const response = await fetch(`/api/dashboard/overview?timeRange=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const data = await response.json();
  
  // Track funnel step
  await trackFunnelStep('dashboard-load', 'fetched', 'Dashboard data loaded', {
    timeRange,
  });
  
  return data.data || data;
}

export function TabbedDashboardReactQuery() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const queryClient = useQueryClient();

  // React Query hook - replaces all the fetch/useState/useEffect logic
  const { 
    data: metrics, 
    isLoading, 
    error,
    isRefetching 
  } = useQuery({
    queryKey: ['dashboard', 'overview', selectedTimeRange],
    queryFn: () => fetchDashboardData(selectedTimeRange),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Mutation for refreshing data
  const refreshMutation = useMutation({
    mutationFn: () => fetchDashboardData(selectedTimeRange),
    onSuccess: () => {
      // Invalidate cache after refresh
      invalidateCacheClient([CACHE_TAGS.DASHBOARD_OVERVIEW, CACHE_TAGS.DASHBOARD]);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">Error: {error.message}</p>
        <button onClick={() => refreshMutation.mutate()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Your dashboard UI here */}
      <button 
        onClick={() => refreshMutation.mutate()}
        disabled={refreshMutation.isPending || isRefetching}
      >
        {refreshMutation.isPending || isRefetching ? 'Refreshing...' : 'Refresh'}
      </button>
      {/* Dashboard content */}
    </div>
  );
}

