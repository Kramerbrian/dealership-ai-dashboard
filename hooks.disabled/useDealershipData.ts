import { useState, useEffect, useCallback } from 'react';
import { DealershipAIService } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Dealership = Database['public']['Tables']['dealerships']['Row'];
type DashboardMetrics = Database['public']['Tables']['dashboard_metrics']['Row'];
type Threat = Database['public']['Tables']['threats']['Row'];

interface UseDealershipDataReturn {
  dealership: Dealership | null;
  metrics: DashboardMetrics | null;
  threats: Threat[];
  loading: Record<string, boolean>;
  error: string | null;
  refreshData: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshThreats: () => Promise<void>;
}

export function useDealershipData(dealershipId: string): UseDealershipDataReturn {
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const setLoadingState = useCallback((key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const fetchDealership = useCallback(async () => {
    if (!dealershipId) return;

    setLoadingState('dealership', true);
    try {
      const data = await DealershipAIService.getDealership(dealershipId);
      setDealership(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dealership');
      console.error('Error fetching dealership:', err);
    } finally {
      setLoadingState('dealership', false);
    }
  }, [dealershipId, setLoadingState]);

  const fetchMetrics = useCallback(async () => {
    if (!dealershipId) return;

    setLoadingState('metrics', true);
    try {
      const data = await DealershipAIService.getMetrics(dealershipId);
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoadingState('metrics', false);
    }
  }, [dealershipId, setLoadingState]);

  const fetchThreats = useCallback(async () => {
    if (!dealershipId) return;

    setLoadingState('threats', true);
    try {
      const data = await DealershipAIService.getThreats(dealershipId);
      setThreats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threats');
      console.error('Error fetching threats:', err);
    } finally {
      setLoadingState('threats', false);
    }
  }, [dealershipId, setLoadingState]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchDealership(),
      fetchMetrics(),
      fetchThreats()
    ]);
  }, [fetchDealership, fetchMetrics, fetchThreats]);

  useEffect(() => {
    if (dealershipId) {
      refreshData();
    }
  }, [dealershipId, refreshData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!dealershipId) return;

    const metricsChannel = DealershipAIService.subscribeToMetrics(
      dealershipId,
      (payload) => {
        console.log('Metrics updated:', payload);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setMetrics(payload.new);
        }
      }
    );

    const threatsChannel = DealershipAIService.subscribeToThreats(
      dealershipId,
      (payload) => {
        console.log('Threats updated:', payload);
        if (payload.eventType === 'INSERT') {
          setThreats(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setThreats(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setThreats(prev => prev.filter(t => t.id !== payload.old.id));
        }
      }
    );

    return () => {
      metricsChannel.unsubscribe();
      threatsChannel.unsubscribe();
    };
  }, [dealershipId]);

  return {
    dealership,
    metrics,
    threats,
    loading,
    error,
    refreshData,
    refreshMetrics: fetchMetrics,
    refreshThreats: fetchThreats,
  };
}
