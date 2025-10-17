#!/usr/bin/env node

/**
 * Complete System Test Suite
 * Tests all APIs, components, and integrations
 */

const BASE_URL = 'http://localhost:3000';
const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000000';

// Test configuration
const tests = [
  {
    name: 'Sentinel Governance System',
    tests: [
      {
        name: 'Sentinel Run API',
        method: 'POST',
        url: '/api/internal/sentinel/run',
        body: { tenantId: TEST_TENANT_ID },
        expectedStatus: 200
      },
      {
        name: 'Latest Alerts API',
        method: 'GET',
        url: `/api/tenants/${TEST_TENANT_ID}/alerts/latest`,
        expectedStatus: 200
      },
      {
        name: 'Beta Recalibration API',
        method: 'POST',
        url: '/api/beta/recalibrate',
        body: { tenantId: TEST_TENANT_ID, trigger: 'ATI_DROP' },
        expectedStatus: 200
      }
    ]
  },
  {
    name: 'DTRI System',
    tests: [
      {
        name: 'DTRI Analysis API',
        method: 'POST',
        url: '/api/dtri/analyze',
        body: {
          vertical: 'sales',
          eeat: 0.8,
          rep: 0.7,
          tech: 0.9,
          locvis: 0.85
        },
        expectedStatus: 200
      },
      {
        name: 'DTRI Trend API',
        method: 'GET',
        url: '/api/dtri/trend?weeks=90',
        expectedStatus: 200
      },
      {
        name: 'DTRI Enhancer API',
        method: 'POST',
        url: '/api/dtri/enhancer',
        body: { tenantId: TEST_TENANT_ID },
        expectedStatus: 200
      }
    ]
  },
  {
    name: 'ACP Integration',
    tests: [
      {
        name: 'ACP Trade-In API',
        method: 'POST',
        url: '/api/acp/trade-in',
        headers: { 'x-tenant-id': TEST_TENANT_ID },
        body: {
          vin: '1HGBH41JXMN109186',
          mileage: 45000,
          condition: 'good',
          location: 'San Francisco, CA',
          customerInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0123'
          }
        },
        expectedStatus: 200
      },
      {
        name: 'ACP Parts API',
        method: 'POST',
        url: '/api/acp/parts',
        headers: { 'x-tenant-id': TEST_TENANT_ID },
        body: {
          vin: '1HGBH41JXMN109186',
          category: 'engine',
          customerInfo: {
            name: 'Jane Smith',
            email: 'jane@example.com'
          }
        },
        expectedStatus: 200
      }
    ]
  },
  {
    name: 'Scoreboard APIs',
    tests: [
      {
        name: 'Sales Scoreboard API',
        method: 'GET',
        url: '/api/scoreboard/sales?period=30d&includeCI=true',
        headers: { 'x-tenant-id': TEST_TENANT_ID },
        expectedStatus: 200
      },
      {
        name: 'Used Acquisition Scoreboard API',
        method: 'GET',
        url: '/api/scoreboard/used_acquisition?period=30d&includeCI=true',
        headers: { 'x-tenant-id': TEST_TENANT_ID },
        expectedStatus: 200
      }
    ]
  },
  {
    name: 'KPI History System',
    tests: [
      {
        name: 'KPI History Cron API',
        method: 'POST',
        url: '/api/internal/cron/kpi-history',
        headers: { 'x-cron-secret': 'test-secret' },
        expectedStatus: 200
      }
    ]
  }
];

