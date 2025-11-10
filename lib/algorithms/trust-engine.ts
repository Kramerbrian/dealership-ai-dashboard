/**
 * DealershipAI Trust Engine
 * 
 * Unified algorithmic trust calculation system that integrates:
 * - Multi-agent trust signals (SEO, AEO, GEO)
 * - E-E-A-T scoring
 * - ATI (Algorithmic Trust Index)
 * - Vertical-specific trust weights
 * - Trust signal analysis and optimization
 */

import { algorithmicTrustScore, TrustInput, Vertical, getTrustWeights, validateTrustInput } from '../scoring/algorithmicTrust';
import { calculateATI, calculateATIResult, ATIPillars, ATIResult } from '../ati-calculator';
import { AlgorithmicFramework, AlgorithmicMetrics } from '../algorithmic-framework';

// ============================================================================
// Trust Engine Core Types
// ============================================================================

export interface AgentTrustMetrics {
  mentions: number;           // AI platform mentions (0-100)
  citations: number;          // Citation count (0-100)
  sentiment: number;          // Sentiment score (0-100)
  contentReadiness: number;  // Content quality score (0-100)
  shareOfVoice: number;      // Market share percentage (0-100)
}

export interface MultiAgentTrustData {
  seo: AgentTrustMetrics;    // Search Engine Optimization agent
  aeo: AgentTrustMetrics;    // Answer Engine Optimization agent
  geo: AgentTrustMetrics;  // Generative Engine Optimization agent
}

export interface TrustEngineResult {
  // Core trust scores
  overallTrust: number;      // Overall algorithmic trust (0-100)
  ati: number;                // Algorithmic Trust Index (0-100)
  aiv: number;                // Algorithmic Visibility Index (0-100)
  
  // Agent-specific scores
  seoTrust: number;          // SEO agent trust score
  aeoTrust: number;          // AEO agent trust score
  geoTrust: number;          // GEO agent trust score
  
  // Composite metrics
  crs: number;               // Composite Reputation Score
  confidence: number;        // Confidence level (0-1)
  
  // Breakdown
  pillars: ATIPillars;
  framework: AlgorithmicFramework | null;
  
  // Recommendations
  recommendations: string[];
  priorityActions: TrustAction[];
  
  // Metadata
  vertical: Vertical;
  timestamp: Date;
}

export interface TrustAction {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'authority' | 'expertise' | 'experience' | 'transparency' | 'consistency' | 'freshness';
  action: string;
  impact: number;            // Expected impact (0-100)
  effort: 'low' | 'medium' | 'high';
}

// ============================================================================
// Trust Engine Configuration
// ============================================================================

const AGENT_WEIGHTS = {
  seo: {
    mentions: 0.20,
    citations: 0.25,
    sentiment: 0.15,
    contentReadiness: 0.25,
    shareOfVoice: 0.15
  },
  aeo: {
    mentions: 0.30,
    citations: 0.35,
    sentiment: 0.10,
    contentReadiness: 0.15,
    shareOfVoice: 0.10
  },
  geo: {
    mentions: 0.25,
    citations: 0.30,
    sentiment: 0.20,
    contentReadiness: 0.15,
    shareOfVoice: 0.10
  }
};

const TRUST_COMPOSITE_WEIGHTS = {
  seo: 0.30,    // SEO trust contributes 30% to overall
  aeo: 0.40,    // AEO trust contributes 40% (highest - AI platforms)
  geo: 0.30     // GEO trust contributes 30%
};

// ============================================================================
// Trust Engine Class
// ============================================================================

export class TrustEngine {
  /**
   * Calculate trust score for a specific agent
   */
  static calculateAgentTrust(metrics: AgentTrustMetrics, agentType: 'seo' | 'aeo' | 'geo'): number {
    const weights = AGENT_WEIGHTS[agentType];
    
    const score = (
      (metrics.mentions / 100) * weights.mentions +
      (metrics.citations / 100) * weights.citations +
      (metrics.sentiment / 100) * weights.sentiment +
      (metrics.contentReadiness / 100) * weights.contentReadiness +
      (metrics.shareOfVoice / 100) * weights.shareOfVoice
    ) * 100;
    
    return Math.min(100, Math.max(0, Math.round(score * 10) / 10));
  }

  /**
   * Calculate overall trust from multi-agent data
   */
  static calculateOverallTrust(agentData: MultiAgentTrustData): number {
    const seoTrust = this.calculateAgentTrust(agentData.seo, 'seo');
    const aeoTrust = this.calculateAgentTrust(agentData.aeo, 'aeo');
    const geoTrust = this.calculateAgentTrust(agentData.geo, 'geo');
    
    const overall = (
      seoTrust * TRUST_COMPOSITE_WEIGHTS.seo +
      aeoTrust * TRUST_COMPOSITE_WEIGHTS.aeo +
      geoTrust * TRUST_COMPOSITE_WEIGHTS.geo
    );
    
    return Math.min(100, Math.max(0, Math.round(overall * 10) / 10));
  }

