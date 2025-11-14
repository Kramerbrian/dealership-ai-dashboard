# Integration Manifest
**Platform**: DealershipAI Trust OS
**Phase**: Post-Audit Integration & Activation
**Timeline**: 12 weeks (accelerated from 24 weeks)
**Status**: Ready to execute

---

## Integration Strategy

Based on the infrastructure audit, we're shifting from "build" to "integrate & activate" mode. Most components exist but need connection, configuration, and testing.

### Methodology
1. **Activate** dormant features with configuration changes
2. **Integrate** isolated components into workflows
3. **Document** existing undocumented systems
4. **Test** end-to-end scenarios
5. **Optimize** performance and UX

---

## Week 1: Foundation Completion

### ✅ Already Complete
- [x] Manifest system operational
- [x] Validation scripts working
- [x] GitHub Actions nightly sync
- [x] Edge Runtime migration (34 endpoints)
- [x] Knowledge graph endpoints (mock data mode)
- [x] Build passing (clean .next cache)

### 🎯 This Week's Goals

#### 1. Neo4j Aura Provisioning (Day 1, 15 min)
**Owner**: DevOps / Platform Engineer
**Priority**: Critical (blocks Phase 2 completion)

**Steps**:
```bash
# 1. Sign up at neo4j.com/cloud/aura (free tier)
# 2. Create database instance
# 3. Copy connection credentials
# 4. Add to Vercel environment variables
vercel env add NEO4J_URI production
vercel env add NEO4J_PASSWORD production

# 5. Redeploy
vercel --prod

# 6. Verify knowledge graph is live
curl https://dealershipai.com/api/knowledge-graph?dealerId=test&type=metrics
# Should return real data instead of mock
```

**Verification**:
- [ ] `/api/knowledge-graph` returns data (not 503)
- [ ] `/api/dealer-twin` calculates health scores
- [ ] `scripts/graph-sync.ts` runs without errors

**Impact**: Enables causal reasoning, dealer digital twins, metric correlations

---

#### 2. OEM Monitor Cron Activation (Day 1, 30 min)
**Owner**: Backend Engineer
**Priority**: High

**Steps**:
```jsonc
// vercel.json - Add cron schedule
{
  "crons": [
    {
      "path": "/api/oem/monitor",
      "schedule": "0 9 * * *" // Daily at 9am UTC
    }
  ]
}
```

```bash
# Deploy cron configuration
vercel --prod

# Manual test
curl -X POST https://dealershipai.com/api/oem/monitor \
  -H "Content-Type: application/json" \
  -d '{"oem": "Toyota"}'
```

**Verification**:
- [ ] Cron appears in Vercel dashboard
- [ ] Manual POST returns OEM updates
- [ ] Pulse inbox receives tiles
- [ ] Check logs for daily execution

**Impact**: Automated OEM model-year updates → Pulse inbox → dealer notifications

---

#### 3. Weather API Integration (Day 2, 2 hours)
**Owner**: Backend Engineer
**Priority**: High

**Implementation**:
```typescript
// lib/context/weather.ts (NEW FILE)
export interface WeatherContext {
  condition: string;
  temperature: number;
  impact: number; // -1 to 1
  timestamp: string;
}

export async function fetchWeatherContext(
  lat: number,
  lon: number
): Promise<WeatherContext> {
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  if (!WEATHER_API_KEY) {
    throw new Error('WEATHER_API_KEY not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  // Calculate impact score based on conditions
  let impact = 0;
  if (data.weather[0].main === 'Clear') impact = 0.15;
  if (data.weather[0].main === 'Rain') impact = -0.25;
  if (data.weather[0].main === 'Snow') impact = -0.40;
  if (data.main.temp > 85 || data.main.temp < 25) impact -= 0.20;

  return {
    condition: data.weather[0].main,
    temperature: Math.round(data.main.temp),
    impact,
    timestamp: new Date().toISOString(),
  };
}
```

```typescript
// app/api/knowledge-graph/route.ts - Update weather query
case 'weather':
  if (!dealerId) {
    return NextResponse.json(
      { ok: false, error: 'dealerId required for weather query' },
      { status: 400 }
    );
  }

  // Fetch dealer location from database
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { latitude: true, longitude: true },
  });

  if (!dealer) {
    return NextResponse.json({ ok: false, error: 'Dealer not found' }, { status: 404 });
  }

  // Fetch live weather
  const weatherContext = await fetchWeatherContext(dealer.latitude, dealer.longitude);

  // Store in Neo4j (if configured)
  // ... Cypher query to create Weather node ...

  return NextResponse.json({
    ok: true,
    data: [weatherContext],
  });
```

**Environment Setup**:
```bash
# 1. Sign up at openweathermap.org/api (free tier)
# 2. Get API key
# 3. Add to environment
vercel env add WEATHER_API_KEY production
```

**Verification**:
- [ ] `/api/knowledge-graph?dealerId=X&type=weather` returns live data
- [ ] Weather impact reflected in dealer-twin health score
- [ ] No mock data warnings in logs

**Impact**: Context-aware insights, weather correlation analysis

---

#### 4. Update Rollout Documentation (Day 3, 4 hours)
**Owner**: Product Manager / Tech Lead
**Priority**: Medium

**Tasks**:
- [ ] Add orchestrator system to rollout plan
- [ ] Document all 227 API routes with descriptions
- [ ] Update phase completion percentages
- [ ] Create API route index/directory
- [ ] Add architecture diagrams (Mermaid)

**Deliverables**:
```
docs/
├── API_DIRECTORY.md              - Catalog of all 227 routes
├── ORCHESTRATOR_GUIDE.md         - How orchestrator works
├── ARCHITECTURE_DIAGRAMS.md      - System architecture
└── meta-learning-rollout-plan.md - Updated with audit findings
```

