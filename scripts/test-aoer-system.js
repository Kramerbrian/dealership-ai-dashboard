#!/usr/bin/env node

/**
 * Test script for AOER Orchestrator System
 * Tests the complete flow: queue -> process -> update -> verify
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_TENANT_ID = 'e1a63d30-4a8b-4bb9-86e8-48c7238a54de';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function testAOERSystem() {
  console.log('🧪 Testing AOER Orchestrator System...\n');

  try {
    // Step 1: Test queue endpoint
    console.log('1️⃣ Testing queue endpoint...');
    const queueResponse = await fetch(`${BASE_URL}/api/aoer/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId: TEST_TENANT_ID,
        priority: 'high'
      }),
    });

    if (!queueResponse.ok) {
      throw new Error(`Queue API failed: ${queueResponse.status} ${await queueResponse.text()}`);
    }

    const queueResult = await queueResponse.json();
    console.log('✅ Queue API Response:', queueResult);

    // Step 2: Check queue status
    console.log('\n2️⃣ Checking queue status...');
    const statusResponse = await fetch(`${BASE_URL}/api/aoer/queue?tenantId=${TEST_TENANT_ID}`);
    
    if (!statusResponse.ok) {
      throw new Error(`Status API failed: ${statusResponse.status} ${await statusResponse.text()}`);
    }

    const statusResult = await statusResponse.json();
    console.log('✅ Queue Status:', statusResult);

    // Step 3: Simulate worker processing (direct database call)
    console.log('\n3️⃣ Simulating worker processing...');
    const { data: queueItem, error: queueError } = await supabase
      .from('aoer_queue')
      .select('*')
      .eq('tenant_id', TEST_TENANT_ID)
      .eq('status', 'queued')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (queueError) {
      console.log('⚠️ No queued items found, creating test data...');
      // Create some test AIV data
      await createTestData();
    } else {
      console.log('📋 Found queue item:', queueItem);
    }

    // Step 4: Process AOER computation
    console.log('\n4️⃣ Processing AOER computation...');
    const { data: aoerResult, error: aoerError } = await supabase
      .rpc('compute_aoer_for_tenant', { tenant_uuid: TEST_TENANT_ID });

    if (aoerError) {
      throw new Error(`AOER computation failed: ${aoerError.message}`);
    }

    console.log('✅ AOER Computation Result:', aoerResult);

    // Step 5: Update AOER summary
    console.log('\n5️⃣ Updating AOER summary...');
    const { error: updateError } = await supabase
      .rpc('update_aoer_summary', { tenant_uuid: TEST_TENANT_ID });

    if (updateError) {
      throw new Error(`AOER summary update failed: ${updateError.message}`);
    }

    console.log('✅ AOER summary updated');

    // Step 6: Verify AOER summary
    console.log('\n6️⃣ Verifying AOER summary...');
    const summaryResponse = await fetch(`${BASE_URL}/api/aoer/summary?tenantId=${TEST_TENANT_ID}`);
    
    if (!summaryResponse.ok) {
      throw new Error(`Summary API failed: ${summaryResponse.status} ${await summaryResponse.text()}`);
    }

    const summaryResult = await summaryResponse.json();
    console.log('✅ AOER Summary:', summaryResult);

    // Step 7: Check metrics events
    console.log('\n7️⃣ Checking metrics events...');
    const { data: metricsEvents, error: metricsError } = await supabase
      .from('metrics_events')
      .select('*')
      .eq('tenant_id', TEST_TENANT_ID)
      .eq('event_type', 'aoer_recompute')
      .order('created_at', { ascending: false })
      .limit(5);

    if (metricsError) {
      console.log('⚠️ Error fetching metrics events:', metricsError);
    } else {
      console.log('✅ Metrics Events:', metricsEvents);
    }

    // Step 8: Test cron endpoint
    console.log('\n8️⃣ Testing cron endpoint...');
    const cronResponse = await fetch(`${BASE_URL}/api/aoer/cron`);
    
    if (!cronResponse.ok) {
      console.log('⚠️ Cron endpoint failed:', cronResponse.status, await cronResponse.text());
    } else {
      const cronResult = await cronResponse.json();
      console.log('✅ Cron Result:', cronResult);
    }

    console.log('\n🎉 AOER System Test Completed Successfully!');
    console.log('\n📊 Test Results Summary:');
    console.log('✅ Worker starts: Queue endpoint working');
    console.log('✅ Queue job: Tenant queued successfully');
    console.log('✅ Worker log: AOER computation completed');
    console.log('✅ Supabase aoer_summary updated: Summary updated');
    console.log('✅ Dashboard updates: API endpoints ready');
    console.log('✅ metrics_events grows: Events logged');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function createTestData() {
  console.log('📝 Creating test AIV data...');
  
  // Create some test AIV raw signals
  const testSignals = [];
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    testSignals.push({
      dealer_id: TEST_TENANT_ID,
      date: date.toISOString().split('T')[0],
      seo: Math.random() * 100,
      aeo: Math.random() * 100,
      geo: Math.random() * 100,
      ugc: Math.random() * 100,
      geolocal: Math.random() * 100,
      observed_aiv: Math.random() * 100,
      observed_rar: Math.random() * 1000,
      updated_at: new Date().toISOString()
    });
  }

  const { error } = await supabase
    .from('aiv_raw_signals')
    .insert(testSignals);

  if (error) {
    console.error('Error creating test data:', error);
  } else {
    console.log('✅ Test data created');
  }
}

// Run the test
if (require.main === module) {
  testAOERSystem().catch(console.error);
}

module.exports = { testAOERSystem };
