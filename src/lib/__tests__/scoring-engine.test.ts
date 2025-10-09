import { getDealershipScores, getDetailedDealershipScores } from '../scoring-engine';

// Mock the scoring modules
jest.mock('../scoring/sgp-integrity', () => ({
  analyzeSGPIntegrity: jest.fn().mockResolvedValue(85),
  analyzeSGPIntegrityDetailed: jest.fn().mockResolvedValue({
    score: 85,
    details: { schema_markup: 90, structured_data: 80 }
  })
}));

jest.mock('../scoring/zero-click', () => ({
  analyzeZeroClick: jest.fn().mockResolvedValue(75),
  analyzeZeroClickDetailed: jest.fn().mockResolvedValue({
    score: 75,
    details: { featured_snippets: 80, knowledge_panel: 70 }
  })
}));

jest.mock('../scoring/geo-trust', () => ({
  analyzeGeoTrust: jest.fn().mockResolvedValue(90),
  analyzeGeoTrustDetailed: jest.fn().mockResolvedValue({
    score: 90,
    details: { local_citations: 95, nap_consistency: 85 }
  })
}));

jest.mock('../scoring/ugc-health', () => ({
  analyzeUGCHealth: jest.fn().mockResolvedValue(80),
  analyzeUGCHealthDetailed: jest.fn().mockResolvedValue({
    score: 80,
    details: { review_quality: 85, review_quantity: 75 }
  })
}));

jest.mock('../scoring/ai-visibility', () => ({
  analyzeAIVisibility: jest.fn().mockResolvedValue(88),
  analyzeAIVisibilityDetailed: jest.fn().mockResolvedValue({
    score: 88,
    details: { chatgpt_mentions: 90, claude_mentions: 85, perplexity_mentions: 89 }
  })
}));

jest.mock('../utils/cache', () => ({
  getCached: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined)
}));

describe('Scoring Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDealershipScores', () => {
    it('should calculate weighted overall score correctly', async () => {
      const domain = 'test-dealership.com';
      const result = await getDealershipScores(domain);

      expect(result).toEqual({
        ai_visibility: 88,
        zero_click: 75,
        ugc_health: 80,
        geo_trust: 90,
        sgp_integrity: 85,
        overall: expect.any(Number),
        timestamp: expect.any(String)
      });

      // Verify weighted calculation: 88*0.35 + 75*0.20 + 80*0.20 + 90*0.15 + 85*0.10
      const expectedOverall = Math.round(88 * 0.35 + 75 * 0.20 + 80 * 0.20 + 90 * 0.15 + 85 * 0.10);
      expect(result.overall).toBe(expectedOverall);
    });

    it('should return cached result when available', async () => {
      const { getCached } = require('../utils/cache');
      const cachedResult = {
        ai_visibility: 90,
        zero_click: 80,
        ugc_health: 85,
        geo_trust: 95,
        sgp_integrity: 88,
        overall: 87,
        timestamp: '2024-01-01T00:00:00.000Z'
      };
      
      getCached.mockResolvedValueOnce(cachedResult);

      const result = await getDealershipScores('cached-domain.com');
      expect(result).toEqual(cachedResult);
    });

    it('should handle errors gracefully', async () => {
      const { analyzeSGPIntegrity } = require('../scoring/sgp-integrity');
      analyzeSGPIntegrity.mockRejectedValueOnce(new Error('SGP analysis failed'));

      await expect(getDealershipScores('error-domain.com')).rejects.toThrow('SGP analysis failed');
    });
  });

  describe('getDetailedDealershipScores', () => {
    it('should return detailed scores with component breakdown', async () => {
      const domain = 'detailed-test.com';
      const result = await getDetailedDealershipScores(domain);

      expect(result).toEqual({
        ai_visibility: 88,
        zero_click: 75,
        ugc_health: 80,
        geo_trust: 90,
        sgp_integrity: 85,
        overall: expect.any(Number),
        timestamp: expect.any(String),
        details: {
          sgp: expect.objectContaining({
            score: 85,
            details: expect.any(Object)
          }),
          zeroClick: expect.objectContaining({
            score: 75,
            details: expect.any(Object)
          }),
          geo: expect.objectContaining({
            score: 90,
            details: expect.any(Object)
          }),
          ugc: expect.objectContaining({
            score: 80,
            details: expect.any(Object)
          }),
          ai: expect.objectContaining({
            score: 88,
            details: expect.any(Object)
          })
        }
      });
    });

    it('should cache detailed results', async () => {
      const { setCache } = require('../utils/cache');
      await getDetailedDealershipScores('cache-test.com');
      
      expect(setCache).toHaveBeenCalledWith(
        'dai:detailed:cache-test.com',
        expect.any(Object),
        86400
      );
    });
  });

  describe('getDealershipScoresOptimized', () => {
    it('should use pooled results when over budget', async () => {
      const { getTodayQueryCount, getPooledAIScore } = require('../scoring-engine');
      
      // Mock being over budget
      getTodayQueryCount.mockResolvedValueOnce(60); // Over MAX_DAILY_QUERIES (50)
      getPooledAIScore.mockResolvedValueOnce({
        ai_visibility: 85,
        zero_click: 70,
        ugc_health: 75,
        geo_trust: 80,
        sgp_integrity: 82,
        overall: 78,
        timestamp: '2024-01-01T00:00:00.000Z'
      });

      const result = await getDealershipScoresOptimized('pooled-test.com');
      expect(result.overall).toBe(78);
    });

    it('should fall back to estimation when no pooled results', async () => {
      const { getTodayQueryCount, getPooledAIScore } = require('../scoring-engine');
      
      getTodayQueryCount.mockResolvedValueOnce(60);
      getPooledAIScore.mockResolvedValueOnce(null);

      const result = await getDealershipScoresOptimized('estimation-test.com');
      expect(result).toEqual(expect.objectContaining({
        ai_visibility: expect.any(Number),
        zero_click: expect.any(Number),
        ugc_health: expect.any(Number),
        geo_trust: expect.any(Number),
        sgp_integrity: expect.any(Number),
        overall: expect.any(Number),
        timestamp: expect.any(String)
      }));
    });
  });
});
