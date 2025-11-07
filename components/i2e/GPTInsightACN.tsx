"use client";

/**
 * GPT Insight ACN
 * 
 * Actionable Contextual Nugget that appears when GPT detects high-value opportunities
 */

import React from 'react';
import { ActionableContextualNugget } from '../i2e/types';
import { ActionableContextualNugget as ACNComponent } from '../i2e/ActionableContextualNugget';

interface GPTInsight {
  id: string;
  insight: string;
  confidence: number;
  suggestedAction: string;
  actionFunction: string;
  actionParameters: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface GPTInsightACNProps {
  insight: GPTInsight;
  onAction?: (insight: GPTInsight) => void;
  onDismiss?: (id: string) => void;
}

export function GPTInsightACN({ insight, onAction, onDismiss }: GPTInsightACNProps) {
  const acn: ActionableContextualNugget = {
    id: `gpt-insight-${insight.id}`,
    insight: insight.insight,
    ctaText: insight.suggestedAction,
    ctaAction: async () => {
      // Execute the suggested GPT function
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dash.dealershipai.com';
        const routeMap: Record<string, string> = {
          appraiseVehicle: '/api/gpt/functions/appraise-vehicle',
          scheduleTestDrive: '/api/gpt/functions/schedule-test-drive',
          fetchInventory: '/api/gpt/functions/fetch-inventory',
          submitLead: '/api/gpt/functions/submit-lead'
        };

        const route = routeMap[insight.actionFunction];
        if (route) {
          const response = await fetch(`${baseUrl}${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insight.actionParameters)
          });

          const result = await response.json();
          onAction?.(insight);
        }
      } catch (error) {
        console.error('Failed to execute GPT action:', error);
      }
    },
    severity: insight.severity,
    position: { x: 75, y: 20, anchor: 'top-right' },
    autoDismiss: insight.severity === 'low',
    dismissAfter: insight.severity === 'low' ? 15000 : undefined
  };

  return (
    <ACNComponent
      nugget={acn}
      onDismiss={onDismiss}
      onAction={() => onAction?.(insight)}
    />
  );
}

/**
 * Example: Detect high-value opportunities from GPT conversations
 */
export function detectGPTInsights(
  conversationHistory: Array<{ role: string; content: string }>
): GPTInsight[] {
  const insights: GPTInsight[] = [];

  // Analyze conversation for opportunities
  const lastMessage = conversationHistory[conversationHistory.length - 1];
  if (!lastMessage) return insights;

  const content = lastMessage.content.toLowerCase();

  // Detect trade-in opportunity
  if (content.includes('trade') || content.includes('appraise')) {
    insights.push({
      id: 'trade-in-opportunity',
      insight: 'Trade-In Opportunity',
      confidence: 0.85,
      suggestedAction: 'Get Instant Appraisal',
      actionFunction: 'appraiseVehicle',
      actionParameters: {
        // Would extract from conversation
        year: 2020,
        make: 'Toyota',
        model: 'Camry'
      },
      severity: 'high'
    });
  }

  // Detect test drive interest
  if (content.includes('test drive') || content.includes('see') || content.includes('view')) {
    insights.push({
      id: 'test-drive-interest',
      insight: 'Test Drive Interest',
      confidence: 0.75,
      suggestedAction: 'Schedule Test Drive',
      actionFunction: 'scheduleTestDrive',
      actionParameters: {
        vehicleId: 'v1' // Would extract from conversation
      },
      severity: 'medium'
    });
  }

  return insights;
}

