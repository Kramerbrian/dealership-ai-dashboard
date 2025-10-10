import { useState, useEffect } from 'react';
import { HistoricalPoint } from '@/types/aiv';
import { calculateModelMetrics, logBenchmark, predictAIVWithValidation } from '@/src/lib/model-validation';

/**
 * Kalman filter for smoothing AIV metrics over time
 * Provides predictive smoothing for the 8-week window
 */
function kalmanSmooth(data: HistoricalPoint[]): HistoricalPoint[] {
  if (data.length < 2) return data;
  
  let xPrev = data[0].aiv;
  let pPrev = 1;
  const q = 0.2;  // process noise
  const r = 2.0;  // measurement noise
  const smoothed: HistoricalPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const z = data[i].aiv;
    const xPred = xPrev;
    const pPred = pPrev + q;
    const k = pPred / (pPred + r);
    const xNew = xPred + k * (z - xPred);
    const pNew = (1 - k) * pPred;
    
    smoothed.push({ ...data[i], aiv: xNew });
    xPrev = xNew;
    pPrev = pNew;
  }
  
  return smoothed;
}

interface AIVMetricsResponse {
  aiv: number;
  ati: number;
  crs: number;
  elasticity_usd_per_pt: number;
  r2: number;
  deltas: {
    deltaAIV: number;
    deltaATI: number;
    deltaCRS: number;
  };
  ci95: [number, number];
  confidence: number;
  timestamp: string;
}

interface UseAIVMetricsOptions {
  domain: string;
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * Enhanced AIV Metrics hook with Kalman filtering and predictive analytics
 */
export function useAIVMetrics(options: UseAIVMetricsOptions) {
  const [data, setData] = useState<AIVMetricsResponse | null>(null);
  const [history, setHistory] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  const fetchData = async () => {
    if (!options.domain || options.enabled === false) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ai-scores?domain=${encodeURIComponent(options.domain)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: AIVMetricsResponse = await response.json();
      setData(result);
      
      // Generate mock historical data for demonstration
      const mockHistory: HistoricalPoint[] = Array.from({ length: 8 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (7 - i) * 7); // 8 weeks of data
        
        return {
          aiv: result.aiv + (Math.random() - 0.5) * 10,
          ati: result.ati + (Math.random() - 0.5) * 8,
          crs: result.crs + (Math.random() - 0.5) * 6,
          elasticity_usd_per_pt: result.elasticity_usd_per_pt + (Math.random() - 0.5) * 50,
          r2: result.r2 + (Math.random() - 0.5) * 0.1,
          timestamp: date.toISOString(),
        };
      });
      
      // Apply Kalman smoothing to historical data
      const smoothedHistory = kalmanSmooth(mockHistory);
      setHistory(smoothedHistory);
      
      // Calculate model validation metrics
      if (smoothedHistory.length >= 5) {
        const observedAIV = smoothedHistory.map(h => h.aiv);
        const predictedAIV = smoothedHistory.map((h, i) => {
          // Simple linear prediction for validation
          if (i === 0) return h.aiv;
          const prev = smoothedHistory[i - 1].aiv;
          return prev + (h.aiv - prev) * 0.8; // 80% of actual change
        });
        
        const month = new Date().toISOString().slice(0, 7);
        const metrics = calculateModelMetrics(observedAIV, predictedAIV, month, result.confidence);
        setModelMetrics(metrics);
        
        // Log benchmark
        logBenchmark(metrics);
        
        // Generate next-week prediction
        const nextWeekPrediction = predictAIVWithValidation(
          smoothedHistory.map(h => ({ aiv: h.aiv, timestamp: h.timestamp })),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        );
        setPrediction(nextWeekPrediction);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AIV metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [options.domain, options.enabled, options.refetchInterval]);

  return {
    data,
    history,
    loading,
    error,
    modelMetrics,
    prediction,
    refetch: fetchData,
  };
}
