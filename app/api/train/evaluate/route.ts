/**
 * Model Evaluation API endpoint for logging RMSE, R², MAPE and suggesting next learning rate
 * Part of the closed-loop analytics system for continuous model improvement
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealerId, evaluationPeriod = 8 } = body; // weeks

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      );
    }

    // Get current model weights
    const { data: currentWeights, error: weightsError } = await supabase
      .from('model_weights')
      .select('*')
      .order('asof_date', { ascending: false })
      .limit(1)
      .single();

    if (weightsError) {
      console.error('Error fetching current weights:', weightsError);
      return NextResponse.json(
        { error: 'Failed to fetch current weights' },
        { status: 500 }
      );
    }

    // Get evaluation period data
    const { data: evaluationData, error: dataError } = await supabase
      .from('aiv_raw_signals')
      .select('*')
      .eq('dealer_id', dealerId)
      .gte('date', new Date(Date.now() - evaluationPeriod * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dataError) {
      console.error('Error fetching evaluation data:', dataError);
      return NextResponse.json(
        { error: 'Failed to fetch evaluation data' },
        { status: 500 }
      );
    }

    if (!evaluationData || evaluationData.length < 4) {
      return NextResponse.json(
        { error: 'Insufficient evaluation data' },
        { status: 400 }
      );
    }

    // Calculate predicted AIV using current weights
    const predictedAIV = evaluationData.map(signal => 
      (signal.seo || 0) * currentWeights.seo_w +
      (signal.aeo || 0) * currentWeights.aeo_w +
      (signal.geo || 0) * currentWeights.geo_w +
      (signal.ugc || 0) * currentWeights.ugc_w +
      (signal.geolocal || 0) * currentWeights.geolocal_w
    );

    const observedAIV = evaluationData.map(signal => signal.observed_aiv || 0);
    const observedRAR = evaluationData.map(signal => signal.observed_rar || 0);

    // Calculate performance metrics
    const metrics = calculatePerformanceMetrics(predictedAIV, observedAIV, observedRAR);

    // Get previous evaluation for comparison
    const { data: previousAudit } = await supabase
      .from('model_audit')
      .select('*')
      .eq('run_type', 'evaluate')
      .eq('dealer_id', dealerId)
      .order('run_date', { ascending: false })
      .limit(1)
      .single();

    // Calculate accuracy gain
    const accuracyGain = previousAudit ? metrics.r2 - previousAudit.r2 : 0;
    const accuracyGainMoM = previousAudit ? 
      ((metrics.r2 - previousAudit.r2) / previousAudit.r2) * 100 : 0;

    // Suggest next learning rate based on performance
    const suggestedLearningRate = suggestLearningRate(metrics, accuracyGain, currentWeights.learning_rate || 0.1);

    // Log evaluation results
    const { data: auditResult, error: auditError } = await supabase
      .from('model_audit')
      .insert({
        run_type: 'evaluate',
        dealer_id: dealerId,
        rmse: metrics.rmse,
        mape: metrics.mape,
        r2: metrics.r2,
        delta_accuracy: accuracyGain,
        accuracy_gain_mom: accuracyGainMoM,
        model_version: 'hyperAIV-v1.0',
        notes: `Model evaluation over ${evaluationPeriod} weeks`,
        metadata: {
          evaluation_period_weeks: evaluationPeriod,
          sample_size: evaluationData.length,
          suggested_learning_rate: suggestedLearningRate,
          performance_trend: accuracyGain > 0 ? 'improving' : accuracyGain < -0.05 ? 'degrading' : 'stable',
          metrics_breakdown: {
            rmse_breakdown: metrics.rmseBreakdown,
            correlation_analysis: metrics.correlationAnalysis,
            residual_analysis: metrics.residualAnalysis
          }
        }
      })
      .select()
      .single();

    if (auditError) {
      console.error('Error logging evaluation:', auditError);
      return NextResponse.json(
        { error: 'Failed to log evaluation results' },
        { status: 500 }
      );
    }

    // Generate recommendations
    const recommendations = generateRecommendations(metrics, accuracyGain, suggestedLearningRate);

    return NextResponse.json({
      success: true,
      data: {
        evaluation_metrics: metrics,
        accuracy_gain: {
          absolute: accuracyGain,
          percentage: accuracyGainMoM,
          trend: accuracyGain > 0 ? 'improving' : accuracyGain < -0.05 ? 'degrading' : 'stable'
        },
        suggested_learning_rate: suggestedLearningRate,
        recommendations: recommendations,
        evaluation_period: {
          weeks: evaluationPeriod,
          sample_size: evaluationData.length,
          date_range: {
            start: evaluationData[0].date,
            end: evaluationData[evaluationData.length - 1].date
          }
        },
        model_health: {
          status: metrics.r2 > 0.8 ? 'excellent' : metrics.r2 > 0.7 ? 'good' : metrics.r2 > 0.6 ? 'fair' : 'poor',
          confidence_level: Math.min(0.95, Math.max(0.5, metrics.r2 + 0.1))
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model_version: 'hyperAIV-v1.0',
        evaluation_type: 'comprehensive',
        audit_id: auditResult.run_id
      }
    });

  } catch (error) {
    console.error('Error in /api/train/evaluate:', error);
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
 * Calculate comprehensive performance metrics
 */
