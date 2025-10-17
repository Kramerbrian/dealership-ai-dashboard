import { google } from 'googleapis';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Google APIs Configuration
export class GoogleAPIsManager {
  private static instance: GoogleAPIsManager;
  private searchConsole: any;
  private analytics: BetaAnalyticsDataClient;
  private pagespeed: any;

  constructor() {
    // Initialize Google Search Console API
    this.searchConsole = google.searchconsole('v1');
    
    // Initialize Google Analytics Data API
    this.analytics = new BetaAnalyticsDataClient({
      credentials: this.getServiceAccountCredentials(),
    });
    
    // Initialize PageSpeed Insights API
    this.pagespeed = google.pagespeedonline('v5');
  }

  static getInstance(): GoogleAPIsManager {
    if (!GoogleAPIsManager.instance) {
      GoogleAPIsManager.instance = new GoogleAPIsManager();
    }
    return GoogleAPIsManager.instance;
  }

  private getServiceAccountCredentials() {
    try {
      const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS;
      if (credentials) {
        return JSON.parse(credentials);
      }
    } catch (error) {
      console.error('Error parsing Google Analytics credentials:', error);
    }
    return null;
  }

  // Google Search Console Integration
  async getSearchConsoleData(domain: string, startDate: string, endDate: string) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: this.getServiceAccountCredentials(),
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      const searchConsole = google.searchconsole({
        version: 'v1',
        auth,
      });

