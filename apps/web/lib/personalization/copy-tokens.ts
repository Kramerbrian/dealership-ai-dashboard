/**
 * Personalization Copy Tokens
 * Dynamic copy based on user context
 */

import type { PersonalizationTokens } from './tokens';

export interface CopyTokens {
  cta_primary: string;
  nudge_widget: string;
}

/**
 * Get personalized copy based on tokens
 */
export function getCopyTokens(tokens: PersonalizationTokens): CopyTokens {
  // CTA Primary
  let cta_primary = 'See Full Report';
  if (tokens.role.role === 'gm') {
    cta_primary = 'View Executive Summary';
  } else if (tokens.role.role === 'marketing') {
    cta_primary = 'Open Full Visibility Report';
  } else if (tokens.role.role === 'service') {
    cta_primary = 'Open Experience & Reviews Report';
  }

  // Nudge Widget
  let nudge_widget = '';
  const maturity = tokens.maturity.trust_maturity;
  
  if (maturity === 'seed') {
    nudge_widget = 'Quick wins first: fix identity mismatches and freshen 3 core pages.';
  } else if (maturity === 'grow') {
    nudge_widget = `You're close. Improving Freshness to 90 unlocks +12% visibility.`;
  } else if (maturity === 'scale') {
    nudge_widget = 'Defend position. Schedule quarterly schema refresh for sustained AI mentions.';
  }

  return {
    cta_primary,
    nudge_widget,
  };
}

/**
 * Format nudge widget with dynamic values
 */
export function formatNudgeWidget(
  template: string,
  values: Record<string, string | number>
): string {
  let formatted = template;
  for (const [key, value] of Object.entries(values)) {
    formatted = formatted.replace(`{{${key}}}`, String(value));
  }
  return formatted;
}

