/**
 * Test Full Enterprise Schema
 * Verifies all 9 tables exist and have data
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testFullSchema() {
  console.log('🔍 Testing Full Enterprise Schema\n');

  const tables = [
    'tenants',
    'users',
    'dealership_data',
    'ai_query_results',
    'audit_logs',
    'api_keys',
    'notification_settings',
    'reviews',
    'review_templates'
  ];

  let successCount = 0;
  let failCount = 0;

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ ${table}: ${count || 0} rows`);
        successCount++;
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount}/${tables.length} tables working`);

  if (failCount === 0) {
    console.log('🎉 All tables deployed successfully!');
  } else {
    console.log(`⚠️  ${failCount} table(s) missing or inaccessible`);
    console.log('\nIf tables are missing, deploy the full schema:');
    console.log('1. pbcopy < dealershipai-enterprise/supabase-schema.sql');
    console.log('2. Open: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new');
    console.log('3. Paste and click RUN');
  }
}

testFullSchema();
