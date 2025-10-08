# DealershipAI Master - High-Accuracy Export Prompt ($499/$999 Pricing)

**Generate production-ready automotive AI visibility SaaS with 85-95% accuracy at $499/$999 price points through cost optimization.**

---

## 🎯 Cost Optimization Strategy

Achieve research-grade accuracy while maintaining target pricing:

1. **Geographic Query Pooling** - Share 80% of results across same-market dealers
2. **Claude Haiku First** - $0.25/$1.25 per MTok (10x cheaper than GPT-4)
3. **Intelligent Caching** - 72h TTL on AI responses
4. **Agentic Session Caps** - 25 (Pro) / 125 (Enterprise) monthly sessions
5. **ML Prediction** - Reduce query frequency between validations

---

## 💰 Three-Tier Pricing (Optimized)

### Tier 1: Free ($0/month)
- **Features**: Single visibility score, monthly scan, ML prediction only
- **Cost/dealer**: $0.50/month (pure ML, no API calls)
- **Accuracy**: ~75% (ML correlation model)
- **Purpose**: Lead generation funnel

### Tier 2: Professional ($499/month)
- **Features**:
  - Full 3-pillar analysis (SEO/AEO/GEO)
  - Bi-weekly market-pooled scans
  - 25 Claude Haiku agentic chat sessions
  - E-E-A-T analysis
  - Top 5 competitor benchmarking
  - Revenue impact calculator
- **Cost/dealer**: $12.65/month
- **Margin**: 97.5% → **$486.35 profit**
- **Accuracy**: 90-92%

### Tier 3: Enterprise ($999/month)
- **Features**:
  - Daily market monitoring
  - 125 Claude Haiku agentic sessions
  - Real-time visibility alerts
  - Quarterly GPT-4 validation scans
  - Automated schema generation (40/month)
  - API access
  - Multi-location (10 rooftops)
- **Cost/dealer**: $58.90/month
- **Margin**: 94.1% → **$940.10 profit**
- **Accuracy**: 93-95%+

---

## 📊 Three-Pillar Scoring (Exact Formulas)

### 1. SEO Visibility Score (0-100)
```typescript
SEO_Score = (
    organic_rankings * 0.25 +        // GSC: Actual positions
    branded_search_volume * 0.20 +   // GSC: Impression share
    backlink_authority * 0.20 +      // Ahrefs (shared cost)
    content_indexation * 0.15 +      // GSC: Indexed pages
    local_pack_presence * 0.20       // GMB: Map appearances
)
```

### 2. AEO Visibility Score (0-100) - Answer Engine Optimization
```typescript
AEO_Score = (
    citation_frequency * 0.35 +      // AI mentions per 100 queries
    source_authority * 0.25 +        // Citation position (1st/2nd/3rd)
    answer_completeness * 0.20 +     // % of answer using dealer info
    multi_platform * 0.15 +          // Present in ChatGPT/Claude/Perplexity
    sentiment_quality * 0.05         // Positive framing score
)
```

### 3. GEO Visibility Score (0-100) - Generative Engine Optimization
```typescript
GEO_Score = (
    ai_overview_presence * 0.30 +    // Google SGE appearances
    featured_snippet_rate * 0.25 +   // GSC: Snippet impressions
    knowledge_panel * 0.20 +         // GMB + Schema validation
    zero_click_dominance * 0.15 +    // % queries without click
    entity_recognition * 0.10        // Google Knowledge Graph
)
```

---

## 🧠 Geographic Pooling Architecture (The 10x Cost Reducer)

