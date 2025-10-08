import { APIClient } from './APIClient';

export interface AnalyticsData {
  success: boolean;
  data: {
    rowCount: number;
    rows: Array<{
      dimensionValues: Array<{ value: string }>;
      metricValues: Array<{ value: string }>;
    }>;
  };
  metadata: {
    propertyId: string;
    dateRange: { startDate: string; endDate: string };
    requestedAt: string;
  };
}

export interface PageSpeedData {
  success: boolean;
  data: {
    score: number;
    metrics: {
      fcp: string;
      lcp: string;
      cls: string;
      fid: string;
      tbt: string;
      si: string;
      tti: string;
    };
    opportunities: Array<{
      id: string;
      title: string;
      description: string;
      score: number;
      savings: number;
    }>;
  };
  metadata: {
    url: string;
    strategy: string;
    analyzedAt: string;
  };
}

export interface SEMrushData {
  success: boolean;
  data: {
    domain: string;
    reportType: string;
    rows: Array<Record<string, string>>;
    totalRows: number;
    headers: string[];
  };
  metadata: {
    domain: string;
    reportType: string;
    analyzedAt: string;
  };
}

export interface YelpData {
  success: boolean;
  data: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    price: string;
    categories: string[];
    location: {
      address1: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    url: string;
    imageUrl: string;
    isClosed: boolean;
    coordinates: { latitude: number; longitude: number };
    photos: string[];
    hours: Array<{
      day: number;
      start: string;
      end: string;
      is_overnight: boolean;
    }>;
  };
  metadata: {
    businessId: string;
    searchedAt: string;
  };
}

export interface AICitationsData {
  success: boolean;
  data: {
    businessName: string;
    location: string;
    domain?: string;
    overallScore: number;
    mentionsCount: number;
    totalQueries: number;
    results: Array<{
      query: string;
      response: string;
      mentionsBusiness: boolean;
      mentionsDomain: boolean;
      score: number;
      error?: string;
    }>;
    recommendations: string[];
    analyzedAt: string;
  };
  metadata: {
    businessName: string;
    location: string;
    domain?: string;
    analyzedAt: string;
  };
}

export class DataService {
  private client: APIClient;
  private baseURL: string;

