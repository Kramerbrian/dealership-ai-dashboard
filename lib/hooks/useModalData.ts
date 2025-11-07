'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseModalDataOptions<T> {
  enabled?: boolean;
  staleTime?: number; // Cache time in ms (default: 5 minutes)
  refetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Optimized hook for modal data fetching with caching and prefetching
 */
export function useModalData<T>(
  fetchFn: () => Promise<T>,
  options: UseModalDataOptions<T> = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    refetchOnMount = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: T | null; timestamp: number }>({ data: null, timestamp: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (force = false) => {
    // Check cache first
    const now = Date.now();
    const cacheAge = now - cacheRef.current.timestamp;
    
    if (!force && cacheRef.current.data && cacheAge < staleTime) {
      setData(cacheRef.current.data);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      // Update cache
      cacheRef.current = {
        data: result,
        timestamp: Date.now(),
      };

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFn, staleTime, onSuccess, onError]);

  // Prefetch data when enabled
  useEffect(() => {
    if (enabled) {
      fetchData(!refetchOnMount);
    }
  }, [enabled, fetchData, refetchOnMount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const invalidate = useCallback(() => {
    cacheRef.current = { data: null, timestamp: 0 };
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
  };
}

/**
 * Prefetch modal data on hover (for better UX)
 */
export function useModalPrefetch<T>(
  fetchFn: () => Promise<T>,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetch = useCallback(() => {
    if (!enabled) return;

    // Debounce prefetch (wait 200ms after hover)
    prefetchTimeoutRef.current = setTimeout(() => {
      fetchFn().catch(() => {
        // Silently fail on prefetch
      });
    }, 200);
  }, [fetchFn, enabled]);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelPrefetch();
    };
  }, [cancelPrefetch]);

  return { prefetch, cancelPrefetch };
}

