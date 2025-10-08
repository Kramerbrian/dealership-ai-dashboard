# Stripe Webhook Setup Guide

## Step 1: Create Webhook Endpoint in Stripe

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   ```
   https://dealershipai-enterprise-6m0culy9w-brian-kramers-projects.vercel.app/api/webhooks/stripe
   ```

## Step 2: Select Events to Listen For

Select these events:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`
- ✅ `checkout.session.completed`

## Step 3: Get Webhook Signing Secret

After creating the endpoint:
1. Click on the webhook endpoint
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

## Step 4: Add to Vercel

```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise

# Add webhook secret
echo "YOUR_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production
echo "YOUR_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET preview
echo "YOUR_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET development

# Redeploy
vercel --prod
```

## Step 5: Test Webhook

```bash
# Send test event from Stripe Dashboard
# Or use Stripe CLI
stripe trigger customer.subscription.created
```

## Webhook Handler Location

The webhook handler is at:
`/Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise/app/api/webhooks/stripe/route.ts`

## What the Webhook Does

- Creates/updates tenant subscription status
- Updates MRR (Monthly Recurring Revenue)
- Sends notifications on payment failures
- Logs all subscription events

## Troubleshooting

**Webhook failing?**
- Check Vercel logs: `vercel logs --follow`
- Verify STRIPE_WEBHOOK_SECRET is set
- Check webhook signature validation

**Events not processing?**
- Verify database connection
- Check tenant exists in database
- Review audit logs table
