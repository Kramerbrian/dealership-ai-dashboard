import { Worker } from 'bullmq';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dtriWorker = new Worker('dtri_jobs', async (job) => {
  // Handle beta recalibration jobs separately
  if (job.name === 'beta_recalibration') {
    console.log('🔄 Processing beta recalibration job...');

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/beta/recalibrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.updated) {
        console.log(`✅ Beta recalibrated: ${result.old_beta.toFixed(4)} → ${result.new_beta.toFixed(4)} (drift: ${result.drift_percentage.toFixed(2)}%)`);
      } else {
        console.log(`ℹ️ Beta unchanged: ${result.reason}`);
      }

      return { status: 'complete', result };
    } catch (error) {
      console.error('❌ Beta recalibration failed:', error);
      throw error;
    }
  }

  // Handle regular DTRI analysis jobs
  const { dealerId, verticals } = job.data;
  const results = [];

  console.log(`🔄 Processing DTRI job for dealer: ${dealerId}`);

  // Process each vertical for the dealer
  for (const v of verticals) {
    console.log(`📊 Analyzing vertical: ${v} for dealer: ${dealerId}`);
    
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/dtri/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vertical: v, dealerId })
      });
      
      const result = await response.json().catch(() => ({}));
      results.push({ vertical: v, ...result });
      console.log(`✅ Vertical ${v} analyzed successfully`);
    } catch (error) {
      console.error(`❌ Error analyzing vertical ${v}:`, error);
      results.push({ vertical: v, error: error.message });
    }
  }
  
  // Run ADA enhancer after all verticals are processed
  console.log(`🚀 Running ADA enhancer for dealer: ${dealerId}`);
  
  try {
    const enhancerResponse = await fetch(`${process.env.BASE_URL}/api/dtri/enhancer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        dealerData: results, 
        benchmarks: [],
        dealerId: dealerId
      })
    });
    
    const enhancerResult = await enhancerResponse.json().catch(() => ({}));
    results.push({ type: 'ada_enhancement', ...enhancerResult });
    console.log(`✅ ADA enhancer completed`);
  } catch (error) {
    console.error(`❌ Error running ADA enhancer:`, error);
    results.push({ type: 'ada_enhancement', error: error.message });
  }
  
  // Store results in Supabase audit log
  try {
    await supabase.from('dtri_audit_log').insert({
      dealer_id: dealerId,
      job_type: 'nightly_dtri',
      results: results,
      created_at: new Date().toISOString()
    });
    console.log(`📝 DTRI audit log stored for dealer: ${dealerId}`);
  } catch (error) {
    console.error(`❌ Error storing audit log:`, error);
  }
  
  return { dealerId, status: 'complete', results: results.length };
}, { 
  connection: { url: process.env.REDIS_URL! },
  concurrency: 3 // Process up to 3 jobs concurrently
});

dtriWorker.on('completed', (job) => {
  console.log(`✅ DTRI job complete: ${job.id} for dealer: ${job.data.dealerId}`);
});

dtriWorker.on('failed', (job, err) => {
  console.error(`❌ DTRI job failed: ${job?.id} for dealer: ${job?.data?.dealerId} — ${err.message}`);
});

dtriWorker.on('error', (err) => {
  console.error('❌ DTRI Worker error:', err);
});

console.log('🔄 DTRI Worker started and ready to process jobs');
