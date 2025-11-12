# DealershipAI - Production Readiness Checklist

## 🎯 100% Production Mode Roadmap

### Phase 1: Core Infrastructure (Week 1-2)

#### ✅ Environment Variables
- [ ] **API Keys**
  - [ ] `ANTHROPIC_API_KEY` - Claude Haiku/Sonnet
  - [ ] `OPENAI_API_KEY` - GPT-4o, embeddings
  - [ ] `PERPLEXITY_API_KEY` - AEO probes
  - [ ] `GOOGLE_API_KEY` - Search Console, Business Profile
  - [ ] `ELEVENLABS_API_KEY` - Voice integration

- [ ] **Database**
  - [ ] `DATABASE_URL` - Supabase PostgreSQL connection
  - [ ] `DIRECT_URL` - Direct database connection
  - [ ] `SUPABASE_URL` - Supabase project URL
  - [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key

- [ ] **Caching**
  - [ ] `UPSTASH_REDIS_REST_URL` - Redis connection
  - [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis token

- [ ] **Auth**
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

- [ ] **Payments**
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`

- [ ] **Orchestration**
  - [ ] `FLEET_API_BASE` - Fleet API endpoint
  - [ ] `X_API_KEY` - Fleet API authentication
  - [ ] `CRON_SECRET` - Cron job authentication
  - [ ] `RBAC_ENFORCE` - Enable RBAC (set to '1')

#### ✅ Database Migrations
- [ ] Run Prisma migrations:
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Vector Cache Table**
  - [ ] Create `ai_context_cache` table with pgvector
  - [ ] Run migration SQL from `lib/ai/vector-cache.ts`
  - [ ] Verify index creation

- [ ] **Core Tables**
  - [ ] `scores` - Metrics storage
  - [ ] `eeat_opportunities` - E-E-A-T opportunities
  - [ ] `agent_runs` - AI execution logs
  - [ ] `voice_sessions` - Voice interaction logs
  - [ ] `events` - Event feed
  - [ ] `missions` - Queue for actions
  - [ ] `asrs` - Recommended actions

#### ✅ API Routes Implementation
- [ ] **Metrics Endpoints**
  - [ ] `GET /api/metrics/stream` - SSE streaming
  - [ ] `GET /api/metrics/qai` - Quality Authority Index
  - [ ] `GET /api/metrics/eeat` - E-E-A-T breakdown
  - [ ] `GET /api/metrics/rar` - Revenue at Risk
  - [ ] `GET /api/metrics/clarity` - Clarity Score

- [ ] **AI Orchestration**
  - [ ] `POST /api/ai/chat` - Chief Clarity Officer chat
  - [ ] `POST /api/ai/analyze` - Deep analysis
  - [ ] `POST /api/ai/generate-schema` - Schema generation
  - [ ] `POST /api/ai/fix` - Auto-fix generation

- [ ] **Fleet Management**
  - [ ] `GET /api/origins` - List origins
  - [ ] `POST /api/origins/bulk` - Bulk add
  - [ ] `POST /api/origins/bulk-csv` - CSV upload
  - [ ] `POST /api/probe/verify` - Verification
  - [ ] `POST /api/refresh` - Refresh scan

- [ ] **Actions**
  - [ ] `POST /api/fix/deploy` - Deploy fixes
  - [ ] `POST /api/scan/full` - Full cognitive scan

---

### Phase 2: UI Components (Week 2-3)

#### ✅ Core Components
- [ ] **CommandBar** ✅ Created
  - [ ] Wire to intent router
  - [ ] Connect ElevenLabs voice
  - [ ] Test ⌘K shortcut

- [ ] **AgentRail** ✅ Created
  - [ ] Add hover tooltips
  - [ ] Implement status dots
  - [ ] Long-press explain feature

- [ ] **QaiModal**
  - [ ] Score + delta display
  - [ ] Drivers table
  - [ ] Evidence list
  - [ ] "Open E-E-A-T" button → EEATDrawer
  - [ ] "Run Schema Fix" action

- [ ] **EEATDrawer**
  - [ ] Four sections (Experience, Expertise, Authority, Trust)
  - [ ] Scores per pillar
  - [ ] Evidence display
  - [ ] 1-3 opportunities with "Run Fix"

- [ ] **RaRModal**
  - [ ] Current $ at risk with confidence band
  - [ ] Drivers breakdown
  - [ ] Simulate Recovery slider
  - [ ] Actions: Deploy, Simulate, Schedule, View Proof

- [ ] **OrbitalView**
  - [ ] Three.js/react-three-fiber setup
  - [ ] Center node (DTRI)
  - [ ] 6 orbital nodes
  - [ ] Interaction handlers (click, drag, double-click)
  - [ ] Toggle between cards/orbital

- [ ] **VoiceInput**
  - [ ] ElevenLabs integration
  - [ ] Intent router
  - [ ] Command mapping
  - [ ] Transcript handling

---

### Phase 3: Integrations (Week 3-4)

#### ✅ External APIs
- [ ] **Google APIs**
  - [ ] Search Console API connected
  - [ ] Business Profile API connected
  - [ ] Places API for GEO data
  - [ ] OAuth flow configured

- [ ] **AI Platforms**
  - [ ] ChatGPT API (OpenAI)
  - [ ] Claude API (Anthropic)
  - [ ] Perplexity API
  - [ ] Gemini API
  - [ ] Test all platforms return data

- [ ] **ElevenLabs Voice**
  - [ ] Agent ID configured
  - [ ] Voice persona tuned
  - [ ] Command templates loaded
  - [ ] Test voice input/output

- [ ] **Stripe**
  - [ ] Products created ($0, $499, $999)
  - [ ] Webhooks configured
  - [ ] Payment flow tested
  - [ ] Subscription management

#### ✅ Data Sources
- [ ] **Real-time Data**
  - [ ] GSC data pipeline
  - [ ] GBP data pipeline
  - [ ] Review aggregation (Google, DealerRater, etc.)
  - [ ] Schema validation pipeline

- [ ] **Caching Strategy**
  - [ ] Redis geographic pooling
  - [ ] TTL configuration
  - [ ] Cache warming cron jobs
  - [ ] Cache invalidation logic

---

### Phase 4: AI Orchestration (Week 4-5)

#### ✅ LangChain Router
- [ ] **Cost Routing**
  - [ ] Claude Haiku for 80% of tasks ✅
  - [ ] GPT-4o for reasoning ✅
  - [ ] Fallback chains configured ✅
  - [ ] Cost tracking implemented

- [ ] **Vector Cache**
  - [ ] pgvector table created
  - [ ] Embeddings generation working
  - [ ] Similarity search functional
  - [ ] Context retrieval in failover

- [ ] **Failover Mechanism**
  - [ ] Primary → Fallback chains
  - [ ] Vector context retrieval
  - [ ] Error handling
  - [ ] Logging/monitoring

#### ✅ Chief Clarity Officer
- [ ] **Chat Interface**
  - [ ] Natural language processing
  - [ ] Context management
  - [ ] Conversation history
  - [ ] Cost tracking

- [ ] **Analysis Engine**
  - [ ] Visibility analysis
  - [ ] Recommendation generation
  - [ ] Schema generation
  - [ ] Fix generation

---

### Phase 5: Testing & Quality (Week 5-6)

#### ✅ Unit Tests
- [ ] AI orchestrator tests
- [ ] Routing logic tests
- [ ] Cost calculation tests
- [ ] Vector cache tests

#### ✅ Integration Tests
- [ ] API endpoint tests
- [ ] Database integration tests
- [ ] External API mock tests
- [ ] SSE streaming tests

#### ✅ E2E Tests (Playwright)
- [ ] Command bar interaction
- [ ] Modal workflows (QAI → E-E-A-T)
- [ ] Voice input/output
- [ ] Orbital view interactions
- [ ] Fix deployment flow

#### ✅ Performance Tests
- [ ] Load testing (100 concurrent users)
- [ ] API response times (<500ms)
- [ ] Database query optimization
- [ ] Cache hit rate monitoring

#### ✅ Security Audit
- [ ] API authentication
- [ ] RBAC enforcement
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS configuration
- [ ] Rate limiting

---

### Phase 6: Monitoring & Observability (Week 6)

#### ✅ Error Tracking
- [ ] Sentry configured
- [ ] Error boundaries in React
- [ ] API error logging
- [ ] Alert rules configured

#### ✅ Analytics
- [ ] PostHog product analytics
- [ ] Vercel Analytics
- [ ] Custom event tracking
- [ ] Conversion funnels

#### ✅ Logging
- [ ] Structured logging (JSON)
- [ ] Log aggregation (Logtail)
- [ ] Log retention policies
- [ ] Search/indexing

#### ✅ Metrics Dashboard
- [ ] AI cost tracking
- [ ] API latency monitoring
- [ ] Cache hit rates
- [ ] Error rates
- [ ] User activity

#### ✅ Health Checks
- [ ] `/api/health` endpoint
- [ ] Database connectivity
- [ ] Redis connectivity
- [ ] External API status
- [ ] Cron job monitoring

---

### Phase 7: Documentation (Week 6-7)

#### ✅ Technical Docs
- [ ] Architecture documentation
- [ ] API documentation (OpenAPI)
- [ ] Database schema docs
- [ ] Deployment guide
- [ ] Environment variables guide

#### ✅ User Docs
- [ ] Onboarding guide
- [ ] Feature documentation
- [ ] Video tutorials
- [ ] FAQ

#### ✅ Developer Docs
- [ ] Contributing guide
- [ ] Code style guide
- [ ] Testing guide
- [ ] CI/CD pipeline docs

---

### Phase 8: Deployment (Week 7)

#### ✅ Pre-Deployment
- [ ] Production build succeeds
- [ ] All tests passing
- [ ] Environment variables set in Vercel
- [ ] Database migrations run
- [ ] Redis configured
- [ ] Stripe webhooks configured
- [ ] Domain configured

#### ✅ Vercel Configuration
- [ ] Production project created
- [ ] Custom domain added
- [ ] SSL certificates active
- [ ] Environment variables configured
- [ ] Cron jobs scheduled
- [ ] Edge functions configured
- [ ] CDN caching rules

#### ✅ Post-Deployment
- [ ] Smoke tests on production
- [ ] Health checks passing
- [ ] Monitoring dashboards live
- [ ] Error tracking active
- [ ] Analytics collecting data

---

### Phase 9: Go-Live Checklist (Week 8)

#### ✅ Final Verification
- [ ] All critical features working
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Backup/restore tested
- [ ] Rollback plan documented

#### ✅ Launch Preparation
- [ ] Support channels ready
- [ ] On-call schedule set
- [ ] Launch announcement prepared
- [ ] Marketing materials ready
- [ ] Customer communication plan

#### ✅ Launch Day
- [ ] Deploy to production
- [ ] Monitor dashboards
- [ ] Watch error logs
- [ ] Test user flows
- [ ] Gather initial feedback

---

## 🚨 Critical Path Items

**Must-have for production:**

1. **Environment Variables** - All API keys configured
2. **Database Migrations** - All tables created
3. **AI Orchestration** - Router working with failover
4. **Authentication** - Clerk SSO functional
5. **Core API Routes** - Metrics, chat, analysis endpoints
6. **Error Tracking** - Sentry configured
7. **Monitoring** - Health checks and dashboards
8. **Security** - RBAC, input validation, rate limiting

**Nice-to-have (can ship without):**

- Orbital view (can use cards only)
- Voice input (can use text only)
- Advanced analytics (can add later)
- Mobile optimization (can iterate)

---

## 📊 Success Metrics

**Week 1-2: Infrastructure**
- ✅ All env vars set
- ✅ Database migrated
- ✅ Core APIs working

**Week 3-4: Features**
- ✅ Command bar functional
- ✅ Modals working
- ✅ AI orchestration tested

**Week 5-6: Quality**
- ✅ Tests passing
- ✅ Security audit passed
- ✅ Performance acceptable

**Week 7-8: Production**
- ✅ Deployed to Vercel
- ✅ Monitoring active
- ✅ First users onboarded

---

## 🛠️ Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run database migrations
npx prisma migrate deploy
npx prisma generate

# 4. Initialize vector cache
# Run SQL from lib/ai/vector-cache.ts in Supabase SQL Editor

# 5. Test locally
npm run dev

# 6. Build for production
npm run build

# 7. Deploy to Vercel
vercel --prod
```

---

## 📞 Support Resources

- **Architecture**: `docs/CHIEF_CLARITY_OFFICER.md`
- **Deployment**: `DEPLOYMENT.md`
- **API Docs**: `docs/API.md` (to be created)
- **Troubleshooting**: Check Sentry, Vercel logs, Supabase logs

---

**Target Launch Date**: 8 weeks from start

**Current Status**: Phase 1 in progress (Infrastructure setup)

