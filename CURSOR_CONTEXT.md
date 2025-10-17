# 📚 DealershipAI Dashboard - Complete Technical Context

## 🎯 Project Overview

DealershipAI is a comprehensive, enterprise-grade SaaS platform for automotive dealerships with advanced AI visibility analytics. The system supports multi-tenancy with 4-tier RBAC and handles 5,000+ dealerships with sophisticated analytics, automation, and real-time monitoring.

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.14
- **State Management**: React Context + SWR for data fetching
- **Components**: Modular, reusable UI components with Framer Motion animations

### Backend Stack
- **API Layer**: tRPC + REST endpoints
- **Database**: PostgreSQL with Supabase
- **Caching**: Redis (Upstash) for performance optimization
- **Authentication**: Clerk with multi-tenant organizations
- **Billing**: Stripe with webhook integration
- **Deployment**: Vercel with Edge Functions

### Advanced Analytics
- **Hierarchical Bayesian Models**: Partial pooling by vertical and dealer
- **Causal Inference**: DoWhy/EconML for true causal impact estimation
- **Anomaly Detection**: IsolationForest for DTRI/ROI swings
- **Feature Store**: Normalized metrics persistence
- **Real-time Updates**: Supabase Realtime for live dashboard updates

## 📁 File Structure

```
dealership-ai-dashboard/
├── app/                          # Next.js App Router
│   ├── api/                     # API endpoints
│   │   ├── quick-audit/         # Main scoring endpoint
│   │   ├── changes/             # Change analysis
│   │   ├── fix-loop/            # Automated fixes
│   │   ├── bot-parity-drilldown/ # Bot analysis
│   │   ├── lineage/             # Data provenance
│   │   ├── usage/               # API usage tracking
│   │   └── advanced-analytics/  # Advanced analytics API
│   ├── (dashboard)/             # Dashboard pages
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── dashboard/               # Dashboard components
│   ├── ui/                      # Reusable UI components
│   ├── landing/                 # Landing page components
│   ├── QuickAudit.tsx           # URL scanner
│   ├── DealershipAIDashboard.tsx # Main dashboard
│   ├── WhatChangedAnalyzer.tsx  # Change tracking
│   ├── FixLoopExecutor.tsx      # Fix automation
│   ├── BotParityCard.tsx        # Bot monitoring
│   ├── ConfidenceRibbons.tsx    # Prophet confidence intervals
│   ├── ROIAttributionBar.tsx    # ROI attribution
│   └── AdvancedAnalyticsDashboard.tsx # Advanced analytics UI
├── lib/                         # Utilities and configurations
│   ├── prisma.ts                # Database client
│   ├── redis.ts                 # Cache client
│   ├── scoring.ts               # AI scoring engine
│   ├── botParity.ts             # Bot analysis logic
│   ├── realtime.ts              # Real-time updates
│   ├── dynamic-theme.ts         # Dynamic theme switching
│   ├── smart-notifications.ts   # Slack/Email notifications
│   ├── hierarchical-bayesian.ts # Bayesian models
│   ├── causal-inference.ts      # Causal inference engine
│   └── anomaly-detection.ts     # Anomaly detection
├── db/                          # Database migrations
│   └── migrations/              # SQL migration files
├── prisma/                      # Prisma schema
└── public/                      # Static assets
```

## 🔧 Key Components

### Core Dashboard Components

#### `QuickAudit.tsx`
- **Purpose**: Landing page URL scanner for AI visibility analysis
- **Features**: Domain validation, real-time scoring, result caching
- **API**: `/api/quick-audit`
- **Data Flow**: User input → Domain validation → Score calculation → Result display

#### `DealershipAIDashboard.tsx`
- **Purpose**: Main analytics dashboard with multi-tab interface
- **Features**: Real-time metrics, AI engine tracking, activity feed
- **Metrics**: AIV™, ATI™, CRS™, ITI™, CIS™ with trademark symbols
- **Data Flow**: SWR data fetching → Context state → Component rendering

