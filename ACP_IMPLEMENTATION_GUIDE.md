# Agentic Commerce Protocol (ACP) Implementation Guide

## Overview

This guide covers the complete implementation of the Agentic Commerce Protocol (ACP) in your DealershipAI Dashboard. The ACP enables conversational commerce with secure tokenized payments, real-time analytics, and seamless checkout experiences.

## 🎯 What's Included

### 1. **RESTful ACP Endpoints**
- `POST /api/acp-checkout/checkout_sessions` - Initiate checkout session
- `POST /api/acp-checkout/checkout_sessions/:id` - Update session details
- `POST /api/acp-checkout/checkout_sessions/:id/complete` - Complete payment
- `GET /api/acp-checkout/checkout_sessions/:id` - Get session status

### 2. **Conversational UI**
- Interactive chat interface for product browsing
- Real-time cart updates
- Product cards with features and pricing
- Secure Stripe payment integration
- Mobile-responsive design

### 3. **Database Schema**
- Checkout sessions tracking
- Order management
- Product catalog
- Conversation history
- Analytics and error logging

### 4. **Monitoring & Analytics**
- Funnel conversion tracking
- Error monitoring
- Performance metrics
- A/B testing support
- Health checks

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database (Supabase)
- Stripe account
- Valid SSL certificate (for production)

## 🚀 Installation Steps

### Step 1: Database Setup

1. **Run the main schema:**
```bash
# In Supabase SQL Editor, run:
cat lib/acp-database-schema.sql
```

This creates:
- `acp_checkout_sessions` - Session management
- `orders` - Completed orders
- `products` - Product catalog
- `product_variants` - Product variations
- `conversation_messages` - Chat history

2. **Run the monitoring schema:**
```bash
# In Supabase SQL Editor, run:
cat lib/acp-monitoring-schema.sql
```

This creates:
- `acp_analytics_events` - Event tracking
- `acp_error_logs` - Error logging
- `critical_alerts` - System alerts
- `acp_performance_metrics` - Performance data
- `acp_ab_tests` - A/B testing

### Step 2: Environment Configuration

Add these variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Application URLs
NEXT_PUBLIC_URL=https://yourdomain.com
```

### Step 3: Stripe Product Setup

1. **Create Products in Stripe Dashboard:**

```bash
# Pro Tier
stripe products create \
  --name "DealershipAI Pro Tier" \
  --description "Complete AI visibility platform"

# Create recurring price
stripe prices create \
  --product prod_xxx \
  --unit-amount 59900 \
  --currency usd \
  --recurring[interval]=month
```

2. **Update Product IDs:**
Edit `lib/stripe.js` with your Stripe price IDs:

```javascript
const STRIPE_PLANS = {
  pro: {
    monthly: 'price_YOUR_PRO_PRICE_ID',
  },
  premium: {
    monthly: 'price_YOUR_PREMIUM_PRICE_ID',
  }
};
```

### Step 4: Update Frontend Stripe Key

Edit `acp-chat-interface.html`:

```javascript
// Line 316
const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY'); // Replace with your publishable key
```

### Step 5: Install Dependencies

```bash
npm install
```

All required packages are already in `package.json`:
- `stripe` - Payment processing
- `express` - API server
- `@supabase/supabase-js` - Database client

### Step 6: Start the Server

```bash
# Development
npm run dev

# Or if using the API server directly
node api-server.js
```

## 🔧 API Usage

### Creating a Checkout Session

```javascript
const response = await fetch('/api/acp-checkout/checkout_sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    buyer: {
      email: 'customer@example.com',
      name: 'John Doe',
      phone: '+1234567890'
    },
    items: [
      {
        product_id: 'pro',
        quantity: 1
      }
    ],
    metadata: {
      dealership_name: 'ABC Motors',
      source: 'website'
    }
  })
});

