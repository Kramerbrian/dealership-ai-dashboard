# DealershipAI ZeroPoint Dashboard

A comprehensive AI-powered dashboard for dealerships featuring Digital Trust Revenue Index (DTRI) analytics, automated SOW generation, and predictive elasticity modeling.

## 🚀 Features

### Core Analytics
- **DTRI Analytics Superpanel** - Interactive vertical filters (Sales, Acquisition, Service, Parts)
- **Rolling 90-day elasticity forecast** with mini-charts
- **Real-time trend visualization** with multi-line charts
- **Auto-refresh indicators** and health status badges

### MAXIMUS System
- **SOW Generation** - Automated Statement of Work creation
- **ROI Verification & Close-Out** - Track predicted vs actual ROI
- **Sentinel Monitoring** - Real-time alerts and automated responses
- **Intervention Audit** - β-calibration for model accuracy

### Predictive Engine
- **Elasticity Modeling** - Trust-to-revenue correlation analysis
- **Revenue Forecasting** - 90-day predictive analytics
- **Feature Importance** - XGBoost-based model insights
- **Prophet Integration** - Time series forecasting

### Automation & Monitoring
- **BullMQ Job System** - Automated DTRI refresh every 4 AM UTC
- **Cron Scheduling** - SOW nudges, Sentinel monitoring
- **Queue Management** - Real-time job status and health monitoring
- **Comprehensive Logging** - Structured logging with Logtail integration

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Framer Motion** for animations

### Backend
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Redis/Upstash** - Caching and queue management
- **BullMQ** - Job queue system
- **Vercel Functions** - Serverless API endpoints

### Python Analytics
- **Prophet** - Time series forecasting
- **XGBoost** - Machine learning models
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

## 📊 API Endpoints

### DTRI Analytics
- `GET /api/dtri/trend` - Fetch DTRI trend data
- `GET /api/queue/status` - Queue system status
- `GET /api/health` - System health check

### SOW Management
- `POST /api/sow/generate` - Generate new SOW
- `GET /api/sow/due` - Fetch due SOWs
- `POST /api/sow/closeout` - Submit SOW closeout

### Monitoring
- `GET /api/supabase/sentinel_events` - Fetch Sentinel events
- `POST /api/supabase/sentinel_events` - Create new event
- `PUT /api/supabase/sentinel_events` - Update event status

### Predictive Analytics
- `GET /api/predictive/elasticity` - Fetch elasticity data
- `POST /api/predictive/elasticity` - Trigger analysis

### Automation
- `GET /api/cron/dtri-refresh` - Trigger DTRI refresh
- `GET /api/cron/sow-nudges` - Trigger SOW nudges
- `GET /api/cron/sentinel-monitor` - Trigger Sentinel monitoring

## 🗄️ Database Schema

### Core Tables
- `score_event` - DTRI scoring history
- `sow_records` - Statement of Work documents
- `sow_closeout` - SOW completion tracking
- `intervention_audit` - ROI accuracy tracking
- `sentinel_events` - Monitoring alerts
- `elasticity_coefficients` - Trust-to-revenue factors
- `dtri_forecast` - Predictive forecasts
- `revenue_predictions` - Revenue projections

## 🚀 Deployment

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure Supabase, Redis, and API keys
3. Run database migrations
4. Deploy to Vercel

### Vercel Configuration
- **Python Runtime** - For analytics scripts
- **Cron Jobs** - Automated scheduling
- **Edge Functions** - Global distribution
- **Environment Variables** - Secure configuration

### GitHub Actions
- **Automated Testing** - Type checking, linting, tests
- **Build Process** - Production optimization
- **Deployment** - Preview and production environments
- **Health Checks** - Post-deployment validation

## 📈 Monitoring & Observability

### Logging
- **Structured Logging** - JSON format with context
- **Logtail Integration** - Centralized log management
- **Performance Metrics** - API timing, memory usage
- **Business Metrics** - DTRI scores, ROI accuracy

### Error Tracking
- **Sentry Integration** - Error monitoring and alerting
- **Database Errors** - Connection and query issues
- **External Service Errors** - API failures
- **Validation Errors** - Input validation

### Health Monitoring
- **System Health** - Database, Redis, queue status
- **Service Dependencies** - External API availability
- **Performance Metrics** - Response times, throughput
- **Queue Health** - Job success rates, backlog

## 🔧 Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Redis instance
- Supabase project

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Start queue worker
npm run queue:worker

# Start scheduler
npm run queue:start
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript checking
- `npm run test` - Run tests
- `npm run queue:worker` - Start BullMQ worker
- `npm run queue:start` - Start job scheduler

## 📋 Features by Vertical

### Sales
- DTRI scoring and trend analysis
- Conversion rate optimization
- Revenue at risk calculation
- Competitive analysis

### Acquisition
- Trust signal monitoring
- Lead quality scoring
- Cost per acquisition tracking
- Market positioning

### Service
- Customer satisfaction metrics
- Service lane optimization
- Retention rate analysis
- Upsell opportunities

### Parts
- Inventory optimization
- Demand forecasting
- Supplier performance
- Profit margin analysis

## 🎯 Key Metrics

### DTRI Components
- **QAI (Quantum Authority Index)** - AI visibility score
- **PIQR (Page Integrity Quality Rating)** - Content quality
- **EEAT (Experience, Expertise, Authority, Trust)** - Trust signals
- **Elasticity** - Trust-to-revenue correlation

### Business Metrics
- **Revenue at Risk** - Potential loss calculation
- **ROI Accuracy** - Prediction vs actual performance
- **Queue Health** - System performance indicators
- **Alert Response Time** - Monitoring effectiveness

## 🔮 Future Enhancements

### Planned Features
- **Real-time WebSocket** - Live data updates
- **Advanced ML Models** - Deep learning integration
- **Mobile App** - Native iOS/Android support
- **API Marketplace** - Third-party integrations

### Scaling Considerations
- **Microservices** - Service decomposition
- **Event Sourcing** - Audit trail and replay
- **CQRS** - Command Query Responsibility Segregation
- **Multi-tenant** - Enterprise deployment

## 📞 Support

For technical support or feature requests, please contact the DealershipAI team.

---

**Built with ❤️ by the DealershipAI Team**