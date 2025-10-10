/**
 * Complete Training Context for HyperAIV Model Optimization
 * Structured examples of inputs, intermediate signals, and validated ground truth outputs
 */

export interface AIVPillarData {
  dealership_id: string;
  week: string;
  seo_score: number;
  aeo_score: number;
  geo_score: number;
  ugc_score: number;
  geolocal_score: number;
  timestamp: string;
}

export interface ObservedAIVisibility {
  dealership_id: string;
  engine: 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | 'copilot' | 'grok';
  query: string;
  inclusion_frequency: number;
  rank_position?: number;
  citation_type: 'direct' | 'reference' | 'snippet' | 'overview';
  timestamp: string;
}

export interface RevenueTruthData {
  dealership_id: string;
  predicted_revenue: number;
  actual_revenue: number;
  aiv_score: number;
  elasticity_usd_per_pt: number;
  month: string;
  attribution_window_days: number;
}

export interface SchemaChangeLog {
  dealership_id: string;
  change_type: 'structured_data' | 'review_update' | 'gbp_update' | 'schema_markup';
  timestamp: string;
  change_details: any;
  ai_overview_inclusion_time?: string;
  latency_hours?: number;
}

export interface RegionalMetadata {
  region: string;
  locale: string;
  engine_mix: {
    google: number;
    bing: number;
    other: number;
  };
  review_source_weights: {
    google_reviews: number;
    yelp: number;
    dealer_rater: number;
    cars_com: number;
    autotrader: number;
  };
  market_characteristics: {
    competition_level: 'low' | 'medium' | 'high';
    seasonal_factor: number;
    brand_dominance: string[];
  };
}

export interface TrainingDataset {
  aiv_pillars: AIVPillarData[];
  observed_visibility: ObservedAIVisibility[];
  revenue_truth: RevenueTruthData[];
  schema_changes: SchemaChangeLog[];
  regional_metadata: RegionalMetadata[];
}

/**
 * Generate comprehensive training context examples
 */
export function generateTrainingContext(): TrainingDataset {
  return {
    aiv_pillars: [
      {
        dealership_id: "naplesfordfl",
        week: "2024-01-15",
        seo_score: 78.5,
        aeo_score: 82.3,
        geo_score: 85.1,
        ugc_score: 79.8,
        geolocal_score: 83.2,
        timestamp: "2024-01-15T00:00:00Z"
      },
      {
        dealership_id: "naplesfordfl",
        week: "2024-01-22",
        seo_score: 79.2,
        aeo_score: 83.1,
        geo_score: 86.4,
        ugc_score: 80.5,
        geolocal_score: 84.1,
        timestamp: "2024-01-22T00:00:00Z"
      },
      {
        dealership_id: "naplesfordfl",
        week: "2024-01-29",
        seo_score: 80.1,
        aeo_score: 84.2,
        geo_score: 87.3,
        ugc_score: 81.2,
        geolocal_score: 85.0,
        timestamp: "2024-01-29T00:00:00Z"
      }
    ],
    observed_visibility: [
      {
        dealership_id: "naplesfordfl",
        engine: "chatgpt",
        query: "best Ford dealer near Naples Florida",
        inclusion_frequency: 0.85,
        rank_position: 2,
        citation_type: "direct",
        timestamp: "2024-01-15T10:30:00Z"
      },
      {
        dealership_id: "naplesfordfl",
        engine: "gemini",
        query: "Ford dealership Naples FL reviews",
        inclusion_frequency: 0.72,
        rank_position: 3,
        citation_type: "reference",
        timestamp: "2024-01-15T14:20:00Z"
      },
      {
        dealership_id: "naplesfordfl",
        engine: "perplexity",
        query: "Naples Ford dealer inventory",
        inclusion_frequency: 0.68,
        rank_position: 4,
        citation_type: "snippet",
        timestamp: "2024-01-15T16:45:00Z"
      }
    ],
    revenue_truth: [
      {
        dealership_id: "naplesfordfl",
        predicted_revenue: 125000,
        actual_revenue: 128500,
        aiv_score: 84.2,
        elasticity_usd_per_pt: 125.50,
        month: "2024-01",
        attribution_window_days: 30
      },
      {
        dealership_id: "naplesfordfl",
        predicted_revenue: 132000,
        actual_revenue: 135200,
        aiv_score: 85.8,
        elasticity_usd_per_pt: 127.30,
        month: "2024-02",
        attribution_window_days: 30
      }
    ],
    schema_changes: [
      {
        dealership_id: "naplesfordfl",
        change_type: "structured_data",
        timestamp: "2024-01-10T09:00:00Z",
        change_details: {
          schema_type: "LocalBusiness",
          fields_updated: ["name", "address", "phone", "hours"],
          validation_status: "valid"
        },
        ai_overview_inclusion_time: "2024-01-12T14:30:00Z",
        latency_hours: 53.5
      },
      {
        dealership_id: "naplesfordfl",
        change_type: "review_update",
        timestamp: "2024-01-15T11:20:00Z",
        change_details: {
          new_reviews: 12,
          average_rating_change: 0.2,
          total_reviews: 847
        },
        ai_overview_inclusion_time: "2024-01-17T08:15:00Z",
        latency_hours: 44.9
      }
    ],
    regional_metadata: [
      {
        region: "southwest_florida",
        locale: "en-US",
        engine_mix: {
          google: 0.65,
          bing: 0.20,
          other: 0.15
        },
        review_source_weights: {
          google_reviews: 0.45,
          yelp: 0.32,
          dealer_rater: 0.18,
          cars_com: 0.03,
          autotrader: 0.02
        },
        market_characteristics: {
          competition_level: "high",
          seasonal_factor: 1.15,
          brand_dominance: ["Ford", "Chevrolet", "Toyota", "Honda"]
        }
      }
    ]
  };
}

