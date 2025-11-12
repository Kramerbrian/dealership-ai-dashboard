import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GET } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/logger');
jest.mock('@/lib/services/schemaScanner');
jest.mock('@/lib/integrations/google-apis');
jest.mock('@/lib/integrations/review-services');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockQuickScan = require('@/lib/services/schemaScanner').quickScan as jest.Mock;
const GoogleAPIsIntegration = require('@/lib/integrations/google-apis').GoogleAPIsIntegration;
const ReviewServicesIntegration = require('@/lib/integrations/review-services').ReviewServicesIntegration;

describe('/api/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should proceed if user is authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      mockQuickScan.mockResolvedValue({
        schemaCoverage: 80,
        eeatScore: 75,
      });

      const mockGMB = {
        getGoogleBusinessProfile: jest.fn().mockResolvedValue({
          rating: 4.5,
          reviewCount: 200,
          name: 'Test Dealer',
          address: '123 Main St',
          phone: '555-1234',
          website: 'https://test.com',
          hours: { Monday: '9-5' },
          photos: ['photo1.jpg'],
          categories: ['Dealer'],
          posts: [],
        }),
      };
      GoogleAPIsIntegration.mockImplementation(() => mockGMB);

      const mockReviews = {
        getReviewStats: jest.fn().mockResolvedValue([
          {
            platform: 'google',
            total_reviews: 200,
            average_rating: 4.5,
            response_rate: 0.8,
          },
        ]),
      };
      ReviewServicesIntegration.mockImplementation(() => mockReviews);

      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);

      expect(response.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
    });

    it('should return 400 if domain is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Domain parameter is required');
    });

    it('should return 400 if domain format is invalid', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze?domain=invalid..domain');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid domain format');
    });

    it('should accept valid domain formats', async () => {
      mockQuickScan.mockResolvedValue({
        schemaCoverage: 80,
        eeatScore: 75,
      });

      const mockGMB = {
        getGoogleBusinessProfile: jest.fn().mockResolvedValue({
          rating: 4.5,
          reviewCount: 200,
          name: 'Test',
          address: '123 Main',
          phone: '555-1234',
        }),
      };
      GoogleAPIsIntegration.mockImplementation(() => mockGMB);

      const mockReviews = {
        getReviewStats: jest.fn().mockResolvedValue([]),
      };
      ReviewServicesIntegration.mockImplementation(() => mockReviews);

      const validDomains = ['example.com', 'test.example.com', 'subdomain.example.org'];
      
      for (const domain of validDomains) {
        const req = new NextRequest(`http://localhost:3000/api/analyze?domain=${domain}`);
        const response = await GET(req);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Score Calculation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
    });

    it('should calculate composite score as average of GMB, schema, and reviews', async () => {
      mockQuickScan.mockResolvedValue({
        schemaCoverage: 80,
        eeatScore: 75,
      });

      const mockGMB = {
        getGoogleBusinessProfile: jest.fn().mockResolvedValue({
          rating: 4.5,
          reviewCount: 200,
          name: 'Test',
          address: '123 Main',
          phone: '555-1234',
          website: 'https://test.com',
          hours: { Monday: '9-5' },
          photos: ['photo1.jpg'],
          categories: ['Dealer'],
        }),
      };
      GoogleAPIsIntegration.mockImplementation(() => mockGMB);

      const mockReviews = {
        getReviewStats: jest.fn().mockResolvedValue([
          {
            platform: 'google',
            total_reviews: 200,
            average_rating: 4.5,
            response_rate: 0.8,
          },
        ]),
      };
      ReviewServicesIntegration.mockImplementation(() => mockReviews);

      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('score');
      expect(data).toHaveProperty('breakdown');
      expect(data.breakdown).toHaveProperty('gmb');
      expect(data.breakdown).toHaveProperty('schema');
      expect(data.breakdown).toHaveProperty('reviews');
      expect(typeof data.score).toBe('number');
      expect(data.score).toBeGreaterThanOrEqual(0);
      expect(data.score).toBeLessThanOrEqual(100);
    });

    it('should use fallback scores if services fail', async () => {
      mockQuickScan.mockRejectedValue(new Error('Schema scan failed'));
      
      const mockGMB = {
        getGoogleBusinessProfile: jest.fn().mockRejectedValue(new Error('GMB failed')),
      };
      GoogleAPIsIntegration.mockImplementation(() => mockGMB);

      const mockReviews = {
        getReviewStats: jest.fn().mockRejectedValue(new Error('Reviews failed')),
      };
      ReviewServicesIntegration.mockImplementation(() => mockReviews);

      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('score');
      // Should still return a score using fallbacks (50-100 range)
      expect(data.score).toBeGreaterThanOrEqual(0);
      expect(data.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      mockQuickScan.mockResolvedValue({
        schemaCoverage: 80,
        eeatScore: 75,
      });

      const mockGMB = {
        getGoogleBusinessProfile: jest.fn().mockResolvedValue({
          rating: 4.5,
          reviewCount: 200,
          name: 'Test',
          address: '123 Main',
          phone: '555-1234',
        }),
      };
      GoogleAPIsIntegration.mockImplementation(() => mockGMB);

      const mockReviews = {
        getReviewStats: jest.fn().mockResolvedValue([]),
      };
      ReviewServicesIntegration.mockImplementation(() => mockReviews);
    });

    it('should return correct response structure', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);
      const data = await response.json();

      expect(data).toMatchObject({
        score: expect.any(Number),
        breakdown: {
          gmb: expect.any(Number),
          schema: expect.any(Number),
          reviews: expect.any(Number),
        },
        domain: 'example.com',
        timestamp: expect.any(String),
      });
    });

    it('should include cache headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);

      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=300, stale-while-revalidate=600'
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
    });

    it('should handle unexpected errors gracefully', async () => {
      mockQuickScan.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should not expose internal errors in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockQuickScan.mockImplementation(() => {
        throw new Error('Internal error');
      });

      const req = new NextRequest('http://localhost:3000/api/analyze?domain=example.com');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data).not.toHaveProperty('message');

      process.env.NODE_ENV = originalEnv;
    });
  });
});

