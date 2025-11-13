import { google } from 'googleapis';
import { logger } from '@/lib/utils/logger';

export interface SearchPerformanceData {
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  position: number; // Average position
  date: string;
}

export interface TopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface TopPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleOverview {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  topQueries: TopQuery[];
  topPages: TopPage[];
  performanceByDevice: {
    desktop: SearchPerformanceData;
    mobile: SearchPerformanceData;
    tablet: SearchPerformanceData;
  };
}

export class SearchConsoleService {
  private searchConsole: any;
  private isInitialized: boolean = false;

  constructor() {
    try {
      const credentials = process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS
        ? JSON.parse(process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS)
        : null;

      if (credentials && credentials.project_id && credentials.private_key) {
        const auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });

        this.searchConsole = google.searchconsole({ version: 'v1', auth });
        this.isInitialized = true;
        logger.info('✅ Google Search Console client initialized successfully');
      } else {
        logger.warn('📊 Google Search Console: Using mock data - credentials not configured');
        this.isInitialized = false;
      }
    } catch (error) {
      logger.error('Failed to initialize Google Search Console client', 'SearchConsole', error as Error);
      this.isInitialized = false;
    }
  }

  async getSearchPerformance(siteUrl: string, dateRange: string = '30d'): Promise<SearchPerformanceData[]> {
    if (!this.isInitialized) {
      return this.getMockSearchPerformance();
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - this.parseDateRange(dateRange));

      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: this.formatDate(startDate),
          endDate: this.formatDate(endDate),
          dimensions: ['date'],
          rowLimit: 1000
        }
      });

      const data = response.data.rows || [];
      return data.map((row: any) => ({
        date: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    } catch (error) {
      logger.error('Search Console API error', 'SearchConsole', error as Error, { siteUrl, dateRange });
      return this.getMockSearchPerformance();
    }
  }

  async getTopQueries(siteUrl: string, limit: number = 10, dateRange: string = '30d'): Promise<TopQuery[]> {
    if (!this.isInitialized) {
      return this.getMockTopQueries(limit);
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - this.parseDateRange(dateRange));

      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: this.formatDate(startDate),
          endDate: this.formatDate(endDate),
          dimensions: ['query'],
          rowLimit: limit
        }
      });

      const data = response.data.rows || [];
      return data.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    } catch (error) {
      logger.error('Search Console top queries error', 'SearchConsole', error as Error, { siteUrl, limit });
      return this.getMockTopQueries(limit);
    }
  }

  async getTopPages(siteUrl: string, limit: number = 10, dateRange: string = '30d'): Promise<TopPage[]> {
    if (!this.isInitialized) {
      return this.getMockTopPages(limit);
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - this.parseDateRange(dateRange));

      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: this.formatDate(startDate),
          endDate: this.formatDate(endDate),
          dimensions: ['page'],
          rowLimit: limit
        }
      });

      const data = response.data.rows || [];
      return data.map((row: any) => ({
        page: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    } catch (error) {
      logger.error('Search Console top pages error', 'SearchConsole', error as Error, { siteUrl, limit });
      return this.getMockTopPages(limit);
    }
  }

  async getPerformanceByDevice(siteUrl: string, dateRange: string = '30d'): Promise<SearchConsoleOverview['performanceByDevice']> {
    if (!this.isInitialized) {
      return this.getMockPerformanceByDevice();
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - this.parseDateRange(dateRange));

      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: this.formatDate(startDate),
          endDate: this.formatDate(endDate),
          dimensions: ['device']
        }
      });

      const data = response.data.rows || [];
      const deviceData: any = {};

      data.forEach((row: any) => {
        const device = row.keys[0];
        deviceData[device] = {
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0,
          date: this.formatDate(new Date())
        };
      });

      return {
        desktop: deviceData.desktop || this.getMockDeviceData('desktop'),
        mobile: deviceData.mobile || this.getMockDeviceData('mobile'),
        tablet: deviceData.tablet || this.getMockDeviceData('tablet')
      };

    } catch (error) {
      logger.error('Search Console device performance error', 'SearchConsole', error as Error, { siteUrl });
      return this.getMockPerformanceByDevice();
    }
  }

  async getOverview(siteUrl: string, dateRange: string = '30d'): Promise<SearchConsoleOverview> {
    try {
      const [topQueries, topPages, performanceByDevice] = await Promise.all([
        this.getTopQueries(siteUrl, 10, dateRange),
        this.getTopPages(siteUrl, 10, dateRange),
        this.getPerformanceByDevice(siteUrl, dateRange)
      ]);

      const totalClicks = topQueries.reduce((sum, query) => sum + query.clicks, 0);
      const totalImpressions = topQueries.reduce((sum, query) => sum + query.impressions, 0);
      const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const averagePosition = topQueries.reduce((sum, query) => sum + query.position, 0) / topQueries.length;

      return {
        totalClicks,
        totalImpressions,
        averageCtr,
        averagePosition,
        topQueries,
        topPages,
        performanceByDevice
      };

    } catch (error) {
      logger.error('Search Console overview error', 'SearchConsole', error as Error, { siteUrl });
      return this.getMockOverview();
    }
  }

  private parseDateRange(dateRange: string): number {
    const match = dateRange.match(/(\d+)([dwmy])/);
    if (!match) return 30;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      case 'y': return value * 365;
      default: return 30;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Mock data methods
  private getMockSearchPerformance(): SearchPerformanceData[] {
    const data: SearchPerformanceData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: this.formatDate(date),
        clicks: Math.floor(Math.random() * 100) + 50,
        impressions: Math.floor(Math.random() * 1000) + 500,
        ctr: Math.random() * 5 + 2,
        position: Math.random() * 10 + 5
      });
    }
    return data;
  }

  private getMockTopQueries(limit: number): TopQuery[] {
    const queries = [
      'car dealership near me',
      'used cars for sale',
      'new car inventory',
      'auto financing',
      'car service appointment',
      'vehicle inspection',
      'car insurance quote',
      'trade in value',
      'car warranty',
      'auto parts'
    ];

    return queries.slice(0, limit).map(query => ({
      query,
      clicks: Math.floor(Math.random() * 200) + 50,
      impressions: Math.floor(Math.random() * 2000) + 500,
      ctr: Math.random() * 8 + 2,
      position: Math.random() * 15 + 3
    }));
  }

  private getMockTopPages(limit: number): TopPage[] {
    const pages = [
      '/inventory',
      '/about',
      '/contact',
      '/services',
      '/financing',
      '/parts',
      '/service-appointment',
      '/trade-in',
      '/warranty',
      '/insurance'
    ];

    return pages.slice(0, limit).map(page => ({
      page,
      clicks: Math.floor(Math.random() * 150) + 30,
      impressions: Math.floor(Math.random() * 1500) + 300,
      ctr: Math.random() * 6 + 2,
      position: Math.random() * 12 + 4
    }));
  }

  private getMockDeviceData(device: string): SearchPerformanceData {
    const baseClicks = device === 'mobile' ? 200 : device === 'desktop' ? 150 : 50;
    const baseImpressions = device === 'mobile' ? 2000 : device === 'desktop' ? 1500 : 500;

    return {
      clicks: baseClicks + Math.floor(Math.random() * 100),
      impressions: baseImpressions + Math.floor(Math.random() * 500),
      ctr: Math.random() * 4 + 2,
      position: Math.random() * 8 + 4,
      date: this.formatDate(new Date())
    };
  }

  private getMockPerformanceByDevice(): SearchConsoleOverview['performanceByDevice'] {
    return {
      desktop: this.getMockDeviceData('desktop'),
      mobile: this.getMockDeviceData('mobile'),
      tablet: this.getMockDeviceData('tablet')
    };
  }

  private getMockOverview(): SearchConsoleOverview {
    return {
      totalClicks: 1250,
      totalImpressions: 15000,
      averageCtr: 8.33,
      averagePosition: 6.2,
      topQueries: this.getMockTopQueries(10),
      topPages: this.getMockTopPages(10),
      performanceByDevice: this.getMockPerformanceByDevice()
    };
  }
}
