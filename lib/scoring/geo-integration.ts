// GEO Integration for AIV and RaR Models
// DealershipAI - GEO readiness scoring integration

import { db } from "@/db";
import { sql } from "drizzle-orm";

export interface GeoSignals {
  geoChecklistScore: number;
  aioExposurePct: number;
  topicalDepthScore: number;
  kgPresent: boolean;
  kgCompleteness: number;
  mentionVelocity4w: number;
  extractabilityScore: number;
}

export interface AIVInputs {
  seoScore: number;
  technicalScore: number;
  contentScore: number;
  citationScore: number;
  geoScore?: number; // New GEO component
}

export interface RaRInputs {
  relevanceScore: number;
  authorityScore: number;
  trustScore: number;
  geoScore?: number; // New GEO component
}

/**
 * Fetch latest GEO signals for a tenant
 */
export async function getLatestGeoSignals(tenantId: string): Promise<GeoSignals | null> {
  try {
    const query = await db.execute(sql`
      SELECT 
        geo_checklist_score,
        aio_exposure_pct,
        topical_depth_score,
        kg_present,
        kg_completeness,
        mention_velocity_4w,
        extractability_score
      FROM geo_signals
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = (query as any).rows?.[0];
    if (!row) return null;

    return {
      geoChecklistScore: Number(row.geo_checklist_score) || 0,
      aioExposurePct: Number(row.aio_exposure_pct) || 0,
      topicalDepthScore: Number(row.topical_depth_score) || 0,
      kgPresent: Boolean(row.kg_present),
      kgCompleteness: Number(row.kg_completeness) || 0,
      mentionVelocity4w: Number(row.mention_velocity_4w) || 0,
      extractabilityScore: Number(row.extractability_score) || 0
    };
  } catch (error) {
    console.error("Error fetching GEO signals:", error);
    return null;
  }
}

/**
 * Calculate GEO readiness score from signals
 */
export function calculateGeoScore(signals: GeoSignals): number {
  const {
    geoChecklistScore,
    aioExposurePct,
    topicalDepthScore,
    kgPresent,
    kgCompleteness,
    mentionVelocity4w,
    extractabilityScore
  } = signals;

  // Weighted scoring algorithm
  const weights = {
    checklist: 0.25,      // 25% - Basic GEO readiness
    aioExposure: 0.20,    // 20% - AI optimization exposure
    topicalDepth: 0.15,   // 15% - Content depth
    kgPresence: 0.15,     // 15% - Knowledge graph presence
    kgCompleteness: 0.10, // 10% - Knowledge graph completeness
    mentionVelocity: 0.10, // 10% - Mention velocity
    extractability: 0.05  // 5% - Content extractability
  };

  // Normalize scores to 0-100 range
  const normalizedScores = {
    checklist: geoChecklistScore,
    aioExposure: aioExposurePct,
    topicalDepth: topicalDepthScore,
    kgPresence: kgPresent ? 100 : 0,
    kgCompleteness: kgCompleteness,
    mentionVelocity: Math.min(100, (mentionVelocity4w / 50) * 100), // Cap at 50 mentions = 100%
    extractability: extractabilityScore
  };

  // Calculate weighted average
  const geoScore = Object.entries(weights).reduce((score, [key, weight]) => {
    const normalizedScore = normalizedScores[key as keyof typeof normalizedScores];
    return score + (normalizedScore * weight);
  }, 0);

  return Math.round(geoScore);
}

/**
 * Integrate GEO score into AIV calculation
 */
export function integrateGeoIntoAIV(baseAIV: AIVInputs, geoScore: number): number {
  const geoWeight = 0.15; // 15% weight for GEO component
  
  // Calculate base AIV without GEO
  const baseScore = (
    baseAIV.seoScore * 0.30 +
    baseAIV.technicalScore * 0.25 +
    baseAIV.contentScore * 0.25 +
    baseAIV.citationScore * 0.20
  );

  // Integrate GEO score
  const geoAdjustedScore = baseScore * (1 - geoWeight) + geoScore * geoWeight;
  
  return Math.min(100, Math.max(0, geoAdjustedScore));
}

/**
 * Integrate GEO score into RaR calculation
 */
export function integrateGeoIntoRaR(baseRaR: RaRInputs, geoScore: number): number {
  const geoWeight = 0.20; // 20% weight for GEO component in RaR
  
  // Calculate base RaR without GEO
  const baseScore = (
    baseRaR.relevanceScore * 0.40 +
    baseRaR.authorityScore * 0.30 +
    baseRaR.trustScore * 0.30
  );

  // Integrate GEO score
  const geoAdjustedScore = baseScore * (1 - geoWeight) + geoScore * geoWeight;
  
  return Math.min(100, Math.max(0, geoAdjustedScore));
}

/**
 * Get GEO readiness recommendations based on signals
 */
export function getGeoRecommendations(signals: GeoSignals): string[] {
  const recommendations: string[] = [];

  if (signals.geoChecklistScore < 70) {
    recommendations.push("Complete GEO readiness checklist - focus on local business optimization");
  }

  if (signals.aioExposurePct < 30) {
    recommendations.push("Increase AI optimization exposure - add structured data and semantic markup");
  }

  if (signals.topicalDepthScore < 60) {
    recommendations.push("Improve topical depth - create more comprehensive content around local topics");
  }

  if (!signals.kgPresent) {
    recommendations.push("Enable knowledge graph presence - add business entity markup and local citations");
  }

  if (signals.kgCompleteness < 80) {
    recommendations.push("Complete knowledge graph profile - add missing business information and attributes");
  }

  if (signals.mentionVelocity4w < 10) {
    recommendations.push("Increase mention velocity - engage with local communities and media");
  }

  if (signals.extractabilityScore < 70) {
    recommendations.push("Improve content extractability - use clear headings and structured content");
  }

  return recommendations;
}

/**
 * Calculate GEO impact on overall AIV
 */
export function calculateGeoImpact(tenantId: string, currentAIV: number): Promise<{
  geoScore: number;
  geoAdjustedAIV: number;
  impact: number;
  recommendations: string[];
}> {
  return getLatestGeoSignals(tenantId).then(signals => {
    if (!signals) {
      return {
        geoScore: 0,
        geoAdjustedAIV: currentAIV,
        impact: 0,
        recommendations: ["No GEO signals available - run GEO analysis to get started"]
      };
    }

    const geoScore = calculateGeoScore(signals);
    const geoAdjustedAIV = integrateGeoIntoAIV({
      seoScore: currentAIV * 0.3,
      technicalScore: currentAIV * 0.25,
      contentScore: currentAIV * 0.25,
      citationScore: currentAIV * 0.2
    }, geoScore);

    const impact = geoAdjustedAIV - currentAIV;
    const recommendations = getGeoRecommendations(signals);

    return {
      geoScore,
      geoAdjustedAIV,
      impact,
      recommendations
    };
  });
}
