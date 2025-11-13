import { logger } from '@/lib/utils/logger';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  targetAudience: ABTestAudience;
  trafficAllocation: number; // percentage of traffic to include in test
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // percentage of test traffic
  config: Record<string, any>;
  isControl: boolean;
}

export interface ABTestMetric {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  goal: 'increase' | 'decrease';
  targetValue?: number;
  isPrimary: boolean;
}

export interface ABTestAudience {
  segments: string[];
  conditions: ABTestCondition[];
  excludeSegments: string[];
}

export interface ABTestCondition {
  type: 'user_property' | 'session_property' | 'device' | 'location' | 'referrer';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  isControl: boolean;
  metrics: {
    [metricId: string]: {
      value: number;
      confidence: number;
      isSignificant: boolean;
      improvement: number; // percentage improvement over control
    };
  };
  participants: number;
  conversions: number;
  conversionRate: number;
  startDate: Date;
  endDate: Date;
}

export interface ABTestEvent {
  testId: string;
  variantId: string;
  userId: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export class ABTestingService {
  private tests: Map<string, ABTest> = new Map();
  private events: ABTestEvent[] = [];

  constructor() {
    this.initializeDefaultTests();
  }

  /**
   * Initialize default A/B tests
   */
  private initializeDefaultTests(): void {
    // Landing page CTA test
    const ctaTest: ABTest = {
      id: 'landing-cta-test',
      name: 'Landing Page CTA Optimization',
      description: 'Test different CTA button colors and text to improve conversion rates',
      status: 'draft',
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control (Blue CTA)',
          description: 'Original blue CTA button',
          trafficAllocation: 50,
          config: {
            buttonColor: '#3b82f6',
            buttonText: 'Analyze My Dealership',
            buttonSize: 'large'
          },
          isControl: true
        },
        {
          id: 'variant-a',
          name: 'Variant A (Green CTA)',
          description: 'Green CTA button with urgency text',
          trafficAllocation: 50,
          config: {
            buttonColor: '#16a34a',
            buttonText: 'Start Free Analysis',
            buttonSize: 'large'
          },
          isControl: false
        }
      ],
      metrics: [
        {
          id: 'cta-click',
          name: 'CTA Click Rate',
          type: 'conversion',
          goal: 'increase',
          isPrimary: true
        },
        {
          id: 'signup-rate',
          name: 'Sign-up Rate',
          type: 'conversion',
          goal: 'increase',
          isPrimary: false
        }
      ],
      targetAudience: {
        segments: ['new_visitors'],
        conditions: [],
        excludeSegments: ['returning_users']
      },
      trafficAllocation: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Pricing page test
    const pricingTest: ABTest = {
      id: 'pricing-layout-test',
      name: 'Pricing Page Layout Test',
      description: 'Test different pricing page layouts to improve conversion rates',
      status: 'draft',
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control (3-column)',
          description: 'Original 3-column pricing layout',
          trafficAllocation: 50,
          config: {
            layout: 'three-column',
            highlightPlan: 'pro',
            showFeatures: true
          },
          isControl: true
        },
        {
          id: 'variant-a',
          name: 'Variant A (2-column)',
          description: '2-column layout with more emphasis on Pro plan',
          trafficAllocation: 50,
          config: {
            layout: 'two-column',
            highlightPlan: 'pro',
            showFeatures: true,
            showTestimonial: true
          },
          isControl: false
        }
      ],
      metrics: [
        {
          id: 'pricing-click',
          name: 'Pricing Plan Click Rate',
          type: 'conversion',
          goal: 'increase',
          isPrimary: true
        },
        {
          id: 'pro-signup',
          name: 'Pro Plan Sign-up Rate',
          type: 'conversion',
          goal: 'increase',
          isPrimary: false
        }
      ],
      targetAudience: {
        segments: ['pricing_page_visitors'],
        conditions: [],
        excludeSegments: []
      },
      trafficAllocation: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tests.set(ctaTest.id, ctaTest);
    this.tests.set(pricingTest.id, pricingTest);
  }

  /**
   * Create a new A/B test
   */
  createTest(test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): ABTest {
    const id = this.generateTestId(test.name);
    const newTest: ABTest = {
      ...test,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tests.set(id, newTest);
    logger.info('A/B test created', { component: 'ABTestingService', testId: id, testName: test.name });
    
    return newTest;
  }

  /**
   * Get all A/B tests
   */
  getTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  /**
   * Get a specific test by ID
   */
  getTest(testId: string): ABTest | null {
    return this.tests.get(testId) || null;
  }

  /**
   * Update an A/B test
   */
  updateTest(testId: string, updates: Partial<ABTest>): ABTest | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    const updatedTest: ABTest = {
      ...test,
      ...updates,
      updatedAt: new Date()
    };

    this.tests.set(testId, updatedTest);
    logger.info('A/B test updated', { component: 'ABTestingService', testId, updates });
    
    return updatedTest;
  }

  /**
   * Start an A/B test
   */
  startTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    if (test.status !== 'draft') {
      logger.warn('Cannot start test that is not in draft status', { testId, status: test.status });
      return false;
    }

    test.status = 'running';
    test.startDate = new Date();
    this.tests.set(testId, test);

    logger.info('A/B test started', { component: 'ABTestingService', testId, testName: test.name });
    return true;
  }

  /**
   * Pause an A/B test
   */
  pauseTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    if (test.status !== 'running') {
      logger.warn('Cannot pause test that is not running', { testId, status: test.status });
      return false;
    }

    test.status = 'paused';
    this.tests.set(testId, test);

    logger.info('A/B test paused', { component: 'ABTestingService', testId });
    return true;
  }

  /**
   * Complete an A/B test
   */
  completeTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    if (test.status !== 'running' && test.status !== 'paused') {
      logger.warn('Cannot complete test that is not running or paused', { testId, status: test.status });
      return false;
    }

    test.status = 'completed';
    test.endDate = new Date();
    this.tests.set(testId, test);

    logger.info('A/B test completed', { component: 'ABTestingService', testId });
    return true;
  }

  /**
   * Get variant for a user in a specific test
   */
  getVariantForUser(testId: string, userId: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;

    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId + testId);
    const bucket = hash % 100;

    let cumulativeAllocation = 0;
    for (const variant of test.variants) {
      cumulativeAllocation += variant.trafficAllocation;
      if (bucket < cumulativeAllocation) {
        return variant;
      }
    }

    // Fallback to control variant
    return test.variants.find(v => v.isControl) || test.variants[0];
  }

  /**
   * Track an event for A/B testing
   */
  trackEvent(testId: string, variantId: string, userId: string, sessionId: string, event: string, properties: Record<string, any> = {}): void {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return;

    const testEvent: ABTestEvent = {
      testId,
      variantId,
      userId,
      sessionId,
      event,
      properties,
      timestamp: new Date()
    };

    this.events.push(testEvent);
    logger.info('A/B test event tracked', { component: 'ABTestingService', testId, variantId, event });
  }

  /**
   * Get test results
   */
  getTestResults(testId: string): ABTestResult[] | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    const results: ABTestResult[] = [];
    const testEvents = this.events.filter(e => e.testId === testId);

    for (const variant of test.variants) {
      const variantEvents = testEvents.filter(e => e.variantId === variant.id);
      const participants = new Set(variantEvents.map(e => e.userId)).size;
      const conversions = variantEvents.filter(e => e.event === 'conversion').length;
      const conversionRate = participants > 0 ? (conversions / participants) * 100 : 0;

      const metrics: { [metricId: string]: any } = {};
      for (const metric of test.metrics) {
        const metricEvents = variantEvents.filter(e => e.event === metric.id);
        const metricValue = metricEvents.length;
        const confidence = this.calculateConfidence(participants, conversions);
        const isSignificant = confidence >= 95;

        metrics[metric.id] = {
          value: metricValue,
          confidence,
          isSignificant,
          improvement: 0 // Will be calculated relative to control
        };
      }

      results.push({
        testId,
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        metrics,
        participants,
        conversions,
        conversionRate,
        startDate: test.startDate,
        endDate: test.endDate || new Date()
      });
    }

    // Calculate improvements relative to control
    const controlResult = results.find(r => r.isControl);
    if (controlResult) {
      for (const result of results) {
        if (!result.isControl) {
          for (const metricId in result.metrics) {
            const controlValue = controlResult.metrics[metricId]?.value || 0;
            const variantValue = result.metrics[metricId]?.value || 0;
            if (controlValue > 0) {
              result.metrics[metricId].improvement = ((variantValue - controlValue) / controlValue) * 100;
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Get active tests for a user
   */
  getActiveTestsForUser(userId: string, userProperties: Record<string, any> = {}): ABTest[] {
    const activeTests: ABTest[] = [];

    for (const test of this.tests.values()) {
      if (test.status === 'running' && this.isUserInAudience(test, userId, userProperties)) {
        activeTests.push(test);
      }
    }

    return activeTests;
  }

  /**
   * Check if user is in test audience
   */
  private isUserInAudience(test: ABTest, userId: string, userProperties: Record<string, any>): boolean {
    // Simple implementation - in production, this would be more sophisticated
    return true;
  }

  /**
   * Calculate statistical confidence
   */
  private calculateConfidence(participants: number, conversions: number): number {
    if (participants === 0) return 0;
    
    const p = conversions / participants;
    const n = participants;
    const z = 1.96; // 95% confidence interval
    
    const marginOfError = z * Math.sqrt((p * (1 - p)) / n);
    return Math.max(0, Math.min(100, (1 - marginOfError) * 100));
  }

  /**
   * Generate unique test ID
   */
  private generateTestId(name: string): string {
    const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now().toString(36);
    return `${baseId}-${timestamp}`;
  }

  /**
   * Hash string for consistent user assignment
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
   * Get test configuration for frontend
   */
  getTestConfig(testId: string, userId: string): Record<string, any> | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;

    const variant = this.getVariantForUser(testId, userId);
    if (!variant) return null;

    return {
      testId,
      variantId: variant.id,
      config: variant.config
    };
  }

  /**
   * Get all active test configurations for a user
   */
  getAllTestConfigs(userId: string, userProperties: Record<string, any> = {}): Record<string, any> {
    const configs: Record<string, any> = {};
    const activeTests = this.getActiveTestsForUser(userId, userProperties);

    for (const test of activeTests) {
      const config = this.getTestConfig(test.id, userId);
      if (config) {
        configs[test.id] = config;
      }
    }

    return configs;
  }
}
