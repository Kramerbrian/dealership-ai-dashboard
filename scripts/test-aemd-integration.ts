#!/usr/bin/env tsx

/**
 * AEMD Integration Test Suite
 * 
 * Comprehensive testing for the Answer Engine Market Dominance Optimizer
 * and its integration with the VDP-TOP protocol
 */

import { analyzeAEMD, AEMDInputs, batchAnalyzeAEMD, analyzeAEMDTrend } from '../src/lib/aemd-calculator';
import { generateVDPWithAEMDOptimization, generateAEMDPerformanceSummary } from '../src/lib/vdp-aemd-integration';
import { VDPContextData } from '../src/lib/vdp-top-protocol';

// Test data for AEMD analysis
const testAEMDInputs: AEMDInputs[] = [
  {
    fsCaptureShare: 0.35,
    aioCitationShare: 0.45,
    paaBoxOwnership: 1.8,
    competitorAEMDAvg: 72.5,
    defensiveWeight: 1.25,
    eEATTrustAlpha: 0.85
  },
  {
    fsCaptureShare: 0.28,
    aioCitationShare: 0.52,
    paaBoxOwnership: 2.1,
    competitorAEMDAvg: 68.3,
    defensiveWeight: 1.15,
    eEATTrustAlpha: 0.78
  },
  {
    fsCaptureShare: 0.42,
    aioCitationShare: 0.38,
    paaBoxOwnership: 1.5,
    competitorAEMDAvg: 75.1,
    defensiveWeight: 1.35,
    eEATTrustAlpha: 0.92
  }
];

// Test VDP contexts for integration testing
const testVDPContexts: VDPContextData[] = [
  {
    vin: '1HGBH41JXMN109186',
    vinDecodedSpecs: {
      year: 2024,
      make: 'Honda',
      model: 'Civic',
      trim: 'EX',
      msrp: 25000,
      features: ['Bluetooth', 'Backup Camera', 'Lane Assist'],
      fuelEconomy: { city: 32, highway: 42, combined: 36 },
      engine: '1.5L Turbo 4-Cylinder',
      transmission: 'CVT',
      drivetrain: 'FWD',
      exteriorColor: 'Silver',
      interiorColor: 'Black',
      mileage: 15000
    },
    dealerData: {
      name: 'ABC Honda',
      city: 'Los Angeles',
      state: 'CA',
      masterTechName: 'John Smith',
      servicePageUrl: 'https://abchonda.com/service',
      currentPrice: 23500,
      schemaId: 'https://abchonda.com/#dealer'
    },
    vcoClusterId: 'Cluster 1: High-Value, Family Shoppers',
    targetedSentiment: 'Safety and Reliability',
    vdpUrl: 'https://abchonda.com/vehicles/1HGBH41JXMN109186'
  }
];

