# 💳 Stripe CLI Setup Guide

## Install Stripe CLI

### Option 1: Direct Download (Recommended)
1. Go to [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Download the appropriate version for your OS
3. Extract and add to your PATH

### Option 2: Using Package Managers

#### macOS (with Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

#### Windows (with Chocolatey)
```bash
choco install stripe-cli
```

#### Linux (with Snap)
```bash
sudo snap install stripe
```

## Login to Stripe CLI
```bash
stripe login
```

## Test Stripe CLI
```bash
stripe --version
stripe config --list
```

## Stripe CLI Commands for DealershipAI

### 1. Listen to Webhooks (Development)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Test Webhook Events
```bash
# Test checkout.session.completed
stripe trigger checkout.session.completed

# Test customer.subscription.updated
stripe trigger customer.subscription.updated

# Test customer.subscription.deleted
stripe trigger customer.subscription.deleted
```

### 3. Create Test Products and Prices
```bash
# Create PRO product
stripe products create --name "DealershipAI Pro" --description "Professional AI visibility tracking"

# Create ENTERPRISE product
stripe products create --name "DealershipAI Enterprise" --description "Enterprise AI visibility tracking"

# Create prices (replace product IDs)
stripe prices create --product prod_xxx --unit-amount 9900 --currency usd --recurring interval=month
stripe prices create --product prod_yyy --unit-amount 29900 --currency usd --recurring interval=month
```

### 4. Test Checkout Sessions
```bash
# Create test checkout session
stripe checkout sessions create \
  --success-url "https://your-domain.com/dashboard?success=true" \
  --cancel-url "https://your-domain.com/pricing?canceled=true" \
  --line-items '[{"price": "price_xxx", "quantity": 1}]' \
  --mode subscription
```

## Webhook Testing
```bash
# Start webhook listener
stripe listen --forward-to https://your-domain.com/api/stripe/webhook

# In another terminal, trigger events
stripe trigger checkout.session.completed
```

## Production Webhook Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to Vercel environment variables

## Useful Commands
```bash
# List all products
stripe products list

# List all prices
stripe prices list

# List customers
stripe customers list

# List subscriptions
stripe subscriptions list

# Get webhook endpoint details
stripe webhook_endpoints list
```

## Testing Your Integration
```bash
# Test the complete flow
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```
