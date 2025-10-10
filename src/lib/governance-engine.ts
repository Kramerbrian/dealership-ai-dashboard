/**
 * Governance Engine for HyperAIV™ System
 * Implements automated model governance and stability monitoring
 */

import { createClient } from '@supabase/supabase-js';

interface GovernanceRule {
  id: string;
  rule_name: string;
  rule_type: 'threshold' | 'trend' | 'anomaly';
  metric_name: string;
  operator: '<' | '>' | '<=' | '>=' | '=' | '!=';
  threshold_value: number;
  action_type: 'freeze_model' | 'alert' | 'auto_retrain' | 'manual_review';
  action_message: string;
  is_active: boolean;
}

interface GovernanceViolation {
  rule_name: string;
  violation_type: string;
  current_value: number;
  threshold_value: number;
  action_required: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ModelMetrics {
  r2: number;
  rmse: number;
  mape: number;
  accuracy_gain_percent: number;
  roi_gain_percent: number;
  ad_efficiency_gain_percent: number;
  correlation_aiv_geo: number;
  mean_latency_days: number;
}

export class GovernanceEngine {
  private supabase: any;
  private rules: GovernanceRule[] = [];

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (url && key) {
      this.supabase = createClient(url, key);
    } else {
      console.warn('Supabase environment variables not set, using mock client');
      this.supabase = null;
    }
  }

  /**
   * Load governance rules from database
   */
  async loadRules(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('governance_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      this.rules = data || [];
      
      console.log(`📋 Loaded ${this.rules.length} governance rules`);
    } catch (error) {
      console.error('❌ Error loading governance rules:', error);
      this.rules = [];
    }
  }

  /**
   * Check all governance rules against current metrics
   */
  async checkViolations(
    dealerId: string, 
    metrics: ModelMetrics
  ): Promise<GovernanceViolation[]> {
    await this.loadRules();
    
    const violations: GovernanceViolation[] = [];

    for (const rule of this.rules) {
      const violation = await this.checkRule(rule, metrics);
      if (violation) {
        violations.push(violation);
      }
    }

    // Log violations
    if (violations.length > 0) {
      console.log(`⚠️ Found ${violations.length} governance violations for dealer ${dealerId}`);
      violations.forEach(v => {
        console.log(`   - ${v.rule_name}: ${v.current_value} ${v.severity}`);
      });
    }

    return violations;
  }

  /**
   * Check individual rule against metrics
   */
  private async checkRule(
    rule: GovernanceRule, 
    metrics: ModelMetrics
  ): Promise<GovernanceViolation | null> {
    const currentValue = this.getMetricValue(rule.metric_name, metrics);
    
    if (currentValue === null) {
      return null; // Metric not available
    }

    const isViolation = this.evaluateCondition(
      currentValue, 
      rule.operator, 
      rule.threshold_value
    );

    if (!isViolation) {
      return null;
    }

    return {
      rule_name: rule.rule_name,
      violation_type: rule.rule_type,
      current_value: currentValue,
      threshold_value: rule.threshold_value,
      action_required: rule.action_type,
      severity: this.getSeverity(rule.action_type)
    };
  }

  /**
   * Get metric value from metrics object
   */
  private getMetricValue(metricName: string, metrics: ModelMetrics): number | null {
    switch (metricName) {
      case 'r2': return metrics.r2;
      case 'rmse': return metrics.rmse;
      case 'mape': return metrics.mape;
      case 'accuracy_gain_percent': return metrics.accuracy_gain_percent;
      case 'roi_gain_percent': return metrics.roi_gain_percent;
      case 'ad_efficiency_gain_percent': return metrics.ad_efficiency_gain_percent;
      case 'correlation_aiv_geo': return metrics.correlation_aiv_geo;
      case 'mean_latency_days': return metrics.mean_latency_days;
      default: return null;
    }
  }

  /**
   * Evaluate condition (current value vs threshold)
   */
  private evaluateCondition(
    currentValue: number, 
    operator: string, 
    thresholdValue: number
  ): boolean {
    switch (operator) {
      case '<': return currentValue < thresholdValue;
      case '>': return currentValue > thresholdValue;
      case '<=': return currentValue <= thresholdValue;
      case '>=': return currentValue >= thresholdValue;
      case '=': return Math.abs(currentValue - thresholdValue) < 0.001;
      case '!=': return Math.abs(currentValue - thresholdValue) >= 0.001;
      default: return false;
    }
  }

  /**
   * Get severity level based on action type
   */
  private getSeverity(actionType: string): 'critical' | 'high' | 'medium' {
    switch (actionType) {
      case 'freeze_model': return 'critical';
      case 'manual_review': return 'high';
      case 'alert': return 'medium';
      case 'auto_retrain': return 'medium';
      default: return 'medium';
    }
  }

  /**
   * Execute governance actions based on violations
   */
  async executeActions(
    dealerId: string, 
    violations: GovernanceViolation[]
  ): Promise<{ actions_taken: string[]; model_frozen: boolean }> {
    const actionsTaken: string[] = [];
    let modelFrozen = false;

    for (const violation of violations) {
      const action = await this.executeAction(dealerId, violation);
      if (action) {
        actionsTaken.push(action);
        
        if (violation.action_required === 'freeze_model') {
          modelFrozen = true;
        }
      }
    }

    return { actions_taken: actionsTaken, model_frozen: modelFrozen };
  }

