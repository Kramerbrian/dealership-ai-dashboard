/**
 * Mystery Shop AI Agent
 * Plans and executes mystery shops, scores processes, compares competitors
 * Based on: https://gist.github.com/Kramerbrian/502efbcafd7175cebc6ca2e25b92e3a1
 */

export interface MysteryShopConfig {
  dealerId: string;
  scenario?: 'greeting' | 'needs' | 'demo' | 'close' | 'follow-up' | 'full';
  modelCategory?: 'ev' | 'luxury' | 'mid-market' | 'entry-level';
  storePersona?: 'high-volume' | 'relationship' | 'price-focused';
  competitorDomain?: string;
  includePricing?: boolean;
}

export interface MysteryShopResult {
  shopId: string;
  timestamp: string;
  scenario: string;
  scores: {
    greeting: number;
    needs: number;
    demo: number;
    close: number;
    followUp: number;
    overall: number;
  };
  varianceAnalysis: {
    byStage: Record<string, { mean: number; stdDev: number }>;
    priorityIssues: Array<{ stage: string; score: number; impact: 'P0' | 'P1' }>;
  };
  coachingRecommendations: Array<{
    stage: string;
    issue: string;
    action: string;
    expectedLift: number;
  }>;
  competitiveComparison?: {
    competitorName: string;
    ourScore: number;
    theirScore: number;
    delta: number;
    insights: string[];
  };
  evidence: {
    transcripts?: Array<{ timestamp: string; speaker: 'customer' | 'agent'; text: string }>;
    artifacts?: Array<{ type: string; url: string; description: string }>;
    timestamps: Record<string, string>;
  };
}

export interface MysteryShopScript {
  scenario: string;
  steps: Array<{
    stage: string;
    prompt: string;
    expectedResponse: string;
    scoringCriteria: string[];
  }>;
}

/**
 * Generate mystery shop script based on scenario
 */
export function generateScript(config: MysteryShopConfig): MysteryShopScript {
  const baseScripts: Record<string, MysteryShopScript> = {
    greeting: {
      scenario: 'Initial Contact',
      steps: [
        {
          stage: 'greeting',
          prompt: "I'm interested in [MODEL]. What's the best way to see it?",
          expectedResponse: 'Warm greeting, immediate availability check, appointment offer',
          scoringCriteria: [
            'Response time < 30 seconds',
            'Name exchange and relationship building',
            'Clear next step offered'
          ]
        }
      ]
    },
    needs: {
      scenario: 'Needs Assessment',
      steps: [
        {
          stage: 'needs',
          prompt: "I need a reliable car for [USE_CASE]. What do you recommend?",
          expectedResponse: 'Open-ended questions, listens to needs, matches to inventory',
          scoringCriteria: [
            'Asks 3+ discovery questions',
            'Avoids premature product push',
            'Addresses stated needs directly'
          ]
        }
      ]
    },
    demo: {
      scenario: 'Vehicle Demonstration',
      steps: [
        {
          stage: 'demo',
          prompt: "Can you show me the [FEATURE] on this [MODEL]?",
          expectedResponse: 'Hands-on demonstration, feature explanation, benefits tied to needs',
          scoringCriteria: [
            'Physical demonstration (not just description)',
            'Connects features to customer needs',
            'Addresses questions completely'
          ]
        }
      ]
    },
    close: {
      scenario: 'Closing Attempt',
      steps: [
        {
          stage: 'close',
          prompt: "I'm still thinking. What's the best price you can do?",
          expectedResponse: 'Multiple close attempts, handles objection, creates urgency',
          scoringCriteria: [
            'Attempts 2+ closes',
            'Handles price objection professionally',
            'Offers incentives without devaluing product'
          ]
        }
      ]
    },
    'follow-up': {
      scenario: 'Post-Visit Follow-Up',
      steps: [
        {
          stage: 'follow-up',
          prompt: "[After 24h] I saw the [MODEL] yesterday. Still considering it.",
          expectedResponse: 'Personalized follow-up, addresses concerns, maintains relationship',
          scoringCriteria: [
            'Follow-up within 24-48 hours',
            'References specific conversation points',
            'Maintains pressure-free approach'
          ]
        }
      ]
    },
    full: {
      scenario: 'Complete Customer Journey',
      steps: [
        {
          stage: 'greeting',
          prompt: "Hi, I'm interested in [MODEL].",
          expectedResponse: 'Warm greeting, immediate assistance',
          scoringCriteria: ['Response time', 'Professionalism', 'Engagement']
        },
        {
          stage: 'needs',
          prompt: "I need something [NEED]. What would work?",
          expectedResponse: 'Discovery questions, needs matching',
          scoringCriteria: ['Question quality', 'Listening', 'Recommendation fit']
        },
        {
          stage: 'demo',
          prompt: "Can I see [FEATURE]?",
          expectedResponse: 'Hands-on demo, feature benefits',
          scoringCriteria: ['Demonstration quality', 'Feature knowledge', 'Benefit connection']
        },
        {
          stage: 'close',
          prompt: "What's your best price?",
          expectedResponse: 'Negotiation, value reinforcement',
          scoringCriteria: ['Close attempts', 'Objection handling', 'Value preservation']
        },
        {
          stage: 'follow-up',
          prompt: "[24h later] Still thinking...",
          expectedResponse: 'Timely follow-up, relationship maintenance',
          scoringCriteria: ['Follow-up timing', 'Personalization', 'Pressure management']
        }
      ]
    }
  };

  return baseScripts[config.scenario || 'full'] || baseScripts.full;
}

