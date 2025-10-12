#!/usr/bin/env node

/**
 * Direct test of DealershipAI Algorithmic Trust Models v1.0
 * Tests models directly without API calls
 */

// Import the models directly
const { algorithmicTrustScore } = require('../lib/scoring/algorithmicTrust.ts');
const { qaiComposite } = require('../lib/scoring/qaiComposite.ts');
const { piqrRisk } = require('../lib/scoring/piqr.ts');
const { aviComposite } = require('../lib/scoring/aviComposite.ts');
const { computeVerticalBundle } = require('../lib/scoring/verticalComposite.ts');

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

function testIndividualModels() {
  console.log('🧪 Testing Individual Models...');
  
  try {
    // Test Algorithmic Trust
    const trustScore = algorithmicTrustScore(examplePayload.trustInputs, examplePayload.vertical);
    console.log(`✅ Algorithmic Trust: ${trustScore} (expected: ${expectedOutput.algorithmicTrust})`);
    console.log(`   Match: ${Math.abs(trustScore - expectedOutput.algorithmicTrust) < 1 ? '✅' : '❌'}`);
    
    // Test QAI
    const qaiScore = qaiComposite(examplePayload.qaiInputs);
    console.log(`✅ QAI: ${qaiScore} (expected: ${expectedOutput.QAI})`);
    console.log(`   Match: ${Math.abs(qaiScore - expectedOutput.QAI) < 0.1 ? '✅' : '❌'}`);
    
    // Test PIQR
    const piqrScore = piqrRisk(examplePayload.piqrInputs);
    console.log(`✅ PIQR: ${piqrScore} (expected: ${expectedOutput.PIQR})`);
    console.log(`   Match: ${Math.abs(piqrScore - expectedOutput.PIQR) < 1 ? '✅' : '❌'}`);
    
    // Test AVI
    const aviScore = aviComposite(examplePayload.aviInputs);
    console.log(`✅ AVI: ${aviScore} (expected: ${expectedOutput.AVI})`);
    console.log(`   Match: ${Math.abs(aviScore - expectedOutput.AVI) < 1 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('❌ Individual Models Test Error:', error.message);
  }
}

function testVerticalBundle() {
  console.log('\n🧪 Testing Vertical Bundle...');
  
  try {
    const result = computeVerticalBundle(examplePayload, examplePayload.vertical);
    
    console.log(`✅ DTRI: ${result.DTRI} (expected: ${expectedOutput.DTRI})`);
    console.log(`   Match: ${Math.abs(result.DTRI - expectedOutput.DTRI) < 1 ? '✅' : '❌'}`);
    
    console.log('\n📊 Detailed Results:');
    console.log(`   Algorithmic Trust: ${result.algorithmicTrust} (expected: ${expectedOutput.algorithmicTrust})`);
    console.log(`   QAI: ${result.QAI} (expected: ${expectedOutput.QAI})`);
    console.log(`   PIQR: ${result.PIQR} (expected: ${expectedOutput.PIQR})`);
    console.log(`   AVI: ${result.AVI} (expected: ${expectedOutput.AVI})`);
    
    console.log('\n💡 Insights:');
    result.insights.forEach(insight => console.log(`   - ${insight}`));
    
    console.log('\n🎯 Recommendations:');
    result.recommendations.forEach(rec => console.log(`   - ${rec}`));
    
  } catch (error) {
    console.log('❌ Vertical Bundle Test Error:', error.message);
  }
}

function testAllVerticals() {
  console.log('\n🧪 Testing All Verticals...');
  
  const verticals = ['acquisition', 'service', 'parts'];
  
  for (const vertical of verticals) {
    console.log(`\n📊 Testing ${vertical} vertical...`);
    
    try {
      const payload = { ...examplePayload, vertical };
      const result = computeVerticalBundle(payload, vertical);
      
      console.log(`   ✅ ${vertical}: DTRI = ${result.DTRI}`);
      console.log(`   Trust: ${result.algorithmicTrust}, QAI: ${result.QAI}, PIQR: ${result.PIQR}, AVI: ${result.AVI}`);
      
    } catch (error) {
      console.log(`   ❌ ${vertical}: ${error.message}`);
    }
  }
}

function runAllTests() {
  console.log('🚀 DealershipAI Algorithmic Trust Models v1.0 - Direct Test Suite');
  console.log('=' .repeat(70));
  
  testIndividualModels();
  testVerticalBundle();
  testAllVerticals();
  
  console.log('\n' + '=' .repeat(70));
  console.log('✅ Direct test suite completed!');
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = { testIndividualModels, testVerticalBundle, testAllVerticals };

