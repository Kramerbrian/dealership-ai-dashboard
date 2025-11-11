/**
 * Pulse Scenario Modeling - What-if scenario analysis with Monte Carlo simulation
 * Implements scenario modeling from DealershipAI Algorithm Engine v2.0
 */

import { calculatePulseScore, type PulseScoreInput, type PulseScoreOutput } from '@/lib/ai/formulas';

export interface ScenarioAction {
  type: 'improve_aiv' | 'improve_ati' | 'improve_zero_click' | 'improve_ugc' | 'improve_geo';
  magnitude: number; // Expected improvement in percentage points
  confidence: number; // Confidence in achieving this improvement (0-1)
  timeframe: number; // Days to achieve
  cost?: number; // Optional cost estimate
}

export interface ScenarioInput {
  dealerId: string;
  currentSignals: {
    aiv: number;
    ati: number;
    zero_click: number;
    ugc_health: number;
    geo_trust: number;
  };
  actions: ScenarioAction[];
  simulations?: number; // Number of Monte Carlo simulations (default: 1000)
}

export interface ScenarioResult {
  scenarioId: string;
  expectedScore: number;
  currentScore: number;
  improvement: number;
  confidence: number;
  expectedSignals: {
    aiv: number;
    ati: number;
    zero_click: number;
    ugc_health: number;
    geo_trust: number;
  };
  distribution: {
    min: number;
    p25: number;
    median: number;
    p75: number;
    max: number;
  };
  roi?: {
    totalCost: number;
    expectedValue: number;
    roiPercent: number;
  };
  recommendations: string[];
  timestamp: Date;
}

/**
 * Run Monte Carlo simulation for scenario
 * E[score] = ∫ P(score|actions) * V(score) d(score)
 */
export async function runScenario(input: ScenarioInput): Promise<ScenarioResult> {
  const simulations = input.simulations ?? 1000;
  const simulationResults: number[] = [];

  // Calculate current score
  const currentScoreResult = calculatePulseScore({
    signals: input.currentSignals,
    timeDelta: 0,
    penalties: {},
  });

  // Calculate expected signal improvements
  const expectedSignals = { ...input.currentSignals };
  let totalCost = 0;

  for (const action of input.actions) {
    // Apply expected improvement with confidence factoring
    const improvement = action.magnitude * action.confidence;

    switch (action.type) {
      case 'improve_aiv':
        expectedSignals.aiv = Math.min(100, expectedSignals.aiv + improvement);
        break;
      case 'improve_ati':
        expectedSignals.ati = Math.min(100, expectedSignals.ati + improvement);
        break;
      case 'improve_zero_click':
        expectedSignals.zero_click = Math.min(100, expectedSignals.zero_click + improvement);
        break;
      case 'improve_ugc':
        expectedSignals.ugc_health = Math.min(100, expectedSignals.ugc_health + improvement);
        break;
      case 'improve_geo':
        expectedSignals.geo_trust = Math.min(100, expectedSignals.geo_trust + improvement);
        break;
    }

    if (action.cost) {
      totalCost += action.cost;
    }
  }

  // Run Monte Carlo simulations
  for (let i = 0; i < simulations; i++) {
    const simulatedSignals = { ...input.currentSignals };

    // Apply each action with stochastic variation
    for (const action of input.actions) {
      // Generate random variation using normal distribution approximation
      const randomFactor = normalRandom(action.confidence, 0.15);
      const actualImprovement = action.magnitude * Math.max(0, Math.min(1, randomFactor));

      switch (action.type) {
        case 'improve_aiv':
          simulatedSignals.aiv = Math.min(100, simulatedSignals.aiv + actualImprovement);
          break;
        case 'improve_ati':
          simulatedSignals.ati = Math.min(100, simulatedSignals.ati + actualImprovement);
          break;
        case 'improve_zero_click':
          simulatedSignals.zero_click = Math.min(100, simulatedSignals.zero_click + actualImprovement);
          break;
        case 'improve_ugc':
          simulatedSignals.ugc_health = Math.min(100, simulatedSignals.ugc_health + actualImprovement);
          break;
        case 'improve_geo':
          simulatedSignals.geo_trust = Math.min(100, simulatedSignals.geo_trust + actualImprovement);
          break;
      }
    }

    // Calculate pulse score for this simulation
    const simResult = calculatePulseScore({
      signals: simulatedSignals,
      timeDelta: 0,
      penalties: {},
    });

    simulationResults.push(simResult.pulse_score);
  }

  // Sort results for percentile calculations
  simulationResults.sort((a, b) => a - b);

  // Calculate distribution statistics
  const distribution = {
    min: simulationResults[0],
    p25: simulationResults[Math.floor(simulations * 0.25)],
    median: simulationResults[Math.floor(simulations * 0.50)],
    p75: simulationResults[Math.floor(simulations * 0.75)],
    max: simulationResults[simulations - 1],
  };

  // Expected score is the median of simulations
  const expectedScore = distribution.median;
  const improvement = expectedScore - currentScoreResult.pulse_score;

  // Calculate overall confidence as weighted average
  const avgConfidence =
    input.actions.reduce((sum, action) => sum + action.confidence, 0) / input.actions.length;

  // Generate recommendations
  const recommendations: string[] = [];
  if (improvement > 15) {
    recommendations.push('High impact scenario - strongly recommended');
  } else if (improvement > 5) {
    recommendations.push('Moderate impact scenario - consider implementation');
  } else {
    recommendations.push('Low impact scenario - explore alternatives');
  }

  if (avgConfidence < 0.6) {
    recommendations.push('Warning: Low confidence in achieving expected results');
  }

  // Calculate ROI if costs provided
  let roi: ScenarioResult['roi'] | undefined;
  if (totalCost > 0) {
    // Rough estimate: 1 pulse point = $1000 in annual value
    const expectedValue = improvement * 1000;
    roi = {
      totalCost,
      expectedValue,
      roiPercent: ((expectedValue - totalCost) / totalCost) * 100,
    };
  }

  return {
    scenarioId: generateScenarioId(input.dealerId),
    expectedScore,
    currentScore: currentScoreResult.pulse_score,
    improvement,
    confidence: avgConfidence,
    expectedSignals,
    distribution,
    roi,
    recommendations,
    timestamp: new Date(),
  };
}

/**
 * Generate normal random number using Box-Muller transform
 */
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generate unique scenario ID
 */
function generateScenarioId(dealerId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return "scenario_" + dealerId + "_" + timestamp + "_" + random;
}

// Export types
export type { ScenarioAction, ScenarioInput };
