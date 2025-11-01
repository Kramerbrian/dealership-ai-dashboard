/**
 * Pulse Trends - Trend analysis and velocity calculation
 * Analyzes historical pulse scores to identify trends, velocity, and acceleration
 */

import { PulseEngine, type PulseEngineConfig } from '@/lib/pulse/engine';
import type { PulseScoreOutput } from '@/lib/ai/formulas';

export interface TrendDataPoint {
  timestamp: Date;
  pulseScore: number;
  signals: {
    aiv: number;
    ati: number;
    zero_click: number;
    ugc_health: number;
    geo_trust: number;
  };
}

export interface TrendAnalysis {
  dealerId: string;
  timeRange: {
    start: Date;
    end: Date;
    days: number;
  };
  current: {
    score: number;
    signals: Record<string, number>;
  };
  trend: {
    direction: 'up' | 'down' | 'stable';
    velocity: number; // Points per day
    acceleration: number; // Points per day²
    confidence: number; // 0-1
  };
  historical: TrendDataPoint[];
  forecast: {
    next7Days: number;
    next30Days: number;
    confidence: number;
  };
  insights: string[];
  timestamp: Date;
}

/**
 * Calculate trends from historical pulse score data
 */
export async function calculateTrends(
  dealerId: string,
  historicalData: TrendDataPoint[],
  currentSignals?: PulseEngineConfig['signals']
): Promise<TrendAnalysis> {
  // Sort data by timestamp
  const sortedData = [...historicalData].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  if (sortedData.length === 0) {
    throw new Error('No historical data provided for trend analysis');
  }

  // Get current score
  let currentScore: PulseScoreOutput;
  if (currentSignals) {
    const engine = new PulseEngine(dealerId);
    currentScore = await engine.calculate({
      dealerId,
      signals: currentSignals,
    });
  } else {
    // Use most recent historical data point
    const latest = sortedData[sortedData.length - 1];
    currentScore = {
      pulse_score: latest.pulseScore,
      signals: latest.signals,
      trends: { direction: 'stable', velocity: 0, acceleration: 0 },
      recommendations: [],
      confidence: 0.85,
      timestamp: new Date(),
    };
  }

  // Calculate time range
  const start = sortedData[0].timestamp;
  const end = sortedData[sortedData.length - 1].timestamp;
  const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate velocity using linear regression
  const { velocity, acceleration, confidence } = calculateVelocityAndAcceleration(sortedData);

  // Determine trend direction
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(velocity) > 0.5) {
    direction = velocity > 0 ? 'up' : 'down';
  }

  // Generate forecast
  const forecast = {
    next7Days: Math.max(0, Math.min(100, currentScore.pulse_score + velocity * 7)),
    next30Days: Math.max(0, Math.min(100, currentScore.pulse_score + velocity * 30)),
    confidence: Math.max(0.3, confidence * 0.8), // Reduce confidence for forecasts
  };

  // Generate insights
  const insights: string[] = [];
  
  const velocityStr = velocity.toFixed(1);
  if (direction === 'up' && velocity > 1) {
    insights.push('Strong upward trend: +' + velocityStr + ' points/day');
  } else if (direction === 'down' && velocity < -1) {
    insights.push('Concerning downward trend: ' + velocityStr + ' points/day');
  } else {
    insights.push('Score is relatively stable');
  }

  if (acceleration > 0.1) {
    insights.push('Improvement is accelerating');
  } else if (acceleration < -0.1) {
    insights.push('Decline is accelerating - immediate action needed');
  }

  if (forecast.next30Days > 85) {
    insights.push('On track to reach optimal threshold');
  } else if (forecast.next30Days < 50) {
    insights.push('Risk of falling into critical zone');
  }

  // Analyze signal-specific trends
  const signalTrends = analyzeSignalTrends(sortedData);
  if (signalTrends.weakest) {
    insights.push('Focus area: ' + signalTrends.weakest + ' showing decline');
  }
  if (signalTrends.strongest) {
    insights.push('Strength: ' + signalTrends.strongest + ' performing well');
  }

  return {
    dealerId,
    timeRange: { start, end, days },
    current: {
      score: currentScore.pulse_score,
      signals: currentScore.signals,
    },
    trend: {
      direction,
      velocity: Math.round(velocity * 100) / 100,
      acceleration: Math.round(acceleration * 1000) / 1000,
      confidence: Math.round(confidence * 100) / 100,
    },
    historical: sortedData,
    forecast,
    insights,
    timestamp: new Date(),
  };
}

