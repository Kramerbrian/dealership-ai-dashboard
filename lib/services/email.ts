/**
 * Email Service
 * Supports Resend and SendGrid
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private provider: 'resend' | 'sendgrid' | null = null;
  private apiKey: string | null = null;
  private fromEmail: string;

  constructor() {
    // Determine provider from environment
    if (process.env.RESEND_API_KEY) {
      this.provider = 'resend';
      this.apiKey = process.env.RESEND_API_KEY;
    } else if (process.env.SENDGRID_API_KEY) {
      this.provider = 'sendgrid';
      this.apiKey = process.env.SENDGRID_API_KEY;
    }

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@dealershipai.com';
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.provider || !this.apiKey) {
      console.warn('Email service not configured. Set RESEND_API_KEY or SENDGRID_API_KEY');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      if (this.provider === 'resend') {
        return await this.sendViaResend(options);
      } else if (this.provider === 'sendgrid') {
        return await this.sendViaSendGrid(options);
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return {
      success: false,
      error: 'No email provider configured',
    };
  }

  private async sendViaResend(options: EmailOptions): Promise<EmailResult> {
    // Dynamic import to avoid bundling issues if not installed
    const { Resend } = await import('resend');
    const resend = new Resend(this.apiKey!);

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    const result = await resend.emails.send({
      from: options.from || this.fromEmail,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  }

  private async sendViaSendGrid(options: EmailOptions): Promise<EmailResult> {
    // Dynamic import - only works in Node.js runtime, not Edge
    if (typeof window !== 'undefined' || !process.env.SENDGRID_API_KEY) {
      return { success: false, error: 'SendGrid not available in this runtime' };
    }
    
    try {
      const sgMail = await import('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey!);

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    const msg = {
      to: recipients,
      from: options.from || this.fromEmail,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await sgMail.send(msg);

    return {
      success: true,
      messageId: result[0]?.headers['x-message-id'] as string,
    };
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, dealerName?: string): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Welcome to DealershipAI',
      html: `
        <h1>Welcome to DealershipAI!</h1>
        <p>Thank you for joining us${dealerName ? `, ${dealerName}` : ''}.</p>
        <p>Get started by analyzing your dealership's AI visibility:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dash.dealershipai.com'}/dashboard">Open Dashboard</a>
      `,
      text: `Welcome to DealershipAI! Thank you for joining us${dealerName ? `, ${dealerName}` : ''}. Get started at ${process.env.NEXT_PUBLIC_APP_URL || 'https://dash.dealershipai.com'}/dashboard`,
    });
  }

  /**
   * Send email unlock notification
   */
  async sendUnlockEmail(email: string, featureName: string): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: `Unlock ${featureName} on DealershipAI`,
      html: `
        <h1>Unlock ${featureName}</h1>
        <p>Your full ${featureName} report is ready!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dash.dealershipai.com'}/dashboard">View Report</a>
      `,
    });
  }
}

export const emailService = new EmailService();
export default emailService;