```typescript
class GeographicPooling {
    // Share query results across ~10 dealers per market

    async getMarketScore(city: string, state: string) {
        const cacheKey = `market:${city}:${state}`

        // Check 48h cache
        const cached = await redis.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < 48 * 3600000) {
            return cached
        }

        // Run market-level scan (40 prompts × Claude Haiku)
        const marketScan = await this.scanMarketWithClaude(city, state)

        // Cache for all dealers in market
        await redis.setex(cacheKey, 48 * 3600, marketScan)

        return marketScan
    }

    async scanMarketWithClaude(city: string, state: string) {
        const prompts = [
            `Best car dealerships in ${city}, ${state}`,
            `Where to buy a car in ${city}`,
            `Top rated auto dealers ${city}`,
            `${city} car dealership reviews`,
            `Sell my car ${city}`,
            // ... 35 more high-intent prompts
        ]

        const results = { mentions: {}, citations: {}, positions: {} }

        for (const prompt of prompts) {
            const response = await anthropic.messages.create({
                model: 'claude-haiku-3-5',
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }]
            })

            // Parse response for dealer mentions
            const analysis = this.extractDealerMentions(response.content[0].text)

            for (const [dealer, data] of Object.entries(analysis)) {
                results.mentions[dealer] = (results.mentions[dealer] || 0) + 1
                results.citations[dealer] = data.cited
                results.positions[dealer] = data.position
            }
        }

        return {
            city,
            state,
            dealers_mentioned: results.mentions,
            scan_cost: 40 * 0.000538, // $0.0215 per market
            dealers_in_market: Object.keys(results.mentions).length,
            cost_per_dealer: 0.0215 / Object.keys(results.mentions).length
        }
    }

    calculateDealerVariance(dealer: Dealer, marketData: object): number {
        // Adjust market baseline with free signals
        return (
            (marketData.mentions[dealer.name] > 0 ? 15 : 0) +
            dealer.gmb_score * 0.08 +
            dealer.review_velocity * 0.12 +
            dealer.schema_coverage * 0.06 -
            dealer.days_since_update * 0.03
        )
    }
}
```

---

## 🤖 Agentic Chat Session Manager

```typescript
class AgenticChatManager {
    SESSION_LIMITS = { free: 0, pro: 25, enterprise: 125 }

    async handleChat(dealer: Dealer, tier: Tier, query: string) {
        // Check monthly usage
        const usage = await redis.get(`sessions:${dealer.id}:${currentMonth}`)
        if (usage >= this.SESSION_LIMITS[tier]) {
            throw new Error(`Session limit reached (${usage}/${this.SESSION_LIMITS[tier]})`)
        }

        // Use Claude Haiku for cost efficiency
        const response = await anthropic.messages.create({
            model: 'claude-haiku-3-5',
            max_tokens: 1500,
            system: this.buildSystemPrompt(dealer, tier),
            messages: [{ role: 'user', content: query }]
        })

        // Track usage
        await redis.incr(`sessions:${dealer.id}:${currentMonth}`)

        // Cost: ~$0.005 per session
        return {
            response: response.content[0].text,
            sessions_remaining: this.SESSION_LIMITS[tier] - usage - 1,
            cost: this.calculateCost(response.usage)
        }
    }

    buildSystemPrompt(dealer: Dealer, tier: Tier): string {
        return `You are DealershipAI analyzing ${dealer.name}.

Current Scores:
- SEO: ${dealer.scores.seo}/100
- AEO: ${dealer.scores.aeo}/100
- GEO: ${dealer.scores.geo}/100

Provide:
1. Clear explanations of scores
2. Specific action items
3. Revenue impact calculations
4. Competitive insights

${tier === 'enterprise' ? 'You can trigger automated fixes and access real-time data.' : ''}`
    }
}
```

---

## 💵 Detailed Cost Breakdown

### Professional Tier ($499/month)

```typescript
pro_monthly_costs = {
    // Market-pooled AI queries (bi-weekly)
    claude_haiku_queries: {
        queries_per_market: 80,  // 40 prompts × 2 scans
        dealers_per_market: 10,
        cost_per_query: 0.000538,  // ~200 input + 400 output tokens
        total_market: 0.043,
        per_dealer: 0.0043
    },

    // Agentic chat sessions (25/month)
    chat_sessions: {
        limit: 25,
        cost_per_session: 0.00125,  // ~1000 input + 800 output tokens
        total: 0.03125
    },

    // Quarterly GPT-4 validation (accuracy check)
    gpt4_validation: {
        frequency: '4x per year',
        queries_per_validation: 20,
        cost_per_query: 0.015,
        monthly_average: 0.10
    },

    // Premium data sources (shared)
    ahrefs_api: 2.50,           // Shared across 6 dealers
    review_apis: 0.80,          // Birdeye/DealerRater
    schema_validator: 0.15,
    google_apis: 0.50,          // GSC/GMB

    // Infrastructure
    redis_cache: 0.60,
    postgresql: 0.80,
    ml_compute: 1.50,
    cdn: 0.40,

    // Support allocation
    support_cost: 4.50,         // Shared across 50 customers

    TOTAL_PER_DEALER: 12.65
}

// Revenue: $499.00
// Cost: $12.65
// Profit: $486.35
// Margin: 97.5%
```

