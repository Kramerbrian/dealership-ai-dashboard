export function vai(platforms: { name: string; visibility: number; weight: number }[]) {
  return platforms.reduce((s, p) => s + p.visibility * p.weight, 0);
}

export function piqr(mults: number[]) { 
  return mults.reduce((m, x) => m * x, 1); 
} // ≥1.0

export function hrp(bad: number, total: number, severity = 1) { 
  return total ? (bad / total) * severity : 0; 
}

export function qaiStar(
  seo: number, 
  VAI: number, 
  velocity: number, 
  HRP: number, 
  w1 = 0.30, 
  w2 = 0.70, 
  wh = 0.20, 
  piqr = 1
) {
  const core = (seo * w1 + VAI * w2) * (1 + velocity) - (HRP * wh);
  return Math.max(0, core) / Math.max(1, piqr);
}

// Additional scoring functions for 2026
export function aemd(featuredSnippets: number, aioCitations: number, paaOwnership: number) {
  return (featuredSnippets * 0.40) + (aioCitations * 0.35) + (paaOwnership * 0.25);
}

export function vAi(volatility: number, stability: number): 'stable' | 'warning' | 'critical' {
  if (volatility < 0.10) return 'stable';
  if (volatility < 0.20) return 'warning';
  return 'critical';
}

export function calculateRevenueAtRisk(
  qaiScore: number, 
  monthlyTraffic: number, 
  avgOrderValue: number,
  conversionRate: number
) {
  const riskMultiplier = Math.max(0, (100 - qaiScore) / 100);
  const monthlyRevenue = monthlyTraffic * conversionRate * avgOrderValue;
  return monthlyRevenue * riskMultiplier;
}