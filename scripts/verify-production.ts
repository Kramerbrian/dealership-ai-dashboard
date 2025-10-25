#!/usr/bin/env tsx

/**
 * Production Verification Script
 * Tests all critical endpoints and systems
 */

import { config } from 'dotenv';
import chalk from 'chalk';

// Load environment variables
config({ path: '.env.production.local' });

const PRODUCTION_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com';
const API_ENDPOINTS = [
  { name: 'Health Check', path: '/api/health', method: 'GET' },
  { name: 'System Status', path: '/api/system/status', method: 'GET' },
  { name: 'Calculator', path: '/api/calculator/calculate', method: 'POST', body: { domain: 'test.com' } },
  { name: 'AI Scores', path: '/api/ai-scores', method: 'POST', body: { domain: 'test.com' } },
  { name: 'Quick Audit', path: '/api/quick-audit', method: 'POST', body: { domain: 'test.com' } },
  { name: 'Intelligence Data', path: '/api/intelligence/scores', method: 'GET' },
];

const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'Calculator', path: '/calculator' },
  { name: 'Intelligence Dashboard', path: '/intelligence' },
  { name: 'Sign In', path: '/sign-in' },
];

async function testEndpoint(endpoint: any) {
  const url = `${PRODUCTION_URL}${endpoint.path}`;
  const startTime = Date.now();
  
  try {
    const options: RequestInit = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: response.status,
        responseTime,
        data: data,
      };
    } else {
      return {
        success: false,
        status: response.status,
        responseTime,
        error: await response.text(),
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function testPage(page: any) {
  const url = `${PRODUCTION_URL}${page.path}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const html = await response.text();
      return {
        success: true,
        status: response.status,
        responseTime,
        size: html.length,
      };
    } else {
      return {
        success: false,
        status: response.status,
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function checkSSL() {
  try {
    const response = await fetch(PRODUCTION_URL);
    return {
      success: response.url.startsWith('https://'),
      redirected: response.redirected,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function checkHeaders() {
  try {
    const response = await fetch(PRODUCTION_URL);
    const headers = response.headers;
    
    const securityHeaders = {
      'x-frame-options': headers.get('x-frame-options'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'strict-transport-security': headers.get('strict-transport-security'),
      'content-security-policy': headers.get('content-security-policy'),
    };
    
    return {
      success: true,
      headers: securityHeaders,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log(chalk.blue.bold('\n🚀 DealershipAI Production Verification\n'));
  console.log(chalk.gray(`Testing: ${PRODUCTION_URL}\n`));
  
  // Check SSL
  console.log(chalk.yellow('🔒 Checking SSL...'));
  const sslResult = await checkSSL();
  if (sslResult.success) {
    console.log(chalk.green('✓ SSL enabled'));
  } else {
    console.log(chalk.red('✗ SSL issue:', sslResult.error));
  }
  
  // Check Security Headers
  console.log(chalk.yellow('\n🛡️ Checking Security Headers...'));
  const headersResult = await checkHeaders();
  if (headersResult.success) {
    console.log(chalk.green('✓ Security headers present'));
    Object.entries(headersResult.headers).forEach(([key, value]) => {
      if (value) {
        console.log(chalk.gray(`  ${key}: ${value.substring(0, 50)}...`));
      } else {
        console.log(chalk.yellow(`  ${key}: missing`));
      }
    });
  }
  
  // Test Pages
  console.log(chalk.yellow('\n📄 Testing Pages...'));
  for (const page of PAGES) {
    process.stdout.write(`  ${page.name}... `);
    const result = await testPage(page);
    
    if (result.success) {
      console.log(
        chalk.green(`✓ ${result.status}`) +
        chalk.gray(` (${result.responseTime}ms, ${(result.size / 1024).toFixed(1)}KB)`)
      );
    } else {
      console.log(
        chalk.red(`✗ ${result.status || 'Failed'}`) +
        chalk.gray(` - ${result.error}`)
      );
    }
  }
  
  // Test API Endpoints
  console.log(chalk.yellow('\n🔌 Testing API Endpoints...'));
  let apiSuccess = 0;
  let apiFailed = 0;
  
  for (const endpoint of API_ENDPOINTS) {
    process.stdout.write(`  ${endpoint.name}... `);
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      apiSuccess++;
      console.log(
        chalk.green(`✓ ${result.status}`) +
        chalk.gray(` (${result.responseTime}ms)`)
      );
    } else {
      apiFailed++;
      console.log(
        chalk.red(`✗ ${result.status || 'Failed'}`) +
        chalk.gray(` - ${result.error?.substring(0, 50)}`)
      );
    }
  }
  
  // Performance Summary
  console.log(chalk.yellow('\n📊 Performance Summary'));
  const perfResults = [];
  
  for (const endpoint of API_ENDPOINTS.slice(0, 3)) {
    const results = [];
    for (let i = 0; i < 3; i++) {
      const result = await testEndpoint(endpoint);
      if (result.success) {
        results.push(result.responseTime);
      }
    }
    
    if (results.length > 0) {
      const avg = results.reduce((a, b) => a + b, 0) / results.length;
      const min = Math.min(...results);
      const max = Math.max(...results);
      
      perfResults.push({
        name: endpoint.name,
        avg: avg.toFixed(0),
        min,
        max,
      });
    }
  }
  
  console.table(perfResults);
  
  // Final Summary
  console.log(chalk.blue.bold('\n📋 Final Summary\n'));
  
  const totalTests = PAGES.length + API_ENDPOINTS.length;
  const successRate = ((totalTests - apiFailed) / totalTests * 100).toFixed(1);
  
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${chalk.green(totalTests - apiFailed)}`);
  console.log(`  Failed: ${apiFailed > 0 ? chalk.red(apiFailed) : chalk.green(0)}`);
  console.log(`  Success Rate: ${successRate}%`);
  
  if (apiFailed === 0) {
    console.log(chalk.green.bold('\n✅ All systems operational!'));
  } else {
    console.log(chalk.yellow.bold(`\n⚠️ ${apiFailed} issues detected. Please investigate.`));
  }
  
  // Production URLs
  console.log(chalk.blue.bold('\n🌐 Production URLs:\n'));
  console.log(`  Main App: ${chalk.cyan(PRODUCTION_URL)}`);
  console.log(`  Calculator: ${chalk.cyan(`${PRODUCTION_URL}/calculator`)}`);
  console.log(`  Intelligence: ${chalk.cyan(`${PRODUCTION_URL}/intelligence`)}`);
  console.log(`  API Health: ${chalk.cyan(`${PRODUCTION_URL}/api/health`)}`);
  console.log(`  System Status: ${chalk.cyan(`${PRODUCTION_URL}/api/system/status`)}`);
  
  process.exit(apiFailed > 0 ? 1 : 0);
}

// Run the script
main().catch((error) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});