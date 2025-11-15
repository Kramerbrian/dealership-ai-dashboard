/**
 * Google Search Console Data Puller
 * Fetches Search Console data with cursor-based pagination and data quality checks
 */

import { searchconsole_v1 } from 'googleapis';

export interface SearchConsoleConfig {
  siteUrl: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
  since?: string; // ISO date string
  until?: string; // ISO date string
}

export interface SearchConsoleDataPoint {
  date: string;
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  country?: string;
  device?: string;
}

export interface SearchConsolePullResult {
  data: SearchConsoleDataPoint[];
  nextCursor?: string;
  hasMore: boolean;
  dataQuality: {
    completeness: number; // 0-1
    staleness: number; // hours since last data
    missingDays: number;
  };
}

export class SearchConsolePuller {
  private client: any;
  private config: SearchConsoleConfig;

  constructor(config: SearchConsoleConfig) {
    this.config = config;
    this.client = new (require('googleapis').google.searchconsole)({
      version: 'v1',
      auth: new (require('google-auth-library').GoogleAuth)({
        credentials: {
          client_email: config.credentials.client_email,
          private_key: config.credentials.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      }),
    });
  }

  /**
   * Pull Search Console data with cursor-based pagination
   */
  async pullData(cursor?: string, limit: number = 1000): Promise<SearchConsolePullResult> {
    try {
      const since = this.config.since || this.getDefaultSince();
      const until = this.config.until || new Date().toISOString().split('T')[0];

      const response = await this.client.searchanalytics.query({
        siteUrl: this.config.siteUrl,
        requestBody: {
          startDate: since,
          endDate: until,
          dimensions: ['date', 'query', 'page', 'country', 'device'],
          rowLimit: limit,
          startRow: cursor ? parseInt(cursor) : 0,
          dimensionFilterGroups: [
            {
              filters: [
                {
                  dimension: 'country',
                  operator: 'equals',
                  expression: 'usa', // Default to USA, can be made configurable
                },
              ],
            },
          ],
        },
      });

      const data: SearchConsoleDataPoint[] = response.data.rows?.map((row: any) => ({
        date: row.keys?.[0] || '',
        query: row.keys?.[1] || '',
        page: row.keys?.[2] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
        country: row.keys?.[3] || undefined,
        device: row.keys?.[4] || undefined,
      })) || [];

      // Calculate data quality metrics
      const dataQuality = this.calculateDataQuality(data, since, until);

      // Determine if there's more data
      const hasMore = (response.data.rows?.length || 0) === limit;
      const nextCursor = hasMore ? ((cursor ? parseInt(cursor) : 0) + limit).toString() : undefined;

      return {
        data,
        nextCursor,
        hasMore,
        dataQuality,
      };

    } catch (error) {
      console.error('Search Console data pull error:', error);
      throw new Error(`Failed to pull Search Console data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pull search performance data
   */
  async pullSearchPerformance(startDate: string, endDate: string): Promise<SearchConsoleDataPoint[]> {
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
   * Get top performing queries
   */
  async getTopQueries(limit: number = 100): Promise<SearchConsoleDataPoint[]> {
    try {
      const since = this.config.since || this.getDefaultSince();
      const until = this.config.until || new Date().toISOString().split('T')[0];

      const response = await this.client.searchanalytics.query({
        siteUrl: this.config.siteUrl,
        requestBody: {
          startDate: since,
          endDate: until,
          dimensions: ['query'],
          rowLimit: limit,
          orderBys: [
            {
              dimension: 'clicks',
              sortOrder: 'DESCENDING',
            },
          ],
        },
      });

      return response.data.rows?.map((row: any) => ({
        date: '',
        query: row.keys?.[0] || '',
        page: '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || [];

    } catch (error) {
      console.error('Search Console top queries error:', error);
      throw new Error(`Failed to get top queries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get page performance data
   */
  async getPagePerformance(limit: number = 100): Promise<SearchConsoleDataPoint[]> {
    try {
      const since = this.config.since || this.getDefaultSince();
      const until = this.config.until || new Date().toISOString().split('T')[0];

      const response = await this.client.searchanalytics.query({
        siteUrl: this.config.siteUrl,
        requestBody: {
          startDate: since,
          endDate: until,
          dimensions: ['page'],
          rowLimit: limit,
          orderBys: [
            {
              dimension: 'clicks',
              sortOrder: 'DESCENDING',
            },
          ],
        },
      });

      return response.data.rows?.map((row: any) => ({
        date: '',
        query: '',
        page: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || [];

    } catch (error) {
      console.error('Search Console page performance error:', error);
      throw new Error(`Failed to get page performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get latest data point
   */
  async getLatestData(): Promise<SearchConsoleDataPoint | null> {
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
  private calculateDataQuality(data: SearchConsoleDataPoint[], since: string, until: string): {
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
   * Validate Search Console configuration
   */
  static validateConfig(config: SearchConsoleConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.siteUrl) {
      errors.push('Site URL is required');
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