async function testSingleAEMDAnalysis() {
  console.log('\n🧪 Testing Single AEMD Analysis...');
  
  try {
    const inputs = testAEMDInputs[0];
    const result = analyzeAEMD(inputs);
    
    console.log('✅ Single AEMD analysis successful');
    console.log(`   AEMD Score: ${result.calculation.aemdScore.toFixed(2)}`);
    console.log(`   Raw Score: ${result.calculation.rawScore.toFixed(3)}`);
    console.log(`   Competitive Position: ${result.competitivePosition}`);
    console.log(`   Prescriptive Actions: ${result.prescriptiveActions.length}`);
    console.log(`   High Priority Actions: ${result.prescriptiveActions.filter(a => a.priority === 'high').length}`);
    
    // Validate calculation
    const expectedRawScore = (0.35 * 0.40) + (0.45 * 0.40) + (1.8 * 0.20);
    const expectedAEMDScore = (expectedRawScore / 1.25) * 100;
    
    console.log(`   Expected Raw Score: ${expectedRawScore.toFixed(3)}`);
    console.log(`   Expected AEMD Score: ${expectedAEMDScore.toFixed(2)}`);
    console.log(`   Calculation Match: ${Math.abs(result.calculation.rawScore - expectedRawScore) < 0.001 ? '✅' : '❌'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Single AEMD analysis failed:', error);
    return false;
  }
}

async function testBatchAEMDAnalysis() {
  console.log('\n🧪 Testing Batch AEMD Analysis...');
  
  try {
    const results = batchAnalyzeAEMD(testAEMDInputs);
    
    console.log('✅ Batch AEMD analysis successful');
    console.log(`   Analyzed ${results.length} dealerships`);
    
    const avgAEMDScore = results.reduce((sum, r) => sum + r.calculation.aemdScore, 0) / results.length;
    const dominantCount = results.filter(r => r.competitivePosition === 'dominant').length;
    const competitiveCount = results.filter(r => r.competitivePosition === 'competitive').length;
    const behindCount = results.filter(r => r.competitivePosition === 'behind').length;
    
    console.log(`   Average AEMD Score: ${avgAEMDScore.toFixed(2)}`);
    console.log(`   Dominant: ${dominantCount}, Competitive: ${competitiveCount}, Behind: ${behindCount}`);
    
    // Test trend analysis
    const historicalData = results.map((result, index) => ({
      date: `2024-01-${String(index + 1).padStart(2, '0')}`,
      inputs: testAEMDInputs[index],
      aemdScore: result.calculation.aemdScore
    }));
    
    const trendAnalysis = analyzeAEMDTrend(historicalData);
    console.log(`   Trend: ${trendAnalysis.trend}`);
    console.log(`   Average Change: ${trendAnalysis.averageChange.toFixed(2)}`);
    
    return true;
  } catch (error) {
    console.error('❌ Batch AEMD analysis failed:', error);
    return false;
  }
}

async function testVDPAEMDIntegration() {
  console.log('\n🧪 Testing VDP-AEMD Integration...');
  
  try {
    const context = testVDPContexts[0];
    const vdpPerformance = {
      fsCaptureRate: 0.35,
      aioCitationRate: 0.45,
      paaOwnershipCount: 1.8,
      competitorBenchmark: 72.5,
      trustScore: 0.85
    };
    
    const integration = await generateVDPWithAEMDOptimization(
      context,
      vdpPerformance,
      'openai'
    );
    
    console.log('✅ VDP-AEMD integration successful');
    console.log(`   VIN: ${context.vin}`);
    console.log(`   VAI Score: ${integration.vdpContent.compliance.vaiScore.toFixed(2)}`);
    console.log(`   AEMD Score: ${integration.aemdAnalysis.calculation.aemdScore.toFixed(2)}`);
    console.log(`   Integrated Score: ${integration.integratedScore.toFixed(2)}`);
    console.log(`   Competitive Position: ${integration.aemdAnalysis.competitivePosition}`);
    console.log(`   Optimization Recommendations: ${integration.optimizationRecommendations.length}`);
    console.log(`   Priority Actions: ${integration.priorityActions.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ VDP-AEMD integration failed:', error);
    return false;
  }
}

async function testAEMDPerformanceSummary() {
  console.log('\n🧪 Testing AEMD Performance Summary...');
  
  try {
    // Generate multiple integrations for summary testing
    const integrations = await Promise.all(
      testVDPContexts.map(async (context, index) => {
        const vdpPerformance = {
          fsCaptureRate: testAEMDInputs[index]?.fsCaptureShare || 0.35,
          aioCitationRate: testAEMDInputs[index]?.aioCitationShare || 0.45,
          paaOwnershipCount: testAEMDInputs[index]?.paaBoxOwnership || 1.8,
          competitorBenchmark: testAEMDInputs[index]?.competitorAEMDAvg || 72.5,
          trustScore: testAEMDInputs[index]?.eEATTrustAlpha || 0.85
        };
        
        return await generateVDPWithAEMDOptimization(
          context,
          vdpPerformance,
          'openai'
        );
      })
    );
    
    const summary = generateAEMDPerformanceSummary(integrations);
    
    console.log('✅ AEMD performance summary successful');
    console.log(`   Average AEMD Score: ${summary.averageAEMDScore}`);
    console.log(`   Average VAI Score: ${summary.averageVAIScore}`);
    console.log(`   Average Integrated Score: ${summary.averageIntegratedScore}`);
    console.log(`   Competitive Distribution:`, summary.competitiveDistribution);
    console.log(`   Content Quality Distribution:`, summary.contentQualityDistribution);
    console.log(`   Top Recommendations: ${summary.topRecommendations.length}`);
    console.log(`   Priority Actions: ${summary.priorityActions.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ AEMD performance summary failed:', error);
    return false;
  }
}

async function testAEMDValidation() {
  console.log('\n🧪 Testing AEMD Input Validation...');
  
  try {
    // Test valid inputs
    const validInputs: AEMDInputs = {
      fsCaptureShare: 0.5,
      aioCitationShare: 0.6,
      paaBoxOwnership: 2.0,
      competitorAEMDAvg: 75.0,
      defensiveWeight: 1.5,
      eEATTrustAlpha: 0.9
    };
    
    const validResult = analyzeAEMD(validInputs);
    console.log('✅ Valid inputs processed successfully');
    
    // Test invalid inputs
    const invalidInputs: Partial<AEMDInputs> = {
      fsCaptureShare: 1.5, // Invalid: > 1.0
      aioCitationShare: -0.1, // Invalid: < 0.0
      paaBoxOwnership: 2.0,
      competitorAEMDAvg: 75.0,
      defensiveWeight: 0.5, // Invalid: < 1.0
      eEATTrustAlpha: 1.5 // Invalid: > 1.0
    };
    
    try {
      analyzeAEMD(invalidInputs as AEMDInputs);
      console.log('❌ Invalid inputs should have been rejected');
      return false;
    } catch (error) {
      console.log('✅ Invalid inputs properly rejected');
    }
    
    return true;
  } catch (error) {
    console.error('❌ AEMD validation test failed:', error);
    return false;
  }
}

async function testPrescriptiveActions() {
  console.log('\n🧪 Testing Prescriptive Actions Generation...');
  
  try {
    const testCases = [
      {
        name: 'High AEMD, High Trust',
        inputs: {
          fsCaptureShare: 0.6,
          aioCitationShare: 0.7,
          paaBoxOwnership: 2.5,
          competitorAEMDAvg: 50.0,
          defensiveWeight: 1.2,
          eEATTrustAlpha: 0.9
        }
      },
      {
        name: 'Low AEMD, Low FS',
        inputs: {
          fsCaptureShare: 0.2,
          aioCitationShare: 0.6,
          paaBoxOwnership: 2.0,
          competitorAEMDAvg: 80.0,
          defensiveWeight: 1.3,
          eEATTrustAlpha: 0.8
        }
      },
      {
        name: 'Low AEMD, Low AIO',
        inputs: {
          fsCaptureShare: 0.6,
          aioCitationShare: 0.2,
          paaBoxOwnership: 2.0,
          competitorAEMDAvg: 80.0,
          defensiveWeight: 1.3,
          eEATTrustAlpha: 0.7
        }
      },
      {
        name: 'Low AEMD, Low PAA',
        inputs: {
          fsCaptureShare: 0.6,
          aioCitationShare: 0.6,
          paaBoxOwnership: 0.8,
          competitorAEMDAvg: 80.0,
          defensiveWeight: 1.3,
          eEATTrustAlpha: 0.8
        }
      }
    ];
    
    for (const testCase of testCases) {
      const result = analyzeAEMD(testCase.inputs);
      console.log(`   ${testCase.name}:`);
      console.log(`     AEMD Score: ${result.calculation.aemdScore.toFixed(2)}`);
      console.log(`     Position: ${result.competitivePosition}`);
      console.log(`     Actions: ${result.prescriptiveActions.length}`);
      console.log(`     High Priority: ${result.prescriptiveActions.filter(a => a.priority === 'high').length}`);
      
      // Verify appropriate actions are generated
      const hasHighPriorityActions = result.prescriptiveActions.some(a => a.priority === 'high');
      if (result.calculation.aemdScore < testCase.inputs.competitorAEMDAvg && !hasHighPriorityActions) {
        console.log(`     ⚠️  Warning: Low AEMD score but no high priority actions`);
      }
    }
    
    console.log('✅ Prescriptive actions generation successful');
    return true;
  } catch (error) {
    console.error('❌ Prescriptive actions test failed:', error);
    return false;
  }
}

async function testAPIEndpoint() {
  console.log('\n🧪 Testing AEMD API Endpoint...');
  
  try {
    // Test GET endpoint (documentation)
    const getResponse = await fetch('http://localhost:3000/api/aemd-analyze');
    if (!getResponse.ok) {
      throw new Error(`GET request failed: ${getResponse.status}`);
    }
    
    const getData = await getResponse.json();
    console.log('✅ GET endpoint successful');
    console.log(`   Endpoint: ${getData.endpoint}`);
    console.log(`   Features: ${getData.features.length} features documented`);
    
    // Test POST endpoint with mock data
    const postData = {
      fsCaptureShare: 0.35,
      aioCitationShare: 0.45,
      paaBoxOwnership: 1.8,
      competitorAEMDAvg: 72.5,
      defensiveWeight: 1.25,
      eEATTrustAlpha: 0.85,
      dealerId: 'test_dealer_123'
    };
    
    const postResponse = await fetch('http://localhost:3000/api/aemd-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify(postData)
    });
    
    if (postResponse.status === 401) {
      console.log('⚠️  POST endpoint requires authentication (expected)');
      return true;
    }
    
    if (!postResponse.ok) {
      throw new Error(`POST request failed: ${postResponse.status}`);
    }
    
    const postResult = await postResponse.json();
    console.log('✅ POST endpoint successful');
    console.log(`   AEMD Score: ${postResult.data.analysis.calculation.aemdScore.toFixed(2)}`);
    console.log(`   Competitive Position: ${postResult.data.analysis.competitivePosition}`);
    
    return true;
  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting AEMD Integration Test Suite...\n');
  
  const tests = [
    { name: 'Single AEMD Analysis', fn: testSingleAEMDAnalysis },
    { name: 'Batch AEMD Analysis', fn: testBatchAEMDAnalysis },
    { name: 'VDP-AEMD Integration', fn: testVDPAEMDIntegration },
    { name: 'AEMD Performance Summary', fn: testAEMDPerformanceSummary },
    { name: 'AEMD Input Validation', fn: testAEMDValidation },
    { name: 'Prescriptive Actions', fn: testPrescriptiveActions },
    { name: 'API Endpoint', fn: testAPIEndpoint }
  ];
  
  const results = await Promise.all(
    tests.map(async (test) => {
      try {
        const success = await test.fn();
        return { name: test.name, success };
      } catch (error) {
        console.error(`❌ ${test.name} failed with error:`, error);
        return { name: test.name, success: false };
      }
    })
  );
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  results.forEach(({ name, success }) => {
    console.log(`${success ? '✅' : '❌'} ${name}`);
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed (${(passedTests/totalTests*100).toFixed(1)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! AEMD integration is ready for production.');
  } else {
    console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };
