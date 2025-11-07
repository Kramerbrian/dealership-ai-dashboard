/**
 * Slack Alert Service
 * 
 * Sends alerts and notifications to Slack via webhook
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_ALERT_WEBHOOK_URL = process.env.SLACK_ALERT_WEBHOOK_URL || SLACK_WEBHOOK_URL;

export interface AlertPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  tenantId: string;
  metadata?: Record<string, any>;
  channel?: string;
}

const colorMap = {
  info: '#36a64f',
  warning: '#ffa500',
  error: '#ff0000',
  critical: '#8b0000',
};

const emojiMap = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  critical: '🚨',
};

export async function sendSlackAlert(payload: AlertPayload): Promise<boolean> {
  const webhookUrl = payload.severity === 'critical' || payload.severity === 'error'
    ? SLACK_ALERT_WEBHOOK_URL
    : SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack webhook not configured, skipping alert');
    return false;
  }

  const slackMessage = {
    text: `${emojiMap[payload.severity]} ${payload.title}`,
    attachments: [
      {
        color: colorMap[payload.severity],
        fields: [
          {
            title: 'Message',
            value: payload.message,
            short: false,
          },
          {
            title: 'Tenant ID',
            value: payload.tenantId,
            short: true,
          },
          {
            title: 'Severity',
            value: payload.severity.toUpperCase(),
            short: true,
          },
        ],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  if (payload.metadata) {
    slackMessage.attachments[0].fields.push({
      title: 'Metadata',
      value: '```' + JSON.stringify(payload.metadata, null, 2) + '```',
      short: false,
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Slack alert failed:', error);
    return false;
  }
}

export async function sendSlackNotification(
  message: string,
  channel?: string
): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('Slack webhook not configured');
    return false;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        channel: channel,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
}

