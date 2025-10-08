/**
 * Test Suite for DealershipAI Scoring System
 * 
 * Comprehensive tests for all scoring components
 */

import { DealershipAI_TruthBased } from './ai-visibility-scorer';
import { EEAT_ML_Model } from './eeat-model';
import { SystemHealthMonitor } from './system-health';
import { scoringEngine } from '../scoring-engine';

// Test data
const sampleDealer = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Terry Reid Hyundai',
  name_variations: ['Terry Reid Hyundai', 'Terry Reid Auto', 'TRH'],
  website_domain: 'terryreidhyundai.com',
  city: 'Naples',
  state: 'FL',
  established_date: new Date('2010-01-01'),
  brand: 'Hyundai',
  models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
  website: 'https://terryreidhyundai.com',
  blog: 'https://terryreidhyundai.com/blog'
};

const sampleDealer2 = {
  id: '987fcdeb-51a2-43d1-b789-123456789abc',
  name: 'Naples Honda',
  name_variations: ['Naples Honda', 'Naples Honda Center'],
  website_domain: 'napleshonda.com',
  city: 'Naples',
  state: 'FL',
  established_date: new Date('2005-03-15'),
  brand: 'Honda',
  models: ['Civic', 'Accord', 'CR-V', 'Pilot'],
  website: 'https://napleshonda.com',
  blog: 'https://napleshonda.com/news'
};

export class ScoringSystemTests {
  private aiScorer: DealershipAI_TruthBased;
  private eeatModel: EEAT_ML_Model;
  private healthMonitor: SystemHealthMonitor;

  constructor() {
    this.aiScorer = new DealershipAI_TruthBased();
    this.eeatModel = new EEAT_ML_Model();
    this.healthMonitor = new SystemHealthMonitor();
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting DealershipAI Scoring System Tests...\n');

    const results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: [] as Array<{name: string, passed: boolean, error?: string}>
    };

    // Test AI Visibility Scorer
    await this.testAIVisibilityScorer(results);
    
    // Test E-E-A-T Model
    await this.testEEATModel(results);
    
    // Test System Health Monitor
    await this.testSystemHealthMonitor(results);
    
    // Test Scoring Engine
    await this.testScoringEngine(results);
    
    // Test API Integration
    await this.testAPIIntegration(results);

    // Print results
    this.printTestResults(results);
    
