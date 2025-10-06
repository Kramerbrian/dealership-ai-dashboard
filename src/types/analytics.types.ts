export interface DealershipAnalytics {
  dealershipId: string;
  dealershipName: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    aiVisibility: AIVisibilityMetrics;
    sales: SalesMetrics;
    service: ServiceMetrics;
    marketing: MarketingMetrics;
    competitors: CompetitorAnalysis;
    threats: ThreatAnalysis;
  };
  generatedAt: Date;
}

export interface AIVisibilityMetrics {
  overallScore: number; // 0-100
  platformScores: {
    chatgpt: number;
    claude: number;
    gemini: number;
    perplexity: number;
    copilot: number;
    grok: number;
  };
  invisiblePercentage: number;
  monthlyLossRisk: number;
  sovPercentage: number; // Share of Voice
  mentionCount: number;
  recommendationRate: number;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageDealValue: number;
  conversionRate: number;
  leadCount: number;
  closingRate: number;
  topSellingModels: Array<{
    model: string;
    units: number;
    revenue: number;
  }>;
  salesBySource: Array<{
    source: string;
    count: number;
    revenue: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
}

export interface ServiceMetrics {
  totalServices: number;
  revenue: number;
  customerSatisfaction: number;
  averageRepairTime: number;
  repeatCustomerRate: number;
  serviceCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
}

export interface MarketingMetrics {
  websiteTraffic: number;
  uniqueVisitors: number;
  conversionRate: number;
  bounceRate: number;
  averageSessionDuration: number;
  leadGenerationCost: number;
  roi: number;
  campaignPerformance: Array<{
    campaignName: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roi: number;
  }>;
  socialMediaEngagement: {
    followers: number;
    engagementRate: number;
    posts: number;
  };
}

export interface CompetitorAnalysis {
  marketPosition: number;
  totalCompetitors: number;
  topCompetitors: Array<{
    name: string;
    visibilityScore: number;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  competitiveAdvantages: string[];
  competitiveThreats: string[];
}

export interface ThreatAnalysis {
  riskScore: number; // 0-100
  threats: Array<{
    category: 'AI Search' | 'Zero-Click' | 'UGC/Reviews' | 'Local SEO' | 'Competition';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    impact: string;
    description: string;
    recommendations: string[];
  }>;
}

export interface AnalyticsQuery {
  dealershipId?: string;
  startDate?: string;
  endDate?: string;
  metrics?: string[]; // Which metrics to include
  format?: 'json' | 'csv' | 'pdf';
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  compareWithPrevious?: boolean;
}

export interface AnalyticsExportRequest {
  dealershipId: string;
  format: 'csv' | 'pdf' | 'excel';
  metrics: string[];
  startDate: string;
  endDate: string;
  includeCharts?: boolean;
  email?: string; // Email to send the export to
}