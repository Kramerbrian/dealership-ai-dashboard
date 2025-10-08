/**
 * Simple Database Query Test
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function test() {
  console.log('🔍 Testing Database Tables\n');

  // Test tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('*')
    .limit(5);

  if (tenantsError) {
    console.log('❌ tenants:', tenantsError.message);
  } else {
    console.log('✅ tenants:', tenants.length, 'rows');
    if (tenants.length > 0) {
      console.log('   Sample:', tenants[0].name);
    }
  }

  // Test users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(5);

  if (usersError) {
    console.log('❌ users:', usersError.message);
  } else {
    console.log('✅ users:', users.length, 'rows');
  }

  // Test dealership_data
  const { data: dealerships, error: dealershipsError } = await supabase
    .from('dealership_data')
    .select('*')
    .limit(5);

  if (dealershipsError) {
    console.log('❌ dealership_data:', dealershipsError.message);
  } else {
    console.log('✅ dealership_data:', dealerships.length, 'rows');
  }

  console.log('\n✅ Test completed');
}

test();
