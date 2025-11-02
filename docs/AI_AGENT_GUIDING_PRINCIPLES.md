# DealershipAI Agent Guiding Principles

**Canonical Version 1.0** | Last Updated: 2025-01-03

---

## 📜 Preamble

These principles guide all AI agent development, system architecture, and feature implementation across the DealershipAI platform. They ensure consistency, credibility, and continuous improvement in our autonomous trust optimization systems.

**Core Philosophy**: Transform static analytics into a *living trust organism* that not only reports the truth but improves it automatically.

---

## The Five Pillars

### 1. 🎯 Depth — Enrich What the Scan Actually Sees

**Principle**: Go beyond surface-level metrics. Build comprehensive understanding through entity relationships, temporal context, and cross-platform validation.

#### Implementation Patterns

##### Entity Graph Expansion
- **What**: Parse `sameAs`, `@id`, and internal link maps to build a complete Dealer Knowledge Graph
- **Why**: Identifies orphan pages (no inbound links = invisible to AI) and ensures comprehensive entity coverage
- **How**: 
  ```typescript
  // Endpoint: /api/ai-visibility/entity-graph
  // Returns: nodes, edges, orphanPages, entityDensity
  // Action: Flag pages with 0 inbound links as "invisible to AI"
  ```

##### Temporal Context & Velocity Metrics
- **What**: Track how quickly content propagates through Google, Perplexity, and ChatGPT caches
- **Why**: Propagation delay reveals platform-specific indexing efficiency
- **How**:
  ```typescript
  // Endpoint: /api/ai-visibility/velocity
  // Returns: averagePropagationDays per platform, cacheFreshness
  // Display: "Propagation Delay (days)" for each AI platform
  ```

##### Cross-AI Consensus
- **What**: Run identical queries through multiple LLMs, store answers, calculate Consensus Strength %
- **Why**: High divergence = unstable reputation signal; consensus = reliable truth
- **How**:
  ```typescript
  // Endpoint: /api/ai-visibility/consensus
  // Returns: strength (0-1), divergence, agreement, mostReliable
  // Action: Alert when divergence > 0.25 (unstable signal)
  ```

#### Success Criteria
- ✅ Entity graph density > 0.85
- ✅ Orphan pages identified and flagged
- ✅ Propagation delays tracked per platform
- ✅ Consensus divergence < 0.2 for stable reputation

---

### 2. 🤖 Automation — Remove Friction and Increase Self-Healing

**Principle**: Eliminate manual intervention. Systems should detect, diagnose, decide, deploy, and verify autonomously with human oversight only for edge cases.

#### Implementation Patterns

##### Autonomous Trust Engine
- **Loop**: Detect → Diagnose → Decide → Deploy → Verify
- **Confidence Threshold**: Only auto-deploy when confidence > 0.8
- **Human Approval**: Queue fixes with confidence < 0.8 for review
- **How**:
  ```typescript
  // Endpoint: /api/trust/autonomous-engine
  // Process:
  //   1. Detect issues from audits/scores
  //   2. Diagnose cause + ROI impact
  //   3. Generate fixes with confidence scores
  //   4. Deploy high-confidence fixes automatically
  //   5. Schedule verification in 24h
  ```

##### Predictive Freshness
- **What**: Forecast when content will fall below freshness threshold
- **Why**: Pre-schedule updates before degradation occurs
- **How**:
  ```typescript
  // Endpoint: /api/predictive/freshness
  // Uses: Time-series forecasting (Prophet/ARIMA)
  // Returns: daysUntilThreshold, estimatedThresholdDate, forecast projection
  // Action: Auto-schedule content updates 14 days before threshold
  ```

##### Auto-Fix Engine Worker
- **What**: Background worker that processes unanimous issues
- **Why**: Enables asynchronous fix deployment without blocking user requests
- **How**:
  ```typescript
  // File: workers/auto-fix-engine.ts
  // Process: 
  //   - Detects unanimous issues (severity=high or consensus=true)
  //   - Generates fixes
  //   - Deploys via /api/site-inject
  //   - Verifies with Perplexity + Google Rich Results
  //   - Sends webhook notifications
  ```

#### Success Criteria
- ✅ 80%+ of fixes deployed automatically (confidence > 0.8)
- ✅ Zero false positives in production
- ✅ Verification completes within 24h
- ✅ Rollback available for all deployments

---

### 3. 📊 Behavioral Insights — Tie Human Actions to Algorithmic Outcomes

**Principle**: Connect user behavior in the dashboard to measurable Trust Score improvements. Show causality, not just correlation.

#### Implementation Patterns

