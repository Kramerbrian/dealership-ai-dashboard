import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || 'executive-summary';

    switch (query) {
      case 'executive-summary':
        return await getExecutiveSummary(supabase);
      case 'control-rules':
        return await getControlRules(supabase);
      case 'success-criteria':
        return await getSuccessCriteria(supabase);
      case 'cron-health':
        return await getCronHealth(supabase);
      case 'critical-alerts':
        return await getCriticalAlerts(supabase);
      case 'model-evolution':
        return await getModelEvolution(supabase);
      case 'anomaly-summary':
        return await getAnomalySummary(supabase);
      case 'forecast-accuracy':
        return await getForecastAccuracy(supabase);
      default:
        return NextResponse.json(
          { error: "Invalid query parameter. Use: executive-summary, control-rules, success-criteria, cron-health, critical-alerts, model-evolution, anomaly-summary, or forecast-accuracy" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('System health monitoring error:', error);
    return NextResponse.json(
      {
        error: "Failed to fetch system health",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getExecutiveSummary(supabase: any) {
  const { data: latestEval, error: evalError } = await supabase
    .from('model_audit')
    .select('*')
    .eq('run_type', 'evaluate')
    .order('run_date', { ascending: false })
    .limit(1)
    .single();

  if (evalError && evalError.code !== 'PGRST116') {
    throw evalError;
  }

  const { data: cronHealth, error: cronError } = await supabase
    .from('cron_job_health')
    .select('*');

  if (cronError) throw cronError;

  const { data: anomalies, error: anomalyError } = await supabase
    .from('review_anomalies')
    .select('*')
    .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (anomalyError) throw anomalyError;

  // Calculate summary metrics
  const totalJobs = cronHealth?.length || 0;
  const healthyJobs = cronHealth?.filter((j: any) => j.health_status === 'healthy').length || 0;
  const criticalJobs = cronHealth?.filter((j: any) => j.health_status === 'critical').length || 0;
  const degradedJobs = cronHealth?.filter((j: any) => j.health_status === 'degraded').length || 0;

  const last24hAnomalies = anomalies?.length || 0;
  const unresolvedHighSeverity = anomalies?.filter((a: any) => a.severity === 'high' && !a.resolved).length || 0;

  // Determine overall status
  let overallStatus = 'NOMINAL';
  if (criticalJobs > 0 || (latestEval && latestEval.r2 < 0.6)) {
    overallStatus = 'CRITICAL';
  } else if ((latestEval && latestEval.r2 < 0.7) || degradedJobs > 0) {
    overallStatus = 'DEGRADED';
  } else if (
    latestEval &&
    latestEval.r2 >= 0.8 &&
    latestEval.accuracy_gain_mom >= 10 &&
    latestEval.delta_roi >= 15 &&
    healthyJobs === totalJobs
  ) {
    overallStatus = 'OPTIMAL';
  }

  const successCriteriaMet =
    latestEval &&
    latestEval.r2 >= 0.8 &&
    latestEval.accuracy_gain_mom >= 10 &&
    latestEval.delta_roi >= 15;

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    status_icon: getStatusIcon(overallStatus),
    model_performance: latestEval ? {
      r2: Number(latestEval.r2).toFixed(3),
      rmse: Number(latestEval.rmse).toFixed(2),
      accuracy_gain_mom: Number(latestEval.accuracy_gain_mom || 0).toFixed(2),
      ad_efficiency_gain: Number(latestEval.delta_roi || 0).toFixed(2),
      last_evaluation: latestEval.run_date
    } : null,
    success_criteria: {
      status: successCriteriaMet ? 'MEETING ALL TARGETS' : 'BELOW TARGET',
      icon: successCriteriaMet ? '✅' : '❌',
      r2_target: latestEval ? latestEval.r2 >= 0.8 : false,
      accuracy_target: latestEval ? latestEval.accuracy_gain_mom >= 10 : false,
      roi_target: latestEval ? latestEval.delta_roi >= 15 : false
    },
    cron_health: {
      status: criticalJobs > 0 ? 'CRITICAL' : healthyJobs === totalJobs ? 'HEALTHY' : 'DEGRADED',
      icon: criticalJobs > 0 ? '🚨' : healthyJobs === totalJobs ? '✅' : '⚠️',
      total_jobs: totalJobs,
      healthy: healthyJobs,
      degraded: degradedJobs,
      critical: criticalJobs
    },
    anomaly_detection: {
      last_24h: last24hAnomalies,
      unresolved_high_severity: unresolvedHighSeverity
    }
  });
}

async function getControlRules(supabase: any) {
  const { data, error } = await supabase
    .from('model_audit')
    .select('*')
    .or('r2.lt.0.7,rmse.gt.3.5')
    .order('run_date', { ascending: false })
    .limit(20);

  if (error) throw error;

  const alerts = data?.map((record: any) => ({
    run_id: record.run_id,
    run_date: record.run_date,
    run_type: record.run_type,
    dealer_id: record.dealer_id,
    r2: Number(record.r2).toFixed(3),
    rmse: Number(record.rmse).toFixed(2),
    mape: Number(record.mape || 0).toFixed(2),
    alert_status:
      record.r2 < 0.7
        ? 'ALERT: Low R² - Model accuracy degraded'
        : 'ALERT: High RMSE - Prediction errors too large'
  }));

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    alert_count: alerts?.length || 0,
    alerts: alerts || []
  });
}

async function getSuccessCriteria(supabase: any) {
  const { data, error } = await supabase
    .from('model_audit')
    .select('*')
    .eq('run_type', 'evaluate')
    .order('run_date', { ascending: false })
    .limit(10);

  if (error) throw error;

  const results = data?.map((record: any) => {
    const r2Target = record.r2 >= 0.8;
    const accuracyTarget = record.accuracy_gain_mom >= 10;
    const roiTarget = record.delta_roi >= 15;
    const allTargetsMet = r2Target && accuracyTarget && roiTarget;

    let status = 'MEETING ALL SUCCESS CRITERIA';
    if (!allTargetsMet) {
      if (r2Target && accuracyTarget) status = 'Ad Efficiency Below Target';
      else if (r2Target && roiTarget) status = 'Accuracy Gain Below Target';
      else if (accuracyTarget && roiTarget) status = 'Model R² Below Target';
      else status = 'MULTIPLE CRITERIA FAILING';
    }

    return {
      run_date: record.run_date,
      model_version: record.model_version,
      r2: Number(record.r2).toFixed(3),
      rmse: Number(record.rmse).toFixed(2),
      mape: Number(record.mape || 0).toFixed(2),
      accuracy_gain_mom: Number(record.accuracy_gain_mom || 0).toFixed(2),
      ad_efficiency_gain: Number(record.delta_roi || 0).toFixed(2),
      success_status: status,
      icon: allTargetsMet ? '✅' : '⚠️',
      targets: {
        r2: r2Target,
        accuracy: accuracyTarget,
        roi: roiTarget
      }
    };
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    evaluations: results || []
  });
}

async function getCronHealth(supabase: any) {
  const { data, error } = await supabase
    .from('cron_job_health')
    .select('*')
    .order('job_name');

  if (error) throw error;

  const jobs = data?.map((job: any) => {
    const successRate = job.total_executions > 0
      ? ((job.total_successes / job.total_executions) * 100).toFixed(2)
      : '0.00';

    let scheduleStatus = '✓ On Schedule';
    if (job.last_run_at) {
      const lastRun = new Date(job.last_run_at).getTime();
      const now = Date.now();
      const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

      const expectedHours: Record<string, number> = {
        'retrain-aiv': 25,
        'evaluate-aiv': 169,
        'fraudguard-scan': 7,
        'predict-forecast': 169,
        'generate-roi-report': 745
      };

      if (expectedHours[job.job_name] && hoursSinceLastRun > expectedHours[job.job_name]) {
        scheduleStatus = `⏰ MISSED RUN (${Math.floor(hoursSinceLastRun)}h ago)`;
      }
    }

    return {
      job_name: job.job_name,
      endpoint: job.endpoint,
      schedule: job.schedule,
      last_run_at: job.last_run_at,
      last_success_at: job.last_success_at,
      consecutive_failures: job.consecutive_failures,
      total_executions: job.total_executions,
      success_rate: successRate + '%',
      avg_execution_time_ms: job.avg_execution_time_ms,
      health_status: job.health_status,
      status_icon: getHealthStatusIcon(job.health_status),
      schedule_status: scheduleStatus
    };
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    jobs: jobs || []
  });
}

async function getCriticalAlerts(supabase: any) {
  const alerts: any[] = [];

  // Model performance alerts
  const { data: modelAlerts } = await supabase
    .from('model_audit')
    .select('*')
    .lt('r2', 0.7)
    .gte('run_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  modelAlerts?.forEach((alert: any) => {
    alerts.push({
      alert_category: 'Model Performance',
      severity: 'critical',
      alert_message: `R² below threshold: ${Number(alert.r2).toFixed(3)}`,
      alert_time: alert.run_date,
      icon: '🚨'
    });
  });

  // Cron job health alerts
  const { data: cronAlerts } = await supabase
    .from('cron_job_health')
    .select('*')
    .in('health_status', ['critical', 'degraded']);

  cronAlerts?.forEach((alert: any) => {
    alerts.push({
      alert_category: 'Cron Job Health',
      severity: alert.health_status === 'critical' ? 'critical' : 'warning',
      alert_message: `${alert.job_name} - ${alert.consecutive_failures} consecutive failures`,
      alert_time: alert.last_run_at,
      icon: alert.health_status === 'critical' ? '🚨' : '⚠️'
    });
  });

  // High severity anomalies
  const { data: anomalyAlerts } = await supabase
    .from('review_anomalies')
    .select('*')
    .eq('severity', 'high')
    .eq('resolved', false)
    .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  anomalyAlerts?.forEach((alert: any) => {
    alerts.push({
      alert_category: 'Fraud Detection',
      severity: 'warning',
      alert_message: `${alert.dealer_name || alert.dealer_id} - ${alert.anomaly_type}`,
      alert_time: alert.detected_at,
      icon: '⚠️'
    });
  });

  // Sort by severity and time
  alerts.sort((a, b) => {
    const severityOrder = { critical: 1, warning: 2, info: 3 };
    const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
                        (severityOrder[b.severity as keyof typeof severityOrder] || 3);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.alert_time).getTime() - new Date(a.alert_time).getTime();
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    alert_count: alerts.length,
    critical_count: alerts.filter(a => a.severity === 'critical').length,
    warning_count: alerts.filter(a => a.severity === 'warning').length,
    alerts: alerts
  });
}

