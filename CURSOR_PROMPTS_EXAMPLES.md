# Cursor Prompt Examples - Copy & Paste Ready

## 🚀 Quick Start Prompts

### Generate Complete Monorepo (One Command)
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json 

Generate the complete monorepo structure as specified in the blueprint:
1. Root: package.json with workspace config, tsconfig.json, .gitignore
2. apps/web: Next.js 14 with marketing routes and calculators
3. apps/dashboard: Next.js 14 with auth routes, API endpoints, and components
4. packages/shared: TypeScript types and utilities
5. packages/orchestrator: Orchestrator 3.0 core logic
6. packages/agents: Agent SDK framework
7. packages/ui: Shared UI components

Create all directory structures, basic files, and TypeScript configurations.
```

### Generate API Routes Only
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate all API routes from the apiEndpoints section:
- apps/dashboard/app/api/orchestrator/route.ts
- apps/dashboard/app/api/ai/autofix/route.ts
- apps/dashboard/app/api/ai/asr/route.ts
- apps/dashboard/app/api/agents/schema-king/route.ts
- apps/dashboard/app/api/agents/mystery-shop/route.ts
- apps/dashboard/app/api/ai-scores/route.ts
- apps/dashboard/app/api/competitive-intel/route.ts
- apps/dashboard/app/api/priorities/route.ts
- apps/dashboard/app/api/integrations/route.ts

Each route should:
- Use Next.js 14 App Router format
- Include TypeScript types
- Add Clerk authentication
- Follow the architecture.brain specifications
- Include error handling
```

### Generate Mission Board Feature
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the Mission Board feature from interfaceParadigm.components.missionBoard:

1. apps/dashboard/components/missions/MissionBoard.tsx
   - Primary interface showing all missions
   - Category filtering (quick_win, strategic, maintenance)
   - Visual progress indicators
   - Evidence panel integration

2. apps/dashboard/components/missions/MissionCard.tsx
   - Individual mission display
   - Shows: Scan → Diagnose → Prescribe → Deploy → Validate
   - Status badges
   - Confidence scores

3. apps/dashboard/components/missions/EvidencePanel.tsx
   - Evidence trail viewer
   - Slide-in panel from right
   - Grouped by type
   - Timestamped trail

4. apps/dashboard/app/api/missions/route.ts
   - GET: List missions
   - POST: Create mission
   - PATCH: Update mission status

Use TypeScript types from databaseSchema.Missions.
```

### Generate HAL Chat Component
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the HAL Chat component from interfaceParadigm.components.halChat:

apps/dashboard/components/orchestrator/HALChat.tsx

Features:
- Conversational interface
- Natural language queries
- Inline cards for complex results
- Personality evolution based on userTenure:
  - Days 1-7: Formal, instructional
  - Days 8-30: Professional with dry razor sharp wit
  - Days 31+: Full dAI personality

Follow brandVoice.traits for tone and voice.
Integrate with /api/orchestrator endpoint.
```

### Generate Confidence Ribbon
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the Adaptive Confidence Ribbon from kpiCanon:

apps/dashboard/components/orchestrator/ConfidenceRibbon.tsx

Display all 6 metrics:
1. AI Visibility (AIV)
2. Quality Authority Index (QAI)
3. Performance Impact Quality Risk (PIQR)
4. Opportunity Cost of Inaction (OCI)
5. Algorithmic Trust Index (ATI)
6. Autonomous Strategy Recommendation ROI (ASR-ROI)

Format:
- Horizontal bar showing overall confidence (0-100%)
- Individual metric values
- Color coding: Green (≥85%), Amber (65-84%), Red (<65%)
- Always visible at top of dashboard

Fetch data from /api/ai-scores endpoint.
```

### Generate Database Migrations
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate Supabase migration files from databaseSchema:

1. supabase/migrations/001_create_dealer_context.sql
   - DealerContext table
   - JSONB context field
   - Indexes on dealerId and lastUpdated

2. supabase/migrations/002_create_global_patterns.sql
   - GlobalPatterns table
   - Anonymized data (GDPR compliant)
   - Expiration trigger for 90-day retention

3. supabase/migrations/003_create_orchestrator_usage.sql
   - OrchestratorUsage table
   - Usage tracking and metering
   - Indexes for analytics queries

4. supabase/migrations/004_create_missions.sql
   - Missions table
   - Evidence JSONB field
   - Status tracking

5. supabase/migrations/005_create_orchestrator_state.sql
   - OrchestratorState table
   - Platform state management

Include:
- RLS policies for multi-tenant security
- Foreign key relationships
- Auto-update triggers
- TypeScript types generation
```

