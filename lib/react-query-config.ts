/**
 * React Query Configuration
 * 
 * Optimized settings for request deduplication, caching, and performance
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Request deduplication (automatic with React Query)
      staleTime: 60 * 1000, // 1 minute - data considered fresh
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime) - data kept in cache
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch behavior
      refetchOnWindowFocus: false, // Don't refetch on window focus (too aggressive)
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts (for fresh data)
      
      // Network mode
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Retry mutations once for network errors
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

/**
 * Prefetch helper for SSR/SSG
 */
export async function prefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 60 * 1000,
  });
}

/**
 * Invalidate queries by prefix (useful for cache invalidation)
 */
export function invalidateQueries(prefix: string[]): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: prefix,
  });
}