#### `WhatChangedAnalyzer.tsx`
- **Purpose**: Week-over-week change tracking with root cause analysis
- **Features**: Metric deltas, impact assessment, playbook recommendations
- **API**: `/api/changes`
- **Data Flow**: Change detection → Impact calculation → Recommendation generation

#### `FixLoopExecutor.tsx`
- **Purpose**: Automated remediation system with playbook execution
- **Features**: Dry-run mode, risk assessment, action tracking
- **API**: `/api/fix-loop`
- **Data Flow**: Playbook selection → Risk analysis → Execution → Results

### Advanced Analytics Components

#### `ConfidenceRibbons.tsx`
- **Purpose**: Prophet curve confidence intervals visualization
- **Features**: yhat_lower/yhat_upper bands, confidence scoring
- **Library**: Recharts with AreaChart
- **Data Flow**: Prophet data → Confidence calculation → Visual rendering

#### `ROIAttributionBar.tsx`
- **Purpose**: ROI attribution showing which metrics drove most profit
- **Features**: Contribution scoring, trend analysis, top driver highlighting
- **Data Flow**: Metric data → Attribution calculation → Visual breakdown

#### `AdvancedAnalyticsDashboard.tsx`
- **Purpose**: Comprehensive analytics dashboard with tabbed interface
- **Features**: Bayesian results, causal inference, anomaly detection
- **Tabs**: Hierarchical Bayesian, Causal Inference, Anomaly Detection
- **Data Flow**: API calls → Data processing → Tabbed visualization

### Bot Parity Components

#### `BotParityCard.tsx`
- **Purpose**: Cross-platform bot crawl analysis
- **Features**: Parity scoring, weakest bot identification, recommendations
- **API**: `/api/bot-parity-drilldown`
- **Data Flow**: Bot data → Parity calculation → Status display

#### `BotParityDiffViewer.tsx`
- **Purpose**: HTML snapshot comparison between bots
- **Features**: Schema detection, diff highlighting, URL analysis
- **API**: `/api/bot-parity-snapshots`
- **Data Flow**: HTML snapshots → Diff analysis → Visual comparison

## 🚀 API Endpoints

### Core APIs

#### `GET /api/quick-audit?domain=example.com`
- **Purpose**: Main scoring endpoint for AI visibility analysis
- **Response**: Domain scores, overall grade, processing time
- **Caching**: 1-hour Redis cache
- **Database**: Stores results in `audits` and `scores` tables

#### `GET /api/changes`
- **Purpose**: Week-over-week change analysis
- **Response**: Metric deltas, root causes, impact assessment
- **Features**: Severity classification, playbook recommendations

#### `POST /api/fix-loop`
- **Purpose**: Automated fix execution
- **Body**: `{ playbook: string, dryRun: boolean }`
- **Response**: Action list, risk assessment, execution status

### Advanced Analytics APIs

#### `POST /api/advanced-analytics`
- **Purpose**: Advanced analytics processing
- **Methods**: `hierarchical_bayesian`, `causal_inference`, `anomaly_detection`
- **Response**: Method-specific results with diagnostics

#### `GET /api/advanced-analytics?method=bayesian`
- **Purpose**: Method information and parameters
- **Response**: Method description, parameters, output format

### Monitoring APIs

#### `GET /api/bot-parity-drilldown`
- **Purpose**: Detailed bot analysis data
- **Response**: URL-level bot performance, schema compliance

#### `GET /api/lineage`
- **Purpose**: Data provenance tracking
- **Response**: Source, timestamp, version, verification status

#### `GET /api/usage`
- **Purpose**: API usage statistics
- **Response**: Key usage, limits, status, alerts

## 🗄️ Database Schema

### Core Tables

