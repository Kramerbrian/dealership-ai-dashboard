# AI Agent Principles — Quick Reference

**TL;DR Version** — For daily development reference

---

## The Five Pillars (Cheat Sheet)

### 1. 🎯 Depth
- ✅ Entity graphs (sameAs, @id parsing)
- ✅ Velocity metrics (propagation delays)
- ✅ Cross-AI consensus (multi-LLM validation)

### 2. 🤖 Automation
- ✅ Autonomous Trust Engine (Detect→Diagnose→Decide→Deploy→Verify)
- ✅ Confidence-based deployment (>0.8 auto, <0.8 review)
- ✅ Predictive freshness forecasting

### 3. 📊 Behavioral Insights
- ✅ Trust-to-action mapping
- ✅ Top 3 behaviors that moved score
- ✅ User maturity index

### 4. 💰 Revenue Linkage
- ✅ ROI attribution model
- ✅ $ per 10 points of Trust Gain
- ✅ Deal uplift & LTV calculations

### 5. 🔍 Credibility
- ✅ Transparent audit trail
- ✅ AI explanation layer
- ✅ Verification timestamps

---

## The Loop (Remember This)

```
Detect → Diagnose → Decide → Deploy → Verify → [Repeat]
```

**Rules**:
- Auto-deploy if confidence > 0.8
- Queue for review if confidence < 0.8
- Always verify within 24h
- Always provide rollback

---

## API Response Pattern

```typescript
{
  success: boolean,
  data: any,
  error?: string,
  metadata?: {
    timestamp: string,
    confidence?: number,
    source?: string
  }
}
```

---

## Success Criteria Checklist

### Every Feature Should:
- [ ] Link to revenue or show dollar impact
- [ ] Provide explanation/audit trail
- [ ] Support autonomous deployment
- [ ] Include verification mechanism
- [ ] Have rollback capability

### Every Metric Should:
- [ ] Show verification timestamp
- [ ] Display data source
- [ ] Include confidence level
- [ ] Be explainable via `/api/trust/explain`

---

## Common Patterns

### Adding a New Scan Endpoint
```typescript
// 1. Create /api/scan-type/route.ts
// 2. Store results in audits table (JSON scores)
// 3. Include verification source in response
// 4. Link findings to Trust Score impact
// 5. Generate actionable recommendations
```

### Adding a New Fix Type
```typescript
// 1. Add to auto-fix-engine.ts detectIssues()
// 2. Add generateFix() handler
// 3. Deploy via /api/site-inject
// 4. Schedule verification
// 5. Update confidence based on results
```

### Adding Revenue Attribution
```typescript
// 1. Track baseline (before) metrics
// 2. Track current (after) metrics
// 3. Calculate delta
// 4. Multiply by per-point value ($1,200/10pts)
// 5. Show in response: "roiPer10Points: $12,000"
```

---

## Anti-Patterns (Avoid These)

❌ Metrics without explanations  
❌ Fixes without rollback  
❌ Scores without revenue linkage  
❌ Deployments without verification  
❌ Changes without audit trail  

---

**See**: `AI_AGENT_GUIDING_PRINCIPLES.md` for full documentation

