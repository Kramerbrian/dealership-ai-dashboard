/**
 * Lead Nurture Email Automation
 *
 * Sends follow-up emails to leads based on their trust score and engagement
 */

import sgMail from '@sendgrid/mail';
import { prisma } from '@/lib/prisma';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface NurtureEmailOptions {
  leadId: string;
  templateType: 'followup_day1' | 'followup_day3' | 'followup_day7';
}

/**
 * Email templates for lead nurture sequence
 */
const EMAIL_TEMPLATES = {
  followup_day1: {
    subject: (name: string) => `${name}: Quick wins to boost your Trust Score`,
    html: (businessName: string, trustScore: number, recommendations: string[]) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quick Wins for Your Trust Score</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Ready to Improve Your Trust Score?</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi there,</p>

            <p>Yesterday you checked ${businessName}'s Trust Score (${Math.round(trustScore * 100)}/100). Here are 3 quick wins you can implement today:</p>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #059669;">Quick Wins (Under 1 Hour)</h3>
              <ol style="margin: 0; padding-left: 20px;">
                ${recommendations.slice(0, 3).map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
              </ol>
            </div>

            <p><strong>Why This Matters:</strong></p>
            <p>70% of car buyers now use AI assistants like ChatGPT and Claude to research dealerships. If you're not visible, you're losing sales to competitors who are.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/signup?utm_source=email&utm_medium=nurture&utm_campaign=day1"
                 style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Free Trial
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Full audit + personalized action plan</p>
            </div>

            <p>Questions? Just reply to this email.</p>

            <p style="margin-top: 30px;">Best,<br>The DealershipAI Team</p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>© ${new Date().getFullYear()} DealershipAI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  },

  followup_day3: {
    subject: (name: string) => `${name}: Your competitors are winning on AI search`,
    html: (businessName: string, trustScore: number) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Competitive Advantage Opportunity</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Don't Let Competitors Win</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi,</p>

            <p>3 days ago we analyzed ${businessName}'s AI visibility. Since then, your competitors have appeared in <strong>hundreds of AI-powered searches</strong> while you may have missed those opportunities.</p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #d97706;">The Cost of Waiting</h3>
              <p style="margin: 0;">Average dealerships lose <strong>$43,000/month</strong> in potential sales from poor AI visibility. Every day you wait is another day of lost revenue.</p>
            </div>

            <p><strong>What top-performing dealerships are doing:</strong></p>
            <ul style="color: #4b5563;">
              <li>Monitoring their AI visibility daily</li>
              <li>Optimizing for ChatGPT, Claude, and Perplexity</li>
              <li>Tracking competitor mentions in AI results</li>
              <li>Implementing AI-first content strategies</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/signup?utm_source=email&utm_medium=nurture&utm_campaign=day3"
                 style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                See Your Competitive Analysis
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Compare yourself to local competitors</p>
            </div>

            <p style="margin-top: 30px;">Best,<br>The DealershipAI Team</p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>© ${new Date().getFullYear()} DealershipAI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  },

  followup_day7: {
    subject: (name: string) => `${name}: Final reminder - Your AI visibility report`,
    html: (businessName: string, trustScore: number) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Last Chance - AI Visibility Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Last Chance to Fix Your AI Visibility</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi,</p>

            <p>A week ago, you received ${businessName}'s Trust Score analysis (${Math.round(trustScore * 100)}/100).</p>

            <p>This is my last email about this. I wanted to give you one more chance to:</p>

            <ol style="color: #4b5563;">
              <li>Get a full competitive analysis</li>
              <li>See exactly where you're losing to competitors in AI search</li>
              <li>Get a personalized 30-day action plan</li>
            </ol>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">Free Trial Includes:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Daily AI visibility monitoring</li>
                <li>Competitor tracking</li>
                <li>Automated schema generation</li>
                <li>Custom recommendations</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/signup?utm_source=email&utm_medium=nurture&utm_campaign=day7"
                 style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Free Trial Now
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">No credit card required</p>
            </div>

            <p>If you're not interested, no worries - I won't email you again about this.</p>

            <p style="margin-top: 30px;">Thanks for your time,<br>The DealershipAI Team</p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>© ${new Date().getFullYear()} DealershipAI. All rights reserved.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
  },
};

/**
 * Send a nurture email to a lead
 */
export async function sendNurtureEmail(options: NurtureEmailOptions): Promise<boolean> {
  try {
    // Fetch lead from database
    const lead = await prisma.trustScanLead.findUnique({
      where: { id: options.leadId },
    });

    if (!lead) {
      console.error(`Lead not found: ${options.leadId}`);
      return false;
    }

    // Don't send if lead has already converted
    if (lead.status === 'CONVERTED' || lead.status === 'UNQUALIFIED') {
      console.log(`Skipping email for lead ${lead.email}: status is ${lead.status}`);
      return false;
    }

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.error('SendGrid not configured');
      return false;
    }

    const template = EMAIL_TEMPLATES[options.templateType];
    const subject = template.subject(lead.businessName);
    const html = template.html(
      lead.businessName,
      lead.trustScore || 0,
      (lead.recommendations as string[]) || []
    );

    // Send email
    await sgMail.send({
      to: lead.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    });

    // Update lead with follow-up tracking
    await prisma.trustScanLead.update({
      where: { id: options.leadId },
      data: {
        followUpCount: { increment: 1 },
        lastContactedAt: new Date(),
        status: lead.status === 'NEW' ? 'CONTACTED' : lead.status,
      },
    });

    console.log(`✅ Nurture email sent: ${options.templateType} to ${lead.email}`);
    return true;

  } catch (error) {
    console.error('Failed to send nurture email:', error);
    return false;
  }
}

