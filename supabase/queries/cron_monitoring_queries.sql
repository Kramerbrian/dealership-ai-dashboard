-- ============================================================================
-- VERCEL CRON MONITORING QUERIES
-- SQL queries for monitoring autonomous AIV system health
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MODEL PERFORMANCE CONTROL RULES
-- ----------------------------------------------------------------------------

-- Check if model performance is below acceptable thresholds
-- Action: Alert if R² < 0.7 or RMSE > 3.5
SELECT
  run_id,
  run_date,
  run_type,
  dealer_id,
  r2,
  rmse,
  mape,
  accuracy_gain_mom,
  delta_roi,
  CASE
    WHEN r2 < 0.7 THEN 'ALERT: Low R² - Model accuracy degraded'
    WHEN rmse > 3.5 THEN 'ALERT: High RMSE - Prediction errors too large'
    ELSE 'OK'
  END as alert_status
FROM model_audit
WHERE r2 < 0.7 OR rmse > 3.5
ORDER BY run_date DESC
LIMIT 20;

-- ----------------------------------------------------------------------------
-- 2. SUCCESS CRITERIA DASHBOARD
-- Check if system is meeting target KPIs (≥10% accuracy, ≥15% ad efficiency, ≥0.8 R²)
-- ----------------------------------------------------------------------------

SELECT
  run_date,
  model_version,
  r2,
  rmse,
  mape,
  accuracy_gain_mom,
  delta_roi as ad_efficiency_gain,
  CASE
    WHEN r2 >= 0.8 AND accuracy_gain_mom >= 10 AND delta_roi >= 15
    THEN '✅ MEETING ALL SUCCESS CRITERIA'
    WHEN r2 >= 0.8 AND accuracy_gain_mom >= 10
    THEN '⚠️ Ad Efficiency Below Target'
    WHEN r2 >= 0.8 AND delta_roi >= 15
    THEN '⚠️ Accuracy Gain Below Target'
    WHEN accuracy_gain_mom >= 10 AND delta_roi >= 15
    THEN '⚠️ Model R² Below Target'
    ELSE '❌ MULTIPLE CRITERIA FAILING'
  END as success_status
FROM model_audit
WHERE run_type = 'evaluate'
ORDER BY run_date DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- 3. MONTH-OVER-MONTH TREND ANALYSIS
-- Track if model is improving or degrading
-- ----------------------------------------------------------------------------

WITH monthly_metrics AS (
  SELECT
    DATE_TRUNC('month', run_date) as month,
    AVG(r2) as avg_r2,
    AVG(rmse) as avg_rmse,
    AVG(accuracy_gain_mom) as avg_accuracy_gain,
    AVG(delta_roi) as avg_ad_efficiency,
    COUNT(*) as eval_count
  FROM model_audit
  WHERE run_type = 'evaluate'
  GROUP BY DATE_TRUNC('month', run_date)
)
SELECT
  month,
  ROUND(avg_r2::numeric, 3) as avg_r2,
  ROUND(avg_rmse::numeric, 2) as avg_rmse,
  ROUND(avg_accuracy_gain::numeric, 2) as avg_accuracy_gain_pct,
  ROUND(avg_ad_efficiency::numeric, 2) as avg_ad_efficiency_pct,
  eval_count,
  CASE
    WHEN avg_r2 > LAG(avg_r2) OVER (ORDER BY month) THEN '📈 Improving'
    WHEN avg_r2 < LAG(avg_r2) OVER (ORDER BY month) THEN '📉 Degrading'
    ELSE '➡️ Stable'
  END as trend
FROM monthly_metrics
ORDER BY month DESC
LIMIT 6;

-- ----------------------------------------------------------------------------
-- 4. CRON JOB HEALTH CHECK
-- Verify all 5 cron jobs are running successfully
-- ----------------------------------------------------------------------------

SELECT
  job_name,
  endpoint,
  schedule,
  last_run_at,
  last_success_at,
  consecutive_failures,
  total_executions,
  total_successes,
  total_failures,
  ROUND((total_successes::numeric / NULLIF(total_executions, 0)::numeric * 100), 2) as success_rate_pct,
  avg_execution_time_ms,
  health_status,
  CASE
    WHEN health_status = 'critical' THEN '🚨 IMMEDIATE ACTION REQUIRED'
    WHEN health_status = 'degraded' THEN '⚠️ NEEDS ATTENTION'
    WHEN health_status = 'healthy' THEN '✅ OK'
    ELSE '❓ UNKNOWN'
  END as status_emoji,
  CASE
    WHEN last_run_at < NOW() - INTERVAL '25 hours' AND schedule = '0 0 * * *' THEN '⏰ MISSED DAILY RUN'
    WHEN last_run_at < NOW() - INTERVAL '8 days' AND schedule = '0 0 * * 0' THEN '⏰ MISSED WEEKLY RUN'
    WHEN last_run_at < NOW() - INTERVAL '7 hours' AND schedule = '0 */6 * * *' THEN '⏰ MISSED 6-HOUR RUN'
    WHEN last_run_at < NOW() - INTERVAL '32 days' AND schedule = '0 0 1 * *' THEN '⏰ MISSED MONTHLY RUN'
    ELSE '✓ On Schedule'
  END as schedule_status