#### `dealerships`
```sql
CREATE TABLE dealerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  domain varchar(255) UNIQUE NOT NULL,
  city varchar(100) NOT NULL,
  state varchar(2) NOT NULL,
  email varchar(255),
  phone varchar(20),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `scores`
```sql
CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid REFERENCES dealerships(id) ON DELETE CASCADE,
  ai_visibility integer CHECK (ai_visibility >= 0 AND ai_visibility <= 100),
  zero_click integer CHECK (zero_click >= 0 AND zero_click <= 100),
  ugc_health integer CHECK (ugc_health >= 0 AND ugc_health <= 100),
  geo_trust integer CHECK (geo_trust >= 0 AND geo_trust <= 100),
  sgp_integrity integer CHECK (sgp_integrity >= 0 AND sgp_integrity <= 100),
  overall_score float,
  created_at timestamptz DEFAULT now()
);
```

#### `audits`
```sql
CREATE TABLE audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid REFERENCES dealerships(id) ON DELETE CASCADE,
  domain varchar(255),
  scores jsonb,
  status varchar(20) DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);
```

### Advanced Analytics Tables

#### `feature_store`
```sql
CREATE TABLE feature_store (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date date NOT NULL,
  eeat_score numeric(4,3) NOT NULL,
  qai_score numeric(4,3) NOT NULL,
  piqr_score numeric(4,3) NOT NULL,
  tsm_score numeric(4,3) NOT NULL,
  elasticity_coefficient numeric(8,4),
  regime_state text,
  confidence_score numeric(4,3),
  data_source text NOT NULL DEFAULT 'system',
  quality_score numeric(4,3) DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, date)
);
```

#### `data_quality_audits`
```sql
CREATE TABLE data_quality_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  audit_date date NOT NULL,
  missing_data_count integer DEFAULT 0,
  stale_data_count integer DEFAULT 0,
  quality_score numeric(4,3) NOT NULL,
  issues jsonb DEFAULT '[]',
  resolved boolean DEFAULT false,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, audit_date)
);
```

## 🔐 Security & Multi-Tenancy

### Row-Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY dealerships_tenant_isolation ON dealerships
  FOR ALL USING (tenant_id = current_setting('app.tenant')::uuid);
```

### Authentication Flow
1. **Clerk Authentication**: User signs in via Clerk
2. **JWT Token**: Contains tenant_id and user roles
3. **Context Setting**: `app.tenant` set from JWT claims
4. **RLS Enforcement**: All queries automatically filtered by tenant

### API Security
- **Rate Limiting**: Upstash Ratelimit middleware
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Comprehensive error management
- **Audit Logging**: Complete action tracking

## 📊 Advanced Analytics

### Hierarchical Bayesian Models

#### Implementation
```typescript
// Partial pooling by vertical and dealer
const result = await hierarchicalBayesian.fitModel(data);

// Key features:
// - Shrinkage factors for small samples
// - Credible intervals for uncertainty
// - Effective sample size calculation
// - Convergence diagnostics
```

#### Benefits
- **Stability**: Reduces over-fitting from small samples
- **Uncertainty**: Provides credible intervals
- **Pooling**: Leverages information across groups
- **Diagnostics**: Convergence and quality checks

### Causal Inference

#### Methods Implemented
1. **Propensity Score Matching**: Matches treatment/control units
2. **Instrumental Variables**: 2SLS for endogeneity
3. **Regression Discontinuity**: Exploits cutoff points
4. **Difference-in-Differences**: Time-series comparison

#### Assumption Checks
- **Overlap**: Propensity score distributions
- **Balance**: Covariate balance after matching
- **Validity**: Instrument relevance and exogeneity
- **Parallel Trends**: Pre-treatment trends

### Anomaly Detection

#### Statistical Methods
- **Z-Score Analysis**: Standard deviation thresholds
- **Isolation Forest**: Unsupervised anomaly detection
- **Correlation Analysis**: Relationship breakdown detection
- **Time Series**: Trend and seasonality anomalies

#### Severity Classification
- **High**: Z-score > 3, immediate attention required
- **Medium**: Z-score 2-3, investigation recommended
- **Low**: Z-score 1.5-2, monitoring suggested

## 🎨 UI/UX Features

### Dynamic Theme System
```typescript
// Theme switching based on TSM values
if (tsm > 1.2) {
  theme = 'defensive'; // Orange/red colors
} else if (tsm > 1.5) {
  theme = 'critical';  // Red colors
} else {
  theme = 'normal';    // Blue colors
}
```

