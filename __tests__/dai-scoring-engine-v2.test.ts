// Comprehensive Test Suite for dAI Scoring Engine v2.0
// Tests all enhanced features, penalty system, and hard floor logic

import { DAIScoringEngine, DEFAULT_DAI_CONFIG, RawFeatures } from '@/lib/dai/scoring-engine';
import { WeightLearningService } from '@/lib/dai/weight-learning-service';
import { FeatureExtractionService } from '@/lib/dai/feature-extraction-service';

describe('dAI Scoring Engine v2.0', () => {
  let scoringEngine: DAIScoringEngine;
  let weightLearningService: WeightLearningService;
  let featureExtractionService: FeatureExtractionService;

  beforeEach(() => {
    scoringEngine = new DAIScoringEngine();
    weightLearningService = new WeightLearningService();
    featureExtractionService = new FeatureExtractionService();
  });

  describe('Enhanced RawFeatures Interface', () => {
    it('should accept all required raw features', () => {
      const features: RawFeatures = {
        // Price/Availability Freshness
        price_age_min: 5,
        availability_age_min: 3,
        mileage_age_min: 2,
        
        // Parity Flags
        price_parity_ok: true,
        avail_parity_ok: true,
        gbp_hours_match_site: true,
        
        // AI Visibility
        ai_zero_click_share: 0.15,
        citation_depth_idx: 0.8,
        
        // Web Experience
        cwv_lcp_ms: 2000,
        cwv_inp_ms: 150,
        cwv_cls: 0.05,
        
        // Reviews & Reputation
        review_reply_rate: 85,
        avg_rating: 4.5,
        review_volume: 150,
        
        // Inventory Freshness
        inventory_recency_idx: 0.9,
        
        // Policy & Trust
        policy_violation_flag: false,
        dishonest_pricing_flag: false,
        
        // Entity & Schema
        entity_resolve_score: 0.9,
        schema_completeness: 0.8,
        nap_consistency: 0.95
      };

      expect(() => scoringEngine.calculateScore(features)).not.toThrow();
    });
  });

  describe('Enhanced Sub-Score Calculations', () => {
    const testFeatures: RawFeatures = {
      price_age_min: 5,
      availability_age_min: 3,
      mileage_age_min: 2,
      price_parity_ok: true,
      avail_parity_ok: true,
      gbp_hours_match_site: true,
      ai_zero_click_share: 0.15,
      citation_depth_idx: 0.8,
      cwv_lcp_ms: 2000,
      cwv_inp_ms: 150,
      cwv_cls: 0.05,
      review_reply_rate: 85,
      avg_rating: 4.5,
      review_volume: 150,
      inventory_recency_idx: 0.9,
      policy_violation_flag: false,
      dishonest_pricing_flag: false,
      entity_resolve_score: 0.9,
      schema_completeness: 0.8,
      nap_consistency: 0.95
    };

    it('should calculate ATI with enhanced weighting', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.ATI).toBeGreaterThan(0);
      expect(result.subscores.ATI).toBeLessThanOrEqual(100);
    });

    it('should calculate AIV with surface weighting', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.AIV).toBeGreaterThan(0);
      expect(result.subscores.AIV).toBeLessThanOrEqual(100);
    });

    it('should calculate VLI with enhanced parity scoring', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.VLI).toBeGreaterThan(0);
      expect(result.subscores.VLI).toBeLessThanOrEqual(100);
    });

    it('should calculate OI with enhanced penalty system', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.OI).toBeGreaterThan(0);
      expect(result.subscores.OI).toBeLessThanOrEqual(100);
    });

    it('should calculate GBP with multiple factors', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.GBP).toBeGreaterThan(0);
      expect(result.subscores.GBP).toBeLessThanOrEqual(100);
    });

    it('should calculate RRS with enhanced reputation scoring', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.RRS).toBeGreaterThan(0);
      expect(result.subscores.RRS).toBeLessThanOrEqual(100);
    });

    it('should calculate WX with performance tiers', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.WX).toBeGreaterThan(0);
      expect(result.subscores.WX).toBeLessThanOrEqual(100);
    });

    it('should calculate IFR with freshness bonuses', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.IFR).toBeGreaterThan(0);
      expect(result.subscores.IFR).toBeLessThanOrEqual(100);
    });

    it('should calculate CIS with clarity optimization', () => {
      const result = scoringEngine.calculateScore(testFeatures);
      expect(result.subscores.CIS).toBeGreaterThan(0);
      expect(result.subscores.CIS).toBeLessThanOrEqual(100);
    });
  });

  describe('Penalty System', () => {
    it('should apply policy penalty correctly', () => {
      const featuresWithPolicyViolation: RawFeatures = {
        ...createTestFeatures(),
        policy_violation_flag: true
      };

      const result = scoringEngine.calculateScore(featuresWithPolicyViolation);
      expect(result.penalties.P_policy).toBe(DEFAULT_DAI_CONFIG.penalties.policy);
    });

    it('should apply parity penalty based on fail rate', () => {
      const featuresWithParityIssues: RawFeatures = {
        ...createTestFeatures(),
        price_parity_ok: false,
        avail_parity_ok: false,
        gbp_hours_match_site: true
      };

      const result = scoringEngine.calculateScore(featuresWithParityIssues);
      const expectedParityPenalty = (2 / 3) * DEFAULT_DAI_CONFIG.penalties.parity_max;
      expect(result.penalties.P_parity).toBeCloseTo(expectedParityPenalty, 2);
    });

    it('should apply staleness penalty based on IFR', () => {
      const featuresWithStaleInventory: RawFeatures = {
        ...createTestFeatures(),
        inventory_recency_idx: 0.1 // Very stale
      };

      const result = scoringEngine.calculateScore(featuresWithStaleInventory);
      expect(result.penalties.P_staleness).toBeGreaterThan(0);
    });

    it('should not apply penalties when conditions are met', () => {
      const cleanFeatures: RawFeatures = {
        ...createTestFeatures(),
        policy_violation_flag: false,
        dishonest_pricing_flag: false,
        price_parity_ok: true,
        avail_parity_ok: true,
        gbp_hours_match_site: true,
        inventory_recency_idx: 0.9
      };

      const result = scoringEngine.calculateScore(cleanFeatures);
      expect(result.penalties.P_policy).toBe(0);
      expect(result.penalties.P_parity).toBe(0);
      expect(result.penalties.P_staleness).toBeLessThan(0.1);
    });
  });

  describe('Hard Floor Logic', () => {
    it('should cap score when OI is below threshold', () => {
      const featuresWithLowOI: RawFeatures = {
        ...createTestFeatures(),
        dishonest_pricing_flag: true,
        policy_violation_flag: true
      };

      const result = scoringEngine.calculateScore(featuresWithLowOI);
      
      // Check if OI is below threshold
      if (result.subscores.OI < DEFAULT_DAI_CONFIG.floors.oi_cap_under) {
        expect(result.score).toBeLessThanOrEqual(DEFAULT_DAI_CONFIG.floors.cap_score);
        expect(result.metadata.warnings).toContain(
          expect.stringContaining('OI below threshold')
        );
      }
    });

    it('should apply parity fail rate penalty', () => {
      const featuresWithHighParityFailRate: RawFeatures = {
        ...createTestFeatures(),
        price_parity_ok: false,
        avail_parity_ok: false,
        gbp_hours_match_site: false
      };

      const result = scoringEngine.calculateScore(featuresWithHighParityFailRate);
      const parityFailRate = 3 / 3; // 100% fail rate

      if (parityFailRate > DEFAULT_DAI_CONFIG.floors.parity_fail_rate_cap) {
        expect(result.metadata.warnings.some((w: string) => w.includes('Parity fail rate'))).toBe(true);
      }
    });

    it('should apply policy freeze warning', () => {
      const featuresWithPolicyViolation: RawFeatures = {
        ...createTestFeatures(),
        policy_violation_flag: true
      };

      const result = scoringEngine.calculateScore(featuresWithPolicyViolation);
      expect(result.metadata.warnings.some((w: string) => w.includes('Policy violation detected'))).toBe(true);
    });
  });

  describe('Weight Learning Service', () => {
    it('should add training data', () => {
      const trainingData = {
        features: createTestFeatures(),
        subscores: {
          ATI: 85,
          AIV: 75,
          VLI: 90,
          OI: 95,
          GBP: 80,
          RRS: 88,
          WX: 82,
          IFR: 92,
          CIS: 78
        },
        actualScore: 85.5,
        timestamp: new Date().toISOString(),
        dealershipId: 'test_dealer'
      };

      expect(() => weightLearningService.addTrainingData(trainingData)).not.toThrow();
    });

    it('should train model with sufficient data', async () => {
      // Add multiple training samples
      for (let i = 0; i < 150; i++) {
        const trainingData = {
          features: createTestFeatures(),
          subscores: {
            ATI: Math.random() * 40 + 60,
            AIV: Math.random() * 40 + 60,
            VLI: Math.random() * 40 + 60,
            OI: Math.random() * 40 + 60,
            GBP: Math.random() * 40 + 60,
            RRS: Math.random() * 40 + 60,
            WX: Math.random() * 40 + 60,
            IFR: Math.random() * 40 + 60,
            CIS: Math.random() * 40 + 60
          },
          actualScore: Math.random() * 40 + 60,
          timestamp: new Date().toISOString(),
          dealershipId: `test_dealer_${i}`
        };
        weightLearningService.addTrainingData(trainingData);
      }

      const update = await weightLearningService.trainModel();
      expect(update.success).toBe(true);
      expect(update.weights).toBeDefined();
      expect(update.confidence).toBeGreaterThan(0);
    });

    it('should reject training with insufficient data', async () => {
      // Only add 50 samples (below minimum of 100)
      for (let i = 0; i < 50; i++) {
        const trainingData = {
          features: createTestFeatures(),
          subscores: {
            ATI: 80, AIV: 75, VLI: 85, OI: 90, GBP: 80,
            RRS: 85, WX: 82, IFR: 88, CIS: 78
          },
          actualScore: 82,
          timestamp: new Date().toISOString(),
          dealershipId: `test_dealer_${i}`
        };
        weightLearningService.addTrainingData(trainingData);
      }

      await expect(weightLearningService.trainModel()).rejects.toThrow('Insufficient training data');
    });
  });

  describe('Feature Extraction Service', () => {
    it('should extract enhanced features', async () => {
      const rawFeatures = createTestFeatures();
      const vinData = createTestVinData();
      const metadata = {
        dealershipId: 'test_dealer',
        dealershipName: 'Test Dealership',
        location: {
          address: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zip: '90210',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        dataSource: 'test'
      };

      const result = await featureExtractionService.extractFeatures(rawFeatures, vinData, metadata);
      
      expect(result.success).toBe(true);
      expect(result.features.plainEnglishFields).toBeDefined();
      expect(result.features.vinLevelData).toBeDefined();
      expect(result.features.metadata).toBeDefined();
    });

    it('should validate field mappings', () => {
      const mappings = featureExtractionService.getAllFieldMappings();
      expect(mappings.length).toBeGreaterThan(0);
      
      const criticalMappings = featureExtractionService.getFieldMappingsByImportance('critical');
      expect(criticalMappings.length).toBeGreaterThan(0);
    });

    it('should calculate confidence and completeness', async () => {
      const rawFeatures = createTestFeatures();
      const result = await featureExtractionService.extractFeatures(rawFeatures, [], {});
      
      expect(result.metadata.confidence).toBeGreaterThan(0);
      expect(result.metadata.completeness).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end with all components', async () => {
      // 1. Extract features
      const rawFeatures = createTestFeatures();
      const extractionResult = await featureExtractionService.extractFeatures(
        rawFeatures, 
        createTestVinData(), 
        { dealershipId: 'test', dealershipName: 'Test' }
      );

      expect(extractionResult.success).toBe(true);

      // 2. Calculate score
      const scoreResult = scoringEngine.calculateScore(rawFeatures);
      expect(scoreResult.score).toBeGreaterThan(0);
      expect(scoreResult.score).toBeLessThanOrEqual(100);

      // 3. Add to training data
      const trainingData = {
        features: rawFeatures,
        subscores: scoreResult.subscores,
        actualScore: scoreResult.score,
        timestamp: new Date().toISOString(),
        dealershipId: 'test_dealer'
      };
      weightLearningService.addTrainingData(trainingData);

      // 4. Verify all components work together
      expect(scoreResult.subscores).toBeDefined();
      expect(scoreResult.penalties).toBeDefined();
      expect(scoreResult.metadata).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme values gracefully', () => {
      const extremeFeatures: RawFeatures = {
        price_age_min: 1000,
        availability_age_min: 1000,
        mileage_age_min: 1000,
        price_parity_ok: false,
        avail_parity_ok: false,
        gbp_hours_match_site: false,
        ai_zero_click_share: 0,
        citation_depth_idx: 0,
        cwv_lcp_ms: 10000,
        cwv_inp_ms: 1000,
        cwv_cls: 1,
        review_reply_rate: 0,
        avg_rating: 1,
        review_volume: 0,
        inventory_recency_idx: 0,
        policy_violation_flag: true,
        dishonest_pricing_flag: true,
        entity_resolve_score: 0,
        schema_completeness: 0,
        nap_consistency: 0
      };

      const result = scoringEngine.calculateScore(extremeFeatures);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle missing or null values', () => {
      const incompleteFeatures = {
        price_age_min: 5,
        availability_age_min: 3,
        // Missing other required fields
      } as Partial<RawFeatures>;

      // This should throw or handle gracefully
      expect(() => scoringEngine.calculateScore(incompleteFeatures as RawFeatures)).toThrow();
    });
  });
});

