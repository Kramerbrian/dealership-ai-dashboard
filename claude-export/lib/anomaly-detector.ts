// Anomaly detection system for weekly metrics
export interface MetricData {
  timestamp: Date;
  value: number;
  metric: string;
  tenantId: string;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  method: 'zscore' | 'iqr' | 'isolation' | 'seasonal';
  threshold: number;
  confidence: number;
  explanation: string;
  recommendation: string;
}

export interface AnomalyConfig {
  zScoreThreshold: number;
  iqrMultiplier: number;
  isolationContamination: number;
  seasonalWindow: number;
  minDataPoints: number;
}

export class AnomalyDetector {
  private config: AnomalyConfig = {
    zScoreThreshold: 2.5,
    iqrMultiplier: 1.5,
    isolationContamination: 0.1,
    seasonalWindow: 4, // weeks
    minDataPoints: 8
  };

  // Detect anomalies using multiple methods
  detectAnomalies(data: MetricData[]): AnomalyResult[] {
    if (data.length < this.config.minDataPoints) {
      return [];
    }

    const results: AnomalyResult[] = [];
    const values = data.map(d => d.value);
    const timestamps = data.map(d => d.timestamp);

    // Z-Score method
    const zScoreResult = this.detectZScoreAnomalies(values, timestamps);
    results.push(...zScoreResult);

    // IQR method
    const iqrResult = this.detectIQRAnomalies(values, timestamps);
    results.push(...iqrResult);

    // Isolation Forest method (simplified)
    const isolationResult = this.detectIsolationAnomalies(values, timestamps);
    results.push(...isolationResult);

    // Seasonal decomposition method
    const seasonalResult = this.detectSeasonalAnomalies(values, timestamps);
    results.push(...seasonalResult);

    return results;
  }

  // Z-Score anomaly detection
  private detectZScoreAnomalies(values: number[], timestamps: Date[]): AnomalyResult[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return [];

    const results: AnomalyResult[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const zScore = Math.abs((values[i] - mean) / stdDev);
      const isAnomaly = zScore > this.config.zScoreThreshold;
      
      if (isAnomaly) {
        results.push({
          isAnomaly: true,
          score: zScore,
          method: 'zscore',
          threshold: this.config.zScoreThreshold,
          confidence: Math.min(0.95, zScore / (this.config.zScoreThreshold * 2)),
          explanation: `Z-score of ${zScore.toFixed(2)} exceeds threshold of ${this.config.zScoreThreshold}`,
          recommendation: this.getZScoreRecommendation(zScore, values[i], mean)
        });
      }
    }

    return results;
  }

