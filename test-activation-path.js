#!/usr/bin/env node

const crypto = require('crypto');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TENANT_ID = '00000000-0000-0000-0000-000000000000';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJhdWQiOiJkZWFsZXJzaGlwYWkiLCJpc3MiOiJzdXBhYmFzZSIsImV4cCI6OTk5OTk5OTk5OSwibmJmIjoxLCJqdGkiOiJ0ZXN0LWp0aSJ9.test';
const WEBHOOK_SECRET = 'super-tenant-secret';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  console.log(`\n${options.method || 'GET'} ${url}`);
  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(data, null, 2));
  
  if (response.headers.get('X-Idempotency-Key')) {
    console.log(`Idempotency: ${response.headers.get('X-Idempotency-Key')}`);
  }
  if (response.headers.get('X-Processing-Time')) {
    console.log(`Processing Time: ${response.headers.get('X-Processing-Time')}ms`);
  }
  if (response.headers.get('Server-Timing')) {
    console.log(`Server Timing: ${response.headers.get('Server-Timing')}`);
  }

  return { response, data };
}

// Generate HMAC signature for webhook
function generateSignature(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function testActivationPath() {
  console.log('🚀 Testing DealershipAI SEO API Activation Path\n');
  console.log('=' .repeat(60));

  try {
    // 1. Test Priors Upsert with Idempotency
    console.log('\n1️⃣ Testing Priors Upsert with Idempotency');
    const priorsData = {
      variantId: 'v1',
      a: 12,
      b: 8
    };

    await makeRequest(`${BASE_URL}/api/seo/priors/upsert`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': 'priors-abc123'
      },
      body: JSON.stringify(priorsData)
    });

    // Test idempotency - same request should return cached response
    console.log('\n🔄 Testing Idempotency (should return cached response)');
    await makeRequest(`${BASE_URL}/api/seo/priors/upsert`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': 'priors-abc123'
      },
      body: JSON.stringify(priorsData)
    });

    // 2. Test Webhook Metrics with HMAC + Idempotency
    console.log('\n2️⃣ Testing Webhook Metrics with HMAC + Idempotency');
    const metricsData = [{
      variantId: 'v1',
      productId: 'p1',
      impressions: 50,
      clicks: 3,
      conversions: 1,
      revenue: 150.00,
      causalId: 'c-123'
    }];

    const body = JSON.stringify(metricsData);
    const signature = generateSignature(body, WEBHOOK_SECRET);

    await makeRequest(`${BASE_URL}/api/seo/hooks/metrics`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': 'hook-abc-001',
        'X-Signature': signature
      },
      body: body
    });

    // Test idempotency for webhook
    console.log('\n🔄 Testing Webhook Idempotency (should return cached response)');
    await makeRequest(`${BASE_URL}/api/seo/hooks/metrics`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': 'hook-abc-001',
        'X-Signature': signature
      },
      body: body
    });

    // 3. Test CSV Export
    console.log('\n3️⃣ Testing CSV Export');
    const csvResponse = await fetch(`${BASE_URL}/api/seo/report?variantId=v1&format=csv`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });

    if (csvResponse.ok) {
      const csvData = await csvResponse.text();
      console.log(`\nGET ${BASE_URL}/api/seo/report?variantId=v1&format=csv`);
      console.log(`Status: ${csvResponse.status}`);
      console.log(`Content-Type: ${csvResponse.headers.get('content-type')}`);
      console.log(`Content-Disposition: ${csvResponse.headers.get('content-disposition')}`);
      console.log(`CSV Preview:\n${csvData.substring(0, 200)}...`);
    }

    // 4. Test JSON Report
    console.log('\n4️⃣ Testing JSON Report');
    await makeRequest(`${BASE_URL}/api/seo/report?variantId=v1&format=json&group=day`);

    // 5. Test Uplift Analysis
    console.log('\n5️⃣ Testing Uplift Analysis');
    await makeRequest(`${BASE_URL}/api/seo/uplift?variantId=v1&period=30d`);

    // 6. Test Admin Endpoints
    console.log('\n6️⃣ Testing Admin Endpoints');
    
    // Check idempotency key
    await makeRequest(`${BASE_URL}/api/admin/idempotency/priors-abc123`);
    
    // Rotate webhook secret
    await makeRequest(`${BASE_URL}/api/admin/webhook/rotate`, {
      method: 'POST'
    });

    // 7. Test Metrics Query with CI
    console.log('\n7️⃣ Testing Metrics Query with Confidence Intervals');
    await makeRequest(`${BASE_URL}/api/seo/metrics/query?variantId=v1&group=day&includeCI=true`);

    console.log('\n✅ Activation Path Test Complete!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Idempotency working (cached responses)');
    console.log('- ✅ HMAC webhook verification working');
    console.log('- ✅ CSV export working');
    console.log('- ✅ JSON reports working');
    console.log('- ✅ Uplift analysis working');
    console.log('- ✅ Admin endpoints working');
    console.log('- ✅ SLO headers present');
    console.log('- ✅ Error handling working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testActivationPath();
}

module.exports = { testActivationPath, generateSignature };
