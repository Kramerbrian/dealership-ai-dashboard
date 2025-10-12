/**
 * VDP-TOP + AEMD Integration
 * 
 * Integrates the VDP-TOP protocol with AEMD scoring to provide
 * comprehensive AI visibility optimization for automotive dealerships.
 */

import { VDPContextData, VDPTopOutput } from './vdp-top-protocol';
import { AEMDInputs, analyzeAEMD, AEMDResult } from './aemd-calculator';
import { generateVDPTopContentWithAI } from './vdp-ai-integration';

export interface VDPAEMDIntegration {
  vdpContent: VDPTopOutput;
  aemdAnalysis: AEMDResult;
  integratedScore: number;
  optimizationRecommendations: string[];
  priorityActions: string[];
}

export interface VDPAEMDMetrics {
  vaiScore: number;              // VDP-TOP VAI score
  aemdScore: number;             // AEMD score
  integratedScore: number;       // Combined optimization score
  competitivePosition: 'dominant' | 'competitive' | 'behind';
  contentQuality: 'excellent' | 'good' | 'needs_improvement';
  optimizationPotential: 'high' | 'medium' | 'low';
}

/**
 * Generate AEMD inputs from VDP context and performance data
 */
export function generateAEMDInputsFromVDP(
  context: VDPContextData,
  vdpPerformance: {
    fsCaptureRate: number;       // Featured snippet capture rate for this VIN
    aioCitationRate: number;     // AI Overview citation rate
    paaOwnershipCount: number;   // PAA boxes owned for this vehicle type
    competitorBenchmark: number; // Competitor AEMD average
    trustScore: number;          // E-E-A-T trust score
  }
): AEMDInputs {
  return {
    fsCaptureShare: vdpPerformance.fsCaptureRate,
    aioCitationShare: vdpPerformance.aioCitationRate,
    paaBoxOwnership: vdpPerformance.paaOwnershipCount,
    competitorAEMDAvg: vdpPerformance.competitorBenchmark,
    defensiveWeight: calculateDefensiveWeight(context, vdpPerformance),
    eEATTrustAlpha: vdpPerformance.trustScore
  };
}

/**
 * Calculate defensive weight based on VDP context and market conditions
 */
function calculateDefensiveWeight(
  context: VDPContextData,
  performance: any
): number {
  let weight = 1.0;

  // Increase weight for high-value vehicle segments
  if (context.vinDecodedSpecs.msrp > 40000) {
    weight += 0.2;
  }

  // Increase weight for competitive markets
  if (context.dealerData.city === 'Los Angeles' || context.dealerData.city === 'New York') {
    weight += 0.15;
  }

  // Increase weight for luxury brands
  const luxuryBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche'];
  if (luxuryBrands.includes(context.vinDecodedSpecs.make)) {
    weight += 0.1;
  }

  // Increase weight based on cluster priority
  if (context.vcoClusterId.includes('High-Value') || context.vcoClusterId.includes('Luxury')) {
    weight += 0.1;
  }

  return Math.min(weight, 2.0); // Cap at 2.0
}

/**
 * Generate VDP content with AEMD optimization
 */
export async function generateVDPWithAEMDOptimization(
  context: VDPContextData,
  vdpPerformance: {
    fsCaptureRate: number;
    aioCitationRate: number;
    paaOwnershipCount: number;
    competitorBenchmark: number;
    trustScore: number;
  },
  aiProvider: 'openai' | 'anthropic' | 'gemini' = 'openai'
): Promise<VDPAEMDIntegration> {
  // Generate VDP content using VDP-TOP protocol
  const vdpContent = await generateVDPTopContentWithAI(context, aiProvider);

  // Generate AEMD inputs from VDP context and performance
  const aemdInputs = generateAEMDInputsFromVDP(context, vdpPerformance);

  // Analyze AEMD performance
  const aemdAnalysis = analyzeAEMD(aemdInputs);

  // Calculate integrated score
  const integratedScore = calculateIntegratedScore(vdpContent, aemdAnalysis);

  // Generate optimization recommendations
  const optimizationRecommendations = generateOptimizationRecommendations(
    vdpContent,
    aemdAnalysis,
    context
  );

  // Extract priority actions
  const priorityActions = aemdAnalysis.prescriptiveActions
    .filter(action => action.priority === 'high')
    .map(action => action.action);

  return {
    vdpContent,
    aemdAnalysis,
    integratedScore,
    optimizationRecommendations,
    priorityActions
  };
}

/**
 * Calculate integrated optimization score
 */
