import { useState, useEffect } from 'react';
import { AIVMetrics, HistoricalPoint } from '@/context/AIVMetricsContext';

interface UseAIVMetricsOptions {
  domain: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAIVMetricsReturn {
  data: AIVMetrics | null;
  history: HistoricalPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Kalman filter for smoothing historical data
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
    
    smoothed.push({ 
      ...data[i], 
      aiv: xNew,
      // Apply same smoothing to other metrics
      ati: data[i].ati + (xNew - data[i].aiv) * 0.8,
      crs: data[i].crs + (xNew - data[i].aiv) * 0.6
    });
    
    xPrev = xNew;
    pPrev = pNew;
  }
  
  return smoothed;
}

// Generate mock historical data for demonstration
function generateMockHistory(domain: string): HistoricalPoint[] {
  const history: HistoricalPoint[] = [];
  const now = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    
    const baseAIV = 75 + Math.sin(i * 0.5) * 10 + Math.random() * 5;
    const baseATI = 70 + Math.sin(i * 0.3) * 8 + Math.random() * 4;
    const baseCRS = (baseAIV + baseATI) / 2;
    
    history.push({
      week_start: date.toISOString().split('T')[0],
      aiv: Math.max(0, Math.min(100, baseAIV)),
      ati: Math.max(0, Math.min(100, baseATI)),
      crs: Math.max(0, Math.min(100, baseCRS)),
      elasticity_usd_per_pt: 120 + Math.random() * 50,
      r2: 0.75 + Math.random() * 0.2
    });
  }
  
  return history;
}

export function useAIVMetrics({ 
  domain, 
  autoRefresh = false, 
  refreshInterval = 30000 
}: UseAIVMetricsOptions): UseAIVMetricsReturn {
  const [data, setData] = useState<AIVMetrics | null>(null);
  const [history, setHistory] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current metrics
      const response = await fetch(`/api/ai-scores?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metricsData: AIVMetrics = await response.json();
      setData(metricsData);
      
      // Generate and smooth historical data
      const rawHistory = generateMockHistory(domain);
      const smoothedHistory = kalmanSmooth(rawHistory);
      setHistory(smoothedHistory);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AIV metrics');
      console.error('Error fetching AIV metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [domain]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, domain]);
  
  return {
    data,
    history,
    loading,
    error,
    refetch: fetchData
  };
}