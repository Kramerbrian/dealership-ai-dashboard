/**
 * I2E (Insight-to-Execution) Types
 * 
 * Core type definitions for the Hyper-Actionable UX/UI Design system
 */

export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type UpdateType = 'feature' | 'model' | 'improvement' | 'alert' | 'maintenance';

/**
 * Pulse-Style Update Card
 * Similar to ChatGPT Pulse tiles for displaying updates
 */
export interface UpdateCard {
  id: string;
  title: string;
  summary: string;
  date: Date;
  type: UpdateType;
  ctaText?: string;
  ctaLink?: string;
  metadata?: {
    impact?: string;
    category?: string;
    tags?: string[];
  };
}

/**
 * Actionable Contextual Nugget (ACN)
 * Small badges placed directly on graphs/data points
 */
export interface ActionableContextualNugget {
  id: string;
  insight: string; // 3-word summary (e.g., "Churn Risk High")
  ctaText: string; // Primary action button text
  ctaAction: () => void | Promise<void>;
  severity: InsightSeverity;
  position: {
    x: number; // Percentage or pixel position
    y: number;
    anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
  dataPointId?: string; // Reference to the data point this ACN is attached to
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
}

/**
 * Execution Playbook Step
 * Individual step in an auto-generated execution sequence
 */
export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  autoExecute?: boolean; // If true, executes automatically on approval
  estimatedTime?: string; // e.g., "5 min", "1h"
  dependencies?: string[]; // IDs of steps that must complete first
  action?: () => void | Promise<void>;
  result?: {
    success: boolean;
    message?: string;
    data?: any;
  };
}

/**
 * Auto-Generated Execution Playbook
 * Multi-step sequence opened when major insight is clicked
 */
export interface ExecutionPlaybook {
  id: string;
  title: string;
  description: string;
  insightId: string; // Reference to the insight that triggered this
  steps: ExecutionStep[];
  autoExecuteFirst?: number; // Number of steps to auto-execute (default: 1-2)
  createdAt: Date;
  completedAt?: Date;
}

/**
 * One-Click Correction Widget
 * Simple fix widget for minor, common issues
 */
export interface OneClickCorrection {
  id: string;
  issue: string; // Brief description of the issue
  fix: string; // Description of the recommended fix
  action: () => void | Promise<void>;
  severity: InsightSeverity;
  category?: string; // e.g., 'data-drift', 'theme', 'configuration'
  estimatedTime?: string; // e.g., "30s", "2 min"
}

/**
 * I2E Metrics
 * Track performance of I2E elements
 */
export interface I2EMetrics {
  acnClickThroughRate: number; // Percentage of ACNs clicked
  playbookCompletionRate: number; // Percentage of playbooks completed
  correctionWidgetUsage: number; // Number of corrections executed
  averageTimeToAction: number; // Milliseconds from insight to action
  updateCardEngagement: number; // Percentage of update cards clicked
}

