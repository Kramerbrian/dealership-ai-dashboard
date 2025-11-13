/**
 * Google Analytics 4 Data Puller
 * Fetches GA4 data with cursor-based pagination and data quality checks
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface GA4Config {
  propertyId: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
  since?: string; // ISO date string
  until?: string; // ISO date string
}

export interface GA4DataPoint {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  source: string;
  medium: string;
  campaign?: string;
}

export interface GA4PullResult {
  data: GA4DataPoint[];
  nextCursor?: string;
  hasMore: boolean;
  dataQuality: {
    completeness: number; // 0-1
    staleness: number; // hours since last data
    missingDays: number;
  };
}

export class GA4Puller {
  private client: BetaAnalyticsDataClient;
  private config: GA4Config;

  constructor(config: GA4Config) {
    this.config = config;
    this.client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: config.credentials.client_email,
        private_key: config.credentials.private_key,
      },
    });
  }

  /**
   * Pull GA4 data with cursor-based pagination
   */
  async pullData(cursor?: string, limit: number = 1000): Promise<GA4PullResult> {
    try {
      const since = this.config.since || this.getDefaultSince();
      const until = this.config.until || new Date().toISOString().split('T')[0];

      const [response] = await this.client.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [
          {
            startDate: since,
            endDate: until,
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'source' },
          { name: 'medium' },
          { name: 'campaign' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
          { name: 'conversionRate' },
        ],
        limit: limit,
        offset: cursor ? parseInt(cursor) : 0,
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
            desc: false,
          },
        ],
      });

      const data: GA4DataPoint[] = response.rows?.map(row => ({
        date: row.dimensionValues?.[0]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
        avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
        conversions: parseInt(row.metricValues?.[5]?.value || '0'),
        conversionRate: parseFloat(row.metricValues?.[6]?.value || '0'),
        source: row.dimensionValues?.[1]?.value || '',
        medium: row.dimensionValues?.[2]?.value || '',
        campaign: row.dimensionValues?.[3]?.value || undefined,
      })) || [];

      // Calculate data quality metrics
      const dataQuality = this.calculateDataQuality(data, since, until);

      // Determine if there's more data
      const hasMore = (response.rowCount || 0) === limit;
      const nextCursor = hasMore ? ((cursor ? parseInt(cursor) : 0) + limit).toString() : undefined;

      return {
        data,
        nextCursor,
        hasMore,
        dataQuality,
      };

    } catch (error) {
      console.error('GA4 data pull error:', error);
      throw new Error(`Failed to pull GA4 data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pull data for specific date range
   */
  async pullDateRange(startDate: string, endDate: string): Promise<GA4DataPoint[]> {
    const originalSince = this.config.since;
    const originalUntil = this.config.until;
    
    this.config.since = startDate;
    this.config.until = endDate;
    
    try {
      const result = await this.pullData();
      return result.data;
    } finally {
      this.config.since = originalSince;
      this.config.until = originalUntil;
    }
  }

  /**
   * Get latest data point
   */
  async getLatestData(): Promise<GA4DataPoint | null> {
    const result = await this.pullData(undefined, 1);
    return result.data.length > 0 ? result.data[0] : null;
  }

  /**
   * Check data staleness
   */
  async checkDataStaleness(): Promise<number> {
    const latest = await this.getLatestData();
    if (!latest) return Infinity;
    
    const latestDate = new Date(latest.date);
    const now = new Date();
    return (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60); // hours
  }

  /**
   * Calculate data quality metrics
   */
  private calculateDataQuality(data: GA4DataPoint[], since: string, until: string): {
    completeness: number;
    staleness: number;
    missingDays: number;
  } {
    const startDate = new Date(since);
    const endDate = new Date(until);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const dataDates = new Set(data.map(d => d.date));
    const missingDays = totalDays - dataDates.size;
    const completeness = Math.max(0, 1 - (missingDays / totalDays));
    
    // Calculate staleness (hours since last data point)
    const latestDate = data.length > 0 ? new Date(data[data.length - 1].date) : new Date();
    const staleness = (new Date().getTime() - latestDate.getTime()) / (1000 * 60 * 60);
    
    return {
      completeness,
      staleness,
      missingDays,
    };
  }

  /**
   * Get default since date (30 days ago)
   */
  private getDefaultSince(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Validate GA4 configuration
   */
  static validateConfig(config: GA4Config): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.propertyId) {
      errors.push('Property ID is required');
    }
    
    if (!config.credentials.client_email) {
      errors.push('Client email is required');
    }
    
    if (!config.credentials.private_key) {
      errors.push('Private key is required');
    }
    
    if (config.since && isNaN(Date.parse(config.since))) {
      errors.push('Invalid since date format');
    }
    
    if (config.until && isNaN(Date.parse(config.until))) {
      errors.push('Invalid until date format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