const session = await response.json();
console.log('Session ID:', session.session_id);
```

### Updating a Session

```javascript
const response = await fetch(`/api/acp-checkout/checkout_sessions/${sessionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shipping: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US'
    }
  })
});
```

### Completing Payment

```javascript
// First, create payment method with Stripe.js
const { paymentMethod, error } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
  billing_details: {
    name: 'John Doe',
    email: 'customer@example.com'
  }
});

// Then complete the checkout
const response = await fetch(`/api/acp-checkout/checkout_sessions/${sessionId}/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_token: paymentMethod.id,
    payment_method: 'card'
  })
});

const result = await response.json();
console.log('Order ID:', result.order_id);
```

## 🎨 Frontend Integration

### Option 1: Use the Conversational UI

Access the pre-built chat interface:
```
http://localhost:3001/acp-chat-interface.html
```

### Option 2: Embed in Your Site

```html
<iframe
  src="https://yourdomain.com/acp-chat-interface.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="payment"
></iframe>
```

### Option 3: Custom Integration

Use the API endpoints to build your own UI. See [API Usage](#api-usage) section.

## 📊 Monitoring & Analytics

### View Conversion Metrics

```javascript
const acpMonitor = require('./lib/acp-monitoring');

// Get conversion rate for last 24 hours
const now = new Date();
const yesterday = new Date(now - 24 * 60 * 60 * 1000);

const metrics = await acpMonitor.getConversionRate(
  yesterday.toISOString(),
  now.toISOString()
);

console.log('Conversion Rate:', metrics.conversion_rate + '%');
```

### Query Analytics in SQL

```sql
-- Daily conversion rates
SELECT * FROM daily_conversion_metrics
ORDER BY date DESC
LIMIT 30;

-- Funnel analysis
SELECT * FROM get_funnel_conversion_rates(
  NOW() - INTERVAL '7 days',
  NOW()
);

-- Top errors
SELECT * FROM get_top_errors(
  NOW() - INTERVAL '24 hours',
  NOW(),
  10
);

-- Active sessions
SELECT * FROM active_sessions_monitor;
```

### Health Check Endpoint

```javascript
// Add to api-server.js
app.get('/api/acp-checkout/health', async (req, res) => {
  const acpMonitor = require('./lib/acp-monitoring');
  const health = await acpMonitor.healthCheck();
  res.json(health);
});
```

## 🔐 Security Best Practices

### 1. **HTTPS Only**
Always use HTTPS in production. Update CSP headers:

```javascript
// In api-server.js
const csp = [
  "default-src 'self'",
  "script-src 'self' https://js.stripe.com",
  "frame-src 'self' https://js.stripe.com",
  "connect-src 'self' https://api.stripe.com",
].join('; ');
```

### 2. **Rate Limiting**
The ACP endpoints include built-in rate limiting (10 requests/minute). Adjust in `api/acp-checkout.js`:

```javascript
const checkRateLimit = (identifier, maxRequests = 10, windowMs = 60000)
```

For production, use Redis-backed rate limiting:

```bash
npm install express-rate-limit redis
```

### 3. **Payment Token Security**
- Never log payment tokens
- Use Stripe's tokenization
- Implement PCI DSS compliance
- Enable 3D Secure authentication

### 4. **Data Encryption**
Sensitive data is encrypted at rest in Supabase. Enable additional encryption for:
- Customer PII
- Payment metadata
- Shipping addresses

### 5. **Session Security**
- Sessions expire after 24 hours
- Use secure session IDs (crypto.randomBytes)
- Validate session ownership
- Implement CSRF protection

## 🧪 Testing

### Test Checkout Flow

```bash
# Use Stripe test cards
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# Authentication required: 4000 0027 6000 3184
```

### Run Health Checks

```javascript
const acpMonitor = require('./lib/acp-monitoring');

async function runTests() {
  const health = await acpMonitor.healthCheck();
  console.log('System Health:', health);

  const metrics = await acpMonitor.getMetrics();
  console.log('Metrics:', metrics);
}

runTests();
```

### Monitor Error Rates

```sql
-- Check error rates in last hour
SELECT
  date_trunc('minute', timestamp) as minute,
  COUNT(*) as errors
