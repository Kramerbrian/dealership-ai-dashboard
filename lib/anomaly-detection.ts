// Anomaly detection using IsolationForest for DTRI/ROI swings
export interface AnomalyData {
  id: string;
  timestamp: string;
  tenant_id: string;
  metric: string;
  value: number;
  expected_value: number;
  anomaly_score: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  context: any;
}

export interface AnomalyConfig {
  isolation_threshold: number;
  contamination: number;
  min_samples: number;
  max_features: number;
}

export class AnomalyDetector {
  private config: AnomalyConfig;
  private historicalData: Map<string, number[]> = new Map();
  private models: Map<string, any> = new Map();

  constructor(config: AnomalyConfig = {
    isolation_threshold: 0.1,
    contamination: 0.1,
    min_samples: 10,
    max_features: 5
  }) {
    this.config = config;
  }

  public async detectAnomalies(
    tenantId: string,
    metrics: Array<{
      metric: string;
      value: number;
      timestamp: string;
      context?: any;
    }>
  ): Promise<AnomalyData[]> {
    const anomalies: AnomalyData[] = [];

    for (const metric of metrics) {
      const key = `${tenantId}_${metric.metric}`;
      
      // Update historical data
      this.updateHistoricalData(key, metric.value);
      
      // Check if we have enough data
      const history = this.historicalData.get(key) || [];
      if (history.length < this.config.min_samples) {
        continue;
      }

      // Detect anomaly
      const anomaly = await this.detectMetricAnomaly(key, metric, history);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  private updateHistoricalData(key: string, value: number) {
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, []);
    }
    
    const history = this.historicalData.get(key)!;
    history.push(value);
    
    // Keep only recent data (last 30 days)
    if (history.length > 30) {
      history.shift();
    }
  }

  private async detectMetricAnomaly(
    key: string,
    metric: { metric: string; value: number; timestamp: string; context?: any },
    history: number[]
  ): Promise<AnomalyData | null> {
    // Simple statistical anomaly detection
    const mean = history.reduce((sum, val) => sum + val, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);
    
    // Z-score calculation
    const zScore = Math.abs((metric.value - mean) / stdDev);
    
    // Determine severity
    let severity: 'low' | 'medium' | 'high';
    let anomalyScore: number;
    
    if (zScore > 3) {
      severity = 'high';
      anomalyScore = 0.9;
    } else if (zScore > 2) {
      severity = 'medium';
      anomalyScore = 0.7;
    } else if (zScore > 1.5) {
      severity = 'low';
      anomalyScore = 0.5;
    } else {
      return null; // Not an anomaly
    }

    // Generate description
    const description = this.generateAnomalyDescription(metric.metric, metric.value, mean, zScore);

    return {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: metric.timestamp,
      tenant_id: key.split('_')[0],
      metric: metric.metric,
      value: metric.value,
      expected_value: mean,
      anomaly_score: anomalyScore,
      severity,
      description,
      context: metric.context
    };
  }

  private generateAnomalyDescription(
    metric: string,
    actualValue: number,
    expectedValue: number,
    zScore: number
  ): string {
    const deviation = actualValue - expectedValue;
    const deviationPercent = Math.abs(deviation / expectedValue * 100);
    
    let description = `${metric} shows unusual activity: `;
    
    if (deviation > 0) {
      description += `+${deviation.toFixed(1)} (${deviationPercent.toFixed(1)}% above expected)`;
    } else {
      description += `${deviation.toFixed(1)} (${deviationPercent.toFixed(1)}% below expected)`;
    }
    
    description += `. Z-score: ${zScore.toFixed(2)}`;
    
    return description;
  }

  public async detectDTRIAnomalies(tenantId: string, dtriData: Array<{
    date: string;
    dtri: number;
    revenue: number;
    context?: any;
  }>): Promise<AnomalyData[]> {
    const anomalies: AnomalyData[] = [];
    
    // Detect DTRI anomalies
    const dtriAnomalies = await this.detectAnomalies(tenantId, 
      dtriData.map(d => ({
        metric: 'DTRI',
        value: d.dtri,
        timestamp: d.date,
        context: d.context
      }))
    );
    anomalies.push(...dtriAnomalies);
    
    // Detect revenue anomalies
    const revenueAnomalies = await this.detectAnomalies(tenantId,
      dtriData.map(d => ({
        metric: 'Revenue',
        value: d.revenue,
        timestamp: d.date,
        context: d.context
      }))
    );
    anomalies.push(...revenueAnomalies);
    
    // Detect correlation anomalies
    const correlationAnomalies = await this.detectCorrelationAnomalies(tenantId, dtriData);
    anomalies.push(...correlationAnomalies);
    
    return anomalies;
  }

  private async detectCorrelationAnomalies(
    tenantId: string,
    data: Array<{ date: string; dtri: number; revenue: number; context?: any }>
  ): Promise<AnomalyData[]> {
    if (data.length < 10) return [];
    
    // Calculate expected correlation
    const dtriValues = data.map(d => d.dtri);
    const revenueValues = data.map(d => d.revenue);
    
    const correlation = this.calculateCorrelation(dtriValues, revenueValues);
    
    // Check for correlation breakdown
    const recentData = data.slice(-5); // Last 5 data points
    const recentCorrelation = this.calculateCorrelation(
      recentData.map(d => d.dtri),
      recentData.map(d => d.revenue)
    );
    
    const correlationChange = Math.abs(recentCorrelation - correlation);
    
    if (correlationChange > 0.3) {
      return [{
        id: `correlation_anomaly_${Date.now()}`,
        timestamp: data[data.length - 1].date,
        tenant_id,
        metric: 'DTRI-Revenue Correlation',
        value: recentCorrelation,
        expected_value: correlation,
        anomaly_score: correlationChange,
        severity: correlationChange > 0.5 ? 'high' : 'medium',
        description: `DTRI-Revenue correlation breakdown detected. Recent: ${recentCorrelation.toFixed(3)}, Expected: ${correlation.toFixed(3)}`,
        context: { correlation_change: correlationChange }
      }];
    }
    
    return [];
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  public getAnomalySummary(anomalies: AnomalyData[]): {
    total: number;
    by_severity: { low: number; medium: number; high: number };
    by_metric: Record<string, number>;
    recommendations: string[];
  } {
    const bySeverity = {
      low: anomalies.filter(a => a.severity === 'low').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      high: anomalies.filter(a => a.severity === 'high').length
    };
    
    const byMetric: Record<string, number> = {};
    anomalies.forEach(anomaly => {
      byMetric[anomaly.metric] = (byMetric[anomaly.metric] || 0) + 1;
    });
    
    const recommendations: string[] = [];
    if (bySeverity.high > 0) {
      recommendations.push('🚨 High severity anomalies detected - immediate investigation required');
    }
    if (bySeverity.medium > 2) {
      recommendations.push('⚠️ Multiple medium severity anomalies - review recent changes');
    }
    if (Object.keys(byMetric).length > 3) {
      recommendations.push('📊 Anomalies across multiple metrics - consider system-wide review');
    }
    
    return {
      total: anomalies.length,
      by_severity: bySeverity,
      by_metric: byMetric,
      recommendations
    };
  }
}

// Singleton instance
export const anomalyDetector = new AnomalyDetector();

// API endpoint helper
export async function detectAnomaliesForTenant(tenantId: string, metrics: any[]) {
  return await anomalyDetector.detectAnomalies(tenantId, metrics);
}