function calculateIntegratedScore(
  vdpContent: VDPTopOutput,
  aemdAnalysis: AEMDResult
): number {
  const vaiScore = vdpContent.compliance.vaiScore;
  const aemdScore = aemdAnalysis.calculation.aemdScore;
  
  // Weighted combination: 60% VAI, 40% AEMD
  const integratedScore = (vaiScore * 0.6) + (aemdScore * 0.4);
  
  return Math.round(integratedScore * 100) / 100;
}

/**
 * Generate optimization recommendations based on VDP and AEMD analysis
 */
function generateOptimizationRecommendations(
  vdpContent: VDPTopOutput,
  aemdAnalysis: AEMDResult,
  context: VDPContextData
): string[] {
  const recommendations: string[] = [];

  // VDP-specific recommendations
  if (vdpContent.compliance.piqrScore > 1.2) {
    recommendations.push('Reduce PIQR score by fixing compliance issues');
  }

  if (vdpContent.compliance.hrpScore > 0.3) {
    recommendations.push('Add more verifiable dealer facts to reduce HRP score');
  }

  if (vdpContent.metadata.wordCounts.aeo > 40) {
    recommendations.push('Optimize AEO snippet to stay within 40-word limit');
  }

  // AEMD-specific recommendations
  const aemdActions = aemdAnalysis.prescriptiveActions;
  aemdActions.forEach(action => {
    if (action.priority === 'high') {
      recommendations.push(`High Priority: ${action.description}`);
    }
  });

  // Content quality recommendations
  if (vdpContent.compliance.vaiScore < 70) {
    recommendations.push('Improve overall content quality and compliance');
  }

  if (aemdAnalysis.competitivePosition === 'behind') {
    recommendations.push('Implement aggressive optimization strategy to catch up to competitors');
  }

  // Cluster-specific recommendations
  if (context.vcoClusterId.includes('Family Shoppers')) {
    recommendations.push('Emphasize safety features and family-friendly aspects');
  } else if (context.vcoClusterId.includes('Luxury')) {
    recommendations.push('Highlight premium features and luxury amenities');
  } else if (context.vcoClusterId.includes('Budget')) {
    recommendations.push('Focus on value proposition and cost-effectiveness');
  }

  return recommendations;
}

/**
 * Generate comprehensive metrics for dashboard
 */
export function generateVDPAEMDMetrics(
  vdpContent: VDPTopOutput,
  aemdAnalysis: AEMDResult
): VDPAEMDMetrics {
  const vaiScore = vdpContent.compliance.vaiScore;
  const aemdScore = aemdAnalysis.calculation.aemdScore;
  const integratedScore = calculateIntegratedScore(vdpContent, aemdAnalysis);

  // Determine content quality
  let contentQuality: 'excellent' | 'good' | 'needs_improvement';
  if (vaiScore >= 85 && vdpContent.complianceCheck.isCompliant) {
    contentQuality = 'excellent';
  } else if (vaiScore >= 70 && vdpContent.complianceCheck.canPublish) {
    contentQuality = 'good';
  } else {
    contentQuality = 'needs_improvement';
  }

  // Determine optimization potential
  let optimizationPotential: 'high' | 'medium' | 'low';
  if (aemdScore < 50 || vaiScore < 60) {
    optimizationPotential = 'high';
  } else if (aemdScore < 70 || vaiScore < 80) {
    optimizationPotential = 'medium';
  } else {
    optimizationPotential = 'low';
  }

  return {
    vaiScore,
    aemdScore,
    integratedScore,
    competitivePosition: aemdAnalysis.competitivePosition,
    contentQuality,
    optimizationPotential
  };
}

/**
 * Batch process multiple VDPs with AEMD optimization
 */
export async function batchVDPAEMDOptimization(
  contexts: Array<{
    context: VDPContextData;
    performance: {
      fsCaptureRate: number;
      aioCitationRate: number;
      paaOwnershipCount: number;
      competitorBenchmark: number;
      trustScore: number;
    };
  }>,
  aiProvider: 'openai' | 'anthropic' | 'gemini' = 'openai'
): Promise<VDPAEMDIntegration[]> {
  const results = await Promise.all(
    contexts.map(({ context, performance }) =>
      generateVDPWithAEMDOptimization(context, performance, aiProvider)
    )
  );

  return results;
}

/**
 * Generate AEMD performance summary for multiple VDPs
 */