### Generate TypeScript Types
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate TypeScript types from databaseSchema:

packages/shared/types/index.ts

Export types for:
- DealerContext
- GlobalPatterns
- OrchestratorUsage
- Missions
- OrchestratorState

Also generate:
- API request/response types from apiEndpoints
- Component prop types from interfaceParadigm
- Agent types from agentHierarchy
```

### Generate Pulse Dashboard Components
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate ChatGPT Pulse-inspired dashboard components:

1. apps/dashboard/components/pulse/InsightsFeed.tsx
   - Real-time AI insights
   - Auto-updating feed
   - Timestamped entries

2. apps/dashboard/components/pulse/MetricCard.tsx
   - Live KPI cards
   - All 6 metrics from kpiCanon
   - Animated updates

3. apps/dashboard/components/pulse/CompetitiveAlert.tsx
   - Market movement alerts
   - Competitor change notifications
   - Priority-based display

4. apps/dashboard/components/pulse/ActionStack.tsx
   - Prioritized action list
   - From ASR generator
   - One-click execution

Follow the Pulse dashboard inspiration from the blueprint.
```

### Generate Orchestrator 3.0 Bridge
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the Orchestrator 3.0 bridge from architecture.brain:

packages/orchestrator/src/gpt-bridge.ts

Features:
- Hybrid internal + remote GPT architecture
- Fallback to internal calculations (QAI, PIQR, OCI)
- Async queue integration (Supabase + Redis)
- Local embeddings cache
- Error handling and retries

Implement:
- callOrchestrator() function
- Fallback calculations
- Queue management
- Cache layer
```

### Generate SDK Marketplace
```
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json

Generate the SDK Marketplace from sdkMarketplace section:

1. apps/dashboard/app/(auth)/integrations/page.tsx
   - Marketplace UI
   - Agent listing
   - Installation interface

2. apps/dashboard/app/api/integrations/route.ts
   - GET: List available agents
   - POST: Install agent
   - DELETE: Uninstall agent

3. packages/agents/src/sdk.ts
   - Agent SDK framework
   - Installation hooks
   - Revenue share tracking

4. packages/agents/src/schema-king/index.ts
   - Example agent implementation
   - Follows SDK interface
```

---

## 📋 Step-by-Step Generation Workflow

### Phase 1: Foundation
```
# Step 1.1: Root Structure
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Create monorepo root with:
- package.json (workspace config)
- tsconfig.json
- .gitignore
- README.md
- Turborepo or Nx config

# Step 1.2: Apps Structure
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Create apps/ directory with:
- apps/web/package.json
- apps/dashboard/package.json
- Basic Next.js 14 structure for each

# Step 1.3: Packages Structure
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Create packages/ directory with:
- packages/shared/package.json
- packages/orchestrator/package.json
- packages/agents/package.json
- packages/ui/package.json
```

### Phase 2: Core Platform
```
# Step 2.1: API Routes
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate all API routes

# Step 2.2: Database
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate Supabase migrations

# Step 2.3: Types
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate TypeScript types
```

### Phase 3: UI Components
```
# Step 3.1: Mission Board
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate Mission Board components

# Step 3.2: HAL Chat
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate HAL Chat component

# Step 3.3: Confidence Ribbon
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate Confidence Ribbon

# Step 3.4: Pulse Dashboard
@COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json Generate Pulse components
```

---

## 🎯 Pro Tips

1. **Start Small**: Generate one feature at a time
2. **Validate**: Check generated code against blueprint
3. **Iterate**: Refine prompts based on results
4. **Reference**: Always use @COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json
5. **Be Specific**: Mention exact file paths and features

---

*Copy these prompts directly into Cursor Chat or Composer for instant code generation.*

