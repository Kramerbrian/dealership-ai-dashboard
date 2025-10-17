#!/usr/bin/env tsx
// Test ADA APIs
// DealershipAI - Test ADA API endpoints without full infrastructure

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ADA_ENGINE_URL = 'https://mock-ada-engine.com';

async function testADAAPIs() {
  console.log('🧪 Testing ADA API Endpoints...\n');

  // Test 1: Trigger manual analysis
  console.log('1️⃣ Testing manual ADA analysis trigger...');
  try {
    const triggerResponse = await fetch(`${BASE_URL}/api/ada/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-role': 'admin' // Mock admin role
      },
      body: JSON.stringify({
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        vertical: 'sales',
        priority: 'high',
        forceRefresh: true
      })
    });

    if (triggerResponse.ok) {
      const triggerData = await triggerResponse.json();
      console.log('✅ Trigger API Response:', JSON.stringify(triggerData, null, 2));
    } else {
      console.log('❌ Trigger API Error:', triggerResponse.status, await triggerResponse.text());
    }
  } catch (error) {
    console.log('❌ Trigger API Error:', error.message);
  }

  console.log('\n2️⃣ Testing monitoring dashboard...');
  try {
    const monitorResponse = await fetch(`${BASE_URL}/api/ada/monitor`, {
      headers: {
        'x-role': 'admin' // Mock admin role
      }
    });

    if (monitorResponse.ok) {
      const monitorData = await monitorResponse.json();
      console.log('✅ Monitor API Response:', JSON.stringify(monitorData, null, 2));
    } else {
      console.log('❌ Monitor API Error:', monitorResponse.status, await monitorResponse.text());
    }
  } catch (error) {
    console.log('❌ Monitor API Error:', error.message);
  }

  console.log('\n3️⃣ Testing schedule management...');
  try {
    const scheduleResponse = await fetch(`${BASE_URL}/api/ada/schedule`, {
      headers: {
        'x-role': 'admin' // Mock admin role
      }
    });

    if (scheduleResponse.ok) {
      const scheduleData = await scheduleResponse.json();
      console.log('✅ Schedule API Response:', JSON.stringify(scheduleData, null, 2));
    } else {
      console.log('❌ Schedule API Error:', scheduleResponse.status, await scheduleResponse.text());
    }
  } catch (error) {
    console.log('❌ Schedule API Error:', error.message);
  }

  console.log('\n4️⃣ Testing schedule trigger...');
  try {
    const triggerScheduleResponse = await fetch(`${BASE_URL}/api/ada/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-role': 'admin' // Mock admin role
      },
      body: JSON.stringify({
        action: 'trigger',
        scheduleName: 'nightly-bulk-reanalysis'
      })
    });

    if (triggerScheduleResponse.ok) {
      const triggerScheduleData = await triggerScheduleResponse.json();
      console.log('✅ Schedule Trigger API Response:', JSON.stringify(triggerScheduleData, null, 2));
    } else {
      console.log('❌ Schedule Trigger API Error:', triggerScheduleResponse.status, await triggerScheduleResponse.text());
    }
  } catch (error) {
    console.log('❌ Schedule Trigger API Error:', error.message);
  }

  console.log('\n5️⃣ Testing job status check...');
  try {
    const statusResponse = await fetch(`${BASE_URL}/api/ada/trigger?jobId=123`, {
      headers: {
        'x-role': 'admin' // Mock admin role
      }
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Job Status API Response:', JSON.stringify(statusData, null, 2));
    } else {
      console.log('❌ Job Status API Error:', statusResponse.status, await statusResponse.text());
    }
  } catch (error) {
    console.log('❌ Job Status API Error:', error.message);
  }

  console.log('\n🎉 ADA API testing completed!');
}

// Run tests if called directly
if (require.main === module) {
  testADAAPIs().catch(console.error);
}

export default testADAAPIs;
