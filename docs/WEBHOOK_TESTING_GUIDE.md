# Webhook Testing Guide

## Prerequisites

1. **Start Next.js dev server:**
   ```bash
   npm run dev
   ```
   Wait for: `✓ Ready in X seconds ○ Local: http://localhost:3000`

2. **Set Stripe env vars in `.env.local`:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Testing Methods

### Method 1: Direct Test Script (Recommended)

```bash
tsx scripts/test-webhook-direct.ts
```

This script:
- Creates a properly formatted Stripe event
- Generates a valid signature
- Sends it to `/api/billing/webhook`
- Shows the response

### Method 2: Stripe CLI

1. **Start webhook listener:**
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```
   Copy the `whsec_...` secret and add to `.env.local`

2. **Trigger test event:**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Method 3: Manual curl (for debugging)

```bash
curl -X POST http://localhost:3000/api/billing/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1234567890,v1=test" \
  -d '{"type":"checkout.session.completed","data":{"object":{"metadata":{"tenantId":"test-tenant-123","plan":"pro"}}}}'
```

**Note:** This will fail signature verification unless you use a proper signature.

## Expected Behavior

### Success Response
```json
{"received": true}
```

### Error Responses

**Missing signature:**
```json
{"error": "no signature"}
```

**Invalid signature:**
```json
{"error": "Webhook error: No signatures found matching the expected signature"}
```

**Missing tenantId:**
- Returns `{"received": true}` but doesn't store plan

## Verify Plan Storage

After successful webhook, check Supabase:

```sql
SELECT * FROM integrations 
WHERE tenant_id = 'test-tenant-123' 
AND kind = 'billing';
```

Expected result:
```json
{
  "tenant_id": "test-tenant-123",
  "kind": "billing",
  "metadata": {
    "plan": "pro",
    "stripe_customer": "cus_test_123",
    "subscription": "sub_test_123"
  }
}
```

## Troubleshooting

**Server not responding:**
- Make sure `npm run dev` is running
- Check port 3000 is not in use: `lsof -i :3000`

**Signature verification fails:**
- Ensure `STRIPE_WEBHOOK_SECRET` matches the one from `stripe listen`
- Or use the test script which generates proper signatures

**Plan not stored:**
- Check webhook logs in Next.js console
- Verify `tenantId` is in session metadata
- Check Supabase connection and `upsertIntegration` function

## Next Steps

Once webhook is working:
1. Test full checkout flow: `tsx scripts/test-checkout-flow.ts`
2. Complete a real Stripe checkout
3. Verify plan is stored and UI updates

