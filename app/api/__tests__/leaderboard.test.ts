import { NextRequest } from 'next/server';
import { GET } from '../leaderboard/route';

// Mock the database service
jest.mock('@/lib/database/leaderboard-service', () => ({
  getLeaderboardData: jest.fn(),
  getTenantLeaderboardData: jest.fn(),
}));

describe('/api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/leaderboard', () => {
    it('should return leaderboard data with default parameters', async () => {
      const { getLeaderboardData } = require('@/lib/database/leaderboard-service');
      const mockData = {
        leaderboard: [
          {
            id: '1',
            name: 'Test Dealership',
            brand: 'Toyota',
            city: 'Test City',
            state: 'CA',
            tier: 'pro',
            visibility_score: 85,
            total_mentions: 20,
            avg_rank: 2.5,
            sentiment_score: 0.8,
            total_citations: 15,
            scan_date: '2024-01-01',
            rank: 1,
            score_change: 5,
            percent_change: 6.25
          }
        ],
        summary: {
          total_dealers: 1,
          avg_visibility_score: 85,
          total_mentions: 20,
          avg_sentiment: 0.8,
          scan_date: '2024-01-01'
        },
        distributions: {
          tier: { pro: 1 },
          brand: { Toyota: 1 },
          state: { CA: 1 }
        },
        highlights: {
          top_performers: [],
          biggest_gainers: [],
          biggest_losers: []
        },
        filters_applied: {
          limit: 100,
          sortBy: 'visibility_score',
          sortOrder: 'desc'
        }
      };

      getLeaderboardData.mockResolvedValue(mockData);

      const request = new NextRequest('http://localhost:3000/api/leaderboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
      expect(getLeaderboardData).toHaveBeenCalledWith({});
    });

    it('should handle query parameters correctly', async () => {
      const { getLeaderboardData } = require('@/lib/database/leaderboard-service');
      getLeaderboardData.mockResolvedValue({
        leaderboard: [],
        summary: { total_dealers: 0, avg_visibility_score: 0, total_mentions: 0, avg_sentiment: 0, scan_date: '2024-01-01' },
        distributions: { tier: {}, brand: {}, state: {} },
        highlights: { top_performers: [], biggest_gainers: [], biggest_losers: [] },
        filters_applied: {}
      });

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=50&tier=pro&state=CA&brand=Toyota&sortBy=total_mentions&sortOrder=asc');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(getLeaderboardData).toHaveBeenCalledWith({
        limit: 50,
        tier: 'pro',
        state: 'CA',
        brand: 'Toyota',
        sortBy: 'total_mentions',
        sortOrder: 'asc'
      });
    });

    it('should handle database errors gracefully', async () => {
      const { getLeaderboardData } = require('@/lib/database/leaderboard-service');
      getLeaderboardData.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/leaderboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch leaderboard data');
      expect(data.details).toBe('Database connection failed');
    });

    it('should validate limit parameter', async () => {
      const { getLeaderboardData } = require('@/lib/database/leaderboard-service');
      getLeaderboardData.mockResolvedValue({
        leaderboard: [],
        summary: { total_dealers: 0, avg_visibility_score: 0, total_mentions: 0, avg_sentiment: 0, scan_date: '2024-01-01' },
        distributions: { tier: {}, brand: {}, state: {} },
        highlights: { top_performers: [], biggest_gainers: [], biggest_losers: [] },
        filters_applied: {}
      });

      // Test with invalid limit
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=invalid');
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should default to 100 when limit is invalid
      expect(getLeaderboardData).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'visibility_score',
        sortOrder: 'desc'
      });
    });

    it('should handle empty results', async () => {
      const { getLeaderboardData } = require('@/lib/database/leaderboard-service');
      const emptyData = {
        leaderboard: [],
        summary: {
          total_dealers: 0,
          avg_visibility_score: 0,
          total_mentions: 0,
          avg_sentiment: 0,
          scan_date: new Date().toISOString().split('T')[0]
        },
        distributions: { tier: {}, brand: {}, state: {} },
        highlights: { top_performers: [], biggest_gainers: [], biggest_losers: [] },
        filters_applied: { limit: 100, sortBy: 'visibility_score', sortOrder: 'desc' }
      };

      getLeaderboardData.mockResolvedValue(emptyData);

      const request = new NextRequest('http://localhost:3000/api/leaderboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.leaderboard).toEqual([]);
      expect(data.data.summary.total_dealers).toBe(0);
    });
  });
});