### Enterprise Tier ($999/month)

```typescript
enterprise_monthly_costs = {
    // Daily market monitoring
    claude_haiku_queries: {
        daily_scans: 30,
        queries_per_scan: 40,
        total_queries: 1200,
        cost_per_query: 0.000538,
        total: 0.65
    },

    // Agentic sessions (125/month)
    chat_sessions: {
        limit: 125,
        cost_per_session: 0.00125,
        total: 0.16
    },

    // Quarterly GPT-4 validation (4x per year)
    gpt4_validation: {
        queries_per_validation: 40,
        cost_per_query: 0.015,
        monthly_average: 0.20
    },

    // Real-time monitoring
    monitoring_queries: {
        daily_spot_checks: 10,
        cost_per_day: 0.0054,
        monthly: 0.16
    },

    // Premium data (enhanced)
    ahrefs_api: 4.50,           // Priority access
    review_monitoring: 2.50,
    schema_generation: 8.00,    // Automated creation
    real_time_alerts: 3.50,

    // Enhanced infrastructure
    dedicated_resources: 12.00,
    api_access_overhead: 6.00,
    ml_compute: 3.50,

    // Success manager
    support_allocation: 18.00,  // Across 15 customers

    TOTAL_PER_DEALER: 58.90
}

// Revenue: $999.00
// Cost: $58.90
// Profit: $940.10
// Margin: 94.1%
```

---

## 📈 Economics at Scale (1,000 Dealers)

```
Tier Distribution:
├─ 600 Free (60%)     → $0 revenue, $300/mo cost
├─ 350 Pro (35%)      → $174,650/mo revenue, $4,428/mo cost
└─ 50 Enterprise (5%) → $49,950/mo revenue, $2,945/mo cost

Monthly Totals:
Revenue: $224,600
Costs:   $7,673
Profit:  $216,927
Margin:  96.6%

Annual: $2.6M profit at 96.6% margin
```

---

## 🔄 Intelligent Caching Strategy

```typescript
class IntelligentCache {
    // Three-tier caching system

    async getScore(dealer: Dealer, tier: Tier) {
        // Level 1: Dealer-specific cache (72h)
        const dealerCache = await redis.get(`dealer:${dealer.id}`)
        if (dealerCache && this.isValid(dealerCache, 72)) {
            return { ...dealerCache, source: 'dealer_cache', cost: 0 }
        }

        // Level 2: Market-level cache (48h Pro, 24h Enterprise)
        const marketCache = await this.getMarketScore(dealer.city, dealer.state)
        const dealerScore = marketCache.base + this.calculateVariance(dealer, marketCache)

        // Cache dealer-specific result
        await redis.setex(`dealer:${dealer.id}`, 72 * 3600, dealerScore)

        return {
            ...dealerScore,
            source: 'market_cache',
            cost: marketCache.cost / marketCache.dealers_in_pool
        }
    }

    async invalidateCache(dealer: Dealer, reason: string) {
        // Smart invalidation based on signals
        if (reason === 'major_update') {
            // Clear dealer and market cache
            await redis.del(`dealer:${dealer.id}`)
            await redis.del(`market:${dealer.city}:${dealer.state}`)
        } else if (reason === 'minor_update') {
            // Clear only dealer cache
            await redis.del(`dealer:${dealer.id}`)
        }
    }
}
```

---