  // IQR (Interquartile Range) anomaly detection
  private detectIQRAnomalies(values: number[], timestamps: Date[]): AnomalyResult[] {
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = this.percentile(sortedValues, 25);
    const q3 = this.percentile(sortedValues, 75);
    const iqr = q3 - q1;

    if (iqr === 0) return [];

    const lowerBound = q1 - this.config.iqrMultiplier * iqr;
    const upperBound = q3 + this.config.iqrMultiplier * iqr;

    const results: AnomalyResult[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const isAnomaly = values[i] < lowerBound || values[i] > upperBound;
      
      if (isAnomaly) {
        const distance = Math.min(
          Math.abs(values[i] - lowerBound),
          Math.abs(values[i] - upperBound)
        );
        const score = distance / iqr;
        
        results.push({
          isAnomaly: true,
          score,
          method: 'iqr',
          threshold: this.config.iqrMultiplier,
          confidence: Math.min(0.9, score / 2),
          explanation: `Value ${values[i]} is outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
          recommendation: this.getIQRRecommendation(values[i], lowerBound, upperBound)
        });
      }
    }

    return results;
  }

  // Simplified Isolation Forest anomaly detection
  private detectIsolationAnomalies(values: number[], timestamps: Date[]): AnomalyResult[] {
    // Simplified version - in production, use a proper isolation forest library
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return [];

    const results: AnomalyResult[] = [];
    
    for (let i = 0; i < values.length; i++) {
      // Simple isolation score based on distance from mean
      const isolationScore = Math.abs(values[i] - mean) / stdDev;
      const isAnomaly = isolationScore > (this.config.zScoreThreshold * 0.8); // Slightly more sensitive
      
      if (isAnomaly) {
        results.push({
          isAnomaly: true,
          score: isolationScore,
          method: 'isolation',
          threshold: this.config.zScoreThreshold * 0.8,
          confidence: Math.min(0.85, isolationScore / 3),
          explanation: `Isolation score of ${isolationScore.toFixed(2)} indicates outlier`,
          recommendation: this.getIsolationRecommendation(isolationScore, values[i], mean)
        });
      }
    }

    return results;
  }

  // Seasonal decomposition anomaly detection
  private detectSeasonalAnomalies(values: number[], timestamps: Date[]): AnomalyResult[] {
    if (values.length < this.config.seasonalWindow * 2) return [];

    const results: AnomalyResult[] = [];
    
    // Simple seasonal decomposition
    const seasonalPattern = this.calculateSeasonalPattern(values, this.config.seasonalWindow);
    const trend = this.calculateTrend(values);
    
    for (let i = this.config.seasonalWindow; i < values.length; i++) {
      const expectedValue = trend[i] + seasonalPattern[i % this.config.seasonalWindow];
      const residual = Math.abs(values[i] - expectedValue);
      const residualStd = this.calculateResidualStd(values, expectedValue, i - this.config.seasonalWindow, i);
      
      if (residualStd > 0) {
        const zScore = residual / residualStd;
        const isAnomaly = zScore > this.config.zScoreThreshold;
        
        if (isAnomaly) {
          results.push({
            isAnomaly: true,
            score: zScore,
            method: 'seasonal',
            threshold: this.config.zScoreThreshold,
            confidence: Math.min(0.9, zScore / 3),
            explanation: `Seasonal residual of ${residual.toFixed(2)} exceeds expected pattern`,
            recommendation: this.getSeasonalRecommendation(zScore, values[i], expectedValue)
          });
        }
      }
    }

    return results;
  }

  // Helper methods
  private percentile(sortedValues: number[], p: number): number {
    const index = (p / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private calculateSeasonalPattern(values: number[], window: number): number[] {
    const pattern = new Array(window).fill(0);
    const counts = new Array(window).fill(0);
    
    for (let i = 0; i < values.length; i++) {
      const index = i % window;
      pattern[index] += values[i];
      counts[index]++;
    }
    
    for (let i = 0; i < window; i++) {
      if (counts[i] > 0) {
        pattern[i] /= counts[i];
      }
    }
    
    return pattern;
  }

  private calculateTrend(values: number[]): number[] {
    // Simple linear trend calculation
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return x.map(xi => slope * xi + intercept);
  }

  private calculateResidualStd(values: number[], expected: number[], start: number, end: number): number {
    const residuals = values.slice(start, end).map((val, i) => val - expected);
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const variance = residuals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / residuals.length;
    return Math.sqrt(variance);
  }

  // Recommendation methods
  private getZScoreRecommendation(zScore: number, value: number, mean: number): string {
    if (value > mean) {
      return `High value detected (${zScore.toFixed(1)}σ above mean). Investigate positive factors.`;
    } else {
      return `Low value detected (${zScore.toFixed(1)}σ below mean). Check for issues or external factors.`;
    }
  }

  private getIQRRecommendation(value: number, lowerBound: number, upperBound: number): string {
    if (value > upperBound) {
      return `Value exceeds upper IQR bound. Review for data quality or exceptional performance.`;
    } else {
      return `Value below lower IQR bound. Investigate potential data issues or performance problems.`;
    }
  }

  private getIsolationRecommendation(score: number, value: number, mean: number): string {
    return `Isolated data point detected. Verify data accuracy and investigate contributing factors.`;
  }

  private getSeasonalRecommendation(zScore: number, value: number, expected: number): string {
    if (value > expected) {
      return `Positive seasonal anomaly. Analyze what drove above-expected performance.`;
    } else {
      return `Negative seasonal anomaly. Investigate factors causing below-expected performance.`;
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<AnomalyConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): AnomalyConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const anomalyDetector = new AnomalyDetector();
