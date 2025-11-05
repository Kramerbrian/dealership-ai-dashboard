// lib/attribution/revenue-calculator.ts

import { db } from '@/lib/db';

interface AttributionResult {
  baseline: BaselineMetrics;
  current: CurrentMetrics;
  attributed: AttributedMetrics;
  confidence: number;
  roi: ROIMetrics;
  breakdown: AttributionBreakdown[];
}

interface BaselineMetrics {
  period: string;
  leads: number;
  conversions: number;
  revenue: number;
  avg_deal_value: number;
  aiv?: number;
  rank?: number;
}

interface CurrentMetrics {
  period: string;
  leads: number;
  conversions: number;
  revenue: number;
  avg_deal_value: number;
  aiv?: number;
  rank?: number;
}

interface AttributedMetrics {
  leads: number;
  conversions: number;
  revenue: number;
  monthly_gain: number;
}

interface ROIMetrics {
  subscription_cost: number;
  attributed_revenue: number;
  roi_multiple: number;
  payback_period_days: number;
  annual_value: number;
}

interface AttributionBreakdown {
  strategy: string;
  deployed_date: string;
  expected_impact: number;
  actual_impact: number;
  accuracy: number;
  leads_attributed: number;
  revenue_attributed: number;
}

export class RevenueAttributionEngine {
  
  static async calculateAttribution(
    dealershipId: string,
    periodDays: number = 30
  ): Promise<AttributionResult> {
    
    // Get dealership
    const dealership = await db.dealership.findUnique({
      where: { id: dealershipId },
    });

    if (!dealership) {
      throw new Error('Dealership not found');
    }

    // Get subscription start date
    const subscriptionStart = new Date(dealership.createdAt);
    const now = new Date();
    const daysSubscribed = Math.floor((now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24));

    // Define baseline period (30 days before subscription)
    const baselineStart = new Date(subscriptionStart.getTime() - 30 * 24 * 60 * 60 * 1000);
    const baselineEnd = subscriptionStart;

    // Get baseline metrics
    const baseline = await this.getBaselineMetrics(dealershipId, baselineStart, baselineEnd);

    // Get current metrics
    const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const current = await this.getCurrentMetrics(dealershipId, currentStart, now);

    // Calculate attribution
    const attributed = await this.calculateAttributedMetrics(
      dealershipId,
      baseline,
      current,
      subscriptionStart
    );

    // Calculate confidence
    const deploymentsCount = 0; // TODO: Get from deployments table
    const confidence = this.calculateConfidence(
      daysSubscribed,
      deploymentsCount,
      attributed
    );

    // Calculate ROI
    const subscriptionCost = this.getSubscriptionCost(dealership.plan || 'free', daysSubscribed);
    const roi = this.calculateROI(attributed, subscriptionCost);

    // Get strategy breakdown
    const breakdown = await this.getStrategyBreakdown(dealershipId, subscriptionStart);

    return {
      baseline,
      current,
      attributed,
      confidence,
      roi,
      breakdown
    };
  }

  private static async getBaselineMetrics(
    dealershipId: string,
    start: Date,
    end: Date
  ): Promise<BaselineMetrics> {
    
    // Simulate baseline metrics - in production, query actual data
    return {
      period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      leads: 45,
      conversions: 12,
      revenue: 144000,
      avg_deal_value: 12000,
      aiv: 50,
      rank: 10
    };
  }

  private static async getCurrentMetrics(
    dealershipId: string,
    start: Date,
    end: Date
  ): Promise<CurrentMetrics> {
    
    // Simulate current metrics - in production, query actual data
    return {
      period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      leads: 68,
      conversions: 18,
      revenue: 216000,
      avg_deal_value: 12000,
      aiv: 72,
      rank: 7
    };
  }

  private static async calculateAttributedMetrics(
    dealershipId: string,
    baseline: BaselineMetrics,
    current: CurrentMetrics,
    subscriptionStart: Date
  ): Promise<AttributedMetrics> {
    
    // Method 1: Direct AI referral tracking (simulated)
    const aiReferralLeads = 8;
    const aiReferralConversions = 3;
    const aiReferralRevenue = 36000;

    // Method 2: Incremental lift calculation
    const expectedLeads = baseline.leads;
    const actualLeads = current.leads;
    const liftLeads = Math.max(0, actualLeads - expectedLeads);

    const expectedRevenue = baseline.revenue;
    const actualRevenue = current.revenue;
    const liftRevenue = Math.max(0, actualRevenue - expectedRevenue);

    // Method 3: AIV correlation
    const aivImprovement = (current.aiv || 50) - (baseline.aiv || 50);
    const aivCorrelatedLeads = Math.floor(aivImprovement * 0.5);
    const aivCorrelatedRevenue = aivCorrelatedLeads * baseline.avg_deal_value;

    // Weighted average of methods
    const attributedLeads = Math.round(
      aiReferralLeads * 0.6 +
      liftLeads * 0.25 +
      aivCorrelatedLeads * 0.15
    );

    const attributedRevenue = Math.round(
      aiReferralRevenue * 0.6 +
      liftRevenue * 0.25 +
      aivCorrelatedRevenue * 0.15
    );

    const attributedConversions = Math.round(
      aiReferralConversions * 0.6 +
      (liftLeads * (baseline.conversions / baseline.leads)) * 0.25 +
      (aivCorrelatedLeads * (baseline.conversions / baseline.leads)) * 0.15
    );

    // Calculate monthly rate
    const daysInPeriod = Math.floor((new Date().getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24));
    const monthlyGain = daysInPeriod > 0 ? (attributedRevenue / daysInPeriod) * 30 : attributedRevenue;

    return {
      leads: attributedLeads,
      conversions: attributedConversions,
      revenue: attributedRevenue,
      monthly_gain: monthlyGain
    };
  }

