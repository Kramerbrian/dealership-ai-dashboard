/**
 * Simple Supabase Connection Test
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

// Show environment variables (masked)
console.log('Environment Variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...)' : '❌ NOT SET');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : '❌ NOT SET');
console.log('');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 Connecting to Supabase...');

    // Test 1: Check if we can query the tenants table
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (tenantsError) {
      console.log('⚠️  Tenants table query error:', tenantsError.message);
      console.log('   (This is expected if the schema hasn\'t been deployed yet)');
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('✅ Tenants table exists');
      console.log('   Found', tenants.length, 'tenant(s)');
      if (tenants.length > 0) {
        console.log('   Sample:', tenants[0].name);
      }
    }

    // Test 2: Check if we can query the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.log('⚠️  Users table query error:', usersError.message);
    } else {
      console.log('✅ Users table exists');
      console.log('   Found', users.length, 'user(s)');
    }

    console.log('\n✅ Database connection test completed!');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }
}

testConnection();
