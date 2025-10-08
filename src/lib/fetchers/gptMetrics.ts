// lib/fetchers/gptMetrics.ts
// GPT metrics fetcher with SWR integration
// Routes through dashboard proxy to Supabase with RBAC

import useSWR from 'swr';

export interface GPTMetricsResponse {
  aiv: number;
  ati: number;
  crs: number;
  elasticity: number;
  r2: number;
  drivers: {
    aiv: Array<{ feature: string; impact: number; direction: 'positive' | 'negative' }>;
    ati: Array<{ feature: string; impact: number; direction: 'positive' | 'negative' }>;
  };
  regime: 'Normal' | 'Shift Detected' | 'Quarantine';
  confidenceInterval: [number, number];
  lastUpdated: string;
}

export async function fetchGptMetrics(tenantId: string): Promise<GPTMetricsResponse> {
  const response = await fetch("/api/gpt/run", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `Compute AIV/ATI/CRS/Elasticity for tenant ${tenantId}`,
      tenantId,
      analysisType: 'comprehensive'
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT metrics fetch failed: ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
}

// SWR key factory
export const gptMetricsKey = (tenantId: string) => `/gptMetrics/${tenantId}`;

// Hook for easy usage
export function useGptMetrics(tenantId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    gptMetricsKey(tenantId),
    () => fetchGptMetrics(tenantId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    aiv: data?.aiv,
    ati: data?.ati,
    crs: data?.crs,
    elasticity: data?.elasticity,
    r2: data?.r2,
    drivers: data?.drivers,
    regime: data?.regime,
    confidenceInterval: data?.confidenceInterval,
    lastUpdated: data?.lastUpdated,
  };
}