---

#### 5. Deployment Health Monitoring (Day 4-5, 1 day)
**Owner**: DevOps
**Priority**: High

**Tools to Integrate**:
```bash
# Sentry for error tracking
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Vercel Analytics (built-in)
# Enable in Vercel dashboard > Analytics

# Uptime monitoring
# Sign up at uptimerobot.com or betteruptime.com
# Add endpoints:
# - https://dealershipai.com/api/status
# - https://dealershipai.com/healthcheck
```

**Custom Health Endpoint**:
```typescript
// app/api/health/route.ts (ENHANCE EXISTING)
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    neo4j: await checkNeo4j(),
    openai: await checkOpenAI(),
    edge: true, // Always true for Edge endpoints
  };

  const healthy = Object.values(checks).every(Boolean);

  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, {
    status: healthy ? 200 : 503,
  });
}
```

**Verification**:
- [ ] Sentry captures errors in production
- [ ] Vercel Analytics shows traffic data
- [ ] Uptime monitor alerts on downtime
- [ ] `/api/health` returns all subsystem status

---

## Week 2-3: Phase 3 Activation (Context + Copilot)

### Already Built
✅ Copilot system with mood/tone/theme
✅ Data telemetry infrastructure
✅ Theme controller and CSS variables
✅ Feedback UI (👍/👎)

### Integration Tasks

#### 6. Local Events Feed Integration (Week 2, 2 days)
**Owner**: Backend Engineer
**Priority**: Medium

**Data Source Options**:
1. Eventbrite API
2. Local chamber of commerce RSS feeds
3. Ticketmaster Discovery API
4. Custom scraping (city event calendars)

**Implementation**:
```typescript
// lib/context/events.ts (NEW FILE)
export interface LocalEvent {
  name: string;
  date: string;
  distance: number; // miles from dealer
  category: string; // 'auto_show' | 'festival' | 'sports' | 'other'
  impact: number; // 0-1
}

export async function fetchLocalEvents(
  lat: number,
  lon: number,
  radius: number = 25
): Promise<LocalEvent[]> {
  // Example: Eventbrite API
  const response = await fetch(
    `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${lat}&location.longitude=${lon}&location.within=${radius}mi&token=${process.env.EVENTBRITE_API_KEY}`
  );

  const data = await response.json();

  return data.events.map((event: any) => ({
    name: event.name.text,
    date: event.start.local,
    distance: calculateDistance(lat, lon, event.venue.latitude, event.venue.longitude),
    category: categor izeEvent(event.name.text),
    impact: calculateEventImpact(event),
  }));
}

function categorizeEvent(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('auto') || lower.includes('car')) return 'auto_show';
  if (lower.includes('festival') || lower.includes('fair')) return 'festival';
  if (lower.includes('game') || lower.includes('sports')) return 'sports';
  return 'other';
}

function calculateEventImpact(event: any): number {
  // Auto shows have high impact, others medium
  const category = categorizeEvent(event.name.text);
  if (category === 'auto_show') return 0.80;
  if (category === 'festival') return 0.40;
  if (category === 'sports') return 0.25;
  return 0.10;
}
```

**Verification**:
- [ ] Events appear in knowledge graph
- [ ] Dealer twin recommendations mention events
- [ ] High-impact events (auto shows) flagged

---

#### 7. Copilot Personality Tuning (Week 2-3, 3 days)
**Owner**: Product Manager + AI Engineer
**Priority**: High

**Current State**:
- 3 moods: positive, neutral, reflective
- 3 tones: professional, witty, cinematic
- Basic time-of-day logic

**Enhancement Goals**:
1. Add 2 more moods: "urgent" (metrics declining), "celebratory" (major win)
2. Add regional tone variants (Southern, Midwest, Coastal)
3. A/B test tone effectiveness

**Implementation**:
```typescript
// lib/copilot-context.ts - Enhance mood logic
export function deriveCopilotMood(input: CopilotInput): CopilotMood {
  const { metrics, feedbackScore, localTime } = input;
  const hour = localTime.getHours();

  // NEW: Urgent mood for declining metrics
  if (metrics.forecastChange < -15 || metrics.aiv < 50) {
    return {
      mood: 'urgent',
      tone: 'direct', // No jokes, just facts
      prediction: 'Action needed to reverse decline',
    };
  }

  // NEW: Celebratory mood for major wins
  if (metrics.forecastChange > 20 && metrics.aiv > 90) {
    return {
      mood: 'celebratory',
      tone: 'enthusiastic',
      prediction: 'Momentum is building - capitalize on success',
    };
  }

  // Existing logic...
  let mood = 'neutral';
  if (metrics.forecastChange > 5 || metrics.aiv > 80) mood = 'positive';
  if (metrics.forecastChange < -8 || metrics.aiv < 65) mood = 'reflective';

  let tone = 'professional';
  if (feedbackScore > 0.6 && mood === 'positive') tone = 'witty';
  if (mood === 'reflective' && hour > 18) tone = 'cinematic';

  return { mood, tone, prediction: generatePrediction(metrics) };
}
```

**A/B Testing Setup**:
```typescript
// lib/experiments/copilot-tones.ts (NEW FILE)
export function assignToneVariant(dealerId: string): 'witty' | 'professional' | 'cinematic' {
  // Hash dealer ID to variant (50/25/25 split)
  const hash = hashCode(dealerId);
  if (hash % 4 === 0) return 'witty';
  if (hash % 4 === 1) return 'cinematic';
  return 'professional';
}

// Track which variant performs best based on 👍/👎 feedback
```

