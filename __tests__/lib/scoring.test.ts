/**
 * Unit Tests for Scoring Functions
 * Tests the core scoring logic in lib/scoring.ts
 */

// Mock Next.js server environment
if (typeof global.Request === 'undefined') {
  const { Request, Response, Headers } = require('undici');
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
}

import {
  scoreComposite,
  scoreAIVisibility,
  scoreWebsiteHealth,
  scoreEEAT,
  scoreOverall,
  scoreMystery,
  consensus,
  getMetricAlert,
  rarCPC,
  type MetricBlock,
  type EngineCoverage,
  type IssueHit,
} from '@/lib/scoring';

describe('Scoring Functions', () => {
  describe('scoreComposite', () => {
    it('calculates SEO score correctly', () => {
      const metrics: MetricBlock = {
        mentions: 80,
        citations: 85,
        sentiment: 75,
        shareOfVoice: 70,
      };
      const score = scoreComposite(metrics, 'seo');
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('calculates AEO score correctly', () => {
      const metrics: MetricBlock = {
        mentions: 70,
        citations: 75,
        sentiment: 65,
        shareOfVoice: 60,
      };
      const score = scoreComposite(metrics, 'aeo');
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('calculates GEO score correctly', () => {
      const metrics: MetricBlock = {
        mentions: 75,
        citations: 80,
        sentiment: 70,
        shareOfVoice: 65,
      };
      const score = scoreComposite(metrics, 'geo');
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('clamps scores to 0-100 range', () => {
      const highMetrics: MetricBlock = {
        mentions: 200,
        citations: 200,
        sentiment: 200,
        shareOfVoice: 200,
      };
      const lowMetrics: MetricBlock = {
        mentions: -50,
        citations: -50,
        sentiment: -50,
        shareOfVoice: -50,
      };
      
      const highScore = scoreComposite(highMetrics, 'seo');
      const lowScore = scoreComposite(lowMetrics, 'seo');
      
      expect(highScore).toBeLessThanOrEqual(100);
      expect(lowScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('scoreAIVisibility', () => {
    it('calculates AI visibility score correctly', () => {
      const coverage: EngineCoverage = {
        perplexity: 75,
        chatgpt: 80,
        gemini: 70,
      };
      const score = scoreAIVisibility(coverage);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('weights engines correctly (ChatGPT 40%, Gemini 35%, Perplexity 25%)', () => {
      const coverage: EngineCoverage = {
        perplexity: 100,
        chatgpt: 0,
        gemini: 0,
      };
      const score1 = scoreAIVisibility(coverage);
      
      const coverage2: EngineCoverage = {
        perplexity: 0,
        chatgpt: 100,
        gemini: 0,
      };
      const score2 = scoreAIVisibility(coverage2);
      
      // ChatGPT should have higher weight, so score2 should be higher
      expect(score2).toBeGreaterThan(score1);
    });

    it('clamps to 0-100 range', () => {
      const highCoverage: EngineCoverage = {
        perplexity: 200,
        chatgpt: 200,
        gemini: 200,
      };
      const score = scoreAIVisibility(highCoverage);
      
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('scoreWebsiteHealth', () => {
    it('calculates website health score correctly', () => {
      const vitals = { lcp: 2.0, inp: 150, cls: 0.05 };
      const meta = { title: 0.9, description: 0.85, h1: 0.95 };
      const indexation = { indexed: 950, excluded: 50 };
      
      const score = scoreWebsiteHealth(vitals, meta, indexation);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('penalizes poor LCP scores', () => {
      const goodVitals = { lcp: 2.0, inp: 150, cls: 0.05 };
      const poorVitals = { lcp: 5.0, inp: 150, cls: 0.05 };
      const meta = { title: 0.9, description: 0.85, h1: 0.95 };
      const indexation = { indexed: 950, excluded: 50 };
      
      const goodScore = scoreWebsiteHealth(goodVitals, meta, indexation);
      const poorScore = scoreWebsiteHealth(poorVitals, meta, indexation);
      
      expect(goodScore).toBeGreaterThan(poorScore);
    });
  });

  describe('scoreEEAT', () => {
    it('returns 100 when all flags are true', () => {
      const flags = { exp: true, expx: true, auth: true, trust: true };
      const score = scoreEEAT(flags);
      
      expect(score).toBe(100);
    });

    it('returns 75 when 3 of 4 flags are true', () => {
      const flags = { exp: true, expx: true, auth: true, trust: false };
      const score = scoreEEAT(flags);
      
      expect(score).toBe(75);
    });

    it('returns 50 when 2 of 4 flags are true', () => {
      const flags = { exp: true, expx: true, auth: false, trust: false };
      const score = scoreEEAT(flags);
      
      expect(score).toBe(50);
    });

    it('returns 0 when no flags are true', () => {
      const flags = { exp: false, expx: false, auth: false, trust: false };
      const score = scoreEEAT(flags);
      
      expect(score).toBe(0);
    });
  });

  describe('scoreOverall', () => {
    it('calculates overall score correctly', () => {
      const parts = {
        seo: 80,
        aeo: 75,
        geo: 70,
        ai: 85,
        wh: 90,
        mystery: 80,
      };
      const score = scoreOverall(parts);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('weights components correctly', () => {
      // AEO should have higher weight (25%) than GEO (15%)
      const parts1 = {
        seo: 50,
        aeo: 100,
        geo: 50,
        ai: 50,
        wh: 50,
        mystery: 50,
      };
      const parts2 = {
        seo: 50,
        aeo: 50,
        geo: 100,
        ai: 50,
        wh: 50,
        mystery: 50,
      };
      
      const score1 = scoreOverall(parts1);
      const score2 = scoreOverall(parts2);
      
      // score1 should be higher because AEO has more weight
      expect(score1).toBeGreaterThan(score2);
    });
  });

  describe('scoreMystery', () => {
    it('calculates mystery score correctly', () => {
      const metrics = {
        speedToLead: 80,
        quoteTransparency: 75,
        phoneEtiquette: 85,
        chatResponsiveness: 70,
        apptSetRate: 75,
        followUp: 80,
      };
      const score = scoreMystery(metrics);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('consensus', () => {
    it('identifies unanimous consensus (3/3 engines)', () => {
      const hits: IssueHit[] = [
        { id: 'issue1', engine: 'perplexity' },
        { id: 'issue1', engine: 'chatgpt' },
        { id: 'issue1', engine: 'gemini' },
      ];
      
      const results = consensus(hits);
      const issue1 = results.find(r => r.id === 'issue1');
      
      expect(issue1).toBeDefined();
      expect(issue1?.unanimous).toBe(true);
      expect(issue1?.majority).toBe(false);
      expect(issue1?.weak).toBe(false);
      expect(issue1?.engines).toHaveLength(3);
    });

    it('identifies majority consensus (2/3 engines)', () => {
      const hits: IssueHit[] = [
        { id: 'issue2', engine: 'perplexity' },
        { id: 'issue2', engine: 'chatgpt' },
      ];
      
      const results = consensus(hits);
      const issue2 = results.find(r => r.id === 'issue2');
      
      expect(issue2).toBeDefined();
      expect(issue2?.unanimous).toBe(false);
      expect(issue2?.majority).toBe(true);
      expect(issue2?.weak).toBe(false);
      expect(issue2?.engines).toHaveLength(2);
    });

    it('identifies weak consensus (1/3 engines)', () => {
      const hits: IssueHit[] = [
        { id: 'issue3', engine: 'perplexity' },
      ];
      
      const results = consensus(hits);
      const issue3 = results.find(r => r.id === 'issue3');
      
      expect(issue3).toBeDefined();
      expect(issue3?.unanimous).toBe(false);
      expect(issue3?.majority).toBe(false);
      expect(issue3?.weak).toBe(true);
      expect(issue3?.engines).toHaveLength(1);
    });

    it('calculates weight correctly', () => {
      const hits: IssueHit[] = [
        { id: 'issue4', engine: 'chatgpt' }, // 0.40 weight
        { id: 'issue4', engine: 'gemini' },  // 0.35 weight
      ];
      
      const results = consensus(hits);
      const issue4 = results.find(r => r.id === 'issue4');
      
      expect(issue4?.weight).toBeCloseTo(0.75, 2); // 0.40 + 0.35
    });
  });

  describe('getMetricAlert', () => {
    it('returns green for high scores', () => {
      expect(getMetricAlert('seo', 90)).toBe('green');
      expect(getMetricAlert('aeo', 85)).toBe('green');
      expect(getMetricAlert('geo', 90)).toBe('green');
    });

    it('returns yellow for medium scores', () => {
      expect(getMetricAlert('seo', 75)).toBe('yellow');
      expect(getMetricAlert('aeo', 70)).toBe('yellow');
      expect(getMetricAlert('geo', 75)).toBe('yellow');
    });

    it('returns red for low scores', () => {
      expect(getMetricAlert('seo', 50)).toBe('red');
      expect(getMetricAlert('aeo', 40)).toBe('red');
      expect(getMetricAlert('geo', 50)).toBe('red');
    });

    it('handles E-E-A-T correctly (signals count, not percentage)', () => {
      expect(getMetricAlert('eeat', 4)).toBe('green'); // 4/4 signals
      expect(getMetricAlert('eeat', 3)).toBe('yellow'); // 3/4 signals
      expect(getMetricAlert('eeat', 2)).toBe('red'); // 2/4 signals
    });
  });

  describe('rarCPC', () => {
    it('calculates revenue at risk using CPC proxy', () => {
      const missedClicks = {
        buy: 10,
        sell: 5,
        service: 8,
        trade: 3,
      };
      
      const rar = rarCPC(missedClicks);
      
      expect(rar).toBeGreaterThan(0);
      expect(typeof rar).toBe('number');
    });

    it('uses default CPC values when not provided', () => {
      const missedClicks = {
        buy: 10,
      };
      
      const rar = rarCPC(missedClicks);
      
      // Default buy CPC is 14, so 10 * 14 = 140
      expect(rar).toBe(140);
    });

    it('uses custom CPC values when provided', () => {
      const missedClicks = {
        buy: 10,
      };
      const customCPC = {
        buy: 20,
      };
      
      const rar = rarCPC(missedClicks, customCPC);
      
      expect(rar).toBe(200); // 10 * 20
    });
  });
});

