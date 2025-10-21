/**
 * Notification System for Google Policy Compliance
 *
 * Sends alerts via:
 * - Email (Resend)
 * - Slack webhooks
 * - Optional: PagerDuty, Discord, Teams
 */

import { Resend } from 'resend';
import type { GooglePolicyVersion } from './google-pricing-policy';
import type { DishonestPricingResult } from './google-pricing-policy';

// ============================================================================
// RESEND CLIENT
// ============================================================================

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[Notifications] Resend API key not configured');
      throw new Error('Resend API key not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

interface EmailRecipients {
  compliance?: string[];
  alerts?: string[];
  reports?: string[];
}

/**
 * Get email recipients from environment variables
 */
function getEmailRecipients(): EmailRecipients {
  return {
    compliance: process.env.COMPLIANCE_EMAIL_RECIPIENTS?.split(',').map(e => e.trim()) || [],
    alerts: process.env.ALERTS_EMAIL_RECIPIENTS?.split(',').map(e => e.trim()) || [],
    reports: process.env.REPORTS_EMAIL_RECIPIENTS?.split(',').map(e => e.trim()) || [],
  };
}

/**
 * Send policy drift notification email
 */
export async function sendPolicyDriftEmail(
  oldVersion: string,
  newVersion: string,
  changes: string[]
): Promise<void> {
  try {
    const resend = getResendClient();
    const recipients = getEmailRecipients();

    if (recipients.compliance.length === 0) {
      console.warn('[Notifications] No compliance email recipients configured');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .version-box { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .changes-list { background: white; padding: 20px; margin: 15px 0; border-radius: 4px; }
          .changes-list li { margin: 10px 0; padding-left: 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Google Ads Policy Update Detected</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <strong>Action Required:</strong> Google has updated their advertising policies. Please review these changes and update your compliance practices accordingly.
            </div>

            <div class="version-box">
              <strong>Old Version:</strong> ${oldVersion}<br>
              <strong>New Version:</strong> ${newVersion}<br>
              <strong>Detected:</strong> ${new Date().toLocaleString()}
            </div>

            <div class="changes-list">
              <h3 style="margin-top: 0;">Policy Changes:</h3>
              <ul>
                ${changes.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>

            <p style="margin-top: 30px;">
              <strong>Recommended Actions:</strong>
            </p>
            <ol>
              <li>Review the policy changes above</li>
              <li>Update your ad copy and disclosure templates</li>
              <li>Run a full compliance audit on existing ads</li>
              <li>Train your ad creation team on new requirements</li>
            </ol>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/intelligence?tab=compliance" class="button">
              View Compliance Dashboard →
            </a>
          </div>
          <div class="footer">
            <p>DealershipAI Policy Compliance System</p>
            <p>This is an automated alert. Do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'alerts@dealershipai.com',
      to: recipients.compliance,
      subject: `[DealershipAI] Google Ads Policy Update: ${oldVersion} → ${newVersion}`,
      html,
    });

    if (error) {
      console.error('[Notifications] Failed to send email:', error);
      throw error;
    }

    console.log('[Notifications] Policy drift email sent:', data?.id);
  } catch (error) {
    console.error('[Notifications] Failed to send policy drift email:', error);
    throw error;
  }
}

/**
 * Send critical violation alert email
 */
export async function sendCriticalViolationEmail(
  adUrl: string,
  result: DishonestPricingResult
): Promise<void> {
  try {
    const resend = getResendClient();
    const recipients = getEmailRecipients();

    if (recipients.alerts.length === 0) {
      console.warn('[Notifications] No alert email recipients configured');
      return;
    }

    const criticalViolations = result.violations.filter(v => v.type === 'critical');

    if (criticalViolations.length === 0) {
      return; // No critical violations, skip email
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .violation { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc3545; border-radius: 4px; }
          .metric { display: inline-block; padding: 10px 15px; background: white; margin: 5px; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Critical Policy Violations Detected</h1>
          </div>
          <div class="content">
            <p><strong>Ad URL:</strong> ${adUrl}</p>

            <div style="margin: 20px 0;">
              <div class="metric">
                <strong>Risk Score:</strong> ${result.riskScore.toFixed(1)}/100
              </div>
              <div class="metric">
                <strong>Critical Violations:</strong> ${criticalViolations.length}
              </div>
              <div class="metric">
                <strong>ATI Impact:</strong> -${(result.atiImpact.consistencyPenalty + result.atiImpact.precisionPenalty).toFixed(1)} pts
              </div>
            </div>

            <h3>Violations:</h3>
            ${criticalViolations.map(v => `
              <div class="violation">
                <strong>${v.rule}</strong><br>
                ${v.description}<br>
                <em style="color: #666; font-size: 14px;">Recommendation: ${v.recommendation}</em>
              </div>
            `).join('')}

            <p style="margin-top: 30px;">
              <strong>Immediate Action Required:</strong> These violations may result in ad disapproval or account suspension.
            </p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/intelligence?tab=compliance" class="button">
              View Full Report →
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'alerts@dealershipai.com',
      to: recipients.alerts,
      subject: `[URGENT] Critical Google Ads Policy Violations Detected`,
      html,
    });

    if (error) {
      console.error('[Notifications] Failed to send critical violation email:', error);
      throw error;
    }

    console.log('[Notifications] Critical violation email sent:', data?.id);
  } catch (error) {
    console.error('[Notifications] Failed to send critical violation email:', error);
    // Don't throw - this is non-critical
  }
}

// ============================================================================
// SLACK NOTIFICATIONS
// ============================================================================

/**
 * Send policy drift notification to Slack
 */
export async function sendPolicyDriftSlack(
  oldVersion: string,
  newVersion: string,
  changes: string[]
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[Notifications] Slack webhook URL not configured');
      return;
    }

    const payload = {
      text: `⚠️ Google Ads Policy Update Detected`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ Google Ads Policy Update',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Old Version:*\n${oldVersion}`,
            },
            {
              type: 'mrkdwn',
              text: `*New Version:*\n${newVersion}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Changes:*\n${changes.map(c => `• ${c}`).join('\n')}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Dashboard',
                emoji: true,
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/intelligence?tab=compliance`,
              style: 'primary',
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('[Notifications] Policy drift Slack notification sent');
  } catch (error) {
    console.error('[Notifications] Failed to send Slack notification:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Send critical violation alert to Slack
 */
export async function sendCriticalViolationSlack(
  adUrl: string,
  result: DishonestPricingResult
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return;
    }

    const criticalViolations = result.violations.filter(v => v.type === 'critical');

    if (criticalViolations.length === 0) {
      return;
    }

    const payload = {
      text: `❌ Critical Policy Violations Detected`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '❌ Critical Policy Violations',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Ad URL:* ${adUrl}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Risk Score:*\n${result.riskScore.toFixed(1)}/100`,
            },
            {
              type: 'mrkdwn',
              text: `*Critical Violations:*\n${criticalViolations.length}`,
            },
          ],
        },
        {
          type: 'divider',
        },
        ...criticalViolations.map(v => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${v.rule}*\n${v.description}\n_${v.recommendation}_`,
          },
        })),
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Full Report',
                emoji: true,
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/intelligence?tab=compliance`,
              style: 'danger',
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('[Notifications] Critical violation Slack notification sent');
  } catch (error) {
    console.error('[Notifications] Failed to send Slack notification:', error);
  }
}

// ============================================================================
// UNIFIED NOTIFICATION DISPATCHER
// ============================================================================

/**
 * Send policy drift notifications (email + Slack)
 */
export async function notifyPolicyDrift(
  oldVersion: string,
  newVersion: string,
  changes: string[]
): Promise<void> {
  console.log('[Notifications] Sending policy drift notifications...');

  await Promise.allSettled([
    sendPolicyDriftEmail(oldVersion, newVersion, changes),
    sendPolicyDriftSlack(oldVersion, newVersion, changes),
  ]);

  console.log('[Notifications] Policy drift notifications sent');
}

/**
 * Send critical violation notifications (email + Slack)
 */
export async function notifyCriticalViolation(
  adUrl: string,
  result: DishonestPricingResult
): Promise<void> {
  console.log('[Notifications] Sending critical violation notifications...');

  await Promise.allSettled([
    sendCriticalViolationEmail(adUrl, result),
    sendCriticalViolationSlack(adUrl, result),
  ]);

  console.log('[Notifications] Critical violation notifications sent');
}
