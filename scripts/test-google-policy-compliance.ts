/**
 * Google Policy Compliance System Test Suite
 *
 * Run: npx ts-node scripts/test-google-policy-compliance.ts
 */

import {
  scanDishonestPricing,
  calculateJaccard,
  checkPolicyUpdates,
  type AdData,
  type LandingPageData,
  type VDPData,
} from '../lib/compliance/google-pricing-policy';

import {
  applyPolicyPenalties,
  calculatePolicyImpact,
  type ATIPillars,
} from '../lib/compliance/ati-policy-integration';

import { detectPolicyDrift } from '../lib/compliance/policy-drift-monitor';

// ============================================================================
// TEST DATA
// ============================================================================

const testCases = [
  {
    name: 'Case 1: Compliant Ad',
    ad: {
      headline: 'Lease 2024 Honda Accord from $299/mo',
      description: '36 months, $2,995 down, 3.9% APR. Qualified buyers only.',
      url: 'https://example.com/ads/1',
      monthlyPayment: 299,
      downPayment: 2995,
      apr: 3.9,
      term: 36,
      disclosures: ['Plus tax, title, license. Subject to credit approval.'],
      fees: [],
    } as AdData,
    lp: {
      url: 'https://example.com/specials/lease',
      offerText: 'Lease the 2024 Honda Accord for $299/month. 36-month term with $2,995 down at 3.9% APR.',
      ctaText: 'Apply Now',
      monthlyPayment: 299,
      downPayment: 2995,
      apr: 3.9,
      term: 36,
      disclosures: ['Plus tax, title, license. Fees may apply. Subject to credit approval.'],
      fees: [{ name: 'Doc Fee', amount: 299 }],
    } as LandingPageData,
    vdp: {
      url: 'https://example.com/inventory/vin/ABC123',
      vin: '1HGCM82633A123456',
      year: 2024,
      make: 'Honda',
      model: 'Accord',
      price: 28500,
      monthlyPayment: 299,
      disclosures: ['MSRP $31,000. Dealer discount $2,500.'],
      fees: [{ name: 'Doc Fee', amount: 299 }],
    } as VDPData,
  },

  {
    name: 'Case 2: Price Mismatch (Critical)',
    ad: {
      headline: 'Save Big on 2024 Models',
      description: 'Lease from $299/mo with $0 down',
      url: 'https://example.com/ads/2',
      monthlyPayment: 299,
      downPayment: 0,
      disclosures: [],
      fees: [],
    } as AdData,
    lp: {
      url: 'https://example.com/specials/summer',
      offerText: 'Summer lease special: $299/month, no money down required.',
      ctaText: 'Get Started',
      monthlyPayment: 299,
      downPayment: 0,
      disclosures: ['Qualified buyers only.'],
      fees: [],
    } as LandingPageData,
    vdp: {
      url: 'https://example.com/inventory/vin/DEF456',
      vin: '2HGCM82633A654321',
      year: 2024,
      make: 'Toyota',
      model: 'Camry',
      price: 27500,
      monthlyPayment: 349, // MISMATCH!
      disclosures: [],
      fees: [
        { name: 'Dealer Prep', amount: 500 },
        { name: 'Doc Fee', amount: 299 },
      ],
    } as VDPData,
  },

  {
    name: 'Case 3: Missing Disclosures (Critical)',
    ad: {
      headline: 'Drive Away for $0 Down',
      description: 'As low as $199/mo on select models',
      url: 'https://example.com/ads/3',
      monthlyPayment: 199,
      downPayment: 0,
      disclosures: [], // MISSING!
      fees: [],
    } as AdData,
    lp: {
      url: 'https://example.com/zero-down',
      offerText: '$0 down lease deals. Drive home today!',
      ctaText: 'Apply Now',
      monthlyPayment: 199,
      downPayment: 0,
      disclosures: [], // MISSING!
      fees: [],
    } as LandingPageData,
    vdp: {
      url: 'https://example.com/inventory/vin/GHI789',
      vin: '3HGCM82633A987654',
      year: 2024,
      make: 'Nissan',
      model: 'Altima',
      price: 25000,
      monthlyPayment: 199,
      disclosures: [],
      fees: [],
    } as VDPData,
  },
];

