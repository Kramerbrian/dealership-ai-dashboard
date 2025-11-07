/**
 * Pulse System Integration
 * 
 * Converts Pulse API data into I2E component formats
 */

import { PulseSnapshot } from './api-client';
import { UpdateCard, OneClickCorrection, ActionableContextualNugget, ExecutionPlaybook, InsightSeverity } from './types';

/**
 * Convert Pulse snapshot to Update Cards
 */
export function pulsesToUpdateCards(snapshot: PulseSnapshot): UpdateCard[] {
  return snapshot.pulses_closed.map((pulse) => ({
    id: `pulse-${pulse.id}`,
    title: `Pulse Resolved: ${formatPulseId(pulse.id)}`,
    summary: `Fixed ${formatPulseId(pulse.id)} in ${pulse.timeToResolveMin} minutes. Revenue impact: $${pulse.deltaUSD.toLocaleString()}`,
    date: new Date(snapshot.date),
    type: 'improvement',
    ctaText: 'View Details',
    metadata: {
      impact: `+$${pulse.deltaUSD.toLocaleString()}`,
      category: 'Pulse Resolution',
      tags: ['pulse', 'fix', 'revenue']
    }
  }));
}

/**
 * Convert Pulse snapshot to One-Click Corrections
 * Shows pulses that can be quickly fixed
 */
export function pulsesToCorrections(snapshot: PulseSnapshot): OneClickCorrection[] {
  return snapshot.pulses_closed
    .filter(pulse => pulse.timeToResolveMin < 30) // Only quick fixes
    .map((pulse) => ({
      id: `correction-${pulse.id}`,
      issue: formatPulseId(pulse.id),
      fix: `Auto-fix available. Expected revenue impact: $${pulse.deltaUSD.toLocaleString()}`,
      severity: pulse.deltaUSD > 5000 ? 'high' : pulse.deltaUSD > 2000 ? 'medium' : 'low',
      category: 'pulse-fix',
      estimatedTime: `${pulse.timeToResolveMin} min`,
      action: async () => {
        // This would call the fix API
        const { applyFix } = await import('./api-client');
        await applyFix({
          pulseId: pulse.id,
          tier: 'apply'
        });
      }
    }));
}

/**
 * Convert Pulse snapshot to Actionable Contextual Nuggets
 * Shows high-impact pulses that need attention
 */
export function pulsesToACNs(snapshot: PulseSnapshot): ActionableContextualNugget[] {
  return snapshot.pulses_closed
    .filter(pulse => pulse.deltaUSD > 5000) // High impact only
    .map((pulse, index) => ({
      id: `acn-${pulse.id}`,
      insight: `${formatPulseId(pulse.id)} Detected`,
      ctaText: 'Launch Fix Protocol',
      ctaAction: async () => {
        // Generate and open playbook
        const playbook = pulseToPlaybook(pulse, snapshot);
        // This would be handled by the parent component
        return playbook;
      },
      severity: pulse.deltaUSD > 10000 ? 'critical' : 'high',
      position: {
        x: 75,
        y: 20 + (index * 25),
        anchor: 'top-right'
      },
      dataPointId: pulse.id,
      autoDismiss: false
    }));
}

/**
 * Convert a single pulse to an Execution Playbook
 */
export function pulseToPlaybook(
  pulse: PulseSnapshot['pulses_closed'][0],
  snapshot: PulseSnapshot
): ExecutionPlaybook {
  return {
    id: `playbook-${pulse.id}`,
    title: `Fix Protocol: ${formatPulseId(pulse.id)}`,
    description: `Automated sequence to resolve ${formatPulseId(pulse.id)}. Expected impact: $${pulse.deltaUSD.toLocaleString()}`,
    insightId: pulse.id,
    autoExecuteFirst: 2,
    createdAt: new Date(snapshot.date),
    steps: [
      {
        id: `step-${pulse.id}-1`,
        title: 'Analyze Pulse',
        description: `Analyzing ${formatPulseId(pulse.id)} and generating fix plan`,
        status: 'pending',
        autoExecute: true,
        estimatedTime: '1 min',
        action: async () => {
          const { postRecommendation } = await import('./api-client');
          await postRecommendation({
            pulseId: pulse.id,
            plan: `Auto-generated fix plan for ${formatPulseId(pulse.id)}`,
            expectedImpactUSD: pulse.deltaUSD
          });
        }
      },
      {
        id: `step-${pulse.id}-2`,
        title: 'Apply Fix',
        description: `Executing fix for ${formatPulseId(pulse.id)}`,
        status: 'pending',
        autoExecute: true,
        estimatedTime: `${pulse.timeToResolveMin} min`,
        dependencies: [`step-${pulse.id}-1`],
        action: async () => {
          const { applyFix } = await import('./api-client');
          await applyFix({
            pulseId: pulse.id,
            tier: 'apply'
          });
        }
      },
      {
        id: `step-${pulse.id}-3`,
        title: 'Verify Results',
        description: `Verifying fix results and logging impact`,
        status: 'pending',
        estimatedTime: '2 min',
        dependencies: [`step-${pulse.id}-2`],
        action: async () => {
          const { postReceipt } = await import('./api-client');
          await postReceipt({
            pulseId: pulse.id,
            deltaUSD: pulse.deltaUSD,
            success: true,
            notes: `Auto-resolved ${formatPulseId(pulse.id)} in ${pulse.timeToResolveMin} minutes`
          });
        }
      }
    ]
  };
}

/**
 * Format pulse ID for display
 */
function formatPulseId(pulseId: string): string {
  return pulseId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get score improvements as Update Cards
 */
export function scoresToUpdateCards(snapshot: PulseSnapshot): UpdateCard[] {
  const scoreCards: UpdateCard[] = [];
  
  if (snapshot.scores.AIV) {
    scoreCards.push({
      id: `score-aiv-${snapshot.date}`,
      title: `AIV Score Improved`,
      summary: `Algorithmic Intelligence Visibility increased by ${snapshot.scores.AIV} points`,
      date: new Date(snapshot.date),
      type: 'improvement',
      metadata: {
        impact: `+${snapshot.scores.AIV} pts`,
        category: 'AIV Score',
        tags: ['score', 'improvement', 'aiv']
      }
    });
  }

  if (snapshot.scores.ATI) {
    scoreCards.push({
      id: `score-ati-${snapshot.date}`,
      title: `ATI Score Improved`,
      summary: `Algorithmic Trust Index increased by ${snapshot.scores.ATI} points`,
      date: new Date(snapshot.date),
      type: 'improvement',
      metadata: {
        impact: `+${snapshot.scores.ATI} pts`,
        category: 'ATI Score',
        tags: ['score', 'improvement', 'ati']
      }
    });
  }

  if (snapshot.scores.CVI) {
    scoreCards.push({
      id: `score-cvi-${snapshot.date}`,
      title: `CVI Score Improved`,
      summary: `Customer Visibility Index increased by ${snapshot.scores.CVI} points`,
      date: new Date(snapshot.date),
      type: 'improvement',
      metadata: {
        impact: `+${snapshot.scores.CVI} pts`,
        category: 'CVI Score',
        tags: ['score', 'improvement', 'cvi']
      }
    });
  }

  return scoreCards;
}

