/**
 * Intelligent Email Automation Engine
 * AI-powered email sequences and notifications
 */

export interface EmailSequence {
  id: string;
  name: string;
  trigger: 'signup' | 'trial_start' | 'score_improvement' | 'competitor_alert' | 'achievement_unlock';
  steps: EmailStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailStep {
  id: string;
  sequenceId: string;
  stepNumber: number;
  subject: string;
  template: string;
  delayHours: number;
  conditions?: EmailCondition[];
  personalization: EmailPersonalization;
}

export interface EmailCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface EmailPersonalization {
  useFirstName: boolean;
  useDealershipName: boolean;
  useScore: boolean;
  useCompetitorData: boolean;
  useAchievements: boolean;
}

export interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
}

export class EmailAutomationEngine {
  private sequences: EmailSequence[] = [];
  private metrics: Map<string, EmailMetrics> = new Map();

  constructor() {
    this.initializeDefaultSequences();
  }

  /**
   * Initialize default email sequences
   */
  private initializeDefaultSequences(): void {
    // Welcome sequence for new signups
    const welcomeSequence: EmailSequence = {
      id: 'welcome-sequence',
      name: 'Welcome to DealershipAI',
      trigger: 'signup',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [
        {
          id: 'welcome-1',
          sequenceId: 'welcome-sequence',
          stepNumber: 1,
          subject: 'Welcome to DealershipAI! Your AI visibility journey starts now',
          template: 'welcome-email-1',
          delayHours: 0,
          personalization: {
            useFirstName: true,
            useDealershipName: true,
            useScore: false,
            useCompetitorData: false,
            useAchievements: false
          }
        },
        {
          id: 'welcome-2',
          sequenceId: 'welcome-sequence',
          stepNumber: 2,
          subject: 'Your first AI scan is ready - See how you stack up',
          template: 'welcome-email-2',
          delayHours: 24,
          personalization: {
            useFirstName: true,
            useDealershipName: true,
            useScore: true,
            useCompetitorData: true,
            useAchievements: false
          }
        },
        {
          id: 'welcome-3',
          sequenceId: 'welcome-sequence',
          stepNumber: 3,
          subject: '3 quick wins to boost your AI visibility',
          template: 'welcome-email-3',
          delayHours: 72,
          personalization: {
            useFirstName: true,
            useDealershipName: true,
            useScore: true,
            useCompetitorData: true,
            useAchievements: false
          }
        }
      ]
    };

    // Score improvement celebration
    const improvementSequence: EmailSequence = {
      id: 'improvement-sequence',
      name: 'Score Improvement Celebration',
      trigger: 'score_improvement',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [
        {
          id: 'improvement-1',
          sequenceId: 'improvement-sequence',
          stepNumber: 1,
          subject: '🎉 Congratulations! Your AI visibility improved by {{scoreIncrease}}%',
          template: 'improvement-email-1',
          delayHours: 0,
          conditions: [
            { field: 'scoreIncrease', operator: 'greater_than', value: 5 }
          ],
          personalization: {
            useFirstName: true,
            useDealershipName: true,
            useScore: true,
            useCompetitorData: true,
            useAchievements: true
          }
        }
      ]
    };

    // Competitor alert sequence
    const competitorSequence: EmailSequence = {
      id: 'competitor-alert-sequence',
      name: 'Competitor Intelligence Alerts',
      trigger: 'competitor_alert',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [
        {
          id: 'competitor-1',
          sequenceId: 'competitor-alert-sequence',
          stepNumber: 1,
          subject: '🚨 Alert: {{competitorName}} gained {{scoreIncrease}}% AI visibility',
          template: 'competitor-alert-email-1',
          delayHours: 0,
          personalization: {
            useFirstName: true,
            useDealershipName: true,
            useScore: true,
            useCompetitorData: true,
            useAchievements: false
          }
        }
      ]
    };

    this.sequences.push(welcomeSequence, improvementSequence, competitorSequence);
  }

  /**
   * Trigger email sequence
   */
  async triggerSequence(trigger: string, userId: string, data: any): Promise<void> {
    const sequence = this.sequences.find(s => s.trigger === trigger && s.isActive);
    if (!sequence) return;

    for (const step of sequence.steps) {
      // Check conditions
      if (step.conditions && !this.evaluateConditions(step.conditions, data)) {
        continue;
      }

      // Schedule email
      await this.scheduleEmail(step, userId, data);
    }
  }

  /**
   * Send personalized email
   */
  async sendPersonalizedEmail(step: EmailStep, userId: string, data: any): Promise<void> {
    const personalizedContent = await this.personalizeEmail(step, data);
    
    // Simulate email sending
    console.log(`Sending email to user ${userId}:`, {
      subject: personalizedContent.subject,
      template: step.template,
      personalization: step.personalization
    });

    // Update metrics
    this.updateMetrics(step.id, 'sent');
  }

  /**
   * Track email engagement
   */
  async trackEngagement(emailId: string, event: 'delivered' | 'opened' | 'clicked' | 'converted' | 'unsubscribed'): Promise<void> {
    this.updateMetrics(emailId, event);
  }

  /**
   * Get email performance metrics
   */
  getEmailMetrics(emailId: string): EmailMetrics | null {
    return this.metrics.get(emailId) || null;
  }

  /**
   * Get all sequences
   */
  getSequences(): EmailSequence[] {
    return this.sequences;
  }

  /**
   * Create new email sequence
   */
  async createSequence(sequence: Omit<EmailSequence, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailSequence> {
    const newSequence: EmailSequence = {
      ...sequence,
      id: `sequence-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sequences.push(newSequence);
    return newSequence;
  }

  private async scheduleEmail(step: EmailStep, userId: string, data: any): Promise<void> {
    // In a real implementation, this would use a job queue like Bull or similar
    setTimeout(async () => {
      await this.sendPersonalizedEmail(step, userId, data);
    }, step.delayHours * 60 * 60 * 1000);
  }

  private async personalizeEmail(step: EmailStep, data: any): Promise<{ subject: string; content: string }> {
    let subject = step.subject;
    let content = step.template;

    if (step.personalization.useFirstName && data.firstName) {
      subject = subject.replace('{{firstName}}', data.firstName);
      content = content.replace(/{{firstName}}/g, data.firstName);
    }

    if (step.personalization.useDealershipName && data.dealershipName) {
      subject = subject.replace('{{dealershipName}}', data.dealershipName);
      content = content.replace(/{{dealershipName}}/g, data.dealershipName);
    }

    if (step.personalization.useScore && data.score) {
      subject = subject.replace('{{score}}', data.score.toString());
      content = content.replace(/{{score}}/g, data.score.toString());
    }

    if (step.personalization.useCompetitorData && data.competitorData) {
      subject = subject.replace('{{competitorName}}', data.competitorData.name);
      content = content.replace(/{{competitorName}}/g, data.competitorData.name);
    }

    return { subject, content };
  }

  private evaluateConditions(conditions: EmailCondition[], data: any): boolean {
    return conditions.every(condition => {
      const fieldValue = data[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater_than':
          return fieldValue > condition.value;
        case 'less_than':
          return fieldValue < condition.value;
        case 'contains':
          return fieldValue && fieldValue.toString().includes(condition.value);
        default:
          return false;
      }
    });
  }

  private updateMetrics(emailId: string, event: keyof EmailMetrics): void {
    const metrics = this.metrics.get(emailId) || {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      unsubscribed: 0
    };

    metrics[event]++;
    this.metrics.set(emailId, metrics);
  }
}
