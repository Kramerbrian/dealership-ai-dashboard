#!/usr/bin/env node

/**
 * Test script for DealershipAI Algorithmic Trust Models v1.0
 * Tests all models with the example payload from the specification
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Example payload from specification
const examplePayload = {
  vertical: "acquisition",
  trustInputs: { 
    eeat: 0.8, 
    reputation: 0.9, 
    technical: 0.85, 
    localVis: 0.75, 
    compliance: 0.9 
  },
  qaiInputs: { 
    authority: 0.82, 
    trust: 0.88, 
    experience: 0.79, 
    recency: 0.83, 
    structure: 0.9 
  },
  piqrInputs: { 
    visibility: 0.85, 
    ux: 0.8, 
    consistency: 0.78, 
    sentiment: 0.86, 
    compliance: 0.9 
  },
  aviInputs: { 
    seo: 0.82, 
    aeo: 0.79, 
    geo: 0.85, 
    ugc: 0.7 
  }
};

// Expected output from specification
const expectedOutput = {
  vertical: "acquisition",
  algorithmicTrust: 86.75,
  QAI: 0.83,
  PIQR: 18.4,
  AVI: 80.4,
  DTRI: 80.5
};

async function testAlgorithmicTrust() {
  console.log('🧪 Testing Algorithmic Trust Model...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/algorithmic-trust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vertical: examplePayload.vertical,
        trustInputs: examplePayload.trustInputs
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Algorithmic Trust Test Passed');
      console.log(`   Score: ${result.data.algorithmicTrust}`);
      console.log(`   Expected: ${expectedOutput.algorithmicTrust}`);
      console.log(`   Match: ${Math.abs(result.data.algorithmicTrust - expectedOutput.algorithmicTrust) < 1 ? '✅' : '❌'}`);
    } else {
      console.log('❌ Algorithmic Trust Test Failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Algorithmic Trust Test Error:', error.message);
  }
}

async function testVerticalBundle() {
  console.log('🧪 Testing Vertical Bundle Model...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/vertical-bundle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examplePayload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Vertical Bundle Test Passed');
      console.log(`   DTRI: ${result.data.DTRI}`);
      console.log(`   Expected: ${expectedOutput.DTRI}`);
      console.log(`   Match: ${Math.abs(result.data.DTRI - expectedOutput.DTRI) < 1 ? '✅' : '❌'}`);
      
      console.log('\n📊 Detailed Results:');
      console.log(`   Algorithmic Trust: ${result.data.algorithmicTrust} (expected: ${expectedOutput.algorithmicTrust})`);
      console.log(`   QAI: ${result.data.QAI} (expected: ${expectedOutput.QAI})`);
      console.log(`   PIQR: ${result.data.PIQR} (expected: ${expectedOutput.PIQR})`);
      console.log(`   AVI: ${result.data.AVI} (expected: ${expectedOutput.AVI})`);
      
      console.log('\n💡 Insights:');
      result.data.insights.forEach(insight => console.log(`   - ${insight}`));
      
      console.log('\n🎯 Recommendations:');
      result.data.recommendations.forEach(rec => console.log(`   - ${rec}`));
      
    } else {
      console.log('❌ Vertical Bundle Test Failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Vertical Bundle Test Error:', error.message);
  }
}

async function testAllVerticals() {
  console.log('🧪 Testing All Verticals...');
  
  const verticals = ['acquisition', 'service', 'parts'];
  
  for (const vertical of verticals) {
    console.log(`\n📊 Testing ${vertical} vertical...`);
    
    try {
      const payload = { ...examplePayload, vertical };
      const response = await fetch(`${BASE_URL}/api/vertical-bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ ${vertical}: DTRI = ${result.data.DTRI}`);
      } else {
        console.log(`   ❌ ${vertical}: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${vertical}: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 DealershipAI Algorithmic Trust Models v1.0 - Test Suite');
  console.log('=' .repeat(60));
  
  await testAlgorithmicTrust();
  console.log('');
  
  await testVerticalBundle();
  console.log('');
  
  await testAllVerticals();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Test suite completed!');
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testAlgorithmicTrust, testVerticalBundle, testAllVerticals };
