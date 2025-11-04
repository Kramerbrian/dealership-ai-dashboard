/**
 * Test Dashboard Endpoints
 * Actually tests API endpoints to verify they're working
 */

interface EndpointTest {
  endpoint: string;
  method: 'GET' | 'POST';
  status: number;
  responseTime: number;
  error?: string;
  dataReceived: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<EndpointTest> {
  const startTime = Date.now();
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    
    let dataReceived = false;
    try {
      const data = await response.json();
      dataReceived = data && Object.keys(data).length > 0;
    } catch {
      // No JSON response
    }
    
    return {
      endpoint,
      method,
      status: response.status,
      responseTime,
      dataReceived,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      endpoint,
      method,
      status: 0,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      dataReceived: false
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log('🧪 Testing Dashboard Endpoints...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const tests: EndpointTest[] = [];
  
  // Test public endpoints (no auth required)
  const publicEndpoints = [
    '/api/health',
    '/api/dashboard/overview?dealerId=test&timeRange=30d',
    '/api/visibility/seo?domain=dealershipai.com&timeRange=30d',
    '/api/visibility/aeo?domain=dealershipai.com&timeRange=30d',
    '/api/visibility/geo?domain=dealershipai.com&timeRange=30d',
    '/api/dashboard/ai-health?timeRange=30d',
    '/api/dashboard/website?timeRange=30d',
    '/api/dashboard/reviews?timeRange=30d'
  ];
  
  for (const endpoint of publicEndpoints) {
    const result = await testEndpoint(endpoint, 'GET');
    tests.push(result);
    
    const status = result.status === 200 ? '✅' : result.status === 0 ? '❌' : '⚠️';
    console.log(`${status} ${endpoint.padEnd(60)} ${result.status} ${result.responseTime}ms`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  // Summary
  console.log('\n## Test Summary\n');
  const passed = tests.filter(t => t.status === 200).length;
  const failed = tests.filter(t => t.status === 0).length;
  const warnings = tests.filter(t => t.status > 0 && t.status !== 200).length;
  
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log(`⚠️  Warnings: ${warnings}/${tests.length}`);
  
  const avgResponseTime = tests.reduce((sum, t) => sum + t.responseTime, 0) / tests.length;
  console.log(`\nAverage Response Time: ${Math.round(avgResponseTime)}ms`);
  
  // Performance analysis
  const slowEndpoints = tests.filter(t => t.responseTime > 1000);
  if (slowEndpoints.length > 0) {
    console.log('\n⚠️  Slow Endpoints (>1000ms):');
    for (const test of slowEndpoints) {
      console.log(`   ${test.endpoint}: ${test.responseTime}ms`);
    }
  }
  
  // Write results to file
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: tests.length,
      passed,
      failed,
      warnings,
      avgResponseTime: Math.round(avgResponseTime)
    },
    tests
  };
  
  fs.writeFileSync(
    'DASHBOARD_ENDPOINT_TEST_RESULTS.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Full results saved to: DASHBOARD_ENDPOINT_TEST_RESULTS.json');
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testEndpoint, runAllTests };

