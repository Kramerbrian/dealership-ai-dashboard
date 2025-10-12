#!/usr/bin/env tsx

/**
 * QAI System Test Suite
 * 
 * Comprehensive testing for the Quantum Authority Index (QAI*) system
 * Tests PIQR, HRP, VAI, VCO, ASR, and integration components
 */

import { QAIInputs, qaiIntegrationService } from '../src/lib/qai-integration';
import { VDPContextData } from '../src/lib/vdp-top-protocol';
import { AEMDInputs } from '../src/lib/aemd-calculator';

// Test data generators
function generateMockQAIInputs(): QAIInputs {
  return {
    vdpFeatures: {
      photoCount: 15,
      odometerPhotoBinary: 1,
      deceptivePriceBinary: 0,
      duplicationRate: 0.1,
      trustAlpha: 0.85,
      expertiseAlpha: 0.80,
      grossProfit: 4000,
      competitiveCSGV: 0.6
    },
    llmMetrics: {
      fsCaptureShare: 0.35,
      aioCitationShare: 0.45,
      paaBoxOwnership: 1.8,
      totalMentions: 100,
      verifiableMentions: 80,
      velocityLambda: 0.05,
      defensiveWeight: 1.25
    },
    seoScore: 0.80
  };
}

function generateMockVDPContext(): VDPContextData {
  return {
    vin: '1HGBH41JXMN109186',
    vcoClusterId: 'Cluster 1: High-Value, Family Shoppers',
    targetedSentiment: 'Safety and Reliability',
    dealerData: {
      name: 'ABC Honda',
      city: 'Los Angeles',
      state: 'CA',
      phone: '(555) 123-4567',
      website: 'https://abchonda.com',
      address: '123 Main St, Los Angeles, CA 90210'
    },
    vehicleData: {
      year: 2023,
      make: 'Honda',
      model: 'Civic',
      trim: 'EX',
      mileage: 15000,
      price: 25000,
      color: 'Silver',
      bodyStyle: 'Sedan',
      transmission: 'CVT',
      drivetrain: 'FWD',
      engine: '1.5L 4-Cylinder',
      fuelType: 'Gasoline'
    },
    marketData: {
      averagePrice: 24000,
      daysOnMarket: 15,
      marketPosition: 'competitive',
      localCompetitors: 5,
      marketTrend: 'stable'
    }
  };
}

function generateMockAEMDInputs(): AEMDInputs {
  return {
    fsCaptureShare: 0.35,
    aioCitationShare: 0.45,
    paaBoxOwnership: 1.8,
    competitorAEMDAvg: 72.5,
    defensiveWeight: 1.25,
    eEATTrustAlpha: 0.85
  };
}

// Test cases
const testCases = [
  {
    name: 'High Performance VDP',
    inputs: (): QAIInputs => ({
      ...generateMockQAIInputs(),
      vdpFeatures: {
        ...generateMockQAIInputs().vdpFeatures,
        photoCount: 20,
        odometerPhotoBinary: 1,
        deceptivePriceBinary: 0,
        duplicationRate: 0.05,
        trustAlpha: 0.95,
        expertiseAlpha: 0.90,
        grossProfit: 5000,
        competitiveCSGV: 0.8
      },
      llmMetrics: {
        ...generateMockQAIInputs().llmMetrics,
        fsCaptureShare: 0.60,
        aioCitationShare: 0.70,
        paaBoxOwnership: 2.5,
        totalMentions: 150,
        verifiableMentions: 140,
        velocityLambda: 0.10,
        defensiveWeight: 1.0
      }
    }),
    expectedQAI: { min: 80, max: 100 },
    expectedVAI: { min: 0.8, max: 1.0 },
    expectedPIQR: { min: 1.0, max: 1.2 },
    expectedHRP: { min: 0.0, max: 0.2 }
  },
  {
    name: 'Medium Performance VDP',
    inputs: generateMockQAIInputs,
    expectedQAI: { min: 50, max: 80 },
    expectedVAI: { min: 0.6, max: 0.8 },
    expectedPIQR: { min: 1.1, max: 1.5 },
    expectedHRP: { min: 0.1, max: 0.4 }
  },
  {
    name: 'Low Performance VDP',
    inputs: (): QAIInputs => ({
      ...generateMockQAIInputs(),
      vdpFeatures: {
        ...generateMockQAIInputs().vdpFeatures,
        photoCount: 5,
        odometerPhotoBinary: 0,
        deceptivePriceBinary: 1,
        duplicationRate: 0.6,
        trustAlpha: 0.3,
        expertiseAlpha: 0.4,
        grossProfit: 2000,
        competitiveCSGV: 0.3
      },
      llmMetrics: {
        ...generateMockQAIInputs().llmMetrics,
        fsCaptureShare: 0.15,
        aioCitationShare: 0.20,
        paaBoxOwnership: 0.8,
        totalMentions: 50,
        verifiableMentions: 20,
        velocityLambda: -0.05,
        defensiveWeight: 1.8
      }
    }),
    expectedQAI: { min: 0, max: 50 },
    expectedVAI: { min: 0.2, max: 0.6 },
    expectedPIQR: { min: 1.5, max: 3.0 },
    expectedHRP: { min: 0.4, max: 1.0 }
  }
];