### Real-time Updates
```typescript
// Supabase Realtime integration
const channel = supabase
  .channel('dashboard_updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, 
    (payload) => handleScoreUpdate(payload))
  .subscribe();
```

### Smart Notifications
```typescript
// Slack/Email integration
await smartNotifications.sendDailySummary({
  type: 'daily_summary',
  data: { dtri_change: 5.2, revenue_impact: 12000 }
});
```

## 🚀 Deployment

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Auth
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Stripe Billing
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Redis Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Notifications
SLACK_WEBHOOK_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/monthly-scan",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

## 📈 Performance Optimization

### Caching Strategy
- **Redis**: API response caching (1-hour TTL)
- **SWR**: Client-side data fetching with revalidation
- **Static Generation**: Pre-built pages where possible
- **Edge Functions**: Global edge caching

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried columns
- **RLS**: Efficient row-level security policies
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Efficient SQL queries

### Frontend Optimization
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Regular bundle size monitoring
- **Lighthouse**: Performance, accessibility, SEO scores

## 🔧 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev

# Database operations
npm run db:generate
npm run db:push
npm run db:studio
```

### Testing
```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### Deployment
```bash
# Deploy to Vercel
vercel deploy --prod

# Environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... (add all required variables)
```

## 📚 Key Concepts

### AI Visibility Metrics
- **AIV™ (Algorithmic Visibility Index)**: Overall AI search presence
- **ATI™ (Algorithmic Trust Index)**: Credibility and trust signals
- **CRS™ (Composite Reputation Score)**: Bayesian fusion of AIV and ATI
- **ITI™ (Inventory Truth Index)**: Vehicle listing integrity
- **CIS™ (Clarity Intelligence Score)**: Content quality and clarity

### DTRI-MAXIMUS System
- **Financial Integration**: Claude AI for ROI calculation
- **Cost Reduction**: Operational efficiency improvements
- **Revenue Generation**: Lead generation and conversion
- **Risk Mitigation**: Decay prevention and compliance

### Bot Parity Monitoring
- **Cross-Platform Analysis**: Googlebot, GPTBot, PerplexityBot, GeminiBot
- **Schema Compliance**: Structured data consistency
- **Crawl Parity**: URL-level analysis
- **Diff Viewer**: HTML snapshot comparison

### Automation & Fix Loops
- **Playbook System**: Predefined fix strategies
- **Dry-Run Mode**: Safe testing before execution
- **Risk Assessment**: Low/medium/high risk classification
- **Action Tracking**: Complete execution monitoring

## 🎯 Use Cases

### For Dealerships
- **AI Visibility Monitoring**: Track presence across AI platforms
- **Competitive Analysis**: Benchmark against competitors
- **Content Optimization**: Improve AI search performance
- **ROI Measurement**: Quantify marketing investments
- **Automated Fixes**: Self-healing optimization

### For Enterprise
- **Multi-Location Management**: Centralized oversight
- **Role-Based Access**: Team-specific dashboards
- **API Integration**: Connect with existing systems
- **Custom Branding**: White-label solutions
- **Advanced Analytics**: Sophisticated insights

## 🔮 Future Enhancements

### Phase 1: Precision Analytics
- **Hierarchical Bayesian**: Improved elasticity coefficients
- **Causal Inference**: True causal impact estimation
- **Feature Store**: Normalized metrics persistence
- **Confidence Ribbons**: Prophet curve uncertainty

### Phase 2: Agentic Execution
- **LLM Integration**: Natural language insights
- **Automated Actions**: Self-executing optimizations
- **Scenario Simulation**: What-if analysis
- **Predictive Finance**: Valuation modeling

### Phase 3: Market Network
- **Peer Benchmarking**: Industry-wide comparisons
- **Network Effects**: Cross-dealership insights
- **Market Intelligence**: Competitive landscape
- **Collective Optimization**: Shared learning

---

This comprehensive technical context provides everything needed to understand, develop, and maintain the DealershipAI dashboard platform. The system represents a state-of-the-art SaaS solution with advanced analytics, automation, and enterprise-grade architecture.