/**
 * Dealership Lost Opportunity Cost (D-LOC) Calculator
 * 
 * Canonized formulas for calculating unrealized profit from:
 * 1. Ad Spend Spillage (Website Failure)
 * 2. Lead Handling Failure (Process Failure)
 * 3. Market Saturation Failure (Budget/Rank)
 * 4. Customer Lifetime Value Loss (LTV)
 */

export interface DLOCInputs {
  // Financial Metrics
  avgGrossProfitNew: number;
  avgGrossProfitUsed: number;
  avgFIPVR: number; // F&I Gross Profit per Retail Unit
  newUsedRatio: number; // Percentage of new vs used (e.g., 0.4 = 40% new, 60% used)
  totalMonthlyAdSpend: number;
  
  // Lead Metrics
  totalLeadsGenerated: number;
  highIntentLeadRate: number; // Percentage of high-intent leads (VDP forms, finance apps)
  highIntentConversionRate: number; // Lead-to-sale rate for high-intent
  lowIntentConversionRate: number; // Lead-to-sale rate for low-intent
  
  // Advertising Metrics
  searchLostISBudget: number; // Percentage (0-1)
  searchLostISRank: number; // Percentage (0-1)
  
  // Website Performance
  websiteLoadSpeedLossRate: number; // Percentage (0-1) - Core Web Vitals failure tax
  
  // Sales Process
  avgLeadResponseTimeMinutes: number;
  serviceRetentionRate: number; // Percentage of customers who return for service
  avgServiceProfitPerCustomer3Years: number; // $1,200-$1,500 industry average
  
  // Attribution
  timeDecayAttributionFactor: number; // 0-1, typically 0.9 for multi-touch
  geoInfluenceRadiusMiles: number; // Physical market area
}

export interface DLOCResults {
  pillar1: {
    adSpendWasted: number;
    lostLeads: number;
    lostSales: number;
    unrealizedProfit: number;
    description: string;
  };
  pillar2: {
    lostLeads: number;
    lostSalesHighIntent: number;
    lostSalesLowIntent: number;
    totalLostSales: number;
    unrealizedProfit: number;
    ltvLoss: number;
    description: string;
  };
  pillar3: {
    totalLostIS: number;
    potentialLeads: number;
    missedLeads: number;
    lostSales: number;
    unrealizedProfit: number;
    description: string;
  };
  pillar4: {
    totalLTVLoss: number;
    description: string;
  };
  summary: {
    totalDLOC: number;
    byCategory: Array<{ category: string; amount: number; percentage: number }>;
    recommendations: Array<{ priority: string; action: string; investment: number; roi: number }>;
  };
}

/**
 * Calculate response time conversion probability multiplier
 * Based on industry data: 100x more likely to connect within 5 minutes
 */
function getResponseTimeMultiplier(responseTimeMinutes: number): number {
  if (responseTimeMinutes <= 5) return 1.0;
  if (responseTimeMinutes <= 15) return 0.80;
  if (responseTimeMinutes <= 30) return 0.50;
  if (responseTimeMinutes <= 60) return 0.15;
  return 0.05; // > 60 minutes
}

/**
 * Calculate weighted average gross profit based on sales mix
 */
function calculateWeightedGrossProfit(
  newProfit: number,
  usedProfit: number,
  newUsedRatio: number
): number {
  return newProfit * newUsedRatio + usedProfit * (1 - newUsedRatio);
}

/**
 * Main D-LOC Calculator
 */
