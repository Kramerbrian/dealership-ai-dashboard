// Smart notifications for Slack/Email summarizing DTRI changes and $ impact
export interface NotificationData {
  type: 'daily_summary' | 'anomaly_alert' | 'fix_completed' | 'threshold_breach';
  tenant_id: string;
  dealership_name: string;
  data: {
    dtri_change?: number;
    revenue_impact?: number;
    top_changes?: Array<{
      metric: string;
      delta: number;
      impact: number;
    }>;
    anomalies?: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    fixes_executed?: Array<{
      playbook: string;
      status: 'success' | 'partial' | 'failed';
      impact: number;
    }>;
  };
  timestamp: string;
}

export class SmartNotificationManager {
  private slackWebhookUrl?: string;
  private emailConfig?: {
    from: string;
    to: string[];
    smtp: any;
  };

  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.emailConfig = {
      from: process.env.NOTIFICATION_EMAIL_FROM,
      to: process.env.NOTIFICATION_EMAIL_TO?.split(','),
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    };
  }

  public async sendDailySummary(data: NotificationData) {
    const message = this.formatDailySummary(data);
    
    // Send to Slack
    if (this.slackWebhookUrl) {
      await this.sendSlackMessage(message);
    }

    // Send email
    if (this.emailConfig) {
      await this.sendEmail({
        subject: `Daily DTRI Summary - ${data.dealership_name}`,
        html: this.formatEmailHTML(message, data),
        text: this.formatEmailText(message, data)
      });
    }
  }

  public async sendAnomalyAlert(data: NotificationData) {
    const message = this.formatAnomalyAlert(data);
    
    if (this.slackWebhookUrl) {
      await this.sendSlackMessage(message, 'warning');
    }

    if (this.emailConfig) {
      await this.sendEmail({
        subject: `🚨 Anomaly Alert - ${data.dealership_name}`,
        html: this.formatEmailHTML(message, data),
        text: this.formatEmailText(message, data)
      });
    }
  }

  public async sendFixCompleted(data: NotificationData) {
    const message = this.formatFixCompleted(data);
    
    if (this.slackWebhookUrl) {
      await this.sendSlackMessage(message, 'good');
    }

    if (this.emailConfig) {
      await this.sendEmail({
        subject: `✅ Fix Completed - ${data.dealership_name}`,
        html: this.formatEmailHTML(message, data),
        text: this.formatEmailText(message, data)
      });
    }
  }

  private formatDailySummary(data: NotificationData): string {
    const { dtri_change, revenue_impact, top_changes } = data.data;
    
    let message = `📊 *Daily DTRI Summary - ${data.dealership_name}*\n\n`;
    
    if (dtri_change !== undefined) {
      const changeEmoji = dtri_change >= 0 ? '📈' : '📉';
      message += `${changeEmoji} *DTRI Change:* ${dtri_change > 0 ? '+' : ''}${dtri_change.toFixed(1)} points\n`;
    }
    
    if (revenue_impact !== undefined) {
      const impactEmoji = revenue_impact >= 0 ? '💰' : '💸';
      message += `${impactEmoji} *Revenue Impact:* ${revenue_impact > 0 ? '+' : ''}$${Math.abs(revenue_impact).toLocaleString()}\n\n`;
    }
    
    if (top_changes && top_changes.length > 0) {
      message += `*Top Changes:*\n`;
      top_changes.slice(0, 3).forEach(change => {
        const emoji = change.delta >= 0 ? '⬆️' : '⬇️';
        message += `${emoji} ${change.metric}: ${change.delta > 0 ? '+' : ''}${change.delta} ($${change.impact.toLocaleString()})\n`;
      });
    }
    
    message += `\n🕒 Generated: ${new Date(data.timestamp).toLocaleString()}`;
    
    return message;
  }

  private formatAnomalyAlert(data: NotificationData): string {
    const { anomalies } = data.data;
    
    let message = `🚨 *Anomaly Alert - ${data.dealership_name}*\n\n`;
    
    if (anomalies && anomalies.length > 0) {
      anomalies.forEach(anomaly => {
        const severityEmoji = {
          low: '🟡',
          medium: '🟠',
          high: '🔴'
        }[anomaly.severity];
        
        message += `${severityEmoji} *${anomaly.type.toUpperCase()}* (${anomaly.severity})\n`;
        message += `   ${anomaly.description}\n\n`;
      });
    }
    
    message += `🔗 View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    
    return message;
  }

  private formatFixCompleted(data: NotificationData): string {
    const { fixes_executed } = data.data;
    
    let message = `✅ *Fix Completed - ${data.dealership_name}*\n\n`;
    
    if (fixes_executed && fixes_executed.length > 0) {
      fixes_executed.forEach(fix => {
        const statusEmoji = {
          success: '✅',
          partial: '⚠️',
          failed: '❌'
        }[fix.status];
        
        message += `${statusEmoji} *${fix.playbook}* (${fix.status})\n`;
        message += `   Impact: $${fix.impact.toLocaleString()}\n\n`;
      });
    }
    
    return message;
  }

  private async sendSlackMessage(message: string, color: 'good' | 'warning' | 'danger' = 'good') {
    if (!this.slackWebhookUrl) return;

    const payload = {
      text: message,
      attachments: [{
        color: color,
        text: message,
        footer: 'DealershipAI',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  private async sendEmail(emailData: { subject: string; html: string; text: string }) {
    if (!this.emailConfig) return;

    // In production, use a proper email service like SendGrid, AWS SES, etc.
    console.log('Email notification:', emailData);
    
    // For now, just log the email content
    // In production, implement actual email sending
  }

  private formatEmailHTML(message: string, data: NotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .metric { background: #f8fafc; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DealershipAI Notification</h1>
          </div>
          <div class="content">
            <pre style="white-space: pre-wrap; font-family: monospace;">${message}</pre>
          </div>
          <div class="footer">
            <p>DealershipAI Dashboard - ${data.dealership_name}</p>
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  }

  private formatEmailText(message: string, data: NotificationData): string {
    return `${message}\n\n---\nDealershipAI Dashboard - ${data.dealership_name}\nGenerated: ${new Date(data.timestamp).toLocaleString()}`;
  }
}

// Singleton instance
export const smartNotifications = new SmartNotificationManager();

// API endpoint for triggering notifications
export async function triggerNotification(type: string, data: NotificationData) {
  switch (type) {
    case 'daily_summary':
      await smartNotifications.sendDailySummary(data);
      break;
    case 'anomaly_alert':
      await smartNotifications.sendAnomalyAlert(data);
      break;
    case 'fix_completed':
      await smartNotifications.sendFixCompleted(data);
      break;
    default:
      console.warn('Unknown notification type:', type);
  }
}