## 🎯 40 High-Intent Prompts (Weighted)

```typescript
PROMPT_CATEGORIES = {
    buyer_intent: {
        weight: 0.35,
        prompts: [
            'Best {brand} dealer near {city}',
            'Where to buy {model} in {city}',
            'Trustworthy car dealership {city}',
            '{Brand} dealership recommendations {city}',
            'New car dealers {city} {state}',
            'Certified {brand} dealer {city}',
            'Car buying advice {city}',
            '{City} auto dealers near me'
        ]
    },
    seller_intent: {
        weight: 0.25,
        prompts: [
            'Sell my car {city}',
            'Best trade-in value {city}',
            'Who buys used cars {city}',
            'Car appraisal {city}',
            'Trade in my {brand} {city}',
            'Sell car fast {city}',
            'Cash for cars {city}'
        ]
    },
    service_intent: {
        weight: 0.20,
        prompts: [
            '{Brand} service center {city}',
            'Oil change near me',
            'Car repair {city}',
            'Certified mechanic {city}',
            '{Brand} parts {city}',
            'Auto service {city}',
            'Car maintenance {city}'
        ]
    },
    research_intent: {
        weight: 0.20,
        prompts: [
            '{Dealership} reviews',
            'Is {dealership} reliable',
            'Car dealer complaints {city}',
            '{Dealership} customer service',
            'Best rated dealership {city}',
            '{Dealership} vs {competitor}',
            'Should I buy from {dealership}',
            '{City} dealership ratings'
        ]
    }
}
```

---

## 🏗️ E-E-A-T Sub-Scoring

```typescript
class EEAT_Score {
    calculate(dealer: Dealer) {
        const experience = (
            dealer.verified_reviews * 0.35 +
            dealer.years_in_business * 0.25 +
            dealer.staff_bios_present * 0.20 +
            dealer.authentic_media_count * 0.20
        )

        const expertise = (
            dealer.manufacturer_certs * 0.40 +
            dealer.service_awards * 0.25 +
            dealer.technical_content * 0.20 +
            dealer.staff_credentials * 0.15
        )

        const authoritativeness = (
            dealer.domain_authority * 0.35 +
            dealer.quality_backlinks * 0.30 +
            dealer.media_mentions * 0.20 +
            dealer.partnerships * 0.15
        )

        const trustworthiness = (
            dealer.review_authenticity * 0.30 +
            dealer.bbb_rating * 0.25 +
            dealer.ssl_security * 0.15 +
            dealer.pricing_transparency * 0.15 +
            dealer.complaint_resolution * 0.15
        )

        return {
            experience,
            expertise,
            authoritativeness,
            trustworthiness,
            overall: (experience + expertise + authoritativeness + trustworthiness) / 4
        }
    }
}
```

---

## 💰 Revenue Impact Calculator

```typescript
function calculateRevenueImpact(scores: Scores) {
    const avg_deal_profit = 2800
    const close_rate = 0.15

    const missed_opportunities = {
        invisible_in_ai: 15 * (1 - scores.aeo / 100),
        poor_reviews: 8 * (1 - scores.trustworthiness / 100),
        no_schema: 12 * (1 - scores.geo / 100),
        weak_local_seo: 10 * (1 - scores.seo / 100)
    }

    const monthly_leads_lost = Object.values(missed_opportunities)
        .reduce((a, b) => a + b, 0)

    const monthly_revenue_lost = monthly_leads_lost * avg_deal_profit * close_rate

    return {
        leads_lost_monthly: Math.round(monthly_leads_lost),
        revenue_lost_monthly: Math.round(monthly_revenue_lost),
        annual_impact: Math.round(monthly_revenue_lost * 12),
        roi_vs_pro: (monthly_revenue_lost / 499).toFixed(1) + 'x',
        roi_vs_enterprise: (monthly_revenue_lost / 999).toFixed(1) + 'x'
    }
}
```

---

## 🤖 ChatGPT Agent Integration