FROM acp_error_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY date_trunc('minute', timestamp)
ORDER BY minute DESC;
```

## 📈 Performance Optimization

### 1. **Database Indexing**
All critical columns are indexed. Monitor query performance:

```sql
-- Enable query performance insights
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%acp_checkout_sessions%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 2. **Caching**
Implement Redis caching for:
- Product catalog
- Session data (already in-memory)
- Analytics aggregates

```bash
npm install redis
```

### 3. **CDN Integration**
Serve static assets via CDN:
- Product images
- Chat interface assets
- JavaScript bundles

### 4. **Connection Pooling**
Supabase handles this automatically, but monitor:

```javascript
// Check active connections
const { data } = await supabaseAdmin
  .rpc('pg_stat_activity_count');
```

## 🚨 Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `SESSION_NOT_FOUND` | Session doesn't exist | Check session ID |
| `SESSION_EXPIRED` | Session past 24h | Create new session |
| `INVALID_PAYMENT_TOKEN` | Bad Stripe token | Regenerate payment method |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `PAYMENT_FAILED` | Payment declined | Use different card |

### Error Recovery

```javascript
// Implement retry logic
async function completeCheckout(sessionId, paymentToken, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`/api/acp-checkout/checkout_sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_token: paymentToken })
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 429) {
        // Rate limited - wait exponentially
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }

      throw new Error(await response.text());
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

## 🔄 Webhook Integration

Handle Stripe webhooks for subscription events:

```javascript
// In api/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## 📱 Mobile Integration

The conversational UI is mobile-responsive. For native apps:

### React Native

```javascript
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://yourdomain.com/acp-chat-interface.html' }}
  onMessage={(event) => {
    // Handle messages from WebView
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'checkout_complete') {
      // Navigate to success screen
    }
  }}
/>
```

### iOS/Android Native

Use API endpoints directly with native HTTP clients.

## 🌍 Internationalization

### Currency Support

Update products table:
```sql
UPDATE products
SET currency = 'EUR', price = 499.00
WHERE product_id = 'pro';
```

### Multi-language

Add translations to conversation UI:

```javascript
const translations = {
  en: {
    welcome: "Hi! I'm your shopping assistant.",
    add_to_cart: "Add to Cart"
  },
  es: {
    welcome: "¡Hola! Soy tu asistente de compras.",
    add_to_cart: "Añadir al Carrito"
  }
};
```

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Documentation](https://supabase.com/docs)
- [ACP Specification](https://github.com/agentic-commerce-protocol) *(hypothetical)*
- [PCI DSS Compliance Guide](https://www.pcisecuritystandards.org/)

## 🆘 Support & Troubleshooting

### Common Issues

**Issue:** "Session not found"
```javascript
// Solution: Check session expiry
const session = await supabaseAdmin
  .from('acp_checkout_sessions')
  .select('expires_at')
  .eq('session_id', sessionId)
  .single();

if (new Date(session.expires_at) < new Date()) {
  console.log('Session expired - create new one');
}
```

**Issue:** "Payment fails silently"
```javascript
// Solution: Check Stripe logs
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
console.log('Failure reason:', paymentIntent.last_payment_error);
```

**Issue:** "High error rates"
```sql
-- Check error distribution
SELECT code, COUNT(*) as count
FROM acp_error_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY code
ORDER BY count DESC;
```

## 🎉 Next Steps

1. **Deploy to Production**
   - Set up production Stripe account
   - Configure production database
   - Enable monitoring alerts
   - Set up backup strategy

2. **Customize UI**
   - Match your brand colors
   - Add custom product images
   - Implement advanced chat AI (Claude, GPT-4)

3. **Optimize Conversions**
   - A/B test checkout flows
   - Add upsell recommendations
   - Implement cart abandonment emails

4. **Scale Infrastructure**
   - Add Redis caching
   - Implement CDN
   - Set up load balancing
   - Enable auto-scaling

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained by:** DealershipAI Team