/**
 * Calculate velocity and acceleration using linear regression
 */
function calculateVelocityAndAcceleration(data: TrendDataPoint[]): {
  velocity: number;
  acceleration: number;
  confidence: number;
} {
  if (data.length < 2) {
    return { velocity: 0, acceleration: 0, confidence: 0 };
  }

  // Convert timestamps to days from start
  const startTime = data[0].timestamp.getTime();
  const points = data.map((d) => ({
    x: (d.timestamp.getTime() - startTime) / (1000 * 60 * 60 * 24),
    y: d.pulseScore,
  }));

  // Linear regression for velocity
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const velocity = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Calculate R² for confidence
  const meanY = sumY / n;
  const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
  const ssRes = points.reduce(
    (sum, p) => sum + Math.pow(p.y - (velocity * p.x + (sumY - velocity * sumX) / n), 2),
    0
  );
  const rSquared = 1 - ssRes / ssTotal;
  const confidence = Math.max(0, Math.min(1, rSquared));

  // Calculate acceleration (change in velocity over time)
  let acceleration = 0;
  if (n >= 4) {
    const midpoint = Math.floor(n / 2);
    const firstHalf = points.slice(0, midpoint);
    const secondHalf = points.slice(midpoint);

    const v1 = calculateSimpleVelocity(firstHalf);
    const v2 = calculateSimpleVelocity(secondHalf);
    const timeDiff = secondHalf[0].x - firstHalf[firstHalf.length - 1].x;

    if (timeDiff > 0) {
      acceleration = (v2 - v1) / timeDiff;
    }
  }

  return { velocity, acceleration, confidence };
}

/**
 * Calculate simple velocity for a subset of data
 */
function calculateSimpleVelocity(points: { x: number; y: number }[]): number {
  if (points.length < 2) return 0;

  const first = points[0];
  const last = points[points.length - 1];
  const timeDiff = last.x - first.x;

  return timeDiff > 0 ? (last.y - first.y) / timeDiff : 0;
}

/**
 * Analyze trends for individual signals
 */
function analyzeSignalTrends(data: TrendDataPoint[]): {
  strongest?: string;
  weakest?: string;
} {
  if (data.length < 2) {
    return {};
  }

  const signalNames = ['aiv', 'ati', 'zero_click', 'ugc_health', 'geo_trust'] as const;
  const signalChanges: Record<string, number> = {};

  for (const signal of signalNames) {
    const first = data[0].signals[signal];
    const last = data[data.length - 1].signals[signal];
    signalChanges[signal] = last - first;
  }

  const sorted = Object.entries(signalChanges).sort((a, b) => b[1] - a[1]);

  return {
    strongest: sorted[0][1] > 0 ? formatSignalName(sorted[0][0]) : undefined,
    weakest: sorted[sorted.length - 1][1] < -5 ? formatSignalName(sorted[sorted.length - 1][0]) : undefined,
  };
}

/**
 * Format signal name for display
 */
function formatSignalName(signal: string): string {
  const nameMap: Record<string, string> = {
    aiv: 'AI Visibility',
    ati: 'Algorithmic Trust',
    zero_click: 'Zero-Click Defense',
    ugc_health: 'UGC Health',
    geo_trust: 'Geo Trust',
  };
  return nameMap[signal] || signal;
}

// Export types
export type { TrendDataPoint };