  /**
   * Execute individual action
   */
  private async executeAction(
    dealerId: string, 
    violation: GovernanceViolation
  ): Promise<string | null> {
    try {
      switch (violation.action_required) {
        case 'freeze_model':
          await this.freezeModel(dealerId, violation);
          return `Model frozen due to: ${violation.rule_name}`;

        case 'alert':
          await this.sendAlert(dealerId, violation);
          return `Alert sent for: ${violation.rule_name}`;

        case 'manual_review':
          await this.flagForReview(dealerId, violation);
          return `Flagged for manual review: ${violation.rule_name}`;

        case 'auto_retrain':
          await this.triggerRetrain(dealerId, violation);
          return `Auto-retrain triggered: ${violation.rule_name}`;

        default:
          return null;
      }
    } catch (error) {
      console.error(`❌ Error executing action ${violation.action_required}:`, error);
      return null;
    }
  }

  /**
   * Freeze model updates
   */
  private async freezeModel(dealerId: string, violation: GovernanceViolation): Promise<void> {
    await this.supabase
      .from('model_weights')
      .update({ 
        governance_status: 'frozen',
        updated_at: new Date().toISOString()
      })
      .eq('dealer_id', dealerId);

    // Log the freeze event
    await this.supabase
      .from('governance_actions')
      .insert({
        dealer_id: dealerId,
        action_type: 'freeze_model',
        rule_name: violation.rule_name,
        violation_details: violation,
        executed_at: new Date().toISOString()
      });

    console.log(`🔒 Model frozen for dealer ${dealerId} due to ${violation.rule_name}`);
  }

  /**
   * Send alert notification
   */
  private async sendAlert(dealerId: string, violation: GovernanceViolation): Promise<void> {
    // Log alert
    await this.supabase
      .from('governance_actions')
      .insert({
        dealer_id: dealerId,
        action_type: 'alert',
        rule_name: violation.rule_name,
        violation_details: violation,
        executed_at: new Date().toISOString()
      });

    console.log(`🚨 Alert sent for dealer ${dealerId}: ${violation.rule_name}`);
  }

  /**
   * Flag for manual review
   */
  private async flagForReview(dealerId: string, violation: GovernanceViolation): Promise<void> {
    await this.supabase
      .from('model_weights')
      .update({ 
        governance_status: 'review',
        updated_at: new Date().toISOString()
      })
      .eq('dealer_id', dealerId);

    // Log review flag
    await this.supabase
      .from('governance_actions')
      .insert({
        dealer_id: dealerId,
        action_type: 'manual_review',
        rule_name: violation.rule_name,
        violation_details: violation,
        executed_at: new Date().toISOString()
      });

    console.log(`🔍 Flagged for review: dealer ${dealerId}, rule ${violation.rule_name}`);
  }

  /**
   * Trigger automatic retraining
   */
  private async triggerRetrain(dealerId: string, violation: GovernanceViolation): Promise<void> {
    // Log retrain trigger
    await this.supabase
      .from('governance_actions')
      .insert({
        dealer_id: dealerId,
        action_type: 'auto_retrain',
        rule_name: violation.rule_name,
        violation_details: violation,
        executed_at: new Date().toISOString()
      });

    // Trigger retrain via API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/hyperaiv/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId, trigger: 'governance_auto_retrain' })
      });

      if (response.ok) {
        console.log(`🔄 Auto-retrain triggered for dealer ${dealerId}`);
      } else {
        console.error(`❌ Failed to trigger auto-retrain for dealer ${dealerId}`);
      }
    } catch (error) {
      console.error(`❌ Error triggering auto-retrain:`, error);
    }
  }

  /**
   * Check if model is frozen
   */
  async isModelFrozen(dealerId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('model_weights')
        .select('governance_status')
        .eq('dealer_id', dealerId)
        .single();

      if (error) throw error;
      return data?.governance_status === 'frozen';
    } catch (error) {
      console.error('❌ Error checking model freeze status:', error);
      return false;
    }
  }

  /**
   * Unfreeze model (manual action)
   */
  async unfreezeModel(dealerId: string, reason: string): Promise<void> {
    try {
      await this.supabase
        .from('model_weights')
        .update({ 
          governance_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('dealer_id', dealerId);

      // Log unfreeze action
      await this.supabase
        .from('governance_actions')
        .insert({
          dealer_id: dealerId,
          action_type: 'unfreeze_model',
          rule_name: 'manual_override',
          violation_details: { reason },
          executed_at: new Date().toISOString()
        });

      console.log(`🔓 Model unfrozen for dealer ${dealerId}: ${reason}`);
    } catch (error) {
      console.error('❌ Error unfreezing model:', error);
    }
  }

  /**
   * Get governance status summary
   */
  async getGovernanceStatus(dealerId: string): Promise<{
    status: 'active' | 'frozen' | 'review';
    violations: GovernanceViolation[];
    last_check: string;
    actions_taken: any[];
  }> {
    try {
      // Get model status
      const { data: modelData, error: modelError } = await this.supabase
        .from('model_weights')
        .select('governance_status, updated_at')
        .eq('dealer_id', dealerId)
        .single();

      if (modelError) throw modelError;

      // Get recent violations
      const { data: violations, error: violationsError } = await this.supabase
        .rpc('check_governance_violations', { dealer_id_param: dealerId });

      if (violationsError) {
        console.error('❌ Error checking violations:', violationsError);
      }

      // Get recent actions
      const { data: actions, error: actionsError } = await this.supabase
        .from('governance_actions')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('executed_at', { ascending: false })
        .limit(10);

      if (actionsError) {
        console.error('❌ Error fetching actions:', actionsError);
      }

      return {
        status: modelData?.governance_status || 'active',
        violations: violations || [],
        last_check: modelData?.updated_at || new Date().toISOString(),
        actions_taken: actions || []
      };
    } catch (error) {
      console.error('❌ Error getting governance status:', error);
      return {
        status: 'active',
        violations: [],
        last_check: new Date().toISOString(),
        actions_taken: []
      };
    }
  }
}

export default GovernanceEngine;
