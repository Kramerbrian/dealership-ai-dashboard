/**
 * Quick-Win Missions - Day-One Launch
 *
 * These are the first 2 missions that every user sees on signup.
 * They are designed to:
 * 1. Show immediate value (< 5 minutes)
 * 2. Require zero manual input
 * 3. Generate actionable insights
 * 4. Build trust in the platform
 */

export interface QuickWinMission {
  id: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  category: 'quick-win';
  estimatedTime: string;
  impact: 'high';
  whatItDoes: string[];
  whatYouGet: string[];
  autoLaunchOnSignup?: boolean;
}

/**
 * Mission 1: Schema Health Check
 *
 * Scans the dealership's website for schema.org markup and identifies
 * quick fixes that can boost AI visibility.
 *
 * Why this first?
 * - Fast (< 2 min)
 * - Clear, actionable results
 * - High impact on AI search presence
 * - No user input required
 */
export const schemaHealthCheck: QuickWinMission = {
  id: 'quick-win-schema-health',
  title: 'Schema Health Check',
  description: 'Scan your website for AI-readable structured data and identify quick wins',
  agentId: 'schema-king',
  agentName: 'Schema King',
  category: 'quick-win',
  estimatedTime: '2 min',
  impact: 'high',
  autoLaunchOnSignup: true,

  whatItDoes: [
    'Crawls your homepage and key pages',
    'Detects existing schema.org markup',
    'Identifies missing or broken schemas',
    'Compares against automotive best practices',
    'Generates priority fix list',
  ],

  whatYouGet: [
    'Schema coverage score (0-100)',
    'List of 3-5 quick fixes',
    'Copy-paste code snippets',
    'Before/after AI visibility impact',
    'Estimated time to implement each fix',
  ],
};

/**
 * Mission 2: AI Visibility Snapshot
 *
 * Tests how the dealership appears across ChatGPT, Claude, Perplexity,
 * and Google Gemini for common automotive queries.
 *
 * Why this second?
 * - Eye-opening results ("We don't show up?!")
 * - Competitive context (see who DOES show up)
 * - Creates urgency for other missions
 * - Demonstrates platform intelligence
 */
export const aiVisibilitySnapshot: QuickWinMission = {
  id: 'quick-win-ai-visibility',
  title: 'AI Visibility Snapshot',
  description: 'Test how you appear in ChatGPT, Claude, Perplexity, and Gemini',
  agentId: 'ai-visibility-test',
  agentName: 'AI Visibility Test',
  category: 'quick-win',
  estimatedTime: '3 min',
  impact: 'high',
  autoLaunchOnSignup: true,

  whatItDoes: [
    'Runs 5 common automotive queries across 4 AI platforms',
    'Examples: "Best Toyota dealer near [city]", "Where to service my Honda in [city]"',
    'Checks if your dealership is mentioned',
    'Identifies which competitors appear instead',
    'Analyzes WHY they appear (reviews, schema, content, etc.)',
  ],

  whatYouGet: [
    'Visibility score by platform (ChatGPT, Claude, Perplexity, Gemini)',
    'List of queries where you appear vs. don\'t appear',
    'Competitor analysis (who shows up and why)',
    'Top 3 actions to improve visibility',
    'Estimated revenue at risk if not visible',
  ],
};

/**
 * All Quick-Win Missions
 */
export const quickWinMissions: QuickWinMission[] = [
  schemaHealthCheck,
  aiVisibilitySnapshot,
];

/**
 * Generate mission instance from template
 */
export function createMissionFromTemplate(
  template: QuickWinMission,
  overrides?: Partial<{
    status: 'available' | 'active' | 'queued' | 'completed' | 'failed';
    confidence: number;
    progress: number;
    startedAt: number;
    completedAt: number;
    evidence: {
      count: number;
      lastUpdated: number;
    };
  }>
) {
  return {
    ...template,
    status: 'available' as const,
    ...overrides,
  };
}

/**
 * Auto-launch configuration for new users
 */
export function getAutoLaunchMissions(): QuickWinMission[] {
  return quickWinMissions.filter((mission) => mission.autoLaunchOnSignup);
}
