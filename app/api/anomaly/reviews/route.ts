/**
 * FraudGuard API endpoint for anomaly detection in review data
 * Implements 4σ outlier detection and fraud pattern analysis
 * Part of the closed-loop analytics system
 */

import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client only if environment variables are available
let supabase: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.warn('Supabase client initialization failed:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealerId, analysisPeriod = 30, threshold = 4 } = body; // days, sigma threshold

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      );
    }

    // Get review data for analysis period
    let reviewData: any[] = [];
    
    if (supabase) {
      const { data, error: reviewError } = await supabase
        .from('aiv_raw_signals')
        .select('*')
        .eq('dealer_id', dealerId)
        .gte('date', new Date(Date.now() - analysisPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (reviewError) {
        console.error('Error fetching review data:', reviewError);
        return NextResponse.json(
          { error: 'Failed to fetch review data' },
          { status: 500 }
        );
      }
      
      reviewData = data || [];
    } else {
      // Mock data when Supabase is not configured
      reviewData = generateMockReviewData(analysisPeriod);
    }

    if (reviewData.length < 5) {
      return NextResponse.json(
        { error: 'Insufficient review data for analysis' },
        { status: 400 }
      );
    }

    // Perform anomaly detection
    const anomalyResults = performAnomalyDetection(reviewData, threshold);

    // Get historical fraud patterns for comparison
    let historicalPatterns: any[] = [];
    
    if (supabase) {
      const { data } = await supabase
        .from('model_audit')
        .select('*')
        .eq('run_type', 'fraud_audit')
        .eq('dealer_id', dealerId)
        .order('run_date', { ascending: false })
        .limit(10);
      
      historicalPatterns = data || [];
    } else {
      // Mock historical patterns
      historicalPatterns = generateMockHistoricalPatterns();
    }

    // Calculate fraud risk score
    const fraudRiskScore = calculateFraudRiskScore(anomalyResults, historicalPatterns);

    // Log audit results
    let auditResult: any = null;
    
    if (supabase) {
      const { data, error: auditError } = await supabase
        .from('model_audit')
        .insert({
          run_type: 'fraud_audit',
          dealer_id: dealerId,
          rmse: anomalyResults.anomalyScore,
          mape: anomalyResults.fraudProbability,
          r2: fraudRiskScore,
          delta_accuracy: anomalyResults.anomalyCount,
          accuracy_gain_mom: anomalyResults.severityScore,
          model_version: 'fraudGuard-v1.0',
          notes: `FraudGuard audit over ${analysisPeriod} days with ${threshold}σ threshold`,
          metadata: {
            analysis_period_days: analysisPeriod,
            threshold_sigma: threshold,
            anomaly_breakdown: anomalyResults.anomalyBreakdown,
            fraud_indicators: anomalyResults.fraudIndicators,
            risk_assessment: {
              overall_risk: fraudRiskScore > 0.7 ? 'high' : fraudRiskScore > 0.4 ? 'medium' : 'low',
              confidence: anomalyResults.confidence,
              recommended_actions: anomalyResults.recommendedActions
            }
          }
        })
        .select()
        .single();

      if (auditError) {
        console.error('Error logging fraud audit:', auditError);
        return NextResponse.json(
          { error: 'Failed to log fraud audit results' },
          { status: 500 }
        );
      }
      
      auditResult = data;
    } else {
      // Mock audit result
      auditResult = { run_id: `audit-${Date.now()}` };
    }

    return NextResponse.json({
      success: true,
      data: {
        fraud_risk_assessment: {
          overall_risk_score: fraudRiskScore,
          risk_level: fraudRiskScore > 0.7 ? 'high' : fraudRiskScore > 0.4 ? 'medium' : 'low',
          confidence: anomalyResults.confidence,
          last_updated: new Date().toISOString()
        },
        anomaly_detection: {
          total_anomalies: anomalyResults.anomalyCount,
          severity_score: anomalyResults.severityScore,
          anomaly_score: anomalyResults.anomalyScore,
          threshold_used: threshold,
          detection_method: '4σ_outlier_detection'
        },
        fraud_indicators: anomalyResults.fraudIndicators,
        anomaly_breakdown: anomalyResults.anomalyBreakdown,
        recommended_actions: anomalyResults.recommendedActions,
        analysis_period: {
          days: analysisPeriod,
          sample_size: reviewData.length,
          date_range: {
            start: reviewData[0].date,
            end: reviewData[reviewData.length - 1].date
          }
        },
        historical_context: historicalPatterns ? {
          previous_audits: historicalPatterns.length,
          trend: calculateFraudTrend(historicalPatterns),
          baseline_risk: calculateBaselineRisk(historicalPatterns)
        } : null
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model_version: 'fraudGuard-v1.0',
        audit_id: auditResult.run_id,
        analysis_type: 'comprehensive_fraud_detection'
      }
    });

  } catch (error) {
    console.error('Error in /api/anomaly/reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Perform comprehensive anomaly detection using multiple methods
 */
function performAnomalyDetection(data: any[], threshold: number) {
  const anomalies: any[] = [];
  const fraudIndicators: string[] = [];
  const recommendedActions: string[] = [];

  // Extract metrics for analysis
  const metrics = {
    aiv: data.map(d => d.observed_aiv || 0),
    rar: data.map(d => d.observed_rar || 0),
    seo: data.map(d => d.seo || 0),
    aeo: data.map(d => d.aeo || 0),
    geo: data.map(d => d.geo || 0),
    ugc: data.map(d => d.ugc || 0),
    geolocal: data.map(d => d.geolocal || 0)
  };

  // 1. Statistical Outlier Detection (4σ method)
  const statisticalAnomalies = detectStatisticalAnomalies(metrics, threshold);
  anomalies.push(...statisticalAnomalies);

  // 2. Temporal Anomaly Detection
  const temporalAnomalies = detectTemporalAnomalies(data);
  anomalies.push(...temporalAnomalies);

  // 3. Pattern-based Fraud Detection
  const patternAnomalies = detectPatternAnomalies(data);
  anomalies.push(...patternAnomalies);

  // 4. Cross-metric Correlation Analysis
  const correlationAnomalies = detectCorrelationAnomalies(metrics);
  anomalies.push(...correlationAnomalies);

  // Analyze fraud indicators
  analyzeFraudIndicators(anomalies, fraudIndicators, recommendedActions);

  // Calculate overall scores
  const anomalyCount = anomalies.length;
  const severityScore = calculateSeverityScore(anomalies);
  const anomalyScore = calculateAnomalyScore(anomalies, data.length);
  const confidence = calculateConfidence(anomalies, data.length);

  return {
    anomalies,
    anomalyCount,
    severityScore,
    anomalyScore,
    confidence,
    fraudIndicators,
    recommendedActions,
    anomalyBreakdown: {
      statistical: statisticalAnomalies.length,
      temporal: temporalAnomalies.length,
      pattern: patternAnomalies.length,
      correlation: correlationAnomalies.length
    }
  };
}

/**
 * Detect statistical anomalies using 4σ method
 */
function detectStatisticalAnomalies(metrics: any, threshold: number) {
  const anomalies: any[] = [];

  Object.entries(metrics).forEach(([metric, values]: [string, any]) => {
    if (values.length < 3) return;

    const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length);

    if (std === 0) return;

    values.forEach((value: number, index: number) => {
      const zScore = Math.abs((value - mean) / std);
      if (zScore > threshold) {
        anomalies.push({
          type: 'statistical_outlier',
          metric,
          index,
          value,
          zScore,
          severity: zScore > threshold * 2 ? 'high' : 'medium',
          description: `${metric} value ${value} is ${zScore.toFixed(2)}σ from mean (${mean.toFixed(2)})`
        });
      }
    });
  });

  return anomalies;
}

/**
 * Detect temporal anomalies (sudden spikes/drops)
 */
function detectTemporalAnomalies(data: any[]) {
  const anomalies: any[] = [];

  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];

    // Check for sudden changes in AIV
    const aivChange = Math.abs((current.observed_aiv || 0) - (previous.observed_aiv || 0));
    const aivChangePercent = previous.observed_aiv > 0 ? 
      (aivChange / previous.observed_aiv) * 100 : 0;

    if (aivChangePercent > 50) { // 50% change threshold
      anomalies.push({
        type: 'temporal_anomaly',
        metric: 'aiv_change',
        index: i,
        value: aivChangePercent,
        severity: aivChangePercent > 100 ? 'high' : 'medium',
        description: `AIV changed by ${aivChangePercent.toFixed(1)}% from ${previous.observed_aiv} to ${current.observed_aiv}`
      });
    }

    // Check for sudden changes in revenue
    const rarChange = Math.abs((current.observed_rar || 0) - (previous.observed_rar || 0));
    const rarChangePercent = previous.observed_rar > 0 ? 
      (rarChange / previous.observed_rar) * 100 : 0;

    if (rarChangePercent > 75) { // 75% change threshold for revenue
      anomalies.push({
        type: 'temporal_anomaly',
        metric: 'rar_change',
        index: i,
        value: rarChangePercent,
        severity: rarChangePercent > 150 ? 'high' : 'medium',
        description: `Revenue changed by ${rarChangePercent.toFixed(1)}% from ${previous.observed_rar} to ${current.observed_rar}`
      });
    }
  }

  return anomalies;
}

