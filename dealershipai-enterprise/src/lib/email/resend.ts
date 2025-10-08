import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface LeadEmailData {
  leadId: string
  businessName: string
  website: string
  email: string
  name: string
  challenge: string
  role?: string
  dealershipName?: string
}

export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  /**
   * Send a new lead notification email
   */
  async sendLeadNotification(data: LeadEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: 'DealershipAI <noreply@dealershipai.com>',
        to: ['kramer177@gmail.com', 'support@dealershipai.com'],
        subject: `New Lead: ${data.businessName} - ${data.challenge}`,
        html: this.generateLeadNotificationHTML(data),
        text: this.generateLeadNotificationText(data),
        tags: [
          { name: 'type', value: 'lead-notification' },
          { name: 'lead-id', value: data.leadId },
          { name: 'challenge', value: data.challenge }
        ]
      })

      return { success: true, messageId: result.data?.id }
    } catch (error: any) {
      console.error('Failed to send lead notification:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send welcome email to new lead
   */
  async sendWelcomeEmail(data: LeadEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: 'DealershipAI <welcome@dealershipai.com>',
        to: data.email,
        subject: `Your AI Visibility Report for ${data.dealershipName || data.businessName} is Ready!`,
        html: this.generateWelcomeEmailHTML(data),
        text: this.generateWelcomeEmailText(data),
        tags: [
          { name: 'type', value: 'welcome-email' },
          { name: 'lead-id', value: data.leadId }
        ]
      })

      return { success: true, messageId: result.data?.id }
    } catch (error: any) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send follow-up email
   */
  async sendFollowUpEmail(data: LeadEmailData, followUpType: 'day1' | 'day3' | 'day7'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const subject = this.getFollowUpSubject(followUpType, data.dealershipName || data.businessName)
      
      const result = await this.resend.emails.send({
        from: 'DealershipAI <followup@dealershipai.com>',
        to: data.email,
        subject,
        html: this.generateFollowUpHTML(data, followUpType),
        text: this.generateFollowUpText(data, followUpType),
        tags: [
          { name: 'type', value: 'follow-up' },
          { name: 'follow-up-type', value: followUpType },
          { name: 'lead-id', value: data.leadId }
        ]
      })

      return { success: true, messageId: result.data?.id }
    } catch (error: any) {
      console.error('Failed to send follow-up email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: 'DealershipAI <test@dealershipai.com>',
        to,
        subject: 'DealershipAI Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">DealershipAI Email Test</h1>
            <p>This is a test email to verify that the Resend integration is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Status:</strong> ✅ Email system is working!</p>
          </div>
        `,
        text: 'DealershipAI Email Test - This is a test email to verify that the Resend integration is working correctly.',
        tags: [
          { name: 'type', value: 'test-email' }
        ]
      })

      return { success: true, messageId: result.data?.id }
    } catch (error: any) {
      console.error('Failed to send test email:', error)
      return { success: false, error: error.message }
    }
  }

  private generateLeadNotificationHTML(data: LeadEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚗 New Dealership Lead</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">DealershipAI Lead Notification</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Lead Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2563eb; margin-top: 0;">${data.dealershipName || data.businessName}</h3>
            <p><strong>Website:</strong> <a href="${data.website}" target="_blank">${data.website}</a></p>
            <p><strong>Contact:</strong> ${data.name} (${data.email})</p>
            <p><strong>Role:</strong> ${data.role || 'Not specified'}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin-top: 0;">🎯 Main Challenge</h4>
            <p style="color: #92400e; margin: 0;">${this.getChallengeDescription(data.challenge)}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://app.dealershipai.com/leads/${data.leadId}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Full Lead Details
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 14px;">
          <p>Lead ID: ${data.leadId} | Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  }

  private generateLeadNotificationText(data: LeadEmailData): string {
    return `
New Dealership Lead - DealershipAI

Lead Details:
- Business: ${data.dealershipName || data.businessName}
- Website: ${data.website}
- Contact: ${data.name} (${data.email})
- Role: ${data.role || 'Not specified'}

Main Challenge: ${this.getChallengeDescription(data.challenge)}

View full lead details: https://app.dealershipai.com/leads/${data.leadId}

Lead ID: ${data.leadId}
Generated: ${new Date().toLocaleString()}
    `.trim()
  }

  private generateWelcomeEmailHTML(data: LeadEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to DealershipAI!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your AI visibility analysis is ready</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${data.name}!</h2>
          
          <p>Thank you for requesting an AI visibility audit for <strong>${data.dealershipName || data.businessName}</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">📊 Your AI Visibility Report</h3>
            <p>We've analyzed your dealership's visibility across:</p>
            <ul style="color: #4b5563;">
              <li>ChatGPT & Claude</li>
              <li>Google AI Overview</li>
              <li>Perplexity & other AI platforms</li>
              <li>Local search visibility</li>
            </ul>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">🎯 Your Challenge: ${this.getChallengeDescription(data.challenge)}</h4>
            <p style="color: #1e40af; margin: 0;">We've specifically analyzed this area and included targeted recommendations.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.dealershipai.com/report/${data.leadId}" 
               style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              View Your AI Visibility Report
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 What's Next?</h4>
            <p style="color: #92400e; margin: 0;">Our team will review your report and reach out within 24 hours with personalized recommendations.</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 14px;">
          <p>Questions? Reply to this email or contact us at support@dealershipai.com</p>
        </div>
      </div>
    `
  }

  private generateWelcomeEmailText(data: LeadEmailData): string {
    return `
Welcome to DealershipAI!

Hi ${data.name}!

Thank you for requesting an AI visibility audit for ${data.dealershipName || data.businessName}.

Your AI Visibility Report
We've analyzed your dealership's visibility across:
- ChatGPT & Claude
- Google AI Overview  
- Perplexity & other AI platforms
- Local search visibility

Your Challenge: ${this.getChallengeDescription(data.challenge)}
We've specifically analyzed this area and included targeted recommendations.

View Your Report: https://app.dealershipai.com/report/${data.leadId}

What's Next?
Our team will review your report and reach out within 24 hours with personalized recommendations.

Questions? Reply to this email or contact us at support@dealershipai.com
    `.trim()
  }

  private generateFollowUpHTML(data: LeadEmailData, followUpType: 'day1' | 'day3' | 'day7'): string {
    const followUpContent = this.getFollowUpContent(followUpType)
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${followUpContent.icon} ${followUpContent.title}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">DealershipAI Follow-up</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${data.name}!</h2>
          
          <p>${followUpContent.intro}</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">${followUpContent.sectionTitle}</h3>
            <p>${followUpContent.sectionContent}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.dealershipai.com/report/${data.leadId}" 
               style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              ${followUpContent.ctaText}
            </a>
          </div>
          
          ${followUpContent.additionalContent ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">${followUpContent.additionalTitle}</h4>
              <p style="color: #92400e; margin: 0;">${followUpContent.additionalContent}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 14px;">
          <p>Questions? Reply to this email or contact us at support@dealershipai.com</p>
        </div>
      </div>
    `
  }

  private generateFollowUpText(data: LeadEmailData, followUpType: 'day1' | 'day3' | 'day7'): string {
    const followUpContent = this.getFollowUpContent(followUpType)
    
    return `
${followUpContent.title} - DealershipAI Follow-up

Hi ${data.name}!

${followUpContent.intro}

${followUpContent.sectionTitle}
${followUpContent.sectionContent}

${followUpContent.ctaText}: https://app.dealershipai.com/report/${data.leadId}

${followUpContent.additionalContent ? `${followUpContent.additionalTitle}\n${followUpContent.additionalContent}` : ''}

Questions? Reply to this email or contact us at support@dealershipai.com
    `.trim()
  }

  private getChallengeDescription(challenge: string): string {
    const descriptions: Record<string, string> = {
      'invisible': 'Not showing up in ChatGPT/AI searches',
      'competitors': 'Losing leads to AI-recommended competitors',
      'reviews': 'Reviews hurting AI rankings',
      'unknown': 'Don\'t know if I have a problem yet'
    }
    return descriptions[challenge] || challenge
  }

  private getFollowUpSubject(followUpType: 'day1' | 'day3' | 'day7', businessName: string): string {
    const subjects = {
      'day1': `Quick question about your ${businessName} AI visibility report`,
      'day3': `How's your AI visibility strategy going, ${businessName}?`,
      'day7': `Last chance: AI visibility insights for ${businessName}`
    }
    return subjects[followUpType]
  }

  private getFollowUpContent(followUpType: 'day1' | 'day3' | 'day7') {
    const content = {
      'day1': {
        icon: '🤔',
        title: 'Quick Question',
        intro: 'I hope you had a chance to review your AI visibility report. I wanted to follow up with a quick question.',
        sectionTitle: 'Did you find the report helpful?',
        sectionContent: 'We\'re always looking to improve our analysis. Your feedback helps us provide better insights for dealerships like yours.',
        ctaText: 'Share Your Feedback',
        additionalTitle: '💡 Pro Tip',
        additionalContent: 'The biggest impact usually comes from optimizing your Google My Business profile and improving your local content strategy.'
      },
      'day3': {
        icon: '📈',
        title: 'Strategy Update',
        intro: 'I wanted to check in and see how your AI visibility strategy is progressing.',
        sectionTitle: 'Ready to take action?',
        sectionContent: 'Many dealerships see significant improvements in AI visibility within 30 days of implementing our recommendations.',
        ctaText: 'View Action Plan',
        additionalTitle: '🎯 Success Story',
        additionalContent: 'Dealership X increased their AI citations by 300% in just 6 weeks using our framework.'
      },
      'day7': {
        icon: '⏰',
        title: 'Last Chance',
        intro: 'This is my final follow-up about your AI visibility report.',
        sectionTitle: 'Don\'t let competitors get ahead',
        sectionContent: 'Every day you wait is another day competitors are optimizing their AI visibility while you\'re not.',
        ctaText: 'Get Started Today',
        additionalTitle: '🚨 Urgent',
        additionalContent: 'AI search is growing 40% month-over-month. The sooner you start, the better your competitive position.'
      }
    }
    return content[followUpType]
  }
}

export const emailService = new EmailService()