##### Trust-to-Action Mapping
- **What**: Track which dashboard actions most often precede Trust Score increases
- **Why**: Reveals which behaviors drive real improvement
- **How**:
  ```typescript
  // Endpoint: /api/trust/action-mapping
  // Method: Correlate audit_log actions with score deltas
  // Returns: Top 3 behaviors with avgTrustGain, occurrences, maxGain
  // Display: "Top 3 behaviors that moved your score"
  ```

##### User Maturity Index
- **What**: 0-100 indicator of engagement frequency and fix deployment
- **Why**: Identify high-intent accounts for CRM targeting
- **Future**: Feed back into CRM segmentation

#### Success Criteria
- ✅ Clear correlation between actions and score increases
- ✅ Top 3 behaviors identified with statistical significance
- ✅ Actionable recommendations generated per user

---

### 4. 💰 Revenue Linkage — Close the Loop to Actual Money

**Principle**: Never report metrics in isolation. Always connect Trust Score changes to dollars earned, deals closed, and lifetime value.

#### Implementation Patterns

##### ROI Attribution Model
- **What**: Correlate Trust Score changes with revenue uplift
- **Why**: Makes Trust Score improvement tangible and ROI-justifiable
- **How**:
  ```typescript
  // Endpoint: /api/roi/attribution
  // Input: dealerId, date range
  // Returns: 
  //   - roiPerTrustPoint: $X per point
  //   - roiPer10Points: $Y per 10-point gain
  //   - dealUplift, revenueUplift, ltvImpact
  // Display: "$12,000 per 10 points of Trust Gain"
  ```

##### Deal Uplift Calculation
- **Method**: Compare deal count/volume before vs. after Trust Score improvement
- **Baseline**: Previous period or industry average
- **Output**: `(currentDeals - baselineDeals) × avgDealValue = revenueUplift`

##### Customer Lifetime View
- **What**: Merge CRM repeat-purchase data with Trust Scores
- **Why**: High Trust dealers should show shorter repeat cycles
- **Display**: "Trust-Driven Retention Rate"

#### Success Criteria
- ✅ Every Trust Score change linked to dollar impact
- ✅ Statistical confidence in attribution > 0.75
- ✅ ROI calculations reviewed monthly for accuracy

---

### 5. 🔍 Credibility Reinforcement — Show Proof and Minimize Bias

**Principle**: Every metric must be traceable, verifiable, and explainable. Transparency builds trust; obfuscation destroys it.

#### Implementation Patterns

##### Transparent Audit Trail
- **What**: For every metric, show "Last Verified On" and data source
- **Why**: Users need to trust the data before they trust recommendations
- **How**:
  ```typescript
  // Endpoint: /api/trust/audit-trail
  // Returns: 
  //   - currentValue, lastVerified timestamp
  //   - verificationSource: "Google Rich Results Test + Perplexity API"
  //   - confidence: 0.0-1.0
  //   - methodology: How the metric is calculated
  // Display: "Schema Coverage: 88% (validated via Google Rich Results test on 2025-10-26)"
  ```

##### AI Explanation Layer
- **What**: Interactive Q&A about any score or metric
- **Why**: Users need to understand *why* before they'll act
- **How**:
  ```typescript
  // Endpoint: /api/trust/explain
  // Input: question, dealerId, metric (optional)
  // Uses: OpenAI GPT-4 to generate explanations
  // Returns: explanation, actionItems, estimatedImpact
  // Example: "Why is my Freshness Score low?"
  //          → "7 of 10 pages haven't been updated in 180+ days. 
  //             Updating them could recover +12 pts."
  ```

##### Public Proof Page
- **What**: Dealers can publish shareable badge with live API verification
- **Why**: Adds backlinks and social proof → improves Authoritativeness
- **Future**: Implement badge/widget system

##### Human QA Mode
- **What**: Manual review checklist for AI-flagged anomalies
- **Why**: Prevents false positives from eroding trust
- **Future**: Integrate into dashboard review workflow

#### Success Criteria
- ✅ Every metric has verification timestamp
- ✅ Explanation API response time < 2s
- ✅ 90%+ user satisfaction with explanations
- ✅ Zero unexplained metric changes

---

## 🔄 The Autonomous Trust Engine Loop

**Core Workflow**: Every system enhancement must support or improve this loop:

```
┌─────────┐
│ Detect  │ → Automated issue detection from scans/audits
└────┬────┘
     │
     ▼
┌──────────┐
│ Diagnose │ → AI explains cause + ROI impact
└────┬─────┘
     │
     ▼
┌─────────┐
│ Decide  │ → Auto-generate fixes with confidence scores
└────┬────┘
     │
     ▼
┌─────────┐
│ Deploy  │ → Safe injection with rollback capability
└────┬────┘
     │
     ▼
┌─────────┐
│ Verify  │ → Measure improvement, repeat
└────┬────┘
     │
     └─────→ Back to Detect
```