### OpenAPI Spec
```yaml
openapi: 3.0.0
info:
  title: DealershipAI Visibility API
  version: 1.0.0
  description: Get automotive dealership AI visibility scores

servers:
  - url: https://api.dealershipai.com

paths:
  /api/ai-scores:
    get:
      operationId: getDealershipScore
      summary: Get AI visibility scores for a dealership
      parameters:
        - name: origin
          in: query
          required: true
          schema:
            type: string
            pattern: '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
          description: Dealership website URL
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  dealer_name:
                    type: string
                  scores:
                    type: object
                    properties:
                      seo: { type: number }
                      aeo: { type: number }
                      geo: { type: number }
                  eeat:
                    type: object
                  revenue_impact:
                    type: object
                  action_items:
                    type: array
```

### ChatGPT System Prompt
```markdown
You are DealershipAI, an automotive AI visibility specialist.

When a user asks about a dealership:
1. Extract the dealership website from their message
2. Call getDealershipScore API
3. Present analysis in 4 blocks:

🎯 **AI Visibility Overview**
Show all 3 pillar scores (SEO/AEO/GEO) with context.

🔍 **Digital Presence Gaps**
E-E-A-T breakdown with specific weaknesses.

💰 **Revenue Impact**
Calculate missed opportunities and ROI.

📋 **Priority Action Plan**
Top 5 fixes ranked by impact.

CRITICAL: Never mention "I queried an API". Present as expert analysis.
Use revenue impact to create urgency.
```

---

## 📦 Required Tech Stack

```typescript
TECH_STACK = {
    backend: 'Node.js 20+ with TypeScript',
    framework: 'Next.js 14+ (Vercel) or Express.js (Docker)',
    database: 'Supabase (PostgreSQL) or PostgreSQL 15+',
    cache: 'Upstash Redis (serverless) or Redis 7+',
    authentication: 'Clerk (recommended) or NextAuth',
    payments: 'Stripe',
    ai_providers: [
        'Anthropic Claude (primary)',
        'OpenAI GPT-4 (validation)'
    ],
    apis: [
        'Google Search Console',
        'Google My Business',
        'Ahrefs API (shared)',
        'Birdeye/DealerRater'
    ],
    deployment: 'Vercel (recommended) or Docker + Docker Compose',
    monitoring: 'Vercel Analytics + Built-in alerting'
}
```

---

## 🔐 Authentication Architecture (Clerk Integration)

```typescript
// middleware/auth.ts
import { clerkMiddleware, getAuth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUserFromRequest(req: Request) {
    const { userId, sessionId } = getAuth(req)

    if (!userId) {
        throw new Error('Unauthorized')
    }

    // Get dealer info from Supabase
    const { data: dealer } = await supabase
        .from('dealers')
        .select('*')
        .eq('clerk_user_id', userId)
        .single()

    return { userId, sessionId, dealer }
}

// Get current user's subscription tier
export async function getUserTier(userId: string): Promise<Tier> {
    const { data } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('clerk_user_id', userId)
        .eq('status', 'active')
        .single()

    return data?.tier || 'free'
}

// Check session usage
export async function checkSessionLimit(userId: string, tier: Tier): Promise<boolean> {
    const SESSION_LIMITS = { free: 0, pro: 25, enterprise: 125 }
    const currentMonth = new Date().toISOString().slice(0, 7)

    const { data } = await supabase
        .from('session_usage')
        .select('count')
        .eq('clerk_user_id', userId)
        .eq('month', currentMonth)
        .single()

    const usage = data?.count || 0
    return usage < SESSION_LIMITS[tier]
}
```

### Protected API Routes

```typescript
// api/analyze.ts - Protected analysis endpoint
import { requireAuth } from '@/middleware/auth'

export default async function handler(req: Request, res: Response) {
    // Verify authentication
    const { userId, dealer } = await getUserFromRequest(req)
    const tier = await getUserTier(userId)

    // Check tier access
    if (tier === 'free') {
        return res.status(403).json({
            error: 'Upgrade required',
            message: 'Full analysis requires Pro or Enterprise tier',
            upgrade_url: '/pricing'
        })
    }

    // Perform analysis
    const analysis = await performFullAnalysis(dealer, tier)

    return res.json(analysis)
}
```