export function calculateDLOC(inputs: DLOCInputs): DLOCResults {
  // === PILLAR 1: Ad Spend Spillage (Website Failure) ===
  const adSpendWasted = inputs.totalMonthlyAdSpend * inputs.websiteLoadSpeedLossRate;
  const lostLeadsPillar1 = inputs.totalLeadsGenerated * inputs.websiteLoadSpeedLossRate;
  
  // Split leads by intent
  const highIntentLeads = inputs.totalLeadsGenerated * inputs.highIntentLeadRate;
  const lowIntentLeads = inputs.totalLeadsGenerated * (1 - inputs.highIntentLeadRate);
  
  const lostHighIntentLeads = highIntentLeads * inputs.websiteLoadSpeedLossRate;
  const lostLowIntentLeads = lowIntentLeads * inputs.websiteLoadSpeedLossRate;
  
  const lostSalesHighIntent = lostHighIntentLeads * inputs.highIntentConversionRate;
  const lostSalesLowIntent = lostLowIntentLeads * inputs.lowIntentConversionRate;
  const lostSalesPillar1 = lostSalesHighIntent + lostSalesLowIntent;
  
  const weightedGrossProfit = calculateWeightedGrossProfit(
    inputs.avgGrossProfitNew,
    inputs.avgGrossProfitUsed,
    inputs.newUsedRatio
  );
  const totalTransactionProfit = weightedGrossProfit + inputs.avgFIPVR;
  
  const unrealizedProfitPillar1 = lostSalesPillar1 * totalTransactionProfit;
  
  // === PILLAR 2: Lead Handling Failure (Process Failure) ===
  const responseTimeMultiplier = getResponseTimeMultiplier(inputs.avgLeadResponseTimeMinutes);
  const leadLossRate = 1 - responseTimeMultiplier;
  
  const lostLeadsPillar2 = inputs.totalLeadsGenerated * leadLossRate;
  
  const lostHighIntentLeadsP2 = highIntentLeads * leadLossRate;
  const lostLowIntentLeadsP2 = lowIntentLeads * leadLossRate;
  
  const lostSalesHighIntentP2 = lostHighIntentLeadsP2 * inputs.highIntentConversionRate;
  const lostSalesLowIntentP2 = lostLowIntentLeadsP2 * inputs.lowIntentConversionRate;
  const lostSalesPillar2 = lostSalesHighIntentP2 + lostSalesLowIntentP2;
  
  const unrealizedProfitPillar2 = lostSalesPillar2 * totalTransactionProfit;
  
  // LTV Loss (Pillar 4 integrated into Pillar 2)
  const ltvLoss = lostSalesHighIntentP2 * (
    totalTransactionProfit + 
    (inputs.avgServiceProfitPerCustomer3Years * inputs.serviceRetentionRate)
  );
  
  // === PILLAR 3: Market Saturation Failure ===
  const totalLostIS = inputs.searchLostISBudget + inputs.searchLostISRank;
  const potentialLeads = inputs.totalLeadsGenerated / (1 - totalLostIS);
  const missedLeads = potentialLeads - inputs.totalLeadsGenerated;
  
  // Apply time-decay attribution factor
  const attributedMissedLeads = missedLeads * inputs.timeDecayAttributionFactor;
  
  // Split by intent
  const missedHighIntent = attributedMissedLeads * inputs.highIntentLeadRate;
  const missedLowIntent = attributedMissedLeads * (1 - inputs.highIntentLeadRate);
  
  const lostSalesHighIntentP3 = missedHighIntent * inputs.highIntentConversionRate;
  const lostSalesLowIntentP3 = missedLowIntent * inputs.lowIntentConversionRate;
  const lostSalesPillar3 = lostSalesHighIntentP3 + lostSalesLowIntentP3;
  
  const unrealizedProfitPillar3 = lostSalesPillar3 * totalTransactionProfit;
  
  // === PILLAR 4: Total LTV Loss ===
  const totalLTVLoss = ltvLoss; // Already calculated in Pillar 2
  
  // === SUMMARY ===
  const totalDLOC = unrealizedProfitPillar1 + unrealizedProfitPillar2 + unrealizedProfitPillar3 + totalLTVLoss;
  
  const byCategory = [
    { category: "Ad Spillage", amount: unrealizedProfitPillar1, percentage: (unrealizedProfitPillar1 / totalDLOC) * 100 },
    { category: "Process Failure", amount: unrealizedProfitPillar2, percentage: (unrealizedProfitPillar2 / totalDLOC) * 100 },
    { category: "Market Failure", amount: unrealizedProfitPillar3, percentage: (unrealizedProfitPillar3 / totalDLOC) * 100 },
    { category: "LTV Loss", amount: totalLTVLoss, percentage: (totalLTVLoss / totalDLOC) * 100 },
  ];
  
  // Generate ROI-based recommendations
  const recommendations = generateRecommendations(inputs, {
    pillar1: unrealizedProfitPillar1,
    pillar2: unrealizedProfitPillar2,
    pillar3: unrealizedProfitPillar3,
  });
  
  return {
    pillar1: {
      adSpendWasted,
      lostLeads: lostLeadsPillar1,
      lostSales: lostSalesPillar1,
      unrealizedProfit: unrealizedProfitPillar1,
      description: "Profit lost due to poor website performance driving expensive traffic away",
    },
    pillar2: {
      lostLeads: lostLeadsPillar2,
      lostSalesHighIntent: lostSalesHighIntentP2,
      lostSalesLowIntent: lostSalesLowIntentP2,
      totalLostSales: lostSalesPillar2,
      unrealizedProfit: unrealizedProfitPillar2,
      ltvLoss,
      description: "Profit lost due to slow follow-up and process inconsistencies",
    },
    pillar3: {
      totalLostIS: totalLostIS * 100, // Convert to percentage
      potentialLeads,
      missedLeads: attributedMissedLeads,
      lostSales: lostSalesPillar3,
      unrealizedProfit: unrealizedProfitPillar3,
      description: "Profit lost due to budget constraints and poor Quality Score/Rank",
    },
    pillar4: {
      totalLTVLoss,
      description: "Long-term profit lost from high-value customers who didn't return for service",
    },
    summary: {
      totalDLOC,
      byCategory,
      recommendations,
    },
  };
}

