// SEO Types
// DealershipAI - Type definitions for SEO system

export interface SeoVariant {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  content: string;
  jsonLd?: any;
  metadata?: Record<string, any>;
}

export interface SeoMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cvr: number;
  rpc: number; // Revenue per click
}

export interface SeoPrior {
  variantId: string;
  a: number; // Alpha parameter for Beta distribution
  b: number; // Beta parameter for Beta distribution
  updatedAt: Date;
}

export interface AllocationResult {
  variantId: string;
  trafficAllocation: number;
  confidence: number;
  expectedValue: number;
}

export interface SeoGenerationRequest {
  productId: string;
  productData: {
    name: string;
    description: string;
    price: number;
    availability: boolean;
    images: string[];
    specifications: Record<string, any>;
    features: string[];
    category: string;
    brand: string;
    model: string;
    year?: number;
    mileage?: number;
    condition: 'new' | 'used' | 'certified';
  };
  variants: SeoVariant[];
  targetKeywords: string[];
  brandVoice?: {
    tone: 'professional' | 'casual' | 'friendly' | 'authoritative';
    style: 'concise' | 'detailed' | 'conversational';
    focus: 'features' | 'benefits' | 'value' | 'emotion';
  };
  locale?: string;
  market?: string;
}

export interface SeoGenerationResponse {
  variants: SeoVariant[];
  causalId: string;
  cacheKey: string;
  generatedAt: Date;
  metadata: {
    processingTime: number;
    cacheHit: boolean;
    variantCount: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  severity: number; // 1-10
  fixable: boolean;
}

export interface MetricsUpdate {
  variantId: string;
  productId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  causalId?: string;
  timestamp: Date;
}

export interface QueryOptions {
  variantId?: string;
  productId?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy: 'day' | 'week' | 'month';
  format: 'json' | 'csv';
  includeCI?: boolean;
  confidenceLevel?: 90 | 95 | 99;
}

export interface AggregatedMetrics {
  period: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cvr: number;
  rpc: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
    level: number;
  };
}

export interface AIScores {
  ati: number; // Algorithmic Trust Index
  clarity: number; // Content clarity score
  relevance: number; // Keyword relevance
  authority: number; // Domain authority
  freshness: number; // Content freshness
  engagement: number; // User engagement score
}

export interface HonestyCheck {
  isHonest: boolean;
  score: number;
  violations: HonestyViolation[];
  recommendations: string[];
}

export interface HonestyViolation {
  type: 'price' | 'availability' | 'condition' | 'features' | 'warranty';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string;
  fixable: boolean;
}

export interface ZeroClickOpportunity {
  query: string;
  currentPosition: number;
  zeroClickRate: number;
  potentialUplift: number;
  effort: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface JSONLDSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}