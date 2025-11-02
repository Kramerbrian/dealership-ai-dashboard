/**
 * Anomaly Detection Utilities
 * 
 * Detects unusual patterns in dashboard metrics
 */

export interface Anomaly {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CurrentData {
  trustScore: number;
  scoreDelta: number;
  traffic?: number;
  aiCitations?: number;
  competitors?: Array<{
    score: number;
    scoreDelta: number;
  }>;
  pillars?: {
    seo: number;
    aeo: number;
    geo: number;
    qai: number;
  };
}

export interface HistoricalData {
  trustScore: number;
  traffic?: number;
  aiCitations?: number;
  timestamp: Date;
}

export function detectAnomalies(
  currentData: CurrentData,
  historicalData: HistoricalData[]
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  if (historicalData.length === 0) {
    return anomalies;
  }

  // 1. Sudden score drop (>10 points in 24h)
  if (currentData.scoreDelta < -10) {
    anomalies.push({
      type: 'score-drop',
      severity: 'critical',
      message: `Trust Score dropped ${Math.abs(currentData.scoreDelta)} points in 24 hours`,
      recommendation: 'Check for recent Google My Business changes or negative reviews',
      timestamp: new Date(),
      metadata: {
        scoreDelta: currentData.scoreDelta,
        currentScore: currentData.trustScore
      }
    });
  }

  // 2. Unusual traffic pattern
  if (currentData.traffic && historicalData.length > 0) {
    const avgTraffic = historicalData.reduce((acc, d) => acc + (d.traffic || 0), 0) / historicalData.length;
    
    if (currentData.traffic < avgTraffic * 0.5) {
      anomalies.push({
        type: 'traffic-drop',
        severity: 'warning',
        message: 'Website traffic 50% below normal',
        recommendation: 'Verify your website is accessible and check for technical issues',
        timestamp: new Date(),
        metadata: {
          currentTraffic: currentData.traffic,
          averageTraffic: avgTraffic,
          dropPercentage: ((avgTraffic - currentData.traffic) / avgTraffic) * 100
        }
      });
    }
  }

  // 3. Competitor surge
  if (currentData.competitors && currentData.competitors.length > 0) {
    const competitorAvgGain = currentData.competitors.reduce(
      (acc, c) => acc + c.scoreDelta, 
      0
    ) / currentData.competitors.length;
    
    if (competitorAvgGain > 5 && currentData.scoreDelta < 2) {
      anomalies.push({
        type: 'competitive-threat',
        severity: 'warning',
        message: 'Competitors are improving faster than you',
        recommendation: 'Review their recent optimizations and adapt your strategy',
        timestamp: new Date(),
        metadata: {
          competitorAvgGain,
          yourGain: currentData.scoreDelta,
          gap: competitorAvgGain - currentData.scoreDelta
        }
      });
    }
  }

  // 4. Citation loss
  if (currentData.aiCitations && historicalData.length > 0) {
    const lastCitationCount = historicalData[0]?.aiCitations || 0;
    
    if (currentData.aiCitations < lastCitationCount * 0.7) {
      anomalies.push({
        type: 'citation-loss',
        severity: 'critical',
        message: 'AI citation frequency dropped 30%',
        recommendation: 'Update your schema markup and refresh inventory data',
        timestamp: new Date(),
        metadata: {
          currentCitations: currentData.aiCitations,
          previousCitations: lastCitationCount,
          dropPercentage: ((lastCitationCount - currentData.aiCitations) / lastCitationCount) * 100
        }
      });
    }
  }

  // 5. Pillar imbalance (one pillar significantly lower)
  if (currentData.pillars) {
    const { seo, aeo, geo, qai } = currentData.pillars;
    const avgPillar = (seo + aeo + geo + qai) / 4;
    
    Object.entries(currentData.pillars).forEach(([key, value]) => {
      if (value < avgPillar * 0.7) {
        anomalies.push({
          type: 'pillar-imbalance',
          severity: 'warning',
          message: `${key.toUpperCase()} pillar is ${((1 - value / avgPillar) * 100).toFixed(0)}% below average`,
          recommendation: `Focus on improving ${key.toUpperCase()} metrics to balance your score`,
          timestamp: new Date(),
          metadata: {
            pillar: key,
            value,
            average: avgPillar
          }
        });
      }
    });
  }

  // 6. Rapid improvement (might indicate issue or opportunity)
  if (currentData.scoreDelta > 15) {
    anomalies.push({
      type: 'rapid-improvement',
      severity: 'info',
      message: `Trust Score increased ${currentData.scoreDelta} points rapidly`,
      recommendation: 'Review recent changes to identify what drove the improvement and replicate',
      timestamp: new Date(),
      metadata: {
        scoreDelta: currentData.scoreDelta
      }
    });
  }

  return anomalies;
}

/**
 * Check for anomalies and return the most critical ones first
 */
export function getPrioritizedAnomalies(
  currentData: CurrentData,
  historicalData: HistoricalData[]
): Anomaly[] {
  const anomalies = detectAnomalies(currentData, historicalData);
  
  // Sort by severity: critical > warning > info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  
  return anomalies.sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );
}

