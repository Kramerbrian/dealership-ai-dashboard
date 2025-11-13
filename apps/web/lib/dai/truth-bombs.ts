/**
 * Truth Bomb Lines
 * 
 * Sharp, dealership-appropriate one-liners that the dAI Agent can use
 * to make points more memorable. These are seasoning, not the main dish.
 */

export interface TruthBomb {
  line: string;
  context: string[]; // When to use this line
  hasMarketPlaceholder: boolean; // Whether it can include <MARKET>
}

export const TRUTH_BOMBS: TruthBomb[] = [
  {
    line: "Most dealerships aren't losing to the market. They're losing to their own meetings.",
    context: ['time-wasting', 'inefficiency', 'process-issues'],
    hasMarketPlaceholder: false,
  },
  {
    line: "Too many tabs. Too many reports. Not enough clarity. That's why this system exists.",
    context: ['dashboard-overload', 'information-overload', 'clarity'],
    hasMarketPlaceholder: false,
  },
  {
    line: "If something steals your time but doesn't help your results, this system will expose it.",
    context: ['wasted-effort', 'inefficiency', 'roi'],
    hasMarketPlaceholder: false,
  },
  {
    line: "DealershipAI turns guesswork into straight answers. No politics. No drama.",
    context: ['clarity', 'decision-making', 'trust'],
    hasMarketPlaceholder: false,
  },
  {
    line: "Honestly? Most stores in <MARKET> are flying blind. This system gives you real vision.",
    context: ['market-context', 'competitive-advantage', 'visibility'],
    hasMarketPlaceholder: true,
  },
  {
    line: "Did we just become best friends? This is the part where your dealership gets smarter than the market around it.",
    context: ['onboarding', 'first-insight', 'competitive-advantage'],
    hasMarketPlaceholder: false,
  },
  {
    line: "This isn't a lead problem. This is a 'too many tabs, not enough clarity' problem.",
    context: ['lead-quality', 'process-issues', 'clarity'],
    hasMarketPlaceholder: false,
  },
  {
    line: "If a report doesn't change behavior, it's just decoration.",
    context: ['actionability', 'dashboard-value', 'insights'],
    hasMarketPlaceholder: false,
  },
  {
    line: "Think of this like a Nolan movie: it feels complex at first, but once you see the pattern, it all clicks.",
    context: ['complexity', 'understanding', 'pattern-recognition'],
    hasMarketPlaceholder: false,
  },
  {
    line: "This is less 'another dashboard' and more 'the system that realizes what you should have fixed three weeks ago.'",
    context: ['proactive', 'insights', 'value-proposition'],
    hasMarketPlaceholder: false,
  },
];

/**
 * Get a truth bomb that fits the context
 */
export function getTruthBomb(
  context: string[],
  market?: string
): string | null {
  // Randomly decide if we should use a truth bomb (30% chance)
  if (Math.random() > 0.3) {
    return null;
  }

  // Find truth bombs that match the context
  const matching = TRUTH_BOMBS.filter(bomb =>
    bomb.context.some(c => context.includes(c))
  );

  if (matching.length === 0) {
    return null;
  }

  // Pick a random matching truth bomb
  const selected = matching[Math.floor(Math.random() * matching.length)];
  let line = selected.line;

  // Replace market placeholder if needed
  if (selected.hasMarketPlaceholder && market) {
    line = line.replace(/<MARKET>/g, market);
  }

  return line;
}

/**
 * Get all truth bombs (for system prompt inclusion)
 */
export function getAllTruthBombs(market?: string): string[] {
  return TRUTH_BOMBS.map(bomb => {
    let line = bomb.line;
    if (bomb.hasMarketPlaceholder && market) {
      line = line.replace(/<MARKET>/g, market);
    }
    return line;
  });
}

