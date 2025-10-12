// Governance and Data Quality Controls
// Implements data validation, anomaly detection, and compliance measures

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

// Data quality thresholds
export const QUALITY_THRESHOLDS = {
  MIN_R2: 0.70, // Minimum R² for elasticity calculations
  MAX_STD_DEVIATIONS: 4, // Maximum standard deviations for anomaly detection
  MIN_AIV_SCORE: 0,
  MAX_AIV_SCORE: 100,
  MIN_ELASTICITY: 0,
  MAX_ELASTICITY: 10000,
  // AEMD thresholds
  MIN_AEMD_SCORE: 0,
  MAX_AEMD_SCORE: 10,
  AEMD_TARGET_SCORE: 2.5,
  // Accuracy thresholds
  MIN_ISSUE_DETECTION: 0.70,
  TARGET_ISSUE_DETECTION: 0.90,
  MIN_RANKING_CORRELATION: 0.55,
  TARGET_RANKING_CORRELATION: 0.80,
  MIN_CONSENSUS_RELIABILITY: 0.75,
  TARGET_CONSENSUS_RELIABILITY: 0.95,
  MAX_ACCEPTABLE_VARIANCE: 5.0,
} as const;

// Regime states
export const REGIME_STATES = {
  STABLE: 'stable',
  VOLATILE: 'volatile',
  TRENDING_UP: 'trending_up',
  TRENDING_DOWN: 'trending_down',
  ANOMALOUS: 'anomalous',
} as const;

export interface DataQualityCheck {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  score: number; // 0-100 quality score
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFields: string[];
  recommendedAction: string;
}

/**
 * Validate AVI report data quality
 */