  constructor() {
    this.client = new APIClient();
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  // Analytics Methods
  async getAnalyticsData(startDate: string = '7daysAgo', endDate: string = 'today'): Promise<AnalyticsData> {
    try {
      const response = await this.client.request(`${this.baseURL}/analytics`, {
        method: 'POST',
        body: JSON.stringify({
          propertyId: process.env.NEXT_PUBLIC_GA_PROPERTY_ID || 'mock-property',
          startDate,
          endDate,
          metrics: [
            { name: 'sessions' },
            { name: 'users' },
            { name: 'pageviews' },
            { name: 'bounceRate' }
          ],
          dimensions: [
            { name: 'date' },
            { name: 'deviceCategory' }
          ]
        })
      });
      return response;
    } catch (error) {
      console.error('Analytics Error:', error);
      return this.getMockAnalyticsData();
    }
  }

  async getPageSpeedData(url: string, strategy: string = 'mobile'): Promise<PageSpeedData> {
    try {
      const response = await this.client.request(
        `${this.baseURL}/pagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`
      );
      return response;
    } catch (error) {
      console.error('PageSpeed Error:', error);
      return this.getMockPageSpeedData(url);
    }
  }

  async getSEMrushData(domain: string, reportType: string = 'domain_ranks'): Promise<SEMrushData> {
    try {
      const response = await this.client.request(
        `${this.baseURL}/semrush?domain=${encodeURIComponent(domain)}&type=${reportType}`
      );
      return response;
    } catch (error) {
      console.error('SEMrush Error:', error);
      return this.getMockSEMrushData(domain);
    }
  }

  async getYelpData(businessId?: string, name?: string, location?: string): Promise<YelpData> {
    try {
      let url = `${this.baseURL}/yelp`;
      const params = new URLSearchParams();
      
      if (businessId) {
        params.append('businessId', businessId);
      } else if (name && location) {
        params.append('name', name);
        params.append('location', location);
      } else {
        throw new Error('Either businessId or (name and location) required');
      }
      
      url += `?${params.toString()}`;
      
      const response = await this.client.request(url);
      return response;
    } catch (error) {
      console.error('Yelp Error:', error);
      return this.getMockYelpData(businessId, name, location);
    }
  }

  async getAICitationsData(businessName: string, location: string, domain?: string): Promise<AICitationsData> {
    try {
      const response = await this.client.request(`${this.baseURL}/ai-citations`, {
        method: 'POST',
        body: JSON.stringify({
          businessName,
          location,
          domain
        })
      });
      return response;
    } catch (error) {
      console.error('AI Citations Error:', error);
      return this.getMockAICitationsData(businessName, location, domain);
    }
  }

  // Mock Data Methods
  private getMockAnalyticsData(): AnalyticsData {
    return {
      success: true,
      data: {
        rowCount: 7,
        rows: [
          {
            dimensionValues: [{ value: '2024-01-01' }, { value: 'desktop' }],
            metricValues: [{ value: '150' }, { value: '120' }, { value: '300' }, { value: '0.45' }]
          },
          {
            dimensionValues: [{ value: '2024-01-02' }, { value: 'mobile' }],
            metricValues: [{ value: '200' }, { value: '180' }, { value: '450' }, { value: '0.38' }]
          }
        ]
      },
      metadata: {
        propertyId: 'mock-property',
        dateRange: { startDate: '7daysAgo', endDate: 'today' },
        requestedAt: new Date().toISOString()
      }
    };
  }

  private getMockPageSpeedData(url: string): PageSpeedData {
    return {
      success: true,
      data: {
        score: 87,
        metrics: {
          fcp: '1.2s',
          lcp: '2.1s',
          cls: '0.05',
          fid: '125ms',
          tbt: '180ms',
          si: '2.3s',
          tti: '3.1s'
        },
        opportunities: [
          {
            id: 'unused-css-rules',
            title: 'Remove unused CSS',
            description: 'Remove unused CSS rules to reduce bytes consumed by network activity.',
            score: 0.85,
            savings: 1200
          },
          {
            id: 'render-blocking-resources',
            title: 'Eliminate render-blocking resources',
            description: 'Resources are blocking the first paint of your page.',
            score: 0.72,
            savings: 800
          }
        ]
      },
      metadata: {
        url,
        strategy: 'mobile',
        analyzedAt: new Date().toISOString()
      }
    };
  }

  private getMockSEMrushData(domain: string): SEMrushData {
    return {
      success: true,
      data: {
        domain,
        reportType: 'domain_ranks',
        rows: [
          {
            Rk: '1,234',
            Or: '45,678',
            Ot: '12,345',
            Oc: '8,901',
            Ad: '2,345',
            At: '1,234',
            Ac: '567',
            Ar: '89',
            Aw: '12'
          }
        ],
        totalRows: 1,
        headers: ['Rk', 'Or', 'Ot', 'Oc', 'Ad', 'At', 'Ac', 'Ar', 'Aw']
      },
      metadata: {
        domain,
        reportType: 'domain_ranks',
        analyzedAt: new Date().toISOString()
      }
    };
  }

  private getMockYelpData(businessId?: string, name?: string, location?: string): YelpData {
    return {
      success: true,
      data: {
        id: businessId || 'mock-business-id',
        name: name || 'Mock Dealership',
        rating: 4.2,
        reviewCount: 127,
        price: '$$',
        categories: ['Automotive', 'Car Dealers'],
        location: {
          address1: '123 Main St',
          city: location?.split(',')[0] || 'Anytown',
          state: location?.split(',')[1]?.trim() || 'CA',
          zipCode: '12345',
          country: 'US'
        },
        phone: '+1-555-0123',
        url: 'https://yelp.com/biz/mock-business',
        imageUrl: 'https://example.com/image.jpg',
        isClosed: false,
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        hours: [
          { day: 0, start: '1000', end: '1800', is_overnight: false },
          { day: 1, start: '1000', end: '1800', is_overnight: false }
        ]
      },
      metadata: {
        businessId: businessId || 'mock-business-id',
        searchedAt: new Date().toISOString()
      }
    };
  }

  private getMockAICitationsData(businessName: string, location: string, domain?: string): AICitationsData {
    return {
      success: true,
      data: {
        businessName,
        location,
        domain,
        overallScore: 73,
        mentionsCount: 3,
        totalQueries: 5,
        results: [
          {
            query: `best car dealership in ${location}`,
            response: `${businessName} is one of the top-rated dealerships in ${location}...`,
            mentionsBusiness: true,
            mentionsDomain: !!domain,
            score: 100
          },
          {
            query: `where to buy a car in ${location}`,
            response: 'There are several options in the area...',
            mentionsBusiness: false,
            mentionsDomain: false,
            score: 0
          }
        ],
        recommendations: [
          'Improve local SEO optimization',
          'Add more location-specific content',
          'Focus on long-tail keyword optimization'
        ],
        analyzedAt: new Date().toISOString()
      },
      metadata: {
        businessName,
        location,
        domain,
        analyzedAt: new Date().toISOString()
      }
    };
  }
}
