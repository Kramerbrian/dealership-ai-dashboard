#!/usr/bin/env node

/**
 * Live DTRI Engine Test
 * Tests the deployed DTRI engine functionality
 */

const BASE_URL = 'https://dealershipai-dashboard-q1ic0ww9m-brian-kramers-projects.vercel.app';

async function testDTRIEngine() {
  console.log('🧪 Testing DTRI Engine on Live Deployment...\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`,
      method: 'GET'
    },
    {
      name: 'DTRI Analysis',
      url: `${BASE_URL}/api/dtri/analyze`,
      method: 'POST',
      body: {
        dealershipUrl: 'https://example-dealership.com',
        monthlyUnits: 150,
        avgGrossProfit: 2500,
        blendedCAC: 800
      }
    },
    {
      name: 'Core Analysis',
      url: `${BASE_URL}/api/analyze`,
      method: 'POST',
      body: {
        url: 'https://example-dealership.com'
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DealershipAI-Test/1.0'
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      const status = response.status;
      
      if (status === 200) {
        const data = await response.json();
        console.log(`   ✅ Status: ${status}`);
        console.log(`   📊 Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      } else if (status === 401 || status === 403) {
        console.log(`   🔒 Status: ${status} (Authentication Required)`);
        console.log(`   ℹ️  This is expected - you need to authenticate via Vercel`);
      } else {
        console.log(`   ⚠️  Status: ${status}`);
        const text = await response.text();
        console.log(`   📝 Response: ${text.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Manual Testing Instructions:');
  console.log('1. Visit the dashboard URL and authenticate with Vercel');
  console.log('2. Navigate to /dashboard to see DTRI metrics');
  console.log('3. Check browser console for any errors');
  console.log('4. Test the API endpoints from the browser dev tools');
}

// Run the test
testDTRIEngine().catch(console.error);
