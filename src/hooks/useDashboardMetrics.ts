import { useQuery } from '@tanstack/react-query';

export function useDashboardMetrics(dealerId: string) {
  return useQuery({
    queryKey: ['dashboard-metrics', dealerId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/metrics?dealerId=${dealerId}`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useTrendData(dealerId: string, days: number = 180) {
  return useQuery({
    queryKey: ['trend-data', dealerId, days],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/trends?dealerId=${dealerId}&days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch trends');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompetitorData(dealerId: string) {
  return useQuery({
    queryKey: ['competitors', dealerId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/competitors?dealerId=${dealerId}`);
      if (!res.ok) throw new Error('Failed to fetch competitors');
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
