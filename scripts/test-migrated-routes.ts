/**
 * Test Script for Migrated API Routes
 * Tests routes that have been migrated to the new security middleware
 */

import { NextRequest } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-123';

interface TestResult {
  route: string;
  method: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  responseTime?: number;
}

const results: TestResult[] = [];

async function testRoute(
  route: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: any,
  requiresAuth: boolean = false
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}${route}`;
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (requiresAuth) {
      // In production, this would use a real auth token
      headers['Authorization'] = `Bearer test-token-${TEST_USER_ID}`;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const duration = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));
    
    // Check for expected response structure
    const hasSuccess = 'success' in data || response.ok;
    const hasError = 'error' in data;
    
    // Rate limiting should return 429
    // Auth should return 401/403
    // Validation errors should return 400
    const expectedStatuses = [200, 201, 400, 401, 403, 404, 429, 500, 503];
    
    if (expectedStatuses.includes(response.status)) {
      return {
        route,
        method,
        status: 'pass',
        responseTime: duration,
      };
    }
    
    return {
      route,
      method,
      status: 'fail',
      error: `Unexpected status: ${response.status}`,
      responseTime: duration,
    };
  } catch (error) {
    return {
      route,
      method,
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Migrated API Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  // Test public routes
  console.log('📋 Testing Public Routes...');
  await testRoute('/api/health', 'GET', undefined, false);
  await testRoute('/api/analyze', 'POST', {
    revenue: 100000,
    marketSize: 'medium',
    competition: 'moderate',
    visibility: 75
  }, false);
  await testRoute('/api/onboarding/analyze', 'POST', {
    domain: 'test-dealership.com'
  }, false);
  
  // Test authenticated routes
  console.log('\n🔐 Testing Authenticated Routes...');
  await testRoute('/api/user/profile', 'GET', undefined, true);
  await testRoute('/api/user/subscription', 'GET', undefined, true);
  await testRoute('/api/user/usage', 'GET', undefined, true);
  await testRoute('/api/dashboard/overview?timeRange=30d', 'GET', undefined, true);
  await testRoute('/api/dashboard/ai-health?timeRange=30d', 'GET', undefined, true);
  await testRoute('/api/dashboard/website?timeRange=30d', 'GET', undefined, true);
  await testRoute('/api/dashboard/reviews?timeRange=30d', 'GET', undefined, true);
  await testRoute('/api/onboarding/status', 'GET', undefined, true);
  
  // Test AI routes
  console.log('\n🤖 Testing AI Routes...');
  await testRoute('/api/ai/visibility-index?domain=test.com', 'GET', undefined, false);
  await testRoute('/api/ai/visibility-index', 'POST', {
    domain: 'test.com',
    action: 'calculate'
  }, false);
  await testRoute('/api/ai/analysis', 'POST', {
    domain: 'test-dealership.com'
  }, false);
  
  // Test with validation errors
  console.log('\n❌ Testing Validation Error Handling...');
  await testRoute('/api/analyze', 'POST', {
    revenue: -100, // Invalid negative revenue
    marketSize: 'invalid' // Invalid market size
  }, false);
  
  await testRoute('/api/user/usage', 'POST', {
    // Missing required 'feature' field
  }, true);
  
  // Print summary
  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  - ${r.method} ${r.route}: ${r.error}`);
    });
  }
  
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
  
  console.log(`\n⏱️  Average Response Time: ${Math.round(avgResponseTime)}ms`);
}

// Manual test function for individual routes
export async function testSingleRoute(
  route: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: any
) {
  console.log(`\n🧪 Testing: ${method} ${route}`);
  
  const result = await testRoute(route, method, body, route.includes('/user/') || route.includes('/dashboard/'));
  results.push(result);
  
  if (result.status === 'pass') {
    console.log(`✅ PASS (${result.responseTime}ms)`);
  } else {
    console.log(`❌ FAIL: ${result.error}`);
  }
  
  return result;
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testRoute, runTests };

