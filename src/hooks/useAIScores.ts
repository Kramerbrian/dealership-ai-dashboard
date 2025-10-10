/**
 * React Hook for AI Scores API
 * Provides real-time AI visibility scoring with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { AIScoresAPI, AIScoreResponse } from '@/lib/api/ai-scores';

export interface UseAIScoresOptions {
  domain?: string;
  tier?: 'basic' | 'pro' | 'ultra';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseAIScoresReturn {
  scores: AIScoreResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isHealthy: boolean;
}

export function useAIScores({
  domain,
  tier = 'pro',
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: UseAIScoresOptions = {}): UseAIScoresReturn {
  const [scores, setScores] = useState<AIScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!domain) return;

    setLoading(true);
    setError(null);

    try {
      const data = await AIScoresAPI.getScores(domain, tier);
      setScores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI scores');
    } finally {
      setLoading(false);
    }
  }, [domain, tier]);

  const checkHealth = useCallback(async () => {
    try {
      const healthy = await AIScoresAPI.checkHealth();
      setIsHealthy(healthy);
    } catch (err) {
      setIsHealthy(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchScores();
  }, [fetchScores]);

  // Initial load
  useEffect(() => {
    if (domain) {
      fetchScores();
    }
  }, [domain, fetchScores]);

  // Health check
  useEffect(() => {
    checkHealth();
    const healthInterval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(healthInterval);
  }, [checkHealth]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !domain) return;

    const interval = setInterval(fetchScores, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, domain, fetchScores, refreshInterval]);

  return {
    scores,
    loading,
    error,
    refresh,
    isHealthy
  };
}

/**
 * Hook for getting tier information
 */
export function useTiers() {
  const [tiers, setTiers] = useState(AIScoresAPI.getTiers());

  return tiers;
}

/**
 * Hook for AI score analysis
 */
export function useScoreAnalysis(scores: AIScoreResponse | null) {
  if (!scores) {
    return {
      overallStatus: 'critical' as const,
      recommendations: [],
      strengths: [],
      weaknesses: []
    };
  }

  const { ai_visibility, zero_click, ugc_health, geo_trust, sgp_integrity } = scores;
  
  // Calculate overall status
  const avgScore = Math.round((ai_visibility + zero_click + ugc_health + geo_trust + sgp_integrity) / 5);
  const overallStatus = avgScore >= 80 ? 'excellent' : avgScore >= 60 ? 'good' : avgScore >= 40 ? 'warning' : 'critical';

  // Generate recommendations
  const recommendations = [];
  if (ai_visibility < 60) {
    recommendations.push('Improve AI visibility through better content optimization');
  }
  if (zero_click < 60) {
    recommendations.push('Enhance structured data and schema markup');
  }
  if (ugc_health < 60) {
    recommendations.push('Focus on user-generated content and review management');
  }
  if (geo_trust < 60) {
    recommendations.push('Strengthen local SEO and Google My Business presence');
  }
  if (sgp_integrity < 60) {
    recommendations.push('Improve search engine optimization fundamentals');
  }

  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];
  
  if (ai_visibility >= 70) strengths.push('Strong AI visibility');
  else weaknesses.push('Low AI visibility');
  
  if (zero_click >= 70) strengths.push('Good structured data');
  else weaknesses.push('Poor structured data');
  
  if (ugc_health >= 70) strengths.push('Healthy user content');
  else weaknesses.push('Weak user content');
  
  if (geo_trust >= 70) strengths.push('Strong local presence');
  else weaknesses.push('Weak local presence');
  
  if (sgp_integrity >= 70) strengths.push('Good SEO fundamentals');
  else weaknesses.push('Poor SEO fundamentals');

  return {
    overallStatus,
    avgScore,
    recommendations,
    strengths,
    weaknesses
  };
}
