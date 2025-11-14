# dAI Orchestrator GPT Setup Guide

**Purpose:** Configure and deploy the dAI Orchestrator GPT for agentic commerce intelligence.

**Last Updated:** November 2025

---

## Overview

The **dAI Orchestrator GPT** is a custom GPT configuration that transforms dealership funnel strategy by mapping the shift from traditional car buying to AI-driven agentic commerce. It understands and visualizes how AI Overviews, AI Mode, and agentic assistants replace search and lead funnels with algorithmic trust funnels.

---

## Configuration File

**Location:** `configs/gpt/dai-orchestrator-gpt.json`

This JSON file contains the complete GPT configuration including:
- Core knowledge (funnel models, KPIs, visualization rules)
- Behavioral logic
- Context awareness
- Response templates
- Example prompts and responses

---

## Key Features

### 1. Funnel Models

**Traditional Funnel:**
- Stages: Awareness → Consideration → Intent → Decision → Ownership/Loyalty
- Drivers: Google Search, SEO, Marketplaces, Dealer Websites
- Metrics: Impressions, CTR, Lead Volume, Close Rate
- Color: Teal (#14b8a6)

**Agentic Funnel:**
- Stages: Intent Formation → Agentic Evaluation → AI Recommendation → Agentic Transaction → Fulfillment & Retention
- Drivers: ChatGPT, Gemini, Perplexity, Copilot, Google AI Mode
- Metrics: AI Visibility Score, Zero-Click Inclusion, Schema Coverage Ratio, Revenue at Risk
- Color: Violet (#8b5cf6)

### 2. Core KPIs

- AI Visibility Score
- Zero-Click Inclusion Rate
- Schema Coverage Ratio (SCR)
- Semantic Clarity Score (SCS)
- Authority Depth Index (ADI)
- UGC Health Score
- Revenue at Risk

### 3. Visualization Types

1. **Funnel Comparison** - Side-by-side traditional vs agentic funnels
2. **Dashboard** - AI visibility KPIs with gauges and metrics
3. **Trajectory** - Transition graph from traditional SEO to AI Overviews

---

## Setup Instructions

### Option 1: Import to ChatGPT (Custom GPT)

1. Go to https://chat.openai.com/gpts
2. Click **"Create"** or **"Configure"**
3. In the **"Instructions"** field, paste the contents of `configs/gpt/dai-orchestrator-gpt.json`
4. Configure:
   - **Name:** "dAI Orchestrator GPT — Agentic Commerce Intelligence"
   - **Description:** "Transforms dealership funnel strategy by mapping the shift from traditional car buying to AI-driven agentic commerce"
   - **Conversation starters:** Use the example prompts from the config
5. Save and publish

### Option 2: Use in Codebase

The configuration can be loaded and used programmatically:

```typescript
import daiOrchestratorConfig from '@/configs/gpt/dai-orchestrator-gpt.json';

// Use in orchestrator bridge
const systemPrompt = buildSystemPrompt(daiOrchestratorConfig);
```

---

## Example Prompts

1. **"Show me our traditional vs agentic funnel comparison."**
   - Returns: Side-by-side funnel visualization
   - Insight: Traditional funnels drive clicks; agentic funnels drive algorithmic trust

2. **"Generate a dashboard of our AI visibility KPIs."**
   - Returns: Dashboard with gauges for AI Visibility Score, Schema Coverage Ratio, Revenue at Risk
   - Insight: Visualizes live agentic commerce funnel performance

3. **"Visualize how our Schema Coverage Ratio affects AI recommendations."**
   - Returns: Trajectory graph showing transition over time
   - Insight: Shows progress in adapting to AI-mediated shopper behavior

4. **"Show a trajectory of our shift from traditional SEO to AI Overviews."**
   - Returns: Line graph with upward momentum
   - Insight: AI Overviews have replaced traditional search exposure

---

## Integration with DealershipAI

### API Integration

The orchestrator can be integrated with DealershipAI's API endpoints:

```typescript
// Call orchestrator with funnel analysis request
const response = await fetch('/api/orchestrator', {
  method: 'POST',
  body: JSON.stringify({
    action: 'analyze_funnel',
    dealerId: 'dealer_123',
    type: 'comparison' // or 'dashboard', 'trajectory'
  })
});
```

### Dashboard Integration

Visualizations can be rendered in the DealershipAI dashboard:

```tsx
import { FunnelComparison } from '@/components/orchestrator/FunnelComparison';

<FunnelComparison 
  traditional={traditionalData}
  agentic={agenticData}
  colors={{ left: '#14b8a6', right: '#8b5cf6' }}
/>
```

---

## Behavioral Logic

The GPT follows these core rules:

1. **Treat AI agents as the new lead source** - Not just search engines
2. **Frame strategy around algorithmic visibility** - Not impressions
3. **Recommend structured data and clarity optimization** - Trust-building actions
4. **Auto-render funnel visuals** - When comparing current vs future processes

---

## Context Awareness

### AI Mode Integration
- Integrates Google's AI Mode logic (agentic RL, multimodality, source corroboration)
- Understands how AI Overviews work

### Visibility Metrics
- AIV™ (AI Visibility)
- ATI™ (Algorithmic Trust Index)
- CRS (Clarity & Relevance Score)

### Search Shift Understanding
- From keyword SEO → AI Overviews → Agentic Transactions
- Understands the evolution of search behavior

---

## Response Templates

### Funnel Visualization
- **Type:** `funnel_comparison`
- **Colors:** Teal (#14b8a6) left, Violet (#8b5cf6) right
- **Watermark:** "dAI Orchestrator" in bottom-right corner
- **Key Elements:** KPI labels, stage names, metrics

### Dashboard Visualization
- **Type:** `dashboard`
- **Style:** Minimalist executive dashboard
- **Background:** Dark gray
- **Accents:** Teal and violet
- **Elements:** Gauges, metrics, KPIs

### Trajectory Visualization
- **Type:** `trajectory`
- **Style:** Cinematic line graph
- **Colors:** Transition from teal to violet
- **Background:** Soft gradient
- **Elements:** Time axis, KPI labels, upward momentum

---

## Customization

### Modify Colors
Edit `configs/gpt/dai-orchestrator-gpt.json`:

```json
{
  "visualization_rules": {
    "left_color": "#14b8a6",  // Change traditional funnel color
    "right_color": "#8b5cf6"  // Change agentic funnel color
  }
}
```

### Add New KPIs
Add to the `kpis` array:

```json
{
  "kpis": [
    "AI Visibility Score",
    "Your New KPI"
  ]
}
```

### Add New Visualization Types
Extend `response_templates`:

```json
{
  "response_templates": {
    "your_visualization": {
      "visualization_type": "your_type",
      "image_prompt": "...",
      "insight_summary": "...",
      "next_step": "..."
    }
  }
}
```

---

## Testing

### Test Prompts

1. Test funnel comparison:
   ```
   Show me our traditional vs agentic funnel comparison.
   ```

2. Test dashboard:
   ```
   Generate a dashboard of our AI visibility KPIs.
   ```

3. Test trajectory:
   ```
   Show a trajectory of our shift from traditional SEO to AI Overviews.
   ```

### Expected Responses

- ✅ Visualizations with correct colors (teal/violet)
- ✅ Insight summaries that explain the shift
- ✅ Next steps that are actionable
- ✅ Watermark "dAI Orchestrator" in visualizations

---

## Troubleshooting

### Issue: Visualizations not rendering

**Solution:**
- Verify image generation API is configured
- Check that colors are valid hex codes
- Ensure visualization type matches a template

### Issue: GPT not understanding agentic commerce

**Solution:**
- Review the `context_awareness` section in config
- Add more examples to `example_responses`
- Verify core knowledge is loaded correctly

### Issue: Responses not dealership-executive friendly

**Solution:**
- Check `default_tone` is set to "Analytical, direct, dealership-executive friendly"
- Review example responses for tone consistency
- Adjust behavioral logic rules if needed

---

## Related Documentation

- `COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json` - Master blueprint for cognitive ops
- `docs/CHATGPT_CUSTOM_GPT_SETUP.md` - General ChatGPT custom GPT setup
- `lib/orchestrator/gpt-bridge.ts` - Orchestrator bridge implementation

---

## Status

✅ **Configuration Complete** - Ready for import to ChatGPT or integration into codebase

The dAI Orchestrator GPT configuration is saved and ready to use.

