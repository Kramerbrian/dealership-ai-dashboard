/**
 * Agent Prompt Templates
 * Personalized prompts for AI agent interactions
 */

import type { PersonalizationTokens } from './tokens';

export interface PromptTemplate {
  intent: string;
  template: string;
}

export const AGENT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    intent: 'explain_metric',
    template: 'For {{identity.brand}} in {{identity.dma}}, your {{metric}} is {{value}}. As a {{role.role}}, focus on {{top_driver}}. Fixing it is worth ~${{impact}}/mo. Confidence {{confidence}}.',
  },
  {
    intent: 'recommend_next_best_action',
    template: 'Based on {{maturity.trust_maturity}} and {{cohort.bench_percentile}}th percentile, do {{action}} this week to add ~{{lift_pts}} Trust points.',
  },
  {
    intent: 'simulate',
    template: 'If Freshness→{{targets.freshness_score}} and Reviews→{{target_review}}, Trust≈{{pred_trust}} and AI Mention≈{{pred_ai}} for {{identity.geo_tier}} markets.',
  },
  {
    intent: 'compare_peers',
    template: 'You vs peers: {{metric}} = {{ours}} vs {{peer_avg}}. Main cause: {{cause}}. Do {{action}}.',
  },
  {
    intent: 'eeat_conflict',
    template: 'Detected mismatches: {{conflicts}}. Resolve by {{remedies}}. Re-check in {{days}} days.',
  },
  {
    intent: 'auto_fix_ready',
    template: 'I can queue fixes: {{fix_list}}. Approve?',
  },
];

/**
 * Get prompt template by intent
 */
export function getPromptTemplate(intent: string): PromptTemplate | undefined {
  return AGENT_PROMPT_TEMPLATES.find(t => t.intent === intent);
}

/**
 * Personalize prompt with tokens and values
 */
export function personalizePrompt(
  template: PromptTemplate,
  tokens: PersonalizationTokens,
  values: Record<string, string | number>
): string {
  let prompt = template.template;

  // Replace token placeholders
  prompt = prompt.replace(/\{\{identity\.(\w+)\}\}/g, (_, key) => {
    return String((tokens.identity as any)[key] || '');
  });

  prompt = prompt.replace(/\{\{role\.(\w+)\}\}/g, (_, key) => {
    return String((tokens.role as any)[key] || '');
  });

  prompt = prompt.replace(/\{\{intent\.(\w+)\}\}/g, (_, key) => {
    return String((tokens.intent as any)[key] || '');
  });

  prompt = prompt.replace(/\{\{maturity\.(\w+)\}\}/g, (_, key) => {
    return String((tokens.maturity as any)[key] || '');
  });

  prompt = prompt.replace(/\{\{cohort\.(\w+)\}\}/g, (_, key) => {
    return String((tokens.cohort as any)[key] || '');
  });

  // Replace value placeholders
  for (const [key, value] of Object.entries(values)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }

  return prompt;
}

/**
 * Generate personalized agent response
 */
export function generateAgentResponse(
  intent: string,
  tokens: PersonalizationTokens,
  context: Record<string, string | number>
): string {
  const template = getPromptTemplate(intent);
  if (!template) {
    return `I can help with ${intent}. What would you like to know?`;
  }

  return personalizePrompt(template, tokens, context);
}

