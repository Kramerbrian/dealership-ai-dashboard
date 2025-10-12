import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log('📊 Fetching NCM Group 20 benchmark data...');
  
  try {
    const res = await fetch(process.env.NCM_BENCHMARK_URL!)
      .then(r => r.json())
      .catch(() => []);
    
    if (!Array.isArray(res)) {
      return console.error('❌ No benchmark data received');
    }
    
    console.log(`📈 Received ${res.length} benchmark metrics from NCM Group 20`);
    
    // Upsert benchmark data to Supabase
    const { error } = await supabase
      .from('ncm_benchmarks')
      .upsert(res, { onConflict: 'metric_id' });
    
    if (error) {
      console.error('❌ Error syncing benchmarks to Supabase:', error);
      return;
    }
    
    console.log(`✅ Synced ${res.length} benchmark metrics.`);
    
    // Log the sync operation
    await supabase.from('dtri_audit_log').insert({
      dealer_id: 'system',
      job_type: 'ncm_benchmark_sync',
      results: { 
        metrics_count: res.length,
        sync_timestamp: new Date().toISOString(),
        source: 'NCM Group 20 API'
      },
      created_at: new Date().toISOString()
    });
    
    console.log('📝 Benchmark sync logged to audit trail');
    
  } catch (error) {
    console.error('❌ NCM Benchmark sync failed:', error);
    
    // Log the error
    await supabase.from('dtri_audit_log').insert({
      dealer_id: 'system',
      job_type: 'ncm_benchmark_sync_error',
      results: { 
        error: error.message,
        sync_timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });
  }
})();
