# 🤖 AI Assistant Integration Guide

## Overview

The AI Assistant provides context-aware insights based on your dealership's metrics, helping you understand and optimize your AI visibility, revenue at risk, and competitive positioning.

## ✨ Features

### ✅ What's Included

1. **Context-Aware Responses**
   - Analyzes your current metrics
   - Provides actionable recommendations
   - Understands dealership-specific context

2. **Multi-AI Provider Support**
   - Anthropic Claude (primary)
   - OpenAI GPT-4 (secondary)
   - Google AI (tertiary)
   - Rule-based fallback (always available)

3. **Tier-Based Access**
   - Pro+: Full AI assistant access
   - Free: Upgrade prompt

4. **Usage Tracking**
   - Logs all queries to audit_log
   - Tracks usage patterns
   - Monitors API costs

## 🚀 Quick Start

### 1. Add to Your Dashboard

```tsx
import { AIAssistantQuery } from '@/components/AIAssistantQuery';
import { useMemo } from 'react';

function YourDashboard() {
  // Prepare context with your metrics
  const aiContext = useMemo(() => ({
    revenueAtRisk: 450000,
    aiVisibility: 65,
    overallScore: 72,
    competitorCount: 5,
    dealershipName: 'ABC Motors'
  }), [/* dependencies */]);

  return (
    <div>
      {/* Your dashboard content */}

      <AIAssistantQuery
        context="dealership-overview"
        data={aiContext}
        theme="dark"
        placeholder="Ask about your metrics..."
      />
    </div>
  );
}
```

### 2. Configure AI Providers (Optional)

Add AI API keys to `.env`:

```bash
# Choose ONE or more (tried in this order):

# Option 1: Anthropic Claude (Recommended)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Option 2: OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Option 3: Google AI
GOOGLE_AI_API_KEY=your-google-ai-key

# If none are configured, rule-based responses are used
```

### 3. Test It

```bash
npm run dev

# Visit your dashboard and ask:
# - "What can I do about my revenue at risk?"
# - "How do I improve my AI visibility score?"
# - "What are my top 3 quick wins?"
```

## 📋 Component API

### AIAssistantQuery

```tsx
<AIAssistantQuery
  context="dealership-overview"  // Context identifier
  data={aiContext}               // Metrics object
  theme="dark"                   // 'light' | 'dark'
  placeholder="Ask..."           // Input placeholder
  onQuery={customHandler}        // Optional custom handler
  className="custom-class"       // Optional CSS class
  maxHeight="400px"              // Chat height
/>
```

### Context Data Structure

```typescript
interface AIAssistantContext {
  // Core metrics
  revenueAtRisk?: number;        // Revenue at risk in dollars
  aiVisibility?: number;         // AI visibility score (0-100)
  overallScore?: number;         // Overall performance score

  // Optional metrics
  dealershipName?: string;
  competitorCount?: number;
  impressionsTrend?: any;
  criticalAlerts?: boolean;

  // Any additional custom data
  [key: string]: any;
}
```

## 🎯 API Endpoint

### POST `/api/ai-assistant`

**Request:**
```json
{
  "query": "How can I improve my AI visibility?",
  "context": "dealership-overview",
  "data": {
    "revenueAtRisk": 450000,
    "aiVisibility": 65,
    "overallScore": 72
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "Your AI visibility score of 65% needs improvement. Quick wins:\n\n1. Add FAQ schema markup\n2. Optimize for featured snippets...",
  "metadata": {
    "context": "dealership-overview",
    "tier": "pro",
    "timestamp": "2025-01-06T..."
  }
}
```

**Tier Protection:**
```json
// Free users get:
{
  "error": "Upgrade required",
  "message": "Advanced Analytics requires a PRO plan...",
  "upgradeUrl": "/pricing"
}
```

## 💡 Usage Examples

### Example 1: Dashboard Integration

See [components/DashboardWithAI.tsx](components/DashboardWithAI.tsx) for a complete example with:
- Real-time metrics
- AI assistant panel
- Quick action buttons
- Usage tracking
- Critical alerts

### Example 2: Custom Query Handler

```tsx
<AIAssistantQuery
  context="custom"
  data={metrics}
  onQuery={async (query) => {
    // Your custom logic
    if (query.includes('revenue')) {
      return `Custom response about revenue...`;
    }

    // Or call external API
    const response = await fetch('/api/custom-ai', {
      method: 'POST',
      body: JSON.stringify({ query })
    });

    return await response.text();
  }}
/>
```

### Example 3: Quick Actions

```tsx
import { AIQuickActions } from '@/components/AIAssistantQuery';

<AIQuickActions
  theme="dark"
  onAction={(query) => {
    // Trigger AI query with predefined question
    console.log('Quick action:', query);
  }}
/>
```

## 🔐 Tier-Based Features

| Tier | AI Assistant | Queries/Month | AI Provider |
|------|-------------|---------------|-------------|
| Free | ❌ | 0 | - |
| Pro | ✅ | 100 | Rule-based or AI |
| Premium | ✅ | 500 | Full AI (Claude/GPT) |
| Enterprise | ✅ | Unlimited | Full AI + Custom |

## 🧠 AI Provider Configuration

### Anthropic Claude (Recommended)

