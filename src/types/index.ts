/**
 * Centralized Type Definitions
 * Replaces any/unknown types with proper TypeScript types
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User and Authentication Types
export interface User {
  id: string;
  clerkId: string;
  tenantId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type UserRole = 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';

export interface Tenant {
  id: string;
  name: string;
  type: 'enterprise' | 'dealership' | 'single';
  parentId?: string;
  domain?: string;
  city?: string;
  state?: string;
  establishedDate?: string;
  tier: number;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Dealership Types
export interface Dealership {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  websiteUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  brand?: string;
  tier?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Scoring Types
export interface DealershipScores {
  aiVisibility: number;
  zeroClick: number;
  ugcHealth: number;
  geoTrust: number;
  sgpIntegrity: number;
  overall: number;
  timestamp: string;
}

export interface DetailedDealershipScores extends DealershipScores {
  details: {
    sgp: ScoreDetails;
    zeroClick: ScoreDetails;
    geo: ScoreDetails;
    ugc: ScoreDetails;
    ai: ScoreDetails;
  };
}

export interface ScoreDetails {
  score: number;
  components: Record<string, number>;
  confidence: number;
  details: Record<string, any>;
}

// Audit Types
export interface AuditStatus {
  pending: 'pending';
  processing: 'processing';
  completed: 'completed';
  failed: 'failed';
}

export type AuditStatusType = keyof AuditStatus;

export interface AIVisibilityAudit {
  id: string;
  dealershipId: string;
  tenantId: string;
  status: AuditStatusType;
  aiVisibilityScore?: number;
  zeroClickScore?: number;
  ugcHealthScore?: number;
  geoTrustScore?: number;
  sgpIntegrityScore?: number;
  overallScore?: number;
  authorityScore?: number;
  expertiseScore?: number;
  experienceScore?: number;
  transparencyScore?: number;
  consistencyScore?: number;
  freshnessScore?: number;
  overallTrustScore?: number;
  auditData?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Optimization Types
export interface OptimizationRecommendation {
  id: string;
  dealershipId: string;
  tenantId: string;
  auditId: string;
  actionableWin: string;
  opportunity: string;
  score: number;
  explanation: string;
  priority: OptimizationPriority;
  category: string;
  implementation: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  createdAt: string;
  updatedAt: string;
}

export type OptimizationPriority = 'low' | 'medium' | 'high' | 'critical';

// Analytics Types
export interface AnalyticsData {
  rowCount: number;
  rows: AnalyticsRow[];
  metadata: {
    propertyId: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    requestedAt: string;
  };
}

export interface AnalyticsRow {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  name: string;
  brand: string;
  city: string;
  state: string;
  tier: string;
  visibilityScore: number;
  totalMentions: number;
  avgRank: number;
  sentimentScore: number;
  totalCitations: number;
  scanDate: string;
  rank: number;
  scoreChange: number;
  percentChange: number;
}

export interface LeaderboardSummary {
  totalDealers: number;
  avgVisibilityScore: number;
  totalMentions: number;
  avgSentiment: number;
  scanDate: string;
}

export interface LeaderboardDistributions {
  tier: Record<string, number>;
  brand: Record<string, number>;
  state: Record<string, number>;
}

export interface LeaderboardHighlights {
  topPerformers: LeaderboardEntry[];
  biggestGainers: LeaderboardEntry[];
  biggestLosers: LeaderboardEntry[];
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  summary: LeaderboardSummary;
  distributions: LeaderboardDistributions;
  highlights: LeaderboardHighlights;
  filtersApplied: LeaderboardFilters;
}

export interface LeaderboardFilters {
  limit: number;
  tier?: string;
  state?: string;
  brand?: string;
  sortBy: 'visibility_score' | 'total_mentions' | 'avg_rank' | 'sentiment_score' | 'total_citations';
  sortOrder: 'asc' | 'desc';
  tenantId?: string;
}

// Cost Monitoring Types
export interface CostMetrics {
  totalCost: number;
  costByPlatform: Record<string, number>;
  costByMonth: Record<string, number>;
  averageCostPerDealer: number;
  averageCostPerScan: number;
  tokenUsage: {
    total: number;
    byPlatform: Record<string, number>;
  };
}

export interface OptimizationRecommendation {
  type: 'batch_size' | 'model_selection' | 'query_optimization' | 'caching';
  title: string;
  description: string;
  potentialSavings: number;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

// Error Types
export interface AppError extends Error {
  code: string;
  statusCode: number;
  context?: Record<string, any>;
  isOperational: boolean;
}

export interface ErrorAlert {
  id: string;
  timestamp: Date;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  message: string;
  context: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
}

// Performance Types
export interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

export interface WebVitals {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
}

export interface PerformanceReport {
  webVitals: WebVitals;
  customMetrics: Record<string, number>;
  userAgent: string;
  connection: string;
  timestamp: number;
  url: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: string | number | boolean | string[];
}

// API Client Types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Cache Types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idle: number;
  };
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  fields: Array<{
    name: string;
    dataTypeID: number;
  }>;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  tenantId?: string;
}

export interface EventHandler<T = any> {
  (event: AppEvent & { payload: T }): void | Promise<void>;
}

// Configuration Types
export interface AppConfig {
  database: DatabaseConfig;
  redis: {
    url: string;
    password?: string;
  };
  auth: {
    clerk: {
      publishableKey: string;
      secretKey: string;
    };
  };
  ai: {
    openai: {
      apiKey: string;
    };
    anthropic: {
      apiKey: string;
    };
    google: {
      apiKey: string;
    };
  };
  monitoring: {
    sentry: {
      dsn: string;
    };
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

// Generic Types
export type ID = string;
export type Timestamp = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// API Route Types
export interface RouteHandler {
  (request: Request, context?: any): Promise<Response>;
}

export interface Middleware {
  (request: Request, next: () => Promise<Response>): Promise<Response>;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Export all types
export * from './user';