/**
 * Detect pattern-based anomalies
 */
function detectPatternAnomalies(data: any[]) {
  const anomalies: any[] = [];

  // Check for suspicious patterns
  const aivValues = data.map(d => d.observed_aiv || 0);
  const rarValues = data.map(d => d.observed_rar || 0);

  // Pattern 1: Perfect correlation (suspicious)
  const correlation = calculateCorrelation(aivValues, rarValues);
  if (Math.abs(correlation) > 0.98) {
    anomalies.push({
      type: 'pattern_anomaly',
      metric: 'perfect_correlation',
      value: correlation,
      severity: 'high',
      description: `Suspicious perfect correlation (${correlation.toFixed(3)}) between AIV and revenue`
    });
  }

  // Pattern 2: Identical values (suspicious)
  const uniqueAIVValues = new Set(aivValues).size;
  const uniqueRARValues = new Set(rarValues).size;
  
  if (uniqueAIVValues < data.length * 0.1) {
    anomalies.push({
      type: 'pattern_anomaly',
      metric: 'low_variance_aiv',
      value: uniqueAIVValues / data.length,
      severity: 'medium',
      description: `AIV shows very low variance (${uniqueAIVValues} unique values out of ${data.length})`
    });
  }

  if (uniqueRARValues < data.length * 0.1) {
    anomalies.push({
      type: 'pattern_anomaly',
      metric: 'low_variance_rar',
      value: uniqueRARValues / data.length,
      severity: 'medium',
      description: `Revenue shows very low variance (${uniqueRARValues} unique values out of ${data.length})`
    });
  }

  return anomalies;
}

