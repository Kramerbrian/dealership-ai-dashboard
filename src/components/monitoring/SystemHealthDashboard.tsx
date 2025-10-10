'use client';

import { useEffect, useState } from 'react';

interface SystemHealth {
  overall_status: string;
  status_icon: string;
  model_performance: {
    r2: string;
    rmse: string;
    accuracy_gain_mom: string;
    ad_efficiency_gain: string;
    last_evaluation: string;
  } | null;
  success_criteria: {
    status: string;
    icon: string;
    r2_target: boolean;
    accuracy_target: boolean;
    roi_target: boolean;
  };
  cron_health: {
    status: string;
    icon: string;
    total_jobs: number;
    healthy: number;
    degraded: number;
    critical: number;
  };
  anomaly_detection: {
    last_24h: number;
    unresolved_high_severity: number;
  };
}

interface Alert {
  category: string;
  severity: string;
  title: string;
  message: string;
  action: string;
  icon: string;
  timestamp?: string;
}

export function SystemHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemHealth = async () => {
    try {
      const [healthRes, alertsRes] = await Promise.all([
        fetch('/api/monitoring/system-health?query=executive-summary'),
        fetch('/api/monitoring/system-health?query=critical-alerts')
      ]);

      const healthData = await healthRes.json();
      const alertsData = await alertsRes.json();

      if (healthData.success) {
        setHealth(healthData);
        setLastUpdate(new Date().toLocaleTimeString());
      }

      if (alertsData.success) {
        setAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="system-health-dashboard loading">
        <div className="loading-spinner">Loading system health...</div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="system-health-dashboard error">
        <p>Failed to load system health data</p>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="system-health-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>System Health Monitor</h2>
        <div className="header-controls">
          <span className="last-update">Last update: {lastUpdate}</span>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={fetchSystemHealth} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overall Status Card */}
      <div className={`status-card overall-status ${health.overall_status.toLowerCase()}`}>
        <div className="status-icon">{health.status_icon}</div>
        <div className="status-info">
          <h3>Overall System Status</h3>
          <p className="status-value">{health.overall_status}</p>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3>
            Active Alerts
            {criticalAlerts.length > 0 && (
              <span className="critical-badge">
                {criticalAlerts.length} Critical
              </span>
            )}
          </h3>
          <div className="alerts-grid">
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={`alert-card ${alert.severity}`}
              >
                <div className="alert-header">
                  <span className="alert-icon">{alert.icon}</span>
                  <span className="alert-category">{alert.category}</span>
                  <span className="alert-severity">{alert.severity}</span>
                </div>
                <h4>{alert.title}</h4>
                <p className="alert-message">{alert.message}</p>
                <p className="alert-action">
                  <strong>Action:</strong> {alert.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Model Performance */}
        <div className="metric-card model-performance">
          <h3>Model Performance</h3>
          {health.model_performance ? (
            <div className="metrics">
              <div className="metric">
                <span className="metric-label">R² Score</span>
                <span className="metric-value">{health.model_performance.r2}</span>
                <span className="metric-target">Target: ≥0.80</span>
              </div>
              <div className="metric">
                <span className="metric-label">RMSE</span>
                <span className="metric-value">{health.model_performance.rmse}</span>
                <span className="metric-target">Target: &lt;3.5</span>
              </div>
              <div className="metric">
                <span className="metric-label">Accuracy Gain (MoM)</span>
                <span className="metric-value">{health.model_performance.accuracy_gain_mom}%</span>
                <span className="metric-target">Target: ≥10%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Ad Efficiency Gain</span>
                <span className="metric-value">{health.model_performance.ad_efficiency_gain}%</span>
                <span className="metric-target">Target: ≥15%</span>
              </div>
              <p className="last-eval">
                Last evaluated: {new Date(health.model_performance.last_evaluation).toLocaleString()}
              </p>
            </div>
          ) : (
            <p>No evaluation data available</p>
          )}
        </div>

        {/* Success Criteria */}
        <div className={`metric-card success-criteria ${health.success_criteria.status.includes('MEETING') ? 'success' : 'warning'}`}>
          <h3>
            {health.success_criteria.icon} Success Criteria
          </h3>
          <p className="status-text">{health.success_criteria.status}</p>
          <div className="criteria-checks">
            <div className={`check ${health.success_criteria.r2_target ? 'pass' : 'fail'}`}>
              {health.success_criteria.r2_target ? '✅' : '❌'} R² ≥ 0.8
            </div>
            <div className={`check ${health.success_criteria.accuracy_target ? 'pass' : 'fail'}`}>
              {health.success_criteria.accuracy_target ? '✅' : '❌'} Accuracy Gain ≥ 10%
            </div>
            <div className={`check ${health.success_criteria.roi_target ? 'pass' : 'fail'}`}>
              {health.success_criteria.roi_target ? '✅' : '❌'} ROI Gain ≥ 15%
            </div>
          </div>
        </div>

        {/* Cron Job Health */}
        <div className={`metric-card cron-health ${health.cron_health.status.toLowerCase()}`}>
          <h3>
            {health.cron_health.icon} Cron Jobs
          </h3>
          <p className="status-text">{health.cron_health.status}</p>
          <div className="job-stats">
            <div className="stat">
              <span className="stat-value">{health.cron_health.total_jobs}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
            <div className="stat healthy">
              <span className="stat-value">{health.cron_health.healthy}</span>
              <span className="stat-label">Healthy</span>
            </div>
            {health.cron_health.degraded > 0 && (
              <div className="stat degraded">
                <span className="stat-value">{health.cron_health.degraded}</span>
                <span className="stat-label">Degraded</span>
              </div>
            )}
            {health.cron_health.critical > 0 && (
              <div className="stat critical">
                <span className="stat-value">{health.cron_health.critical}</span>
                <span className="stat-label">Critical</span>
              </div>
            )}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="metric-card anomaly-detection">
          <h3>🔍 Fraud Detection</h3>
          <div className="anomaly-stats">
            <div className="stat">
              <span className="stat-value">{health.anomaly_detection.last_24h}</span>
              <span className="stat-label">Anomalies (24h)</span>
            </div>
            {health.anomaly_detection.unresolved_high_severity > 0 && (
              <div className="stat warning">
                <span className="stat-value">{health.anomaly_detection.unresolved_high_severity}</span>
                <span className="stat-label">High Severity (Unresolved)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .system-health-dashboard {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .last-update {
          color: #666;
          font-size: 14px;
        }

        .auto-refresh-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .refresh-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-btn:hover {
          background: #f5f5f5;
        }

        .status-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          background: white;
          border: 2px solid #ddd;
        }

        .status-card.optimal {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .status-card.nominal {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .status-card.degraded {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .status-card.critical {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .status-icon {
          font-size: 48px;
        }

        .status-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #666;
        }

        .status-value {
          font-size: 28px;
          font-weight: 700;
        }

        .alerts-section {
          margin-bottom: 24px;
        }

        .alerts-section h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .critical-badge {
          background: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }

        .alert-card {
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid;
          background: white;
        }

        .alert-card.critical {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .alert-card.warning {
          border-left-color: #f59e0b;
          background: #fffbeb;
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .alert-category {
          font-size: 12px;
          color: #666;
          flex: 1;
        }

        .alert-severity {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(0,0,0,0.1);
        }

        .alert-card h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .alert-message {
          font-size: 14px;
          color: #444;
          margin-bottom: 12px;
        }

        .alert-action {
          font-size: 13px;
          color: #666;
          padding: 8px;
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .metric-card {
          padding: 20px;
          border-radius: 12px;
          background: white;
          border: 1px solid #ddd;
        }

        .metric-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        .metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 12px;
          align-items: baseline;
        }

        .metric-label {
          font-size: 14px;
          color: #666;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 700;
          text-align: right;
        }

        .metric-target {
          font-size: 12px;
          color: #999;
        }

        .last-eval {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
        }

        .status-text {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .criteria-checks {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .check {
          padding: 8px;
          border-radius: 6px;
          font-size: 14px;
        }

        .check.pass {
          background: #ecfdf5;
          color: #065f46;
        }

        .check.fail {
          background: #fef2f2;
          color: #991b1b;
        }

        .job-stats,
        .anomaly-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 12px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          background: #f9fafb;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          text-align: center;
        }

        .stat.healthy {
          background: #ecfdf5;
          color: #065f46;
        }

        .stat.degraded {
          background: #fffbeb;
          color: #92400e;
        }

        .stat.critical {
          background: #fef2f2;
          color: #991b1b;
        }

        .stat.warning {
          background: #fffbeb;
          color: #92400e;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }

        .error {
          text-align: center;
          padding: 40px;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