  private static calculateConfidence(
    daysSubscribed: number,
    deploymentsCount: number,
    attributed: AttributedMetrics
  ): number {
    
    let confidence = 50;

    // Time-based confidence
    if (daysSubscribed >= 90) confidence += 25;
    else if (daysSubscribed >= 60) confidence += 20;
    else if (daysSubscribed >= 30) confidence += 15;
    else confidence += 10;

    // Activity-based confidence
    if (deploymentsCount >= 5) confidence += 15;
    else if (deploymentsCount >= 3) confidence += 10;
    else if (deploymentsCount >= 1) confidence += 5;

    // Impact-based confidence
    if (attributed.leads >= 20) confidence += 10;
    else if (attributed.leads >= 10) confidence += 5;

    return Math.min(95, confidence);
  }

  private static calculateROI(
    attributed: AttributedMetrics,
    subscriptionCost: number
  ): ROIMetrics {
    
    const roiMultiple = subscriptionCost > 0 ? attributed.revenue / subscriptionCost : 0;
    const paybackPeriodDays = (attributed.monthly_gain / 30) > 0 
      ? subscriptionCost / (attributed.monthly_gain / 30) 
      : 0;
    const annualValue = attributed.monthly_gain * 12;

    return {
      subscription_cost: subscriptionCost,
      attributed_revenue: attributed.revenue,
      roi_multiple: Math.round(roiMultiple * 10) / 10,
      payback_period_days: Math.round(paybackPeriodDays),
      annual_value: Math.round(annualValue)
    };
  }

  private static async getStrategyBreakdown(
    dealershipId: string,
    subscriptionStart: Date
  ): Promise<AttributionBreakdown[]> {
    
    // Simulate strategy breakdown - in production, query actual data
    return [
      {
        strategy: 'schema_markup',
        deployed_date: subscriptionStart.toLocaleDateString(),
        expected_impact: 18,
        actual_impact: 15,
        accuracy: 83,
        leads_attributed: 5,
        revenue_attributed: 60000
      }
    ];
  }

  private static getSubscriptionCost(tier: string, daysSubscribed: number): number {
    const monthlyCost: Record<string, number> = {
      free: 0,
      pro: 499,
      enhanced: 599,
      premium: 999,
      acceleration: 999
    };

    const cost = monthlyCost[tier.toLowerCase()] || 0;
    const months = Math.ceil(daysSubscribed / 30);
    
    return cost * months;
  }
}

// Lead Source Attribution
export async function attributeLeadSource(
  dealershipId: string,
  leadData: any
): Promise<void> {
  
  // Analyze referrer
  const referrer = leadData.referrer || '';
  const utmSource = leadData.utm_source || '';
  
  let sourceType = 'direct';
  let sourceDetail = null;
  let aiInfluenced = false;
  let confidence = 0.5;

  // Check for AI referrals
  if (referrer.includes('chat.openai.com') || utmSource === 'chatgpt') {
    sourceType = 'ai_search';
    sourceDetail = 'ChatGPT';
    aiInfluenced = true;
    confidence = 0.95;
  } else if (referrer.includes('claude.ai') || utmSource === 'claude') {
    sourceType = 'ai_search';
    sourceDetail = 'Claude';
    aiInfluenced = true;
    confidence = 0.95;
  } else if (referrer.includes('perplexity.ai') || utmSource === 'perplexity') {
    sourceType = 'ai_search';
    sourceDetail = 'Perplexity';
    aiInfluenced = true;
    confidence = 0.95;
  } else if (referrer.includes('google.com')) {
    sourceType = 'organic_search';
    sourceDetail = 'Google';
    
    // Check if they searched for dealer name (brand search = likely AI-influenced)
    const dealership = await db.dealership.findUnique({
      where: { id: dealershipId }
    });
    
    if (dealership && leadData.search_query?.toLowerCase().includes(dealership.name.toLowerCase())) {
      aiInfluenced = true;
      confidence = 0.7;
    }
  }

  // Note: In production, save to LeadSource table
  // await db.leadSource.create({...})
}
