/**
 * Consensus Filter for Auto-Fix Engine
 * Only auto-fixes issues that have unanimous consensus (3/3 engines)
 */

import { consensus, type IssueHit, type ConsensusResult } from '@/lib/scoring';

export interface AutoFixCandidate {
  issueId: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  engines: string[];
  consensus: ConsensusResult;
  requiresApproval: boolean;
}

/**
 * Filter issues for auto-fix based on consensus
 * Only returns issues with unanimous consensus (3/3 engines)
 * Majority (2/3) issues are queued for review
 * Weak (1/3) issues are logged only
 */
export function filterIssuesForAutoFix(issueHits: IssueHit[]): {
  autoFix: AutoFixCandidate[];
  reviewQueue: AutoFixCandidate[];
  logged: AutoFixCandidate[];
} {
  const consensusResults = consensus(issueHits);

  const autoFix: AutoFixCandidate[] = [];
  const reviewQueue: AutoFixCandidate[] = [];
  const logged: AutoFixCandidate[] = [];

  for (const result of consensusResults) {
    const candidate: AutoFixCandidate = {
      issueId: result.id,
      issueType: 'unknown', // TODO: Map issue ID to type
      severity: result.unanimous ? 'high' : result.majority ? 'medium' : 'low',
      engines: result.engines,
      consensus: result,
      requiresApproval: !result.unanimous, // Only unanimous issues can auto-fix without approval
    };

    if (result.unanimous) {
      // Auto-fix allowed for unanimous issues
      autoFix.push(candidate);
    } else if (result.majority) {
      // Queue for human review
      reviewQueue.push(candidate);
    } else {
      // Log only (weak consensus)
      logged.push(candidate);
    }
  }

  return { autoFix, reviewQueue, logged };
}

/**
 * Check if an issue can be auto-fixed
 * Returns true only for unanimous consensus issues
 */
export function canAutoFix(issueHits: IssueHit[], issueId: string): boolean {
  const consensusResults = consensus(issueHits);
  const result = consensusResults.find((r) => r.id === issueId);
  return result?.unanimous === true;
}

/**
 * Get consensus status for an issue
 */
export function getConsensusStatus(issueHits: IssueHit[], issueId: string): {
  unanimous: boolean;
  majority: boolean;
  weak: boolean;
  engines: string[];
  weight: number;
} | null {
  const consensusResults = consensus(issueHits);
  const result = consensusResults.find((r) => r.id === issueId);
  if (!result) return null;

  return {
    unanimous: result.unanimous,
    majority: result.majority,
    weak: result.weak,
    engines: result.engines,
    weight: result.weight,
  };
}