/**
 * Calculate regression coefficients from training data
 */
export function calculateRegressionCoefficients(dataset: TrainingDataset): {
  aiv_to_visibility: number;
  visibility_to_revenue: number;
  schema_impact: number;
  regional_adjustment: number;
} {
  // Simulate regression calculations based on training data
  const aivScores = dataset.aiv_pillars.map(p => (p.seo_score + p.aeo_score + p.geo_score + p.ugc_score + p.geolocal_score) / 5);
  const visibilityScores = dataset.observed_visibility.map(v => v.inclusion_frequency);
  const revenueData = dataset.revenue_truth;
  
  // Calculate AIV to visibility correlation
  const aivToVisibility = calculateCorrelation(aivScores, visibilityScores);
  
  // Calculate visibility to revenue correlation
  const visibilityToRevenue = calculateCorrelation(
    visibilityScores,
    revenueData.map(r => r.actual_revenue)
  );
  
  // Calculate schema impact (latency reduction effect)
  const avgLatency = dataset.schema_changes.reduce((sum, s) => sum + (s.latency_hours || 0), 0) / dataset.schema_changes.length;
  const schemaImpact = Math.max(0, 1 - (avgLatency / 72)); // Normalize to 72-hour baseline
  
  // Calculate regional adjustment factor
  const regionalFactor = dataset.regional_metadata[0]?.market_characteristics.seasonal_factor || 1.0;
  
  return {
    aiv_to_visibility: aivToVisibility,
    visibility_to_revenue: visibilityToRevenue,
    schema_impact: schemaImpact,
    regional_adjustment: regionalFactor
  };
}

/**
 * Calculate correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((s, xi) => s + xi, 0);
  const sumY = y.reduce((s, yi) => s + yi, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumXX = x.reduce((s, xi) => s + xi * xi, 0);
  const sumYY = y.reduce((s, yi) => s + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate confidence intervals for predictions
 */
export function generateConfidenceIntervals(
  predictions: number[],
  actuals: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number }[] {
  const residuals = predictions.map((pred, i) => actuals[i] - pred);
  const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
  const variance = residuals.reduce((sum, r) => sum + Math.pow(r - meanResidual, 2), 0) / (residuals.length - 1);
  const standardError = Math.sqrt(variance);
  
  // Z-score for confidence level
  const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.645;
  
  return predictions.map(pred => ({
    lower: Math.max(0, pred - zScore * standardError),
    upper: Math.min(100, pred + zScore * standardError)
  }));
}

/**
 * Export training context to JSON format
 */
export function exportTrainingContext(dataset: TrainingDataset): string {
  return JSON.stringify(dataset, null, 2);
}

/**
 * Import training context from JSON
 */
export function importTrainingContext(jsonData: string): TrainingDataset {
  return JSON.parse(jsonData) as TrainingDataset;
}