// Test runner
async function runTests() {
  console.log('🚀 Starting Complete System Test Suite\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Tenant ID: ${TEST_TENANT_ID}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testGroup of tests) {
    console.log(`\n📋 Testing: ${testGroup.name}`);
    console.log('='.repeat(50));

    for (const test of testGroup.tests) {
      totalTests++;
      console.log(`\n🧪 ${test.name}`);

      try {
        const response = await fetch(`${BASE_URL}${test.url}`, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json',
            ...test.headers
          },
          body: test.body ? JSON.stringify(test.body) : undefined
        });

        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (response.status === test.expectedStatus) {
          console.log(`✅ PASSED (${response.status})`);
          if (responseData.ok !== false) {
            console.log(`   Response: ${JSON.stringify(responseData).substring(0, 100)}...`);
          }
          passedTests++;
        } else {
          console.log(`❌ FAILED (Expected: ${test.expectedStatus}, Got: ${response.status})`);
          console.log(`   Response: ${responseText.substring(0, 200)}...`);
          failedTests++;
        }

      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        failedTests++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! System is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  return { totalTests, passedTests, failedTests };
}

// Component validation
async function validateComponents() {
  console.log('\n🔍 Validating Components...');
  
  const components = [
    'app/(dashboard)/zeropoint/page.tsx',
    'app/(dashboard)/zeropoint/components/DashboardHeader.tsx',
    'app/(dashboard)/zeropoint/components/SalesIntelligencePanel.tsx',
    'app/(dashboard)/zeropoint/components/UsedAcquisitionPanel.tsx',
    'app/(dashboard)/zeropoint/components/KPITile.tsx',
    'app/(dashboard)/zeropoint/components/FunnelChart.tsx',
    'app/(dashboard)/zeropoint/components/AcquisitionChart.tsx',
    'app/(dashboard)/zeropoint/components/AlertsPanel.tsx',
    'app/(dashboard)/zeropoint/components/LoadingSkeleton.tsx'
  ];

  const fs = require('fs');
  let validComponents = 0;

  for (const component of components) {
    try {
      if (fs.existsSync(component)) {
        console.log(`✅ ${component}`);
        validComponents++;
      } else {
        console.log(`❌ ${component} - Not found`);
      }
    } catch (error) {
      console.log(`❌ ${component} - Error: ${error.message}`);
    }
  }

  console.log(`\nComponents: ${validComponents}/${components.length} valid`);
  return validComponents === components.length;
}

// Schema validation
async function validateSchemas() {
  console.log('\n📋 Validating JSON Schemas...');
  
  const schemas = [
    'schemas/ati_report.schema.json',
    'schemas/crs_report.schema.json',
    'schemas/elasticity.schema.json',
    'schemas/inventory_truth_index.schema.json',
    'schemas/signals.schema.json'
  ];

  const fs = require('fs');
  let validSchemas = 0;

  for (const schema of schemas) {
    try {
      if (fs.existsSync(schema)) {
        const content = JSON.parse(fs.readFileSync(schema, 'utf8'));
        if (content.$schema && content.type) {
          console.log(`✅ ${schema}`);
          validSchemas++;
        } else {
          console.log(`❌ ${schema} - Invalid schema structure`);
        }
      } else {
        console.log(`❌ ${schema} - Not found`);
      }
    } catch (error) {
      console.log(`❌ ${schema} - Error: ${error.message}`);
    }
  }

  console.log(`\nSchemas: ${validSchemas}/${schemas.length} valid`);
  return validSchemas === schemas.length;
}

// Main execution
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

    // Run all validations
    const [testResults, componentsValid, schemasValid] = await Promise.all([
      runTests(),
      validateComponents(),
      validateSchemas()
    ]);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`API Tests: ${testResults.passedTests}/${testResults.totalTests} passed`);
    console.log(`Components: ${componentsValid ? 'All valid' : 'Some invalid'}`);
    console.log(`Schemas: ${schemasValid ? 'All valid' : 'Some invalid'}`);

    const allValid = testResults.failedTests === 0 && componentsValid && schemasValid;
    
    if (allValid) {
      console.log('\n🎉 COMPLETE SYSTEM VALIDATION PASSED!');
      console.log('🚀 Ready for production deployment');
    } else {
      console.log('\n⚠️  VALIDATION INCOMPLETE');
      console.log('🔧 Please fix the issues above before deployment');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests, validateComponents, validateSchemas };