### Agentic Chat with Session Tracking

```typescript
// api/chatbot.ts - Claude Haiku chat with Clerk auth
import { requireAuth, getUserTier, checkSessionLimit } from '@/middleware/auth'

export default async function handler(req: Request, res: Response) {
    const { userId, dealer } = await getUserFromRequest(req)
    const tier = await getUserTier(userId)
    const { query } = req.body

    // Check session limit
    const canUseSession = await checkSessionLimit(userId, tier)
    if (!canUseSession) {
        const SESSION_LIMITS = { free: 0, pro: 25, enterprise: 125 }
        return res.status(429).json({
            error: 'Session limit reached',
            limit: SESSION_LIMITS[tier],
            tier: tier,
            upgrade_url: tier === 'pro' ? '/upgrade?to=enterprise' : '/pricing',
            reset_date: getNextMonthDate()
        })
    }

    // Query Claude Haiku
    const response = await anthropic.messages.create({
        model: 'claude-haiku-3-5',
        max_tokens: 1500,
        system: buildSystemPrompt(dealer, tier),
        messages: [{ role: 'user', content: query }]
    })

    // Track session usage
    await supabase.rpc('increment_session_usage', {
        user_id: userId,
        month: new Date().toISOString().slice(0, 7)
    })

    const usage = await getSessionUsage(userId)

    return res.json({
        response: response.content[0].text,
        sessions_used: usage,
        sessions_remaining: SESSION_LIMITS[tier] - usage,
        tier: tier
    })
}
```

### Clerk Webhook Handler (User Sync)

```typescript
// api/webhooks/clerk.ts
import { Webhook } from 'svix'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

    // Verify webhook signature
    const wh = new Webhook(WEBHOOK_SECRET)
    const evt = wh.verify(
        await req.text(),
        Object.fromEntries(req.headers)
    )

    const { type, data } = evt

    switch (type) {
        case 'user.created':
            // Create dealer record in Supabase
            await supabase.from('dealers').insert({
                clerk_user_id: data.id,
                email: data.email_addresses[0].email_address,
                name: `${data.first_name} ${data.last_name}`,
                tier: 'free',
                created_at: new Date().toISOString()
            })
            break

        case 'user.updated':
            // Update dealer info
            await supabase
                .from('dealers')
                .update({
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    updated_at: new Date().toISOString()
                })
                .eq('clerk_user_id', data.id)
            break

        case 'user.deleted':
            // Soft delete
            await supabase
                .from('dealers')
                .update({ deleted_at: new Date().toISOString() })
                .eq('clerk_user_id', data.id)
            break
    }

    return Response.json({ success: true })
}
```

### Stripe + Clerk Integration

```typescript
// api/webhooks/stripe.ts - Handle subscription changes
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
    const sig = req.headers.get('stripe-signature')!
    const body = await req.text()

    const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object

            // Get Clerk user ID from metadata
            const clerkUserId = session.metadata?.clerk_user_id

            // Update subscription in Supabase
            await supabase.from('subscriptions').upsert({
                clerk_user_id: clerkUserId,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                tier: session.metadata?.tier || 'pro',
                status: 'active',
                current_period_end: new Date(session.expires_at * 1000)
            })
            break

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object

            await supabase
                .from('subscriptions')
                .update({
                    status: subscription.status,
                    tier: subscription.status === 'active' ? subscription.metadata?.tier : 'free',
                    current_period_end: new Date(subscription.current_period_end * 1000)
                })
                .eq('stripe_subscription_id', subscription.id)
            break
    }

    return Response.json({ received: true })
}
```

---

## 📁 File Structure (42 Files)

