export interface AIVMetrics {
  dealer_id: string;
  aiv_score: number;
  ati_score: number;
  crs_score: number;
  elasticity_usd_per_pt: number;
  r2_coefficient: number;
  timestamp: string;
  metadata?: {
    query_count?: number;
    confidence_score?: number;
    last_updated?: string;
    recommendations?: string[];
  };
}

export interface HistoricalPoint {
  aiv: number;
  ati: number;
  crs: number;
  elasticity_usd_per_pt: number;
  r2: number;
  timestamp: string;
}

export interface ElasticityData {
  dealer_id: string;
  elasticity_usd_per_pt: number;
  r2_coefficient: number;
  sample_size: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  last_calculated: string;
}

export interface GPTResponse {
  aiv: number;
  ati: number;
  crs: number;
  elasticity_usd_per_pt: number;
  r2: number;
  recommendations: string[];
  confidence_score?: number;
  query_count?: number;
}

export interface GPTProxyRequest {
  prompt: string;
  dealerId?: string;
  context?: {
    market?: string;
    brand?: string;
    previous_scores?: Partial<AIVMetrics>;
  };
}

export interface GPTProxyResponse {
  success: boolean;
  data?: GPTResponse;
  error?: string;
  processing_time_ms?: number;
}

// Type guards for validation
export function isAIVMetrics(obj: any): obj is AIVMetrics {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.dealer_id === 'string' &&
    typeof obj.aiv_score === 'number' &&
    typeof obj.ati_score === 'number' &&
    typeof obj.crs_score === 'number' &&
    typeof obj.elasticity_usd_per_pt === 'number' &&
    typeof obj.r2_coefficient === 'number' &&
    typeof obj.timestamp === 'string'
  );
}

export function isGPTResponse(obj: any): obj is GPTResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.aiv === 'number' &&
    typeof obj.ati === 'number' &&
    typeof obj.crs === 'number' &&
    typeof obj.elasticity_usd_per_pt === 'number' &&
    typeof obj.r2 === 'number' &&
    Array.isArray(obj.recommendations)
  );
}

export function isElasticityData(obj: any): obj is ElasticityData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.dealer_id === 'string' &&
    typeof obj.elasticity_usd_per_pt === 'number' &&
    typeof obj.r2_coefficient === 'number' &&
    typeof obj.sample_size === 'number' &&
    typeof obj.confidence_interval === 'object' &&
    typeof obj.confidence_interval.lower === 'number' &&
    typeof obj.confidence_interval.upper === 'number' &&
    typeof obj.last_calculated === 'string'
  );
}
