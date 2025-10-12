# DealershipAI v2.0 - Production SaaS

> AI Visibility Platform for Car Dealerships - Next.js + Prisma + Redis

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.0-2D3748)](https://prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D)](https://upstash.com/)

## 🚀 Overview

DealershipAI v2.0 is an enterprise SaaS platform that helps car dealerships stay visible in AI-powered search engines (ChatGPT, Perplexity, Claude, Gemini). When AI doesn't know you exist, you lose customers. We track, measure, and optimize AI visibility.

### Key Features

- **3-Tier Pricing**: FREE, PRO ($499/month), ENTERPRISE ($999/month)
- **5-Pillar Scoring System**: AI Visibility, Zero-Click Shield, UGC Health, Geo Trust, SGP Integrity
- **E-E-A-T Analysis**: Expertise, Experience, Authoritativeness, Trustworthiness (Pro+)
- **Mystery Shop Automation**: Automated customer experience testing (Enterprise)
- **Geographic Pooling**: 50x cost reduction through shared AI queries
- **Session Tracking**: Redis-based usage limits and monitoring

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, tRPC, Prisma ORM
- **Database**: PostgreSQL with Supabase
- **Cache**: Redis (Upstash)
- **Payments**: Stripe
- **Deployment**: Vercel

### Core Components
- **Scoring Engine**: 5-pillar AI visibility calculation
- **Tier Manager**: Session tracking and feature gating
- **Auth Manager**: JWT-based authentication
- **API Client**: Centralized backend communication
- **Stripe Integration**: Seamless upgrade flow

## 📦 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd dealership-ai-dashboard
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Database Setup
```bash
# Run the setup script
./scripts/setup-database.sh

# Or manually:
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🔧 Configuration

### Required Environment Variables

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

# Session Limits
FREE_SESSION_LIMIT="0"
PRO_SESSION_LIMIT="50"
ENTERPRISE_SESSION_LIMIT="200"

# App Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Providers

#### Option 1: Supabase (Recommended)
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string from Settings > Database
3. Update `DATABASE_URL` in `.env.local`

#### Option 2: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb dealershipai`
3. Update `DATABASE_URL` in `.env.local`

#### Option 3: Railway/Neon
1. Create PostgreSQL database on Railway or Neon
2. Copy connection string
3. Update `DATABASE_URL` in `.env.local`

### Redis Setup (Upstash)
1. Create account at [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST URL and Token
4. Update environment variables

### Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Create products and prices in dashboard
3. Copy price IDs to environment variables
4. Set up webhooks for subscription events

## 📊 API Endpoints

### Core Analysis
- `GET /api/analyze` - Analyze dealership AI visibility
- `POST /api/analyze` - Batch analysis (Pro+)

### E-E-A-T Analysis (Pro+)
- `POST /api/eeat` - Calculate E-E-A-T scores

### Mystery Shop (Enterprise)
- `GET /api/mystery-shop` - Get test results
- `POST /api/mystery-shop` - Schedule new test
- `PUT /api/mystery-shop` - Execute test

### Stripe Integration
- `POST /api/stripe/create-checkout-session` - Create checkout session
- `POST /api/stripe/create-portal-session` - Create customer portal
- `GET /api/stripe/subscription-status` - Get subscription status

## 🎯 Usage Examples

### Basic Analysis
```typescript
import { apiClient } from '@/src/lib/api-client';

const result = await apiClient.analyzeDealership({
  dealerId: 'dealer-123',
  dealerName: 'ABC Motors',
  city: 'Los Angeles',
  state: 'CA',
  website: 'https://abcmotors.com'
});
```

### E-E-A-T Analysis
```typescript
const eeatResult = await apiClient.analyzeEEAT({
  domain: 'abcmotors.com',
  dealershipName: 'ABC Motors',
  city: 'Los Angeles',
  state: 'CA',
  reviews: [...],
  localData: {...}
});
```

### Stripe Upgrade
```typescript
import { redirectToCheckout } from '@/src/lib/stripe';

await redirectToCheckout('price_pro_monthly', 'user-123');
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:api
npm run test:components
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm start
```

## 📈 Performance

### Cost Optimization
- **Geographic Pooling**: Share AI queries across city ($0.30 vs $15 per dealer)
- **Redis Caching**: Reduce API calls by 80%
- **Session Tracking**: Prevent overuse and optimize costs

### Scaling
- **Database**: Use read replicas for heavy queries
- **Redis**: Cluster mode for high availability
- **CDN**: Static asset optimization
- **Monitoring**: Real-time performance tracking

## 🔐 Security

### Authentication
- JWT-based token authentication
- Secure token storage and validation
- Session-based access control

### Data Protection
- Row-level security (RLS) in database
- Input validation with Zod schemas
- Rate limiting on API endpoints
- HTTPS enforcement in production

### Privacy
- No PII storage in logs
- Encrypted sensitive data
- GDPR compliance ready
- SOC 2 Type II preparation

## 📊 Monitoring

### Health Checks
- `GET /api/health` - Overall system health
- `GET /api/health/database` - Database connectivity
- `GET /api/health/redis` - Redis connectivity

### Metrics
- Session usage tracking
- API response times
- Error rates and patterns
- User engagement analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.dealershipai.com](https://docs.dealershipai.com)
- **API Reference**: [api.dealershipai.com](https://api.dealershipai.com)
- **Support Email**: [support@dealershipai.com](mailto:support@dealershipai.com)
- **GitHub Issues**: [github.com/dealershipai/issues](https://github.com/dealershipai/issues)

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://prisma.io/)
- Caching with [Upstash Redis](https://upstash.com/)
- Payments via [Stripe](https://stripe.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**DealershipAI v2.0** - Making car dealerships visible in the AI era 🚗✨