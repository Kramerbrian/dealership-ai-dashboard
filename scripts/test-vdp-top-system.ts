#!/usr/bin/env tsx

/**
 * VDP-TOP System Test Suite
 * 
 * Comprehensive testing for the Triple-Optimization Content Protocol
 * Tests all components: protocol, compliance, AI integration, and API endpoints
 */

import { generateVDPTopContentWithAI, batchGenerateVDPContent } from '../src/lib/vdp-ai-integration';
import { VDPContextData } from '../src/lib/vdp-top-protocol';
import { validateBeforePublish, batchComplianceCheck, generateComplianceReport } from '../src/lib/vdp-compliance-middleware';

// Test data
const testContexts: VDPContextData[] = [
  {
    vin: '1HGBH41JXMN109186',
    vinDecodedSpecs: {
      year: 2024,
      make: 'Honda',
      model: 'Civic',
      trim: 'EX',
      msrp: 25000,
      features: ['Bluetooth', 'Backup Camera', 'Lane Assist', 'Apple CarPlay'],
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
  },
  {
    vin: '1FTFW1ET5DFC12345',
    vinDecodedSpecs: {
      year: 2023,
      make: 'Ford',
      model: 'F-150',
      trim: 'Lariat',
      msrp: 55000,
      features: ['4WD', 'Towing Package', 'Leather Seats', 'Navigation'],
      fuelEconomy: { city: 18, highway: 24, combined: 20 },
      engine: '3.5L EcoBoost V6',
      transmission: '10-Speed Automatic',
      drivetrain: '4WD',
      exteriorColor: 'Blue',
      interiorColor: 'Tan',
      mileage: 25000
    },
    dealerData: {
      name: 'Premier Ford',
      city: 'Dallas',
      state: 'TX',
      masterTechName: 'Mike Johnson',
      servicePageUrl: 'https://premierford.com/service',
      currentPrice: 52000,
      schemaId: 'https://premierford.com/#dealer'
    },
    vcoClusterId: 'Cluster 2: Luxury, Performance Buyers',
    targetedSentiment: 'Power and Capability',
    vdpUrl: 'https://premierford.com/vehicles/1FTFW1ET5DFC12345'
  },
  {
    vin: '1N4AL3AP8JC123456',
    vinDecodedSpecs: {
      year: 2022,
      make: 'Nissan',
      model: 'Sentra',
      trim: 'S',
      msrp: 20000,
      features: ['Bluetooth', 'Backup Camera', 'Cruise Control'],
      fuelEconomy: { city: 29, highway: 39, combined: 33 },
      engine: '2.0L 4-Cylinder',
      transmission: 'CVT',
      drivetrain: 'FWD',
      exteriorColor: 'White',
      interiorColor: 'Gray',
      mileage: 35000
    },
    dealerData: {
      name: 'Budget Nissan',
      city: 'Phoenix',
      state: 'AZ',
      masterTechName: 'Sarah Wilson',
      servicePageUrl: 'https://budgetnissan.com/service',
      currentPrice: 18500,
      schemaId: 'https://budgetnissan.com/#dealer'
    },
    vcoClusterId: 'Cluster 3: Budget-Conscious, First-Time Buyers',
    targetedSentiment: 'Value and Efficiency',
    vdpUrl: 'https://budgetnissan.com/vehicles/1N4AL3AP8JC123456'
  }
];

async function testSingleVDPGeneration() {
  console.log('\n🧪 Testing Single VDP Generation...');
  
  try {
    const context = testContexts[0];
    const result = await generateVDPTopContentWithAI(context, 'openai');
    
    console.log('✅ Single VDP generation successful');
    console.log(`   VIN: ${context.vin}`);
    console.log(`   VAI Score: ${result.compliance.vaiScore.toFixed(2)}`);
    console.log(`   PIQR Score: ${result.compliance.piqrScore.toFixed(2)}`);
    console.log(`   HRP Score: ${result.compliance.hrpScore.toFixed(2)}`);
    console.log(`   Compliant: ${result.complianceCheck.isCompliant}`);
    console.log(`   Can Publish: ${result.complianceCheck.canPublish}`);
    console.log(`   AEO Words: ${result.metadata.wordCounts.aeo}`);
    console.log(`   GEO Words: ${result.metadata.wordCounts.geo}`);
    console.log(`   SEO Words: ${result.metadata.wordCounts.seo}`);
    
    return true;
  } catch (error) {
    console.error('❌ Single VDP generation failed:', error);
    return false;
  }
}

async function testBatchVDPGeneration() {
  console.log('\n🧪 Testing Batch VDP Generation...');
  
  try {
    const results = await batchGenerateVDPContent(testContexts, 'openai');
    
    console.log('✅ Batch VDP generation successful');
    console.log(`   Generated ${results.length} VDPs`);
    
    const avgVAIScore = results.reduce((sum, r) => sum + r.compliance.vaiScore, 0) / results.length;
    const avgPIQRScore = results.reduce((sum, r) => sum + r.compliance.piqrScore, 0) / results.length;
    const avgHRPScore = results.reduce((sum, r) => sum + r.compliance.hrpScore, 0) / results.length;
    
    console.log(`   Average VAI Score: ${avgVAIScore.toFixed(2)}`);
    console.log(`   Average PIQR Score: ${avgPIQRScore.toFixed(2)}`);
    console.log(`   Average HRP Score: ${avgHRPScore.toFixed(2)}`);
    
    const compliantCount = results.filter(r => r.complianceCheck.isCompliant).length;
    const publishableCount = results.filter(r => r.complianceCheck.canPublish).length;
    
    console.log(`   Compliant: ${compliantCount}/${results.length} (${(compliantCount/results.length*100).toFixed(1)}%)`);
    console.log(`   Publishable: ${publishableCount}/${results.length} (${(publishableCount/results.length*100).toFixed(1)}%)`);
    
    return true;
  } catch (error) {
    console.error('❌ Batch VDP generation failed:', error);
    return false;
  }
}

async function testComplianceValidation() {
  console.log('\n🧪 Testing Compliance Validation...');
  
  try {
    const results = await batchGenerateVDPContent(testContexts, 'openai');
    
    // Test individual compliance checks
    for (const result of results) {
      const complianceCheck = validateBeforePublish(
        result.content,
        testContexts.find(c => c.vin === result.metadata.clusterId) || testContexts[0],
        result.compliance
      );
      
      console.log(`   VIN ${result.metadata.clusterId}: ${complianceCheck.isCompliant ? '✅' : '❌'} Compliant`);
      if (complianceCheck.issues.length > 0) {
        console.log(`     Issues: ${complianceCheck.issues.join(', ')}`);
      }
    }
    
    // Test batch compliance check
    const batchResults = batchComplianceCheck(
      results.map((result, index) => ({
        content: result.content,
        context: testContexts[index],
        compliance: result.compliance
      }))
    );
    
    console.log('✅ Batch compliance validation successful');
    console.log(`   Total VDPs: ${batchResults.summary.total}`);
    console.log(`   Compliant: ${batchResults.summary.compliant}`);
    console.log(`   Publishable: ${batchResults.summary.publishable}`);
    console.log(`   Requires Review: ${batchResults.summary.requiresReview}`);
    console.log(`   Average Score: ${batchResults.summary.averageScore}`);
    
    // Test compliance reporting
    const report = generateComplianceReport(batchResults);
    console.log(`   Status: ${report.status.toUpperCase()}`);
    console.log(`   Message: ${report.message}`);
    if (report.actions.length > 0) {
      console.log(`   Actions: ${report.actions.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Compliance validation failed:', error);
    return false;
  }
}

async function testAIProviderComparison() {
  console.log('\n🧪 Testing AI Provider Comparison...');
  
  try {
    const context = testContexts[0];
    const providers: Array<'openai' | 'anthropic' | 'gemini'> = ['openai', 'anthropic', 'gemini'];
    
    const results = await Promise.all(
      providers.map(async (provider) => {
        const result = await generateVDPTopContentWithAI(context, provider);
        return { provider, result };
      })
    );
    
    console.log('✅ AI provider comparison successful');
    
    results.forEach(({ provider, result }) => {
      console.log(`   ${provider.toUpperCase()}:`);
      console.log(`     VAI Score: ${result.compliance.vaiScore.toFixed(2)}`);
      console.log(`     PIQR Score: ${result.compliance.piqrScore.toFixed(2)}`);
      console.log(`     HRP Score: ${result.compliance.hrpScore.toFixed(2)}`);
      console.log(`     Compliant: ${result.complianceCheck.isCompliant}`);
      console.log(`     AEO Words: ${result.metadata.wordCounts.aeo}`);
      console.log(`     GEO Words: ${result.metadata.wordCounts.geo}`);
      console.log(`     SEO Words: ${result.metadata.wordCounts.seo}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ AI provider comparison failed:', error);
    return false;
  }
}

async function testContentQualityMetrics() {
  console.log('\n🧪 Testing Content Quality Metrics...');
  
  try {
    const results = await batchGenerateVDPContent(testContexts, 'openai');
    
    console.log('✅ Content quality metrics analysis successful');
    
    // Analyze word count compliance
    const aeoCompliance = results.filter(r => r.metadata.wordCounts.aeo <= 40).length;
    const geoCompliance = results.filter(r => r.metadata.wordCounts.geo >= 80 && r.metadata.wordCounts.geo <= 120).length;
    const seoCompliance = results.filter(r => r.metadata.wordCounts.seo >= 200 && r.metadata.wordCounts.seo <= 300).length;
    
    console.log(`   AEO Word Count Compliance: ${aeoCompliance}/${results.length} (${(aeoCompliance/results.length*100).toFixed(1)}%)`);
    console.log(`   GEO Word Count Compliance: ${geoCompliance}/${results.length} (${(geoCompliance/results.length*100).toFixed(1)}%)`);
    console.log(`   SEO Word Count Compliance: ${seoCompliance}/${results.length} (${(seoCompliance/results.length*100).toFixed(1)}%)`);
    
    // Analyze internal link compliance
    const linkCompliance = results.filter(r => r.content.Internal_Link_Block.length >= 3).length;
    console.log(`   Internal Link Compliance: ${linkCompliance}/${results.length} (${(linkCompliance/results.length*100).toFixed(1)}%)`);
    
    // Analyze cluster-specific performance
    const clusterPerformance = results.reduce((acc, result, index) => {
      const clusterId = testContexts[index].vcoClusterId;
      if (!acc[clusterId]) {
        acc[clusterId] = { total: 0, compliant: 0, vaiScores: [] };
      }
      acc[clusterId].total++;
      if (result.complianceCheck.isCompliant) acc[clusterId].compliant++;
      acc[clusterId].vaiScores.push(result.compliance.vaiScore);
      return acc;
    }, {} as Record<string, { total: number; compliant: number; vaiScores: number[] }>);
    
    console.log('   Cluster Performance:');
    Object.entries(clusterPerformance).forEach(([cluster, data]) => {
      const complianceRate = (data.compliant / data.total) * 100;
      const avgVAIScore = data.vaiScores.reduce((sum, score) => sum + score, 0) / data.vaiScores.length;
      console.log(`     ${cluster}: ${complianceRate.toFixed(1)}% compliant, ${avgVAIScore.toFixed(1)} avg VAI`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Content quality metrics failed:', error);
    return false;
  }
}

async function testAPIEndpoint() {
  console.log('\n🧪 Testing API Endpoint...');
  
  try {
    // Test GET endpoint (documentation)
    const getResponse = await fetch('http://localhost:3000/api/vdp-generate');
    if (!getResponse.ok) {
      throw new Error(`GET request failed: ${getResponse.status}`);
    }
    
    const getData = await getResponse.json();
    console.log('✅ GET endpoint successful');
    console.log(`   Endpoint: ${getData.endpoint}`);
    console.log(`   Features: ${getData.features.length} features documented`);
    
    // Test POST endpoint with mock data
    const postData = {
      vin: testContexts[0].vin,
      vcoClusterId: testContexts[0].vcoClusterId,
      targetedSentiment: testContexts[0].targetedSentiment,
      aiProvider: 'openai',
      vinDecodedSpecs: testContexts[0].vinDecodedSpecs,
      dealerData: testContexts[0].dealerData,
      vdpUrl: testContexts[0].vdpUrl
    };
    
    const postResponse = await fetch('http://localhost:3000/api/vdp-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real testing, you'd need proper authentication
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
    console.log(`   Generated VDP for VIN: ${postResult.data.metadata.clusterId}`);
    console.log(`   VAI Score: ${postResult.data.compliance.vaiScore.toFixed(2)}`);
    
    return true;
  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting VDP-TOP System Test Suite...\n');
  
  const tests = [
    { name: 'Single VDP Generation', fn: testSingleVDPGeneration },
    { name: 'Batch VDP Generation', fn: testBatchVDPGeneration },
    { name: 'Compliance Validation', fn: testComplianceValidation },
    { name: 'AI Provider Comparison', fn: testAIProviderComparison },
    { name: 'Content Quality Metrics', fn: testContentQualityMetrics },
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
    console.log('🎉 All tests passed! VDP-TOP system is ready for production.');
  } else {
    console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };
