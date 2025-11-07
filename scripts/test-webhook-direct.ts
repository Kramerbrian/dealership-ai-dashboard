/**
 * Test Webhook Directly
 * 
 * Sends a test checkout.session.completed event directly to the webhook endpoint
 * This bypasses Stripe CLI and lets us test with custom metadata
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

// Load env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Create a test checkout session event
const testEvent = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Date.now(),
      object: 'checkout.session',
      metadata: {
        tenantId: 'test-tenant-123',
        plan: 'pro'
      },
      customer: 'cus_test_123',
      subscription: 'sub_test_123',
      mode: 'subscription',
      status: 'complete'
    }
  }
};

// Create Stripe signature
function createSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

async function testWebhook() {
  console.log('🧪 Testing Webhook Directly\n');
  console.log('Event:', JSON.stringify(testEvent, null, 2));
  console.log('');

  const payload = JSON.stringify(testEvent);
  const signature = createSignature(payload, WEBHOOK_SECRET);

  try {
    const response = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature
      },
      body: payload
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully!');
      console.log('Response:', result);
      console.log('');
      console.log('📝 Next: Check Supabase:');
      console.log(`   SELECT * FROM integrations WHERE tenant_id = 'test-tenant-123' AND kind = 'billing';`);
    } else {
      console.error('❌ Webhook failed:', response.status, result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWebhook();

