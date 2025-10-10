/**
 * Cost Monitoring and Optimization
 * Tracks API usage and provides cost optimization recommendations
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = url && key ? createClient(url, key) : {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
    eq: () => ({ data: [], error: null }),
    single: () => ({ data: null, error: null }),
  }),
  auth: {
    getUser: () => ({ data: { user: null }, error: null }),
    signIn: () => ({ data: { user: null }, error: null }),
    signOut: () => ({ error: null }),
  },
};

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

/**
 * Get cost metrics for a date range
 */
export async function getCostMetrics(
  startDate: string,
  endDate: string
): Promise<CostMetrics> {
  const { data: usage, error } = await supabase
    .from('api_usage')
    .select('platform, cost_usd, total_tokens, request_timestamp')
    .gte('request_timestamp', startDate)
    .lte('request_timestamp', endDate);

  if (error) {
    console.error('Error fetching cost metrics:', error);
    throw new Error('Failed to fetch cost metrics');
  }

  const totalCost = usage?.reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0;
  const totalTokens = usage?.reduce((sum, u) => sum + (u.total_tokens || 0), 0) || 0;

  // Group by platform
  const costByPlatform: Record<string, number> = {};
  const tokenByPlatform: Record<string, number> = {};

  usage?.forEach(u => {
    const platform = u.platform || 'unknown';
    costByPlatform[platform] = (costByPlatform[platform] || 0) + (u.cost_usd || 0);
    tokenByPlatform[platform] = (tokenByPlatform[platform] || 0) + (u.total_tokens || 0);
  });

  // Group by month
  const costByMonth: Record<string, number> = {};
  usage?.forEach(u => {
    if (u.request_timestamp) {
      const month = u.request_timestamp.substring(0, 7); // YYYY-MM
      costByMonth[month] = (costByMonth[month] || 0) + (u.cost_usd || 0);
    }
  });

  // Get scan counts for averages
  const { data: scans } = await supabase
    .from('monthly_scans')
    .select('id')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const scanCount = scans?.length || 1;
  const dealerCount = new Set(scans?.map(s => s.id)).size || 1;

  return {
    totalCost,
    costByPlatform,
    costByMonth,
    averageCostPerDealer: totalCost / dealerCount,
    averageCostPerScan: totalCost / scanCount,
    tokenUsage: {
      total: totalTokens,
      byPlatform: tokenByPlatform,
    },
  };
}

/**
 * Generate cost optimization recommendations
 */
export async function getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
  const recommendations: OptimizationRecommendation[] = [];

  // Get recent cost data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const metrics = await getCostMetrics(startDate, endDate);

  // Recommendation 1: Batch size optimization
  if (metrics.averageCostPerDealer > 0.50) {
    recommendations.push({
      type: 'batch_size',
      title: 'Optimize Batch Sizes',
      description: 'Increase batch sizes to reduce API overhead and improve cost efficiency.',
      potentialSavings: metrics.totalCost * 0.15,
      implementation: 'Increase batch size from 20 to 50 dealers per API call',
      priority: 'high',
    });
  }

  // Recommendation 2: Model selection optimization
  const expensivePlatforms = Object.entries(metrics.costByPlatform)
    .filter(([_, cost]) => cost > metrics.totalCost * 0.3)
    .map(([platform, _]) => platform);

  if (expensivePlatforms.length > 0) {
    recommendations.push({
      type: 'model_selection',
      title: 'Switch to More Cost-Effective Models',
      description: `Consider using cheaper models for ${expensivePlatforms.join(', ')} to reduce costs.`,
      potentialSavings: metrics.totalCost * 0.25,
      implementation: 'Use GPT-4o-mini for initial screening, GPT-4o only for detailed analysis',
      priority: 'high',
    });
  }

  // Recommendation 3: Query optimization
  if (metrics.tokenUsage.total > 1000000) { // 1M tokens
    recommendations.push({
      type: 'query_optimization',
      title: 'Optimize Query Set',
      description: 'Reduce the number of queries per scan to lower token usage.',
      potentialSavings: metrics.totalCost * 0.20,
      implementation: 'Reduce from 50 to 30 queries per dealer, focusing on highest-impact queries',
      priority: 'medium',
    });
  }

  // Recommendation 4: Caching optimization
  recommendations.push({
    type: 'caching',
    title: 'Implement Response Caching',
    description: 'Cache AI responses for similar queries to avoid redundant API calls.',
    potentialSavings: metrics.totalCost * 0.10,
    implementation: 'Cache responses for 24 hours, use for dealers in same geographic area',
    priority: 'medium',
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Track API usage for cost monitoring
 */
export async function trackAPIUsage(
  platform: string,
  scanId: string,
  inputTokens: number,
  outputTokens: number,
  cost: number,
  model?: string
) {
  const { error } = await supabase
    .from('api_usage')
    .insert({
      platform,
      scan_id: scanId,
      request_tokens: inputTokens,
      response_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      cost_usd: cost,
      model_used: model,
      request_timestamp: new Date().toISOString(),
    });

  if (error) {
    console.error('Error tracking API usage:', error);
  }
}

/**
 * Get cost alerts for budget monitoring
 */
export async function getCostAlerts(monthlyBudget: number = 100): Promise<{
  isOverBudget: boolean;
  currentSpend: number;
  projectedSpend: number;
  daysRemaining: number;
  recommendations: string[];
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const metrics = await getCostMetrics(startDate, endDate);
  
  const daysInMonth = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;
  
  const dailyAverage = metrics.totalCost / daysPassed;
  const projectedSpend = metrics.totalCost + (dailyAverage * daysRemaining);
  
  const isOverBudget = projectedSpend > monthlyBudget;
  
  const recommendations: string[] = [];
  
  if (isOverBudget) {
    recommendations.push('Consider reducing scan frequency or batch sizes');
    recommendations.push('Switch to cheaper models for non-critical scans');
    recommendations.push('Implement query filtering to reduce token usage');
  }
  
  if (projectedSpend > monthlyBudget * 0.8) {
    recommendations.push('Monitor spending closely - approaching budget limit');
  }

  return {
    isOverBudget,
    currentSpend: metrics.totalCost,
    projectedSpend,
    daysRemaining,
    recommendations,
  };
}

/**
 * Calculate optimal batch size based on cost and performance
 */
export function calculateOptimalBatchSize(
  currentBatchSize: number,
  currentCost: number,
  currentProcessingTime: number
): {
  recommendedBatchSize: number;
  estimatedCostSavings: number;
  estimatedTimeSavings: number;
} {
  // Optimal batch size is typically 2-3x current size for cost efficiency
  // but we need to balance with API limits and processing time
  const recommendedBatchSize = Math.min(currentBatchSize * 2, 50);
  
  // Cost savings from reduced API overhead
  const estimatedCostSavings = currentCost * 0.15;
  
  // Time savings from fewer API calls
  const estimatedTimeSavings = currentProcessingTime * 0.20;
  
  return {
    recommendedBatchSize,
    estimatedCostSavings,
    estimatedTimeSavings,
  };
}
