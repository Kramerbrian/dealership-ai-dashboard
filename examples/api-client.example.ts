/**
 * Example API Client for Dealership Analytics API
 * 
 * This demonstrates how to interact with the API endpoints
 * with proper authentication and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  metrics?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

class DealershipAnalyticsClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          this.token = null;
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate and obtain JWT token
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await this.api.post('/api/auth/login', credentials);
      this.token = response.data.data.token;
      console.log('✅ Login successful');
      console.log('User:', response.data.data.user.name);
      console.log('Role:', response.data.data.user.role);
      console.log('Permissions:', response.data.data.user.permissions);
    } catch (error) {
      console.error('❌ Login failed:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for a dealership
   */
  async getDealershipAnalytics(
    dealershipId: string, 
    query?: AnalyticsQuery
  ): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/analytics/dealership/${dealershipId}`,
        { params: query }
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get AI visibility metrics
   */
  async getAIVisibility(dealershipId: string): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/analytics/dealership/${dealershipId}/ai-visibility`
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch AI visibility:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(
    dealershipId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/analytics/dealership/${dealershipId}/sales`,
        { params: { startDate, endDate } }
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch sales analytics:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get competitor analysis
   */
  async getCompetitorAnalysis(dealershipId: string): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/analytics/dealership/${dealershipId}/competitors`
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch competitor analysis:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get threat analysis
   */
  async getThreatAnalysis(dealershipId: string): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/analytics/dealership/${dealershipId}/threats`
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch threat analysis:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    dealershipId: string,
    format: 'csv' | 'pdf' | 'excel',
    metrics: string[],
    startDate: string,
    endDate: string
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    try {
      const response = await this.api.post(
        `/api/analytics/dealership/${dealershipId}/export`,
        { format, metrics, startDate, endDate }
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to export analytics:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboard(): Promise<any> {
    try {
      const response = await this.api.get('/api/analytics/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch dashboard:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await this.api.get('/api/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to fetch user info:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Logout (clear token)
   */
  async logout(): Promise<void> {
    try {
      await this.api.post('/api/auth/logout');
      this.token = null;
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', this.getErrorMessage(error));
    }
  }

  /**
   * Helper to extract error message
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message;
    }
    return String(error);
  }
}

// Example usage
async function demonstrateAPIUsage() {
  const client = new DealershipAnalyticsClient();
  
  try {
    console.log('=== Dealership Analytics API Demo ===\n');

    // 1. Login as dealership owner
    console.log('1. Logging in...');
    await client.login({
      email: 'owner@dealership.com',
      password: 'password123'
    });

    // 2. Get current user info
    console.log('\n2. Getting user info...');
    const user = await client.getCurrentUser();
    console.log('Current user:', user);

    // 3. Get comprehensive analytics
    console.log('\n3. Fetching comprehensive analytics...');
    const analytics = await client.getDealershipAnalytics('dealership-123', {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
    console.log('Analytics period:', analytics.period);
    console.log('AI Visibility Score:', analytics.metrics.aiVisibility.overallScore);

    // 4. Get AI visibility details
    console.log('\n4. Fetching AI visibility metrics...');
    const aiVisibility = await client.getAIVisibility('dealership-123');
    console.log('Platform scores:', aiVisibility.platformScores);
    console.log('Monthly loss risk: $', aiVisibility.monthlyLossRisk);

    // 5. Get sales analytics
    console.log('\n5. Fetching sales analytics...');
    const sales = await client.getSalesAnalytics('dealership-123');
    console.log('Total sales:', sales.totalSales);
    console.log('Total revenue: $', sales.totalRevenue.toFixed(2));
    console.log('Trend:', sales.trend);

    // 6. Get competitor analysis
    console.log('\n6. Fetching competitor analysis...');
    const competitors = await client.getCompetitorAnalysis('dealership-123');
    console.log('Market position:', competitors.marketPosition);
    console.log('Total competitors:', competitors.totalCompetitors);
    console.log('Top competitor:', competitors.topCompetitors[0]?.name);

    // 7. Get threat analysis
    console.log('\n7. Fetching threat analysis...');
    const threats = await client.getThreatAnalysis('dealership-123');
    console.log('Risk score:', threats.riskScore);
    console.log('Critical threats:', threats.threats.filter((t: any) => t.severity === 'Critical').length);

    // 8. Export analytics
    console.log('\n8. Exporting analytics...');
    const exportResult = await client.exportAnalytics(
      'dealership-123',
      'pdf',
      ['aiVisibility', 'sales', 'marketing'],
      '2024-01-01',
      '2024-12-31'
    );
    console.log('Export URL:', exportResult.downloadUrl);
    console.log('Expires at:', exportResult.expiresAt);

    // 9. Get dashboard summary
    console.log('\n9. Fetching dashboard summary...');
    const dashboard = await client.getDashboard();
    console.log('Dashboard summary:', dashboard);

    // 10. Logout
    console.log('\n10. Logging out...');
    await client.logout();

    console.log('\n=== Demo Complete ===');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateAPIUsage();
}

export { DealershipAnalyticsClient };