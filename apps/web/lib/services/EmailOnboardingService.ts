import { logger } from '@/lib/utils/logger';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  trigger: 'signup' | 'trial_start' | 'trial_reminder' | 'subscription_active' | 'payment_failed' | 'cancellation';
  delay?: number; // hours
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  templates: EmailTemplate[];
  isActive: boolean;
}

export interface EmailRecipient {
  email: string;
  name: string;
  metadata?: Record<string, any>;
}

export class EmailOnboardingService {
  private sequences: EmailSequence[] = [];

  constructor() {
    this.initializeSequences();
  }

  /**
   * Initialize email sequences
   */
  private initializeSequences(): void {
    this.sequences = [
      {
        id: 'welcome',
        name: 'Welcome Sequence',
        description: 'New user onboarding sequence',
        isActive: true,
        templates: [
          {
            id: 'welcome_immediate',
            name: 'Welcome Email',
            subject: 'Welcome to DealershipAI! Let\'s get you started',
            html: this.getWelcomeEmailHTML(),
            text: this.getWelcomeEmailText(),
            trigger: 'signup',
            delay: 0
          },
          {
            id: 'getting_started',
            name: 'Getting Started Guide',
            subject: 'Your DealershipAI Quick Start Guide',
            html: this.getGettingStartedHTML(),
            text: this.getGettingStartedText(),
            trigger: 'signup',
            delay: 24
          },
          {
            id: 'features_spotlight',
            name: 'Features Spotlight',
            subject: 'Discover the power of AI visibility tracking',
            html: this.getFeaturesSpotlightHTML(),
            text: this.getFeaturesSpotlightText(),
            trigger: 'signup',
            delay: 72
          },
          {
            id: 'success_tips',
            name: 'Success Tips',
            subject: 'Pro tips to maximize your AI visibility',
            html: this.getSuccessTipsHTML(),
            text: this.getSuccessTipsText(),
            trigger: 'signup',
            delay: 168 // 1 week
          }
        ]
      },
      {
        id: 'trial',
        name: 'Trial Sequence',
        description: 'Free trial user sequence',
        isActive: true,
        templates: [
          {
            id: 'trial_start',
            name: 'Trial Started',
            subject: 'Your 14-day free trial has begun!',
            html: this.getTrialStartHTML(),
            text: this.getTrialStartText(),
            trigger: 'trial_start',
            delay: 0
          },
          {
            id: 'trial_reminder_7d',
            name: 'Trial Reminder (7 days)',
            subject: '7 days left in your free trial',
            html: this.getTrialReminderHTML(7),
            text: this.getTrialReminderText(7),
            trigger: 'trial_reminder',
            delay: 168 // 7 days
          },
          {
            id: 'trial_reminder_3d',
            name: 'Trial Reminder (3 days)',
            subject: 'Only 3 days left in your free trial',
            html: this.getTrialReminderHTML(3),
            text: this.getTrialReminderText(3),
            trigger: 'trial_reminder',
            delay: 264 // 11 days
          },
          {
            id: 'trial_reminder_1d',
            name: 'Trial Reminder (1 day)',
            subject: 'Last day of your free trial',
            html: this.getTrialReminderHTML(1),
            text: this.getTrialReminderText(1),
            trigger: 'trial_reminder',
            delay: 312 // 13 days
          }
        ]
      },
      {
        id: 'subscription',
        name: 'Subscription Sequence',
        description: 'Paid subscription user sequence',
        isActive: true,
        templates: [
          {
            id: 'subscription_active',
            name: 'Subscription Active',
            subject: 'Welcome to DealershipAI Pro!',
            html: this.getSubscriptionActiveHTML(),
            text: this.getSubscriptionActiveText(),
            trigger: 'subscription_active',
            delay: 0
          },
          {
            id: 'advanced_features',
            name: 'Advanced Features',
            subject: 'Unlock advanced AI analytics features',
            html: this.getAdvancedFeaturesHTML(),
            text: this.getAdvancedFeaturesText(),
            trigger: 'subscription_active',
            delay: 48
          }
        ]
      }
    ];
  }

  /**
   * Get all email sequences
   */
  getSequences(): EmailSequence[] {
    return this.sequences;
  }

  /**
   * Get sequence by ID
   */
  getSequence(sequenceId: string): EmailSequence | null {
    return this.sequences.find(seq => seq.id === sequenceId) || null;
  }

  /**
   * Get templates for a specific trigger
   */
  getTemplatesForTrigger(trigger: string): EmailTemplate[] {
    const templates: EmailTemplate[] = [];
    
    this.sequences.forEach(sequence => {
      if (sequence.isActive) {
        sequence.templates.forEach(template => {
          if (template.trigger === trigger) {
            templates.push(template);
          }
        });
      }
    });

    return templates.sort((a, b) => (a.delay || 0) - (b.delay || 0));
  }