      const response = await searchConsole.searchanalytics.query({
        siteUrl: `https://${domain}`,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query', 'page', 'device'],
          rowLimit: 1000,
          dimensionFilterGroups: [{
            filters: [{
              dimension: 'device',
              operator: 'equals',
              expression: 'mobile'
            }]
          }]
        }
      });

      return {
        success: true,
        data: response.data,
        totalRows: response.data.rows?.length || 0
      };
    } catch (error) {
      console.error('Search Console API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Google Analytics 4 Integration
  async getAnalyticsData(propertyId: string, startDate: string, endDate: string) {
    try {
      const [response] = await this.analytics.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'deviceCategory' },
          { name: 'source' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'users' },
          { name: 'pageviews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
        limit: 1000,
      });

      return {
        success: true,
        data: response,
        totalRows: response.rows?.length || 0
      };
    } catch (error) {
      console.error('Analytics API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // PageSpeed Insights Integration
  async getPageSpeedData(url: string, strategy: 'mobile' | 'desktop' = 'mobile') {
    try {
      const response = await this.pagespeed.pagespeedapi.runpagespeed({
        url,
        key: process.env.PAGESPEED_INSIGHTS_API_KEY,
        strategy,
        category: ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'],
      });

      const data = response.data;
      const lighthouse = data.lighthouseResult;

      return {
        success: true,
        data: {
          performance: lighthouse?.categories?.performance?.score || 0,
          accessibility: lighthouse?.categories?.accessibility?.score || 0,
          bestPractices: lighthouse?.categories?.['best-practices']?.score || 0,
          seo: lighthouse?.categories?.seo?.score || 0,
          firstContentfulPaint: lighthouse?.audits?.['first-contentful-paint']?.numericValue || 0,
          largestContentfulPaint: lighthouse?.audits?.['largest-contentful-paint']?.numericValue || 0,
          cumulativeLayoutShift: lighthouse?.audits?.['cumulative-layout-shift']?.numericValue || 0,
          speedIndex: lighthouse?.audits?.['speed-index']?.numericValue || 0,
          totalBlockingTime: lighthouse?.audits?.['total-blocking-time']?.numericValue || 0,
          timeToInteractive: lighthouse?.audits?.['interactive']?.numericValue || 0,
        }
      };
    } catch (error) {
      console.error('PageSpeed API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Combined SEO Analysis
  async getCombinedSEOAnalysis(domain: string, startDate: string, endDate: string) {
    try {
      const [searchConsoleData, analyticsData, pageSpeedData] = await Promise.all([
        this.getSearchConsoleData(domain, startDate, endDate),
        this.getAnalyticsData(process.env.GA4_PROPERTY_ID || '', startDate, endDate),
        this.getPageSpeedData(`https://${domain}`)
      ]);

      return {
        success: true,
        data: {
          searchConsole: searchConsoleData,
          analytics: analyticsData,
          pageSpeed: pageSpeedData,
          timestamp: new Date().toISOString(),
          domain,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Combined SEO Analysis Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }
}

// Utility functions for data processing
export class SEODataProcessor {
  static calculateSEOScore(data: any): number {
    if (!data) return 0;
    
    let score = 0;
    let factors = 0;

    // PageSpeed Performance (30% weight)
    if (data.pageSpeed?.data?.performance) {
      score += (data.pageSpeed.data.performance * 100) * 0.3;
      factors += 0.3;
    }

    // Search Console impressions (25% weight)
    if (data.searchConsole?.data?.rows?.length > 0) {
      const totalImpressions = data.searchConsole.data.rows.reduce((sum: number, row: any) => 
        sum + (row.impressions || 0), 0);
      const impressionScore = Math.min(totalImpressions / 1000, 1) * 100; // Normalize to 0-100
      score += impressionScore * 0.25;
      factors += 0.25;
    }

    // Analytics sessions (25% weight)
    if (data.analytics?.data?.rows?.length > 0) {
      const totalSessions = data.analytics.data.rows.reduce((sum: number, row: any) => 
        sum + (row.metricValues?.[0]?.value || 0), 0);
      const sessionScore = Math.min(totalSessions / 100, 1) * 100; // Normalize to 0-100
      score += sessionScore * 0.25;
      factors += 0.25;
    }

    // SEO score (20% weight)
    if (data.pageSpeed?.data?.seo) {
      score += (data.pageSpeed.data.seo * 100) * 0.2;
      factors += 0.2;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  static calculateAEOScore(data: any): number {
    if (!data) return 0;
    
    let score = 0;
    let factors = 0;

    // Search Console click-through rate (40% weight)
    if (data.searchConsole?.data?.rows?.length > 0) {
      const totalClicks = data.searchConsole.data.rows.reduce((sum: number, row: any) => 
        sum + (row.clicks || 0), 0);
      const totalImpressions = data.searchConsole.data.rows.reduce((sum: number, row: any) => 
        sum + (row.impressions || 0), 0);
      
      if (totalImpressions > 0) {
        const ctr = (totalClicks / totalImpressions) * 100;
        score += Math.min(ctr * 10, 100) * 0.4; // Normalize CTR to 0-100
        factors += 0.4;
      }
    }

    // Analytics bounce rate (30% weight)
    if (data.analytics?.data?.rows?.length > 0) {
      const avgBounceRate = data.analytics.data.rows.reduce((sum: number, row: any) => 
        sum + (parseFloat(row.metricValues?.[3]?.value || '0')), 0) / data.analytics.data.rows.length;
      const bounceScore = Math.max(0, 100 - (avgBounceRate * 100)); // Lower bounce rate = higher score
      score += bounceScore * 0.3;
      factors += 0.3;
    }

    // PageSpeed accessibility (30% weight)
    if (data.pageSpeed?.data?.accessibility) {
      score += (data.pageSpeed.data.accessibility * 100) * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  static calculateGEOScore(data: any): number {
    if (!data) return 0;
    
    let score = 0;
    let factors = 0;

    // Analytics session duration (40% weight)
    if (data.analytics?.data?.rows?.length > 0) {
      const avgSessionDuration = data.analytics.data.rows.reduce((sum: number, row: any) => 
        sum + (parseFloat(row.metricValues?.[4]?.value || '0')), 0) / data.analytics.data.rows.length;
      const durationScore = Math.min(avgSessionDuration / 60, 1) * 100; // Normalize to 0-100 (60 seconds = 100%)
      score += durationScore * 0.4;
      factors += 0.4;
    }

    // PageSpeed best practices (30% weight)
    if (data.pageSpeed?.data?.bestPractices) {
      score += (data.pageSpeed.data.bestPractices * 100) * 0.3;
      factors += 0.3;
    }

    // Search Console position (30% weight)
    if (data.searchConsole?.data?.rows?.length > 0) {
      const avgPosition = data.searchConsole.data.rows.reduce((sum: number, row: any) => 
        sum + (row.position || 0), 0) / data.searchConsole.data.rows.length;
      const positionScore = Math.max(0, 100 - (avgPosition * 2)); // Lower position = higher score
      score += positionScore * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }
}

// Export singleton instance
export const googleAPIs = GoogleAPIsManager.getInstance();
