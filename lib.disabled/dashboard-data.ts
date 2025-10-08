export interface DashboardMetrics {
  aiVisibility: number;
  reviewHealth: number;
  localRank: number;
  monthlyLeads: number;
}

export async function fetchDashboardMetrics(dealerId: string): Promise<DashboardMetrics> {
  // Replace with actual API call
  return {
    aiVisibility: 72,
    reviewHealth: 4.6,
    localRank: 3,
    monthlyLeads: 47,
  };
}

export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return 'neutral';
  return diff > 0 ? 'up' : 'down';
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}
