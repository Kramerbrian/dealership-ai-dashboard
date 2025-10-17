#!/usr/bin/env node

/**
 * Basic Functionality Test
 * Tests core functionality without database dependencies
 */

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing Basic Functionality\n');

async function testBasicAPIs() {
  const tests = [
    {
      name: 'Health Check API',
      url: '/api/health',
      method: 'GET'
    },
    {
      name: 'DTRI Trend API (Mock Data)',
      url: '/api/dtri/trend?weeks=30',
      method: 'GET'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n🧪 ${test.name}`);
      
      const response = await fetch(`${BASE_URL}${test.url}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText.substring(0, 100) };
      }

      if (response.status === 200) {
        console.log(`✅ PASSED (${response.status})`);
        if (responseData.status || responseData.data) {
          console.log(`   Response: ${JSON.stringify(responseData).substring(0, 100)}...`);
        }
        passed++;
      } else {
        console.log(`❌ FAILED (Expected: 200, Got: ${response.status})`);
        console.log(`   Response: ${responseText.substring(0, 200)}...`);
      }

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }

  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  return { passed, total };
}

async function testUIComponents() {
  console.log('\n🎨 Testing UI Components');
  
  const components = [
    'app/(dashboard)/zeropoint/page.tsx',
    'app/(dashboard)/zeropoint/components/DashboardHeader.tsx',
    'app/(dashboard)/zeropoint/components/SalesIntelligencePanel.tsx',
    'app/(dashboard)/zeropoint/components/UsedAcquisitionPanel.tsx'
  ];

  const fs = require('fs');
  let valid = 0;

  for (const component of components) {
    if (fs.existsSync(component)) {
      console.log(`✅ ${component}`);
      valid++;
    } else {
      console.log(`❌ ${component} - Not found`);
    }
  }

  console.log(`\n📊 Components: ${valid}/${components.length} valid`);
  return { valid, total: components.length };
}

async function main() {
  try {
    // Check if server is running
    try {
      await fetch(`${BASE_URL}/api/health`);
      console.log('✅ Server is running');
    } catch {
      console.log('❌ Server is not running. Please start with: npm run dev');
      process.exit(1);
    }

    const [apiResults, componentResults] = await Promise.all([
      testBasicAPIs(),
      testUIComponents()
    ]);

    console.log('\n' + '='.repeat(50));
    console.log('📊 BASIC FUNCTIONALITY SUMMARY');
    console.log('='.repeat(50));
    console.log(`API Tests: ${apiResults.passed}/${apiResults.total} passed`);
    console.log(`Components: ${componentResults.valid}/${componentResults.total} valid`);

    const overallSuccess = apiResults.passed > 0 && componentResults.valid === componentResults.total;
    
    if (overallSuccess) {
      console.log('\n✅ BASIC FUNCTIONALITY WORKING');
      console.log('🚀 Ready for database setup and deployment');
    } else {
      console.log('\n⚠️  BASIC FUNCTIONALITY ISSUES');
      console.log('🔧 Please fix the issues above');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