  /**
   * Schedule email for sending
   */
  async scheduleEmail(recipient: EmailRecipient, template: EmailTemplate, scheduledFor?: Date): Promise<boolean> {
    try {
      const sendTime = scheduledFor || this.calculateSendTime(template.delay || 0);
      
      logger.info('Email scheduled', {
        component: 'EmailOnboardingService',
        recipient: recipient.email,
        template: template.id,
        scheduledFor: sendTime.toISOString()
      });

      // In a real implementation, this would:
      // 1. Store the email in a queue (Redis, database, etc.)
      // 2. Use a job scheduler (Bull, Agenda, etc.)
      // 3. Send via email service (SendGrid, Resend, etc.)
      
      return true;
    } catch (error) {
      logger.error('Failed to schedule email', 'EmailOnboardingService', error as Error, {
        recipient: recipient.email,
        template: template.id
      });
      return false;
    }
  }

  /**
   * Trigger email sequence for user
   */
  async triggerSequence(recipient: EmailRecipient, sequenceId: string): Promise<boolean> {
    try {
      const sequence = this.getSequence(sequenceId);
      if (!sequence || !sequence.isActive) {
        logger.warn('Sequence not found or inactive', { sequenceId, recipient: recipient.email });
        return false;
      }

      let successCount = 0;
      for (const template of sequence.templates) {
        const scheduled = await this.scheduleEmail(recipient, template);
        if (scheduled) successCount++;
      }

      logger.info('Sequence triggered', {
        component: 'EmailOnboardingService',
        sequenceId,
        recipient: recipient.email,
        templatesScheduled: successCount,
        totalTemplates: sequence.templates.length
      });

      return successCount > 0;
    } catch (error) {
      logger.error('Failed to trigger sequence', 'EmailOnboardingService', error as Error, {
        sequenceId,
        recipient: recipient.email
      });
      return false;
    }
  }

  /**
   * Calculate send time based on delay
   */
  private calculateSendTime(delayHours: number): Date {
    const now = new Date();
    now.setHours(now.getHours() + delayHours);
    return now;
  }

  // Email template methods
  private getWelcomeEmailHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DealershipAI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin-bottom: 10px;">Welcome to DealershipAI!</h1>
          <p style="font-size: 18px; color: #666;">Your AI visibility tracking journey starts now</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">What's Next?</h2>
          <ol style="padding-left: 20px;">
            <li style="margin-bottom: 10px;">Complete your dealership profile setup</li>
            <li style="margin-bottom: 10px;">Connect your Google Analytics account</li>
            <li style="margin-bottom: 10px;">Run your first AI visibility analysis</li>
            <li style="margin-bottom: 10px;">Explore your personalized dashboard</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started Now
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
          <p>Need help? Reply to this email or contact us at <a href="mailto:support@dealershipai.com">support@dealershipai.com</a></p>
          <p>© 2024 DealershipAI. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailText(): string {
    return `
Welcome to DealershipAI!

Your AI visibility tracking journey starts now.

What's Next?
1. Complete your dealership profile setup
2. Connect your Google Analytics account
3. Run your first AI visibility analysis
4. Explore your personalized dashboard

Get Started: https://www.dealershipai.com/dashboard

Need help? Reply to this email or contact us at support@dealershipai.com

© 2024 DealershipAI. All rights reserved.
    `;
  }