**Verification**:
- [ ] 5 moods operational
- [ ] Regional tones tested
- [ ] A/B test tracking feedback by variant

---

#### 8. Theme Unification Pass (Week 3, 2 days)
**Owner**: Designer + Frontend Engineer
**Priority**: Medium

**Current Issues**:
- Multiple theme systems (theme-controller, dynamic-theme, design-tokens)
- Inconsistent CSS variable usage
- Some components bypass theme system

**Consolidation Plan**:
```typescript
// lib/theme/unified.ts (NEW FILE - consolidates existing)
export interface ThemeConfig {
  mood: 'positive' | 'neutral' | 'reflective' | 'urgent' | 'celebratory';
  tone: 'professional' | 'witty' | 'cinematic' | 'direct' | 'enthusiastic';
  temporal: 'morning' | 'afternoon' | 'evening' | 'night';
  brand: 'default' | 'luxury' | 'volume';
}

export function applyUnifiedTheme(config: ThemeConfig) {
  // Import and merge existing theme controllers
  const palette = generatePalette(config.mood, config.temporal);
  const tokens = generateTokens(config.brand);

  applyThemeController({ mood: config.mood, tone: config.tone });
  applyDynamicTheme(palette);
  applyDesignTokens(tokens);
}
```

**Audit Checklist**:
- [ ] All components use CSS variables (no hardcoded colors)
- [ ] Theme transitions use Framer Motion
- [ ] Dark mode respects system preference
- [ ] High contrast mode for accessibility

---

## Week 4-5: Phase 4 Enhancement (Design & Emotional Fidelity)

### 9. Cinematic Landing Page Revival (Week 4, 3 days)
**Owner**: Frontend Engineer + Designer
**Priority**: High

**Steps**:
1. **Audit Original Component**
   ```bash
   git log --all -- components/landing/CinematicLandingPage.tsx
   # Find commit where it was removed/disabled
   ```

2. **Identify Root Cause of HTTP 500**
   - Check for missing dependencies
   - Validate all props and data sources
   - Test in isolated environment

3. **Implement Fixes**
   ```typescript
   // components/landing/CinematicLandingPage.tsx
   // Add error boundaries
   export default function CinematicLandingPage() {
     return (
       <ErrorBoundary fallback={<HeroSection_CupertinoNolan />}>
         {/* Cinematic content */}
       </ErrorBoundary>
     );
   }
   ```

4. **Feature Flag Rollout**
   ```typescript
   // app/page.tsx
   const useCinematic = featureFlags.ENABLE_CINEMATIC_LANDING && !isBot;

   return useCinematic ? <CinematicLandingPage /> : <HeroSection_CupertinoNolan />;
   ```

**Verification**:
- [ ] Component renders without errors
- [ ] Lighthouse score >= 90
- [ ] No console errors
- [ ] Framer Motion animations smooth (60fps)
- [ ] Feature flag toggles correctly

---

### 10. Visual Regression Testing Setup (Week 4-5, 2 days)
**Owner**: QA Engineer / DevOps
**Priority**: High

**Tool Selection**: Chromatic (visual diff testing for Storybook)

**Implementation**:
```bash
# 1. Install dependencies
npm install --save-dev @storybook/nextjs chromatic

# 2. Initialize Storybook
npx storybook@latest init --type nextjs

# 3. Create stories for key components
# components/landing/CinematicLandingPage.stories.tsx
import CinematicLandingPage from './CinematicLandingPage';

export default {
  title: 'Landing/CinematicLandingPage',
  component: CinematicLandingPage,
};

export const Default = () => <CinematicLandingPage />;
export const DarkMode = () => <div className="dark"><CinematicLandingPage /></div>;
export const MobileView = () => <div style={{ width: 375 }}><CinematicLandingPage /></div>;

# 4. Sign up at chromatic.com
# 5. Add to CI/CD
# .github/workflows/chromatic.yml
name: Chromatic
on: [push]
jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx chromatic --project-token=${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

**Coverage Goals**:
- [ ] 20+ component stories created
- [ ] Landing pages covered
- [ ] Dashboard views covered
- [ ] Modal dialogs covered
- [ ] CI/CD fails on visual regressions

---

## Week 6-7: Phase 5 Activation (Meta-Learning Loop)

### 11. Experiments Engine Consolidation (Week 6, 3 days)
**Owner**: Senior Backend Engineer
**Priority**: High

**Current State**:
- A/B testing logic scattered across components
- No centralized experiment tracking
- Manual result analysis

**New Centralized System**:
```typescript
// lib/experiments/engine.ts (NEW FILE)
import { prisma } from '@/lib/prisma';

export interface Experiment {
  id: string;
  name: string;
  variants: string[]; // ['control', 'variant_a', 'variant_b']
  traffic_split: number[]; // [0.5, 0.25, 0.25]
  success_metric: string; // 'conversion_rate' | 'engagement' | 'satisfaction'
  success_threshold: number; // e.g., 0.03 for 3% uplift
  status: 'draft' | 'running' | 'concluded' | 'winner_deployed';
  start_date: Date;
  end_date?: Date;
  winner?: string;
}

