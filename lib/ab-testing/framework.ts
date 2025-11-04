'use client';

/**
 * A/B Testing Framework
 * Enables data-driven optimization with statistical significance tracking
 */

export interface TestVariant {
  id: string;
  name: string;
  component: React.ReactNode;
  weight?: number; // 0-100, default 50
}

export interface TestConfig {
  id: string;
  name: string;
  description: string;
  variants: TestVariant[];
  active: boolean;
  startDate: Date;
  minSampleSize?: number; // Minimum samples before determining winner
  confidenceLevel?: number; // 0.95 = 95% confidence
}

export interface TestResult {
  testId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  isWinner: boolean;
}

class ABTestingFramework {
  private tests: Map<string, TestConfig> = new Map();
  private results: Map<string, Map<string, TestResult>> = new Map();
  private userTests: Map<string, string> = new Map(); // userId -> testId -> variantId

  /**
   * Register a new A/B test
   */
  registerTest(config: TestConfig): void {
    this.tests.set(config.id, config);
    this.results.set(config.id, new Map());
  }

  /**
   * Get a variant for the current user
   * Implements consistent assignment (user sees same variant)
   */
  getVariant(testId: string, userId?: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !test.active) return null;

    // Generate consistent user ID if not provided
    const consistentUserId = userId || this.getOrCreateUserId();

    // Check if user already has a variant assigned
    const userKey = `${consistentUserId}-${testId}`;
    const storedVariant = this.getStoredVariant(testId, consistentUserId);
    if (storedVariant) {
      return storedVariant;
    }

    // Assign variant based on weight
    const variant = this.assignVariant(test, consistentUserId);
    
    // Store assignment
    this.storeVariant(testId, consistentUserId, variant);
    
    // Track impression
    this.trackImpression(testId, variant);

