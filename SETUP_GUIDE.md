# DealershipAI v2.0 - Setup Guide

## 🚀 Quick Start

### 1. Database Setup
```bash
# Run the database setup script
./scripts/setup-database.sh

# Or manually:
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 2. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dealershipai"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Session Limits
FREE_SESSION_LIMIT="0"
PRO_SESSION_LIMIT="50"
ENTERPRISE_SESSION_LIMIT="200"

# Features
ENABLE_EEAT_SCORING="true"
ENABLE_MYSTERY_SHOP="true"
ENABLE_GEO_POOLING="true"

# Cache Settings
CACHE_TTL_HOURS="24"

# API Keys (for AI services)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."
PERPLEXITY_API_KEY="pplx-..."

# App Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Development
NODE_ENV="development"
```

### 3. Start Development Server
```bash
npm run dev
```

## 🔧 Detailed Setup

### Database Configuration

#### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `dealershipai`
3. Update `DATABASE_URL` in your `.env.local`

#### Option 2: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Update `DATABASE_URL` in your `.env.local`

#### Option 3: Railway/Neon
1. Create a PostgreSQL database on Railway or Neon
2. Copy the connection string
3. Update `DATABASE_URL` in your `.env.local`

### Redis Configuration (Upstash)

1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Update `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your `.env.local`

### Stripe Configuration

1. Go to [stripe.com](https://stripe.com)
2. Create a new account or log in
3. Go to Products and create two products:
   - Pro Plan: $499/month
   - Enterprise Plan: $999/month
4. Copy the price IDs and update your `.env.local`
5. Set up webhooks for subscription events

### AI Service API Keys

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Update `OPENAI_API_KEY` in your `.env.local`

#### Anthropic
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Update `ANTHROPIC_API_KEY` in your `.env.local`

#### Google AI
1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Create an API key
3. Update `GOOGLE_AI_API_KEY` in your `.env.local`

#### Perplexity
1. Go to [perplexity.ai](https://perplexity.ai)
2. Create an API key
3. Update `PERPLEXITY_API_KEY` in your `.env.local`

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:api
npm run test:components
npm run test:integration
```

### Test API Endpoints
```bash
# Test analyze endpoint
curl -X GET "http://localhost:3000/api/analyze?dealerId=test&dealerName=Test%20Dealership&city=Los%20Angeles&state=CA" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test E-E-A-T endpoint
curl -X POST "http://localhost:3000/api/eeat" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"test.com","dealershipName":"Test Dealership","city":"Los Angeles","state":"CA"}'
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
- Check if `DATABASE_URL` is correct
- Ensure database is running and accessible
- Run `npx prisma db push` to sync schema

#### Redis Connection Issues
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check if Redis instance is active
- Test connection with `redis-cli`

#### API Key Issues
- Ensure all required API keys are set
- Check if API keys have proper permissions
- Verify rate limits and quotas

#### Session Limit Issues
- Check Redis connection
- Verify session tracking is working
- Check tier configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=dealershipai:* npm run dev
```

### Logs
```bash
# View application logs
npm run logs

# View specific service logs
npm run logs:api
npm run logs:redis
npm run logs:database
```

## 📊 Monitoring

### Health Checks
- API Health: `GET /api/health`
- Database Health: `GET /api/health/database`
- Redis Health: `GET /api/health/redis`

### Metrics
- Session usage tracking
- API response times
- Error rates
- User engagement metrics

## 🔐 Security

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate API keys regularly

### Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access by IP

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Implement proper authentication

## 📈 Performance

### Optimization Tips
- Enable Redis caching
- Use database indexes
- Implement connection pooling
- Monitor query performance

### Scaling
- Use read replicas for database
- Implement horizontal scaling
- Use CDN for static assets
- Monitor resource usage

## 🆘 Support

### Documentation
- API Documentation: `/api/docs`
- Component Library: `/components`
- Database Schema: `/prisma/schema.prisma`

### Getting Help
- Check the troubleshooting section
- Review error logs
- Contact support team
- Create GitHub issue

## 🎯 Next Steps

After setup:
1. Configure your first dealership
2. Test the scoring system
3. Set up monitoring
4. Configure alerts
5. Train your team
6. Go live!

---

**Need help?** Check our [FAQ](FAQ.md) or [contact support](mailto:support@dealershipai.com).
