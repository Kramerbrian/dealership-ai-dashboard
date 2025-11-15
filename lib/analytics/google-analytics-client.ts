// @ts-nocheck
// Optional Google Analytics import - gracefully fail if not installed
let BetaAnalyticsDataClient: any;
try {
  BetaAnalyticsDataClient = require('@google-analytics/data').BetaAnalyticsDataClient as any;
} catch (e) {
  // Google Analytics not installed - client will handle gracefully
}

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsMetric {
  activeUsers?: number;
  sessions?: number;
  engagementRate?: number;
  averageSessionDuration?: number;
  screenPageViews?: number;
  conversions?: number;
}

export interface AnalyticsDimension {
  date?: string;
  city?: string;
  country?: string;
  deviceCategory?: string;
  pagePath?: string;
  pageTitle?: string;
  source?: string;
  medium?: string;
}

export interface AnalyticsRow {
  dimensions: AnalyticsDimension;
  metrics: AnalyticsMetric;
}

export class GoogleAnalyticsClient {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    // Validate required environment variables
    if (!process.env.GA_PROPERTY_ID) {
      throw new Error('GA_PROPERTY_ID environment variable is required');
    }

    this.propertyId = process.env.GA_PROPERTY_ID;

    // Initialize the client with credentials
    this.client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GA_PROJECT_ID,
    });
  }

  /**
   * Get active users count
   */
  async getActiveUsers(
    startDate: string = '30daysAgo',
    endDate: string = 'today'
  ): Promise<number> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'activeUsers' }],
    });

    const value = response.rows?.[0]?.metricValues?.[0]?.value;
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Get user engagement metrics over time
   */
  async getUserEngagement(
    startDate: string = '30daysAgo',
    endDate: string = 'today'
  ): Promise<AnalyticsRow[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    return this.formatResponse(response);
  }

  /**
   * Get top pages by page views
   */
  async getTopPages(
    startDate: string = '30daysAgo',
    endDate: string = 'today',
    limit: number = 10
  ): Promise<AnalyticsRow[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
      limit,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    });

    return this.formatResponse(response);
  }

  /**
   * Get traffic sources breakdown
   */
  async getTrafficSources(
    startDate: string = '30daysAgo',
    endDate: string = 'today'
  ): Promise<AnalyticsRow[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'source' }, { name: 'medium' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return this.formatResponse(response);
  }

  /**
   * Get device category breakdown
   */
  async getDeviceBreakdown(
    startDate: string = '30daysAgo',
    endDate: string = 'today'
  ): Promise<AnalyticsRow[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    return this.formatResponse(response);
  }

  /**
   * Get geographic distribution
   */
  async getGeographicData(
    startDate: string = '30daysAgo',
    endDate: string = 'today',
    limit: number = 20
  ): Promise<AnalyticsRow[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit,
    });

    return this.formatResponse(response);
  }

  /**
   * Get real-time active users (last 30 minutes)
   */
  async getRealtimeUsers(): Promise<number> {
    const [response] = await this.client.runRealtimeReport({
      property: `properties/${this.propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const value = response.rows?.[0]?.metricValues?.[0]?.value;
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Format API response into structured data
   */
  private formatResponse(response: any): AnalyticsRow[] {
    if (!response.rows || response.rows.length === 0) {
      return [];
    }

    const dimensionHeaders = response.dimensionHeaders || [];
    const metricHeaders = response.metricHeaders || [];

    return response.rows.map((row: any) => {
      const dimensions: AnalyticsDimension = {};
      const metrics: AnalyticsMetric = {};

      // Map dimension values
      row.dimensionValues?.forEach((value: any, index: number) => {
        const dimensionName = dimensionHeaders[index]?.name;
        if (dimensionName) {
          dimensions[dimensionName as keyof AnalyticsDimension] = value.value;
        }
      });

      // Map metric values
      row.metricValues?.forEach((value: any, index: number) => {
        const metricName = metricHeaders[index]?.name;
        if (metricName) {
          const numericValue = parseFloat(value.value);
          metrics[metricName as keyof AnalyticsMetric] = numericValue;
        }
      });

      return { dimensions, metrics };
    });
  }

  /**
   * Health check - verify credentials and access
   */
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getActiveUsers('7daysAgo', 'today');
      return {
        success: true,
        message: 'Google Analytics Data API connection successful',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}

// Export singleton instance
let analyticsClient: GoogleAnalyticsClient | null = null;

export function getAnalyticsClient(): GoogleAnalyticsClient {
  if (!analyticsClient) {
    analyticsClient = new GoogleAnalyticsClient();
  }
  return analyticsClient;
}