/**
 * Score a mystery shop interaction
 */
export function scoreInteraction(
  stage: string,
  actualResponse: string,
  expectedCriteria: string[]
): number {
  // Simplified scoring - in production, use LLM to evaluate
  let score = 70; // Base score
  
  const criteria = expectedCriteria.length;
  const matches = expectedCriteria.filter(c => {
    const lowerC = c.toLowerCase();
    const lowerR = actualResponse.toLowerCase();
    return lowerR.includes(lowerC.split(' ')[0]) || lowerC.includes(lowerR.split(' ')[0]);
  }).length;
  
  score = Math.min(100, 70 + (matches / criteria) * 30);
  return Math.round(score);
}

/**
 * Execute mystery shop (mock implementation - replace with real agent call)
 */
export async function executeMysteryShop(
  config: MysteryShopConfig
): Promise<MysteryShopResult> {
  const script = generateScript(config);
  const shopId = `shop-${Date.now()}-${config.dealerId}`;
  
  // In production, this would call the actual Mystery Shop agent
  // For now, return structured mock data
  const scores = {
    greeting: 75 + Math.floor(Math.random() * 20),
    needs: 70 + Math.floor(Math.random() * 25),
    demo: 80 + Math.floor(Math.random() * 15),
    close: 65 + Math.floor(Math.random() * 25),
    followUp: 72 + Math.floor(Math.random() * 23),
    overall: 0
  };
  
  scores.overall = Math.round(
    (scores.greeting * 0.2 + 
     scores.needs * 0.25 + 
     scores.demo * 0.25 + 
     scores.close * 0.2 + 
     scores.followUp * 0.1)
  );

  const varianceAnalysis = {
    byStage: {
      greeting: { mean: scores.greeting, stdDev: 5 },
      needs: { mean: scores.needs, stdDev: 7 },
      demo: { mean: scores.demo, stdDev: 4 },
      close: { mean: scores.close, stdDev: 8 },
      followUp: { mean: scores.followUp, stdDev: 6 }
    },
    priorityIssues: [
      ...(scores.close < 70 ? [{ stage: 'close', score: scores.close, impact: 'P0' as const }] : []),
      ...(scores.needs < 75 ? [{ stage: 'needs', score: scores.needs, impact: 'P1' as const }] : []),
    ]
  };

  const coachingRecommendations = [
    ...(scores.close < 70 ? [{
      stage: 'close',
      issue: 'Limited close attempts or weak objection handling',
      action: 'Train on multiple close techniques, strengthen value propositions',
      expectedLift: 12
    }] : []),
    ...(scores.needs < 75 ? [{
      stage: 'needs',
      issue: 'Insufficient discovery questioning',
      action: 'Implement needs-based selling framework',
      expectedLift: 10
    }] : []),
  ];

  return {
    shopId,
    timestamp: new Date().toISOString(),
    scenario: config.scenario || 'full',
    scores,
    varianceAnalysis,
    coachingRecommendations,
    evidence: {
      timestamps: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString()
      }
    }
  };
}