async function getModelEvolution(supabase: any) {
  const { data, error } = await supabase
    .from('model_weights')
    .select('*')
    .order('asof_date', { ascending: false })
    .limit(30);

  if (error) throw error;

  const evolution = data?.map((record: any, index: number) => {
    const maxWeightChange = index < data.length - 1 ? Math.max(
      Math.abs(record.seo_w - data[index + 1].seo_w),
      Math.abs(record.aeo_w - data[index + 1].aeo_w),
      Math.abs(record.geo_w - data[index + 1].geo_w),
      Math.abs(record.ugc_w - data[index + 1].ugc_w),
      Math.abs(record.geolocal_w - data[index + 1].geolocal_w)
    ) : null;

    return {
      asof_date: record.asof_date,
      seo_w: Number(record.seo_w).toFixed(3),
      aeo_w: Number(record.aeo_w).toFixed(3),
      geo_w: Number(record.geo_w).toFixed(3),
      ugc_w: Number(record.ugc_w).toFixed(3),
      geolocal_w: Number(record.geolocal_w).toFixed(3),
      r2: Number(record.r2 || 0).toFixed(3),
      rmse: Number(record.rmse || 0).toFixed(2),
      learning_rate: Number(record.learning_rate || 0).toFixed(4),
      max_weight_change: maxWeightChange ? maxWeightChange.toFixed(4) : null
    };
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    evolution: evolution || []
  });
}