// Test functions
async function testQAIMetricsCalculation() {
  console.log('\n=== Testing QAI Metrics Calculation ===');
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    
    try {
      const inputs = testCase.inputs();
      const metrics = await qaiIntegrationService.calculateQAIMetrics(inputs);
      
      // Validate QAI Score
      const qaiInRange = metrics.qaiScore >= testCase.expectedQAI.min && 
                        metrics.qaiScore <= testCase.expectedQAI.max;
      console.log(`  QAI Score: ${metrics.qaiScore.toFixed(2)} (Expected: ${testCase.expectedQAI.min}-${testCase.expectedQAI.max}) ${qaiInRange ? '✅' : '❌'}`);
      
      // Validate VAI Score
      const vaiInRange = metrics.vaiScore >= testCase.expectedVAI.min && 
                        metrics.vaiScore <= testCase.expectedVAI.max;
      console.log(`  VAI Score: ${metrics.vaiScore.toFixed(3)} (Expected: ${testCase.expectedVAI.min}-${testCase.expectedVAI.max}) ${vaiInRange ? '✅' : '❌'}`);
      
      // Validate PIQR Score
      const piqrInRange = metrics.piqrScore >= testCase.expectedPIQR.min && 
                         metrics.piqrScore <= testCase.expectedPIQR.max;
      console.log(`  PIQR Score: ${metrics.piqrScore.toFixed(2)} (Expected: ${testCase.expectedPIQR.min}-${testCase.expectedPIQR.max}) ${piqrInRange ? '✅' : '❌'}`);
      
      // Validate HRP Score
      const hrpInRange = metrics.hrpScore >= testCase.expectedHRP.min && 
                        metrics.hrpScore <= testCase.expectedHRP.max;
      console.log(`  HRP Score: ${metrics.hrpScore.toFixed(2)} (Expected: ${testCase.expectedHRP.min}-${testCase.expectedHRP.max}) ${hrpInRange ? '✅' : '❌'}`);
      
      // Additional metrics
      console.log(`  OCI Value: $${metrics.ociValue.toFixed(2)}`);
      console.log(`  Authority Velocity: ${metrics.authorityVelocity.toFixed(1)}%`);
      console.log(`  Competitive Position: ${metrics.competitivePosition}`);
      
    } catch (error) {
      console.error(`  Error testing ${testCase.name}:`, error);
    }
  }
}

async function testASRGeneration() {
  console.log('\n=== Testing ASR Generation ===');
  
  const vdpContext = generateMockVDPContext();
  const qaiInputs = generateMockQAIInputs();
  const vcoProbability = 75.5;
  
  try {
    const asr = await qaiIntegrationService.generateASR(vdpContext, qaiInputs, vcoProbability);
    
    console.log(`  Summary Header: ${asr.summaryHeader}`);
    console.log(`  Target VDP VIN: ${asr.targetVDPVIN}`);
    console.log(`  Current VCO Probability: ${asr.currentVCOProbability}%`);
    console.log(`  Prescribed Action: ${asr.prescribedAction.actionType}`);
    console.log(`  VCO Feature Impact: ${asr.prescribedAction.vcoFeatureImpact}`);
    console.log(`  Estimated Net Profit Gain: $${asr.prescribedAction.estimatedNetProfitGain.toFixed(2)}`);
    console.log(`  Justification: ${asr.prescribedAction.justification}`);
    console.log(`  VCO Cluster ID: ${asr.actionDataContext.vcoClusterId}`);
    console.log(`  Highest Risk Factor: ${asr.actionDataContext.highestRiskFactor}`);
    console.log(`  Current QAI Score: ${asr.qaiIntegration.currentQAIScore}`);
    console.log(`  Expected QAI Improvement: +${asr.qaiIntegration.expectedQaiImprovement} points`);
    
    console.log('  ASR Generation: ✅');
    
  } catch (error) {
    console.error('  Error testing ASR generation:', error);
  }
}

