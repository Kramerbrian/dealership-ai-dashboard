/**
 * Test database with RLS bypass using service role
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Database with Service Role (RLS bypass)\n');
console.log('URL:', supabaseUrl);
console.log('Service Key:', serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'NOT SET');
console.log('');

// Create client with service role and explicit schema
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'apikey': serviceRoleKey
    }
  }
});

async function test() {
  console.log('Testing tables:\n');

  // Test 1: List all tables using information_schema
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      console.log('Cannot query information_schema:', error.message);
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name).join(', '));
      console.log('');
    }
  } catch (e) {
    console.log('Error querying tables:', e.message);
  }

  // Test 2: Query each table
  const testTables = ['tenants', 'users', 'dealership_data'];

  for (const table of testTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`❌ ${table}:`, error.message);
        console.log('   Error code:', error.code);
        console.log('   Details:', error.details);
      } else {
        console.log(`✅ ${table}: ${count || 0} rows`);
        if (data && data.length > 0) {
          const firstRow = data[0];
          const keys = Object.keys(firstRow).slice(0, 3);
          console.log(`   Sample fields: ${keys.join(', ')}`);
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  console.log('\n✅ Test completed');
}

test();
