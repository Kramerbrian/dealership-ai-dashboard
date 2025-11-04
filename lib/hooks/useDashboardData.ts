/**
 * React Hook for Dashboard Data
 * Fetches and manages dashboard data from all engines
 * 
 * @deprecated Consider using useDashboardDataReactQuery for better caching
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData, type DashboardData } from '@/lib/services/dashboard-data-service';

interface UseDashboardDataOptions {
  dealerId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  domain?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions): UseDashboardDataReturn {
  const { dealerId, timeRange = '30d', domain, autoRefresh = false, refreshInterval = 60000 } = options;
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const dashboardData = await fetchDashboardData(dealerId, timeRange, domain);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [dealerId, timeRange, domain]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !data) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, data, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    isRefreshing
  };
}
