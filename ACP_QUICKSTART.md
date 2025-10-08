# ACP Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Run the Setup Script

```bash
chmod +x setup-acp.sh
./setup-acp.sh
```

The script will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Install dependencies
- ✅ Verify environment configuration
- ✅ Guide you through Stripe setup
- ✅ Test the installation

### 2. Configure Environment

Edit `.env` and add your keys:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

### 3. Setup Database

Run these SQL files in [Supabase SQL Editor](https://app.supabase.com):

1. `lib/acp-database-schema.sql` - Main tables
2. `lib/acp-monitoring-schema.sql` - Analytics tables

### 4. Start the Server

```bash
npm run dev
# or
node api-server.js
```

### 5. Test It Out

Visit: **http://localhost:3001/acp-chat-interface.html**

## 📁 What Was Created

### Backend APIs
- ✅ `api/acp-checkout.js` - RESTful checkout endpoints
- ✅ `lib/acp-monitoring.js` - Analytics & error tracking
- ✅ `api-server.js` - Updated with ACP routes

### Frontend
- ✅ `acp-chat-interface.html` - Conversational shopping UI

### Database
- ✅ `lib/acp-database-schema.sql` - Core tables
- ✅ `lib/acp-monitoring-schema.sql` - Monitoring tables

### Documentation
- ✅ `ACP_IMPLEMENTATION_GUIDE.md` - Full documentation
- ✅ `ACP_QUICKSTART.md` - This file

## 🎯 API Endpoints

### Create Session
```bash
POST /api/acp-checkout/checkout_sessions
{
  "buyer": {"email": "user@example.com", "name": "John Doe"},
  "items": [{"product_id": "pro", "quantity": 1}]
}
```

### Update Session
```bash
POST /api/acp-checkout/checkout_sessions/:id
{
  "shipping": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

### Complete Checkout
```bash
POST /api/acp-checkout/checkout_sessions/:id/complete
{
  "payment_token": "pm_xxx",
  "payment_method": "card"
}
```

### Get Session
```bash
GET /api/acp-checkout/checkout_sessions/:id
```

## 🧪 Test with cURL

```bash
# Create a session
curl -X POST http://localhost:3001/api/acp-checkout/checkout_sessions \
  -H 'Content-Type: application/json' \
  -d '{
    "buyer": {
      "email": "test@example.com",
      "name": "Test User"
    },
    "items": [
      {
        "product_id": "pro",
        "quantity": 1
      }
    ]
  }'
```

## 📊 Monitoring

### Check System Health
```bash
curl http://localhost:3001/api/acp-checkout/health
```

### View Metrics
```javascript
const acpMonitor = require('./lib/acp-monitoring');
const metrics = await acpMonitor.getMetrics();
console.log(metrics);
```

### SQL Queries
```sql
-- Daily conversions
SELECT * FROM daily_conversion_metrics;

-- Active sessions
SELECT * FROM active_sessions_monitor;

-- Recent errors
SELECT * FROM recent_errors_summary;

-- Funnel analysis
SELECT * FROM get_funnel_conversion_rates(
  NOW() - INTERVAL '7 days',
  NOW()
);
```

## 🔧 Configuration

### Product Catalog

Edit `lib/stripe.js`:

```javascript
const PLAN_FEATURES = {
  pro: {
    name: 'Pro Tier',
    price: 599,
    features: [...]
  },
  premium: {
    name: 'Premium+ Tier',
    price: 999,
    features: [...]
  }
};
```

### Rate Limiting

Edit `api/acp-checkout.js`:

```javascript
// Line 48
const checkRateLimit = (identifier, maxRequests = 10, windowMs = 60000)
```

### Session Expiry

Edit SQL schema:

```sql
expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
```

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Configure Stripe webhooks
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts
- [ ] Implement CSP headers
- [ ] Add CSRF protection
- [ ] Enable 3D Secure
- [ ] Rotate API keys regularly

## 🌟 Features

### ✅ Conversational Commerce
- Interactive chat UI
- Product browsing
- Real-time cart updates
- Natural language processing ready

### ✅ Secure Payments
- Stripe integration
- Tokenized payments
- PCI DSS compliant
- 7-day free trial support

### ✅ Analytics & Monitoring
- Funnel tracking
- Conversion metrics
- Error logging
- Performance monitoring
- A/B testing support

### ✅ Complete Checkout Flow
1. Session creation with buyer info
2. Product selection & cart management
3. Shipping information
4. Secure payment processing
5. Order confirmation
6. Email notifications

## 📱 Integration Options

### Option 1: Embedded Chat Widget
```html
<iframe src="https://yourdomain.com/acp-chat-interface.html"
        width="400" height="600"></iframe>
```

### Option 2: API Integration
Use REST endpoints in your custom UI

### Option 3: Mobile Apps
Use WebView or native HTTP client

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check port availability
lsof -i :3001

# Kill existing process
kill -9 $(lsof -t -i:3001)
```

### Database Connection Failed
- Verify Supabase credentials in `.env`
- Check network connectivity
- Ensure SQL schemas are applied

### Payment Fails
- Use Stripe test cards: `4242 4242 4242 4242`
- Check Stripe API keys
- Verify webhook configuration

### Session Not Found
- Check session hasn't expired (24h limit)
- Verify session ID is correct
- Check database connection

## 📚 Next Steps

1. **Customize UI** - Match your brand
2. **Add Products** - Configure your catalog
3. **Enable Webhooks** - Handle subscription events
4. **Set up Monitoring** - Configure alerts
5. **Go to Production** - Deploy & scale

## 📖 Full Documentation

For complete details, see:
- [ACP_IMPLEMENTATION_GUIDE.md](ACP_IMPLEMENTATION_GUIDE.md) - Full technical documentation
- [Stripe Docs](https://stripe.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## 💬 Support

- Issues: Open a GitHub issue
- Email: support@dealershipai.com
- Docs: See ACP_IMPLEMENTATION_GUIDE.md

---

**Ready to go?** Run `./setup-acp.sh` to get started!
