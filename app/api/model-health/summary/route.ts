import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Endpoint: /api/model-health/summary
 * Provides model health monitoring and governance status
 */

// Create Supabase client with fallback for missing env vars
let supabase: any = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
} catch (error) {
  console.warn('Supabase client creation failed, using mock data:', error);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId') || 'default';

    console.log(`🔍 Fetching model health summary for dealer: ${dealerId}`);

    // If Supabase is not available, return mock data
    if (!supabase) {
      const mockResponse = {
        success: true,
        dealerId,
        model_health: {
          dealer_id: dealerId,
          overall_health_score: 85,
          r2_score: 0.87,
          rmse: 12.5,
          accuracy_gain_percent: 15.2,
          roi_gain_percent: 23.8,
          governance_status: 'healthy',
          last_audit_date: new Date().toISOString(),
          data_quality_score: 92,
          model_stability: 'stable'
        },
        violations: [],
        trends: {
          r2_trend: 2.1,
          rmse_trend: -5.3,
          accuracy_trend: 8.7,
          roi_trend: 12.4,
          volatility_score: 0.15
        },
        audit_history: [
          {
            run_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            r2: 0.85,
            rmse: 13.2,
            accuracy_gain_percent: 12.5,
            roi_gain_percent: 20.1
          },
          {
            run_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            r2: 0.83,
            rmse: 14.1,
            accuracy_gain_percent: 10.8,
            roi_gain_percent: 18.3
          }
        ],
        timestamp: new Date().toISOString(),
        mock_data: true
      };

      return NextResponse.json(mockResponse);
    }

    // Get model health summary
    const { data: modelHealth, error: healthError } = await supabase
      .rpc('get_model_health_summary', { dealer_id_param: dealerId });

    if (healthError) {
      console.error('❌ Error fetching model health:', healthError);
      return NextResponse.json(
        { error: 'Failed to fetch model health', details: healthError.message },
        { status: 500 }
      );
    }

    // Get governance violations
    const { data: violations, error: violationsError } = await supabase
      .rpc('check_governance_violations', { dealer_id_param: dealerId });

    if (violationsError) {
      console.error('❌ Error checking governance violations:', violationsError);
    }

    // Get recent model audit history for trends
    const { data: auditHistory, error: auditError } = await supabase
      .from('model_audit')
      .select('run_date, r2, rmse, accuracy_gain_percent, roi_gain_percent')
      .eq('dealer_id', dealerId)
      .order('run_date', { ascending: false })
      .limit(8); // 8 weeks of data

    if (auditError) {
      console.error('❌ Error fetching audit history:', auditError);
    }

    // Calculate trends
    const trends = calculateTrends(auditHistory || []);

    const response = {
      success: true,
      dealerId,
      model_health: modelHealth?.[0] || null,
      violations: violations || [],
      trends,
      audit_history: auditHistory || [],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Model health API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch model health summary', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate trend metrics from audit history
 */
function calculateTrends(auditHistory: any[]) {
  if (auditHistory.length < 2) {
    return {
      r2_trend: 0,
      rmse_trend: 0,
      accuracy_trend: 0,
      roi_trend: 0,
      volatility_score: 0
    };
  }

  const latest = auditHistory[0];
  const previous = auditHistory[1];

  // Calculate percentage changes
  const r2_trend = previous.r2 ? ((latest.r2 - previous.r2) / previous.r2) * 100 : 0;
  const rmse_trend = previous.rmse ? ((latest.rmse - previous.rmse) / previous.rmse) * 100 : 0;
  const accuracy_trend = latest.accuracy_gain_percent || 0;
  const roi_trend = latest.roi_gain_percent || 0;

  // Calculate volatility (standard deviation of R² over time)
  const r2Values = auditHistory.map(h => h.r2).filter(v => v !== null);
  const volatility_score = calculateVolatility(r2Values);

  return {
    r2_trend: parseFloat(r2_trend.toFixed(2)),
    rmse_trend: parseFloat(rmse_trend.toFixed(2)),
    accuracy_trend: parseFloat(accuracy_trend.toFixed(2)),
    roi_trend: parseFloat(roi_trend.toFixed(2)),
    volatility_score: parseFloat(volatility_score.toFixed(2))
  };
}

/**
 * Calculate volatility (standard deviation) of a series
 */
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * API Endpoint: POST /api/model-health/summary
 * Update model health metrics (called by training pipeline)
 */
export async function POST(request: NextRequest) {
  try {
    const { dealerId, metrics, status } = await request.json();

    if (!dealerId || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: dealerId, metrics' },
        { status: 400 }
      );
    }

    console.log(`📊 Updating model health metrics for dealer: ${dealerId}`);

    // If Supabase is not available, return mock success response
    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Model health metrics updated successfully (mock mode)',
        audit_record: {
          id: 'mock-' + Date.now(),
          dealer_id: dealerId,
          status: status || 'success',
          ...metrics,
          created_at: new Date().toISOString()
        },
        violations: [],
        timestamp: new Date().toISOString(),
        mock_data: true
      });
    }

    // Insert new audit record
    const { data, error } = await supabase
      .from('model_audit')
      .insert({
        dealer_id: dealerId,
        status: status || 'success',
        r2: metrics.r2,
        rmse: metrics.rmse,
        mape: metrics.mape,
        accuracy_gain_percent: metrics.accuracy_gain_percent,
        roi_gain_percent: metrics.roi_gain_percent,
        ad_efficiency_gain_percent: metrics.ad_efficiency_gain_percent,
        elasticity_per_point: metrics.elasticity_per_point,
        correlation_aiv_geo: metrics.correlation_aiv_geo,
        mean_latency_days: metrics.mean_latency_days,
        dataset_completeness: metrics.dataset_completeness,
        data_quality_score: metrics.data_quality_score,
        training_duration_seconds: metrics.training_duration_seconds,
        records_processed: metrics.records_processed,
        weights_before: metrics.weights_before,
        weights_after: metrics.weights_after,
        weight_changes: metrics.weight_changes,
        error_message: metrics.error_message,
        error_code: metrics.error_code
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting model audit record:', error);
      return NextResponse.json(
        { error: 'Failed to update model health', details: error.message },
        { status: 500 }
      );
    }

    // Check for governance violations after update
    const { data: violations } = await supabase
      .rpc('check_governance_violations', { dealer_id_param: dealerId });

    // Update model weights governance status if violations found
    if (violations && violations.length > 0) {
      const criticalViolations = violations.filter((v: any) => v.severity === 'critical');
      
      if (criticalViolations.length > 0) {
        await supabase
          .from('model_weights')
          .update({ 
            governance_status: 'frozen',
            updated_at: new Date().toISOString()
          })
          .eq('dealer_id', dealerId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Model health metrics updated successfully',
      audit_record: data,
      violations: violations || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error updating model health:', error);
    return NextResponse.json(
      { error: 'Failed to update model health', details: error.message },
      { status: 500 }
    );
  }
}
