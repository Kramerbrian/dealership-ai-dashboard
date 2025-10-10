import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Automated Alerting System
 * Checks system health and sends alerts when thresholds are breached
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { check = 'all', notify = false } = body;

    const alerts: any[] = [];

    // Check model performance
    if (check === 'all' || check === 'model') {
      const modelAlerts = await checkModelPerformance(supabase);
      alerts.push(...modelAlerts);
    }

    // Check cron job health
    if (check === 'all' || check === 'cron') {
      const cronAlerts = await checkCronHealth(supabase);
      alerts.push(...cronAlerts);
    }

    // Check for anomalies
    if (check === 'all' || check === 'anomaly') {
      const anomalyAlerts = await checkAnomalies(supabase);
      alerts.push(...anomalyAlerts);
    }

    // Send notifications if requested and alerts exist
    if (notify && alerts.length > 0) {
      await sendAlertNotifications(alerts);
    }

    // Log alerts to database
    if (alerts.length > 0) {
      await logAlerts(supabase, alerts);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alert_count: alerts.length,
      critical_count: alerts.filter(a => a.severity === 'critical').length,
      warning_count: alerts.filter(a => a.severity === 'warning').length,
      alerts: alerts,
      notifications_sent: notify && alerts.length > 0
    });

  } catch (error) {
    console.error('Alert checking error:', error);
    return NextResponse.json(
      {
        error: "Failed to check alerts",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const hours = parseInt(url.searchParams.get('hours') || '24');

    // Get recent alerts from database
    const { data, error } = await supabase
      .from('system_alerts')
      .select('*')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      hours: hours,
      alert_count: data?.length || 0,
      alerts: data || []
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      {
        error: "Failed to retrieve alerts",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function checkModelPerformance(supabase: any): Promise<any[]> {
  const alerts: any[] = [];

  // Check latest evaluation
  const { data: latestEval } = await supabase
    .from('model_audit')
    .select('*')
    .eq('run_type', 'evaluate')
    .order('run_date', { ascending: false })
    .limit(1)
    .single();

  if (latestEval) {
    // Critical: R² below 0.6
    if (latestEval.r2 < 0.6) {
      alerts.push({
        category: 'Model Performance',
        severity: 'critical',
        title: 'Critical Model Accuracy Degradation',
        message: `Model R² is critically low: ${latestEval.r2.toFixed(3)} (threshold: 0.6)`,
        metric: 'r2',
        value: latestEval.r2,
        threshold: 0.6,
        action: 'Immediate investigation required. Model may need retraining with fresh data.',
        timestamp: latestEval.run_date
      });
    }
    // Warning: R² below 0.7
    else if (latestEval.r2 < 0.7) {
      alerts.push({
        category: 'Model Performance',
        severity: 'warning',
        title: 'Model Accuracy Below Target',
        message: `Model R² is below target: ${latestEval.r2.toFixed(3)} (target: 0.7+)`,
        metric: 'r2',
        value: latestEval.r2,
        threshold: 0.7,
        action: 'Monitor closely. Consider retraining if degradation continues.',
        timestamp: latestEval.run_date
      });
    }

    // Critical: RMSE above 5.0
    if (latestEval.rmse > 5.0) {
      alerts.push({
        category: 'Model Performance',
        severity: 'critical',
        title: 'High Prediction Error',
        message: `Model RMSE is critically high: ${latestEval.rmse.toFixed(2)} (threshold: 5.0)`,
        metric: 'rmse',
        value: latestEval.rmse,
        threshold: 5.0,
        action: 'Review data quality and feature engineering. Model predictions unreliable.',
        timestamp: latestEval.run_date
      });
    }
    // Warning: RMSE above 3.5
    else if (latestEval.rmse > 3.5) {
      alerts.push({
        category: 'Model Performance',
        severity: 'warning',
        title: 'Elevated Prediction Error',
        message: `Model RMSE is above target: ${latestEval.rmse.toFixed(2)} (target: <3.5)`,
        metric: 'rmse',
        value: latestEval.rmse,
        threshold: 3.5,
        action: 'Monitor prediction accuracy. Review recent data for quality issues.',
        timestamp: latestEval.run_date
      });
    }

    // Check success criteria
    if (latestEval.accuracy_gain_mom < 10) {
      alerts.push({
        category: 'Success Criteria',
        severity: 'warning',
        title: 'Accuracy Gain Below Target',
        message: `MoM accuracy gain: ${latestEval.accuracy_gain_mom?.toFixed(2) || 0}% (target: ≥10%)`,
        metric: 'accuracy_gain_mom',
        value: latestEval.accuracy_gain_mom || 0,
        threshold: 10,
        action: 'Review model training process and learning rate adjustments.',
        timestamp: latestEval.run_date
      });
    }

    if (latestEval.delta_roi < 15) {
      alerts.push({
        category: 'Success Criteria',
        severity: 'warning',
        title: 'Ad Efficiency Below Target',
        message: `Ad efficiency gain: ${latestEval.delta_roi?.toFixed(2) || 0}% (target: ≥15%)`,
        metric: 'delta_roi',
        value: latestEval.delta_roi || 0,
        threshold: 15,
        action: 'Review ad spend optimization recommendations and implementation.',
        timestamp: latestEval.run_date
      });
    }
  }

  return alerts;
}

async function checkCronHealth(supabase: any): Promise<any[]> {
  const alerts: any[] = [];

  const { data: cronJobs } = await supabase
    .from('cron_job_health')
    .select('*');

  cronJobs?.forEach((job: any) => {
    // Critical: Job has failed 2+ times consecutively
    if (job.consecutive_failures >= 2) {
      alerts.push({
        category: 'Cron Job',
        severity: 'critical',
        title: `${job.job_name} Failed Multiple Times`,
        message: `${job.consecutive_failures} consecutive failures`,
        metric: 'consecutive_failures',
        value: job.consecutive_failures,
        threshold: 2,
        action: `Check Vercel logs for ${job.endpoint}. Verify environment variables and API connectivity.`,
        timestamp: job.last_run_at,
        job_name: job.job_name
      });
    }
    // Warning: Job has failed once
    else if (job.consecutive_failures === 1) {
      alerts.push({
        category: 'Cron Job',
        severity: 'warning',
        title: `${job.job_name} Failed`,
        message: 'Single failure detected',
        metric: 'consecutive_failures',
        value: 1,
        threshold: 1,
        action: 'Monitor next execution. May be transient issue.',
        timestamp: job.last_run_at,
        job_name: job.job_name
      });
    }

    // Warning: Success rate below 80%
    const successRate = job.total_executions > 0
      ? (job.total_successes / job.total_executions) * 100
      : 100;

    if (successRate < 80 && job.total_executions >= 5) {
      alerts.push({
        category: 'Cron Job',
        severity: 'warning',
        title: `${job.job_name} Low Success Rate`,
        message: `Success rate: ${successRate.toFixed(1)}% (target: ≥80%)`,
        metric: 'success_rate',
        value: successRate,
        threshold: 80,
        action: 'Review error logs and address underlying issues.',
        timestamp: job.last_run_at,
        job_name: job.job_name
      });
    }

    // Warning: Job hasn't run in expected timeframe
    if (job.last_run_at) {
      const lastRun = new Date(job.last_run_at).getTime();
      const now = Date.now();
      const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

      const expectedHours: Record<string, { max: number; label: string }> = {
        'retrain-aiv': { max: 25, label: 'daily' },
        'evaluate-aiv': { max: 169, label: 'weekly' },
        'fraudguard-scan': { max: 7, label: '6-hour' },
        'predict-forecast': { max: 169, label: 'weekly' },
        'generate-roi-report': { max: 745, label: 'monthly' }
      };

      const expected = expectedHours[job.job_name];
      if (expected && hoursSinceLastRun > expected.max) {
        alerts.push({
          category: 'Cron Job',
          severity: 'warning',
          title: `${job.job_name} Missed Execution`,
          message: `Job has not run in ${Math.floor(hoursSinceLastRun)} hours (expected: ${expected.label})`,
          metric: 'hours_since_last_run',
          value: hoursSinceLastRun,
          threshold: expected.max,
          action: 'Check Vercel cron configuration. Verify job is enabled in production.',
          timestamp: new Date().toISOString(),
          job_name: job.job_name
        });
      }
    }
  });

  return alerts;
}

async function checkAnomalies(supabase: any): Promise<any[]> {
  const alerts: any[] = [];

  // Check for unresolved high-severity anomalies
  const { data: highSeverityAnomalies } = await supabase
    .from('review_anomalies')
    .select('*')
    .eq('severity', 'high')
    .eq('resolved', false)
    .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (highSeverityAnomalies && highSeverityAnomalies.length > 0) {
    alerts.push({
      category: 'Fraud Detection',
      severity: 'warning',
      title: 'Unresolved High-Severity Anomalies',
      message: `${highSeverityAnomalies.length} high-severity anomalies detected in last 24 hours`,
      metric: 'unresolved_high_severity',
      value: highSeverityAnomalies.length,
      threshold: 1,
      action: 'Review anomalies and take corrective action. Investigate dealers flagged for suspicious activity.',
      timestamp: new Date().toISOString(),
      details: highSeverityAnomalies.slice(0, 5).map((a: any) => ({
        dealer_id: a.dealer_id,
        dealer_name: a.dealer_name,
        anomaly_type: a.anomaly_type,
        confidence_score: a.confidence_score
      }))
    });
  }

  return alerts;
}

async function sendAlertNotifications(alerts: any[]): Promise<void> {
  // Filter critical alerts for immediate notification
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  if (criticalAlerts.length > 0) {
    console.log('🚨 CRITICAL ALERTS DETECTED:', criticalAlerts.length);
    criticalAlerts.forEach(alert => {
      console.log(`  - ${alert.title}: ${alert.message}`);
    });

    // TODO: Integrate with notification service (Slack, email, etc.)
    // Example integrations:
    // - Slack webhook: await fetch(SLACK_WEBHOOK_URL, { method: 'POST', body: JSON.stringify(slackMessage) })
    // - Email: await sendEmail({ to: ADMIN_EMAIL, subject: 'Critical Alert', body: alertSummary })
    // - SMS: await twilioClient.messages.create({ to: ADMIN_PHONE, body: alertSummary })
  }

  // Log all alerts
  if (alerts.length > 0) {
    console.log(`⚠️  Total alerts: ${alerts.length} (${criticalAlerts.length} critical)`);
  }
}

async function logAlerts(supabase: any, alerts: any[]): Promise<void> {
  const alertRecords = alerts.map(alert => ({
    category: alert.category,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    metric: alert.metric,
    value: alert.value,
    threshold: alert.threshold,
    action: alert.action,
    job_name: alert.job_name,
    details: alert.details,
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('system_alerts')
    .insert(alertRecords);

  if (error) {
    console.error('Failed to log alerts to database:', error);
  }
}
