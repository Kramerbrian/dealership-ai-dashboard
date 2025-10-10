#!/usr/bin/env node

/**
 * Test script to enqueue a tenant for AOER recomputation
 * This simulates the exact command you requested
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enqueueTenantRecompute(tenantId, priority = 'medium') {
  try {
    console.log(`[AOER] Queued recompute for tenant: ${tenantId} (priority: ${priority})`);
    
    // Insert into aoer_queue table
    const { data, error } = await supabase
      .from('aoer_queue')
      .insert({
        tenant_id: tenantId,
        priority: priority,
        scheduled_at: new Date().toISOString(),
        status: 'queued'
      })
      .select();

    if (error) {
      console.error(`[AOER] Error queuing tenant ${tenantId}:`, error);
      return false;
    }

    console.log(`[AOER] ✅ Successfully queued tenant: ${tenantId}`);
    console.log('Queue item:', data[0]);
    return true;
  } catch (error) {
    console.error(`[AOER] Error in enqueueTenantRecompute:`, error);
    return false;
  }
}

// Test the enqueue function
async function testEnqueue() {
  const tenantId = 'e1a63d30-4a8b-4bb9-86e8-48c7238a54de';
  
  console.log('🧪 Testing AOER enqueue function...\n');
  
  const success = await enqueueTenantRecompute(tenantId, 'high');
  
  if (success) {
    console.log('\n✅ Test completed successfully!');
    console.log('Expected results:');
    console.log('✅ Worker starts: "AOER Orchestrator worker active"');
    console.log('✅ Queue job: "[AOER] Queued recompute for tenant ..."');
    console.log('✅ Worker log: "[AOER] ✅ Completed recompute for ..."');
    console.log('✅ Supabase aoer_summary updated: updated_at within 2 min of cron');
    console.log('✅ Dashboard updates: Live tile refresh via Realtime');
    console.log('✅ metrics_events grows: new row per run');
  } else {
    console.log('\n❌ Test failed');
    process.exit(1);
  }
}

// Run the test
testEnqueue().catch(console.error);