export function generateAEMDPerformanceSummary(
  integrations: VDPAEMDIntegration[]
): {
  averageAEMDScore: number;
  averageVAIScore: number;
  averageIntegratedScore: number;
  competitiveDistribution: Record<string, number>;
  contentQualityDistribution: Record<string, number>;
  topRecommendations: string[];
  priorityActions: string[];
} {
  const aemdScores = integrations.map(i => i.aemdAnalysis.calculation.aemdScore);
  const vaiScores = integrations.map(i => i.vdpContent.compliance.vaiScore);
  const integratedScores = integrations.map(i => i.integratedScore);

  const averageAEMDScore = aemdScores.reduce((sum, score) => sum + score, 0) / aemdScores.length;
  const averageVAIScore = vaiScores.reduce((sum, score) => sum + score, 0) / vaiScores.length;
  const averageIntegratedScore = integratedScores.reduce((sum, score) => sum + score, 0) / integratedScores.length;

  // Competitive position distribution
  const competitiveDistribution = integrations.reduce((acc, integration) => {
    const position = integration.aemdAnalysis.competitivePosition;
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Content quality distribution
  const contentQualityDistribution = integrations.reduce((acc, integration) => {
    const metrics = generateVDPAEMDMetrics(integration.vdpContent, integration.aemdAnalysis);
    const quality = metrics.contentQuality;
    acc[quality] = (acc[quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Collect all recommendations and actions
  const allRecommendations = integrations.flatMap(i => i.optimizationRecommendations);
  const allPriorityActions = integrations.flatMap(i => i.priorityActions);

  // Get most common recommendations
  const recommendationCounts = allRecommendations.reduce((acc, rec) => {
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRecommendations = Object.entries(recommendationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([rec]) => rec);

  // Get unique priority actions
  const uniquePriorityActions = [...new Set(allPriorityActions)];

  return {
    averageAEMDScore: Math.round(averageAEMDScore * 100) / 100,
    averageVAIScore: Math.round(averageVAIScore * 100) / 100,
    averageIntegratedScore: Math.round(averageIntegratedScore * 100) / 100,
    competitiveDistribution,
    contentQualityDistribution,
    topRecommendations,
    priorityActions: uniquePriorityActions
  };
}

/**
 * Generate AEMD-optimized VDP content with enhanced prompts
 */
export function generateAEMDOptimizedPrompt(
  context: VDPContextData,
  aemdAnalysis: AEMDResult
): string {
  const basePrompt = `
**Role:** Act as a Master Automotive Merchandising Copywriter and SEO/AEO/GEO Compliance Auditor with AEMD optimization expertise.

**AEMD Analysis Context:**
- Current AEMD Score: ${aemdAnalysis.calculation.aemdScore.toFixed(1)}/100
- Competitive Position: ${aemdAnalysis.competitivePosition.toUpperCase()}
- Priority Actions: ${aemdAnalysis.prescriptiveActions.filter(a => a.priority === 'high').map(a => a.action).join(', ')}

**VDP Context:**
- VIN: ${context.vin}
- Vehicle: ${context.vinDecodedSpecs.year} ${context.vinDecodedSpecs.make} ${context.vinDecodedSpecs.model}
- Cluster: ${context.vcoClusterId}
- Sentiment: ${context.targetedSentiment}
- Dealer: ${context.dealerData.name} in ${context.dealerData.city}

**AEMD Optimization Requirements:**
1. **Featured Snippet Optimization:** Ensure AEO snippet directly answers the most common question for this vehicle type
2. **AI Overview Citation:** Include verifiable dealer facts and statistics that AI can cite
3. **PAA Box Capture:** Structure content to answer related questions naturally
4. **E-E-A-T Enhancement:** Include Master Technician ${context.dealerData.masterTechName} expertise and dealer credentials

**Output Format (Strict JSON):**
{
  "AEO_Snippet_Block": "Direct answer to most common buyer question. Max 40 words, 2 sentences. Include Model/Year/Local Keyword.",
  "GEO_Authority_Block": "Establish trustworthiness and expertise. 100 words, 3-4 sentences. Include verifiable statistics and dealer advantage reference.",
  "SEO_Descriptive_Block": "Traditional descriptive narrative. 250 words. Must be ≥80% unique and integrate long-tail keywords naturally.",
  "Internal_Link_Block": [
    {"anchor": "Finance Application", "url": "/finance-application"},
    {"anchor": "Certified Service Center", "url": "${context.dealerData.servicePageUrl}"},
    {"anchor": "Master Technician Bio", "url": "/technician-bio"}
  ]
}
`;

  return basePrompt;
}
