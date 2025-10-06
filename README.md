# DealershipAI Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## 🚗 Enterprise Multi-Agent Platform for Automotive Dealership AI Visibility

DealershipAI is a comprehensive platform that analyzes and optimizes automotive dealerships' visibility across AI-powered search engines and platforms. It provides real-time insights into how dealerships appear in ChatGPT, Claude, Perplexity, Gemini, and other AI search results.

## ✨ Key Features

- **Multi-Agent AI Analysis**: Automated analysis across 6+ AI platforms
- **Revenue Impact Calculation**: Quantify lost opportunities from poor AI visibility
- **Competitor Tracking**: Monitor competitor presence in AI search results
- **Review Aggregation**: Consolidate ratings from multiple review platforms
- **Real-time Dashboard**: Interactive visualization of visibility metrics
- **Actionable Recommendations**: Prioritized tasks to improve AI presence
- **Enterprise Security**: Role-based access control with Clerk authentication

## 🎯 Problem We Solve

As consumers increasingly use AI assistants for purchase decisions, dealerships invisible to these platforms lose significant revenue. Our platform identifies these blind spots and provides actionable strategies to capture AI-driven traffic.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   FastAPI       │────▶│   PostgreSQL    │
│   Frontend      │     │   Backend       │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌─────────────────┐              │
         └─────────────▶│  Multi-Agent    │◀─────────────┘
                        │  System         │
                        └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
         ┌──────────┐    ┌──────────┐    ┌──────────┐
         │ ChatGPT  │    │ Perplexity│    │  Gemini  │
         └──────────┘    └──────────┘    └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kramerbrian/dealership-ai-dashboard.git
   cd dealership-ai-dashboard
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Install dependencies**
   ```bash
   # Backend
   pip install -r requirements.txt
   
   # Frontend
   npm install
   ```

4. **Initialize database**
   ```bash
   psql -U postgres -f init.sql
   ```

5. **Run development servers**
   ```bash
   # Terminal 1 - Backend
   uvicorn api.main:app --reload
   
   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/api/docs

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📚 API Documentation

### Authentication
All API endpoints require Bearer token authentication:
```http
Authorization: Bearer <token>
```

### Key Endpoints

#### Analyze Dealership
```http
POST /api/analysis/analyze
{
  "business_name": "Toyota of Naples",
  "location": "Naples, FL"
}
```

#### Get Dashboard Metrics
```http
GET /api/dashboard/metrics?dealership_url=https://toyotaofnaples.com
```

## 🧪 Testing

```bash
# Backend tests
pytest tests/

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

## 📊 Performance Metrics

- API Response Time: < 200ms (p95)
- Dashboard Load Time: < 2 seconds
- Analysis Processing: < 30 seconds
- Concurrent Users: 10,000+
- Uptime SLA: 99.9%

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting per API endpoint
- SQL injection prevention
- XSS protection
- HTTPS enforcement
- Data encryption at rest

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 Enterprise Support

For enterprise deployments and custom features, contact sales@dealership-ai.com

## 🚦 Deployment Status

- Production: [![Production](https://img.shields.io/badge/status-ready-green.svg)]()
- Staging: [![Staging](https://img.shields.io/badge/status-ready-green.svg)]()
- Development: [![Development](https://img.shields.io/badge/status-active-yellow.svg)]()

## 📞 Support

- Documentation: [https://docs.dealership-ai.com](https://docs.dealership-ai.com)
- Email: support@dealership-ai.com
- Issues: [GitHub Issues](https://github.com/Kramerbrian/dealership-ai-dashboard/issues)

---

Built with ❤️ for the automotive industry