FROM cron_job_health
ORDER BY
  CASE health_status
    WHEN 'critical' THEN 1
    WHEN 'degraded' THEN 2
    ELSE 3
  END,
  job_name;

-- ----------------------------------------------------------------------------
-- 5. RECENT CRON EXECUTION HISTORY
-- Review last 24 hours of cron job runs
-- ----------------------------------------------------------------------------

SELECT
  job_name,
  endpoint,
  started_at,
  completed_at,
  status,
  status_code,
  execution_time_ms,
  error_message,
  CASE
    WHEN status = 'success' THEN '✅'
    WHEN status = 'failed' THEN '❌'
    ELSE '⏳'
  END as status_icon
FROM cron_job_executions
WHERE started_at >= NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC
LIMIT 50;

-- ----------------------------------------------------------------------------
-- 6. ANOMALY DETECTION SUMMARY
-- Review FraudGuard scan results
-- ----------------------------------------------------------------------------

SELECT
  DATE(detected_at) as scan_date,
  COUNT(*) as total_anomalies,
  COUNT(*) FILTER (WHERE severity = 'high') as high_severity,
  COUNT(*) FILTER (WHERE severity = 'medium') as medium_severity,
  COUNT(*) FILTER (WHERE severity = 'low') as low_severity,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_count,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count,
  ARRAY_AGG(DISTINCT anomaly_type) as anomaly_types
FROM review_anomalies
WHERE detected_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(detected_at)
ORDER BY scan_date DESC;

-- ----------------------------------------------------------------------------
-- 7. FORECAST ACCURACY CHECK
-- Compare predicted vs actual AIV (when actual data becomes available)
-- ----------------------------------------------------------------------------

SELECT
  f.dealer_id,
  f.forecast_date,
  f.aiv_forecast,
  f.aiv_lower_bound,
  f.aiv_upper_bound,
  f.confidence,
  -- Compare to actual if exists
  CASE
    WHEN f.confidence < 0.6 THEN '⚠️ Low Confidence'
    WHEN f.confidence >= 0.8 THEN '✅ High Confidence'
    ELSE '➡️ Medium Confidence'
  END as confidence_level
FROM forecasts f
WHERE f.created_at >= NOW() - INTERVAL '30 days'
ORDER BY f.created_at DESC, f.forecast_week ASC
LIMIT 50;

-- ----------------------------------------------------------------------------
-- 8. MODEL WEIGHT EVOLUTION
-- Track how pillar weights are changing over time
-- ----------------------------------------------------------------------------

SELECT
  asof_date,
  ROUND(seo_w::numeric, 3) as seo_w,
  ROUND(aeo_w::numeric, 3) as aeo_w,
  ROUND(geo_w::numeric, 3) as geo_w,
  ROUND(ugc_w::numeric, 3) as ugc_w,
  ROUND(geolocal_w::numeric, 3) as geolocal_w,
  ROUND(r2::numeric, 3) as r2,
  ROUND(rmse::numeric, 2) as rmse,
  ROUND(learning_rate::numeric, 4) as learning_rate,
  -- Calculate largest weight change from previous day
  CASE
    WHEN LAG(seo_w) OVER (ORDER BY asof_date) IS NOT NULL THEN
      GREATEST(
        ABS(seo_w - LAG(seo_w) OVER (ORDER BY asof_date)),
        ABS(aeo_w - LAG(aeo_w) OVER (ORDER BY asof_date)),
        ABS(geo_w - LAG(geo_w) OVER (ORDER BY asof_date)),
        ABS(ugc_w - LAG(ugc_w) OVER (ORDER BY asof_date)),
        ABS(geolocal_w - LAG(geolocal_w) OVER (ORDER BY asof_date))
      )
    ELSE NULL
  END as max_weight_change
FROM model_weights
ORDER BY asof_date DESC
LIMIT 30;

-- ----------------------------------------------------------------------------
-- 9. CRITICAL ALERTS DASHBOARD
-- All items requiring immediate attention
-- ----------------------------------------------------------------------------

