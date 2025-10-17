// Quick Audit API Tests
// DealershipAI - Comprehensive API testing

import { GET } from '@/app/api/quick-audit/route';
import { NextRequest } from 'next/server';

// Mock external dependencies
jest.mock('@/lib/cache', () => ({
  getCached: jest.fn(),
  setCached: jest.fn(),
}));

jest.mock('@/lib/scoring', () => ({
  calculateAIVScore: jest.fn(),
  calculateZeroClickScore: jest.fn(),
  calculateUGCHealthScore: jest.fn(),
  calculateGeoTrustScore: jest.fn(),
  calculateSGPIntegrityScore: jest.fn(),
}));

describe('Quick Audit API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return scores for valid domain', async () => {
    const url = new URL('http://localhost:3000/api/quick-audit?domain=example-dealership.com');
    const request = new NextRequest(url);
    
    // Mock scoring functions
    const { calculateAIVScore, calculateZeroClickScore, calculateUGCHealthScore, calculateGeoTrustScore, calculateSGPIntegrityScore } = require('@/lib/scoring');
    calculateAIVScore.mockResolvedValue(72);
    calculateZeroClickScore.mockResolvedValue(65);
    calculateUGCHealthScore.mockResolvedValue(88);
    calculateGeoTrustScore.mockResolvedValue(91);
    calculateSGPIntegrityScore.mockResolvedValue(79);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('scores');
    expect(data.scores).toHaveProperty('ai_visibility');
    expect(data.scores.ai_visibility).toBeGreaterThanOrEqual(0);
    expect(data.scores.ai_visibility).toBeLessThanOrEqual(100);
    expect(data.scores).toHaveProperty('zero_click');
    expect(data.scores).toHaveProperty('ugc_health');
    expect(data.scores).toHaveProperty('geo_trust');
    expect(data.scores).toHaveProperty('sgp_integrity');
  });

  it('should handle invalid domain gracefully', async () => {
    const url = new URL('http://localhost:3000/api/quick-audit?domain=not-a-valid-domain');
    const request = new NextRequest(url);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Invalid domain');
  });

  it('should use cached results when available', async () => {
    const { getCached } = require('@/lib/cache');
    const cachedResult = {
      scores: { ai_visibility: 75, zero_click: 70, ugc_health: 85, geo_trust: 90, sgp_integrity: 80 },
      timestamp: new Date().toISOString()
    };
    getCached.mockResolvedValue(cachedResult);

    const url = new URL('http://localhost:3000/api/quick-audit?domain=cached-example.com');
    const request = new NextRequest(url);
    
    const response = await GET(request);
    const headers = Object.fromEntries(response.headers.entries());
    
    expect(response.status).toBe(200);
    expect(headers['x-cache-status']).toBe('HIT');
  });

  it('should enforce rate limiting', async () => {
    // Mock rate limiter to reject after 100 requests
    const { checkLimit } = require('@/lib/rate-limit');
    checkLimit.mockImplementation((ip, config) => {
      return ip === 'test-ip' ? false : true; // Simulate rate limit exceeded
    });

    const url = new URL('http://localhost:3000/api/quick-audit?domain=test.com');
    const request = new NextRequest(url);
    request.headers.set('x-forwarded-for', 'test-ip');
    
    const response = await GET(request);
    
    expect(response.status).toBe(429);
  });

  it('should handle scoring errors gracefully', async () => {
    const { calculateAIVScore } = require('@/lib/scoring');
    calculateAIVScore.mockRejectedValue(new Error('Scoring service unavailable'));

    const url = new URL('http://localhost:3000/api/quick-audit?domain=example.com');
    const request = new NextRequest(url);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
  });

  it('should include performance metrics in response', async () => {
    const url = new URL('http://localhost:3000/api/quick-audit?domain=example.com');
    const request = new NextRequest(url);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('performance');
    expect(data.performance).toHaveProperty('processing_time_ms');
    expect(data.performance.processing_time_ms).toBeGreaterThan(0);
  });

  it('should validate domain format strictly', async () => {
    const invalidDomains = [
      'not-a-domain',
      'http://',
      'ftp://example.com',
      'example',
      'example..com',
      'example.com/path'
    ];

    for (const domain of invalidDomains) {
      const url = new URL(`http://localhost:3000/api/quick-audit?domain=${encodeURIComponent(domain)}`);
      const request = new NextRequest(url);
      
      const response = await GET(request);
      expect(response.status).toBe(400);
    }
  });

  it('should handle concurrent requests efficiently', async () => {
    const requests = Array.from({ length: 10 }, (_, i) => {
      const url = new URL(`http://localhost:3000/api/quick-audit?domain=test${i}.com`);
      return new NextRequest(url);
    });
    
    const startTime = Date.now();
    const responses = await Promise.all(requests.map(req => GET(req)));
    const endTime = Date.now();
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    // Should handle 10 concurrent requests in reasonable time
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