/**
 * Generate ROI-based recommendations
 */
function generateRecommendations(
  inputs: DLOCInputs,
  losses: { pillar1: number; pillar2: number; pillar3: number }
): Array<{ priority: string; action: string; investment: number; roi: number }> {
  const recommendations = [];
  
  // Pillar 1: Website Fix (one-time investment)
  const pillar1Investment = 8000; // One-time dev cost
  const pillar1ROI = (losses.pillar1 / pillar1Investment) * 100;
  recommendations.push({
    priority: pillar1ROI > 150 ? "HIGH" : "MEDIUM",
    action: "Fix Core Web Vitals & Website Performance",
    investment: pillar1Investment,
    roi: pillar1ROI,
  });
  
  // Pillar 2: Process Fix (typically organizational, low cost)
  const pillar2Investment = 2500; // Monthly BDC training/CRM setup
  const pillar2ROI = (losses.pillar2 / pillar2Investment) * 100;
  recommendations.push({
    priority: pillar2ROI > 200 ? "CRITICAL" : "HIGH",
    action: "Implement 5-Minute Response Rule & Enhanced Follow-Up Cadence",
    investment: pillar2Investment,
    roi: pillar2ROI,
  });
  
  // Pillar 3: Budget Increase (monthly investment)
  const pillar3Investment = 5000; // Monthly ad spend increase
  const pillar3ROI = (losses.pillar3 / pillar3Investment) * 100;
  recommendations.push({
    priority: pillar3ROI > 300 ? "HIGH" : "MEDIUM",
    action: "Increase Budget & Improve Quality Score to Reduce Lost IS",
    investment: pillar3Investment,
    roi: pillar3ROI,
  });
  
  // Sort by ROI descending
  return recommendations.sort((a, b) => b.roi - a.roi);
}

/**
 * Calculate Dynamic Cost Per Acquisition (CPA) savings
 */
export function calculateCPASavings(
  currentQualityScore: number,
  targetQualityScore: number,
  currentCPC: number
): number {
  // Quality Score 7+ typically yields 10-20% CPC reduction
  const scoreImprovement = targetQualityScore - currentQualityScore;
  const cpcReductionPercent = Math.min(0.20, scoreImprovement * 0.03); // 3% per point, max 20%
  return currentCPC * cpcReductionPercent;
}