WITH alert_sources AS (
  -- Model performance alerts
  SELECT
    'Model Performance' as alert_category,
    'critical' as severity,
    'R² below threshold: ' || ROUND(r2::numeric, 3) as alert_message,
    run_date as alert_time
  FROM model_audit
  WHERE r2 < 0.7 AND run_date >= NOW() - INTERVAL '7 days'

  UNION ALL

  -- Cron job health alerts
  SELECT
    'Cron Job Health' as alert_category,
    CASE
      WHEN health_status = 'critical' THEN 'critical'
      ELSE 'warning'
    END as severity,
    job_name || ' - ' || consecutive_failures || ' consecutive failures' as alert_message,
    last_run_at as alert_time
  FROM cron_job_health
  WHERE health_status IN ('critical', 'degraded')

  UNION ALL

  -- High severity anomalies
  SELECT
    'Fraud Detection' as alert_category,
    'warning' as severity,
    dealer_name || ' - ' || anomaly_type as alert_message,
    detected_at as alert_time
  FROM review_anomalies
  WHERE severity = 'high'
    AND resolved = false
    AND detected_at >= NOW() - INTERVAL '7 days'
)
SELECT
  alert_category,
  severity,
  alert_message,
  alert_time,
  CASE
    WHEN severity = 'critical' THEN '🚨'
    WHEN severity = 'warning' THEN '⚠️'
    ELSE 'ℹ️'
  END as icon
FROM alert_sources
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'warning' THEN 2
    ELSE 3
  END,
  alert_time DESC;

-- ----------------------------------------------------------------------------
-- 10. SYSTEM HEALTH EXECUTIVE SUMMARY
-- One-query overview of entire system status
-- ----------------------------------------------------------------------------

WITH latest_eval AS (
  SELECT * FROM model_audit
  WHERE run_type = 'evaluate'
  ORDER BY run_date DESC
  LIMIT 1
),
cron_summary AS (
  SELECT
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE health_status = 'healthy') as healthy_jobs,
    COUNT(*) FILTER (WHERE health_status = 'critical') as critical_jobs
  FROM cron_job_health
),
anomaly_summary AS (
  SELECT
    COUNT(*) FILTER (WHERE detected_at >= NOW() - INTERVAL '24 hours') as last_24h_anomalies,
    COUNT(*) FILTER (WHERE severity = 'high' AND resolved = false) as unresolved_high_severity
  FROM review_anomalies
)
SELECT
  -- Model Performance
  ROUND(le.r2::numeric, 3) as model_r2,
  ROUND(le.rmse::numeric, 2) as model_rmse,
  ROUND(le.accuracy_gain_mom::numeric, 2) as accuracy_gain_mom_pct,
  ROUND(le.delta_roi::numeric, 2) as ad_efficiency_gain_pct,

  -- Success Criteria Status
  CASE
    WHEN le.r2 >= 0.8 AND le.accuracy_gain_mom >= 10 AND le.delta_roi >= 15
    THEN '✅ MEETING ALL TARGETS'
    ELSE '❌ BELOW TARGET'
  END as success_criteria_status,

  -- Cron Job Health
  cs.total_jobs,
  cs.healthy_jobs,
  cs.critical_jobs,
  CASE
    WHEN cs.critical_jobs > 0 THEN '🚨 CRITICAL'
    WHEN cs.healthy_jobs = cs.total_jobs THEN '✅ HEALTHY'
    ELSE '⚠️ DEGRADED'
  END as cron_health_status,

  -- Anomaly Detection
  ans.last_24h_anomalies,
  ans.unresolved_high_severity,

  -- Overall System Status
  CASE
    WHEN cs.critical_jobs > 0 OR le.r2 < 0.6 THEN '🚨 SYSTEM CRITICAL'
    WHEN le.r2 < 0.7 OR cs.critical_jobs = 0 AND cs.healthy_jobs < cs.total_jobs THEN '⚠️ SYSTEM DEGRADED'
    WHEN le.r2 >= 0.8 AND le.accuracy_gain_mom >= 10 AND le.delta_roi >= 15 AND cs.healthy_jobs = cs.total_jobs
    THEN '✅ SYSTEM OPTIMAL'
    ELSE '➡️ SYSTEM NOMINAL'
  END as overall_system_status,

  NOW() as checked_at
FROM latest_eval le
CROSS JOIN cron_summary cs
CROSS JOIN anomaly_summary ans;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to quickly check if any alerts exist
CREATE OR REPLACE FUNCTION has_critical_alerts()
RETURNS BOOLEAN AS $$
DECLARE
  critical_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO critical_count
  FROM (
    SELECT 1 FROM model_audit WHERE r2 < 0.7 AND run_date >= NOW() - INTERVAL '7 days'
    UNION ALL
    SELECT 1 FROM cron_job_health WHERE health_status = 'critical'
  ) alerts;

  RETURN critical_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT has_critical_alerts();

-- ============================================================================
-- RECOMMENDED MONITORING SCHEDULE
-- ============================================================================

-- Run Query #10 (Executive Summary) - Every hour via dashboard
-- Run Query #4 (Cron Health Check) - Every 15 minutes via monitoring service
-- Run Query #9 (Critical Alerts) - Every 5 minutes via alerting service
-- Run Query #1 (Control Rules) - After each model evaluation
-- Run Query #2 (Success Criteria) - Daily for reporting
