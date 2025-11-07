# GPT Actions Integration Guide

## 🎯 Complete System Overview

This guide covers the complete GPT Actions system for automotive dealership operations, including function calling, context adaptation, feedback logging, and analytics.

---

## 📋 What's Included

### 1. Function Calling Schema
- ✅ 6 automotive functions defined
- ✅ Parameter validation
- ✅ OpenAI-compatible format

### 2. Function Handlers
- ✅ `appraiseVehicle` - Vehicle valuation
- ✅ `scheduleTestDrive` - Test drive booking
- ✅ `fetchInventory` - Inventory search
- ✅ `submitLead` - Lead submission
- ✅ `getServiceHours` - Service availability
- ✅ `checkFinancing` - Financing pre-approval

### 3. Chat API
- ✅ `/api/gpt/chat` - Main chat endpoint with function calling
- ✅ Context adaptation
- ✅ Automatic function execution
- ✅ Response generation

### 4. Analytics & Logging
- ✅ `/api/gpt/logs` - Interaction logging
- ✅ `/api/gpt/analytics` - Aggregated metrics
- ✅ Database schema for persistence
- ✅ Analytics dashboard component

### 5. UI Components
- ✅ `GPTChatInterface` - Interactive chat
- ✅ `GPTAnalyticsDashboard` - Metrics visualization
- ✅ `GPTInsightACN` - I2E integration

---

## 🚀 Quick Start

### Step 1: Set Up Database

```bash
# Apply database schema
psql -d your_database -f lib/db/schemas/gpt-interactions.sql

# Or use Supabase
supabase db push
```

### Step 2: Configure OpenAI

```bash
# Add to .env.local
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

### Step 3: Add Chat Interface to Dashboard

```tsx
import { GPTChatInterface } from '@/components/gpt/GPTChatInterface';

function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <YourContent />
      <GPTChatInterface />
    </div>
  );
}
```

### Step 4: Add Analytics Dashboard

```tsx
import { GPTAnalyticsDashboard } from '@/components/gpt/GPTAnalyticsDashboard';

function AdminPage() {
  return <GPTAnalyticsDashboard />;
}
```

---

## 📊 Function Calling Flow

```
User Query
    ↓
GPT Chat API (/api/gpt/chat)
    ↓
GPT decides to call function
    ↓
Function Handler executes
    ↓
Results returned to GPT
    ↓
GPT generates final response
    ↓
Response + logs saved
```

---

## 🔧 Function Examples

### Appraise Vehicle

**User**: "What's my 2020 Toyota Camry worth?"

**GPT calls**: `appraiseVehicle({ year: 2020, make: "Toyota", model: "Camry" })`

**Response**: 
```json
{
  "estValue": 24500,
  "confidence": 0.92,
  "marketRange": [22500, 26500],
  "source": "Market"
}
```

### Schedule Test Drive

**User**: "I want to test drive the 2023 Camry"

**GPT calls**: `scheduleTestDrive({ userName: "John", vehicleId: "v1", preferredDate: "2025-11-10T14:00:00Z" })`

**Response**:
```json
{
  "success": true,
  "appointmentId": "td-1234567890",
  "scheduledDate": "2025-11-10T14:00:00Z",
  "confirmationNumber": "TD-1234567890"
}
```

---

## 📈 Analytics Integration

### View Analytics

```tsx
import { GPTAnalyticsDashboard } from '@/components/gpt/GPTAnalyticsDashboard';

<GPTAnalyticsDashboard />
```

### Query Logs Programmatically

```typescript
const response = await fetch('/api/gpt/logs?limit=100&outcome=success');
const { logs } = await response.json();
```

### Database Queries

```sql
-- Daily interaction summary
SELECT * FROM gpt_interaction_analytics 
WHERE date >= NOW() - INTERVAL '30 days';

-- Function performance
SELECT * FROM gpt_function_performance 
ORDER BY total_calls DESC;
```

---

## 🎯 I2E Integration

### GPT Insights as ACNs

```tsx
import { GPTInsightACN, detectGPTInsights } from '@/components/i2e/GPTInsightACN';
import { ACNContainer } from '@/components/i2e';

function Dashboard() {
  const conversationHistory = [...]; // From chat
  const insights = detectGPTInsights(conversationHistory);

  return (
    <ACNContainer nuggets={insights.map(i => ({
      id: i.id,
      insight: i.insight,
      ctaText: i.suggestedAction,
      ctaAction: () => executeGPTAction(i),
      severity: i.severity,
      position: { x: 75, y: 20, anchor: 'top-right' }
    }))}>
      <YourChart />
    </ACNContainer>
  );
}
```

---

## 🔄 Context Adaptation

### Dynamic Prompt Building

```typescript
import { buildAdaptedPrompt, getRetrievalContext } from '@/lib/gpt/context-adaptation';

