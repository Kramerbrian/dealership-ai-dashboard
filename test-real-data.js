#!/usr/bin/env node

/**
 * Test script for real data integration
 * Run with: node test-real-data.js
 */

const https = require('https');

const PRODUCTION_URL = 'https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app';
const TEST_DOMAIN = 'dealershipai.com'; // Change this to your domain

async function testAPI(endpoint, description) {
  return new Promise((resolve, reject) => {
    const url = `${PRODUCTION_URL}${endpoint}?domain=${TEST_DOMAIN}&timeRange=30d`;
    
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`📡 URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success) {
            console.log(`✅ ${description} - SUCCESS`);
            console.log(`📊 Data source: ${response.meta?.source || 'unknown'}`);
            console.log(`⏱️  Response time: ${response.meta?.responseTime || 'unknown'}`);
            
            if (response.data?.overallScore) {
              console.log(`🎯 Overall Score: ${response.data.overallScore}%`);
            }
            
            resolve(response);
          } else {
            console.log(`❌ ${description} - FAILED`);
            console.log(`🚨 Error: ${response.error || 'Unknown error'}`);
            reject(new Error(response.error));
          }
        } catch (error) {
          console.log(`❌ ${description} - PARSE ERROR`);
          console.log(`🚨 Error: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log(`❌ ${description} - NETWORK ERROR`);
      console.log(`🚨 Error: ${error.message}`);
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🚀 DealershipAI Real Data Integration Test');
  console.log('==========================================');
  console.log(`🌐 Testing domain: ${TEST_DOMAIN}`);
  console.log(`🔗 Production URL: ${PRODUCTION_URL}`);
  
  const tests = [
    {
      endpoint: '/api/visibility/seo',
      description: 'SEO Analysis API'
    },
    {
      endpoint: '/api/visibility/aeo', 
      description: 'AEO Analysis API'
    },
    {
      endpoint: '/api/visibility/geo',
      description: 'GEO Analysis API'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await testAPI(test.endpoint, test.description);
      results.push({ ...test, success: true, result });
    } catch (error) {
      results.push({ ...test, success: false, error: error.message });
    }
    
    // Wait 1 second between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n🎉 Real data integration is working!');
    console.log('💡 Your dashboard is ready to provide real insights to customers.');
  } else {
    console.log('\n⚠️  All tests failed - check environment variables and API setup.');
    console.log('📖 See REAL_DATA_SETUP.md for configuration instructions.');
  }
  
  // Detailed results
  console.log('\n📊 Detailed Results');
  console.log('===================');
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.description}: Working`);
      if (result.result?.meta?.source) {
        console.log(`   📡 Data source: ${result.result.meta.source}`);
      }
    } else {
      console.log(`❌ ${result.description}: ${result.error}`);
    }
  });
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Set up Google Analytics 4 credentials');
  console.log('2. Add domain to Google Search Console');
  console.log('3. Get PageSpeed Insights API key');
  console.log('4. Update environment variables in Vercel');
  console.log('5. Redeploy and test again');
}

// Run the tests
runTests().catch(console.error);
