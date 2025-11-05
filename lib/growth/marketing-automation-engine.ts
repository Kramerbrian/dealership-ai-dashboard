/**
 * Marketing Automation Engine
 * Handles email sequences, drip campaigns, and behavioral triggers
 */

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'signup' | 'audit_complete' | 'trial_start' | 'trial_end' | 'upgrade' | 'downgrade';
  conditions?: Record<string, any>;
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationAction {
  type: 'email' | 'sms' | 'webhook' | 'notification';
  template?: string;
  delay?: number; // minutes
  params?: Record<string, any>;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'drip' | 'triggered' | 'broadcast';
  status: 'draft' | 'active' | 'paused' | 'completed';
  rules: AutomationRule[];
  createdAt: Date;
  updatedAt: Date;
}

export class MarketingAutomationEngine {
  private campaigns: Map<string, Campaign> = new Map();
  private rules: Map<string, AutomationRule> = new Map();
  private eventQueue: Array<{ event: string; userId: string; data: any; timestamp: Date }> = [];

  /**
   * Register automation rule
   */
  registerRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Create campaign
   */
  createCampaign(campaign: Campaign): void {
    this.campaigns.set(campaign.id, campaign);
  }

  /**
   * Process event and trigger automations
   */
  async processEvent(event: string, userId: string, data: any): Promise<void> {
    this.eventQueue.push({
      event,
      userId,
      data,
      timestamp: new Date(),
    });

    // Find matching rules
    const matchingRules = Array.from(this.rules.values()).filter(
      rule => rule.enabled && rule.trigger === event && this.checkConditions(rule.conditions, data)
    );

    // Execute actions
    for (const rule of matchingRules) {
      for (const action of rule.actions) {
        await this.executeAction(action, userId, data);
      }
    }
  }

  /**
   * Check if conditions are met
   */
  private checkConditions(conditions?: Record<string, any>, data?: any): boolean {
    if (!conditions) return true;

    for (const [key, value] of Object.entries(conditions)) {
      if (data?.[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute automation action
   */
  private async executeAction(action: AutomationAction, userId: string, data: any): Promise<void> {
    // Delay if specified
    if (action.delay) {
      await new Promise(resolve => setTimeout(resolve, action.delay! * 60 * 1000));
    }

    switch (action.type) {
      case 'email':
        await this.sendEmail(userId, action.template || '', action.params || {});
        break;
      case 'sms':
        await this.sendSMS(userId, action.template || '', action.params || {});
        break;
      case 'webhook':
        await this.callWebhook(action.params?.url || '', { userId, ...data });
        break;
      case 'notification':
        await this.sendNotification(userId, action.params || {});
        break;
    }
  }

  /**
   * Send email via automation
   */
  private async sendEmail(userId: string, template: string, params: Record<string, any>): Promise<void> {
    try {
      const response = await fetch(process.env.MAUTOMATE_URL + '/hooks/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAUTOMATE_KEY}`,
        },
        body: JSON.stringify({
          userId,
          template,
          params,
        }),
      });

      if (!response.ok) {
        console.error('Email automation failed:', await response.text());
      }
    } catch (error) {
      console.error('Email automation error:', error);
    }
  }

  /**
   * Send SMS
   */
  private async sendSMS(userId: string, template: string, params: Record<string, any>): Promise<void> {
    // Implement SMS sending logic
    console.log('SMS automation:', { userId, template, params });
  }

  /**
   * Call webhook
   */
  private async callWebhook(url: string, data: any): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Webhook automation error:', error);
    }
  }

  /**
   * Send in-app notification
   */
  private async sendNotification(userId: string, params: Record<string, any>): Promise<void> {
    // Implement notification logic (could use Supabase realtime, WebSockets, etc.)
    console.log('Notification automation:', { userId, params });
  }

  /**
   * Get user's automation history
   */
  getUserAutomationHistory(userId: string): Array<{ event: string; timestamp: Date; data: any }> {
    return this.eventQueue
      .filter(e => e.userId === userId)
      .map(e => ({
        event: e.event,
        timestamp: e.timestamp,
        data: e.data,
      }));
  }
}

export const marketingAutomation = new MarketingAutomationEngine();

/**
 * Initialize default automation rules
 */
export function initializeDefaultAutomations(): void {
  // Onboarding sequence
  marketingAutomation.registerRule({
    id: 'onboarding_welcome',
    name: 'Welcome Email',
    trigger: 'signup',
    actions: [
      {
        type: 'email',
        template: 'welcome',
        delay: 0,
      },
    ],
    enabled: true,
  });

  // Audit complete
  marketingAutomation.registerRule({
    id: 'audit_complete_tips',
    name: 'Audit Complete - Tips Email',
    trigger: 'audit_complete',
    actions: [
      {
        type: 'email',
        template: 'audit_tips',
        delay: 60, // 1 hour
      },
    ],
    enabled: true,
  });

  // Trial ending reminder
  marketingAutomation.registerRule({
    id: 'trial_ending_reminder',
    name: 'Trial Ending Reminder',
    trigger: 'trial_end',
    conditions: {
      daysRemaining: 3,
    },
    actions: [
      {
        type: 'email',
        template: 'trial_ending',
        delay: 0,
      },
    ],
    enabled: true,
  });
}

