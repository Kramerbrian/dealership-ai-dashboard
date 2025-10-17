/**
 * Sample AI Answer Intelligence Data Ingestion Script
 * 
 * This script generates and ingests sample AI answer event data for testing
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sample queries that might trigger AI answers
const SAMPLE_QUERIES = [
  'best car dealership near me',
  'Toyota dealership reviews',
  'new car financing options',
  'used car prices 2024',
  'car maintenance tips',
  'auto insurance quotes',
  'car loan calculator',
  'vehicle inspection requirements',
  'car warranty coverage',
  'electric vehicle charging stations'
];

const ENGINES = ['google_sge', 'perplexity', 'gemini', 'chatgpt', 'copilot', 'claude'];

interface SampleEvent {
  tenant_id: string;
  engine: string;
  query: string;
  appeared: boolean;
  cited: boolean;
  clicks_est?: number;
  sample_size: number;
}

function generateSampleEvent(tenantId: string): SampleEvent {
  const engine = ENGINES[Math.floor(Math.random() * ENGINES.length)];
  const query = SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)];
  
  // 60% chance of AI answer appearing
  const appeared = Math.random() < 0.6;
  
  // If appeared, 40% chance of citing the dealer
  const cited = appeared && Math.random() < 0.4;
  
  // Random click estimate if appeared
  const clicksEst = appeared ? Math.random() * 50 + 10 : undefined;
  
  return {
    tenant_id: tenantId,
    engine,
    query,
    appeared,
    cited,
    clicks_est: clicksEst,
    sample_size: 1
  };
}

export async function ingestSampleAiData(tenantId: string = 'demo-tenant-id', count: number = 100) {
  console.log(`Ingesting ${count} sample AI answer events for tenant: ${tenantId}`);
  
  const events: SampleEvent[] = [];
  
  // Generate sample events
  for (let i = 0; i < count; i++) {
    events.push(generateSampleEvent(tenantId));
  }
  
  try {
    // Insert events in batches
    const batchSize = 10;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('ai_answer_events')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(events.length / batchSize)}`);
    }
    
    console.log(`Successfully ingested ${count} sample AI answer events`);
    
    // Refresh materialized view
    try {
      await supabase.rpc('refresh_ai_zero_click_impact_mv');
      console.log('Materialized view refreshed successfully');
    } catch (mvError) {
      console.warn('Failed to refresh materialized view:', mvError);
    }
    
    return { success: true, count };
    
  } catch (error) {
    console.error('Error ingesting sample AI data:', error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const tenantId = process.argv[2] || 'demo-tenant-id';
  const count = parseInt(process.argv[3]) || 100;
  
  ingestSampleAiData(tenantId, count)
    .then((result) => {
      console.log('Sample data ingestion completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample data ingestion failed:', error);
      process.exit(1);
    });
}