    return results;
  }

  /**
   * Test AI Visibility Scorer
   */
  private async testAIVisibilityScorer(results: any) {
    console.log('📊 Testing AI Visibility Scorer...');
    
    try {
      // Test overall score calculation
      const score = await this.aiScorer.calculateAIVisibilityScore(sampleDealer);
      
      this.assert(score.overall >= 0 && score.overall <= 100, 'Overall score should be between 0-100');
      this.assert(score.seo >= 0 && score.seo <= 100, 'SEO score should be between 0-100');
      this.assert(score.aeo >= 0 && score.aeo <= 100, 'AEO score should be between 0-100');
      this.assert(score.geo >= 0 && score.geo <= 100, 'GEO score should be between 0-100');
      this.assert(score.confidence >= 0 && score.confidence <= 1, 'Confidence should be between 0-1');
      this.assert(score.last_updated instanceof Date, 'Last updated should be a Date object');
      
      this.addTestResult(results, 'AI Visibility Scorer - Overall Score', true);
      console.log('  ✅ Overall score calculation passed');
      
    } catch (error) {
      this.addTestResult(results, 'AI Visibility Scorer - Overall Score', false, error.message);
      console.log('  ❌ Overall score calculation failed:', error.message);
    }

    try {
      // Test SEO score calculation
      const seoScore = await this.aiScorer.calculateSEOScore(sampleDealer);
      
      this.assert(seoScore.score >= 0 && seoScore.score <= 100, 'SEO score should be between 0-100');
      this.assert(seoScore.confidence >= 0 && seoScore.confidence <= 1, 'SEO confidence should be between 0-1');
      this.assert(seoScore.components, 'SEO components should be present');
      this.assert(seoScore.last_updated instanceof Date, 'SEO last updated should be a Date object');
      
      this.addTestResult(results, 'AI Visibility Scorer - SEO Score', true);
      console.log('  ✅ SEO score calculation passed');
      
    } catch (error) {
      this.addTestResult(results, 'AI Visibility Scorer - SEO Score', false, error.message);
      console.log('  ❌ SEO score calculation failed:', error.message);
    }

    try {
      // Test AEO score calculation
      const aeoScore = await this.aiScorer.calculateAEOScore(sampleDealer);
      
      this.assert(aeoScore.score >= 0 && aeoScore.score <= 100, 'AEO score should be between 0-100');
      this.assert(aeoScore.mentions >= 0, 'AEO mentions should be non-negative');
      this.assert(aeoScore.queries >= 0, 'AEO queries should be non-negative');
      this.assert(aeoScore.mention_rate.includes('%'), 'AEO mention rate should include %');
      this.assert(aeoScore.confidence >= 0 && aeoScore.confidence <= 1, 'AEO confidence should be between 0-1');
      
      this.addTestResult(results, 'AI Visibility Scorer - AEO Score', true);
      console.log('  ✅ AEO score calculation passed');
      
    } catch (error) {
      this.addTestResult(results, 'AI Visibility Scorer - AEO Score', false, error.message);
      console.log('  ❌ AEO score calculation failed:', error.message);
    }

    try {
      // Test GEO score calculation
      const geoScore = await this.aiScorer.calculateGEOScore(sampleDealer);
      
      this.assert(geoScore.score >= 0 && geoScore.score <= 100, 'GEO score should be between 0-100');
      this.assert(geoScore.sge_appearance_rate.includes('%'), 'GEO SGE rate should include %');
      this.assert(geoScore.confidence >= 0 && geoScore.confidence <= 1, 'GEO confidence should be between 0-1');
      
      this.addTestResult(results, 'AI Visibility Scorer - GEO Score', true);
      console.log('  ✅ GEO score calculation passed');
      
    } catch (error) {
      this.addTestResult(results, 'AI Visibility Scorer - GEO Score', false, error.message);
      console.log('  ❌ GEO score calculation failed:', error.message);
    }
  }

  /**
   * Test E-E-A-T Model
   */
  private async testEEATModel(results: any) {
    console.log('🤖 Testing E-E-A-T Model...');
    
    try {
      const eeatScores = await this.eeatModel.calculateEEAT(sampleDealer);
      
      this.assert(eeatScores.experience >= 0 && eeatScores.experience <= 100, 'Experience score should be between 0-100');
      this.assert(eeatScores.expertise >= 0 && eeatScores.expertise <= 100, 'Expertise score should be between 0-100');
      this.assert(eeatScores.authoritativeness >= 0 && eeatScores.authoritativeness <= 100, 'Authoritativeness score should be between 0-100');
      this.assert(eeatScores.trustworthiness >= 0 && eeatScores.trustworthiness <= 100, 'Trustworthiness score should be between 0-100');
      this.assert(eeatScores.overall >= 0 && eeatScores.overall <= 100, 'Overall E-E-A-T score should be between 0-100');
      this.assert(eeatScores.confidence >= 0 && eeatScores.confidence <= 1, 'E-E-A-T confidence should be between 0-1');
      
      this.addTestResult(results, 'E-E-A-T Model - Score Calculation', true);
      console.log('  ✅ E-E-A-T score calculation passed');
      
    } catch (error) {
      this.addTestResult(results, 'E-E-A-T Model - Score Calculation', false, error.message);
      console.log('  ❌ E-E-A-T score calculation failed:', error.message);
    }

    try {
      const features = await this.eeatModel.extractFeatures(sampleDealer);
      
      this.assert(features.verified_reviews >= 0, 'Verified reviews should be non-negative');
      this.assert(features.dealership_tenure >= 0, 'Dealership tenure should be non-negative');
      this.assert(features.domain_authority >= 0, 'Domain authority should be non-negative');
      this.assert(features.bbb_rating >= 0, 'BBB rating should be non-negative');
      
      this.addTestResult(results, 'E-E-A-T Model - Feature Extraction', true);
      console.log('  ✅ E-E-A-T feature extraction passed');
      
    } catch (error) {
      this.addTestResult(results, 'E-E-A-T Model - Feature Extraction', false, error.message);
      console.log('  ❌ E-E-A-T feature extraction failed:', error.message);
    }
  }

  /**
   * Test System Health Monitor
   */
  private async testSystemHealthMonitor(results: any) {
    console.log('🏥 Testing System Health Monitor...');
    
    try {
      const validation = await this.healthMonitor.validateScores(
        { overall: 85, seo: 80, aeo: 90, geo: 85 },
        sampleDealer
      );
      
      this.assert(validation.overall_confidence >= 0 && validation.overall_confidence <= 1, 'Overall confidence should be between 0-1');
      this.assert(validation.seo_confidence >= 0 && validation.seo_confidence <= 1, 'SEO confidence should be between 0-1');
      this.assert(validation.aeo_confidence >= 0 && validation.aeo_confidence <= 1, 'AEO confidence should be between 0-1');
      this.assert(validation.geo_confidence >= 0 && validation.geo_confidence <= 1, 'GEO confidence should be between 0-1');
      this.assert(typeof validation.requires_manual_review === 'boolean', 'Requires manual review should be boolean');
      
      this.addTestResult(results, 'System Health Monitor - Score Validation', true);
      console.log('  ✅ Score validation passed');
      
    } catch (error) {
      this.addTestResult(results, 'System Health Monitor - Score Validation', false, error.message);
      console.log('  ❌ Score validation failed:', error.message);
    }

    try {
      await this.healthMonitor.updateSystemHealth();
      
      this.addTestResult(results, 'System Health Monitor - Health Update', true);
      console.log('  ✅ System health update passed');
      
    } catch (error) {
      this.addTestResult(results, 'System Health Monitor - Health Update', false, error.message);
      console.log('  ❌ System health update failed:', error.message);
    }
  }

  /**
   * Test Scoring Engine
   */
  private async testScoringEngine(results: any) {
    console.log('⚙️ Testing Scoring Engine...');
    
    try {
      const result = await scoringEngine.calculateDealerScore(sampleDealer);
      
      this.assert(result.dealer_id === sampleDealer.id, 'Dealer ID should match');
      this.assert(result.dealer_name === sampleDealer.name, 'Dealer name should match');
      this.assert(result.overall_score >= 0 && result.overall_score <= 100, 'Overall score should be between 0-100');
      this.assert(result.seo_score >= 0 && result.seo_score <= 100, 'SEO score should be between 0-100');
      this.assert(result.aeo_score >= 0 && result.aeo_score <= 100, 'AEO score should be between 0-100');
      this.assert(result.geo_score >= 0 && result.geo_score <= 100, 'GEO score should be between 0-100');
      this.assert(result.confidence >= 0 && result.confidence <= 1, 'Confidence should be between 0-1');
      this.assert(Array.isArray(result.insights), 'Insights should be an array');
      this.assert(Array.isArray(result.recommendations), 'Recommendations should be an array');
      this.assert(result.cost_breakdown.total > 0, 'Total cost should be positive');
      
      this.addTestResult(results, 'Scoring Engine - Dealer Score', true);
      console.log('  ✅ Dealer score calculation passed');
      
    } catch (error) {
      this.addTestResult(results, 'Scoring Engine - Dealer Score', false, error.message);
      console.log('  ❌ Dealer score calculation failed:', error.message);
    }

    try {
      const batchResults = await scoringEngine.runBatchScoring([sampleDealer.id, sampleDealer2.id]);
      
      this.assert(Array.isArray(batchResults), 'Batch results should be an array');
      this.assert(batchResults.length === 2, 'Should return 2 results for 2 dealers');
      
      this.addTestResult(results, 'Scoring Engine - Batch Scoring', true);
      console.log('  ✅ Batch scoring passed');
      
    } catch (error) {
      this.addTestResult(results, 'Scoring Engine - Batch Scoring', false, error.message);
      console.log('  ❌ Batch scoring failed:', error.message);
    }
  }

  /**
   * Test API Integration
   */
  private async testAPIIntegration(results: any) {
    console.log('🌐 Testing API Integration...');
    
    try {
      // Test calculate score API
      const response = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_score',
          ...sampleDealer,
          established_date: sampleDealer.established_date.toISOString()
        })
      });
      
      const data = await response.json();
      
      this.assert(response.ok, 'API response should be successful');
      this.assert(data.success === true, 'API should return success true');
      this.assert(data.data.overall_score >= 0, 'API should return overall score');
      
      this.addTestResult(results, 'API Integration - Calculate Score', true);
      console.log('  ✅ Calculate score API passed');
      
    } catch (error) {
      this.addTestResult(results, 'API Integration - Calculate Score', false, error.message);
      console.log('  ❌ Calculate score API failed:', error.message);
    }

    try {
      // Test system health API
      const response = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_health' })
      });
      
      const data = await response.json();
      
      this.assert(response.ok, 'Health API response should be successful');
      this.assert(data.success === true, 'Health API should return success true');
      
      this.addTestResult(results, 'API Integration - System Health', true);
      console.log('  ✅ System health API passed');
      
    } catch (error) {
      this.addTestResult(results, 'API Integration - System Health', false, error.message);
      console.log('  ❌ System health API failed:', error.message);
    }
  }

  /**
   * Helper methods
   */
  private assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(message);
    }
  }

  private addTestResult(results: any, testName: string, passed: boolean, error?: string) {
    results.total++;
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.tests.push({ name: testName, passed, error });
  }

  private printTestResults(results: any) {
    console.log('\n📋 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total: ${results.total}`);
    console.log(`🎯 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests
        .filter((test: any) => !test.passed)
        .forEach((test: any) => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎉 Testing complete!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tests = new ScoringSystemTests();
  tests.runAllTests().catch(console.error);
}

export default ScoringSystemTests;
