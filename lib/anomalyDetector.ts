// Simple diff-based anomaly detector for weekly metrics
export type MetricSeries = { label: string; values: number[] };

export function detectAnomalies(series: MetricSeries[], thresholdPct = 10) {
  return series.flatMap(s => {
    const res: { metric: string; delta: number; dir: 'up' | 'down'; week: number }[] = [];
    
    for (let i = 1; i < s.values.length; i++) {
      const prev = s.values[i - 1];
      const curr = s.values[i];
      
      // Skip if either value is null/undefined/zero
      if (prev == null || curr == null || prev === 0) continue;
      
      const delta = ((curr - prev) / Math.max(1, Math.abs(prev))) * 100;
      
      if (Math.abs(delta) >= thresholdPct) {
        res.push({
          metric: s.label,
          delta: +delta.toFixed(1),
          dir: delta > 0 ? 'up' : 'down',
          week: i
        });
      }
    }
    
    return res;
  });
}

// Enhanced anomaly detection with trend analysis
export function detectTrendAnomalies(series: MetricSeries[], thresholdPct = 10, minDataPoints = 3) {
  return series.flatMap(s => {
    const res: { 
      metric: string; 
      delta: number; 
      dir: 'up' | 'down'; 
      week: number;
      severity: 'low' | 'medium' | 'high';
      trend: 'accelerating' | 'decelerating' | 'stable';
    }[] = [];
    
    if (s.values.length < minDataPoints) return res;
    
    for (let i = 2; i < s.values.length; i++) {
      const prev = s.values[i - 1];
      const curr = s.values[i];
      const prevPrev = s.values[i - 2];
      
      if (prev == null || curr == null || prevPrev == null || prev === 0) continue;
      
      const delta = ((curr - prev) / Math.max(1, Math.abs(prev))) * 100;
      const prevDelta = ((prev - prevPrev) / Math.max(1, Math.abs(prevPrev))) * 100;
      
      if (Math.abs(delta) >= thresholdPct) {
        // Determine severity based on magnitude
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (Math.abs(delta) >= thresholdPct * 2) severity = 'high';
        else if (Math.abs(delta) >= thresholdPct * 1.5) severity = 'medium';
        
        // Determine trend direction
        let trend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
        if (Math.abs(delta) > Math.abs(prevDelta) * 1.2) trend = 'accelerating';
        else if (Math.abs(delta) < Math.abs(prevDelta) * 0.8) trend = 'decelerating';
        
        res.push({
          metric: s.label,
          delta: +delta.toFixed(1),
          dir: delta > 0 ? 'up' : 'down',
          week: i,
          severity,
          trend
        });
      }
    }
    
    return res;
  });
}

// Anomaly scoring for prioritization
export function scoreAnomaly(anomaly: { delta: number; severity: string; trend: string }): number {
  let score = Math.abs(anomaly.delta);
  
  // Severity multiplier
  const severityMultiplier = {
    'low': 1,
    'medium': 1.5,
    'high': 2
  }[anomaly.severity as keyof typeof severityMultiplier] || 1;
  
  // Trend multiplier
  const trendMultiplier = {
    'accelerating': 1.3,
    'stable': 1,
    'decelerating': 0.8
  }[anomaly.trend as keyof typeof trendMultiplier] || 1;
  
  return score * severityMultiplier * trendMultiplier;
}

// Get top anomalies by score
export function getTopAnomalies(series: MetricSeries[], limit = 5): Array<{
  metric: string;
  delta: number;
  dir: 'up' | 'down';
  week: number;
  severity: 'low' | 'medium' | 'high';
  trend: 'accelerating' | 'decelerating' | 'stable';
  score: number;
}> {
  const anomalies = detectTrendAnomalies(series);
  return anomalies
    .map(a => ({ ...a, score: scoreAnomaly(a) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}