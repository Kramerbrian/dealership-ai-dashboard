/**
 * Cache Tag Constants
 * Used for Next.js revalidateTag() invalidation
 */

export const CACHE_TAGS = {
  // Dashboard
  DASHBOARD: 'dashboard',
  DASHBOARD_OVERVIEW: 'dashboard:overview',
  DASHBOARD_AI_HEALTH: 'dashboard:ai-health',
  DASHBOARD_REVENUE: 'dashboard:revenue',
  
  // Tenant-specific
  TENANT: (tenantId: string) => `tenant:${tenantId}`,
  
  // GNN
  GNN_PREDICTIONS: 'gnn:predictions',
  GNN_METRICS: 'gnn:metrics',
  GNN_TRAINING: 'gnn:training',
  
  // Analytics
  ANALYTICS: 'analytics',
  ANALYTICS_WEB_VITALS: 'analytics:web-vitals',
  
  // API
  API_ANALYTICS: 'api:analytics',
  
  // Charts
  CHARTS: 'charts',
  
  // Predictive
  PREDICTIVE: 'predictive',
  PREDICTIVE_FORECAST: 'predictive:forecast',
  PREDICTIVE_ANOMALIES: 'predictive:anomalies',
  
  // GNN
  GNN_PREDICTIONS: 'gnn:predictions',
  GNN_METRICS: 'gnn:metrics',
  GNN_TRAINING: 'gnn:training',
} as const;

/**
 * Helper to add cache tags to a NextResponse
 */
export function addCacheTags(response: Response, tags: string[]): Response {
  const tagHeader = tags.join(',');
  response.headers.set('Cache-Tag', tagHeader);
  return response;
}