  private getGettingStartedHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Getting Started with DealershipAI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Your DealershipAI Quick Start Guide</h1>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Step 1: Connect Your Analytics</h2>
          <p>Link your Google Analytics and Search Console accounts to start tracking your AI visibility metrics.</p>
          <a href="https://www.dealershipai.com/dashboard?step=analytics" style="color: #3b82f6;">Connect Analytics →</a>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Step 2: Run Your First Analysis</h2>
          <p>Generate your first AI visibility report to see how your dealership appears across AI platforms.</p>
          <a href="https://www.dealershipai.com/dashboard?step=analysis" style="color: #16a34a;">Run Analysis →</a>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #92400e; margin-top: 0;">Step 3: Explore Your Dashboard</h2>
          <p>Discover insights, track performance, and optimize your AI visibility with our comprehensive dashboard.</p>
          <a href="https://www.dealershipai.com/dashboard" style="color: #d97706;">View Dashboard →</a>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Setup
          </a>
        </div>
      </body>
      </html>
    `;
  }

  private getGettingStartedText(): string {
    return `
Your DealershipAI Quick Start Guide

Step 1: Connect Your Analytics
Link your Google Analytics and Search Console accounts to start tracking your AI visibility metrics.
Connect Analytics: https://www.dealershipai.com/dashboard?step=analytics

Step 2: Run Your First Analysis
Generate your first AI visibility report to see how your dealership appears across AI platforms.
Run Analysis: https://www.dealershipai.com/dashboard?step=analysis

Step 3: Explore Your Dashboard
Discover insights, track performance, and optimize your AI visibility with our comprehensive dashboard.
View Dashboard: https://www.dealershipai.com/dashboard

Complete Setup: https://www.dealershipai.com/dashboard
    `;
  }

  private getFeaturesSpotlightHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discover DealershipAI Features</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Discover the Power of AI Visibility Tracking</h1>
        
        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">Real-time Analytics</h3>
            <p>Track your dealership's visibility across AI platforms in real-time with our advanced analytics dashboard.</p>
          </div>
          
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">Competitor Analysis</h3>
            <p>See how you stack up against competitors and identify opportunities to improve your AI visibility.</p>
          </div>
          
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">Automated Reports</h3>
            <p>Get weekly insights delivered to your inbox with actionable recommendations for improvement.</p>
          </div>
          
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">API Access</h3>
            <p>Integrate DealershipAI data with your existing systems using our comprehensive API.</p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/features" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explore All Features
          </a>
        </div>
      </body>
      </html>
    `;
  }

  private getFeaturesSpotlightText(): string {
    return `
Discover the Power of AI Visibility Tracking

Real-time Analytics
Track your dealership's visibility across AI platforms in real-time with our advanced analytics dashboard.

Competitor Analysis
See how you stack up against competitors and identify opportunities to improve your AI visibility.

Automated Reports
Get weekly insights delivered to your inbox with actionable recommendations for improvement.

API Access
Integrate DealershipAI data with your existing systems using our comprehensive API.

Explore All Features: https://www.dealershipai.com/features
    `;
  }

  private getSuccessTipsHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pro Tips for AI Visibility Success</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Pro Tips to Maximize Your AI Visibility</h1>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">💡 Tip #1: Optimize Your Google Business Profile</h3>
          <p>Keep your business information up-to-date and encourage customer reviews. AI platforms rely heavily on this data.</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">💡 Tip #2: Create Quality Content Regularly</h3>
          <p>Publish helpful content about your services, inventory, and industry insights to improve your AI visibility.</p>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">💡 Tip #3: Monitor Your Competitors</h3>
          <p>Use our competitor analysis tools to see what's working for others and adapt your strategy accordingly.</p>
        </div>

        <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #be185d; margin-top: 0;">💡 Tip #4: Track Your Progress</h3>
          <p>Set up weekly reports and monitor your AI visibility metrics to identify trends and opportunities.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Apply These Tips
          </a>
        </div>
      </body>
      </html>
    `;
  }

  private getSuccessTipsText(): string {
    return `
Pro Tips to Maximize Your AI Visibility

💡 Tip #1: Optimize Your Google Business Profile
Keep your business information up-to-date and encourage customer reviews. AI platforms rely heavily on this data.

💡 Tip #2: Create Quality Content Regularly
Publish helpful content about your services, inventory, and industry insights to improve your AI visibility.

💡 Tip #3: Monitor Your Competitors
Use our competitor analysis tools to see what's working for others and adapt your strategy accordingly.

💡 Tip #4: Track Your Progress
Set up weekly reports and monitor your AI visibility metrics to identify trends and opportunities.

