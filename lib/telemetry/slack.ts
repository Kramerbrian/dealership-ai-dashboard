/**
 * Slack Webhook Integration
 * 
 * Sends alerts for milestones and critical events
 */

const WEBHOOK_URL = process.env.TELEMETRY_WEBHOOK;

export interface SlackAlert {
  event: string;
  message: string;
  data?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

export async function sendSlackAlert(alert: SlackAlert): Promise<void> {
  if (!WEBHOOK_URL) {
    console.log('Slack webhook not configured, skipping alert:', alert);
    return;
  }

  try {
    const color = alert.severity === 'critical' ? '#ff0000' :
                  alert.severity === 'warning' ? '#ffaa00' :
                  '#36a64f';

    const payload = {
      text: alert.message,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.event}*\n${alert.message}`
          }
        },
        ...(alert.data ? [{
          type: 'section',
          fields: Object.entries(alert.data).map(([key, value]) => ({
            type: 'mrkdwn',
            text: `*${key}:* ${value}`
          }))
        }] : [])
      ],
      attachments: [{
        color,
        footer: 'DealershipAI',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

// Pre-configured alert functions
export async function alertAIVIncrease(delta: number): Promise<void> {
  if (delta >= 10) {
    await sendSlackAlert({
      event: 'AIV Milestone',
      message: `🎉 AIV score increased by +${delta} points!`,
      data: { delta: `+${delta}`, impact: 'High' },
      severity: 'info'
    });
  }
}

export async function alertRevenueRecovered(amount: number): Promise<void> {
  if (amount >= 5000) {
    await sendSlackAlert({
      event: 'Revenue Recovery',
      message: `💰 $${amount.toLocaleString()}/month recovered!`,
      data: { amount: `$${amount.toLocaleString()}` },
      severity: 'info'
    });
  }
}

export async function alertEngineDrop(engine: string, drop: number): Promise<void> {
  if (drop > 10) {
    await sendSlackAlert({
      event: 'Engine Drop Alert',
      message: `⚠️ ${engine} dropped by ${drop} points in 24h`,
      data: { engine, drop: `${drop} pts` },
      severity: 'critical'
    });
  }
}

