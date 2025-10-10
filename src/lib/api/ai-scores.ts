/**
 * AI Scores API Integration
 * Connects Next.js frontend to Express.js backend
 */

export interface AIScoreResponse {
  ai_visibility: number;
  zero_click: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
  eeat: {
    experience: number;
    expertise: number;
    authoritativeness: number;
    trust: number;
  };
  indices: Array<{
    c: string;
    n: string;
    s: number;
    t: 'OK' | 'warn' | 'bad';
  }>;
  ai_raw: any[];
  tier: string;
}

export interface TierInfo {
  basic: { price: number; queries: number; cache: number };
  pro: { price: number; queries: number; cache: number };
  ultra: { price: number; queries: number; cache: number };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export class AIScoresAPI {
  /**
   * Get AI visibility scores for a domain
   */
  static async getScores(domain: string, tier: keyof TierInfo = 'pro'): Promise<AIScoreResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-scores?domain=${encodeURIComponent(domain)}&tier=${tier}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch AI scores: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching AI scores:', error);
      throw error;
    }
  }

  /**
   * Get pricing tiers information
   */
  static getTiers(): TierInfo {
    return {
      basic: { price: 0, queries: 10, cache: 168 },
      pro: { price: 499, queries: 500, cache: 24 },
      ultra: { price: 999, queries: 2000, cache: 1 }
    };
  }

  /**
   * Check backend health
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Get formatted score for display
   */
  static formatScore(score: number): { value: number; status: 'excellent' | 'good' | 'warning' | 'critical' } {
    if (score >= 80) return { value: score, status: 'excellent' };
    if (score >= 60) return { value: score, status: 'good' };
    if (score >= 40) return { value: score, status: 'warning' };
    return { value: score, status: 'critical' };
  }

  /**
   * Get status color for score
   */
  static getStatusColor(status: 'excellent' | 'good' | 'warning' | 'critical'): string {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  /**
   * Get status background color
   */
  static getStatusBg(status: 'excellent' | 'good' | 'warning' | 'critical'): string {
    switch (status) {
      case 'excellent': return 'bg-green-500/20 border-green-500/30';
      case 'good': return 'bg-blue-500/20 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  }
}
