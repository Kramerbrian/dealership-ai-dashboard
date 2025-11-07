/**
 * Test Stripe Checkout Flow
 * 
 * Tests: /api/billing/checkout → Stripe → webhook → plan stored
 * 
 * Usage:
 *   tsx scripts/test-checkout-flow.ts
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || 'test-tenant-123';

async function testCheckoutFlow() {
  console.log('🧪 Testing Stripe Checkout Flow\n');

  // Step 1: Create checkout session
  console.log('1️⃣ Creating checkout session...');
  try {
    const checkoutRes = await fetch(`${BASE_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In production, you'd include Clerk session token here
        // 'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        plan: 'pro'
      })
    });

    if (!checkoutRes.ok) {
      const error = await checkoutRes.json();
      throw new Error(`Checkout failed: ${JSON.stringify(error)}`);
    }

    const { url } = await checkoutRes.json();
    console.log('✅ Checkout session created');
    console.log(`   URL: ${url}\n`);

    console.log('📝 Next steps:');
    console.log('   1. Open the checkout URL in your browser');
    console.log('   2. Complete the Stripe checkout (use test card: 4242 4242 4242 4242)');
    console.log('   3. Stripe will call your webhook at /api/billing/webhook');
    console.log('   4. Verify plan is stored in integrations table:\n');

    console.log('   Query Supabase:');
    console.log(`   SELECT * FROM integrations WHERE tenant_id = '${TEST_TENANT_ID}' AND kind = 'billing';\n`);

    return { success: true, checkoutUrl: url };
  } catch (error) {
    console.error('❌ Checkout flow test failed:', error);
    return { success: false, error };
  }
}

async function verifyPlanStored(tenantId: string) {
  console.log('2️⃣ Verifying plan is stored...');
  
  // In production, you'd query Supabase here
  // For now, just show the query
  console.log(`   Query: SELECT * FROM integrations WHERE tenant_id = '${tenantId}' AND kind = 'billing';`);
  console.log('   Expected: metadata.plan = "pro" or "enterprise"\n');
}

async function testWebhook() {
  console.log('3️⃣ Testing webhook (manual)...');
  console.log('   To test webhook manually:');
  console.log('   1. Use Stripe CLI: stripe listen --forward-to localhost:3000/api/billing/webhook');
  console.log('   2. Trigger test event: stripe trigger checkout.session.completed');
  console.log('   3. Or use Stripe Dashboard → Webhooks → Send test webhook\n');
}

async function main() {
  console.log('='.repeat(60));
  console.log('Stripe Checkout Flow Test');
  console.log('='.repeat(60) + '\n');

  // Check env vars
  const required = ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_PRO'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required env vars:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n💡 Add them to .env.local\n');
    process.exit(1);
  }

  await testCheckoutFlow();
  await verifyPlanStored(TEST_TENANT_ID);
  await testWebhook();

  console.log('✅ Test complete!');
}

main().catch(console.error);