function calculatePerformanceMetrics(predicted: number[], observed: number[], observedRAR: number[]) {
  const n = predicted.length;
  
  // Basic metrics
  const meanObserved = observed.reduce((a, b) => a + b, 0) / n;
  const ssRes = predicted.reduce((sum, pred, i) => sum + Math.pow(observed[i] - pred, 2), 0);
  const ssTot = observed.reduce((sum, obs) => sum + Math.pow(obs - meanObserved, 2), 0);
  
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  const rmse = Math.sqrt(ssRes / n);
  const mae = predicted.reduce((sum, pred, i) => sum + Math.abs(observed[i] - pred), 0) / n;
  const mape = predicted.reduce((sum, pred, i) => {
    const obs = observed[i];
    return sum + (obs > 0 ? Math.abs((obs - pred) / obs) : 0);
  }, 0) / n;

  // Correlation with revenue
  const correlationWithRAR = calculateCorrelation(predicted, observedRAR);

  // Residual analysis
  const residuals = predicted.map((pred, i) => observed[i] - pred);
  const residualMean = residuals.reduce((a, b) => a + b, 0) / n;
  const residualStd = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - residualMean, 2), 0) / n);

  // RMSE breakdown by performance tiers
  const rmseBreakdown = {
    high_performance: residuals.filter(r => Math.abs(r) < 2).length / n,
    medium_performance: residuals.filter(r => Math.abs(r) >= 2 && Math.abs(r) < 5).length / n,
    low_performance: residuals.filter(r => Math.abs(r) >= 5).length / n
  };

  return {
    r2: Math.max(0, Math.min(1, r2)),
    rmse: Math.max(0, rmse),
    mae: Math.max(0, mae),
    mape: Math.max(0, Math.min(1, mape)),
    correlationWithRAR: correlationWithRAR,
    residualAnalysis: {
      mean: residualMean,
      std: residualStd,
      normality_score: calculateNormalityScore(residuals)
    },
    rmseBreakdown,
    correlationAnalysis: {
      aiv_rar_correlation: correlationWithRAR,
      strength: Math.abs(correlationWithRAR) > 0.7 ? 'strong' : Math.abs(correlationWithRAR) > 0.4 ? 'moderate' : 'weak'
    }
  };
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
 * Calculate normality score for residuals (simplified)
 */
function calculateNormalityScore(residuals: number[]): number {
  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const std = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / residuals.length);
  
  // Count residuals within 1, 2, 3 standard deviations
  const within1Std = residuals.filter(r => Math.abs(r - mean) <= std).length / residuals.length;
  const within2Std = residuals.filter(r => Math.abs(r - mean) <= 2 * std).length / residuals.length;
  const within3Std = residuals.filter(r => Math.abs(r - mean) <= 3 * std).length / residuals.length;
  
  // Compare to expected normal distribution (68%, 95%, 99.7%)
  const normalityScore = (within1Std * 0.68 + within2Std * 0.95 + within3Std * 0.997) / 2.717;
  
  return Math.max(0, Math.min(1, normalityScore));
}

/**
 * Suggest optimal learning rate based on performance
 */
function suggestLearningRate(metrics: any, accuracyGain: number, currentLR: number): number {
  let suggestedLR = currentLR;
  
  // If accuracy is degrading, reduce learning rate
  if (accuracyGain < -0.05) {
    suggestedLR = Math.max(0.01, currentLR * 0.5);
  }
  // If accuracy is improving slowly, increase learning rate
  else if (accuracyGain > 0 && accuracyGain < 0.02) {
    suggestedLR = Math.min(0.3, currentLR * 1.2);
  }
  // If accuracy is improving well, maintain current rate
  else if (accuracyGain > 0.02) {
    suggestedLR = currentLR;
  }
  // If R² is very low, increase learning rate
  else if (metrics.r2 < 0.6) {
    suggestedLR = Math.min(0.3, currentLR * 1.5);
  }
  // If R² is very high, reduce learning rate for fine-tuning
  else if (metrics.r2 > 0.9) {
    suggestedLR = Math.max(0.01, currentLR * 0.8);
  }
  
  return Math.round(suggestedLR * 1000) / 1000; // Round to 3 decimal places
}

/**
 * Generate actionable recommendations based on evaluation results
 */
function generateRecommendations(metrics: any, accuracyGain: number, suggestedLR: number): string[] {
  const recommendations: string[] = [];
  
  if (metrics.r2 < 0.6) {
    recommendations.push('Model performance is below acceptable threshold. Consider increasing training data or adjusting feature weights.');
  }
  
  if (metrics.rmse > 5) {
    recommendations.push('High RMSE indicates significant prediction errors. Review data quality and feature engineering.');
  }
  
  if (metrics.mape > 0.15) {
    recommendations.push('High MAPE suggests model struggles with percentage accuracy. Consider log-transforming target variables.');
  }
  
  if (Math.abs(metrics.correlationWithRAR) < 0.4) {
    recommendations.push('Weak correlation with revenue suggests AIV may not be driving business outcomes effectively.');
  }
  
  if (accuracyGain < -0.05) {
    recommendations.push('Model performance is degrading. Reduce learning rate and investigate data drift.');
  }
  
  if (metrics.residualAnalysis.normality_score < 0.7) {
    recommendations.push('Residuals show non-normal distribution. Consider transforming features or using robust regression methods.');
  }
  
  if (metrics.rmseBreakdown.low_performance > 0.2) {
    recommendations.push('High proportion of low-performance predictions. Focus on improving model for edge cases.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Model performance is satisfactory. Continue current training approach with suggested learning rate.');
  }
  
  return recommendations;
}
