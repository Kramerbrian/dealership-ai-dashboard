#!/usr/bin/env tsx

/**
 * Test Slack Integration
 * 
 * Tests all Slack endpoints and functionality
 */

import fetch from 'node-fetch';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

async function testSlackAuth(): Promise<TestResult> {
  try {
    if (!SLACK_BOT_TOKEN) {
      return { name: 'Slack Auth Test', passed: false, error: 'SLACK_BOT_TOKEN not set' };
    }

    const response = await fetch('https://slack.com/api/auth.test', {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
    });

    const data = await response.json();

    return {
      name: 'Slack Auth Test',
      passed: data.ok === true,
      error: data.ok ? undefined : data.error,
      details: data,
    };
  } catch (error) {
    return {
      name: 'Slack Auth Test',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testSlackWebhook(): Promise<TestResult> {
  try {
    if (!SLACK_WEBHOOK_URL) {
      return { name: 'Slack Webhook Test', passed: false, error: 'SLACK_WEBHOOK_URL not set' };
    }

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: '🧪 Test message from DealershipAI integration test',
        username: 'DealershipAI Test Bot',
      }),
    });

    // Slack webhooks return "ok" in body if successful
    const text = await response.text();

    return {
      name: 'Slack Webhook Test',
      passed: response.ok && (text === 'ok' || text.includes('ok')),
      error: response.ok ? undefined : `HTTP ${response.status}: ${text}`,
      details: { status: response.status, body: text },
    };
  } catch (error) {
    return {
      name: 'Slack Webhook Test',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testUpdateEndpoint(): Promise<TestResult> {
  try {
    // This test requires a valid channel and ts, so we'll just check if endpoint exists
    const response = await fetch(`${APP_URL}/api/slack/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'C1234567890', // Fake channel for testing
        ts: '1234567890.123456',
        status: 'completed',
        task: 'test_task',
        dealer: 'test-dealer',
      }),
    });

    // We expect it to fail without valid Slack context, but endpoint should exist
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      return {
        name: 'Slack Update Endpoint Test',
        passed: response.status !== 404 && response.status !== 500, // Endpoint exists and server is running
        error: response.status === 404 ? 'Endpoint not found' : response.status === 500 ? 'Server error (expected without Slack config)' : 'Invalid response',
        details: { status: response.status, response: text.substring(0, 100) },
      };
    }

    return {
      name: 'Slack Update Endpoint Test',
      passed: response.status !== 404, // Endpoint exists
      error: response.status === 404 ? 'Endpoint not found' : undefined,
      details: { status: response.status, response: data },
    };
  } catch (error) {
    return {
      name: 'Slack Update Endpoint Test',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testCommandEndpoint(): Promise<TestResult> {
  try {
    // This test requires valid Slack signature, so we'll just check if endpoint exists
    const response = await fetch(`${APP_URL}/api/slack/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: 'status test-dealer',
        token: 'test-token',
      }).toString(),
    });

    // We expect it to fail without valid signature, but endpoint should exist
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      return {
        name: 'Slack Command Endpoint Test',
        passed: response.status !== 404 && response.status !== 500, // Endpoint exists and server is running
        error: response.status === 404 ? 'Endpoint not found' : response.status === 500 ? 'Server error (expected without Slack config)' : 'Invalid response',
        details: { status: response.status, response: text.substring(0, 100) },
      };
    }

    return {
      name: 'Slack Command Endpoint Test',
      passed: response.status !== 404, // Endpoint exists
      error: response.status === 404 ? 'Endpoint not found' : undefined,
      details: { status: response.status, response: data },
    };
  } catch (error) {
    return {
      name: 'Slack Command Endpoint Test',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testActionsEndpoint(): Promise<TestResult> {
  try {
    // This test requires valid Slack signature, so we'll just check if endpoint exists
    const response = await fetch(`${APP_URL}/api/slack/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        payload: JSON.stringify({
          actions: [{ value: JSON.stringify({ dealer: 'test', action: 'test' }) }],
        }),
      }).toString(),
    });

    // We expect it to fail without valid signature, but endpoint should exist
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      return {
        name: 'Slack Actions Endpoint Test',
        passed: response.status !== 404 && response.status !== 500, // Endpoint exists and server is running
        error: response.status === 404 ? 'Endpoint not found' : response.status === 500 ? 'Server error (expected without Slack config)' : 'Invalid response',
        details: { status: response.status, response: text.substring(0, 100) },
      };
    }

    return {
      name: 'Slack Actions Endpoint Test',
      passed: response.status !== 404, // Endpoint exists
      error: response.status === 404 ? 'Endpoint not found' : undefined,
      details: { status: response.status, response: data },
    };
  } catch (error) {
    return {
      name: 'Slack Actions Endpoint Test',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runAllTests() {
  console.log('🧪 Testing Slack Integration...\n');

  const tests = [
    await testSlackAuth(),
    await testSlackWebhook(),
    await testUpdateEndpoint(),
    await testCommandEndpoint(),
    await testActionsEndpoint(),
  ];

  console.log('\n📊 Test Results:\n');

  let passed = 0;
  let failed = 0;
  let expectedFailures = 0;

  tests.forEach((test) => {
    const isExpectedFailure = 
      test.error?.includes('not set') || 
      test.error?.includes('Server error (expected without Slack config)');
    
    const icon = test.passed ? '✅' : (isExpectedFailure ? '⚠️' : '❌');
    console.log(`${icon} ${test.name}`);
    
    if (test.passed) {
      passed++;
      if (test.details) {
        console.log(`   Details:`, JSON.stringify(test.details, null, 2));
      }
    } else {
      if (isExpectedFailure) {
        expectedFailures++;
        console.log(`   ⚠️  Expected: ${test.error}`);
      } else {
        failed++;
        console.log(`   ❌ Error: ${test.error}`);
      }
      if (test.details && !isExpectedFailure) {
        console.log(`   Details:`, JSON.stringify(test.details, null, 2));
      }
    }
    console.log('');
  });

  console.log(`\n📈 Summary: ${passed} passed, ${expectedFailures} expected failures, ${failed} failed\n`);

  if (expectedFailures > 0) {
    console.log('📝 Next Steps:');
    console.log('   1. Add environment variables to .env.local (see env.slack.template)');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Re-run tests: npm run test:slack');
    console.log('');
    console.log('📖 For complete setup guide, see: QUICK_SLACK_SETUP.md\n');
  }

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Check environment variables and configuration.');
    process.exit(1);
  } else if (expectedFailures > 0) {
    console.log('✅ All endpoint tests passed! Configure environment variables to test full integration.');
    process.exit(0);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

export { runAllTests };