export class ExperimentEngine {
  /**
   * Assign user to experiment variant
   */
  static assignVariant(userId: string, experimentId: string): string {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    });

    if (!experiment || experiment.status !== 'running') {
      return 'control';
    }

    // Consistent hashing for stable assignment
    const hash = hashCode(`${userId}-${experimentId}`);
    const bucket = hash % 100;

    let cumulative = 0;
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.traffic_split[i] * 100;
      if (bucket < cumulative) {
        return experiment.variants[i];
      }
    }

    return 'control';
  }

  /**
   * Track experiment event (impression, conversion, etc.)
   */
  static async trackEvent(
    userId: string,
    experimentId: string,
    variant: string,
    eventType: 'impression' | 'conversion' | 'engagement',
    value?: number
  ) {
    await prisma.experimentEvent.create({
      data: {
        experimentId,
        userId,
        variant,
        eventType,
        value,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Analyze experiment results
   */
  static async analyzeResults(experimentId: string) {
    const events = await prisma.experimentEvent.groupBy({
      by: ['variant', 'eventType'],
      where: { experimentId },
      _count: true,
      _avg: { value: true },
    });

    // Calculate conversion rates per variant
    const results = {};
    for (const variant of events.map(e => e.variant)) {
      const impressions = events.find(
        e => e.variant === variant && e.eventType === 'impression'
      )?._count || 0;

      const conversions = events.find(
        e => e.variant === variant && e.eventType === 'conversion'
      )?._count || 0;

      results[variant] = {
        impressions,
        conversions,
        conversion_rate: impressions > 0 ? conversions / impressions : 0,
      };
    }

    // Statistical significance test (Chi-squared)
    const control = results['control'];
    const best_variant = Object.keys(results)
      .filter(v => v !== 'control')
      .reduce((best, variant) =>
        results[variant].conversion_rate > results[best].conversion_rate ? variant : best
      );

    const uplift = (results[best_variant].conversion_rate - control.conversion_rate) / control.conversion_rate;
    const significant = calculateSignificance(results['control'], results[best_variant]);

    return {
      results,
      winner: significant && uplift >= 0.03 ? best_variant : null,
      uplift,
      significant,
    };
  }

  /**
   * Auto-deploy winner if success threshold met
   */
  static async autoDeployWinner(experimentId: string) {
    const analysis = await this.analyzeResults(experimentId);

    if (analysis.winner) {
      // Update feature flag to winner variant
      await prisma.featureFlag.update({
        where: { experiment_id: experimentId },
        data: { value: analysis.winner },
      });

      // Mark experiment as concluded
      await prisma.experiment.update({
        where: { id: experimentId },
        data: {
          status: 'winner_deployed',
          winner: analysis.winner,
          end_date: new Date(),
        },
      });

      // Send notification
      await sendSlackNotification(
        `🎉 Experiment "${experimentId}" concluded! Winner: ${analysis.winner} (+${(analysis.uplift * 100).toFixed(1)}% uplift)`
      );
    }
  }
}
```

**Database Schema**:
```prisma
// prisma/schema.prisma - Add experiment tables
model Experiment {
  id              String   @id @default(cuid())
  name            String
  variants        String[]
  traffic_split   Float[]
  success_metric  String
  success_threshold Float
  status          String   @default("draft")
  start_date      DateTime
  end_date        DateTime?
  winner          String?
  events          ExperimentEvent[]
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model ExperimentEvent {
  id            String   @id @default(cuid())
  experiment_id String
  user_id       String
  variant       String
  event_type    String   // impression, conversion, engagement
  value         Float?
  timestamp     DateTime @default(now())
  experiment    Experiment @relation(fields: [experiment_id], references: [id])
}
```

**Usage Example**:
```typescript
// In a component
import { ExperimentEngine } from '@/lib/experiments/engine';

export default function CopilotComponent({ userId }: Props) {
  const toneVariant = ExperimentEngine.assignVariant(userId, 'copilot_tone_test');

  useEffect(() => {
    ExperimentEngine.trackEvent(userId, 'copilot_tone_test', toneVariant, 'impression');
  }, []);

  const handleFeedback = (positive: boolean) => {
    if (positive) {
      ExperimentEngine.trackEvent(userId, 'copilot_tone_test', toneVariant, 'conversion');
    }
  };

  return <Copilot tone={toneVariant} onFeedback={handleFeedback} />;
}
```

**Verification**:
- [ ] Experiments tracked in database
- [ ] Variants assigned consistently
- [ ] Results analyzed automatically
- [ ] Winners auto-deployed when significant

---

### 12. Executive Reporting Automation (Week 6-7, 2 days)
**Owner**: Data Analyst + Backend Engineer
**Priority**: Medium

**Current State**:
- [lib/analytics/executive-reporting.ts](lib/analytics/executive-reporting.ts) exists
- Manual generation only
- No scheduled delivery

**Automation Implementation**:
```typescript
// app/api/cron/executive-digest/route.ts (NEW FILE)
import { generateExecutiveReport } from '@/lib/analytics/executive-reporting';
import { sendSlackNotification } from '@/lib/integrations/slack';

export const runtime = 'nodejs'; // Needs long timeout
export const maxDuration = 60; // 60 seconds

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Generate report for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const report = await generateExecutiveReport({
      start_date: yesterday,
      end_date: new Date(),
      metrics: [
        'ai_visibility_index',
        'trust_score',
        'conversion_rate',
        'zero_click_coverage',
        'copilot_engagement',
      ],
    });

    // Format as Slack blocks
    const slackBlocks = formatReportForSlack(report);

    // Send to executive Slack channel
    await sendSlackNotification(slackBlocks, '#executive-daily-digest');

    // Also store in database for historical reference
    await prisma.executiveReport.create({
      data: {
        date: yesterday,
        metrics: report,
        sent_at: new Date(),
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error('Executive digest error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

function formatReportForSlack(report: any) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 Daily Executive Digest - ${new Date().toLocaleDateString()}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*AI Visibility Index*\n${report.ai_visibility_index.current} (${report.ai_visibility_index.change >= 0 ? '↑' : '↓'}${Math.abs(report.ai_visibility_index.change)}%)`,
        },
        {
          type: 'mrkdwn',
          text: `*Trust Score*\n${report.trust_score.current} (${report.trust_score.change >= 0 ? '↑' : '↓'}${Math.abs(report.trust_score.change)}%)`,
        },
      ],
    },
    // ... more blocks
  ];
}
```

**Cron Schedule**:
```jsonc
// vercel.json - Add executive digest
{
  "crons": [
    {
      "path": "/api/oem/monitor",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/executive-digest",
      "schedule": "0 13 * * *" // 1pm UTC = 8am EST
    }
  ]
}
```

**Verification**:
- [ ] Report sends daily to Slack
- [ ] Metrics accurate and up-to-date
- [ ] Historical reports stored in DB
- [ ] Formatting renders correctly in Slack

---

### 13. Orchestrator Documentation (Week 7, 1 day)
**Owner**: Tech Lead + Product Manager
**Priority**: High

**Create Documentation**:
```markdown
# docs/ORCHESTRATOR_GUIDE.md

## What is the Orchestrator?

The DealershipAI Orchestrator is an autonomous system that:
- Monitors platform health and metrics
- Detects anomalies and optimization opportunities
- Executes automated fixes and improvements
- Trains models based on feedback
- Coordinates between subsystems (copilot, pulse, analytics)

## Architecture

### API Endpoints
- `/api/orchestrator` - Main orchestrator endpoint
- `/api/orchestrator/autonomy` - Autonomous decision mode
- `/api/orchestrator/run` - Manual execution trigger
- `/api/orchestrator/train` - Model training
- `/api/orchestrator/v3/status` - System status

### Scripts
- `scripts/autonomous-orchestrator.ts` - Core logic
- `scripts/start-orchestrator.ts` - Initialization
- `scripts/test-orchestrator.ts` - Testing utilities

### Components
- `components/pulse/meta/orchestrator-console` - Admin UI

## How It Works

1. **Monitor**: Polls metrics every 5 minutes
2. **Analyze**: Detects patterns and anomalies
3. **Decide**: Determines optimal action
4. **Execute**: Applies changes automatically
5. **Learn**: Updates models based on outcomes

## Configuration

Environment variables:
- `ORCHESTRATOR_ENABLED=true` - Enable autonomous mode
- `ORCHESTRATOR_INTERVAL=300000` - Poll interval (ms)
- `ORCHESTRATOR_AUTO_DEPLOY=false` - Auto-deploy without approval

## Usage

### Starting the Orchestrator
```bash
npm run orchestrator:start
# or
node scripts/start-orchestrator.ts
```

### Viewing Status
Visit: https://dealershipai.com/pulse/meta/orchestrator-console

### Manual Trigger
```bash
curl -X POST https://dealershipai.com/api/orchestrator/run \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"action": "optimize_lighthouse"}'
```

## Autonomous Actions

The orchestrator can:
- Adjust tone weights based on feedback
- Scale edge functions based on traffic
- Rotate API keys approaching limits
- Clear caches on staleness
- Trigger retraining on drift detection
- Send alerts on critical issues

## Safety Mechanisms

- Human approval required for destructive actions
- Rollback capability for all changes
- Rate limiting (max 10 actions/hour)
- Dry-run mode for testing
- Audit log of all decisions
```

**Verification**:
- [ ] Documentation complete and accurate
- [ ] Added to main README.md
- [ ] Team trained on usage
- [ ] Admin console accessible

---

## Week 8: Reinforcement Learning Pipeline (Phase 5 completion)

### 14. Feedback → Training Loop (Week 8, 3-4 days)
**Owner**: ML Engineer + Backend Engineer
**Priority**: High

**Goal**: Close the loop from copilot feedback (👍/👎) to tone model updates

**Current State**:
- Feedback UI exists in DAICopilot component
- Training script exists: `scripts/train-tone-model.ts`
- No connection between them

**Implementation**:
```typescript
// lib/copilot/feedback-collector.ts (NEW FILE)
export async function recordFeedback({
  userId,
  dealerId,
  mood,
  tone,
  message,
  feedback, // true = 👍, false = 👎
}: FeedbackInput) {
  // Store in database
  await prisma.copilotFeedback.create({
    data: {
      user_id: userId,
      dealer_id: dealerId,
      mood,
      tone,
      message,
      feedback_positive: feedback,
      timestamp: new Date(),
    },
  });

  // Aggregate feedback by tone
  const toneStats = await prisma.copilotFeedback.groupBy({
    by: ['tone'],
    where: {
      dealer_id: dealerId,
      timestamp: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    _count: true,
    _avg: { feedback_positive: true },
  });

  // If enough data, trigger retraining
  const totalFeedback = toneStats.reduce((sum, stat) => sum + stat._count, 0);
  if (totalFeedback >= 100) { // Threshold: 100 feedback events
    // Queue training job (don't block user response)
    await queueTrainingJob(dealerId, toneStats);
  }
}

async function queueTrainingJob(dealerId: string, toneStats: any[]) {
  // Option 1: Use Inngest/Trigger.dev for background jobs
  await inngest.send({
    name: 'copilot/train-tone-model',
    data: { dealerId, toneStats },
  });

  // Option 2: Use Vercel Cron to process queue
  await prisma.trainingQueue.create({
    data: {
      dealer_id: dealerId,
      model_type: 'tone',
      priority: 'normal',
      scheduled_for: new Date(),
    },
  });
}
```

**Training Job Processor**:
```typescript
// app/api/cron/process-training-queue/route.ts (NEW FILE)
import { trainToneModel } from '@/scripts/train-tone-model';

export async function GET(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch pending training jobs
  const jobs = await prisma.trainingQueue.findMany({
    where: {
      status: 'pending',
      scheduled_for: { lte: new Date() },
    },
    take: 5, // Process 5 at a time
  });

  const results = [];
  for (const job of jobs) {
    try {
      // Mark as in-progress
      await prisma.trainingQueue.update({
        where: { id: job.id },
        data: { status: 'in_progress' },
      });

      // Run training
      const newWeights = await trainToneModel(job.dealer_id);

      // Update dealer's tone weights
      await prisma.dealer.update({
        where: { id: job.dealer_id },
        data: { tone_weights: newWeights },
      });

      // Mark as complete
      await prisma.trainingQueue.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completed_at: new Date(),
          result: newWeights,
        },
      });

      results.push({ job_id: job.id, status: 'success' });
    } catch (error) {
      // Mark as failed
      await prisma.trainingQueue.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error.message,
        },
      });

      results.push({ job_id: job.id, status: 'failed', error: error.message });
    }
  }

  return NextResponse.json({ ok: true, processed: results });
}
```

**Cron Schedule**:
```jsonc
{
  "crons": [
    {
      "path": "/api/cron/process-training-queue",
      "schedule": "*/15 * * * *" // Every 15 minutes
    }
  ]
}
```

**Verification**:
- [ ] Feedback stored in database
- [ ] Training jobs queued after 100+ feedback events
- [ ] Models retrained successfully
- [ ] New tone weights applied to copilot
- [ ] Improvement in feedback scores over time

---

## Week 9-10: Phase 6 Build-Out (Continuous Creative Growth)

### 15. Studio Mode v1 (Week 9-10, 5 days)
**Owner**: Senior Frontend Engineer + Designer
**Priority**: Medium

**Goal**: Visual theme editor for designers to customize themes without code

**Features**:
1. Live preview of theme changes
2. Color picker for mood palettes
3. Typography controls
4. Animation speed/easing adjustments
5. Export as JSON (design tokens)
6. One-click deploy to production

**Architecture**:
```typescript
// app/studio/page.tsx (NEW ROUTE)
export default function StudioPage() {
  const [theme, setTheme] = useState(defaultTheme);
  const [preview, setPreview] = useState('landing'); // 'landing' | 'dashboard' | 'copilot'

  return (
    <div className="studio-layout">
      {/* Left panel: Controls */}
      <aside className="studio-controls">
        <ColorPicker
          label="Positive Mood Accent"
          value={theme.moods.positive.accent}
          onChange={(color) => updateTheme('moods.positive.accent', color)}
        />
        <Slider
          label="Animation Speed"
          min={0.5}
          max={2}
          value={theme.animation.speed}
          onChange={(speed) => updateTheme('animation.speed', speed)}
        />
        {/* ... more controls */}
      </aside>

      {/* Right panel: Live preview */}
      <main className="studio-preview">
        <iframe
          src={`/preview/${preview}?theme=${encodeURIComponent(JSON.stringify(theme))}`}
          className="preview-frame"
        />
      </main>

      {/* Bottom: Actions */}
      <footer className="studio-actions">
        <Button onClick={exportTheme}>Export JSON</Button>
        <Button onClick={saveAsDraft}>Save Draft</Button>
        <Button onClick={deployTheme} variant="primary">Deploy to Production</Button>
      </footer>
    </div>
  );
}
```

**Preview Routes**:
```typescript
// app/preview/[component]/page.tsx
export default function PreviewPage({ params, searchParams }: Props) {
  const customTheme = searchParams.theme ? JSON.parse(searchParams.theme) : null;

  useEffect(() => {
    if (customTheme) {
      applyUnifiedTheme(customTheme);
    }
  }, [customTheme]);

  switch (params.component) {
    case 'landing':
      return <CinematicLandingPage />;
    case 'dashboard':
      return <DashboardView />;
    case 'copilot':
      return <DAICopilot />;
    default:
      return <div>Unknown component</div>;
  }
}
```

**Verification**:
- [ ] Studio Mode accessible at `/studio`
- [ ] Changes reflected in live preview
- [ ] Export JSON downloads correct format
- [ ] Deploy updates theme in production
- [ ] Role-based access (designers only)

---

### 16. Brand Voice Training UI (Week 10, 2 days)
**Owner**: Product Designer + Frontend Engineer
**Priority**: Medium

**Goal**: Admin panel for brand managers to provide training examples

**Features**:
1. Upload sample brand voice text
2. Label tone categories (formal, casual, witty, etc.)
3. Approve/reject copilot messages
4. View tone distribution over time

**Implementation**:
```typescript
// app/admin/brand-voice/page.tsx (NEW ROUTE)
export default function BrandVoiceTrainingPage() {
  const [examples, setExamples] = useState([]);

  const handleUpload = async (file: File) => {
    const text = await file.text();

    // Send to OpenAI for tone analysis
    const analysis = await fetch('/api/ai/analyze-tone', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }).then(r => r.json());

    setExamples([...examples, {
      text,
      suggested_tone: analysis.tone,
      confidence: analysis.confidence,
      status: 'pending_review',
    }]);
  };

  const handleApprove = async (exampleId: string, tone: string) => {
    // Add to training dataset
    await fetch('/api/admin/brand-voice/approve', {
      method: 'POST',
      body: JSON.stringify({ example_id: exampleId, tone }),
    });

    // Queue retraining
    await fetch('/api/orchestrator/train', {
      method: 'POST',
      body: JSON.stringify({ model: 'tone', trigger: 'manual' }),
    });
  };

  return (
    <div>
      <h1>Brand Voice Training</h1>

      <FileUpload onUpload={handleUpload} accept=".txt,.md" />

      <table>
        <thead>
          <tr>
            <th>Sample Text</th>
            <th>Suggested Tone</th>
            <th>Confidence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examples.map(example => (
            <tr key={example.id}>
              <td>{example.text.substring(0, 100)}...</td>
              <td>{example.suggested_tone}</td>
              <td>{(example.confidence * 100).toFixed(0)}%</td>
              <td>
                <Button onClick={() => handleApprove(example.id, example.suggested_tone)}>
                  Approve
                </Button>
                <Button variant="secondary" onClick={() => handleReject(example.id)}>
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Verification**:
- [ ] Upload text samples successfully
- [ ] Tone analysis accurate
- [ ] Approved samples added to training set
- [ ] Model retraining triggered
- [ ] Copilot tone improves over time

---

## Week 11: Documentation & Testing

### 17. Comprehensive Documentation (Week 11, 3 days)
**Owner**: Tech Writer + Product Manager
**Priority**: High

**Deliverables**:
```
docs/
├── API_DIRECTORY.md              - All 227 endpoints documented
├── ARCHITECTURE_DIAGRAMS.md      - System architecture (Mermaid)
├── ORCHESTRATOR_GUIDE.md         - How orchestrator works
├── COPILOT_PERSONALITY_GUIDE.md  - Mood/tone system
├── THEME_SYSTEM_GUIDE.md         - Theme unification
├── EXPERIMENTS_GUIDE.md          - A/B testing framework
├── DEPLOYMENT_RUNBOOK.md         - Step-by-step deployment
├── TROUBLESHOOTING.md            - Common issues & fixes
└── INTEGRATION_MANIFEST.md       - This document (updated)
```

**API Directory Example**:
```markdown
## GET /api/ai-scores

**Description**: Returns comprehensive AI visibility metrics for a dealer website.

**Runtime**: Edge (global low-latency)

**Auth**: Public (rate-limited)

**Query Parameters**:
- `origin` (required): Dealer website URL
- `dealerId` (optional): Dealer ID for caching

**Response**:
```json
{
  "dealerId": "string",
  "timestamp": "ISO 8601",
  "model_version": "v2.3.1",
  "kpi_scoreboard": {
    "QAI_star": 85,
    "VAI_Penalized": 72,
    ...
  },
  "platform_breakdown": [...]
}
```

**Example**:
```bash
curl "https://dealershipai.com/api/ai-scores?origin=https://example-dealer.com"
```

**Rate Limits**: 15 req/min per IP
**Cache TTL**: 3 minutes
**Related**: `/api/ai-visibility/score`, `/api/dealer-twin`
```

---

### 18. Integration Testing Suite (Week 11, 2 days)
**Owner**: QA Engineer + Backend Engineer
**Priority**: High

**Test Categories**:
1. End-to-end user flows
2. API integration tests
3. Cron job execution
4. Error handling & fallbacks
5. Performance benchmarks

**Implementation**:
```typescript
// tests/integration/copilot-feedback-loop.test.ts
describe('Copilot Feedback → Training Loop', () => {
  it('should collect feedback and trigger training after 100 events', async () => {
    // 1. Submit 100 feedback events
    for (let i = 0; i < 100; i++) {
      await submitFeedback({
        userId: `user-${i}`,
        dealerId: 'test-dealer',
        tone: 'witty',
        feedback: i % 3 === 0, // 33% positive
      });
    }

    // 2. Verify training job queued
    const jobs = await prisma.trainingQueue.findMany({
      where: { dealer_id: 'test-dealer', model_type: 'tone' },
    });
    expect(jobs.length).toBeGreaterThan(0);

    // 3. Process training queue
    await fetch('http://localhost:3000/api/cron/process-training-queue', {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    // 4. Verify tone weights updated
    const dealer = await prisma.dealer.findUnique({
      where: { id: 'test-dealer' },
    });
    expect(dealer.tone_weights.witty).toBeLessThan(0.5); // Low positive feedback should decrease weight
  });
});

// tests/integration/oem-monitor-to-pulse.test.ts
describe('OEM Monitor → Pulse Inbox', () => {
  it('should fetch Toyota updates and push to dealer inboxes', async () => {
    // 1. Trigger OEM monitor
    const response = await fetch('http://localhost:3000/api/oem/monitor', {
      method: 'POST',
      body: JSON.stringify({ oem: 'Toyota' }),
    });
    const result = await response.json();

    expect(result.ok).toBe(true);
    expect(result.updates).toBeGreaterThan(0);

    // 2. Verify Pulse tiles created
    const tiles = await prisma.pulseTile.findMany({
      where: {
        source: 'OEM',
        created_at: { gte: new Date(Date.now() - 60000) }, // Last minute
      },
    });
    expect(tiles.length).toBeGreaterThan(0);

    // 3. Verify routed to appropriate dealers
    const toyotaDealers = await prisma.dealer.findMany({
      where: { brands: { has: 'Toyota' } },
    });
    for (const dealer of toyotaDealers) {
      const dealerTiles = tiles.filter(t => t.dealer_id === dealer.id);
      expect(dealerTiles.length).toBeGreaterThan(0);
    }
  });
});
```

**CI/CD Integration**:
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          NEO4J_URI: ${{ secrets.NEO4J_URI_TEST }}
```

**Verification**:
- [ ] 50+ integration tests passing
- [ ] CI/CD runs tests on every PR
- [ ] Code coverage >= 70%
- [ ] Performance benchmarks tracked

---

## Week 12: Launch Preparation

### 19. Performance Audit & Optimization (Week 12, 2 days)
**Owner**: Performance Engineer
**Priority**: High

**Checklist**:
- [ ] Lighthouse score >= 90 on all pages
- [ ] Time to First Byte (TTFB) < 200ms for Edge endpoints
- [ ] Time to Interactive (TTI) < 3s on landing page
- [ ] Bundle size < 200KB (gzipped)
- [ ] No render-blocking resources
- [ ] Images optimized (Next.js Image component)
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] No unused CSS/JS (PurgeCSS)

**Tools**:
```bash
# Run Lighthouse CI
npm install --save-dev @lhci/cli
npx lhci autorun

# Analyze bundle
npm run build && npx @next/bundle-analyzer

# Check for unused code
npx depcheck
```

---

### 20. Security Audit (Week 12, 1 day)
**Owner**: Security Engineer
**Priority**: Critical

**Checklist**:
- [ ] All API endpoints have rate limiting
- [ ] SSRF protection on user-provided URLs
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escaping + CSP)
- [ ] CSRF tokens on state-changing operations
- [ ] Secrets in environment variables (not code)
- [ ] HTTPS only (Vercel enforces)
- [ ] Secure headers (Content-Security-Policy, X-Frame-Options)
- [ ] Authentication on admin routes (Clerk)
- [ ] Input validation (Zod schemas)

**Tools**:
```bash
# Run security scan
npm audit
npm audit fix

# Check for vulnerable dependencies
npx snyk test

# Scan for secrets in code
npx secretlint "**/*"
```

---

### 21. Launch Checklist (Week 12, 1 day)
**Owner**: Product Manager + Entire Team
**Priority**: Critical

**Pre-Launch**:
- [ ] All Phase 1-5 features operational
- [ ] Phase 6 Studio Mode deployed (v1)
- [ ] Documentation complete
- [ ] Integration tests passing
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Monitoring/alerting configured
- [ ] Rollback plan documented
- [ ] Customer support trained
- [ ] Marketing materials ready

**Launch Day**:
- [ ] Final smoke tests in production
- [ ] Monitor error rates (Sentry)
- [ ] Monitor performance (Vercel Analytics)
- [ ] Monitor uptime (Better Uptime)
- [ ] Slack war room active
- [ ] On-call engineer available
- [ ] Deploy announcement to #general
- [ ] Update status page (status.dealershipai.com)

**Post-Launch** (Week 1):
- [ ] Daily health checks
- [ ] User feedback collection
- [ ] Bug triage and prioritization
- [ ] Performance optimization based on real traffic
- [ ] Documentation updates based on support questions

---

## Success Metrics

### Phase Completion Tracking

| Week | Phase | Milestone | Success Metric |
|------|-------|-----------|----------------|
| 1 | Foundation | Neo4j + OEM Cron | Knowledge graph operational, OEM tiles in Pulse |
| 2-3 | Context + Copilot | Weather + Events | Context-aware insights, 5 moods working |
| 4-5 | Design Fidelity | Cinematic + Visual Tests | Lighthouse >= 90, no visual regressions |
| 6-7 | Meta-Learning | Experiments + Reports | A/B tests running, daily reports delivered |
| 8 | Reinforcement Learning | Feedback Loop | Tone models retraining based on feedback |
| 9-10 | Creative Growth | Studio Mode + Voice UI | Designers using Studio, brand voice improving |
| 11 | Documentation | Docs + Tests | 50+ tests, all APIs documented |
| 12 | Launch | Production Deploy | Zero downtime, no critical bugs |

### Key Performance Indicators (KPIs)

**Technical Health**:
- Build success rate: >= 99%
- Test coverage: >= 70%
- Lighthouse score: >= 90
- API p95 latency: < 500ms
- Uptime: >= 99.9%

**User Engagement**:
- Copilot feedback positive rate: >= 60%
- Pulse inbox engagement: >= 40%
- Zero-click coverage: >= 30%
- Trust score improvement: +15% average

**Business Impact**:
- Dealer onboarding time: < 30 minutes
- Time to first value: < 24 hours
- Customer satisfaction (CSAT): >= 4.5/5
- Net Promoter Score (NPS): >= 50

---

## Risk Mitigation

### High-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Neo4j Aura downtime | High | Mock data fallback, health checks |
| OpenAI API rate limits | High | Request queuing, multiple API keys, fallback to Claude |
| Vercel Edge cold starts | Medium | Keep-alive pings, caching layer |
| Build time explosion | Medium | Code splitting, lazy loading, bundle analysis |
| Security breach | Critical | Regular audits, WAF, rate limiting, monitoring |
| Data loss | Critical | Daily backups, point-in-time recovery |

### Rollback Procedures

**If critical bug discovered**:
1. Revert to previous deployment: `vercel rollback`
2. Announce incident in Slack
3. Update status page
4. Root cause analysis within 24 hours
5. Post-mortem within 1 week

**If feature causing issues**:
1. Toggle feature flag off (no redeploy needed)
2. Monitor metrics to confirm issue resolved
3. Fix in staging environment
4. Re-enable feature flag after validation

---

## Next Steps After Integration

### Ongoing Operations (Post-Launch)

**Daily**:
- Review executive digest
- Triage new bugs/issues
- Monitor error rates and performance

**Weekly**:
- Review experiment results
- Analyze user feedback
- Update documentation as needed
- Team sync on priorities

**Monthly**:
- Performance optimization sprint
- Security audit
- Dependency updates
- Customer success reviews
- Product roadmap planning

**Quarterly**:
- Major feature releases
- Platform architecture review
- Team retrospectives
- Strategic planning

---

## Conclusion

This integration manifest provides a detailed 12-week plan to activate and integrate existing infrastructure. The focus is on **connecting, not building**, which significantly accelerates the timeline.

**Key Takeaway**: Much of the work is already done. Now it's about making it all work together seamlessly.

**Estimated Effort**: 3-4 engineers full-time for 12 weeks
**Expected Outcome**: Fully operational Trust OS with meta-learning capabilities

**Status**: Ready to begin Week 1 immediately.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Next Review**: After Week 4 completion
