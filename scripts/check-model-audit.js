#!/usr/bin/env node

/**
 * Model Audit Checker
 * Queries the model_audit table to check HyperAIV optimizer runs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkModelAudit() {
  try {
    console.log('🔍 Checking model audit table...\n');

    // Execute the SQL query
    const { data, error } = await supabase
      .from('model_audit')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error querying model_audit:', error);
      
      // Check if table exists
      console.log('\n🔍 Checking if model_audit table exists...');
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%audit%');

      if (tableError) {
        console.error('❌ Error checking tables:', tableError);
      } else {
        console.log('📋 Available audit-related tables:', tables);
      }
      
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 No model audit records found.');
      console.log('💡 This means the HyperAIV optimizer hasn\'t run yet.');
      console.log('🚀 Run: npm run hyperaiv:optimize');
      return;
    }

    console.log('📊 Model Audit Results (Last 5 Runs):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    data.forEach((record, index) => {
      console.log(`\n${index + 1}. Run Date: ${record.run_date}`);
      console.log(`   Dealer ID: ${record.dealer_id || 'N/A'}`);
      console.log(`   Status: ${record.status || 'N/A'}`);
      console.log(`   Accuracy Gain: ${record.accuracy_gain_percent || 'N/A'}%`);
      console.log(`   ROI Gain: ${record.roi_gain_percent || 'N/A'}%`);
      console.log(`   Ad Efficiency: ${record.ad_efficiency_gain_percent || 'N/A'}%`);
      console.log(`   Model Version: ${record.model_version || 'N/A'}`);
      
      if (record.error_message) {
        console.log(`   ❌ Error: ${record.error_message}`);
      }
      
      if (record.weights_updated) {
        console.log(`   ✅ Weights Updated: ${record.weights_updated}`);
      }
    });

    // Summary statistics
    const successfulRuns = data.filter(r => r.status === 'success').length;
    const avgAccuracyGain = data
      .filter(r => r.accuracy_gain_percent)
      .reduce((sum, r) => sum + r.accuracy_gain_percent, 0) / data.length;

    console.log('\n📈 Summary:');
    console.log(`   Total Runs: ${data.length}`);
    console.log(`   Successful: ${successfulRuns}`);
    console.log(`   Success Rate: ${((successfulRuns / data.length) * 100).toFixed(1)}%`);
    console.log(`   Avg Accuracy Gain: ${avgAccuracyGain.toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Execute the query
if (require.main === module) {
  checkModelAudit();
}

module.exports = { checkModelAudit };