const context = await getRetrievalContext(userQuery, userId);
const adaptedPrompt = buildAdaptedPrompt({
  basePrompt: 'You are a helpful dealership assistant...',
  retrievalContext: context,
  userHistory: recentConversations,
  errorClusters: analyzedErrors
});
```

### Error Pattern Analysis

```typescript
import { analyzeErrorPatterns } from '@/lib/gpt/context-adaptation';

const errorLogs = await fetchErrorLogs();
const patterns = await analyzeErrorPatterns(errorLogs);
// Use patterns to improve prompts
```

---

## 📝 Feedback Loop

### Log User Feedback

```typescript
import { createInteractionLog, saveInteractionLog } from '@/lib/gpt/feedback-schema';

const log = createInteractionLog({
  interactionId: 'interaction-123',
  userQuery: 'What is my car worth?',
  botResponse: 'Your 2020 Camry is worth approximately $24,500...',
  functionCalls: [{ function: 'appraiseVehicle', parameters: {...} }],
  functionResults: [{ function: 'appraiseVehicle', result: {...}, success: true }],
  userFeedback: 'good',
  conversionEvent: { type: 'appraisalCompleted', value: 24500 }
});

await saveInteractionLog(log);
```

---

## 🗄️ Database Schema

### Tables Created

1. **gpt_interactions** - Main interaction log
2. **gpt_function_calls** - Detailed function call tracking
3. **gpt_interaction_analytics** - Aggregated daily metrics (view)
4. **gpt_function_performance** - Function performance metrics (view)

### Apply Schema

```bash
# Supabase
supabase db push

# Or direct SQL
psql -d your_db -f lib/db/schemas/gpt-interactions.sql
```

---

## 🚀 CI/CD Auto-Deployment

The system includes GitHub Actions workflow (`.github/workflows/gpt-auto-deploy.yml`) that:

- ✅ Auto-deploys on GPT-related file changes
- ✅ Runs database migrations
- ✅ Notifies on success

**Triggered by changes to**:
- `lib/gpt/**`
- `app/api/gpt/**`
- `components/gpt/**`
- `lib/db/schemas/gpt-*.sql`

---

## 📊 Monitoring & Metrics

### Key Metrics Tracked

- Total interactions
- Success rate
- Function call volume
- Average execution time
- Conversion rate
- User feedback distribution
- Error patterns

### Dashboard Features

- Daily trends (line chart)
- Function performance (bar chart)
- Feedback distribution
- Real-time updates (60s refresh)

---

## 🔐 Security

- ✅ All endpoints require authentication
- ✅ Function parameters validated
- ✅ Rate limiting applied
- ✅ User data isolated by tenant

---

## 🎯 Next Steps

1. **Connect Real APIs**:
   - Replace mock functions with real NADA/KBB APIs
   - Integrate with CRM (Salesforce, HubSpot)
   - Connect to inventory system

2. **Enhance Context**:
   - Add RAG for vehicle knowledge base
   - Implement user preference learning
   - Add multi-turn conversation memory

3. **Improve Analytics**:
   - Add A/B testing for prompts
   - Implement error clustering ML
   - Build predictive models

4. **Production Hardening**:
   - Add retry logic for function calls
   - Implement circuit breakers
   - Add monitoring alerts

---

## 📁 File Structure

```
lib/gpt/
├── functions-schema.ts          # Function definitions
├── context-adaptation.ts        # Context adaptation logic
└── feedback-schema.ts           # Logging schemas

app/api/gpt/
├── chat/route.ts                # Main chat endpoint
├── logs/route.ts                # Log storage/retrieval
├── analytics/route.ts           # Analytics aggregation
└── functions/
    ├── appraise-vehicle/route.ts
    ├── schedule-test-drive/route.ts
    ├── fetch-inventory/route.ts
    ├── submit-lead/route.ts
    ├── get-service-hours/route.ts
    └── check-financing/route.ts

components/gpt/
├── GPTChatInterface.tsx         # Chat UI
└── GPTAnalyticsDashboard.tsx    # Analytics UI

components/i2e/
└── GPTInsightACN.tsx            # I2E integration

lib/db/schemas/
└── gpt-interactions.sql         # Database schema
```

---

## ✅ Status

**Core System**: ✅ Complete
- Function calling: ✅
- Chat API: ✅
- Analytics: ✅
- Logging: ✅
- UI components: ✅
- Database schema: ✅
- CI/CD: ✅

**Production Ready**: ⚠️ Needs Real API Integration
- Mock functions: ✅ (ready to replace)
- Real APIs: ⚠️ (needs integration)
- CRM integration: ⚠️ (needs setup)

---

**The GPT Actions system is fully implemented and ready for integration!** 🚀

