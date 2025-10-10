"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface AIVMetrics {
  aiv: number;
  ati: number;
  crs: number;
  elasticity_usd_per_pt: number;
  r2: number;
  deltas?: {
    deltaAIV: number;
    deltaATI: number;
    deltaCRS: number;
  };
  ci95?: [number, number];
}

export interface HistoricalPoint {
  week_start: string;
  aiv: number;
  ati: number;
  crs: number;
  elasticity_usd_per_pt: number;
  r2: number;
}

interface AIVContextType {
  data: AIVMetrics | null;
  history: HistoricalPoint[];
  setData: (d: AIVMetrics | null) => void;
  setHistory: (h: HistoricalPoint[]) => void;
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AIVMetricsContext = createContext<AIVContextType | null>(null);

export function AIVMetricsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AIVMetrics | null>(null);
  const [history, setHistory] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AIVMetricsContext.Provider 
      value={{ 
        data, 
        history, 
        setData, 
        setHistory, 
        loading, 
        error, 
        setLoading, 
        setError 
      }}
    >
      {children}
    </AIVMetricsContext.Provider>
  );
}

export function useAIVContext() {
  const ctx = useContext(AIVMetricsContext);
  if (!ctx) throw new Error("useAIVContext must be used inside AIVMetricsProvider");
  return ctx;
}