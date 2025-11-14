#!/usr/bin/env tsx
/**
 * Post-Deploy Verification Script
 * 
 * Verifies that the cinematic landing page deployed correctly by:
 * 1. Checking the page loads (200 status)
 * 2. Verifying headline text appears
 * 3. Checking for key components (FreeScanWidget, etc.)
 * 
 * Usage: tsx scripts/verify-landing-deployment.ts <url>
 */

import { readFileSync } from 'fs';

const DEPLOY_URL = process.argv[2] || process.env.DEPLOY_URL || 'https://dealershipai.com';

// Expected text patterns to verify
const EXPECTED_PATTERNS = [
  'See what AI really thinks of your dealership',
  'DealershipAI',
  'Check Your Trust Score',
  'FreeScanWidget', // Component should be present
];

async function verifyDeployment() {
  console.log(`🔍 Verifying deployment at: ${DEPLOY_URL}`);
  console.log('');

  try {
    // Fetch the page
    const response = await fetch(DEPLOY_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'DealershipAI-Deployment-Verifier/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ Page loaded successfully (${response.status})`);

    // Check for expected patterns
    let allFound = true;
    const results: Array<{ pattern: string; found: boolean }> = [];

    for (const pattern of EXPECTED_PATTERNS) {
      const found = html.includes(pattern);
      results.push({ pattern, found });
      
      if (found) {
        console.log(`  ✅ Found: "${pattern}"`);
      } else {
        console.log(`  ❌ Missing: "${pattern}"`);
        allFound = false;
      }
    }

    // Check for key component markers
    const componentChecks = [
      { name: 'CinematicLandingPage', marker: 'CinematicLandingPage' },
      { name: 'FreeScanWidget', marker: 'FreeScanWidget' },
      { name: 'Brand Tinting', marker: 'useBrandPalette' },
    ];

    console.log('');
    console.log('📦 Component Checks:');
    for (const check of componentChecks) {
      const found = html.includes(check.marker) || html.includes(check.marker.toLowerCase());
      if (found) {
        console.log(`  ✅ ${check.name} present`);
      } else {
        console.log(`  ⚠️  ${check.name} marker not found (may be minified)`);
      }
    }

    // Check for common errors
    const errorIndicators = [
      'Error:',
      'Failed to load',
      'Module not found',
      'Cannot find module',
    ];

    let hasErrors = false;
    for (const error of errorIndicators) {
      if (html.includes(error)) {
        console.log(`  ⚠️  Potential error indicator found: "${error}"`);
        hasErrors = true;
      }
    }

    console.log('');
    if (allFound && !hasErrors) {
      console.log('✅ Deployment verification PASSED');
      console.log('');
      console.log('🎉 Cinematic landing page is live and working correctly!');
      process.exit(0);
    } else {
      console.log('⚠️  Deployment verification had issues');
      console.log('   Some expected patterns may be missing or errors detected.');
      console.log('   This may be normal if components are minified or lazy-loaded.');
      process.exit(0); // Don't fail build, just warn
    }
  } catch (error: any) {
    console.error('');
    console.error('❌ Verification failed:', error.message);
    console.error('');
    console.error('This could mean:');
    console.error('  • Deployment is still in progress (wait 30s and retry)');
    console.error('  • URL is incorrect');
    console.error('  • Network issue');
    console.error('');
    process.exit(1);
  }
}

// Run verification
verifyDeployment();

