/**
 * OEM Router
 * Routes OEM model updates to relevant dealerships and groups
 */

export type Dealer = {
  id: string;
  domain?: string;
  host?: string;
  group_id?: string;
  brand_mix?: Record<string, number>; // brand -> percentage of inventory
  // ... other dealer fields
};

export type Group = {
  id: string;
  name: string;
  dealer_ids: string[];
};

export type OEMModel = {
  model_year: number;
  brand: string;
  model: string;
  trim?: string;
  headline_bullets?: Array<{
    text: string;
    tag: string;
    retail_relevance: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
};

export type DealerCoverage = {
  dealer_id: string;
  priority_bucket: 'P0' | 'P1' | 'P2' | 'P3';
  priority_score: number; // 0-100
};

export type GroupOemRollup = {
  group_id: string;
  group_name: string;
  rooftops_total: number;
  rooftops_relevant: number;
  rooftops_high_priority: number;
  avg_priority_score: number; // 0–100
};

export type RouteOemUpdateResult = {
  oem_model_label: string;
  dealer_coverage: DealerCoverage[];
  group_rollups: GroupOemRollup[];
};

/**
 * Route OEM update to relevant dealers and groups
 * 
 * @param oem - OEM model data
 * @param dealers - All dealers
 * @param groups - All groups
 * @returns Routing result with dealer coverage and group rollups
 */
export function routeOemUpdate(
  oem: OEMModel,
  dealers: Dealer[],
  groups: Group[]
): RouteOemUpdateResult {
  const oem_model_label = `${oem.model_year} ${oem.brand} ${oem.model}`;
  const dealer_coverage: DealerCoverage[] = [];

  // Score each dealer
  for (const dealer of dealers) {
    const score = calculateDealerPriority(oem, dealer);
    if (score.score > 0) {
      dealer_coverage.push({
        dealer_id: dealer.id,
        priority_bucket: score.bucket,
        priority_score: score.score,
      });
    }
  }

  // Sort by priority score (descending)
  dealer_coverage.sort((a, b) => b.priority_score - a.priority_score);

  // Build group rollups
  const group_rollups: GroupOemRollup[] = [];
  const dealersByGroup = new Map<string, Dealer[]>();

  // Group dealers by group_id
  for (const dealer of dealers) {
    if (dealer.group_id) {
      if (!dealersByGroup.has(dealer.group_id)) {
        dealersByGroup.set(dealer.group_id, []);
      }
      dealersByGroup.get(dealer.group_id)!.push(dealer);
    }
  }

  // Calculate rollups per group
  for (const group of groups) {
    const groupDealers = dealersByGroup.get(group.id) || [];
    const relevantDealers = dealer_coverage.filter((cov) =>
      groupDealers.some((d) => d.id === cov.dealer_id)
    );
    const highPriorityDealers = relevantDealers.filter((cov) => cov.priority_bucket === 'P0');

    const avg_priority_score =
      relevantDealers.length > 0
        ? Math.round(
            relevantDealers.reduce((sum, cov) => sum + cov.priority_score, 0) / relevantDealers.length
          )
        : 0;

    group_rollups.push({
      group_id: group.id,
      group_name: group.name,
      rooftops_total: groupDealers.length,
      rooftops_relevant: relevantDealers.length,
      rooftops_high_priority: highPriorityDealers.length,
      avg_priority_score,
    });
  }

  return {
    oem_model_label,
    dealer_coverage,
    group_rollups,
  };
}

/**
 * Calculate dealer priority score for an OEM model
 */
function calculateDealerPriority(
  oem: OEMModel,
  dealer: Dealer
): { score: number; bucket: 'P0' | 'P1' | 'P2' | 'P3' } {
  let score = 0;

  // Check brand mix (if dealer sells this brand)
  if (dealer.brand_mix && dealer.brand_mix[oem.brand]) {
    const brandPercentage = dealer.brand_mix[oem.brand];
    score += brandPercentage * 0.6; // 60% weight on brand mix

    // High priority if brand mix > 30%
    if (brandPercentage > 0.3) {
      score += 30;
    }
  } else {
    // No brand match = low priority
    return { score: 0, bucket: 'P3' };
  }

  // Check for high retail relevance bullets
  if (oem.headline_bullets) {
    const highRelevanceCount = oem.headline_bullets.filter(
      (b) => b.retail_relevance === 'HIGH'
    ).length;
    score += Math.min(highRelevanceCount * 5, 20); // Up to 20 points
  }

  // Determine priority bucket
  let bucket: 'P0' | 'P1' | 'P2' | 'P3';
  if (score >= 70) bucket = 'P0';
  else if (score >= 50) bucket = 'P1';
  else if (score >= 30) bucket = 'P2';
  else bucket = 'P3';

  return { score: Math.min(Math.round(score), 100), bucket };
}

