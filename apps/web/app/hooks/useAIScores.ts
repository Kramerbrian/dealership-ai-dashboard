'use client';

import { useState, useEffect, useCallback } from 'react';

interface AIScoresData {
  currentScores: {
    qai: number;
    piqr: number;
    ovi: number;
    vai: number;
    dtri: number;
  };
  competitiveContext: {
    competitorQAI: number;
    marketAverageQAI: number;
    industryBenchmark: number;
  };
  improvementPotential: {
    qaiImprovement: number;
    piqrReduction: number;
    oviIncrease: number;
    vaiIncrease: number;
    dtriImprovement: number;
  };
  financialImpact: {
    revenueAtRisk: number;
    marketShareGain: number;
    brandEquityIncrease: number;
  };
}

interface UseAIScoresOptions {
  domain?: string;
  dealershipSize?: 'small' | 'medium' | 'large';
  marketType?: 'urban' | 'suburban' | 'rural';
  aiAdoption?: 'low' | 'medium' | 'high';
  autoFetch?: boolean;
}

interface UseAIScoresReturn {
  data: AIScoresData | null;
  loading: boolean;
  error: string | null;
  fetchScores: (domain: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAIScores(options: UseAIScoresOptions = {}): UseAIScoresReturn {
  const {
    domain,
    dealershipSize = 'medium',
    marketType = 'suburban',
    aiAdoption = 'medium',
    autoFetch = false
  } = options;

  const [data, setData] = useState<AIScoresData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async (domainToFetch: string) => {
    if (!domainToFetch) {
      setError('Domain is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculator/ai-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domainToFetch,
          dealershipSize,
          marketType,
          aiAdoption
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch AI scores');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching AI scores:', err);
    } finally {
      setLoading(false);
    }
  }, [dealershipSize, marketType, aiAdoption]);

  const refetch = useCallback(async () => {
    if (domain) {
      await fetchScores(domain);
    }
  }, [domain, fetchScores]);

  // Auto-fetch when domain changes
  useEffect(() => {
    if (autoFetch && domain) {
      fetchScores(domain);
    }
  }, [domain, autoFetch, fetchScores]);

  return {
    data,
    loading,
    error,
    fetchScores,
    refetch
  };
}

// Hook for getting cached scores (faster, for initial load)
export function useCachedAIScores(domain?: string) {
  const [data, setData] = useState<AIScoresData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain) return;

    setLoading(true);
    setError(null);

    fetch(`/api/calculator/ai-scores?domain=${encodeURIComponent(domain)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch cached AI scores');
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching cached AI scores:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [domain]);

  return { data, loading, error };
}

// Hook for real-time score updates
export function useRealTimeAIScores(domain?: string, intervalMs: number = 30000) {
  const { data, loading, error, refetch } = useAIScores({ domain, autoFetch: true });

  useEffect(() => {
    if (!domain) return;

    const interval = setInterval(() => {
      refetch();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [domain, intervalMs, refetch]);

  return { data, loading, error, refetch };
}
