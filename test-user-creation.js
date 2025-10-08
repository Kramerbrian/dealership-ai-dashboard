/**
 * Test User Creation After Sign-Up
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function test() {
  console.log('🔍 Checking for recently created users...\n');

  // Get most recent users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️  No users found in database');
    console.log('   After completing sign-up, run this script again to verify user creation.\n');
    return;
  }

  console.log(`✅ Found ${users.length} recent user(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. User: ${user.email || user.clerk_user_id}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Clerk ID: ${user.clerk_user_id}`);
    console.log(`   Tenant ID: ${user.tenant_id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log('');
  });

  // Get tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!tenantsError && tenants && tenants.length > 0) {
    console.log(`✅ Found ${tenants.length} recent tenant(s):\n`);
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. Tenant: ${tenant.name}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Type: ${tenant.type}`);
      console.log(`   Tier: ${tenant.subscription_tier}`);
      console.log(`   Status: ${tenant.subscription_status}`);
      console.log(`   Created: ${new Date(tenant.created_at).toLocaleString()}`);
      console.log('');
    });
  }

  console.log('✅ Test completed\n');
  console.log('💡 To test the sign-up flow:');
  console.log('   1. Open http://localhost:3001/pricing.html');
  console.log('   2. Click "Get Started Free"');
  console.log('   3. Complete sign-up with a test email');
  console.log('   4. Run: node test-user-creation.js');
}

test();
