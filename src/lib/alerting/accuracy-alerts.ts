/**
 * Accuracy Monitoring Alerting System
 * Handles notifications for threshold breaches in AI accuracy metrics
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface AlertNotification {
  id: string;
  tenantId: string;
  metricName: string;
  metricValue: number;
  thresholdValue: number;
  severity: 'warning' | 'critical';
  triggeredAt: string;
  message: string;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'console';
  enabled: boolean;
  config?: any;
}

/**
 * Check if alert should be sent (respects cooldown period)
 */
async function shouldSendAlert(
  tenantId: string,
  metricName: string,
  cooldownMinutes: number = 60
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check for recent alerts
  const cooldownDate = new Date(Date.now() - cooldownMinutes * 60 * 1000);

  const { data, error } = await supabase
    .from('accuracy_alerts')
    .select('triggered_at')
    .eq('tenant_id', tenantId)
    .eq('metric_name', metricName)
    .gte('triggered_at', cooldownDate.toISOString())
    .order('triggered_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking alert cooldown:', error);
    return true; // Allow alert on error
  }

  // No recent alerts, can send
  return !data || data.length === 0;
}

/**
 * Format alert message
 */
function formatAlertMessage(alert: AlertNotification): string {
  const severity = alert.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING';
  const percentage = (alert.metricValue * 100).toFixed(1);
  const thresholdPercentage = (alert.thresholdValue * 100).toFixed(1);

  return `
${severity} Alert: ${alert.metricName}

Metric Value: ${percentage}%
Threshold: ${thresholdPercentage}%
Severity: ${alert.severity.toUpperCase()}
Triggered At: ${new Date(alert.triggeredAt).toLocaleString()}

Action Required: Review accuracy monitoring dashboard and investigate root cause.
  `.trim();
}

/**
 * Send email notification
 */
