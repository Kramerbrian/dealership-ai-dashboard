# DealershipAI - Algorithmic Trust Dashboard

> **AI-powered dealership visibility and optimization platform**

DealershipAI is a comprehensive SaaS platform that helps automotive dealerships monitor and optimize their visibility across AI search engines (ChatGPT, Perplexity, Gemini, Claude) and traditional search platforms. The system uses a multi-agent architecture to analyze dealership presence, identify revenue risks, and provide actionable optimization recommendations.

## 🚀 Features

- **Real-time AI Visibility Monitoring** - Track mentions across ChatGPT, Perplexity, Gemini, and Claude
- **Revenue Risk Analysis** - Calculate potential revenue loss from AI invisibility
- **Competitor Intelligence** - Monitor competitor mentions and market positioning
- **Review Aggregation** - Centralized review management across multiple platforms
- **Automated Response Suggestions** - AI-generated responses for reviews and mentions
- **Comprehensive Analytics** - Detailed reporting and trend analysis
- **Multi-tier Subscription Plans** - Flexible pricing with feature gates

## 🏗️ Architecture

### Frontend (Next.js 14 + TypeScript)
- **React Components**: Modern, accessible dashboard components
- **Tailwind CSS**: Responsive design system
- **NextAuth.js**: Authentication and authorization
- **SWR**: Data fetching and caching
- **Prisma**: Database ORM and migrations

### Backend (FastAPI + Python)
- **Multi-Agent System**: Specialized agents for different data sources
- **Async Processing**: Concurrent API calls for better performance
- **Background Tasks**: Celery with Redis for long-running operations
- **API Security**: JWT authentication and rate limiting
- **Database**: PostgreSQL with async operations

### Infrastructure
- **Docker**: Containerized deployment
- **Docker Compose**: Multi-service orchestration
- **Traefik**: Reverse proxy and SSL termination
- **Redis**: Caching and task queue
- **PostgreSQL**: Primary database

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- API keys for AI platforms (OpenAI, Google, Perplexity, etc.)

## 🚀 Quick Start (Production)

### 1. Clone and Configure

```bash
git clone <repository-url>
cd dealership-ai-dashboard

# Copy environment template
cp .env.example .env.production

# Edit with your configuration
nano .env.production
```

### 2. Configure Environment Variables

```bash
# Required API Keys
OPENAI_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
PERPLEXITY_API_KEY=...
GOOGLE_GEMINI_API_KEY=...

# Database
DATABASE_USER=dealership_user
DATABASE_PASSWORD=secure_password_here

# Security
NEXTAUTH_SECRET=your-secure-nextauth-secret
JWT_SECRET=your-secure-jwt-secret

# Domain Configuration
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
```

### 3. Deploy with Docker

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Initialize Database

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create admin user (optional)
docker-compose -f docker-compose.prod.yml exec backend python -m app.create_admin
```

## 🛠️ Development Setup

### 1. Local Development

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Set up database
docker-compose up postgres redis -d

# Run database migrations
npx prisma generate
npx prisma db push

# Start development servers
npm run dev          # Frontend (port 3000)
python -m uvicorn backend.app.api:app --reload --port 8000  # Backend (port 8000)
```

### 2. Environment Setup

```bash
# Copy development environment
cp .env.example .env

# Configure API keys in .env
# At minimum, set:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - OPENAI_API_KEY (for AI features)
```

### 3. Testing

```bash
# Frontend tests
npm test
npm run test:coverage

# Backend tests
cd backend
pytest
pytest --cov=app tests/
```

## 📊 Usage Guide

### Dashboard Overview

The main dashboard provides:

1. **Risk Assessment Tab** - Primary view showing:
   - Algorithmic Trust Score (0-100)
   - Monthly revenue at risk
   - AI platform visibility scores
   - Critical threat analysis

2. **AI Intelligence Tab** - Detailed AI platform analysis:
   - Platform-specific performance metrics
   - Live query testing interface
   - Mention tracking and trends

3. **Additional Tabs** (Premium tiers):
   - Website Health monitoring
   - Schema markup audit
   - Review management hub
   - Mystery shopping results
   - Predictive analytics
   - Competitor intelligence

### API Endpoints

#### Authentication
```bash
POST /api/auth/signin
POST /api/auth/signup
```

#### Analysis
```bash
# Get analysis for a dealership
GET /api/analysis?businessName=Toyota%20of%20Naples&location=Naples,%20FL

# Trigger new analysis
POST /api/analysis
{
  "business_name": "Toyota of Naples",
  "location": "Naples, FL",
  "dealership_url": "https://toyotaofnaples.com",
  "analysis_type": "full"
}
```

#### Platform Testing
```bash
# Test individual AI platforms
GET /api/v1/platforms/chatgpt/test?query=Toyota%20dealership%20Naples
```

## 🔧 Configuration

### AI Platform Setup

#### OpenAI (ChatGPT)
1. Get API key from https://platform.openai.com/
2. Set `OPENAI_API_KEY` in environment

#### Google (Search + Gemini)
1. Enable Custom Search API: https://developers.google.com/custom-search/
2. Set `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`
3. For Gemini: https://ai.google.dev/
4. Set `GOOGLE_GEMINI_API_KEY`

#### Perplexity
1. Get API access: https://docs.perplexity.ai/
2. Set `PERPLEXITY_API_KEY`

### Database Configuration

The application uses PostgreSQL with Prisma ORM:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# View database
npx prisma studio
```

### Monitoring Setup

Optional monitoring with Sentry:

```bash
# Set SENTRY_DSN in environment
SENTRY_DSN=https://...@sentry.io/...
```

## 🔐 Security

- JWT-based authentication
- Environment-based configuration
- API rate limiting
- Input validation with Zod
- SQL injection protection (Prisma)
- CORS configuration
- Secure password hashing (bcryptjs)

## 📈 Performance

- Async/await throughout
- Connection pooling
- Redis caching
- Background job processing
- CDN-ready static assets
- Database query optimization

## 🚨 Troubleshooting

### Common Issues

1. **API Keys Not Working**
   ```bash
   # Check environment variables are loaded
   docker-compose exec backend env | grep API_KEY
   ```

2. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose exec postgres pg_isready
   
   # View connection logs
   docker-compose logs postgres
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

4. **Backend API Errors**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Test backend health
   curl http://localhost:8000/health
   ```

### Performance Optimization

1. **Database Optimization**
   - Add database indexes for frequent queries
   - Use connection pooling
   - Enable query logging to identify slow queries

2. **Caching Strategy**
   - Redis for API response caching
   - CDN for static assets
   - Browser caching for dashboard data

3. **Scaling Considerations**
   - Load balancer for multiple backend instances
   - Database read replicas
   - Horizontal scaling with Docker Swarm/Kubernetes

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For technical support:
- Email: support@dealershipai.com
- Documentation: https://docs.dealershipai.com
- Status Page: https://status.dealershipai.com

---

**Built with ❤️ for automotive dealerships worldwide**