**Best for:** Detailed analysis, following instructions precisely

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Model:** `claude-3-5-sonnet-20241022`
**Cost:** ~$0.003 per query (300 tokens)

### OpenAI GPT-4

**Best for:** Creative suggestions, general knowledge

```bash
# .env
OPENAI_API_KEY=sk-your-openai-key
```

**Model:** `gpt-4-turbo-preview`
**Cost:** ~$0.01 per query (300 tokens)

### Google AI

**Best for:** Fast responses, lower cost

```bash
# .env
GOOGLE_AI_API_KEY=your-google-ai-key
```

**Model:** `gemini-pro`
**Cost:** Free tier available

### Rule-Based Fallback

**Always available** - No API key needed!

Works for common queries:
- Revenue at risk analysis
- AI visibility optimization
- Competitor insights
- Quick wins

## 📊 Query Examples & Responses

### Query: "What can I do about my revenue at risk?"

**Response (with $450K at risk):**
```
Your $450K revenue at risk is critically high. Priority actions:

1. Optimize AI visibility (current: 65%)
2. Improve zero-click optimization
3. Fix schema markup gaps
4. Enhance local SEO presence

These changes can typically reduce risk by 30-40% within 90 days.
```

### Query: "How do I improve my AI visibility score?"

**Response (at 65%):**
```
Your AI visibility score of 65% needs improvement. Quick wins:

1. Add FAQ schema markup
2. Optimize for featured snippets
3. Improve page load speed
4. Create AI-friendly content

Target: 75%+ within 60 days.
```

### Query: "What are my top 3 quick wins?"

**Response:**
```
Top 3 Quick Wins:

1. **Schema Markup** (2-3 days)
   Add LocalBusiness, FAQPage, Review schemas

2. **Google Business Profile** (1 week)
   Complete all sections, add photos weekly

3. **Page Speed** (3-5 days)
   Optimize images, enable caching

Expected impact: 10-15% visibility boost in 30 days.
```

## 📈 Usage Tracking

All AI queries are tracked in the `audit_log` table:

```sql
SELECT
  action,
  details->>'context' as context,
  details->>'query_length' as query_length,
  timestamp
FROM audit_log
WHERE action = 'ai_assistant_query'
ORDER BY timestamp DESC;
```

## 🎨 Customization

### Custom Theme

```tsx
<AIAssistantQuery
  theme="light"
  className="shadow-2xl border-2 border-blue-500"
/>
```

### Custom Welcome Message

Edit `getWelcomeMessage()` in [components/AIAssistantQuery.tsx](components/AIAssistantQuery.tsx):

```typescript
function getWelcomeMessage(data: AIAssistantContext): string {
  return `Welcome to ${data.dealershipName}! I'm here to help...`;
}
```

### Custom System Prompt

Edit `buildSystemPrompt()` in [app/api/ai-assistant/route.ts](app/api/ai-assistant/route.ts):

```typescript
function buildSystemPrompt(context, data, tier) {
  return `You are a specialized AI assistant for...`;
}
```

## 🐛 Troubleshooting

### Issue: "Upgrade required" for Pro user

**Solution:**
```bash
# Check subscription in database
psql $DATABASE_URL -c "SELECT user_id, plan FROM subscriptions WHERE user_id = 'your-clerk-id';"

# Update if needed
UPDATE subscriptions SET plan = 'pro' WHERE user_id = 'your-clerk-id';
```

### Issue: AI responses are slow

**Solution:**
1. Use Anthropic Claude (fastest)
2. Reduce max_tokens in API route
3. Implement response streaming (advanced)

### Issue: Rule-based responses only

**Check:**
```bash
# Verify AI keys are set
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Check API route logs
npm run dev
# Look for "AI provider error, falling back to rules"
```

## 📚 Files Reference

```
components/
├── AIAssistantQuery.tsx          # Main component
└── DashboardWithAI.tsx            # Complete example

app/api/
└── ai-assistant/
    └── route.ts                   # API endpoint

.env                               # AI API keys
```

## 🚀 Next Steps

1. **Add to your main dashboard**
   - Import AIAssistantQuery
   - Pass your metrics as context
   - Test with sample queries

2. **Configure AI provider** (optional)
   - Add API key to .env
   - Restart dev server
   - Test with complex queries

3. **Customize responses**
   - Edit system prompts
   - Add custom query handlers
   - Create domain-specific rules

4. **Monitor usage**
   - Check audit_log table
   - Track API costs
   - Optimize prompts

## 💰 Cost Estimates

| Tier | Queries/Month | Provider | Est. Cost/Month |
|------|--------------|----------|-----------------|
| Pro | 100 | Rule-based | $0 |
| Pro | 100 | Claude | $0.30 |
| Premium | 500 | Claude | $1.50 |
| Enterprise | 2000 | Claude | $6.00 |

**Note:** Actual costs vary by query complexity. Rule-based fallback is always free!

## 🎉 You're Ready!

Your AI assistant is now:
- ✅ Integrated into your dashboard
- ✅ Context-aware with your metrics
- ✅ Tier-protected (Pro+ only)
- ✅ Tracked in audit logs
- ✅ Ready for production

**Try it now:**
```bash
npm run dev
# Visit your dashboard and start asking questions!
```

---

**Questions?** Check the code examples in [components/DashboardWithAI.tsx](components/DashboardWithAI.tsx)
