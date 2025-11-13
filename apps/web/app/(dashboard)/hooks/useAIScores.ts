"use client";

import useSWR from "swr";
import { getApiBase } from "@/lib/apiConfig";

export type PlatformBreakdown = {
  platform: string;
  score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type KPIScoreboard = {
  QAI_star: number;
  VAI_Penalized: number;
  PIQR: number;
  HRP: number;
  OCI: number;
};

export type AIScoresResponse = {
  timestamp: string;
  model_version: string;
  dealerId: string;
  aiv_score: number; // 0-1 (or percentage 0-100)
  ati_score: number; // 0-1 (or percentage 0-100)
  crs: number; // 0-1 (or percentage 0-100)
  kpi_scoreboard: KPIScoreboard;
  platform_breakdown: PlatformBreakdown[];
  zero_click_inclusion_rate: number;
  ugc_health_score: number;
  revenue_at_risk_monthly_usd: number;
  aiv_formula_reference?: string;
  status: string;
  // Alternative format (from API proxy)
  aivati_composite?: {
    AIV: number;
    ATI: number;
    CRS: number;
  };
};

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
});

export function useAIScores(domain?: string, dealerId?: string) {
  const base = getApiBase();
  const params = new URLSearchParams();
  if (domain) params.set('origin', domain.startsWith('http') ? domain : `https://${domain}`);
  if (dealerId) params.set('dealerId', dealerId);
  
  const key = domain || dealerId 
    ? `${base}/ai-scores?${params.toString()}` 
    : null;
    
  const { data, error, isLoading, mutate } = useSWR<AIScoresResponse>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000, // 5 minutes
  });

  return {
    scores: data,
    error,
    loading: isLoading,
    refresh: mutate
  };
}