Apply These Tips: https://www.dealershipai.com/dashboard
    `;
  }

  private getTrialStartHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Free Trial Has Started!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">🎉 Your 14-Day Free Trial Has Started!</h1>
        
        <p>You now have full access to all DealershipAI Pro features for the next 14 days. No credit card required!</p>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">What You Can Do Now:</h2>
          <ul style="padding-left: 20px;">
            <li>Connect unlimited Google Analytics accounts</li>
            <li>Run comprehensive AI visibility analyses</li>
            <li>Access advanced competitor insights</li>
            <li>Generate detailed reports</li>
            <li>Use our full API</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Your Trial
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Your trial ends in 14 days. You can upgrade to Pro anytime during your trial to continue using these features.
        </p>
      </body>
      </html>
    `;
  }

  private getTrialStartText(): string {
    return `
🎉 Your 14-Day Free Trial Has Started!

You now have full access to all DealershipAI Pro features for the next 14 days. No credit card required!

What You Can Do Now:
- Connect unlimited Google Analytics accounts
- Run comprehensive AI visibility analyses
- Access advanced competitor insights
- Generate detailed reports
- Use our full API

Start Your Trial: https://www.dealershipai.com/dashboard

Your trial ends in 14 days. You can upgrade to Pro anytime during your trial to continue using these features.
    `;
  }

  private getTrialReminderHTML(daysLeft: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${daysLeft} Days Left in Your Trial</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">⏰ Only ${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left in Your Free Trial</h1>
        
        <p>Don't lose access to your AI visibility insights! Upgrade to Pro to continue tracking your dealership's performance.</p>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #dc2626; margin-top: 0;">What Happens When Your Trial Ends?</h2>
          <ul style="padding-left: 20px;">
            <li>Access to advanced analytics will be limited</li>
            <li>Competitor analysis features will be disabled</li>
            <li>API access will be restricted</li>
            <li>Custom reports will no longer be available</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/pricing" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Upgrade to Pro Now
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Questions? Reply to this email or contact us at support@dealershipai.com
        </p>
      </body>
      </html>
    `;
  }

  private getTrialReminderText(daysLeft: number): string {
    return `
⏰ Only ${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left in Your Free Trial

Don't lose access to your AI visibility insights! Upgrade to Pro to continue tracking your dealership's performance.

What Happens When Your Trial Ends?
- Access to advanced analytics will be limited
- Competitor analysis features will be disabled
- API access will be restricted
- Custom reports will no longer be available

Upgrade to Pro Now: https://www.dealershipai.com/pricing

Questions? Reply to this email or contact us at support@dealershipai.com
    `;
  }

  private getSubscriptionActiveHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DealershipAI Pro!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a;">🎉 Welcome to DealershipAI Pro!</h1>
        
        <p>Thank you for upgrading! You now have full access to all our premium features.</p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Your Pro Features Are Now Active:</h2>
          <ul style="padding-left: 20px;">
            <li>Unlimited AI visibility analyses</li>
            <li>Advanced competitor tracking</li>
            <li>Real-time analytics dashboard</li>
            <li>Custom report generation</li>
            <li>Full API access</li>
            <li>Priority email support</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Your Pro Dashboard
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Need help getting started? Our support team is here to help at support@dealershipai.com
        </p>
      </body>
      </html>
    `;
  }

  private getSubscriptionActiveText(): string {
    return `
🎉 Welcome to DealershipAI Pro!

Thank you for upgrading! You now have full access to all our premium features.

Your Pro Features Are Now Active:
- Unlimited AI visibility analyses
- Advanced competitor tracking
- Real-time analytics dashboard
- Custom report generation
- Full API access
- Priority email support

Access Your Pro Dashboard: https://www.dealershipai.com/dashboard

Need help getting started? Our support team is here to help at support@dealershipai.com
    `;
  }

  private getAdvancedFeaturesHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unlock Advanced AI Analytics Features</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Unlock Advanced AI Analytics Features</h1>
        
        <p>Now that you're a Pro subscriber, let's explore some advanced features that can help you maximize your AI visibility.</p>

        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">🔍 Deep Competitor Analysis</h3>
            <p>Compare your AI visibility against up to 10 competitors and identify gaps in your strategy.</p>
            <a href="https://www.dealershipai.com/dashboard/competitors" style="color: #3b82f6;">Try It Now →</a>
          </div>
          
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">📊 Custom Reports</h3>
            <p>Create detailed reports with your own metrics and share them with your team.</p>
            <a href="https://www.dealershipai.com/dashboard/reports" style="color: #3b82f6;">Create Report →</a>
          </div>
          
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">⚡ Real-time Alerts</h3>
            <p>Get instant notifications when your AI visibility changes or competitors make moves.</p>
            <a href="https://www.dealershipai.com/dashboard/alerts" style="color: #3b82f6;">Set Up Alerts →</a>
          </div>
          
          <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">🔗 API Integration</h3>
            <p>Connect DealershipAI with your existing tools using our comprehensive API.</p>
            <a href="https://www.dealershipai.com/docs/api" style="color: #3b82f6;">View API Docs →</a>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.dealershipai.com/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explore All Features
          </a>
        </div>
      </body>
      </html>
    `;
  }

  private getAdvancedFeaturesText(): string {
    return `
Unlock Advanced AI Analytics Features

Now that you're a Pro subscriber, let's explore some advanced features that can help you maximize your AI visibility.

🔍 Deep Competitor Analysis
Compare your AI visibility against up to 10 competitors and identify gaps in your strategy.
Try It Now: https://www.dealershipai.com/dashboard/competitors

📊 Custom Reports
Create detailed reports with your own metrics and share them with your team.
Create Report: https://www.dealershipai.com/dashboard/reports

⚡ Real-time Alerts
Get instant notifications when your AI visibility changes or competitors make moves.
Set Up Alerts: https://www.dealershipai.com/dashboard/alerts

🔗 API Integration
Connect DealershipAI with your existing tools using our comprehensive API.
View API Docs: https://www.dealershipai.com/docs/api

Explore All Features: https://www.dealershipai.com/dashboard
    `;
  }
}
