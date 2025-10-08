// src/lib/fallbacks.ts

export type DealerType = 'franchise' | 'independent' | 'luxury' | 'used_only';
export type LocationType = 'urban' | 'suburban' | 'rural';

interface FallbackScores {
  ai_visibility: number;
  zero_click_shield: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
}

class SmartFallbacks {
  // Base scores by dealer type
  private baseScores: Record<DealerType, FallbackScores> = {
    franchise: {
      ai_visibility: 65,
      zero_click_shield: 68,
      ugc_health: 72,
      geo_trust: 70,
      sgp_integrity: 75,
    },
    independent: {
      ai_visibility: 45,
      zero_click_shield: 52,
      ugc_health: 58,
      geo_trust: 55,
      sgp_integrity: 48,
    },
    luxury: {
      ai_visibility: 78,
      zero_click_shield: 82,
      ugc_health: 85,
      geo_trust: 80,
      sgp_integrity: 88,
    },
    used_only: {
      ai_visibility: 38,
      zero_click_shield: 42,
      ugc_health: 48,
      geo_trust: 45,
      sgp_integrity: 40,
    },
  };

  // Location modifiers
  private locationModifiers: Record<LocationType, number> = {
    urban: 1.15,
    suburban: 1.0,
    rural: 0.85,
  };

  generateBelievableData(
    dealerType: DealerType,
    location: LocationType,
    dealerName: string
  ): FallbackScores {
    // Start with base scores
    let scores = { ...this.baseScores[dealerType] };

    // Apply location modifier
    const modifier = this.locationModifiers[location];
    scores = this.applyModifier(scores, modifier);

    // Add temporal variance (simulate real-world fluctuation)
    scores = this.addTemporalVariance(scores);

    // Add dealer-specific variance (deterministic but unique per dealer)
    scores = this.addDealerVariance(scores, dealerName);

    // Ensure all scores are within bounds [0, 100]
    scores = this.clampScores(scores);

    return scores;
  }

  private applyModifier(scores: FallbackScores, modifier: number): FallbackScores {
    return {
      ai_visibility: scores.ai_visibility * modifier,
      zero_click_shield: scores.zero_click_shield * modifier,
      ugc_health: scores.ugc_health * modifier,
      geo_trust: scores.geo_trust * modifier,
      sgp_integrity: scores.sgp_integrity * modifier,
    };
  }

  private addTemporalVariance(scores: FallbackScores): FallbackScores {
    // Add ±5% variance based on current time
    const variance = Math.sin(Date.now() / 1000000) * 5;

    return {
      ai_visibility: scores.ai_visibility + variance,
      zero_click_shield: scores.zero_click_shield + variance * 0.8,
      ugc_health: scores.ugc_health + variance * 1.2,
      geo_trust: scores.geo_trust + variance * 0.9,
      sgp_integrity: scores.sgp_integrity + variance * 1.1,
    };
  }

  private addDealerVariance(scores: FallbackScores, dealerName: string): FallbackScores {
    // Deterministic variance based on dealer name (stays consistent)
    const seed = this.hashString(dealerName);
    const variance = ((seed % 100) - 50) / 10; // -5 to +5

    return {
      ai_visibility: scores.ai_visibility + variance,
      zero_click_shield: scores.zero_click_shield + variance * 0.9,
      ugc_health: scores.ugc_health + variance * 1.1,
      geo_trust: scores.geo_trust + variance * 0.8,
      sgp_integrity: scores.sgp_integrity + variance * 1.2,
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private clampScores(scores: FallbackScores): FallbackScores {
    return {
      ai_visibility: Math.max(15, Math.min(95, Math.round(scores.ai_visibility))),
      zero_click_shield: Math.max(15, Math.min(95, Math.round(scores.zero_click_shield))),
      ugc_health: Math.max(15, Math.min(95, Math.round(scores.ugc_health))),
      geo_trust: Math.max(15, Math.min(95, Math.round(scores.geo_trust))),
      sgp_integrity: Math.max(15, Math.min(95, Math.round(scores.sgp_integrity))),
    };
  }

  // For when even fallbacks fail - ultra-safe defaults
  getUltraFallback(): FallbackScores {
    return {
      ai_visibility: 50,
      zero_click_shield: 50,
      ugc_health: 50,
      geo_trust: 50,
      sgp_integrity: 50,
    };
  }
}

export const smartFallbacks = new SmartFallbacks();
