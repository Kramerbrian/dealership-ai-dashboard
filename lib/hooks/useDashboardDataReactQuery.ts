/**
 * React Query version of useDashboardData
 * Better caching, automatic refetching, optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDashboardData, type DashboardData } from '@/lib/services/dashboard-data-service';

interface UseDashboardDataOptions {
  dealerId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  domain?: string;
  enabled?: boolean;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

export function useDashboardDataReactQuery(options: UseDashboardDataOptions): UseDashboardDataReturn {
  const { dealerId, timeRange = '30d', domain, enabled = true } = options;
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-data', dealerId, timeRange, domain],
    queryFn: () => fetchDashboardData(dealerId, timeRange, domain),
    enabled: enabled && !!dealerId,
    staleTime: 60 * 1000, // 1 minute - data is fresh for 1 min
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 min
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: (failureCount, error) => {
      // Don't retry on 401/403 (auth errors)
      if (error instanceof Error && error.message.includes('401')) return false;
      if (error instanceof Error && error.message.includes('403')) return false;
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    data: data || null,
    isLoading,
    isRefetching,
    error: error instanceof Error ? error : null,
    refetch
  };
}

/**
 * Mutation for manual refresh
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealerId, timeRange, domain }: { dealerId: string; timeRange?: string; domain?: string }) => {
      return fetchDashboardData(dealerId, timeRange as any, domain);
    },
    onSuccess: (data, variables) => {
      // Update cache with new data
      queryClient.setQueryData(
        ['dashboard-data', variables.dealerId, variables.timeRange, variables.domain],
        data
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard-data', variables.dealerId]
      });
    }
  });
}

