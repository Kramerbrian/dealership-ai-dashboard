/**
 * Cognitive Personality System
 * Dry wit, intelligent humor, confident companion voice
 */

export type PersonalityContext = 
  | 'scan_complete'
  | 'empty_state'
  | 'error'
  | 'autonomy_toggle'
  | 'roi_summary'
  | 'tooltip'
  | 'progress'
  | 'success'
  | 'failure'
  | 'header'
  | 'competitor'
  | 'schema'
  | 'decision_feed';

export interface PersonalityMessage {
  primary: string;
  secondary?: string;
  tone: 'observational' | 'coaching' | 'deadpan' | 'encouraging';
}

/**
 * Cognitive Personality Voice Generator
 * Returns contextually appropriate copy with dry wit
 */
export function getPersonalityCopy(context: PersonalityContext, custom?: string): PersonalityMessage {
  if (custom) {
    return { primary: custom, tone: 'observational' };
  }

  const messages: Record<PersonalityContext, PersonalityMessage> = {
    scan_complete: {
      primary: 'Scan complete. Opportunities politely pretending to be issues.',
      secondary: '4 items found. Click to review.',
      tone: 'observational',
    },
    empty_state: {
      primary: 'Nothing to fix. Either perfection, or you haven\'t looked hard enough.',
      tone: 'observational',
    },
    error: {
      primary: 'Connection took a coffee break. Let\'s try that again.',
      tone: 'deadpan',
    },
    autonomy_toggle: {
      primary: 'Want to stop babysitting data? Flip this and let the grown-up handle it.',
      tone: 'coaching',
    },
    roi_summary: {
      primary: '+$12K back in your pocket. Don\'t spend it all on balloons and banners.',
      tone: 'encouraging',
    },
    tooltip: {
      primary: 'AI Visibility: how often the machines remember you exist. Ideally, often.',
      tone: 'observational',
    },
    progress: {
      primary: 'Calibrating brilliance...',
      secondary: 'Polishing pixels of truth...',
      tone: 'deadpan',
    },
    success: {
      primary: 'Fix verified. +3 Trust points. Add that to your next meeting flex.',
      tone: 'encouraging',
    },
    failure: {
      primary: 'Fix failed. It happens. Even rocket launches get do-overs.',
      tone: 'coaching',
    },
    header: {
      primary: 'Cognitive Dashboard — because guessing is so 2019.',
      tone: 'observational',
    },
    competitor: {
      primary: 'Your rival\'s ads just blinked first.',
      tone: 'observational',
    },
    schema: {
      primary: 'Structured data: because Google can\'t appreciate interpretive dance.',
      tone: 'observational',
    },
    decision_feed: {
      primary: 'Quiet today. Either everything\'s perfect or the AI is plotting a surprise party.',
      tone: 'observational',
    },
  };

  return messages[context] || { primary: 'Processing...', tone: 'deadpan' };
}

/**
 * Landing page personality copy
 */
export const landingCopy = {
  heroSubtitle: 'Every dealership needs a strategist. Ours doesn\'t eat, sleep, or call in sick.',
  ctaButton: 'Run Free Cognitive Scan — it\'s cheaper than therapy.',
  livePulse: 'The nucleus glows brighter the more the internet notices you. Kind of like fame, but useful.',
  canon: [
    'Stop designing pages. Design conversations.',
    'Stop showing data. Show decisions.',
    'Stop optimizing screens. Optimize cognition.',
    '(Also, maybe breathe. The AI\'s got this.)',
  ],
};

/**
 * Dashboard personality hooks
 */
export const dashboardCopy = {
  trustIndexTooltip: 'Think of this as your dealership\'s credit score for reality.',
  autonomySlider: 'Slide right to let automation do its thing. Slide left if you like spreadsheets at midnight.',
  progressLabels: [
    'Calibrating brilliance...',
    'Polishing pixels of truth...',
    'Assembling your bragging rights...',
  ],
};

/**
 * Tier-specific personality
 */
export function getTierPersonality(tier: 1 | 2 | 3): PersonalityMessage {
  const messages = {
    1: {
      primary: 'Your AI visibility is 62%. The algorithm\'s equivalent of a polite cough.',
      tone: 'observational' as const,
    },
    2: {
      primary: 'Add 10 schema fields. It\'s the SEO version of eating vegetables.',
      tone: 'coaching' as const,
    },
    3: {
      primary: 'Executing Auto-Fix. You go grab coffee—I\'ll handle the existential dread.',
      tone: 'deadpan' as const,
    },
  };
  return messages[tier];
}

/**
 * Personalization based on user behavior
 */
export function getPersonalizedMessage(
  behavior: 'frequent_diy' | 'automation_heavy' | 'first_time'
): PersonalityMessage {
  const messages = {
    frequent_diy: {
      primary: 'You again? Let\'s make Google blush.',
      tone: 'encouraging' as const,
    },
    automation_heavy: {
      primary: 'Task queued. As usual.',
      tone: 'deadpan' as const,
    },
    first_time: {
      primary: 'Welcome. This is how data should feel.',
      tone: 'coaching' as const,
    },
  };
  return messages[behavior];
}