/**
 * Process lead nurture queue (to be run as cron job)
 *
 * This should be called by a scheduled task (e.g., Vercel Cron, external scheduler)
 * to automatically send follow-up emails to leads based on their creation date
 */
export async function processLeadNurtureQueue(): Promise<void> {
  try {
    const now = new Date();

    // Day 1 follow-up: Leads created 24 hours ago
    const day1Leads = await prisma.trustScanLead.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 25 * 60 * 60 * 1000), // 25 hours ago
          lte: new Date(now.getTime() - 23 * 60 * 60 * 1000), // 23 hours ago
        },
        followUpCount: 0,
        status: { in: ['NEW', 'CONTACTED'] },
      },
    });

    for (const lead of day1Leads) {
      await sendNurtureEmail({ leadId: lead.id, templateType: 'followup_day1' });
    }

    // Day 3 follow-up: Leads created 72 hours ago
    const day3Leads = await prisma.trustScanLead.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 73 * 60 * 60 * 1000), // 73 hours ago
          lte: new Date(now.getTime() - 71 * 60 * 60 * 1000), // 71 hours ago
        },
        followUpCount: 1,
        status: { in: ['NEW', 'CONTACTED'] },
      },
    });

    for (const lead of day3Leads) {
      await sendNurtureEmail({ leadId: lead.id, templateType: 'followup_day3' });
    }

    // Day 7 follow-up: Leads created 7 days ago
    const day7Leads = await prisma.trustScanLead.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 169 * 60 * 60 * 1000), // 169 hours ago (7 days + 1 hour)
          lte: new Date(now.getTime() - 167 * 60 * 60 * 1000), // 167 hours ago (7 days - 1 hour)
        },
        followUpCount: 2,
        status: { in: ['NEW', 'CONTACTED'] },
      },
    });

    for (const lead of day7Leads) {
      await sendNurtureEmail({ leadId: lead.id, templateType: 'followup_day7' });
    }

    console.log(`✅ Lead nurture queue processed: ${day1Leads.length + day3Leads.length + day7Leads.length} emails sent`);

  } catch (error) {
    console.error('Failed to process lead nurture queue:', error);
    throw error;
  }
}
