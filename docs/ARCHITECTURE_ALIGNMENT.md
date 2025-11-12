# DealershipAI Architecture Alignment

## Current Implementation Status vs. Unified Spec

### ✅ Already Implemented (Matches Spec)

#### 1. **Core Metrics & KPIs**
- ✅ Revenue at Risk (RaR) - `/api/metrics/rar`
- ✅ Quality Authority Index (QAI) - `/api/metrics/qai`
- ✅ E-E-A-T Breakdown - `/api/metrics/eeat`
- ✅ Opportunity Efficiency Loss (OEL) - `/api/metrics/oel`
- ✅ Schema Coverage tracking
- ✅ Zero-Click Coverage tracking

#### 2. **Agentic Infrastructure**
- ✅ Fix Pack System (Schema King precursor)
  - `/api/fix/deploy` - Single fix deployment
  - `/api/fix/pack` - Batch deployment
  - `/api/fix/estimate` - Recovery estimation
  - `FixPackDrawer` component
- ✅ Evidence System
  - `writeEvent()` for decision feed
  - Evidence drawer pattern established
- ✅ Cost Guardrails
  - OEL tracks wasted spend
  - Fix Pack estimates recovery

#### 3. **Voice & Interaction**
- ✅ Voice Assistant (Web Speech API)
- ✅ ElevenLabs TTS integration
- ✅ Voice command router pattern
- ✅ Intent-based actions (open_rar, open_qai, etc.)

#### 4. **Monitoring & Governance**
- ✅ DriftGuard System
  - Schema drift detection
  - Slack alerts
  - Acknowledgment logging
- ✅ Scan System (SSE streaming)
  - `/api/scan/stream` - Real-time progress
  - `useScanSSE` hook
  - `ScanSummaryModal` with evidence

#### 5. **UI/UX Foundation**
- ✅ Cupertino aesthetic (glass morphism, minimal)
- ✅ Modal/Drawer pattern (RaR, QAI, EEAT, OEL, Fix Pack)
- ✅ Orbital view (3D visualization)
- ✅ Decision feed pattern
- ✅ Toast notification system

### 🚧 Partially Implemented (Needs Extension)

#### 1. **HAL Copilot**
- ✅ Voice command routing exists
- ❌ Goal→Plan→Execute→Verify→Report loop not complete
- ❌ Mission board UI missing
- ❌ Brief generation missing
- ❌ Cross-agent orchestration missing

#### 2. **Schema King Agent**
- ✅ Fix Pack system (basic)
- ✅ Schema validation endpoints
- ❌ Auto-detection of missing schemas
- ❌ Site-inject client not fully wired
- ❌ Rollback system not complete
- ❌ Rich Results validation missing

#### 3. **Consensus Service**
- ✅ Multiple metric sources (QAI, EEAT, RaR)
- ❌ Multi-platform probing (ChatGPT/Claude/Gemini/Perplexity)
- ❌ Variance/confidence calculation missing
- ❌ Unanimous issue detection missing

#### 4. **PLG Landing**
- ✅ Instant Analyzer pattern exists
- ❌ Parts 6-17 not implemented
- ❌ Share-to-unlock missing
- ❌ ROI calculator missing
- ❌ Geographic pooling not implemented

### ❌ Not Yet Implemented

#### 1. **Mystery Shop Agent**
- ❌ Scenario scripts
- ❌ Scoring matrix
- ❌ Coaching playbooks
- ❌ Transcript/artifact storage

#### 2. **Personalization Engine**
- ❌ Role-aware UI
- ❌ Neurodiverse modes
- ❌ Memory primitives
- ❌ Tone rails

#### 3. **Mission Board**
- ❌ Queue visualization
- ❌ Status tracking
- ❌ Brief display
- ❌ Next actions panel

#### 4. **Cost Guardrails (Advanced)**
- ❌ Per-dealer monthly caps ($0.15/dealer/mo)
- ❌ City pooling
- ❌ Rate limiting queue
- ❌ Auto-rollback triggers

## Architecture Mapping

### Current Structure → Spec Alignment

```
Current Implementation          →  Spec Requirement
─────────────────────────────────────────────────────
/app/api/metrics/*              →  Public-signal scoring
/app/api/fix/*                  →  Auto-Fix packs
/app/(dashboard)/components/*   →  Agent-first UI
/lib/voice/*                    →  HAL interaction layer
/app/(admin)/admin/driftguard   →  Evidence & governance
```

