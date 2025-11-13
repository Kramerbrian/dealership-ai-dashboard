/**
 * A/B Test Variants for AI Intro Card
 * Canonized PLG conversion optimization
 */

export type AIIntroVariant = 'A' | 'B' | 'C';

export interface AIIntroVariantConfig {
  id: AIIntroVariant;
  name: string;
  copy: {
    title: string;
    currentLabel: string;
    bridgeText: string;
    improvedLabel: string;
    cta: string;
    subtext: string;
  };
}

export const AI_INTRO_VARIANTS: Record<AIIntroVariant, AIIntroVariantConfig> = {
  A: {
    id: 'A',
    name: 'Baseline',
    copy: {
      title: 'How AI would introduce your dealership today',
      currentLabel: 'How AI would introduce your dealership today',
      bridgeText: 'Or, DealershipAI can help you make it sound more like this:',
      improvedLabel: '',
      cta: 'Want to make the better version real? → Unlock dashboard',
      subtext: 'No credit card. Just a clearer story in AI search.',
    },
  },
  B: {
    id: 'B',
    name: 'Pain-first emphasis',
    copy: {
      title: 'How AI sees you today',
      currentLabel: 'Right now AI sees you like this…',
      bridgeText: 'You\'re missing out on shoppers who never even see your name.',
      improvedLabel: 'See the better version and the steps to get there',
      cta: 'See the better version and the steps to get there → Unlock dashboard',
      subtext: 'No credit card. Just a clearer story in AI search.',
    },
  },
  C: {
    id: 'C',
    name: 'Gain-first emphasis',
    copy: {
      title: 'How AI could describe you',
      currentLabel: 'This is close to how AI could describe you…',
      bridgeText: 'But today, it actually sounds more like this:',
      improvedLabel: '',
      cta: 'Let\'s fix that → Unlock dashboard',
      subtext: 'No credit card. Just a clearer story in AI search.',
    },
  },
};

/**
 * Get variant for user (cookie-based or random)
 */
export function getAIIntroVariant(): AIIntroVariant {
  if (typeof window === 'undefined') return 'A';

  // Check cookie
  const cookies = document.cookie.split(';');
  const variantCookie = cookies.find((c) => c.trim().startsWith('ai_intro_variant='));
  if (variantCookie) {
    const variant = variantCookie.split('=')[1] as AIIntroVariant;
    if (variant in AI_INTRO_VARIANTS) {
      return variant;
    }
  }

  // Check query param
  const params = new URLSearchParams(window.location.search);
  const variantParam = params.get('variant') as AIIntroVariant;
  if (variantParam && variantParam in AI_INTRO_VARIANTS) {
    // Set cookie for future visits
    document.cookie = `ai_intro_variant=${variantParam}; path=/; max-age=31536000`;
    return variantParam;
  }

  // Default: random assignment
  const variants: AIIntroVariant[] = ['A', 'B', 'C'];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  document.cookie = `ai_intro_variant=${randomVariant}; path=/; max-age=31536000`;
  return randomVariant;
}

/**
 * Track AI Intro Card events
 */
export function trackAIIntroEvent(event: 'view' | 'click_unlock', variant: AIIntroVariant, domain: string) {
  if (typeof window === 'undefined') return;

  const eventName = event === 'view' ? 'view_ai_intro_card' : 'click_unlock_dashboard';
  
  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, {
      variant,
      domain,
    });
  }

  // Vercel Analytics
  if ((window as any).va) {
    (window as any).va('track', eventName, { variant, domain });
  }

  // Console for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, { variant, domain });
  }
}

