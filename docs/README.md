# DealershipAI - Production Documentation

**Where signal replaces noise.**

DealershipAI is a comprehensive AI-powered dashboard system for automotive dealerships, providing real-time insights into AI visibility, competitive positioning, and performance optimization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Vercel CLI (for deployment)
- GitHub CLI (for releases)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dealership-ai-dashboard.git
cd dealership-ai-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.template .env.local
# Edit .env.local with your actual values

# Run development server
npm run dev
```

### Environment Setup

```bash
# Set up all environments
./scripts/setup-env.sh

# Sync with Vercel
./scripts/sync-vercel-env.sh --force

# Verify environment
vercel env ls
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Cache**: Upstash Redis
- **Auth**: Clerk
- **Payments**: Stripe
- **Deployment**: Vercel

### Multi-Tenant Architecture
- Tenant-based data isolation
- Role-based access control (RBAC)
- Row-level security (RLS) in database

### Scoring Engine
- 9 core metrics (ATI, AIV, VLI, OI, GBP, RRS, WX, IFR, CIS)
- ElasticNet weight learning
- Real-time penalty system
- Automated recommendations

## 📊 Core Features

### Dashboard
- Real-time AI scoring
- Multi-tenant support
- Cupertino design system
- Dark/light mode toggle
- Responsive design

### Intelligence Center
- AI search query analysis
- Voice search insights
- Competitive positioning
- Platform mention tracking
- Strategic recommendations

### User Management
- Multi-role support
- Tenant administration
- Permission management
- Activity tracking

### Reporting
- Automated report generation
- CSV/PDF export
- Scheduled reports
- Custom templates

## 🔧 API Reference

### Authentication
All API routes require proper authentication via Clerk.

### Core Endpoints

#### Scoring
- `GET /api/tenants/[id]/scores` - Get tenant scores
- `POST /api/tenants/[id]/scores` - Create new scores

#### Intelligence
- `GET /api/ai/answer-intel` - Get AI intelligence data

#### User Management
- `GET /api/user/manage` - List users
- `POST /api/user/onboarding` - Create user
- `PUT /api/user/profile` - Update profile

#### Reports
- `GET /api/reports/generate` - List reports
- `POST /api/reports/generate` - Generate report

#### Export
- `GET /api/export/csv` - Export CSV
- `GET /api/export/pdf` - Export PDF

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and profiles
- `tenants` - Multi-tenant organization data
- `ai_scores` - Scoring engine results
- `reports` - Generated reports
- `export_history` - Export tracking

### Views
- `mv_weekly_variant` - Weekly performance metrics
- `mv_visibility_leaderboard` - Competitive rankings

### RLS Policies
- Tenant-based data isolation
- Role-based access control
- Secure data access patterns

## 🚀 Deployment

### Vercel Deployment

```bash
# Preview deployment
vercel --pre

# Production deployment
vercel --prod

# Environment setup
./scripts/setup-vercel-env.sh
```

### Environment Variables

#### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `KV_URL`
- `KV_REST_API_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Optional
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SENTRY_DSN`
- `CLERK_WEBHOOK_SECRET`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run CI tests
npm run test:ci
```

### Test Coverage
- API endpoints
- Database services
- Rate limiting
- User management
- Report generation

## 📈 Monitoring

### Health Checks
- `GET /api/health` - System health status
- Database connectivity
- Redis connectivity
- External service status

### Rate Limiting
- Per-endpoint limits
- Redis-based tracking
- Graceful degradation

### Error Tracking
- Sentry integration (optional)
- Structured logging
- Error boundaries

## 🔄 CI/CD

### GitHub Actions
- Automated testing
- Preview deployments
- Production deployments
- Release management

### Release Process
```bash
# Create release
npm run release:final

# Dry run
npm run release:final:dry
```

## 📚 Additional Documentation

- [Onboarding Guide](ONBOARDING.md)
- [Scoring System](SCORING.md)
- [Automations](AUTOMATIONS.md)
- [API Reference](API.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

Proprietary - DealershipAI

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**DealershipAI** - Where signal replaces noise.
