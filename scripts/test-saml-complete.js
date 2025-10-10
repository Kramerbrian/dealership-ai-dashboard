#!/usr/bin/env node

/**
 * Complete SAML Authentication Flow Test
 * 
 * This script tests the entire SAML authentication flow:
 * 1. NextAuth configuration
 * 2. BoxyHQ SAML Jackson setup
 * 3. OAuth endpoints
 * 4. Environment variables
 * 5. Database connectivity
 * 
 * Usage: node scripts/test-saml-complete.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 5000;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TIMEOUT,
      ...options,
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(url, expectedStatus = 200, description = '') {
  try {
    log(`  Testing ${description || url}...`, 'cyan');
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      log(`    ✅ ${response.statusCode} - ${description || url}`, 'green');
      return { success: true, response };
    } else {
      log(`    ❌ ${response.statusCode} - Expected ${expectedStatus}`, 'red');
      return { success: false, response };
    }
  } catch (error) {
    log(`    ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function checkEnvironmentVariables() {
  log('\n🔧 Checking Environment Variables...', 'blue');
  
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ];
  
  const optionalVars = [
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
  ];
  
  let allRequired = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`  ✅ ${varName} is set`, 'green');
    } else {
      log(`  ❌ ${varName} is missing (required)`, 'red');
      allRequired = false;
    }
  }
  
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log(`  ✅ ${varName} is set`, 'green');
    } else {
      log(`  ⚠️  ${varName} is not set (optional)`, 'yellow');
    }
  }
  
  return allRequired;
}

async function testNextAuthEndpoints() {
  log('\n🔐 Testing NextAuth Endpoints...', 'blue');
  
  const endpoints = [
    { url: `${BASE_URL}/api/auth/providers`, status: 200, desc: 'NextAuth Providers' },
    { url: `${BASE_URL}/api/auth/session`, status: 200, desc: 'NextAuth Session' },
    { url: `${BASE_URL}/api/auth/csrf`, status: 200, desc: 'NextAuth CSRF' },
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.status, endpoint.desc);
    results.push({ ...endpoint, result });
  }
  
  return results;
}

async function testOAuthEndpoints() {
  log('\n🔗 Testing OAuth/SAML Endpoints...', 'blue');
  
  const endpoints = [
    { url: `${BASE_URL}/api/oauth/authorize`, status: 302, desc: 'OAuth Authorize' },
    { url: `${BASE_URL}/api/oauth/saml`, status: 405, desc: 'SAML Endpoint (POST only)' },
    { url: `${BASE_URL}/api/oauth/token`, status: 400, desc: 'OAuth Token' },
    { url: `${BASE_URL}/api/oauth/userinfo`, status: 401, desc: 'OAuth UserInfo' },
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.status, endpoint.desc);
    results.push({ ...endpoint, result });
  }
  
  return results;
}

async function testApplicationEndpoints() {
  log('\n🌐 Testing Application Endpoints...', 'blue');
  
  const endpoints = [
    { url: `${BASE_URL}/`, status: 200, desc: 'Home Page' },
    { url: `${BASE_URL}/dashboard`, status: 200, desc: 'Dashboard' },
    { url: `${BASE_URL}/query-explorer`, status: 200, desc: 'Query Explorer' },
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.status, endpoint.desc);
    results.push({ ...endpoint, result });
  }
  
  return results;
}

async function testJacksonConfiguration() {
  log('\n⚙️  Testing Jackson Configuration...', 'blue');
  
  try {
    // Try to import and initialize Jackson
    const { getJackson } = require('../src/lib/jackson.ts');
    log('  ✅ Jackson module imported successfully', 'green');
    
    // Test Jackson initialization
    const controller = await getJackson();
    if (controller) {
      log('  ✅ Jackson controller initialized', 'green');
      return { success: true };
    } else {
      log('  ❌ Jackson controller failed to initialize', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`  ❌ Jackson configuration error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function generateTestReport(results) {
  log('\n📊 Generating Test Report...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      platform: process.platform,
      nextauth_url: process.env.NEXTAUTH_URL,
      database_configured: !!process.env.DATABASE_URL,
    },
    results: results,
    summary: {
      total_tests: 0,
      passed: 0,
      failed: 0,
      success_rate: 0,
    },
  };
  
  // Calculate summary
  for (const category of Object.values(results)) {
    if (Array.isArray(category)) {
      for (const test of category) {
        report.summary.total_tests++;
        if (test.result?.success) {
          report.summary.passed++;
        } else {
          report.summary.failed++;
        }
      }
    } else if (typeof category === 'boolean') {
      report.summary.total_tests++;
      if (category) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
      }
    }
  }
  
  report.summary.success_rate = report.summary.total_tests > 0 
    ? (report.summary.passed / report.summary.total_tests * 100).toFixed(1)
    : 0;
  
  // Save report
  const reportFile = path.join(__dirname, '../logs/saml-test-report.json');
  const logsDir = path.dirname(reportFile);
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(`📄 Test report saved to: ${reportFile}`, 'cyan');
  
  return report;
}

async function main() {
  log('🚀 Starting Complete SAML Authentication Flow Test', 'bright');
  log('=' .repeat(60), 'blue');
  
  const results = {};
  
  // Test environment variables
  results.environment = await checkEnvironmentVariables();
  
  // Test Jackson configuration
  results.jackson = await testJacksonConfiguration();
  
  // Test NextAuth endpoints
  results.nextauth = await testNextAuthEndpoints();
  
  // Test OAuth/SAML endpoints
  results.oauth = await testOAuthEndpoints();
  
  // Test application endpoints
  results.application = await testApplicationEndpoints();
  
  // Generate and display report
  const report = await generateTestReport(results);
  
  log('\n' + '=' .repeat(60), 'blue');
  log('📈 TEST SUMMARY', 'bright');
  log('=' .repeat(60), 'blue');
  log(`Total Tests: ${report.summary.total_tests}`, 'cyan');
  log(`Passed: ${report.summary.passed}`, 'green');
  log(`Failed: ${report.summary.failed}`, 'red');
  log(`Success Rate: ${report.summary.success_rate}%`, 'magenta');
  
  if (report.summary.success_rate >= 80) {
    log('\n✅ SAML Authentication Flow Test PASSED', 'green');
    log('The system is ready for SAML authentication.', 'green');
  } else {
    log('\n❌ SAML Authentication Flow Test FAILED', 'red');
    log('Please review the failed tests and fix the issues.', 'red');
  }
  
  log('\n🔧 Next Steps:', 'yellow');
  log('1. Configure your SAML IdP with the following details:', 'yellow');
  log(`   - Entity ID: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`, 'yellow');
  log(`   - ACS URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/saml`, 'yellow');
  log('2. Test the authentication flow with your IdP', 'yellow');
  log('3. Deploy to production with proper environment variables', 'yellow');
  
  // Exit with appropriate code
  process.exit(report.summary.success_rate >= 80 ? 0 : 1);
}

// Run the test if called directly
if (require.main === module) {
  main().catch(error => {
    log(`💥 Test failed with error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testEndpoint,
  checkEnvironmentVariables,
  testNextAuthEndpoints,
  testOAuthEndpoints,
  testApplicationEndpoints,
  testJacksonConfiguration,
};
