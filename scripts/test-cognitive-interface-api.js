#!/usr/bin/env node

/**
 * DealershipAI Cognitive Interface 3.0 - API Test Orchestrator
 * Automated testing using Node.js and fetch API
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_RESULTS = [];

// Test utilities
const test = async (name, fn) => {
  try {
    console.log(`🧪 Testing: ${name}`);
    const result = await fn();
    if (result.pass) {
      console.log(`✅ PASS: ${name}`);
      TEST_RESULTS.push({ test: name, status: 'PASS' });
      return true;
    } else {
      console.log(`❌ FAIL: ${name} - ${result.error}`);
      TEST_RESULTS.push({ test: name, status: 'FAIL', error: result.error });
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    TEST_RESULTS.push({ test: name, status: 'FAIL', error: error.message });
    return false;
  }
};

// Check server status
const checkServer = async () => {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    return { pass: response.ok, error: null };
  } catch (error) {
    return { pass: false, error: error.message };
  }
};

// Test landing page
const testLandingPage = async () => {
  try {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    const hasClerkButtons = html.includes('SignInButton') || html.includes('Sign Up') || html.includes('Sign In');
    const hasFreeAuditWidget = html.includes('FreeAuditWidget') || html.includes('free-audit');
    
    if (response.ok && (hasClerkButtons || hasFreeAuditWidget)) {
      return { pass: true, error: null };
    }
    return { pass: false, error: 'Missing expected elements' };
  } catch (error) {
    return { pass: false, error: error.message };
  }
};

// Test API endpoints
const testAPIEndpoints = async () => {
  const endpoints = [
    { path: '/api/health', method: 'GET', expectedStatus: [200, 404] },
    { path: '/api/save-metrics', method: 'POST', expectedStatus: [400, 401], body: { pvr: 'invalid' } },
  ];

  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${BASE_URL}${endpoint.path}`, options);
      const status = response.status;
      
      if (endpoint.expectedStatus.includes(status)) {
        return { pass: true, error: null };
      }
      return { pass: false, error: `Expected status ${endpoint.expectedStatus}, got ${status}` };
    } catch (error) {
      return { pass: false, error: error.message };
    }
  }
  
  return { pass: true, error: null };
};

// Test routes
const testRoutes = async () => {
  const routes = [
    { path: '/onboarding', name: 'Onboarding' },
    { path: '/dashboard/preview', name: 'Preview' },
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${BASE_URL}${route.path}`, { method: 'HEAD', redirect: 'manual' });
      const status = response.status;
      
      // Accept 200, 307 (temporary redirect), 302 (redirect), or 401 (auth required)
      if ([200, 307, 302, 401].includes(status)) {
        continue;
      }
      return { pass: false, error: `${route.name} returned unexpected status ${status}` };
    } catch (error) {
      return { pass: false, error: error.message };
    }
  }
  
  return { pass: true, error: null };
};

// Test error handling
const testErrorHandling = async () => {
  try {
    // Test invalid PVR values
    const response = await fetch(`${BASE_URL}/api/save-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pvr: -1000, adExpensePvr: 'invalid' }),
    });

    // Should return 400 or 401 (validation error or auth required)
    if ([400, 401].includes(response.status)) {
      return { pass: true, error: null };
    }
    return { pass: false, error: `Expected 400/401, got ${response.status}` };
  } catch (error) {
    return { pass: false, error: error.message };
  }
};

// Main test runner
const main = async () => {
  console.log('🚀 DealershipAI Cognitive Interface 3.0 - API Test Orchestrator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Base URL: ${BASE_URL}\n`);

  await test('Server Status', checkServer);
  await test('Landing Page', testLandingPage);
  await test('API Endpoints', testAPIEndpoints);
  await test('Routes', testRoutes);
  await test('Error Handling', testErrorHandling);

  // Generate report
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const passed = TEST_RESULTS.filter(r => r.status === 'PASS').length;
  const failed = TEST_RESULTS.filter(r => r.status === 'FAIL').length;
  
  console.log(`Total Tests: ${TEST_RESULTS.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
};

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

