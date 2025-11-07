/**
 * I2E Integration Hook
 * 
 * Helper hook for integrating I2E components into the dashboard
 * Provides utilities for generating ACNs, playbooks, and corrections from insights
 */

import { useState, useMemo } from 'react';
import {
  UpdateCard,
  ActionableContextualNugget,
  ExecutionPlaybook,
  OneClickCorrection,
  InsightSeverity
} from './types';

interface Insight {
  id: string;
  summary: string; // 3-word summary for ACN
  severity: InsightSeverity;
  dataPoint?: { x: number; y: number };
  actionText: string;
  playbookId?: string;
  category?: string;
}

interface UseI2EIntegrationOptions {
  insights?: Insight[];
  updates?: UpdateCard[];
  onACNAction?: (insightId: string) => void;
  onCorrectionExecute?: (correctionId: string) => void;
}

export function useI2EIntegration(options: UseI2EIntegrationOptions = {}) {
  const [selectedPlaybook, setSelectedPlaybook] = useState<ExecutionPlaybook | null>(null);
  const [playbookOpen, setPlaybookOpen] = useState(false);

  // Convert insights to ACNs
  const acns = useMemo<ActionableContextualNugget[]>(() => {
    if (!options.insights) return [];

    return options.insights.map(insight => ({
      id: `acn-${insight.id}`,
      insight: insight.summary,
      ctaText: insight.actionText,
      ctaAction: async () => {
        if (insight.playbookId) {
          // Load and open playbook
          // This would typically fetch from API
          // For now, we'll just call the handler
          options.onACNAction?.(insight.id);
        } else {
          options.onACNAction?.(insight.id);
        }
      },
      severity: insight.severity,
      position: insight.dataPoint 
        ? { 
            x: insight.dataPoint.x, 
            y: insight.dataPoint.y, 
            anchor: 'top-right' as const 
          }
        : { x: 75, y: 30, anchor: 'top-right' as const },
      dataPointId: insight.id,
      autoDismiss: insight.severity === 'low' || insight.severity === 'medium',
      dismissAfter: insight.severity === 'low' ? 15000 : 10000
    }));
  }, [options.insights, options.onACNAction]);

  // Generate corrections from insights (for simple fixes)
  const corrections = useMemo<OneClickCorrection[]>(() => {
    if (!options.insights) return [];

    return options.insights
      .filter(insight => insight.severity === 'low' || insight.severity === 'medium')
      .map(insight => ({
        id: `correction-${insight.id}`,
        issue: insight.summary,
        fix: `Automated fix available for ${insight.category || 'this issue'}. Click to resolve.`,
        severity: insight.severity,
        category: insight.category,
        estimatedTime: insight.severity === 'low' ? '10s' : '30s',
        action: async () => {
          options.onCorrectionExecute?.(insight.id);
        }
      }));
  }, [options.insights, options.onCorrectionExecute]);

  const openPlaybook = (playbook: ExecutionPlaybook) => {
    setSelectedPlaybook(playbook);
    setPlaybookOpen(true);
  };

  const closePlaybook = () => {
    setPlaybookOpen(false);
    setTimeout(() => setSelectedPlaybook(null), 300);
  };

  return {
    acns,
    corrections,
    updates: options.updates || [],
    selectedPlaybook,
    playbookOpen,
    openPlaybook,
    closePlaybook
  };
}

/**
 * Generate execution playbook from insight
 */
export function generatePlaybookFromInsight(
  insight: Insight,
  steps: Array<{
    title: string;
    description: string;
    autoExecute?: boolean;
    estimatedTime?: string;
    action?: () => Promise<void>;
  }>
): ExecutionPlaybook {
  return {
    id: `playbook-${insight.id}`,
    title: `${insight.summary} - Action Plan`,
    description: `Automated sequence to address ${insight.summary.toLowerCase()}`,
    insightId: insight.id,
    autoExecuteFirst: steps.filter(s => s.autoExecute).length > 0 ? 2 : 0,
    createdAt: new Date(),
    steps: steps.map((step, index) => ({
      id: `step-${insight.id}-${index}`,
      title: step.title,
      description: step.description,
      status: 'pending' as const,
      autoExecute: step.autoExecute || false,
      estimatedTime: step.estimatedTime || '5 min',
      dependencies: index > 0 ? [`step-${insight.id}-${index - 1}`] : undefined,
      action: step.action
    }))
  };
}

