import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { logger } from '@/lib/utils/logger';

export interface RealtimeData {
  activeUsers: number;
  pageViews: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  trafficSources: Array<{
    source: string;
    users: number;
  }>;
}

export interface TrafficData {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  trafficSources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
}

export interface ConversionData {
  totalConversions: number;
  conversionRate: number;
  goalCompletions: Array<{
    goal: string;
    completions: number;
    value: number;
  }>;
  conversionSources: Array<{
    source: string;
    conversions: number;
    rate: number;
  }>;
}

export interface OverviewData {
  realtime: RealtimeData;
  traffic: TrafficData;
  conversions: ConversionData;
  summary: {
    totalUsers: number;
    conversionRate: number;
    topPerformingPage: string;
    primaryTrafficSource: string;
  };
}

export class GoogleAnalyticsService {
  private client!: BetaAnalyticsDataClient;
  private isInitialized: boolean = false;

  constructor() {
    try {
      // Initialize with service account credentials
      const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS 
        ? JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS)
        : null;

      if (credentials && credentials.project_id && credentials.private_key) {
        this.client = new BetaAnalyticsDataClient({
          credentials: credentials
        });
        this.isInitialized = true;
        logger.googleAnalytics.initialized();
      } else {
        logger.googleAnalytics.usingMockData('credentials not configured');
        this.isInitialized = false;
      }
    } catch (error) {
      logger.error('Failed to initialize Google Analytics client', 'GA4', error as Error);
      this.isInitialized = false;
    }
  }

  /**
   * Get real-time visitor data
   */
  async getRealtimeData(propertyId: string): Promise<RealtimeData> {
    if (!this.isInitialized) {
      return this.getMockRealtimeData();
    }

    try {
      const [response] = await this.client.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [
          { name: 'pagePath' },
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ],
        limit: 10
      });

      const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
      const pageViews = response.rows?.[0]?.metricValues?.[1]?.value || '0';

      // Process top pages
      const topPages = response.rows
        ?.filter(row => row.dimensionValues?.[0]?.value)
        .slice(0, 5)
        .map(row => ({
          page: row.dimensionValues?.[0]?.value || '',
          views: parseInt(row.metricValues?.[1]?.value || '0')
        })) || [];

      // Process traffic sources
      const trafficSources = response.rows
        ?.filter(row => row.dimensionValues?.[1]?.value)
        .slice(0, 5)
        .map(row => ({
          source: row.dimensionValues?.[1]?.value || '',
          users: parseInt(row.metricValues?.[0]?.value || '0')
        })) || [];

      return {
        activeUsers: parseInt(activeUsers),
        pageViews: parseInt(pageViews),
        topPages,
        trafficSources
      };
    } catch (error) {
      logger.googleAnalytics.apiError('getRealtimeData', propertyId, error as Error);
      return this.getMockRealtimeData();
    }
  }

  /**
   * Get traffic data for a specific date range
   */
  async getTrafficData(propertyId: string, dateRange: string = '30d'): Promise<TrafficData> {
    if (!this.isInitialized) {
      return this.getMockTrafficData();
    }

    try {
      const { startDate, endDate } = this.parseDateRange(dateRange);

      const [response] = await this.client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViews' }
        ],
        limit: 100
      });

      const totalUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
      const newUsers = response.rows?.[0]?.metricValues?.[1]?.value || '0';
      const sessions = response.rows?.[0]?.metricValues?.[2]?.value || '0';
      const bounceRate = response.rows?.[0]?.metricValues?.[3]?.value || '0';
      const avgSessionDuration = response.rows?.[0]?.metricValues?.[4]?.value || '0';

      // Process traffic sources
      const sourceMap = new Map<string, { users: number; sessions: number }>();
      response.rows?.forEach(row => {
        const source = row.dimensionValues?.[1]?.value || 'Direct';
        const users = parseInt(row.metricValues?.[0]?.value || '0');
        const sessionCount = parseInt(row.metricValues?.[2]?.value || '0');
        
        if (sourceMap.has(source)) {
          const existing = sourceMap.get(source)!;
          existing.users += users;
          existing.sessions += sessionCount;
        } else {
          sourceMap.set(source, { users, sessions: sessionCount });
        }
      });

      const totalSourceUsers = Array.from(sourceMap.values()).reduce((sum, source) => sum + source.users, 0);
      const trafficSources = Array.from(sourceMap.entries()).map(([source, data]) => ({
        source,
        users: data.users,
        percentage: totalSourceUsers > 0 ? (data.users / totalSourceUsers) * 100 : 0
      })).sort((a, b) => b.users - a.users).slice(0, 10);

      // Process top pages
      const pageMap = new Map<string, { views: number; uniqueViews: number }>();
      response.rows?.forEach(row => {
        const page = row.dimensionValues?.[0]?.value || '';
        const views = parseInt(row.metricValues?.[5]?.value || '0');
        const uniqueViews = parseInt(row.metricValues?.[0]?.value || '0');
        
        if (pageMap.has(page)) {
          const existing = pageMap.get(page)!;
          existing.views += views;
          existing.uniqueViews += uniqueViews;
        } else {
          pageMap.set(page, { views, uniqueViews });
        }
      });

      const topPages = Array.from(pageMap.entries())
        .map(([page, data]) => ({
          page,
          views: data.views,
          uniqueViews: data.uniqueViews
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return {
        totalUsers: parseInt(totalUsers),
        newUsers: parseInt(newUsers),
        sessions: parseInt(sessions),
        bounceRate: parseFloat(bounceRate),
        avgSessionDuration: parseFloat(avgSessionDuration),
        trafficSources,
        topPages
      };
    } catch (error) {
      logger.googleAnalytics.apiError('getTrafficData', propertyId, error as Error);
      return this.getMockTrafficData();
    }
  }

  /**
   * Get conversion data for a specific date range
   */
  async getConversionData(propertyId: string, dateRange: string = '30d'): Promise<ConversionData> {
    if (!this.isInitialized) {
      return this.getMockConversionData();
    }

    try {
      const { startDate, endDate } = this.parseDateRange(dateRange);

      const [response] = await this.client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'conversions' },
          { name: 'totalUsers' },
          { name: 'conversionRate' }
        ],
        limit: 50
      });

      const totalConversions = response.rows?.[0]?.metricValues?.[0]?.value || '0';
      const totalUsers = response.rows?.[0]?.metricValues?.[1]?.value || '0';
      const conversionRate = response.rows?.[0]?.metricValues?.[2]?.value || '0';

      // Process conversion sources
      const conversionSources = response.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'Direct',
        conversions: parseInt(row.metricValues?.[0]?.value || '0'),
        rate: parseFloat(row.metricValues?.[2]?.value || '0')
      })).sort((a, b) => b.conversions - a.conversions) || [];

      return {
        totalConversions: parseInt(totalConversions),
        conversionRate: parseFloat(conversionRate),
        goalCompletions: [
          { goal: 'Contact Form', completions: parseInt(totalConversions), value: 0 },
          { goal: 'Phone Call', completions: Math.floor(parseInt(totalConversions) * 0.3), value: 0 },
          { goal: 'Email Signup', completions: Math.floor(parseInt(totalConversions) * 0.2), value: 0 }
        ],
        conversionSources
      };
    } catch (error) {
      logger.googleAnalytics.apiError('getConversionData', propertyId, error as Error);
      return this.getMockConversionData();
    }
  }

  /**
   * Get comprehensive overview data
   */
  async getOverviewData(propertyId: string): Promise<OverviewData> {
    const [realtime, traffic, conversions] = await Promise.all([
      this.getRealtimeData(propertyId),
      this.getTrafficData(propertyId, '30d'),
      this.getConversionData(propertyId, '30d')
    ]);

    return {
      realtime,
      traffic,
      conversions,
      summary: {
        totalUsers: traffic.totalUsers,
        conversionRate: conversions.conversionRate,
        topPerformingPage: traffic.topPages[0]?.page || 'Home',
        primaryTrafficSource: traffic.trafficSources[0]?.source || 'Direct'
      }
    };
  }

  /**
   * Parse date range string to start and end dates
   */
  private parseDateRange(dateRange: string): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Mock data for development/testing
   */
  private getMockRealtimeData(): RealtimeData {
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      pageViews: Math.floor(Math.random() * 200) + 50,
      topPages: [
        { page: '/vehicles', views: Math.floor(Math.random() * 20) + 5 },
        { page: '/contact', views: Math.floor(Math.random() * 15) + 3 },
        { page: '/services', views: Math.floor(Math.random() * 10) + 2 },
        { page: '/about', views: Math.floor(Math.random() * 8) + 1 },
        { page: '/financing', views: Math.floor(Math.random() * 12) + 2 }
      ],
      trafficSources: [
        { source: 'Google', users: Math.floor(Math.random() * 20) + 10 },
        { source: 'Direct', users: Math.floor(Math.random() * 15) + 5 },
        { source: 'Facebook', users: Math.floor(Math.random() * 10) + 3 },
        { source: 'Yelp', users: Math.floor(Math.random() * 8) + 2 },
        { source: 'Referral', users: Math.floor(Math.random() * 5) + 1 }
      ]
    };
  }

  private getMockTrafficData(): TrafficData {
    const totalUsers = Math.floor(Math.random() * 1000) + 500;
    const newUsers = Math.floor(totalUsers * 0.6);
    const sessions = Math.floor(totalUsers * 1.2);
    const bounceRate = Math.random() * 0.4 + 0.3;
    const avgSessionDuration = Math.random() * 120 + 60;

    return {
      totalUsers,
      newUsers,
      sessions,
      bounceRate,
      avgSessionDuration,
      trafficSources: [
        { source: 'Google', users: Math.floor(totalUsers * 0.4), percentage: 40 },
        { source: 'Direct', users: Math.floor(totalUsers * 0.25), percentage: 25 },
        { source: 'Facebook', users: Math.floor(totalUsers * 0.15), percentage: 15 },
        { source: 'Yelp', users: Math.floor(totalUsers * 0.1), percentage: 10 },
        { source: 'Referral', users: Math.floor(totalUsers * 0.1), percentage: 10 }
      ],
      topPages: [
        { page: '/vehicles', views: Math.floor(totalUsers * 0.3), uniqueViews: Math.floor(totalUsers * 0.25) },
        { page: '/contact', views: Math.floor(totalUsers * 0.2), uniqueViews: Math.floor(totalUsers * 0.15) },
        { page: '/services', views: Math.floor(totalUsers * 0.15), uniqueViews: Math.floor(totalUsers * 0.12) },
        { page: '/financing', views: Math.floor(totalUsers * 0.1), uniqueViews: Math.floor(totalUsers * 0.08) },
        { page: '/about', views: Math.floor(totalUsers * 0.08), uniqueViews: Math.floor(totalUsers * 0.06) }
      ]
    };
  }

  private getMockConversionData(): ConversionData {
    const totalConversions = Math.floor(Math.random() * 50) + 20;
    const conversionRate = Math.random() * 0.05 + 0.02;

    return {
      totalConversions,
      conversionRate,
      goalCompletions: [
        { goal: 'Contact Form', completions: Math.floor(totalConversions * 0.6), value: 0 },
        { goal: 'Phone Call', completions: Math.floor(totalConversions * 0.3), value: 0 },
        { goal: 'Email Signup', completions: Math.floor(totalConversions * 0.2), value: 0 }
      ],
      conversionSources: [
        { source: 'Google', conversions: Math.floor(totalConversions * 0.4), rate: conversionRate * 1.2 },
        { source: 'Direct', conversions: Math.floor(totalConversions * 0.25), rate: conversionRate * 1.1 },
        { source: 'Facebook', conversions: Math.floor(totalConversions * 0.15), rate: conversionRate * 0.9 },
        { source: 'Yelp', conversions: Math.floor(totalConversions * 0.1), rate: conversionRate * 1.0 },
        { source: 'Referral', conversions: Math.floor(totalConversions * 0.1), rate: conversionRate * 0.8 }
      ]
    };
  }
}
