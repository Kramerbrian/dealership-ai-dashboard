/**
 * Simplified Google Policy Compliance Test
 * Tests the public API endpoints
 */

import { scanDishonestPricing, type AdData, type LandingPageData, type VDPData } from '../lib/compliance/google-pricing-policy';

console.log('🧪 Google Policy Compliance - Simple Test\n');
console.log('═══════════════════════════════════════════\n');

// Test Case 1: Compliant dealership
const compliantTest = async () => {
  console.log('Test 1: Compliant Dealership');
  console.log('─────────────────────────────\n');

  const ad: AdData = {
    headline: 'Lease 2024 Honda Accord from $299/mo',
    description: '36 months, $2,995 down, 3.9% APR. Qualified buyers only.',
    url: 'https://example.com/ads/1',
    monthlyPayment: 299,
    downPayment: 2995,
    apr: 3.9,
    term: 36,
    disclosures: ['Plus tax, title, license. Subject to credit approval.'],
    fees: [],
  };

  const lp: LandingPageData = {
    url: 'https://example.com/specials/lease',
    offerText: 'Lease the 2024 Honda Accord for $299/month. 36-month term with $2,995 down at 3.9% APR.',
    ctaText: 'Apply Now',
    monthlyPayment: 299,
    downPayment: 2995,
    apr: 3.9,
    term: 36,
    disclosures: ['Plus tax, title, license. Fees may apply. Subject to credit approval.'],
    fees: [],
  };

  const vdp: VDPData = {
    url: 'https://example.com/inventory/accord-2024',
    title: '2024 Honda Accord EX',
    offerText: '$299/mo lease offer: 36 months, $2,995 down payment, 3.9% APR.',
    monthlyPayment: 299,
    downPayment: 2995,
    apr: 3.9,
    term: 36,
    disclosures: ['Tax, title, license extra. Lease for qualified customers.'],
    fees: [],
  };

  try {
    const result = await scanDishonestPricing(ad, lp, vdp);

    console.log('✅ Result:', result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT');
    console.log('   Risk Score:', result.riskScore);
    console.log('   Violations:', result.violations.length);

    if (result.violations.length > 0) {
      result.violations.forEach((v, i) => {
        console.log(`   ${i + 1}. [${v.severity}] ${v.type}: ${v.message}`);
      });
    }

    console.log('   Breakdown:');
    console.log(`     • Offer Integrity: ${result.breakdown.offerIntegrity}/100`);
    console.log(`     • Price Parity: ${result.breakdown.priceParityScore}/100`);
    console.log(`     • Disclosures: ${result.breakdown.disclosureScore}/100`);
    console.log(`     • Hidden Fees: ${result.breakdown.hiddenFeeScore}/100`);
    console.log('');

    return result.compliant;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Test Case 2: Price mismatch
const priceMismatchTest = async () => {
  console.log('Test 2: Price Mismatch Violation');
  console.log('─────────────────────────────────\n');

  const ad: AdData = {
    headline: 'Lease 2024 Toyota Camry $249/mo',
    description: 'Amazing lease deal! Low monthly payments.',
    url: 'https://example.com/ads/2',
    monthlyPayment: 249,
    downPayment: 2000,
    apr: 4.9,
    term: 36,
    disclosures: [],
    fees: [],
  };

  const lp: LandingPageData = {
    url: 'https://example.com/specials/camry',
    offerText: 'Toyota Camry Lease Special - Only $299/month!',
    ctaText: 'Get Pre-Approved',
    monthlyPayment: 299, // MISMATCH: $50 higher than ad
    downPayment: 2000,
    apr: 4.9,
    term: 36,
    disclosures: [],
    fees: [],
  };

  const vdp: VDPData = {
    url: 'https://example.com/inventory/camry-2024',
    title: '2024 Toyota Camry LE',
    offerText: 'Lease from $299/mo',
    monthlyPayment: 299,
    downPayment: 2000,
    apr: 4.9,
    term: 36,
    disclosures: [],
    fees: [],
  };

  try {
    const result = await scanDishonestPricing(ad, lp, vdp);

    console.log('✅ Result:', result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT');
    console.log('   Risk Score:', result.riskScore);
    console.log('   Violations:', result.violations.length);

    if (result.violations.length > 0) {
      result.violations.forEach((v, i) => {
        console.log(`   ${i + 1}. [${v.severity}] ${v.type}: ${v.message}`);
      });
    }

    console.log('');
    return !result.compliant; // Should be non-compliant
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Test Case 3: Missing disclosures
const missingDisclosuresTest = async () => {
  console.log('Test 3: Missing Disclosures');
  console.log('───────────────────────────\n');

  const ad: AdData = {
    headline: 'Ford F-150 - Low Payments!',
    description: '$399/mo with $3,000 down',
    url: 'https://example.com/ads/3',
    monthlyPayment: 399,
    downPayment: 3000,
    apr: undefined, // Missing
    term: undefined, // Missing
    disclosures: [], // No disclosures
    fees: [],
  };

  const lp: LandingPageData = {
    url: 'https://example.com/specials/f150',
    offerText: 'Get into a new Ford F-150 for just $399 per month with $3,000 down!',
    ctaText: 'Apply Today',
    monthlyPayment: 399,
    downPayment: 3000,
    apr: undefined,
    term: undefined,
    disclosures: [],
    fees: [],
  };

  const vdp: VDPData = {
    url: 'https://example.com/inventory/f150-2024',
    title: '2024 Ford F-150 XLT',
    offerText: '$399/mo lease special',
    monthlyPayment: 399,
    downPayment: 3000,
    apr: undefined,
    term: undefined,
    disclosures: [],
    fees: [],
  };

  try {
    const result = await scanDishonestPricing(ad, lp, vdp);

    console.log('✅ Result:', result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT');
    console.log('   Risk Score:', result.riskScore);
    console.log('   Violations:', result.violations.length);

    if (result.violations.length > 0) {
      result.violations.forEach((v, i) => {
        console.log(`   ${i + 1}. [${v.severity}] ${v.type}: ${v.message}`);
      });
    }

    console.log('');
    return !result.compliant; // Should be non-compliant
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run all tests
(async () => {
  const results = {
    test1: await compliantTest(),
    test2: await priceMismatchTest(),
    test3: await missingDisclosuresTest(),
  };

  console.log('═══════════════════════════════════════════\n');
  console.log('📊 Test Summary:\n');
  console.log(`Test 1 (Compliant):          ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Price Mismatch):     ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Missing Disclosures): ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  const totalPassed = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;

  console.log(`Total: ${totalPassed}/${totalTests} passed\n`);

  if (totalPassed === totalTests) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed\n');
    process.exit(1);
  }
})();
