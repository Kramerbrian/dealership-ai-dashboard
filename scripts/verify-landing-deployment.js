#!/usr/bin/env node

/**
 * Post-Deploy Verification Script
 * Verifies that the cinematic hero landing page is correctly deployed
 */

const https = require('https');

const REQUIRED_TEXTS = [
  "While You're Reading This",
  "Just Recommended Your Competitor",
  "Make the Machines Say My Name"
];

const REQUIRED_STATUS = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    }).on('error', reject);
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyDeployment(url, retryCount = 0) {
  console.log(`\n🔍 Verifying deployment at: ${url}`);
  console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES}`);

  try {
    const { status, body } = await fetchPage(url);

    // Check HTTP status
    if (status !== REQUIRED_STATUS) {
      throw new Error(`Expected status ${REQUIRED_STATUS}, got ${status}`);
    }
    console.log(`✅ HTTP status: ${status}`);

    // Check for required text content
    const missingTexts = [];
    for (const text of REQUIRED_TEXTS) {
      if (!body.includes(text)) {
        missingTexts.push(text);
      } else {
        console.log(`✅ Found: "${text}"`);
      }
    }

    if (missingTexts.length > 0) {
      throw new Error(`Missing required text: ${missingTexts.join(', ')}`);
    }

    // Check for hero component presence
    if (!body.includes('HeroSection_CupertinoNolan') &&
        !body.includes('ChatGPT') &&
        !body.includes('Perplexity')) {
      throw new Error('Hero component markers not found in HTML');
    }
    console.log(`✅ Hero component markers detected`);

    // All checks passed
    console.log('\n✅ Deployment verification PASSED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Cinematic hero is live and verified!');
    console.log(`📍 URL: ${url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return true;

  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in ${RETRY_DELAY/1000} seconds...`);
      await sleep(RETRY_DELAY);
      return verifyDeployment(url, retryCount + 1);
    } else {
      console.error('\n❌ Deployment verification FAILED after all retries');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('⚠️  Deployment may not be fully propagated');
      console.error(`📍 URL: ${url}`);
      console.error(`🔍 Error: ${error.message}`);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(1);
    }
  }
}

// Main execution
const targetUrl = process.argv[2] || 'https://dealershipai.com';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 DealershipAI Landing Page Verification');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

verifyDeployment(targetUrl).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