### Next Implementation Priorities

#### Phase 1: HAL Copilot Core
1. **Mission Board Component**
   - Queue visualization
   - Status indicators
   - Brief display
   - Next actions

2. **Goal→Plan→Execute→Verify→Report Loop**
   - Goal input (voice/text)
   - Plan generation (HAL)
   - Execution tracking
   - Verification (evidence)
   - Report generation

3. **Cross-Agent Orchestration**
   - Schema King → Fix Pack
   - Scan → RaR → Fix Pack
   - OEL → Fix Pack → Verify

#### Phase 2: Schema King Enhancement
1. **Auto-Detection**
   - Route enumeration
   - Schema gap analysis
   - Priority scoring

2. **Site-Inject Client**
   - Full implementation
   - Rollback system
   - Version tracking

3. **Rich Results Validation**
   - Google validator integration
   - Proof attachment
   - Delta tracking

#### Phase 3: Consensus Service
1. **Multi-Platform Probing**
   - ChatGPT API integration
   - Claude API integration
   - Gemini API integration
   - Perplexity API integration

2. **Variance Calculation**
   - Confidence scoring
   - Unanimous issue detection
   - Consensus weighting

#### Phase 4: PLG Landing (Parts 6-17)
1. **ROI Calculator**
2. **Share-to-Unlock**
3. **Session Counter**
4. **Competitive Rage Bait**
5. **Onboarding Hooks**

## Key Design Principles (From Spec)

### ✅ Already Following
- Evidence over claims
- Cupertino minimalism
- Agent > Tab pattern (started)
- Friction budgets
- Cost guardrails (basic)

### 🎯 To Implement
- Goal→Plan→Execute→Verify→Report loop
- Human-in-the-loop for risky ops
- Personalization engine
- Neurodiverse modes
- Mission-based navigation

## Questions from Spec - Recommended Answers

### 1. Missions Catalog (First 10 HAL Missions)
**Recommended:**
1. "Fix FAQ schema on top 20 pages"
2. "Run AIO inclusion probe for 'oil change' intents"
3. "Deploy competitor mystery shop for Camry LE"
4. "Analyze zero-click gap and propose fixes"
5. "Update review response templates"
6. "Validate NAP consistency across citations"
7. "Generate Fix Pack for Revenue at Risk drivers"
8. "Run full cognitive scan and summarize"
9. "Compare E-E-A-T scores to top 3 competitors"
10. "Deploy schema fixes with rollback ready"

### 2. Guardrails
**Recommended:**
- Monthly cost ceiling: $0.15/dealer/month
- Max concurrent jobs: 5 per market
- Queue scheduling: City pooling enabled

### 3. Evidence Retention
**Recommended:**
- Diffs: 90 days
- Validator outputs: 60 days
- Artifacts: 30 days (with S3 archival option)

### 4. PLG Gating
**Recommended:**
- Launch: Email gate only (simpler)
- Future: Add share-to-unlock as A/B test

### 5. Personalization Defaults
**Recommended:**
- Reduced motion: OFF by default (enable in settings)
- Alt colors: OFF by default
- Summary-first: ON by default
- Tone slider: Hidden (use role-based defaults)

## Implementation Roadmap

### Week 1-2: HAL Core
- Mission Board UI
- Goal input & parsing
- Plan generation stub
- Execution tracking
- Basic brief generation

### Week 3-4: Schema King Enhancement
- Auto-detection system
- Site-inject completion
- Rollback system
- Rich Results validation

### Week 5-6: Consensus Service
- Multi-platform API integration
- Variance calculation
- Unanimous issue detection
- Confidence scoring

### Week 7-8: PLG Landing Parts 6-10
- ROI calculator
- Share-to-unlock
- Session counter
- Competitive intel
- Onboarding hooks

## Technical Debt & Considerations

1. **Current API Routes**: Many are stubbed - need orchestrator integration
2. **Database Schema**: Need Supabase tables for missions, evidence, costs
3. **Queue System**: Need job queue (BullMQ or similar) for cost-bounded execution
4. **Site-Inject**: Need full implementation with CSP/nonce handling
5. **Multi-Tenancy**: Current code assumes single tenant - need dealer_id scoping

## Next Steps

1. **Review this alignment** with stakeholders
2. **Prioritize Phase 1** (HAL Core) vs. other phases
3. **Define database schema** for missions, evidence, costs
4. **Set up job queue** infrastructure
5. **Begin HAL Mission Board** implementation