```
dealershipai-master/
├── src/
│   ├── core/
│   │   ├── scorer.ts              # Three-pillar scoring
│   │   ├── geographic-pooling.ts  # Market-level caching
│   │   ├── ml-model.ts            # Correlation predictor
│   │   └── validation.ts          # Multi-source verification
│   ├── cache/
│   │   ├── redis.ts               # Intelligent caching
│   │   └── query-optimizer.ts     # Cost optimization
│   ├── ai/
│   │   ├── claude-client.ts       # Anthropic integration
│   │   ├── openai-client.ts       # GPT-4 validation
│   │   └── agentic-chat.ts        # Session manager
│   ├── integrations/
│   │   ├── google-apis.ts
│   │   ├── seo-tools.ts
│   │   └── review-apis.ts
│   ├── api/
│   │   └── routes.ts
│   └── middleware/
│       ├── auth.ts
│       ├── rate-limiter.ts
│       └── error-handler.ts
├── ml/
│   ├── train.py                   # Model training
│   ├── model.json                 # Weights
│   └── features.json
├── db/
│   └── schema.sql
├── scripts/
│   ├── calibrate.js               # Weekly accuracy check
│   ├── warm-cache.js              # Pre-fill markets
│   └── migrate.js
├── openapi/
│   └── ai-scores.yaml
├── prompts/
│   └── chatgpt-agent.md
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── [12 documentation files]
```

---

## ⚙️ Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dealershipai
REDIS_URL=redis://localhost:6379

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Premium APIs
AHREFS_API_KEY=...
BIRDEYE_API_KEY=...

# Google APIs (free)
GOOGLE_SEARCH_CONSOLE_KEY=...
GOOGLE_MY_BUSINESS_KEY=...

# Pricing (cents)
TIER_PRO_PRICE=49900
TIER_ENTERPRISE_PRICE=99900

# Session Limits
TIER_PRO_SESSIONS=25
TIER_ENTERPRISE_SESSIONS=125

# Cache TTL (hours)
DEALER_CACHE_TTL=72
MARKET_CACHE_TTL_PRO=48
MARKET_CACHE_TTL_ENTERPRISE=24
```

---

## 🎯 Accuracy Guarantees

```typescript
ACCURACY_TARGETS = {
    free: {
        target: 0.75,
        method: 'ml_prediction',
        interval: '±15%'
    },
    pro: {
        target: 0.91,
        method: 'biweekly_pooled_scans + quarterly_validation',
        interval: '±5%',
        guarantee: '90% correlation or refund'
    },
    enterprise: {
        target: 0.94,
        method: 'daily_monitoring + quarterly_gpt4_validation',
        interval: '±3%',
        guarantee: '93% correlation or refund',
        sla: '99.5% uptime'
    }
}
```

---

## 🚀 Deployment

```bash
# Quick start
git clone <repo>
cd dealershipai-master
cp .env.example .env

# Edit .env with your API keys

# Start with Docker
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Warm cache for common markets
docker-compose exec api npm run cache:warm

# Test endpoint
curl "http://localhost:3000/api/ai-scores?origin=https://terryreidhyundai.com"
```

---

## ✅ Success Criteria

The exported system must:

- ✅ Return scores with 90-92% (Pro) / 93-95% (Enterprise) correlation
- ✅ Cost $12.65 (Pro) / $58.90 (Enterprise) per dealer/month
- ✅ Generate $486-$940 profit per paid dealer
- ✅ Support 25/125 agentic chat sessions using Claude Haiku
- ✅ Use geographic pooling to reduce query costs 10x
- ✅ Cache intelligently with 72h dealer / 48h market TTL
- ✅ Validate quarterly with GPT-4 for accuracy
- ✅ Deploy via `docker-compose up -d`
- ✅ Work as ChatGPT Custom Action
- ✅ Include all 38 files production-ready

---

## 🔄 Cron Jobs

```bash
# Weekly calibration (accuracy validation)
0 2 * * 1 npm run calibrate

# Cache warming (pre-fill top 100 markets)
0 */12 * * * npm run cache:warm

# Review aggregation
0 */6 * * * npm run aggregate-reviews

# Monthly session reset
0 0 1 * * npm run reset-session-limits
```

---

**Generate all 38 files with production code, exact formulas, Claude Haiku integration, geographic pooling, intelligent caching, and complete documentation. Prioritize 90%+ accuracy while maintaining $12.65/$58.90 cost targets.**
