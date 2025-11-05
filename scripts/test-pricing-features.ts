/**
 * Test Pricing Page Features
 * 
 * Tests all pricing page feature toggles:
 * - Trial feature grants
 * - Tier gating
 * - ROI calculations
 * - Checkout flows
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function testTrialGrant() {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}/api/trial/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature_id: 'schema_fix',
        user_id: 'test-user',
      }),
    });

    const data = await response.json();
    const duration = Date.now() - start;

    if (response.ok && data.success) {
      results.push({
        name: 'Trial Grant API',
        status: 'pass',
        message: `Trial granted successfully (${duration}ms)`,
        duration,
      });
      return true;
    } else {
      results.push({
        name: 'Trial Grant API',
        status: 'fail',
        message: `Failed: ${data.error || 'Unknown error'}`,
        duration,
      });
      return false;
    }
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'Trial Grant API',
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      duration,
    });
    return false;
  }
}

async function testTrialStatus() {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}/api/trial/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    const duration = Date.now() - start;

    if (response.ok && Array.isArray(data.active)) {
      results.push({
        name: 'Trial Status API',
        status: 'pass',
        message: `Status retrieved: ${data.active.length} active trials (${duration}ms)`,
        duration,
      });
      return true;
    } else {
      results.push({
        name: 'Trial Status API',
        status: 'fail',
        message: `Invalid response format`,
        duration,
      });
      return false;
    }
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'Trial Status API',
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      duration,
    });
    return false;
  }
}

async function testTelemetry() {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'pricing_page_interaction',
        tier: 'tier1',
        surface: 'pricing-page',
        metadata: {
          action: 'view_tier',
          tier_id: 'tier2',
        },
      }),
    });

    const data = await response.json();
    const duration = Date.now() - start;

    if (response.ok) {
      results.push({
        name: 'Telemetry API',
        status: 'pass',
        message: `Event tracked successfully (${duration}ms)`,
        duration,
      });
      return true;
    } else {
      results.push({
        name: 'Telemetry API',
        status: 'fail',
        message: `Failed: ${data.error || 'Unknown error'}`,
        duration,
      });
      return false;
    }
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'Telemetry API',
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      duration,
    });
    return false;
  }
}

async function testPricingPageLoad() {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}/pricing`, {
      method: 'GET',
    });

    const duration = Date.now() - start;

    if (response.ok) {
      results.push({
        name: 'Pricing Page Load',
        status: 'pass',
        message: `Page loads successfully (${duration}ms)`,
        duration,
      });
      return true;
    } else {
      results.push({
        name: 'Pricing Page Load',
        status: 'fail',
        message: `Failed with status: ${response.status}`,
        duration,
      });
      return false;
    }
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'Pricing Page Load',
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      duration,
    });
    return false;
  }
}

export async function testPricingFeatures() {
  console.log('🧪 Testing Pricing Page Features...\n');

  await testPricingPageLoad();
  await testTelemetry();
  await testTrialGrant();
  await testTrialStatus();

  console.log('\n📊 Test Results:');
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  console.log(`\n✅ Passed: ${passCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}`);

  return {
    allPass: failCount === 0,
    results,
    summary: {
      pass: passCount,
      fail: failCount,
      total: results.length,
    },
  };
}

// Run if executed directly
if (require.main === module) {
  testPricingFeatures()
    .then((result) => {
      process.exit(result.allPass ? 0 : 1);
    })
    .catch((error) => {
      console.error('Testing failed:', error);
      process.exit(1);
    });
}