async function getAnomalySummary(supabase: any) {
  const { data, error } = await supabase
    .from('review_anomalies')
    .select('*')
    .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('detected_at', { ascending: false });

  if (error) throw error;

  // Group by date
  const byDate: Record<string, any> = {};
  data?.forEach((anomaly: any) => {
    const date = anomaly.detected_at.split('T')[0];
    if (!byDate[date]) {
      byDate[date] = {
        scan_date: date,
        total_anomalies: 0,
        high_severity: 0,
        medium_severity: 0,
        low_severity: 0,
        resolved_count: 0,
        unresolved_count: 0,
        anomaly_types: new Set()
      };
    }
    byDate[date].total_anomalies++;
    if (anomaly.severity === 'high') byDate[date].high_severity++;
    if (anomaly.severity === 'medium') byDate[date].medium_severity++;
    if (anomaly.severity === 'low') byDate[date].low_severity++;
    if (anomaly.resolved) byDate[date].resolved_count++;
    else byDate[date].unresolved_count++;
    byDate[date].anomaly_types.add(anomaly.anomaly_type);
  });

  const summary = Object.values(byDate).map((day: any) => ({
    ...day,
    anomaly_types: Array.from(day.anomaly_types)
  }));

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    summary: summary
  });
}

async function getForecastAccuracy(supabase: any) {
  const { data, error } = await supabase
    .from('forecasts')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const forecasts = data?.map((forecast: any) => ({
    dealer_id: forecast.dealer_id,
    forecast_date: forecast.forecast_date,
    forecast_week: forecast.forecast_week,
    aiv_forecast: Number(forecast.aiv_forecast || 0).toFixed(2),
    aiv_lower_bound: Number(forecast.aiv_lower_bound || 0).toFixed(2),
    aiv_upper_bound: Number(forecast.aiv_upper_bound || 0).toFixed(2),
    confidence: Number(forecast.confidence || 0).toFixed(2),
    confidence_level:
      forecast.confidence < 0.6 ? '⚠️ Low Confidence' :
      forecast.confidence >= 0.8 ? '✅ High Confidence' :
      '➡️ Medium Confidence'
  }));

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    forecasts: forecasts || []
  });
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'OPTIMAL': return '✅';
    case 'NOMINAL': return '➡️';
    case 'DEGRADED': return '⚠️';
    case 'CRITICAL': return '🚨';
    default: return '❓';
  }
}

function getHealthStatusIcon(status: string): string {
  switch (status) {
    case 'healthy': return '✅';
    case 'degraded': return '⚠️';
    case 'critical': return '🚨';
    default: return '❓';
  }
}