// Helper functions
function createTestFeatures(): RawFeatures {
  return {
    price_age_min: 5,
    availability_age_min: 3,
    mileage_age_min: 2,
    price_parity_ok: true,
    avail_parity_ok: true,
    gbp_hours_match_site: true,
    ai_zero_click_share: 0.15,
    citation_depth_idx: 0.8,
    cwv_lcp_ms: 2000,
    cwv_inp_ms: 150,
    cwv_cls: 0.05,
    review_reply_rate: 85,
    avg_rating: 4.5,
    review_volume: 150,
    inventory_recency_idx: 0.9,
    policy_violation_flag: false,
    dishonest_pricing_flag: false,
    entity_resolve_score: 0.9,
    schema_completeness: 0.8,
    nap_consistency: 0.95
  };
}

function createTestVinData() {
  return [
    {
      vin: 'VIN123456789',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      trim: 'LE',
      mileage: 25000,
      price: 25000,
      availability: 'available',
      listingAge: 5,
      priceHistory: [
        { price: 25000, date: new Date().toISOString(), source: 'website' }
      ],
      imageCount: 15,
      imageQuality: 0.8,
      descriptionLength: 300,
      features: ['Bluetooth', 'Backup Camera'],
      condition: 'excellent',
      accidentHistory: false,
      serviceHistory: true,
      warranty: true,
      financing: true,
      tradeIn: true,
      testDrive: true,
      delivery: true,
      certification: true
    }
  ];
}