async function sendEmailNotification(alert: AlertNotification, config?: any): Promise<boolean> {
  try {
    // Use Resend API if configured
    if (process.env.RESEND_API_KEY && config?.recipients) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: config?.from || 'alerts@dealershipai.com',
          to: config.recipients,
          subject: `${alert.severity === 'critical' ? 'CRITICAL' : 'Warning'}: ${alert.metricName} Alert`,
          html: `
            <h2>Accuracy Monitoring Alert</h2>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Metric:</strong> ${alert.metricName}</p>
            <p><strong>Current Value:</strong> ${(alert.metricValue * 100).toFixed(1)}%</p>
            <p><strong>Threshold:</strong> ${(alert.thresholdValue * 100).toFixed(1)}%</p>
            <p><strong>Time:</strong> ${new Date(alert.triggeredAt).toLocaleString()}</p>
            <hr>
            <p>Please review the accuracy monitoring dashboard to investigate this issue.</p>
            <a href="${config?.dashboardUrl || 'https://dash.dealershipai.com/monitoring'}">View Dashboard</a>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
        return false;
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(alert: AlertNotification, config?: any): Promise<boolean> {
  try {
    if (!config?.webhookUrl) {
      console.warn('Slack webhook URL not configured');
      return false;
    }

    const color = alert.severity === 'critical' ? '#dc2626' : '#f59e0b';
    const emoji = alert.severity === 'critical' ? ':rotating_light:' : ':warning:';

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${emoji} Accuracy Monitoring Alert`,
        attachments: [
          {
            color,
            title: `${alert.severity.toUpperCase()}: ${alert.metricName}`,
            fields: [
              {
                title: 'Current Value',
                value: `${(alert.metricValue * 100).toFixed(1)}%`,
                short: true,
              },
              {
                title: 'Threshold',
                value: `${(alert.thresholdValue * 100).toFixed(1)}%`,
                short: true,
              },
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Time',
                value: new Date(alert.triggeredAt).toLocaleString(),
                short: true,
              },
            ],
            footer: 'DealershipAI Monitoring',
            ts: Math.floor(new Date(alert.triggeredAt).getTime() / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

/**
 * Send webhook notification
 */
async function sendWebhookNotification(alert: AlertNotification, config?: any): Promise<boolean> {
  try {
    if (!config?.url) {
      console.warn('Webhook URL not configured');
      return false;
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      body: JSON.stringify({
        type: 'accuracy_alert',
        alert,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to send webhook notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    return false;
  }
}

/**
 * Log to console (useful for development)
 */
function logToConsole(alert: AlertNotification): boolean {
  console.log('\n' + '='.repeat(80));
  console.log('ACCURACY MONITORING ALERT');
  console.log('='.repeat(80));
  console.log(formatAlertMessage(alert));
  console.log('='.repeat(80) + '\n');
  return true;
}

/**
 * Get notification channels for tenant
 */
async function getNotificationChannels(tenantId: string, metricName: string): Promise<NotificationChannel[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('accuracy_thresholds')
    .select('notification_channels')
    .eq('tenant_id', tenantId)
    .eq('metric_name', metricName)
    .single();

  if (error || !data?.notification_channels) {
    // Default channels
    return [
      { type: 'console', enabled: true },
    ];
  }

  return data.notification_channels;
}

/**
 * Send alert through all configured channels
 */
export async function sendAlert(alert: AlertNotification): Promise<{ success: boolean; channels: Record<string, boolean> }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check cooldown
  const { data: threshold } = await supabase
    .from('accuracy_thresholds')
    .select('alert_cooldown_minutes')
    .eq('tenant_id', alert.tenantId)
    .eq('metric_name', alert.metricName)
    .single();

  const cooldownMinutes = threshold?.alert_cooldown_minutes || 60;
  const shouldSend = await shouldSendAlert(alert.tenantId, alert.metricName, cooldownMinutes);

  if (!shouldSend) {
    console.log(`Alert suppressed due to cooldown: ${alert.metricName}`);
    return { success: false, channels: {} };
  }

  // Get notification channels
  const channels = await getNotificationChannels(alert.tenantId, alert.metricName);
  const results: Record<string, boolean> = {};

  // Send through each enabled channel
  for (const channel of channels) {
    if (!channel.enabled) continue;

    let sent = false;
    switch (channel.type) {
      case 'email':
        sent = await sendEmailNotification(alert, channel.config);
        break;
      case 'slack':
        sent = await sendSlackNotification(alert, channel.config);
        break;
      case 'webhook':
        sent = await sendWebhookNotification(alert, channel.config);
        break;
      case 'console':
        sent = logToConsole(alert);
        break;
    }

    results[channel.type] = sent;
  }

  // Update alert record with notification status
  await supabase
    .from('accuracy_alerts')
    .update({ notifications_sent: results })
    .eq('id', alert.id);

  const success = Object.values(results).some(sent => sent);
  return { success, channels: results };
}

/**
 * Process unacknowledged alerts
 */
export async function processUnacknowledgedAlerts(tenantId: string): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: alerts, error } = await supabase
    .from('accuracy_alerts')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('acknowledged_at', null)
    .order('triggered_at', { ascending: true });

  if (error || !alerts || alerts.length === 0) {
    return;
  }

  console.log(`Processing ${alerts.length} unacknowledged alerts for tenant ${tenantId}`);

  for (const alert of alerts) {
    const notification: AlertNotification = {
      id: alert.id,
      tenantId: alert.tenant_id,
      metricName: alert.metric_name,
      metricValue: parseFloat(alert.metric_value),
      thresholdValue: parseFloat(alert.threshold_value),
      severity: alert.severity,
      triggeredAt: alert.triggered_at,
      message: formatAlertMessage({
        id: alert.id,
        tenantId: alert.tenant_id,
        metricName: alert.metric_name,
        metricValue: parseFloat(alert.metric_value),
        thresholdValue: parseFloat(alert.threshold_value),
        severity: alert.severity,
        triggeredAt: alert.triggered_at,
        message: '',
      }),
    };

    await sendAlert(notification);
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: string,
  acknowledgedBy: string,
  resolutionNotes?: string
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from('accuracy_alerts')
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: acknowledgedBy,
      resolution_notes: resolutionNotes,
    })
    .eq('id', alertId);

  if (error) {
    console.error('Error acknowledging alert:', error);
    return false;
  }

  return true;
}

/**
 * Get alert statistics for tenant
 */
export async function getAlertStatistics(tenantId: string, days: number = 30) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const startDate = new Date(Date.now() - days * 86400000).toISOString();

  const { data, error } = await supabase
    .from('accuracy_alerts')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('triggered_at', startDate);

  if (error || !data) {
    return null;
  }

  return {
    total: data.length,
    critical: data.filter(a => a.severity === 'critical').length,
    warnings: data.filter(a => a.severity === 'warning').length,
    acknowledged: data.filter(a => a.acknowledged_at).length,
    unacknowledged: data.filter(a => !a.acknowledged_at).length,
    byMetric: data.reduce((acc, alert) => {
      acc[alert.metric_name] = (acc[alert.metric_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
