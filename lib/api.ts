/**
 * API Client for DealershipAI Backend Integration
 * Handles communication with Express backend for real-time AI scores
 */

import { env } from './env';

export type Tier = 'basic' | 'pro' | 'ultra'

/**
 * Proxy request to Fleet API backend
 */
export async function proxyToFleet(
  path: string,
  init: RequestInit & { tenant?: string; role?: string } = {}
) {
  if (!env.FLEET_API_BASE) {
    throw new Error('FLEET_API_BASE not configured');
  }

  const url = new URL(path, env.FLEET_API_BASE);
  const headers = Object.assign(
    { 'content-type': 'application/json', 'x-api-key': env.X_API_KEY },
    init.headers || {},
    init?.tenant ? { 'x-tenant': init.tenant } : {},
    init?.role ? { 'x-role': init.role } : {}
  );
  const res = await fetch(url.toString(), { ...init, headers });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Upstream error ${res.status}: ${msg}`);
  }
  return res;
}

export interface AIScores {
  ai_visibility: number
  eeat: number
  geo_trust: number
  schema_completeness: number
  overall_score: number
  confidence: number
  last_updated: string
  tier: Tier
  queries_used: number
  queries_limit: number
}

export interface MetricData {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  description: string
}

export interface DashboardMetrics {
  ai_visibility: MetricData
  eeat: MetricData
  geo_trust: MetricData
  schema_completeness: MetricData
  overall_score: number
  tier: Tier
  usage: {
    used: number
    limit: number
    percentage: number
  }
}

class APIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  }

  /**
   * Fetch AI scores from backend
   */
  async getScores(domain: string, tier: Tier = 'pro'): Promise<AIScores> {
    const response = await fetch(
      `${this.baseUrl}/api/ai-scores?domain=${encodeURIComponent(domain)}&tier=${tier}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Transform API scores to dashboard metrics format
   */
  transformToMetrics(scores: AIScores): DashboardMetrics {
    const calculateChange = (current: number): number => {
      // Mock historical data - replace with real historical comparison
      return Math.floor(Math.random() * 20) - 10 // -10 to +10
    }

    const getTrend = (change: number): 'up' | 'down' | 'stable' => {
      if (change > 2) return 'up'
      if (change < -2) return 'down'
      return 'stable'
    }

    return {
      ai_visibility: {
        label: 'AI Visibility',
        value: scores.ai_visibility,
        change: calculateChange(scores.ai_visibility),
        trend: getTrend(calculateChange(scores.ai_visibility)),
        description: 'How often AI assistants recommend your dealership'
      },
      eeat: {
        label: 'E-E-A-T Score',
        value: scores.eeat,
        change: calculateChange(scores.eeat),
        trend: getTrend(calculateChange(scores.eeat)),
        description: 'Expertise, Experience, Authoritativeness, Trustworthiness'
      },
      geo_trust: {
        label: 'Geo Trust',
        value: scores.geo_trust,
        change: calculateChange(scores.geo_trust),
        trend: getTrend(calculateChange(scores.geo_trust)),
        description: 'Local SEO and geographic relevance'
      },
      schema_completeness: {
        label: 'Schema Completeness',
        value: scores.schema_completeness,
        change: calculateChange(scores.schema_completeness),
        trend: getTrend(calculateChange(scores.schema_completeness)),
        description: 'Structured data implementation quality'
      },
      overall_score: scores.overall_score,
      tier: scores.tier,
      usage: {
        used: scores.queries_used,
        limit: scores.queries_limit,
        percentage: Math.round((scores.queries_used / scores.queries_limit) * 100)
      }
    }
  }

  /**
   * Get tier pricing information
   */
  getTierPricing(): Record<Tier, { price: number; queries: number; cache: string; features: string[] }> {
    return {
      basic: {
        price: 0,
        queries: 10,
        cache: '168hr',
        features: ['Weekly reports', 'Basic metrics', 'Email support']
      },
      pro: {
        price: 499,
        queries: 500,
        cache: '24hr',
        features: ['Daily updates', 'Full dashboard', 'Priority support', 'Historical data']
      },
      ultra: {
        price: 999,
        queries: 2000,
        cache: '1hr',
        features: ['Real-time updates', 'API access', 'White-label', 'Custom integrations']
      }
    }
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      } as any)
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Get usage statistics
   */
  async getUsage(tier: Tier): Promise<{ used: number; limit: number; resetDate: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usage?tier=${tier}`)
      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }

    // Fallback to tier limits
    const limits = { basic: 10, pro: 500, ultra: 2000 }
    return {
      used: 0,
      limit: limits[tier],
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
}

// Export singleton instance
const api = new APIClient()
export default api
