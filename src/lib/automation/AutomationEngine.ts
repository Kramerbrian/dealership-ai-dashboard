/**
 * AutomationEngine - Profound-inspired
 * Handles workflow execution and alert management
 */

export interface Trigger {
  id: string;
  type: 'visibility_drop' | 'competitor_rank' | 'mention_detected' | 'sentiment_change' | 'rank_change';
  condition: string;
  threshold?: number;
  timeframe?: string;
  dealerId: string;
}

export interface Action {
  id: string;
  type: 'alert' | 'auto_optimize' | 'report' | 'monitor' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: Trigger;
  actions: Action[];
  enabled: boolean;
  lastRun?: string;
  runs: number;
  dealerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: 'visibility' | 'competitor' | 'mention' | 'sentiment' | 'rank';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  source: string;
  dealerId: string;
  workflowId?: string;
  metadata?: Record<string, any>;
}

export class AutomationEngine {
  private workflows: Map<string, Workflow> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.loadWorkflows();
    this.loadAlerts();
  }

  /**
   * Create a new workflow
   */
  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runs'>): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runs: 0
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    this.saveWorkflows();
    return newWorkflow;
  }

  /**
   * Update an existing workflow
   */
  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(id, updatedWorkflow);
    this.saveWorkflows();
    return updatedWorkflow;
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(id: string): boolean {
    const deleted = this.workflows.delete(id);
    if (deleted) {
      this.saveWorkflows();
    }
    return deleted;
  }

  /**
   * Get all workflows for a dealer
   */
  getWorkflows(dealerId: string): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.dealerId === dealerId);
  }

  /**
   * Get all alerts for a dealer
   */
  getAlerts(dealerId: string): Alert[] {
    return Array.from(this.alerts.values())
      .filter(a => a.dealerId === dealerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Mark alert as read
   */
  markAlertRead(id: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    alert.read = true;
    this.alerts.set(id, alert);
    this.saveAlerts();
    return true;
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(id: string): boolean {
    const deleted = this.alerts.delete(id);
    if (deleted) {
      this.saveAlerts();
    }
    return deleted;
  }

  /**
   * Check triggers and execute workflows
   */
  async checkTriggers(dealerId: string, metrics: any): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const workflows = this.getWorkflows(dealerId).filter(w => w.enabled);
      
      for (const workflow of workflows) {
        const shouldExecute = await this.evaluateTrigger(workflow.trigger, metrics);
        
        if (shouldExecute) {
          await this.executeWorkflow(workflow, metrics);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Evaluate if a trigger condition is met
   */
  private async evaluateTrigger(trigger: Trigger, metrics: any): Promise<boolean> {
    switch (trigger.type) {
      case 'visibility_drop':
        return metrics.aiVisibilityScore < (trigger.threshold || 50);
      
      case 'competitor_rank':
        return metrics.competitorRank > (trigger.threshold || 5);
      
      case 'mention_detected':
        return metrics.newMentions > 0;
      
      case 'sentiment_change':
        return metrics.sentimentScore < (trigger.threshold || 70);
      
      case 'rank_change':
        return Math.abs(metrics.rankChange) > (trigger.threshold || 2);
      
      default:
        return false;
    }
  }

  /**
   * Execute a workflow
   */
  private async executeWorkflow(workflow: Workflow, metrics: any): Promise<void> {
    console.log(`Executing workflow: ${workflow.name}`);
    
    // Update workflow run count
    workflow.runs++;
    workflow.lastRun = new Date().toISOString();
    this.workflows.set(workflow.id, workflow);

    // Execute each action
    for (const action of workflow.actions) {
      if (action.enabled) {
        await this.executeAction(action, workflow, metrics);
      }
    }

    this.saveWorkflows();
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action, workflow: Workflow, metrics: any): Promise<void> {
    try {
      switch (action.type) {
        case 'alert':
          await this.createAlert(action, workflow, metrics);
          break;
        
        case 'auto_optimize':
          await this.autoOptimize(action, workflow, metrics);
          break;
        
        case 'report':
          await this.generateReport(action, workflow, metrics);
          break;
        
        case 'monitor':
          await this.startMonitoring(action, workflow, metrics);
          break;
        
        case 'webhook':
          await this.sendWebhook(action, workflow, metrics);
          break;
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(action: Action, workflow: Workflow, metrics: any): Promise<void> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.getAlertTypeFromTrigger(workflow.trigger.type),
      severity: this.getSeverityFromMetrics(metrics),
      title: action.config.title || `Workflow: ${workflow.name}`,
      message: action.config.message || this.generateAlertMessage(workflow.trigger, metrics),
      timestamp: new Date().toISOString(),
      read: false,
      actionRequired: action.config.actionRequired || false,
      source: 'Automation Engine',
      dealerId: workflow.dealerId,
      workflowId: workflow.id,
      metadata: {
        trigger: workflow.trigger,
        metrics: metrics,
        action: action
      }
    };

    this.alerts.set(alert.id, alert);
    this.saveAlerts();

    // Send notification if configured
    if (action.config.channel) {
      await this.sendNotification(alert, action.config);
    }
  }

  /**
   * Auto-optimize based on action config
   */
  private async autoOptimize(action: Action, workflow: Workflow, metrics: any): Promise<void> {
    console.log(`Auto-optimizing for workflow: ${workflow.name}`);
    
    // This would integrate with your optimization services
    // For now, just log the action
    console.log('Auto-optimization config:', action.config);
  }

  /**
   * Generate a report
   */
  private async generateReport(action: Action, workflow: Workflow, metrics: any): Promise<void> {
    console.log(`Generating report for workflow: ${workflow.name}`);
    
    // This would integrate with your reporting services
    console.log('Report config:', action.config);
  }

  /**
   * Start monitoring
   */
  private async startMonitoring(action: Action, workflow: Workflow, metrics: any): Promise<void> {
    console.log(`Starting monitoring for workflow: ${workflow.name}`);
    
    // This would integrate with your monitoring services
    console.log('Monitoring config:', action.config);
  }

  /**
   * Send webhook
   */
  private async sendWebhook(action: Action, workflow: Workflow, metrics: any): Promise<void> {
    if (!action.config.url) return;

    try {
      const response = await fetch(action.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...action.config.headers
        },
        body: JSON.stringify({
          workflow: workflow,
          metrics: metrics,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(alert: Alert, config: any): Promise<void> {
    // This would integrate with your notification services (Slack, email, SMS)
    console.log(`Sending notification: ${config.channel}`, alert);
  }

  /**
   * Helper methods
   */
  private getAlertTypeFromTrigger(triggerType: string): Alert['type'] {
    switch (triggerType) {
      case 'visibility_drop': return 'visibility';
      case 'competitor_rank': return 'competitor';
      case 'mention_detected': return 'mention';
      case 'sentiment_change': return 'sentiment';
      case 'rank_change': return 'rank';
      default: return 'visibility';
    }
  }

  private getSeverityFromMetrics(metrics: any): Alert['severity'] {
    if (metrics.aiVisibilityScore < 30) return 'critical';
    if (metrics.aiVisibilityScore < 50) return 'high';
    if (metrics.aiVisibilityScore < 70) return 'medium';
    return 'low';
  }

  private generateAlertMessage(trigger: Trigger, metrics: any): string {
    switch (trigger.type) {
      case 'visibility_drop':
        return `AI Visibility Score dropped to ${metrics.aiVisibilityScore}% (threshold: ${trigger.threshold}%)`;
      case 'competitor_rank':
        return `Competitor ranked #${metrics.competitorRank} (threshold: ${trigger.threshold})`;
      case 'mention_detected':
        return `New mention detected: ${metrics.newMentions} mentions`;
      case 'sentiment_change':
        return `Sentiment dropped to ${metrics.sentimentScore}% (threshold: ${trigger.threshold}%)`;
      case 'rank_change':
        return `Rank changed by ${metrics.rankChange} positions`;
      default:
        return 'Workflow triggered';
    }
  }

  /**
   * Persistence methods
   */
  private saveWorkflows(): void {
    // In production, this would save to database
    if (typeof window !== 'undefined') {
      localStorage.setItem('dealershipai_workflows', JSON.stringify(Array.from(this.workflows.entries())));
    }
  }

  private loadWorkflows(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('dealershipai_workflows');
      if (stored) {
        const workflows = JSON.parse(stored);
        this.workflows = new Map(workflows);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }

  private saveAlerts(): void {
    // In production, this would save to database
    if (typeof window !== 'undefined') {
      localStorage.setItem('dealershipai_alerts', JSON.stringify(Array.from(this.alerts.entries())));
    }
  }

  private loadAlerts(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('dealershipai_alerts');
      if (stored) {
        const alerts = JSON.parse(stored);
        this.alerts = new Map(alerts);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine();