    return variant;
  }

  /**
   * Assign variant based on weights
   */
  private assignVariant(test: TestConfig, userId: string): string {
    // Use consistent hashing for deterministic assignment
    const hash = this.hashString(userId + test.id);
    const random = hash % 100;

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      const weight = variant.weight || 50;
      cumulativeWeight += weight;
      if (random < cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return test.variants[0].id;
  }

  /**
   * Track a conversion for a test variant
   */
  trackConversion(testId: string, variantId: string, metadata?: Record<string, any>): void {
    const result = this.getOrCreateResult(testId, variantId);
    result.conversions++;
    result.conversionRate = (result.conversions / result.impressions) * 100;
    
    // Recalculate confidence
    this.calculateConfidence(testId);

    // Save to localStorage
    this.saveResults();

    // Track in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        test_id: testId,
        variant_id: variantId,
        conversion_rate: result.conversionRate,
        ...metadata
      });
    }
  }

  /**
   * Track an impression for a test variant
   */
  trackImpression(testId: string, variantId: string): void {
    const result = this.getOrCreateResult(testId, variantId);
    result.impressions++;
    result.conversionRate = (result.conversions / result.impressions) * 100;

    // Save to localStorage
    this.saveResults();

    // Track in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_impression', {
        test_id: testId,
        variant_id: variantId
      });
    }
  }

  /**
   * Get test results
   */
  getResults(testId: string): Map<string, TestResult> | null {
    return this.results.get(testId) || null;
  }

  /**
   * Get winner for a test (if statistically significant)
   */
  getWinner(testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    const results = this.results.get(testId);
    if (!results) return null;

    const minSampleSize = test.minSampleSize || 100;
    const variants = Array.from(results.values());

    // Check if we have enough samples
    const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);
    if (totalImpressions < minSampleSize) return null;

    // Find variant with highest conversion rate
    const winner = variants.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    // Check if winner is statistically significant
    const confidence = test.confidenceLevel || 0.95;
    if (winner.confidence >= confidence) {
      return winner.variantId;
    }

    return null;
  }

  /**
   * Calculate statistical significance (Z-test)
   */
  private calculateConfidence(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) return;

    const results = this.results.get(testId);
    if (!results) return;

    const variants = Array.from(results.values());
    if (variants.length < 2) return;

    // Calculate pooled proportion
    const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);
    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    const pooledP = totalConversions / totalImpressions;

    // Compare each variant to control (first variant)
    const control = variants[0];
    
    for (let i = 1; i < variants.length; i++) {
      const variant = variants[i];
      
      // Z-test for proportions
      const p1 = control.conversionRate / 100;
      const p2 = variant.conversionRate / 100;
      const n1 = control.impressions;
      const n2 = variant.impressions;

      if (n1 === 0 || n2 === 0) continue;

      const pooled = (control.conversions + variant.conversions) / (n1 + n2);
      const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));
      
      if (se === 0) continue;

      const z = (p2 - p1) / se;
      const confidence = this.zToConfidence(Math.abs(z));
      
      variant.confidence = confidence;
      variant.isWinner = confidence >= (test.confidenceLevel || 0.95) && p2 > p1;
    }

    this.saveResults();
  }

  /**
   * Convert Z-score to confidence level
   */
  private zToConfidence(z: number): number {
    // Simplified Z-score to confidence conversion
    // 1.96 = 95%, 2.58 = 99%, 3.29 = 99.9%
    if (z >= 3.29) return 0.999;
    if (z >= 2.58) return 0.99;
    if (z >= 1.96) return 0.95;
    if (z >= 1.65) return 0.90;
    return 0.50;
  }

  /**
   * Get or create user ID
   */
  private getOrCreateUserId(): string {
    if (typeof window === 'undefined') return 'server-' + Date.now();

    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }

  /**
   * Store variant assignment
   */
  private storeVariant(testId: string, userId: string, variantId: string): void {
    if (typeof window === 'undefined') return;
    
    const key = `ab_test_${testId}_${userId}`;
    localStorage.setItem(key, variantId);
  }

  /**
   * Get stored variant assignment
   */
  private getStoredVariant(testId: string, userId: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const key = `ab_test_${testId}_${userId}`;
    return localStorage.getItem(key);
  }

  /**
   * Get or create result object
   */
  private getOrCreateResult(testId: string, variantId: string): TestResult {
    const results = this.results.get(testId);
    if (!results) {
      this.results.set(testId, new Map());
    }

    const testResults = this.results.get(testId)!;
    if (!testResults.has(variantId)) {
      testResults.set(variantId, {
        testId,
        variantId,
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
        confidence: 0,
        isWinner: false
      });
    }

    return testResults.get(variantId)!;
  }

  /**
   * Save results to localStorage
   */
  private saveResults(): void {
    if (typeof window === 'undefined') return;

    try {
      const resultsData: Record<string, Record<string, TestResult>> = {};
      this.results.forEach((variantResults, testId) => {
        resultsData[testId] = {};
        variantResults.forEach((result, variantId) => {
          resultsData[testId][variantId] = result;
        });
      });
      localStorage.setItem('ab_test_results', JSON.stringify(resultsData));
    } catch (error) {
      console.warn('Failed to save A/B test results:', error);
    }
  }

  /**
   * Load results from localStorage
   */
  loadResults(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ab_test_results');
      if (stored) {
        const resultsData = JSON.parse(stored);
        Object.entries(resultsData).forEach(([testId, variants]) => {
          const variantMap = new Map<string, TestResult>();
          Object.entries(variants as Record<string, TestResult>).forEach(([variantId, result]) => {
            variantMap.set(variantId, result);
          });
          this.results.set(testId, variantMap);
        });
      }
    } catch (error) {
      console.warn('Failed to load A/B test results:', error);
    }
  }

  /**
   * Hash string for consistent assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all active tests
   */
  getActiveTests(): TestConfig[] {
    return Array.from(this.tests.values()).filter(test => test.active);
  }
}

// Singleton instance
export const abTesting = new ABTestingFramework();

// Load results on initialization
if (typeof window !== 'undefined') {
  abTesting.loadResults();
}