// Base ATI pillars for testing
const baseATIPillars: ATIPillars = {
  precision: 92,
  consistency: 88,
  recency: 75,
  authenticity: 85,
  alignment: 90,
};

// ============================================================================
// RUN TESTS
// ============================================================================

async function runTests() {
  console.log('='.repeat(80));
  console.log('GOOGLE POLICY COMPLIANCE TEST SUITE');
  console.log('='.repeat(80));
  console.log('');

  for (const testCase of testCases) {
    console.log('─'.repeat(80));
    console.log(`TEST: ${testCase.name}`);
    console.log('─'.repeat(80));

    // Run policy scan
    const policyResult = await scanDishonestPricing(
      testCase.ad,
      testCase.lp,
      testCase.vdp
    );

    // Calculate ATI impact
    const atiImpact = calculatePolicyImpact(baseATIPillars, policyResult);

    // Print results
    console.log('\n✅ COMPLIANCE:', policyResult.compliant ? 'PASS' : 'FAIL');
    console.log('📊 Risk Score:', policyResult.riskScore.toFixed(1), '/100');
    console.log('');

    console.log('📋 BREAKDOWN:');
    console.log(`  • Jaccard Similarity: ${(policyResult.breakdown.jaccard * 100).toFixed(1)}%`);
    console.log(`  • Price Mismatch: ${policyResult.breakdown.priceMismatch ? 'YES' : 'NO'}`);
    console.log(`  • Hidden Fees: ${policyResult.breakdown.hiddenFees ? 'YES' : 'NO'}`);
    console.log(`  • Disclosure Clarity: ${policyResult.breakdown.disclosureClarity.toFixed(1)}/100`);
    console.log('');

    console.log('⚠️  VIOLATIONS:');
    if (policyResult.violations.length === 0) {
      console.log('  None');
    } else {
      policyResult.violations.forEach(v => {
        const icon = v.type === 'critical' ? '❌' : v.type === 'warning' ? '⚠️ ' : 'ℹ️ ';
        console.log(`  ${icon} [${v.type.toUpperCase()}] ${v.rule}`);
        console.log(`     ${v.description}`);
      });
    }
    console.log('');

    console.log('📉 ATI IMPACT:');
    console.log(`  • Original ATI: ${atiImpact.originalATI.toFixed(1)}`);
    console.log(`  • Adjusted ATI: ${atiImpact.adjustedATI.toFixed(1)}`);
    console.log(`  • Total Penalty: -${atiImpact.totalPenalty.toFixed(1)} points`);
    console.log(`    - Consistency: -${atiImpact.breakdown.consistencyLost.toFixed(1)}`);
    console.log(`    - Precision: -${atiImpact.breakdown.precisionLost.toFixed(1)}`);
    console.log('');

    console.log('💡 RECOMMENDATIONS:');
    atiImpact.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');
  }

  // ============================================================================
  // TEST POLICY DRIFT MONITORING
  // ============================================================================

  console.log('─'.repeat(80));
  console.log('TEST: Policy Drift Detection');
  console.log('─'.repeat(80));
  console.log('');

  const driftResult = await detectPolicyDrift();
  console.log('🔍 Drift Detected:', driftResult.driftDetected ? 'YES' : 'NO');
  console.log('📦 Current Version:', driftResult.currentVersion);
  console.log('📦 Latest Version:', driftResult.latestVersion);

  if (driftResult.driftDetected) {
    console.log('');
    console.log('📝 Changes:');
    driftResult.changes.forEach((change, i) => {
      console.log(`  ${i + 1}. ${change}`);
    });
    console.log('');
    console.log('⚠️  Action Required:', driftResult.actionRequired ? 'YES' : 'NO');
    console.log('');
    console.log('💡 Recommendations:');
    driftResult.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('TESTS COMPLETED');
  console.log('='.repeat(80));
}

// ============================================================================
// MAIN
// ============================================================================

runTests()
  .then(() => {
    console.log('\n✅ All tests completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  });