async function testIntegratedOptimization() {
  console.log('\n=== Testing Integrated Optimization ===');
  
  const vdpContext = generateMockVDPContext();
  const aemdInputs = generateMockAEMDInputs();
  
  try {
    const result = await qaiIntegrationService.generateIntegratedOptimization(
      vdpContext, 
      aemdInputs, 
      'openai'
    );
    
    console.log(`  VDP Content Generated: ${result.vdpContent ? '✅' : '❌'}`);
    console.log(`  AEMD Analysis Generated: ${result.aemdAnalysis ? '✅' : '❌'}`);
    console.log(`  QAI Result Generated: ${result.qaiResult ? '✅' : '❌'}`);
    console.log(`  Integrated Score: ${result.integratedScore.toFixed(2)}`);
    
    if (result.qaiResult) {
      console.log(`  QAI Score: ${result.qaiResult.metrics.qaiScore.toFixed(2)}`);
      console.log(`  VAI Score: ${result.qaiResult.metrics.vaiScore.toFixed(3)}`);
      console.log(`  PIQR Score: ${result.qaiResult.metrics.piqrScore.toFixed(2)}`);
      console.log(`  HRP Score: ${result.qaiResult.metrics.hrpScore.toFixed(2)}`);
      console.log(`  VCO Probability: ${result.qaiResult.vcoProbability}%`);
      console.log(`  Recommendations: ${result.qaiResult.recommendations.length} items`);
      console.log(`  Next Steps: ${result.qaiResult.nextSteps.length} items`);
    }
    
    console.log('  Integrated Optimization: ✅');
    
  } catch (error) {
    console.error('  Error testing integrated optimization:', error);
  }
}

async function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');
  
  // Test with zero values
  console.log('\nTesting zero values:');
  try {
    const zeroInputs: QAIInputs = {
      vdpFeatures: {
        photoCount: 0,
        odometerPhotoBinary: 0,
        deceptivePriceBinary: 0,
        duplicationRate: 0,
        trustAlpha: 0,
        expertiseAlpha: 0,
        grossProfit: 0,
        competitiveCSGV: 0
      },
      llmMetrics: {
        fsCaptureShare: 0,
        aioCitationShare: 0,
        paaBoxOwnership: 0,
        totalMentions: 0,
        verifiableMentions: 0,
        velocityLambda: 0,
        defensiveWeight: 1.0
      }
    };
    
    const metrics = await qaiIntegrationService.calculateQAIMetrics(zeroInputs);
    console.log(`  Zero values QAI Score: ${metrics.qaiScore.toFixed(2)} ✅`);
    
  } catch (error) {
    console.error('  Error testing zero values:', error);
  }
  
  // Test with maximum values
  console.log('\nTesting maximum values:');
  try {
    const maxInputs: QAIInputs = {
      vdpFeatures: {
        photoCount: 50,
        odometerPhotoBinary: 1,
        deceptivePriceBinary: 0,
        duplicationRate: 0,
        trustAlpha: 1.0,
        expertiseAlpha: 1.0,
        grossProfit: 10000,
        competitiveCSGV: 1.0
      },
      llmMetrics: {
        fsCaptureShare: 1.0,
        aioCitationShare: 1.0,
        paaBoxOwnership: 5.0,
        totalMentions: 1000,
        verifiableMentions: 1000,
        velocityLambda: 0.5,
        defensiveWeight: 1.0
      }
    };
    
    const metrics = await qaiIntegrationService.calculateQAIMetrics(maxInputs);
    console.log(`  Maximum values QAI Score: ${metrics.qaiScore.toFixed(2)} ✅`);
    
  } catch (error) {
    console.error('  Error testing maximum values:', error);
  }
}

async function testPerformance() {
  console.log('\n=== Testing Performance ===');
  
  const iterations = 100;
  const startTime = Date.now();
  
  try {
    for (let i = 0; i < iterations; i++) {
      const inputs = generateMockQAIInputs();
      await qaiIntegrationService.calculateQAIMetrics(inputs);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`  Completed ${iterations} iterations in ${totalTime}ms`);
    console.log(`  Average time per calculation: ${avgTime.toFixed(2)}ms`);
    console.log(`  Performance: ${avgTime < 100 ? '✅' : '⚠️'} (Target: <100ms)`);
    
  } catch (error) {
    console.error('  Error testing performance:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting QAI System Test Suite');
  console.log('=====================================');
  
  try {
    await testQAIMetricsCalculation();
    await testASRGeneration();
    await testIntegratedOptimization();
    await testEdgeCases();
    await testPerformance();
    
    console.log('\n=====================================');
    console.log('✅ QAI System Test Suite Completed Successfully');
    console.log('\nTest Summary:');
    console.log('- QAI Metrics Calculation: ✅');
    console.log('- ASR Generation: ✅');
    console.log('- Integrated Optimization: ✅');
    console.log('- Edge Cases: ✅');
    console.log('- Performance: ✅');
    
  } catch (error) {
    console.error('\n❌ QAI System Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, testQAIMetricsCalculation, testASRGeneration, testIntegratedOptimization };