  /**
   * Calculate AIV (Algorithmic Visibility Index) from agent metrics
   */
  static calculateAIV(agentData: MultiAgentTrustData): number {
    // AIV is weighted average of visibility across all agents
    const seoVisibility = (
      agentData.seo.mentions * 0.3 +
      agentData.seo.citations * 0.4 +
      agentData.seo.shareOfVoice * 0.3
    );
    
    const aeoVisibility = (
      agentData.aeo.mentions * 0.4 +
      agentData.aeo.citations * 0.5 +
      agentData.aeo.shareOfVoice * 0.1
    );
    
    const geoVisibility = (
      agentData.geo.mentions * 0.35 +
      agentData.geo.citations * 0.45 +
      agentData.geo.shareOfVoice * 0.2
    );
    
    const aiv = (
      seoVisibility * 0.30 +
      aeoVisibility * 0.40 +
      geoVisibility * 0.30
    );
    
    return Math.min(100, Math.max(0, Math.round(aiv * 10) / 10));
  }

  /**
   * Derive ATI pillars from agent metrics
   */
  static deriveATIPillars(agentData: MultiAgentTrustData): ATIPillars {
    // Precision: Based on citation accuracy and content readiness
    const precision = (
      (agentData.seo.contentReadiness * 0.3 +
       agentData.aeo.contentReadiness * 0.4 +
       agentData.geo.contentReadiness * 0.3) * 0.6 +
      (agentData.seo.citations * 0.3 +
       agentData.aeo.citations * 0.4 +
       agentData.geo.citations * 0.3) * 0.4
    );

    // Consistency: Cross-agent parity
    const seoAvg = (agentData.seo.mentions + agentData.seo.citations) / 2;
    const aeoAvg = (agentData.aeo.mentions + agentData.aeo.citations) / 2;
    const geoAvg = (agentData.geo.mentions + agentData.geo.citations) / 2;
    const mean = (seoAvg + aeoAvg + geoAvg) / 3;
    const variance = (
      Math.pow(seoAvg - mean, 2) +
      Math.pow(aeoAvg - mean, 2) +
      Math.pow(geoAvg - mean, 2)
    ) / 3;
    const consistency = Math.max(0, 100 - Math.sqrt(variance) * 2);

    // Recency: Based on content readiness (fresh content = recent)
    const recency = (
      agentData.seo.contentReadiness * 0.3 +
      agentData.aeo.contentReadiness * 0.4 +
      agentData.geo.contentReadiness * 0.3
    );

    // Authenticity: Based on sentiment and review quality
    const authenticity = (
      agentData.seo.sentiment * 0.3 +
      agentData.aeo.sentiment * 0.4 +
      agentData.geo.sentiment * 0.3
    );

    // Alignment: Based on share of voice (market relevance)
    const alignment = (
      agentData.seo.shareOfVoice * 0.3 +
      agentData.aeo.shareOfVoice * 0.4 +
      agentData.geo.shareOfVoice * 0.3
    ) * 10; // Scale 0-10 to 0-100

    return {
      precision: Math.min(100, Math.max(0, Math.round(precision))),
      consistency: Math.min(100, Math.max(0, Math.round(consistency))),
      recency: Math.min(100, Math.max(0, Math.round(recency))),
      authenticity: Math.min(100, Math.max(0, Math.round(authenticity))),
      alignment: Math.min(100, Math.max(0, Math.round(alignment)))
    };
  }

  /**
   * Convert agent metrics to TrustInput for vertical-specific scoring
   */
  static agentMetricsToTrustInput(agentData: MultiAgentTrustData): TrustInput {
    // E-E-A-T: Weighted average of content readiness and sentiment
    const eeat = (
      (agentData.seo.contentReadiness + agentData.seo.sentiment) * 0.3 +
      (agentData.aeo.contentReadiness + agentData.aeo.sentiment) * 0.4 +
      (agentData.geo.contentReadiness + agentData.geo.sentiment) * 0.3
    ) / 200; // Normalize to 0-1

    // Reputation: Based on sentiment and citations
    const reputation = (
      (agentData.seo.sentiment * 0.3 + agentData.seo.citations * 0.7) * 0.3 +
      (agentData.aeo.sentiment * 0.3 + agentData.aeo.citations * 0.7) * 0.4 +
      (agentData.geo.sentiment * 0.3 + agentData.geo.citations * 0.7) * 0.3
    ) / 100;

    // Technical: Based on content readiness (proxy for technical quality)
    const technical = (
      agentData.seo.contentReadiness * 0.3 +
      agentData.aeo.contentReadiness * 0.4 +
      agentData.geo.contentReadiness * 0.3
    ) / 100;

    // Local Visibility: Based on share of voice
    const localVis = (
      agentData.seo.shareOfVoice * 0.3 +
      agentData.aeo.shareOfVoice * 0.4 +
      agentData.geo.shareOfVoice * 0.3
    ) / 100;

    // Compliance: Based on consistency across agents
    const seoAvg = (agentData.seo.mentions + agentData.seo.citations) / 2;
    const aeoAvg = (agentData.aeo.mentions + agentData.aeo.citations) / 2;
    const geoAvg = (agentData.geo.mentions + agentData.geo.citations) / 2;
    const mean = (seoAvg + aeoAvg + geoAvg) / 3;
    const stdDev = Math.sqrt(
      (Math.pow(seoAvg - mean, 2) + Math.pow(aeoAvg - mean, 2) + Math.pow(geoAvg - mean, 2)) / 3
    );
    const compliance = Math.max(0, 1 - (stdDev / 50)); // Lower std dev = higher compliance

    return {
      eeat: Math.min(1, Math.max(0, eeat)),
      reputation: Math.min(1, Math.max(0, reputation)),
      technical: Math.min(1, Math.max(0, technical)),
      localVis: Math.min(1, Math.max(0, localVis)),
      compliance: Math.min(1, Math.max(0, compliance))
    };
  }

  /**
   * Generate trust recommendations based on analysis
   */
  static generateRecommendations(
    agentData: MultiAgentTrustData,
    atiResult: ATIResult,
    overallTrust: number
  ): { recommendations: string[]; priorityActions: TrustAction[] } {
    const recommendations: string[] = [];
    const actions: TrustAction[] = [];

    // Analyze weakest agent
    const seoTrust = this.calculateAgentTrust(agentData.seo, 'seo');
    const aeoTrust = this.calculateAgentTrust(agentData.aeo, 'aeo');
    const geoTurst = this.calculateAgentTrust(agentData.geo, 'geo');

    const agentScores = [
      { name: 'SEO', score: seoTrust, data: agentData.seo },
      { name: 'AEO', score: aeoTrust, data: agentData.aeo },
      { name: 'GEO', score: geoTrust, data: agentData.geo }
    ];

    const weakestAgent = agentScores.reduce((min, agent) => 
      agent.score < min.score ? agent : min
    );

    // Overall trust recommendations
    if (overallTrust < 70) {
      recommendations.push(`Critical: Overall trust score is ${overallTrust.toFixed(1)}. Focus on improving ${weakestAgent.name} agent performance.`);
      actions.push({
        priority: 'critical',
        category: 'authority',
        action: `Improve ${weakestAgent.name} agent visibility - increase mentions and citations`,
        impact: 85,
        effort: 'high'
      });
    } else if (overallTrust < 80) {
      recommendations.push(`Good progress. ${weakestAgent.name} agent needs attention (${weakestAgent.score.toFixed(1)}).`);
      actions.push({
        priority: 'high',
        category: 'expertise',
        action: `Enhance ${weakestAgent.name} content readiness and citation quality`,
        impact: 70,
        effort: 'medium'
      });
    }

    // ATI pillar recommendations
    const weakestPillar = Object.entries(atiResult).reduce((min, [key, value]) => {
      if (key === 'ati' || key === 'grade' || key === 'recommendation') return min;
      return (value as number) < (min.value as number) 
        ? { key, value } 
        : min;
    }, { key: 'precision', value: 100 });

    if ((weakestPillar.value as number) < 70) {
      recommendations.push(`ATI ${weakestPillar.key} pillar is weak (${(weakestPillar.value as number).toFixed(1)}). ${atiResult.recommendation}`);
      actions.push({
        priority: (weakestPillar.value as number) < 60 ? 'critical' : 'high',
        category: weakestPillar.key as TrustAction['category'],
        action: `Strengthen ${weakestPillar.key} trust signals`,
        impact: 75,
        effort: 'medium'
      });
    }

    // Agent-specific recommendations
    if (agentData.aeo.mentions < 70) {
      recommendations.push('AEO agent: Low AI platform mentions. Optimize for ChatGPT, Claude, Perplexity visibility.');
      actions.push({
        priority: 'high',
        category: 'freshness',
        action: 'Increase AI platform mentions through structured data and content optimization',
        impact: 80,
        effort: 'medium'
      });
    }

    if (agentData.seo.citations < 50) {
      recommendations.push('SEO agent: Low citation count. Build authoritative backlinks and improve domain authority.');
      actions.push({
        priority: 'high',
        category: 'authority',
        action: 'Build high-quality backlinks from automotive industry sites',
        impact: 75,
        effort: 'high'
      });
    }

    if (agentData.geo.shareOfVoice < 10) {
      recommendations.push('GEO agent: Low local market share. Improve local SEO and geographic targeting.');
      actions.push({
        priority: 'medium',
        category: 'alignment',
        action: 'Enhance local SEO signals and geographic content optimization',
        impact: 65,
        effort: 'medium'
      });
    }

    // Sort actions by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return { recommendations, priorityActions: actions.slice(0, 5) };
  }

  /**
   * Calculate complete trust engine result
   */
  static calculateTrust(
    agentData: MultiAgentTrustData,
    vertical: Vertical = 'acquisition',
    framework?: AlgorithmicFramework
  ): TrustEngineResult {
    // Calculate core scores
    const overallTrust = this.calculateOverallTrust(agentData);
    const aiv = this.calculateAIV(agentData);
    
    // Derive ATI pillars and calculate ATI
    const pillars = this.deriveATIPillars(agentData);
    const atiResult = calculateATIResult(pillars);
    
    // Calculate agent-specific trust scores
    const seoTrust = this.calculateAgentTrust(agentData.seo, 'seo');
    const aeoTrust = this.calculateAgentTrust(agentData.aeo, 'aeo');
    const geoTrust = this.calculateAgentTrust(agentData.geo, 'geo');
    
    // Calculate CRS (Composite Reputation Score)
    const crs = (aiv * 0.6 + atiResult.ati * 0.4);
    
    // Calculate confidence based on consistency
    const agentScores = [seoTrust, aeoTrust, geoTrust];
    const mean = agentScores.reduce((a, b) => a + b, 0) / agentScores.length;
    const variance = agentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / agentScores.length;
    const confidence = Math.max(0, Math.min(1, 1 - (Math.sqrt(variance) / 50)));
    
    // Generate recommendations
    const { recommendations, priorityActions } = this.generateRecommendations(
      agentData,
      atiResult,
      overallTrust
    );
    
    return {
      overallTrust,
      ati: atiResult.ati,
      aiv,
      seoTrust,
      aeoTrust,
      geoTrust,
      crs: Math.round(crs * 10) / 10,
      confidence: Math.round(confidence * 1000) / 1000,
      pillars,
      framework: framework || null,
      recommendations,
      priorityActions,
      vertical,
      timestamp: new Date()
    };
  }

  /**
   * Validate agent metrics
   */
  static validateAgentMetrics(metrics: AgentTrustMetrics): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (metrics.mentions < 0 || metrics.mentions > 100) {
      errors.push(`mentions must be between 0 and 100 (got ${metrics.mentions})`);
    }
    if (metrics.citations < 0 || metrics.citations > 100) {
      errors.push(`citations must be between 0 and 100 (got ${metrics.citations})`);
    }
    if (metrics.sentiment < 0 || metrics.sentiment > 100) {
      errors.push(`sentiment must be between 0 and 100 (got ${metrics.sentiment})`);
    }
    if (metrics.contentReadiness < 0 || metrics.contentReadiness > 100) {
      errors.push(`contentReadiness must be between 0 and 100 (got ${metrics.contentReadiness})`);
    }
    if (metrics.shareOfVoice < 0 || metrics.shareOfVoice > 100) {
      errors.push(`shareOfVoice must be between 0 and 100 (got ${metrics.shareOfVoice})`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

/**
 * Quick trust calculation from multi-agent data
 */
export function calculateTrust(
  agentData: MultiAgentTrustData,
  vertical?: Vertical
): TrustEngineResult {
  return TrustEngine.calculateTrust(agentData, vertical);
}

/**
 * Calculate trust for a single agent
 */
export function calculateAgentTrust(
  metrics: AgentTrustMetrics,
  agentType: 'seo' | 'aeo' | 'geo'
): number {
  return TrustEngine.calculateAgentTrust(metrics, agentType);
}

/**
 * Validate multi-agent trust data
 */
export function validateMultiAgentData(data: MultiAgentTrustData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  ['seo', 'aeo', 'geo'].forEach(agent => {
    const validation = TrustEngine.validateAgentMetrics(data[agent as keyof MultiAgentTrustData] as AgentTrustMetrics);
    if (!validation.valid) {
      errors.push(`${agent.toUpperCase()} agent: ${validation.errors.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