/**
 * Detect correlation anomalies
 */
function detectCorrelationAnomalies(metrics: any) {
  const anomalies: any[] = [];

  // Check for unexpected correlations
  const aivRarCorrelation = calculateCorrelation(metrics.aiv, metrics.rar);
  
  // AIV and revenue should be positively correlated
  if (aivRarCorrelation < 0.3) {
    anomalies.push({
      type: 'correlation_anomaly',
      metric: 'aiv_rar_correlation',
      value: aivRarCorrelation,
      severity: 'medium',
      description: `Unexpectedly low correlation (${aivRarCorrelation.toFixed(3)}) between AIV and revenue`
    });
  }

  // Check for negative correlations where positive expected
  const seoGeoCorrelation = calculateCorrelation(metrics.seo, metrics.geo);
  if (seoGeoCorrelation < -0.5) {
    anomalies.push({
      type: 'correlation_anomaly',
      metric: 'seo_geo_correlation',
      value: seoGeoCorrelation,
      severity: 'low',
      description: `Unexpected negative correlation (${seoGeoCorrelation.toFixed(3)}) between SEO and GEO metrics`
    });
  }

  return anomalies;
}

/**
 * Analyze fraud indicators and generate recommendations
 */
function analyzeFraudIndicators(anomalies: any[], fraudIndicators: string[], recommendedActions: string[]) {
  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
  const mediumSeverityAnomalies = anomalies.filter(a => a.severity === 'medium');

  // Fraud indicators
  if (highSeverityAnomalies.length > 0) {
    fraudIndicators.push('High severity anomalies detected');
    recommendedActions.push('Immediate investigation required for high-severity anomalies');
  }

  if (anomalies.some(a => a.type === 'perfect_correlation')) {
    fraudIndicators.push('Suspicious perfect correlation patterns');
    recommendedActions.push('Review data collection process for potential manipulation');
  }

  if (anomalies.some(a => a.type === 'temporal_anomaly' && a.value > 100)) {
    fraudIndicators.push('Extreme temporal changes detected');
    recommendedActions.push('Verify data accuracy for extreme value changes');
  }

  if (anomalies.some(a => a.type === 'low_variance_aiv' || a.type === 'low_variance_rar')) {
    fraudIndicators.push('Unusually low data variance');
    recommendedActions.push('Check for data collection issues or potential data smoothing');
  }

  if (mediumSeverityAnomalies.length > 3) {
    fraudIndicators.push('Multiple medium-severity anomalies');
    recommendedActions.push('Schedule comprehensive data audit');
  }

  // Default recommendations if no specific issues found
  if (fraudIndicators.length === 0) {
    fraudIndicators.push('No significant fraud indicators detected');
    recommendedActions.push('Continue regular monitoring');
  }
}

