import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log('🧠 Starting ADA Training Sync...');
  
  try {
    // Fetch current benchmark data
    const { data: bench, error: benchError } = await supabase
      .from('ncm_benchmarks')
      .select('*');
    
    if (benchError) {
      console.error('❌ Error fetching benchmarks:', benchError);
      return;
    }
    
    if (!bench || bench.length === 0) {
      console.error('❌ No benchmarks available for training');
      return;
    }
    
    console.log(`📊 Retrieved ${bench.length} benchmark metrics`);
    
    // Check for previous training data
    const { data: prev, error: prevError } = await supabase
      .from('ada_training_buffer')
      .select('*')
      .eq('trained', false);
    
    if (prevError) {
      console.error('❌ Error fetching previous training data:', prevError);
      return;
    }
    
    const previousCount = prev?.length || 0;
    const delta = bench.length - previousCount;
    
    console.log(`📈 Training delta: ${delta} new metrics`);
    
    // Prepare training payload
    const payload = {
      benchmarks: bench,
      delta: delta,
      training_timestamp: new Date().toISOString(),
      source: 'ncm_benchmarks_sync'
    };
    
    // Store training payload in buffer
    const { error: insertError } = await supabase
      .from('ada_training_buffer')
      .insert({
        source: 'ncm_benchmarks',
        payload: payload,
        trained: false
      });
    
    if (insertError) {
      console.error('❌ Error storing training payload:', insertError);
      return;
    }
    
    console.log('📦 Training payload queued, pushing to ADA engine...');
    
    // Send training data to ADA engine
    const adaResponse = await fetch(process.env.ADA_ENGINE_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!adaResponse.ok) {
      throw new Error(`ADA engine training failed: ${adaResponse.statusText}`);
    }
    
    const adaResult = await adaResponse.json();
    console.log('✅ ADA engine training response:', adaResult);
    
    // Mark training data as trained
    const { error: updateError } = await supabase
      .from('ada_training_buffer')
      .update({ 
        trained: true,
        training_timestamp: new Date().toISOString()
      })
      .match({ source: 'ncm_benchmarks' });
    
    if (updateError) {
      console.error('❌ Error updating training status:', updateError);
      return;
    }
    
    // Log training sync to audit trail
    await supabase.from('dtri_audit_log').insert({
      dealer_id: 'system',
      job_type: 'ada_training_sync',
      results: {
        benchmarks_processed: bench.length,
        training_delta: delta,
        ada_engine_response: adaResult,
        training_timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });
    
    console.log('✅ ADA training sync complete.');
    console.log(`📊 Processed ${bench.length} benchmarks with ${delta} new metrics`);
    
  } catch (error) {
    console.error('❌ ADA Training Sync failed:', error);
    
    // Log the error to audit trail
    await supabase.from('dtri_audit_log').insert({
      dealer_id: 'system',
      job_type: 'ada_training_sync_error',
      results: {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });
  }
})();
