/**
 * Direct Schema Deployment to Supabase
 * This script reads the SQL file and executes it directly
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 DealershipAI Schema Deployment\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deploySchema() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'dealershipai-enterprise/supabase-schema.sql');
    console.log('📄 Reading schema from:', schemaPath);

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file read successfully (' + schema.split('\n').length + ' lines)\n');

    console.log('⚠️  NOTE: This script cannot execute raw SQL directly.');
    console.log('   Supabase client requires using the REST API or RPC calls.\n');

    console.log('📋 Please deploy the schema manually:');
    console.log('   1. Open: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new');
    console.log('   2. The schema is already in your clipboard');
    console.log('   3. Paste and click RUN\n');

    console.log('🔍 Checking if tables already exist...\n');

    // Check for existing tables
    const tables = ['tenants', 'users', 'dealership_data', 'ai_query_results'];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: Not found (${error.message})`);
      } else {
        console.log(`   ✅ ${table}: Exists`);
      }
    }

    console.log('\n💡 If tables are missing, deploy the schema in Supabase SQL editor.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deploySchema();