### Loop Principles

1. **Confidence-Based Deployment**: Only auto-deploy when confidence > 0.8
2. **Human-in-the-Loop**: Queue low-confidence fixes for review
3. **Verification Required**: Every fix must be verified within 24h
4. **Rollback Always Available**: Every deployment has a rollback path
5. **Continuous Learning**: Failed fixes inform future confidence calculations

---

## 🏗️ Architectural Patterns

### API Design
- **Consistent Response Format**: `{ success, data, error?, metadata? }`
- **Pagination**: All list endpoints support `page` and `limit`
- **Filtering**: Support city, state, status filters
- **Versioning**: Use path-based versioning (`/api/v1/...`)

### Database Patterns
- **Audit Everything**: All changes tracked in `audits` table
- **JSON Scores**: Store complex metrics as JSON strings (parse on read)
- **Indexing**: Index on `dealerId`, `domain`, `createdAt` for performance
- **Migrations**: Always include `IF NOT EXISTS` for safety

### Worker Patterns
- **Background Processing**: Use workers for async operations
- **Job Queues**: Queue heavy operations (scans, fixes)
- **Retry Logic**: Exponential backoff for failed operations
- **Webhooks**: Notify external systems of completions

### Security Patterns
- **Authentication**: Bearer token for internal calls, Clerk for user auth
- **Domain Verification**: Always verify domain ownership before injection
- **CSP Nonces**: Generate unique nonces for all injected scripts
- **Signature Verification**: Verify Slack/third-party signatures

---

## 📈 Success Metrics

### System Health
- **Scan Success Rate**: > 95%
- **Fix Deployment Success**: > 98%
- **Verification Accuracy**: > 90%
- **API Response Time**: < 2s (p95)

### Business Impact
- **Trust Score Improvement**: Average +15 points in first month
- **Revenue Attribution**: $1,200+ per 10-point gain
- **Automation Rate**: 80%+ fixes deployed automatically
- **User Satisfaction**: > 85% find explanations helpful

### Operational
- **Fleet Scale**: Support 5,000+ rooftops concurrently
- **Cron Reliability**: 99.9% job execution success
- **Data Freshness**: Scores updated within 24h
- **Uptime**: 99.95% availability

---

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ Surface-Level Metrics Only
- **Bad**: "AI Visibility: 75%"
- **Good**: "AI Visibility: 75% (Google: 88%, ChatGPT: 68%, Perplexity: 72%, Claude: 62%) - Consensus divergence: 0.18 (stable)"

### ❌ Manual-Only Workflows
- **Bad**: Require user to manually trigger every fix
- **Good**: Auto-deploy high-confidence fixes, queue others for approval

### ❌ Metrics Without Context
- **Bad**: Show score without explanation
- **Good**: Every score clickable → explanation → actionable steps

### ❌ Revenue Disconnection
- **Bad**: "Your Trust Score improved by 10 points"
- **Good**: "Your Trust Score improved by 10 points → $12,000 revenue uplift this month"

### ❌ Opaque Calculations
- **Bad**: "Trust Score: 78"
- **Good**: "Trust Score: 78 (Last verified: 2025-01-02 via Google Rich Results Test, confidence: 0.92)"

---

## 📚 Reference Implementation

See the following files for canonical implementations:

- **Fleet APIs**: `app/api/origins/`, `app/api/ai-scores/`
- **Autonomous Engine**: `app/api/trust/autonomous-engine/`
- **Auto-Fix Worker**: `workers/auto-fix-engine.ts`
- **Calibration**: `app/api/calibration/evaluate/`
- **ROI Attribution**: `app/api/roi/attribution/`
- **Audit Trail**: `app/api/trust/audit-trail/`
- **Explanations**: `app/api/trust/explain/`

---

## 🔄 Version History

- **v1.0** (2025-01-03): Initial canonization of guiding principles
  - Documented 5 pillars
  - Defined Autonomous Trust Engine loop
  - Established success metrics and anti-patterns

---

## 📝 Contributing

When adding new features or modifying existing systems:

1. **Check Alignment**: Does this support one of the 5 pillars?
2. **Follow Patterns**: Use existing implementations as templates
3. **Maintain Audit Trail**: Log all changes
4. **Link to Revenue**: Show dollar impact where possible
5. **Provide Explanations**: Make metrics explainable
6. **Update This Doc**: Add new patterns and principles as discovered

---

**End of Canon**