export function validateAviData(data: {
  aiv_pct: number;
  ati_pct: number;
  crs_pct: number;
  elasticity_usd_per_point: number;
  r2: number;
  pillars_json: any;
  clarity_json: any;
}): DataQualityCheck {
  const violations: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check score ranges
  if (data.aiv_pct < QUALITY_THRESHOLDS.MIN_AIV_SCORE || data.aiv_pct > QUALITY_THRESHOLDS.MAX_AIV_SCORE) {
    violations.push(`AIV score out of range: ${data.aiv_pct}`);
    score -= 20;
  }

  if (data.ati_pct < QUALITY_THRESHOLDS.MIN_AIV_SCORE || data.ati_pct > QUALITY_THRESHOLDS.MAX_AIV_SCORE) {
    violations.push(`ATI score out of range: ${data.ati_pct}`);
    score -= 20;
  }

  if (data.crs_pct < QUALITY_THRESHOLDS.MIN_AIV_SCORE || data.crs_pct > QUALITY_THRESHOLDS.MAX_AIV_SCORE) {
    violations.push(`CRS score out of range: ${data.crs_pct}`);
    score -= 20;
  }

  // Check elasticity range
  if (data.elasticity_usd_per_point < QUALITY_THRESHOLDS.MIN_ELASTICITY || 
      data.elasticity_usd_per_point > QUALITY_THRESHOLDS.MAX_ELASTICITY) {
    violations.push(`Elasticity out of range: ${data.elasticity_usd_per_point}`);
    score -= 15;
  }

  // Check R² threshold
  if (data.r2 < QUALITY_THRESHOLDS.MIN_R2) {
    warnings.push(`Low R² coefficient: ${data.r2} (below ${QUALITY_THRESHOLDS.MIN_R2})`);
    score -= 10;
  }

  // Check for missing required JSON fields
  if (!data.pillars_json || typeof data.pillars_json !== 'object') {
    violations.push('Missing or invalid pillars_json');
    score -= 15;
  }

  if (!data.clarity_json || typeof data.clarity_json !== 'object') {
    violations.push('Missing or invalid clarity_json');
    score -= 15;
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Detect anomalies in AVI data using statistical methods
 */
export function detectAnomalies(
  currentData: any,
  historicalData: any[]
): AnomalyDetection {
  if (historicalData.length < 3) {
    return {
      isAnomaly: false,
      severity: 'low',
      description: 'Insufficient historical data for anomaly detection',
      affectedFields: [],
      recommendedAction: 'Collect more historical data'
    };
  }

  const fields = ['aiv_pct', 'ati_pct', 'crs_pct', 'elasticity_usd_per_point'];
  const anomalies: string[] = [];
  const affectedFields: string[] = [];

  for (const field of fields) {
    const values = historicalData.map(d => d[field]).filter(v => typeof v === 'number');
    if (values.length < 3) continue;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const currentValue = currentData[field];
    const zScore = Math.abs((currentValue - mean) / stdDev);

    if (zScore > QUALITY_THRESHOLDS.MAX_STD_DEVIATIONS) {
      anomalies.push(`${field}: ${currentValue} (z-score: ${zScore.toFixed(2)})`);
      affectedFields.push(field);
    }
  }

  if (anomalies.length === 0) {
    return {
      isAnomaly: false,
      severity: 'low',
      description: 'No anomalies detected',
      affectedFields: [],
      recommendedAction: 'Continue monitoring'
    };
  }

  const severity = anomalies.length > 2 ? 'critical' : 
                   anomalies.length > 1 ? 'high' : 'medium';

  return {
    isAnomaly: true,
    severity,
    description: `Anomalies detected: ${anomalies.join(', ')}`,
    affectedFields,
    recommendedAction: severity === 'critical' ? 'Quarantine data and investigate' : 'Review and validate data'
  };
}

/**
 * Determine regime state based on data patterns
 */
export function determineRegimeState(
  currentData: any,
  historicalData: any[]
): string {
  if (historicalData.length < 3) {
    return REGIME_STATES.STABLE;
  }

  const aivScores = historicalData.map(d => d.aiv_pct).filter(v => typeof v === 'number');
  const recentScores = aivScores.slice(-3);
  const olderScores = aivScores.slice(-6, -3);

  if (recentScores.length < 3 || olderScores.length < 3) {
    return REGIME_STATES.STABLE;
  }

  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
  const change = recentAvg - olderAvg;

  // Calculate volatility
  const variance = recentScores.reduce((a, b) => a + Math.pow(b - recentAvg, 2), 0) / recentScores.length;
  const volatility = Math.sqrt(variance);

  if (volatility > 15) {
    return REGIME_STATES.VOLATILE;
  }

  if (change > 5) {
    return REGIME_STATES.TRENDING_UP;
  }

  if (change < -5) {
    return REGIME_STATES.TRENDING_DOWN;
  }

  return REGIME_STATES.STABLE;
}

/**
 * Log event to audit ledger
 */
export async function logEvent(
  tenantId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: any,
  metadata?: any
): Promise<void> {
  try {
    await supabase
      .from('audit_log')
      .insert({
        user_id: null, // Will be set by RLS if user is authenticated
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          tenant_id: tenantId
        }
      });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Quarantine data that fails quality checks
 */
export async function quarantineData(
  tenantId: string,
  data: any,
  reason: string,
  violations: string[]
): Promise<void> {
  try {
    await supabase
      .from('quarantined_data')
      .insert({
        tenant_id: tenantId,
        data,
        reason,
        violations,
        quarantined_at: new Date().toISOString()
      });

    await logEvent(tenantId, 'data_quarantined', 'avi_report', data.id || 'unknown', {
      reason,
      violations
    });
  } catch (error) {
    console.error('Failed to quarantine data:', error);
  }
}

/**
 * Check if elasticity should be frozen due to low R²
 */
export function shouldFreezeElasticity(r2: number): boolean {
  return r2 < QUALITY_THRESHOLDS.MIN_R2;
}

/**
 * Validate AEMD metrics
 */
export function validateAemdData(data: {
  aemd_final: number;
  fs_score: number;
  aio_score: number;
  paa_score: number;
}): DataQualityCheck {
  const violations: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check AEMD final score range
  if (data.aemd_final < QUALITY_THRESHOLDS.MIN_AEMD_SCORE ||
      data.aemd_final > QUALITY_THRESHOLDS.MAX_AEMD_SCORE) {
    violations.push(`AEMD final score out of range: ${data.aemd_final}`);
    score -= 30;
  }

  // Check if below target
  if (data.aemd_final < QUALITY_THRESHOLDS.AEMD_TARGET_SCORE) {
    warnings.push(`AEMD score below target: ${data.aemd_final} < ${QUALITY_THRESHOLDS.AEMD_TARGET_SCORE}`);
    score -= 15;
  }

  // Check component scores are non-negative
  if (data.fs_score < 0 || data.aio_score < 0 || data.paa_score < 0) {
    violations.push('Negative component scores detected');
    score -= 25;
  }

  // Check that components sum correctly (with omega weights)
  const sum = data.fs_score + data.aio_score + data.paa_score;
  if (Math.abs(sum - data.aemd_final) > 0.01) {
    warnings.push('Component scores do not sum to final AEMD score');
    score -= 10;
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Validate accuracy monitoring data
 */
export function validateAccuracyData(data: {
  issue_detection_accuracy: number;
  ranking_correlation: number;
  consensus_reliability: number;
  variance: number;
}): DataQualityCheck {
  const violations: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check accuracy ranges (0-1)
  const metrics = [
    { name: 'issue_detection_accuracy', value: data.issue_detection_accuracy, min: QUALITY_THRESHOLDS.MIN_ISSUE_DETECTION },
    { name: 'ranking_correlation', value: data.ranking_correlation, min: QUALITY_THRESHOLDS.MIN_RANKING_CORRELATION },
    { name: 'consensus_reliability', value: data.consensus_reliability, min: QUALITY_THRESHOLDS.MIN_CONSENSUS_RELIABILITY },
  ];

  for (const metric of metrics) {
    if (metric.value < 0 || metric.value > 1) {
      violations.push(`${metric.name} out of range: ${metric.value}`);
      score -= 25;
    } else if (metric.value < metric.min) {
      violations.push(`${metric.name} below minimum threshold: ${metric.value} < ${metric.min}`);
      score -= 20;
    }
  }

  // Check variance
  if (data.variance < 0) {
    violations.push(`Negative variance: ${data.variance}`);
    score -= 30;
  } else if (data.variance > QUALITY_THRESHOLDS.MAX_ACCEPTABLE_VARIANCE) {
    warnings.push(`High variance detected: ${data.variance} > ${QUALITY_THRESHOLDS.MAX_ACCEPTABLE_VARIANCE}`);
    score -= 15;
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Get comprehensive governance metrics including AEMD and accuracy
 */
export async function getGovernanceMetrics(tenantId: string): Promise<{
  avi: {
    totalReports: number;
    qualityScore: number;
    anomaliesCount: number;
    quarantinedCount: number;
    frozenElasticityCount: number;
  };
  aemd: {
    totalMetrics: number;
    avgScore: number;
    belowTarget: number;
    qualityScore: number;
  };
  accuracy: {
    totalMeasurements: number;
    alertsTriggered: number;
    unacknowledgedAlerts: number;
    avgIssueDetection: number;
    avgRankingCorrelation: number;
    avgConsensusReliability: number;
    qualityScore: number;
  };
}> {
  try {
    const [reports, quarantined, frozen, aemdMetrics, accuracyMetrics, alerts] = await Promise.all([
      supabase
        .from('avi_reports')
        .select('r2, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100),

      supabase
        .from('quarantined_data')
        .select('id')
        .eq('tenant_id', tenantId),

      supabase
        .from('avi_reports')
        .select('id')
        .eq('tenant_id', tenantId)
        .lt('r2', QUALITY_THRESHOLDS.MIN_R2),

      supabase
        .from('aemd_metrics')
        .select('aemd_final')
        .eq('tenant_id', tenantId)
        .order('report_date', { ascending: false })
        .limit(30),

      supabase
        .from('accuracy_monitoring')
        .select('issue_detection_accuracy, ranking_correlation, consensus_reliability, is_below_threshold')
        .eq('tenant_id', tenantId)
        .order('measurement_date', { ascending: false })
        .limit(30),

      supabase
        .from('accuracy_alerts')
        .select('acknowledged_at')
        .eq('tenant_id', tenantId)
        .order('triggered_at', { ascending: false })
        .limit(100)
    ]);

    // AVI metrics
    const totalReports = reports.data?.length || 0;
    const qualityScore = totalReports > 0 ?
      reports.data!.reduce((acc, r) => acc + (r.r2 * 100), 0) / totalReports : 0;
    const quarantinedCount = quarantined.data?.length || 0;
    const frozenElasticityCount = frozen.data?.length || 0;

    // AEMD metrics
    const totalAemdMetrics = aemdMetrics.data?.length || 0;
    const avgAemdScore = totalAemdMetrics > 0 ?
      aemdMetrics.data!.reduce((acc, m) => acc + parseFloat(m.aemd_final as any), 0) / totalAemdMetrics : 0;
    const belowTarget = aemdMetrics.data?.filter(m =>
      parseFloat(m.aemd_final as any) < QUALITY_THRESHOLDS.AEMD_TARGET_SCORE
    ).length || 0;
    const aemdQualityScore = totalAemdMetrics > 0 ?
      ((totalAemdMetrics - belowTarget) / totalAemdMetrics * 100) : 100;

    // Accuracy metrics
    const totalAccuracyMetrics = accuracyMetrics.data?.length || 0;
    const alertsTriggered = accuracyMetrics.data?.filter(m => m.is_below_threshold).length || 0;
    const unacknowledgedAlerts = alerts.data?.filter(a => !a.acknowledged_at).length || 0;
    const avgIssueDetection = totalAccuracyMetrics > 0 ?
      accuracyMetrics.data!.reduce((acc, m) => acc + parseFloat(m.issue_detection_accuracy as any), 0) / totalAccuracyMetrics : 0;
    const avgRankingCorrelation = totalAccuracyMetrics > 0 ?
      accuracyMetrics.data!.reduce((acc, m) => acc + parseFloat(m.ranking_correlation as any), 0) / totalAccuracyMetrics : 0;
    const avgConsensusReliability = totalAccuracyMetrics > 0 ?
      accuracyMetrics.data!.reduce((acc, m) => acc + parseFloat(m.consensus_reliability as any), 0) / totalAccuracyMetrics : 0;

    // Calculate accuracy quality score based on targets
    let accuracyQualityScore = 100;
    if (avgIssueDetection < QUALITY_THRESHOLDS.TARGET_ISSUE_DETECTION) accuracyQualityScore -= 15;
    if (avgRankingCorrelation < QUALITY_THRESHOLDS.TARGET_RANKING_CORRELATION) accuracyQualityScore -= 15;
    if (avgConsensusReliability < QUALITY_THRESHOLDS.TARGET_CONSENSUS_RELIABILITY) accuracyQualityScore -= 15;
    if (unacknowledgedAlerts > 0) accuracyQualityScore -= (unacknowledgedAlerts * 5);

    return {
      avi: {
        totalReports,
        qualityScore,
        anomaliesCount: 0,
        quarantinedCount,
        frozenElasticityCount
      },
      aemd: {
        totalMetrics: totalAemdMetrics,
        avgScore: avgAemdScore,
        belowTarget,
        qualityScore: aemdQualityScore
      },
      accuracy: {
        totalMeasurements: totalAccuracyMetrics,
        alertsTriggered,
        unacknowledgedAlerts,
        avgIssueDetection,
        avgRankingCorrelation,
        avgConsensusReliability,
        qualityScore: Math.max(0, accuracyQualityScore)
      }
    };
  } catch (error) {
    console.error('Failed to get governance metrics:', error);
    return {
      avi: {
        totalReports: 0,
        qualityScore: 0,
        anomaliesCount: 0,
        quarantinedCount: 0,
        frozenElasticityCount: 0
      },
      aemd: {
        totalMetrics: 0,
        avgScore: 0,
        belowTarget: 0,
        qualityScore: 0
      },
      accuracy: {
        totalMeasurements: 0,
        alertsTriggered: 0,
        unacknowledgedAlerts: 0,
        avgIssueDetection: 0,
        avgRankingCorrelation: 0,
        avgConsensusReliability: 0,
        qualityScore: 0
      }
    };
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function getDataQualityMetrics(tenantId: string): Promise<{
  totalReports: number;
  qualityScore: number;
  anomaliesCount: number;
  quarantinedCount: number;
  frozenElasticityCount: number;
}> {
  const metrics = await getGovernanceMetrics(tenantId);
  return metrics.avi;
}
