/**
 * Opportunity Efficiency Loss (OEL) Calculation
 * 
 * OEL = (Wasted Ad Spend) + (Value of Lost Qualified Leads) - Recovered
 * 
 * Enhanced formula:
 * OEL = (A × C_waste) + (B × V_lost) - R
 * 
 * Where:
 * A = Total ad spend
 * C_waste = % of clicks/impressions not reaching qualified status
 * B = Qualified leads lost due to visibility / trust gap
 * V_lost = Average lead value (gross profit per sold unit × close rate)
 * R = Recovered leads (if remediation campaigns were run)
 */

export interface OELMetrics {
  // Input metrics
  totalAdSpend: number; // A
  totalClicks: number;
  qualifiedClicks: number;
  totalVisitors: number;
  aivScore: number; // AI Visibility score (0-100)
  avgGrossPerUnit: number;
  avgCloseRate: number; // As decimal (e.g., 0.25 for 25%)
  recoveredLeads: number; // R
  
  // Calculated metrics
  adWastePercent: number; // C_waste
  visibilityLossPercent: number;
  leadValue: number; // V_lost
  wastedAdSpend: number;
  lostQualifiedLeads: number;
  oelActual: number;
  oelScore: number; // Normalized 0-100
}

export interface OELCalculationResult {
  oel: number;
  wastedAdSpend: number;
  lostQualifiedLeads: number;
  recovered: number;
  netLoss: number;
  efficiencyScore: number;
  breakdown: {
    adWastePercent: number;
    visibilityLossPercent: number;
    leadValue: number;
    totalClicks: number;
    qualifiedClicks: number;
    totalVisitors: number;
  };
}

/**
 * Calculate Opportunity Efficiency Loss
 */
export function calculateOEL(metrics: Partial<OELMetrics>): OELCalculationResult {
  // Default values
  const totalAdSpend = metrics.totalAdSpend || 0;
  const totalClicks = metrics.totalClicks || 0;
  const qualifiedClicks = metrics.qualifiedClicks || 0;
  const totalVisitors = metrics.totalVisitors || 0;
  const aivScore = metrics.aivScore || 0;
  const avgGrossPerUnit = metrics.avgGrossPerUnit || 0;
  const avgCloseRate = metrics.avgCloseRate || 0;
  const recoveredLeads = metrics.recoveredLeads || 0;

  // Calculate ad waste percentage
  const adWastePercent = totalClicks > 0 
    ? 1 - (qualifiedClicks / totalClicks)
    : 0;

  // Calculate visibility loss percentage
  const visibilityLossPercent = (100 - aivScore) / 100;

  // Calculate average lead value
  const leadValue = avgGrossPerUnit * avgCloseRate;

  // Calculate wasted ad spend (A × C_waste)
  const wastedAdSpend = totalAdSpend * adWastePercent;

  // Calculate lost qualified leads (B × V_lost)
  // B = Total visitors × visibility loss %
  const lostQualifiedLeads = totalVisitors * visibilityLossPercent * leadValue;

  // Calculate OEL = (A × C_waste) + (B × V_lost) - R
  const oelActual = wastedAdSpend + lostQualifiedLeads - recoveredLeads;

  // Normalize into score (0-100)
  // OEL Score = 100 - (OEL Actual / OEL Expected Baseline × 100)
  // For baseline, use industry average: ~$20,000/month for typical dealership
  const oelExpectedBaseline = 20000; // Can be configured per dealership
  const oelScore = Math.max(0, Math.min(100, 100 - (oelActual / oelExpectedBaseline) * 100));

  return {
    oel: oelActual,
    wastedAdSpend,
    lostQualifiedLeads,
    recovered: recoveredLeads * leadValue, // Recovered value in dollars
    netLoss: oelActual,
    efficiencyScore: Math.round(oelScore),
    breakdown: {
      adWastePercent: Math.round(adWastePercent * 100 * 100) / 100, // Percentage with 2 decimals
      visibilityLossPercent: Math.round(visibilityLossPercent * 100 * 100) / 100,
      leadValue: Math.round(leadValue * 100) / 100,
      totalClicks,
      qualifiedClicks,
      totalVisitors,
    },
  };
}

/**
 * Generate demo OEL data for testing
 */
export function generateDemoOEL(): OELCalculationResult {
  return calculateOEL({
    totalAdSpend: 12000,
    totalClicks: 2400,
    qualifiedClicks: 720,
    totalVisitors: 8500,
    aivScore: 72, // AI Visibility score
    avgGrossPerUnit: 3500,
    avgCloseRate: 0.18, // 18% close rate
    recoveredLeads: 2, // 2 leads recovered from remediation
  });
}

