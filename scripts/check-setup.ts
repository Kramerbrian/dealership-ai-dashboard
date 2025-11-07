/**
 * Setup Checker
 * 
 * Verifies that all integration components are properly configured
 */

import { getQueueStats } from '@/lib/job-queue';
import { createClient } from '@supabase/supabase-js';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export async function checkSetup(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // Check Redis/BullMQ
  try {
    const stats = await getQueueStats();
    if (stats) {
      results.push({
        name: 'Redis/BullMQ Queue',
        status: 'pass',
        message: `Queue is configured. Stats: ${JSON.stringify(stats)}`,
      });
    } else {
      results.push({
        name: 'Redis/BullMQ Queue',
        status: 'warning',
        message: 'Queue not configured. Jobs will run synchronously.',
      });
    }
  } catch (error) {
    results.push({
      name: 'Redis/BullMQ Queue',
      status: 'fail',
      message: `Error: ${error}`,
    });
  }

  // Check Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      results.push({
        name: 'Supabase',
        status: 'fail',
        message: 'Supabase environment variables not set',
      });
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('telemetry_events').select('id').limit(1);
      
      if (error && error.code === '42P01') {
        results.push({
          name: 'Supabase Tables',
          status: 'fail',
          message: 'telemetry_events table does not exist. Run migration or create tables.',
        });
      } else if (error) {
        results.push({
          name: 'Supabase Connection',
          status: 'warning',
          message: `Connection issue: ${error.message}`,
        });
      } else {
        results.push({
          name: 'Supabase',
          status: 'pass',
          message: 'Connected and tables exist',
        });
      }
    }
  } catch (error) {
    results.push({
      name: 'Supabase',
      status: 'fail',
      message: `Error: ${error}`,
    });
  }

  // Check Data Source APIs (optional)
  const dataSources = [
    { name: 'Pulse API', url: process.env.PULSE_API_URL, key: process.env.PULSE_API_KEY },
    { name: 'ATI API', url: process.env.ATI_API_URL, key: process.env.ATI_API_KEY },
    { name: 'CIS API', url: process.env.CIS_API_URL, key: process.env.CIS_API_KEY },
    { name: 'Probe API', url: process.env.PROBE_API_URL, key: process.env.PROBE_API_KEY },
  ];

  dataSources.forEach(source => {
    if (source.url && source.key && !source.url.includes('example.com')) {
      results.push({
        name: source.name,
        status: 'pass',
        message: 'Configured',
      });
    } else {
      results.push({
        name: source.name,
        status: 'warning',
        message: 'Not configured (will use mocks)',
      });
    }
  });

  // Check Slack
  if (process.env.SLACK_WEBHOOK_URL && !process.env.SLACK_WEBHOOK_URL.includes('YOUR')) {
    results.push({
      name: 'Slack Webhooks',
      status: 'pass',
      message: 'Configured',
    });
  } else {
    results.push({
      name: 'Slack Webhooks',
      status: 'warning',
      message: 'Not configured (alerts will be skipped)',
    });
  }

  return results;
}

// CLI usage
if (require.main === module) {
  checkSetup().then(results => {
    console.log('\n🔍 Setup Check Results\n');
    console.log('='.repeat(50));
    
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
      console.log(`${icon} ${color}${result.name}\x1b[0m`);
      console.log(`   ${result.message}\n`);
    });
    
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️  Warnings: ${warnings}`);
  });
}

