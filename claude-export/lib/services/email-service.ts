/**
 * Email Service - SendGrid Integration
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@dealershipai.com';

  if (!SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: {
          email: options.from || FROM_EMAIL,
          name: 'DealershipAI',
        },
        reply_to: options.replyTo
          ? { email: options.replyTo }
          : undefined,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email Templates
export const emailTemplates = {
  welcomeEmail: (name: string, dealerUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(90deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 32px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to dealershipAI</h1>
        </div>
        <div class="content">
          <h2>Hi ${name || 'there'}!</h2>
          <p>Thank you for your interest in DealershipAI. We're excited to help you boost your dealership's AI visibility and drive more qualified leads.</p>

          <p>We've started analyzing <strong>${dealerUrl}</strong> and will have your comprehensive AI visibility report ready shortly.</p>

          <h3>What happens next?</h3>
          <ul>
            <li>We'll analyze your dealership across ChatGPT, Gemini, Perplexity, and Google AI Overviews</li>
            <li>You'll receive a detailed report with actionable recommendations</li>
            <li>Our team will reach out to discuss your specific opportunities</li>
          </ul>

          <p>In the meantime, you can access your dashboard:</p>
          <a href="https://www.dealershipai.com/dash?dealer=${encodeURIComponent(dealerUrl)}" class="button">View Your Dashboard →</a>

          <p>If you have any questions, just reply to this email. We're here to help!</p>

          <p>Best regards,<br>The DealershipAI Team</p>
        </div>
        <div class="footer">
          <p>© 2025 DealershipAI. All rights reserved.</p>
          <p><a href="https://www.dealershipai.com/privacy">Privacy Policy</a> | <a href="https://www.dealershipai.com/terms">Terms of Service</a></p>
        </div>
      </div>
    </body>
    </html>
  `,

  leadNotification: (leadData: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(90deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .field { margin-bottom: 15px; padding: 10px; background: #f9fafb; border-radius: 4px; }
        .label { font-weight: 600; color: #4b5563; }
        .value { color: #111827; }
        .priority { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Lead Captured!</h1>
          <span class="priority">HIGH PRIORITY</span>
        </div>
        <div class="content">
          <h2>Lead Details</h2>

          <div class="field">
            <div class="label">Dealer URL:</div>
            <div class="value"><strong>${leadData.dealerUrl}</strong></div>
          </div>

          ${leadData.email ? `
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${leadData.email}</div>
          </div>
          ` : ''}

          ${leadData.name ? `
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${leadData.name}</div>
          </div>
          ` : ''}

          ${leadData.phone ? `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${leadData.phone}</div>
          </div>
          ` : ''}

          <div class="field">
            <div class="label">Source:</div>
            <div class="value">${leadData.source}</div>
          </div>

          ${leadData.utm_source ? `
          <div class="field">
            <div class="label">UTM Source:</div>
            <div class="value">${leadData.utm_source}</div>
          </div>
          ` : ''}

          <div class="field">
            <div class="label">Timestamp:</div>
            <div class="value">${new Date(leadData.timestamp).toLocaleString()}</div>
          </div>

          <div class="field">
            <div class="label">IP Address:</div>
            <div class="value">${leadData.ipAddress}</div>
          </div>

          <p style="margin-top: 30px;">
            <a href="https://www.dealershipai.com/dash?dealer=${encodeURIComponent(leadData.dealerUrl)}" style="display: inline-block; background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
              View Dashboard →
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};