/**
 * Calculate fraud risk score
 */
function calculateFraudRiskScore(anomalyResults: any, historicalPatterns: any[]): number {
  let riskScore = 0;

  // Base risk from current anomalies
  riskScore += anomalyResults.anomalyCount * 0.1;
  riskScore += anomalyResults.severityScore * 0.3;
  riskScore += anomalyResults.anomalyScore * 0.2;

  // Historical context
  if (historicalPatterns && historicalPatterns.length > 0) {
    const recentPatterns = historicalPatterns.slice(0, 3);
    const avgHistoricalRisk = recentPatterns.reduce((sum, p) => sum + (p.r2 || 0), 0) / recentPatterns.length;
    riskScore += avgHistoricalRisk * 0.2;
  }

  // Fraud indicators impact
  riskScore += anomalyResults.fraudIndicators.length * 0.05;

  return Math.min(1, Math.max(0, riskScore));
}

/**
 * Calculate severity score
 */
function calculateSeverityScore(anomalies: any[]): number {
  const highSeverity = anomalies.filter(a => a.severity === 'high').length;
  const mediumSeverity = anomalies.filter(a => a.severity === 'medium').length;
  const lowSeverity = anomalies.filter(a => a.severity === 'low').length;

  return (highSeverity * 3 + mediumSeverity * 2 + lowSeverity * 1) / (anomalies.length || 1);
}

/**
 * Calculate anomaly score
 */
function calculateAnomalyScore(anomalies: any[], totalDataPoints: number): number {
  return anomalies.length / totalDataPoints;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(anomalies: any[], totalDataPoints: number): number {
  const anomalyRate = anomalies.length / totalDataPoints;
  return Math.max(0.5, 1 - anomalyRate);
}

/**
 * Calculate fraud trend from historical patterns
 */
function calculateFraudTrend(historicalPatterns: any[]): string {
  if (historicalPatterns.length < 2) return 'insufficient_data';

  const recent = historicalPatterns.slice(0, 3);
  const older = historicalPatterns.slice(3, 6);

  if (older.length === 0) return 'insufficient_data';

  const recentAvg = recent.reduce((sum, p) => sum + (p.r2 || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, p) => sum + (p.r2 || 0), 0) / older.length;

  const change = recentAvg - olderAvg;
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

/**
 * Calculate baseline risk from historical patterns
 */
function calculateBaselineRisk(historicalPatterns: any[]): number {
  if (historicalPatterns.length === 0) return 0.5;

  const avgRisk = historicalPatterns.reduce((sum, p) => sum + (p.r2 || 0), 0) / historicalPatterns.length;
  return Math.min(1, Math.max(0, avgRisk));
}

/**
 * Calculate correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate mock review data for testing
 */
function generateMockReviewData(analysisPeriod: number): any[] {
  const data: any[] = [];
  const now = new Date();
  
  for (let i = 0; i < Math.min(analysisPeriod, 30); i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      observed_aiv: 75 + Math.random() * 20,
      observed_rar: 200000 + Math.random() * 100000,
      seo: 70 + Math.random() * 20,
      aeo: 75 + Math.random() * 20,
      geo: 80 + Math.random() * 15,
      ugc: 65 + Math.random() * 25,
      geolocal: 85 + Math.random() * 10
    });
  }
  
  return data;
}

/**
 * Generate mock historical patterns
 */
function generateMockHistoricalPatterns(): any[] {
  return [
    {
      run_id: 'audit-1',
      run_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      r2: 0.3,
      rmse: 0.1,
      mape: 0.05
    },
    {
      run_id: 'audit-2',
      run_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      r2: 0.25,
      rmse: 0.08,
      mape: 0.04
    },
    {
      run_id: 'audit-3',
      run_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      r2: 0.35,
      rmse: 0.12,
      mape: 0.06
    }
  ];
}