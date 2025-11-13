/**
 * dAI Agent Headline System
 * 
 * Role-aware, deterministic headline selection for DealershipAI
 */

export interface HeadlineContext {
  role?: 'gm' | 'dealer_principal' | 'dp' | 'marketing' | 'marketing_director' | 'internet' | 'general';
  domain?: string;
  location?: {
    city?: string;
    state?: string;
  };
  dateSeed?: string; // ISO date string (YYYY-MM-DD) for deterministic selection
}

export const HEADLINES = {
  dp_headlines: [
    "The system that cuts through vendor noise and shows you where your store is actually winning or losing.",
    "Real clarity for Dealer Principals: where your money is made, lost, or hidden behind dashboards.",
    "Most systems create noise. This one shows you the truth about your store's visibility and trust.",
  ],
  gm_headlines: [
    "The system built to end the meetings, kill the extra tabs, and get your dealership back to results.",
    "Your biggest problem isn't other dealers — it's meetings, dashboards, and busywork. This system removes all of it.",
    "You don't need another report. You need a system that shuts down the noise and boosts your numbers.",
  ],
  marketing_headlines: [
    "The system that finally shows you what Google, ChatGPT, and Perplexity think about your dealership.",
    "Marketing works better when you know what AI sees. This system makes that simple.",
    "Clear signals across SEO, AI, reviews, and content—so your campaigns actually hit.",
  ],
  cinematic: [
    "Before a shopper clicks, AI already decided who wins the click. DealershipAI makes sure it's you.",
    "The system that makes your store look smarter everywhere shoppers decide what to buy next.",
  ],
  hyper_short: [
    "Findable. Trusted. Visible. DealershipAI shows you what AI thinks of your store.",
    "AI already judged your store. We show you the verdict.",
  ],
  headline_variants: {
    A: "DealershipAI shows you how findable, trusted, and visible your store actually is — across Google, ChatGPT, Perplexity, and every AI system judging your dealership before a shopper ever does.",
    B: "While everyone else argues about leads, DealershipAI shows you the truth: how findable, believable, and worth-clicking your store looks across Google, ChatGPT, Perplexity, and every AI that now decides who walks in your door.",
    C: "Every shopper asks Google or ChatGPT before they ask you. DealershipAI shows you exactly how you look to them — findable or forgotten, trusted or ignored.",
    D: "DealershipAI reveals what Google, ChatGPT, and Perplexity actually think of your store — before your shoppers, your competitors, or your OEM reps do.",
  },
};

/**
 * Deterministic hash function for consistent selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Pick a deterministic item from an array based on a seed
 */
function pickDeterministic<T>(array: T[], seed: string): T {
  if (array.length === 0) {
    throw new Error('Array cannot be empty');
  }
  const hash = hashString(seed);
  const index = hash % array.length;
  return array[index];
}

/**
 * Pick a role-aware headline
 */
export function pickRoleAwareHeadline(context: HeadlineContext = {}): string {
  const { role, domain, location, dateSeed } = context;
  
  // Use today's date as default seed if not provided
  const seed = dateSeed || new Date().toISOString().slice(0, 10);
  
  // Normalize role
  const r = role?.toLowerCase().trim();
  
  // Build seed key for deterministic selection
  const seedKey = `${r || 'default'}-${domain || ''}-${seed}`;
  
  // Role-specific headlines
  if (r === 'gm') {
    return pickDeterministic(HEADLINES.gm_headlines, seedKey);
  }
  
  if (r === 'dealer_principal' || r === 'dp') {
    return pickDeterministic(HEADLINES.dp_headlines, seedKey);
  }
  
  if (r === 'marketing' || r === 'marketing_director' || r === 'internet') {
    return pickDeterministic(HEADLINES.marketing_headlines, seedKey);
  }
  
  // Default: pick from geo-aware pool
  return pickGeoHeadline(domain, location, seed);
}

/**
 * Pick a headline based on domain and location
 */
export function pickGeoHeadline(
  domain?: string,
  location?: { city?: string; state?: string },
  dateSeed?: string
): string {
  const seed = dateSeed || new Date().toISOString().slice(0, 10);
  const seedKey = `${domain || ''}-${location?.city || ''}-${seed}`;
  
  // Combine all role headlines for geo selection
  const pool = [
    ...HEADLINES.dp_headlines,
    ...HEADLINES.gm_headlines,
    ...HEADLINES.marketing_headlines,
  ];
  
  return pickDeterministic(pool, seedKey);
}

/**
 * Pick a cinematic headline
 */
export function pickCinematicHeadline(dateSeed?: string): string {
  const seed = dateSeed || new Date().toISOString().slice(0, 10);
  return pickDeterministic(HEADLINES.cinematic, seed);
}

/**
 * Pick a hyper-short headline
 */
export function pickHyperShortHeadline(dateSeed?: string): string {
  const seed = dateSeed || new Date().toISOString().slice(0, 10);
  return pickDeterministic(HEADLINES.hyper_short, seed);
}

/**
 * Pick a headline variant (A, B, C, or D)
 */
export function pickHeadlineVariant(variant: 'A' | 'B' | 'C' | 'D'): string {
  return HEADLINES.headline_variants[variant];
}

/**
 * Get all available headlines for a role (for testing/selection)
 */
export function getHeadlinesForRole(role?: string): string[] {
  const r = role?.toLowerCase().trim();
  
  if (r === 'gm') return HEADLINES.gm_headlines;
  if (r === 'dealer_principal' || r === 'dp') return HEADLINES.dp_headlines;
  if (r === 'marketing' || r === 'marketing_director' || r === 'internet') {
    return HEADLINES.marketing_headlines;
  }
  
  return [
    ...HEADLINES.dp_headlines,
    ...HEADLINES.gm_headlines,
    ...HEADLINES.marketing_headlines,
  ];
}

