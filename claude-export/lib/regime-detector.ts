// Regime Detector for algorithm shift detection
export interface RegimeData {
  timestamp: Date;
  aiv: number;
  ati: number;
  crs: number;
  elasticity: number;
  marketConditions?: number;
  competitorActivity?: number;
}

export interface RegimeState {
  state: 'Normal' | 'ShiftDetected' | 'Quarantine';
  confidence: number;
  reason: string;
  detectedAt: Date;
  metrics: {
    volatility: number;
    trend: number;
    anomaly: number;
  };
}

export class RegimeDetector {
  private historicalData: RegimeData[] = [];
  private currentRegime: RegimeState | null = null;
  private readonly windowSize = 20; // Number of data points to analyze
  private readonly volatilityThreshold = 0.15; // 15% volatility threshold
  private readonly trendThreshold = 0.20; // 20% trend change threshold
  private readonly anomalyThreshold = 2.5; // Z-score threshold for anomalies

  // Add new data point
  addDataPoint(data: RegimeData) {
    this.historicalData.push(data);
    
    // Keep only recent data
    if (this.historicalData.length > this.windowSize * 2) {
      this.historicalData = this.historicalData.slice(-this.windowSize * 2);
    }

    // Detect regime changes
    this.detectRegimeChange();
  }

  // Detect regime changes using multiple statistical methods
  private detectRegimeChange() {
    if (this.historicalData.length < this.windowSize) {
      return;
    }

    const recent = this.historicalData.slice(-this.windowSize);
    const previous = this.historicalData.slice(-this.windowSize * 2, -this.windowSize);

    if (previous.length === 0) {
      this.currentRegime = {
        state: 'Normal',
        confidence: 1.0,
        reason: 'Insufficient historical data',
        detectedAt: new Date(),
        metrics: { volatility: 0, trend: 0, anomaly: 0 }
      };
      return;
    }

    // Calculate regime metrics
    const volatility = this.calculateVolatility(recent);
    const trend = this.calculateTrendChange(recent, previous);
    const anomaly = this.calculateAnomalyScore(recent);

    // Determine regime state
    let state: 'Normal' | 'ShiftDetected' | 'Quarantine' = 'Normal';
    let reason = 'Normal operation';
    let confidence = 1.0;

    if (anomaly > this.anomalyThreshold) {
      state = 'Quarantine';
      reason = `High anomaly score detected: ${anomaly.toFixed(2)}`;
      confidence = Math.min(0.9, anomaly / (this.anomalyThreshold * 2));
    } else if (volatility > this.volatilityThreshold || Math.abs(trend) > this.trendThreshold) {
      state = 'ShiftDetected';
      reason = `Algorithm shift detected - Volatility: ${(volatility * 100).toFixed(1)}%, Trend: ${(trend * 100).toFixed(1)}%`;
      confidence = Math.min(0.8, (volatility + Math.abs(trend)) / 0.4);
    }

    this.currentRegime = {
      state,
      confidence,
      reason,
      detectedAt: new Date(),
      metrics: { volatility, trend, anomaly }
    };
  }

  // Calculate volatility using coefficient of variation
  private calculateVolatility(data: RegimeData[]): number {
    const aivValues = data.map(d => d.aiv);
    const mean = aivValues.reduce((a, b) => a + b, 0) / aivValues.length;
    const variance = aivValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / aivValues.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0;
  }

  // Calculate trend change between two periods
  private calculateTrendChange(recent: RegimeData[], previous: RegimeData[]): number {
    const recentTrend = this.calculateTrend(recent);
    const previousTrend = this.calculateTrend(previous);
    
    return previousTrend !== 0 ? (recentTrend - previousTrend) / Math.abs(previousTrend) : 0;
  }

  // Calculate linear trend using simple regression
  private calculateTrend(data: RegimeData[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.aiv);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // Calculate anomaly score using Z-score
  private calculateAnomalyScore(data: RegimeData[]): number {
    if (data.length < 3) return 0;

    const aivValues = data.map(d => d.aiv);
    const mean = aivValues.reduce((a, b) => a + b, 0) / aivValues.length;
    const variance = aivValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / aivValues.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Calculate Z-scores for recent values
    const recentValues = aivValues.slice(-5); // Last 5 values
    const zScores = recentValues.map(val => Math.abs((val - mean) / stdDev));
    
    // Return maximum Z-score
    return Math.max(...zScores);
  }

  // Get current regime state
  getCurrentRegime(): RegimeState | null {
    return this.currentRegime;
  }

  // Get regime history
  getRegimeHistory(): RegimeState[] {
    // In a real implementation, this would return historical regime states
    return this.currentRegime ? [this.currentRegime] : [];
  }

  // Check if system is in quarantine
  isInQuarantine(): boolean {
    return this.currentRegime?.state === 'Quarantine';
  }

  // Check if shift is detected
  isShiftDetected(): boolean {
    return this.currentRegime?.state === 'ShiftDetected';
  }

  // Get regime metrics for dashboard
  getRegimeMetrics() {
    if (!this.currentRegime) {
      return {
        state: 'Normal',
        confidence: 1.0,
        volatility: 0,
        trend: 0,
        anomaly: 0,
        reason: 'No data available'
      };
    }

    return {
      state: this.currentRegime.state,
      confidence: this.currentRegime.confidence,
      volatility: this.currentRegime.metrics.volatility,
      trend: this.currentRegime.metrics.trend,
      anomaly: this.currentRegime.metrics.anomaly,
      reason: this.currentRegime.reason,
      detectedAt: this.currentRegime.detectedAt
    };
  }

  // Reset regime detector
  reset() {
    this.historicalData = [];
    this.currentRegime = null;
  }
}

// Export singleton instance
export const regimeDetector = new RegimeDetector();
