#!/usr/bin/env tsx
/**
 * Production Endpoints Test Script
 * 
 * Tests telemetry, alerts, and Fix-Now endpoints with automatic auth handling
 * 
 * Usage:
 *   npm run test:endpoints
 *   # or
 *   tsx scripts/test-production-endpoints.ts
 */

import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

async function getAuthToken(): Promise<string | null> {
  // Try to get a test tenant ID from Supabase
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Supabase not configured, using mock tenant');
    return 'test-tenant-id';
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Get first tenant for testing
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .single();

    if (error || !tenants) {
      console.warn('⚠️  Could not fetch tenant, using mock');
      return 'test-tenant-id';
    }

    return tenants.id;
  } catch (error) {
    console.warn('⚠️  Auth setup failed, using mock tenant');
    return 'test-tenant-id';
  }
}

async function testTelemetry(tenantId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/telemetry/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add tenant header if your API expects it
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        name: 'test_event',
        meta: {
          test: true,
          timestamp: new Date().toISOString(),
          source: 'test-script',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Telemetry Storage',
        success: false,
        message: `HTTP ${response.status}`,
        error: JSON.stringify(data),
      };
    }

    return {
      name: 'Telemetry Storage',
      success: true,
      message: 'Event stored successfully',
      data,
    };
  } catch (error) {
    return {
      name: 'Telemetry Storage',
      success: false,
      message: 'Request failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testAlerts(tenantId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/alerts/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        scsPct: 75,
        topMissingField: 'offers.availability',
        gcs: {
          carmax: 15.2,
          yours: 6.1,
          segment: 'midsize SUV',
        },
        fiveXX24h: 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Alert Evaluation',
        success: false,
        message: `HTTP ${response.status}`,
        error: JSON.stringify(data),
      };
    }

    return {
      name: 'Alert Evaluation',
      success: true,
      message: `Found ${data.alerts?.length || 0} alerts`,
      data: data.alerts,
    };
  } catch (error) {
    return {
      name: 'Alert Evaluation',
      success: false,
      message: 'Request failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testSchemaFix(tenantId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/schema/fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        url: `${BASE_URL}/inventory/test`,
        field: 'offers.availability',
        value: 'InStock',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Schema Fix Queue',
        success: false,
        message: `HTTP ${response.status}`,
        error: JSON.stringify(data),
      };
    }

    return {
      name: 'Schema Fix Queue',
      success: true,
      message: `Job queued: ${data.jobId}`,
      data,
    };
  } catch (error) {
    return {
      name: 'Schema Fix Queue',
      success: false,
      message: 'Request failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testReprobe(tenantId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs/reprobe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        scope: 'schema',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        name: 'Reprobe Queue',
        success: false,
        message: `HTTP ${response.status}`,
        error: JSON.stringify(data),
      };
    }

    return {
      name: 'Reprobe Queue',
      success: true,
      message: `Job queued: ${data.jobId}`,
      data,
    };
  } catch (error) {
    return {
      name: 'Reprobe Queue',
      success: false,
      message: 'Request failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Production Endpoints\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const tenantId = await getAuthToken();
  console.log(`Using tenant ID: ${tenantId}\n`);

  const tests = [
    () => testTelemetry(tenantId),
    () => testAlerts(tenantId),
    () => testSchemaFix(tenantId),
    () => testReprobe(tenantId),
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.data && Object.keys(result.data).length > 0) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2));
    }
    console.log('');
  }

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log('─'.repeat(50));
  console.log(`Results: ${successCount}/${totalCount} tests passed\n`);

  if (successCount === totalCount) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

