/**
 * Custom React hooks for fetching dashboard data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  dashboardAPI,
  type DashboardOverviewData,
  type AIVisibilityData,
  type WebsiteData,
  type SchemaData,
  type ReviewsData,
} from '../api/dashboard-client';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching dashboard overview data
 */
export function useDashboardOverview(params?: {
  dealerId?: string;
  timeRange?: '7d' | '30d' | '90d' | '365d';
  autoFetch?: boolean;
}): UseDataResult<DashboardOverviewData> {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getDashboardOverview(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [params?.dealerId, params?.timeRange]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, params?.autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching AI visibility data
 */
export function useAIVisibility(params?: {
  domain?: string;
  dealerId?: string;
  autoFetch?: boolean;
}): UseDataResult<AIVisibilityData> {
  const [data, setData] = useState<AIVisibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getAIVisibility(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [params?.domain, params?.dealerId]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, params?.autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching website performance data
 */
export function useWebsiteData(params?: {
  domain?: string;
  dealerId?: string;
  autoFetch?: boolean;
}): UseDataResult<WebsiteData> {
  const [data, setData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getWebsiteData(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [params?.domain, params?.dealerId]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, params?.autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching schema data
 */
export function useSchemaData(params?: {
  domain?: string;
  dealerId?: string;
  autoFetch?: boolean;
}): UseDataResult<SchemaData> {
  const [data, setData] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getSchemaData(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [params?.domain, params?.dealerId]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, params?.autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching reviews data
 */
export function useReviewsData(params?: {
  domain?: string;
  dealerId?: string;
  autoFetch?: boolean;
}): UseDataResult<ReviewsData> {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getReviewsData(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [params?.domain, params?.dealerId]);

  useEffect(() => {
    if (params?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, params?.autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for periodic data refresh
 */
export function useAutoRefresh(callback: () => void | Promise<void>, interval: number = 60000) {
  useEffect(() => {
    const timer = setInterval(() => {
      callback();
    }, interval);

    return () => clearInterval(timer);
  }, [callback, interval]);
}
