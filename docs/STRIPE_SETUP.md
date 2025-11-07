# Stripe Checkout Flow Setup

## Quick Start

1. **Add env vars** (see `docs/ENV_SETUP.md`)
2. **Test checkout flow**: `tsx scripts/test-checkout-flow.ts`
3. **Configure webhook** in Stripe Dashboard

## Flow Overview

```
User clicks "Upgrade" 
  → POST /api/billing/checkout
  → Stripe Checkout Session
  → User completes payment
  → Stripe webhook → POST /api/billing/webhook
  → Plan stored in integrations table
  → User redirected to /drive?billing=success
```

## Testing Locally

### 1. Start local server
```bash
npm run dev
```

### 2. Use Stripe CLI for webhooks
```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

### 3. Test checkout
```bash
tsx scripts/test-checkout-flow.ts
```

### 4. Use test card
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## Webhook Events Handled

- `checkout.session.completed` → Store plan in `integrations` table
- `customer.subscription.updated` → Update plan status
- `invoice.payment_failed` → Handle failed payments

## Verifying Plan Storage

Query Supabase:
```sql
SELECT * FROM integrations 
WHERE tenant_id = 'your-tenant-id' 
AND kind = 'billing';
```

Expected result:
```json
{
  "metadata": {
    "plan": "pro",
    "stripe_customer": "cus_...",
    "subscription": "sub_..."
  }
}
```

## Troubleshooting

**Webhook not receiving events:**
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Verify webhook URL is accessible
- Check Stripe Dashboard → Webhooks → Recent events

**Plan not updating:**
- Check webhook logs in Stripe Dashboard
- Verify `tenantId` in checkout session metadata
- Check Supabase `integrations` table

