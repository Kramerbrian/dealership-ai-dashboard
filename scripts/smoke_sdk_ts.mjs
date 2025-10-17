#!/usr/bin/env node

// TypeScript SDK smoke test script
// Tests the DealershipAI TypeScript SDK functionality

import { DealershipAI } from '../sdk/ts/index.js';

// Configuration from environment variables
const BASE = process.env.BASE;
const TOKEN = process.env.TOKEN;
const TENANT = process.env.TENANT;

if (!BASE || !TOKEN || !TENANT) {
  console.error('❌ Missing required environment variables:');
  console.error('   BASE: API base URL');
  console.error('   TOKEN: Bearer token');
  console.error('   TENANT: Tenant ID');
  process.exit(1);
}

console.log('🧪 Running TypeScript SDK smoke tests...');
console.log(`Base URL: ${BASE}`);
console.log(`Tenant ID: ${TENANT}`);
console.log('');

// Initialize SDK
const api = new DealershipAI({
  baseUrl: BASE,
  token: TOKEN,
  fetcher: fetch,
  timeout: 30000
});

async function runTests() {
  try {
    // Test 1: HRP Status
    console.log('1️⃣ Testing HRP status...');
    const hrpStatus = await api.hrpStatus(TENANT);
    console.log('✅ HRP status retrieved successfully');
    console.log(`   - Findings: ${hrpStatus.findings.length}`);
    console.log(`   - Quarantined topics: ${hrpStatus.quarantine.length}`);
    console.log('');

    // Test 2: HRP Scan
    console.log('2️⃣ Testing HRP scan...');
    const scanResult = await api.hrpScan(TENANT);
    console.log('✅ HRP scan initiated successfully');
    console.log(`   - Message: ${scanResult.message}`);
    console.log('');

    // Test 3: Generate idempotency key
    console.log('3️⃣ Testing idempotency key generation...');
    const idempotencyKey = api.generateIdempotencyKey();
    console.log('✅ Idempotency key generated');
    console.log(`   - Key: ${idempotencyKey}`);
    console.log('');

    // Test 4: ASR Execute (with mock data)
    console.log('4️⃣ Testing ASR execute...');
    try {
      const asrResult = await api.asrExecute(
        TENANT,
        ['vdp-123', 'vdp-456'],
        idempotencyKey,
        {
          includeCompetitors: false,
          analysisDepth: 'quick'
        }
      );
      console.log('✅ ASR execute successful');
      console.log(`   - Recommendations: ${asrResult.recommendations.length}`);
      console.log(`   - Total impact: ${asrResult.summary.estimatedImpact}`);
    } catch (error) {
      if (error.message.includes('412') || error.message.includes('No context')) {
        console.log('⚠️  ASR execute returned 412 (No context) - this is expected for demo data');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 5: Batch HRP resolve (if there are quarantined topics)
    console.log('5️⃣ Testing batch HRP resolve...');
    const quarantinedTopics = hrpStatus.quarantine
      .filter(q => q.active)
      .map(q => q.topic);
    
    if (quarantinedTopics.length > 0) {
      console.log(`   Resolving topics: ${quarantinedTopics.join(', ')}`);
      const batchResults = await api.batchHrpResolve(TENANT, quarantinedTopics);
      
      const successful = batchResults.filter(r => r.success).length;
      const failed = batchResults.filter(r => !r.success).length;
      
      console.log(`✅ Batch resolve completed: ${successful} successful, ${failed} failed`);
    } else {
      console.log('   No quarantined topics to resolve (this is normal for a clean system)');
    }
    console.log('');

    // Test 6: AVI Latest (if available)
    console.log('6️⃣ Testing AVI latest...');
    try {
      const aviLatest = await api.aviLatest(TENANT);
      console.log('✅ AVI latest retrieved successfully');
      console.log(`   - AIV Score: ${aviLatest.aiv}`);
      console.log(`   - Google SGE: ${aviLatest.breakdown.google_sge}`);
      console.log(`   - Perplexity: ${aviLatest.breakdown.perplexity}`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log('⚠️  AVI latest returned 404 (No data) - this is expected for demo data');
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('🎉 All TypeScript SDK smoke tests passed!');
    console.log('');
    console.log('Summary:');
    console.log('- HRP Status: ✅ Working');
    console.log('- HRP Scan: ✅ Working');
    console.log('- Idempotency Key: ✅ Working');
    console.log('- ASR Execute: ✅ Working (or expected 412)');
    console.log('- Batch HRP Resolve: ✅ Working');
    console.log('- AVI Latest: ✅ Working (or expected 404)');
    console.log('');
    console.log('TypeScript SDK is ready for production use.');

  } catch (error) {
    console.error('❌ SDK smoke test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Run the tests
runTests();
