/**
 * Frontend Integration Example for Dealership Analytics API
 * ==========================================================
 * 
 * This file demonstrates how to integrate the new analytics API
 * with your React/TypeScript frontend application.
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Eye, Shield, Brain, BarChart3 } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    email: string;
    role: string;
    dealership_ids: string[];
  };
}

interface DealershipInfo {
  dealership_id: string;
  name: string;
  location: string;
  url?: string;
}

interface ThreatData {
  category: string;
  severity: string;
  impact: string;
  description: string;
}

interface AnalyticsOverview {
  dealership: DealershipInfo;
  risk_score: number;
  monthly_loss_risk: number;
  ai_visibility_score: number;
  invisible_percentage: number;
  market_position: number;
  total_competitors: number;
  sov_percentage: number;
  ai_platform_scores: Record<string, number>;
  threats: ThreatData[];
  last_updated: string;
}

interface VisibilityScore {
  platform: string;
  score: number;
  last_updated: string;
}

interface VisibilityAnalytics {
  dealership_id: string;
  overall_score: number;
  platform_scores: VisibilityScore[];
  invisible_percentage: number;
}

// ============================================================================
// API Client
// ============================================================================

class AnalyticsAPIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the authentication token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * Authenticate and get a demo token (for testing only)
   */
  async getDemoToken(
    email: string,
    role: 'admin' | 'manager' | 'analyst' | 'viewer',
    dealershipIds: string[]
  ): Promise<AuthToken> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/demo-token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        role,
        dealership_ids: dealershipIds,
      }),
    });
    
    const token = await this.handleResponse<AuthToken>(response);
    this.setToken(token.access_token);
    return token;
  }

  /**
   * Get dealership analytics overview
   */
  async getDealershipAnalytics(dealershipId: string): Promise<AnalyticsOverview> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/analytics/dealership/${dealershipId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<AnalyticsOverview>(response);
  }

  /**
   * Get visibility analytics
   */
  async getVisibilityAnalytics(dealershipId: string): Promise<VisibilityAnalytics> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/analytics/dealership/${dealershipId}/visibility`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<VisibilityAnalytics>(response);
  }

  /**
   * Get threats
   */
  async getThreats(dealershipId: string, severity?: string): Promise<{ dealership_id: string; threats: ThreatData[]; total_risk_score: number }> {
    const url = new URL(`${this.baseUrl}/api/v1/analytics/dealership/${dealershipId}/threats`);
    if (severity) {
      url.searchParams.append('severity', severity);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  /**
   * Refresh analytics
   */
  async refreshAnalytics(dealershipId: string, forceRefresh: boolean = false): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/analytics/dealership/${dealershipId}/refresh`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ force_refresh: forceRefresh }),
      }
    );
    
    return this.handleResponse(response);
  }
}

// ============================================================================
// React Component Example
// ============================================================================

const DealershipAnalyticsComponent: React.FC = () => {
  const [apiClient] = useState(() => new AnalyticsAPIClient('http://localhost:8000'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [visibility, setVisibility] = useState<VisibilityAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dealershipId = 'deal_001';

  /**
   * Authenticate with demo credentials
   */
  const authenticate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.getDemoToken(
        'demo@dealership.ai',
        'analyst',
        [dealershipId]
      );
      
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch analytics data
   */
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, visibilityData] = await Promise.all([
        apiClient.getDealershipAnalytics(dealershipId),
        apiClient.getVisibilityAnalytics(dealershipId),
      ]);

      setAnalytics(analyticsData);
      setVisibility(visibilityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh analytics data
   */
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.refreshAnalytics(dealershipId, false);
      await fetchAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  // ============================================================================
  // Render
  // ============================================================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            Dealership Analytics API
          </h2>
          <p className="text-slate-400 mb-6">
            Authenticate to access analytics data with RBAC protection.
          </p>
          <button
            onClick={authenticate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Get Demo Access'}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-400">Powered by RBAC-protected API</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <BarChart3 className="w-5 h-5" />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Risk Score"
                value={`${analytics.risk_score}/100`}
                icon={<Shield className="w-6 h-6 text-blue-400" />}
              />
              <MetricCard
                title="Monthly Loss Risk"
                value={`$${(analytics.monthly_loss_risk / 1000).toFixed(0)}k`}
                icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
              />
              <MetricCard
                title="AI Visibility"
                value={`${analytics.ai_visibility_score.toFixed(1)}%`}
                icon={<Brain className="w-6 h-6 text-purple-400" />}
              />
              <MetricCard
                title="Market Position"
                value={`#${analytics.market_position}`}
                icon={<TrendingUp className="w-6 h-6 text-green-400" />}
              />
            </div>

            {/* Threats */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Identified Threats</h2>
              <div className="space-y-4">
                {analytics.threats.map((threat, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-700 rounded-lg border border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{threat.category}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          threat.severity === 'Critical'
                            ? 'bg-red-900 text-red-200'
                            : threat.severity === 'High'
                            ? 'bg-orange-900 text-orange-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {threat.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{threat.description}</p>
                    <p className="text-sm font-semibold text-red-400">Impact: {threat.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Scores */}
            {visibility && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-4">AI Platform Visibility</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {visibility.platform_scores.map((score) => (
                    <div key={score.platform} className="p-4 bg-slate-700 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">{score.platform}</div>
                      <div className="text-2xl font-bold text-slate-100">
                        {score.score.toFixed(0)}%
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            score.score >= 70
                              ? 'bg-green-500'
                              : score.score >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${score.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper component for metric cards
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-slate-700">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-slate-100 mb-1">{value}</div>
    <div className="text-sm text-slate-400">{title}</div>
  </div>
);

export default DealershipAnalyticsComponent;
