# DealershipAI - Chief Clarity Officer

## 🎯 Brand Positioning

**The AI that cuts through noise to deliver actionable clarity** for automotive dealerships navigating the AI-first era.

### Core Principles

1. **Clarity over Complexity**
   - Answer directly, no jargon
   - Provide actionable next steps
   - Back claims with data

2. **Cost-Optimized Intelligence**
   - 80% of tasks use Claude Haiku ($0.25/1M tokens)
   - GPT-4o reserved for high-fidelity reasoning
   - Automatic failover ensures reliability

3. **Cross-Verification**
   - Multiple models validate outputs
   - Higher factual trust through consensus

## 🏗️ Architecture

### Multi-Model Orchestration

```
┌─────────────────────────────────────┐
│   Chief Clarity Officer              │
│   (LangChain Router)                 │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ Claude Haiku│  │  GPT-4o     │
│ 80% of jobs │  │ Reasoning   │
│ $0.25/1M    │  │ $2.50/1M    │
└─────────────┘  └─────────────┘
       │                │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Failover      │
       │  + Vector Cache│
       └────────────────┘
```

### Routing Logic

```typescript
if (task === "summarize" || tokens < 1500) 
  → Claude Haiku
  
else if (task === "reason" || needs_function_call) 
  → GPT-4o
  
else 
  → routeByCost(task)
```

## 📊 Cost Breakdown

### Per 1M Tokens (Input/Output)

| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| Claude 3 Haiku | $0.25 | $1.25 | 80% of jobs (summaries, chat) |
| Claude 3 Sonnet | $3.00 | $15.00 | Medium complexity |
| GPT-4o | $2.50 | $10.00 | High-fidelity reasoning |
| GPT-4 Turbo | $10.00 | $30.00 | Code generation |
| Ada (Embeddings) | $0.13 | - | Vector quality |

### Expected Monthly Costs

**Conservative (1000 analyses/month)**:
- 80% Haiku: ~$50
- 15% Sonnet: ~$90
- 5% GPT-4o: ~$75
- **Total: ~$215/month**

**Optimized routing saves ~60% vs. using GPT-4o for everything**

## 🔄 Failover Strategy

### Primary → Fallback

1. **Claude Haiku** → Claude Sonnet → GPT-4o
2. **Claude Sonnet** → GPT-4o → Claude Haiku
3. **GPT-4o** → Claude Sonnet → GPT-4 Turbo

### Vector-Cached Context

- Store conversation context in pgvector
- Retrieve on failover for seamless continuation
- Embeddings: OpenAI Ada (`text-embedding-3-large`)

## 🎨 Brand Voice

### Tone

- **Direct**: "Your AI Visibility Score is 67/100. Here's why."
- **Actionable**: "Fix schema coverage (+12 points, 2-day effort)"
- **Data-Driven**: "ChatGPT ranks you #12; competitors rank #1-3"
- **Empathetic**: "We know dealers are busy. Here's the 30-second fix."

### Example Interactions

**Question**: "Why am I invisible in ChatGPT?"

**Answer**: 
> Your AI Visibility Score is 42/100. Three gaps:
> 
> 1. **Schema markup missing** (60% of pages)
>    - Fix: Add JSON-LD (1-2 days)
>    - Impact: +15 points
> 
> 2. **Content freshness low** (last update: 8 months ago)
>    - Fix: Update inventory pages weekly
>    - Impact: +8 points
> 
> 3. **Zero-click presence: 18%** (industry avg: 45%)
>    - Fix: Optimize GMB listing
>    - Impact: +10 points
> 
> **Total potential gain: +33 points → 75/100**

**Question**: "Should I focus on Google SEO or AI visibility?"

**Answer**:
> Both, but AI visibility is the new frontier:
> 
> - **67% of car buyers start with AI** (ChatGPT, Perplexity)
> - Traditional SEO won't help you rank in AI answers
> - Your competitor "Terry Reid Hyundai" ranks #1 in ChatGPT; you're #12
> 
> **Recommendation**: 70% AI visibility, 30% SEO. 
> 
> Start with schema markup (biggest ROI, 1-2 days).

## 🔌 API Endpoints

### `/api/ai/chat`

Natural language chat interface.

**Request**:
```json
{
  "question": "Why am I invisible in ChatGPT?",
  "dealerId": "toyota-naples",
  "context": {
    "domain": "germaintoyotaofnaples.com",
    "currentScore": 67
  }
}
```

**Response**:
```json
{
  "answer": "Your AI Visibility Score is 67/100...",
  "model": "claude-3-haiku",
  "confidence": 0.85,
  "cost": 0.000125,
  "latency": 234
}
```

### `/api/ai/analyze`

Deep analysis of dealership visibility.

**Request**:
```json
{
  "domain": "germaintoyotaofnaples.com",
  "context": {
    "competitors": ["terry-reid-hyundai.com"],
    "focusAreas": ["schema", "freshness"]
  }
}
```

## 🚀 Technical Stack (Canonized)

### AI Infrastructure
- **Primary**: Anthropic Claude 3 Haiku/Sonnet (LangChain)
- **Secondary**: OpenAI GPT-4o/Turbo (reasoning, code)
- **Embeddings**: OpenAI Ada (`text-embedding-3-large`)
- **Router**: LangChain / LlamaIndex

### Data / Graph
- **Neo4j**: Graph relationships (competitors, markets)
- **Supabase**: PostgreSQL + pgvector (embeddings cache)

### Streaming
- **Kafka / Inngest**: Event-driven workflows

### APIs
- **GraphQL**: Complex queries
- **REST**: Simple CRUD
- **Function-calling router**: Anthropic ↔ OpenAI

### Auth
- **Clerk**: SSO (Org/Workspace model)

### UI
- **Next.js 14**: App Router
- **Tailwind**: Styling
- **Framer Motion**: Animations
- **shadcn/ui**: Components

### Monitoring
- **PostHog**: Product analytics
- **Sentry**: Error tracking

### Payments
- **Stripe Connect**: Marketplace
- **Supabase Functions**: Serverless

## 📈 Success Metrics

### Cost Control
- **Target**: <$0.50 per analysis
- **Current**: ~$0.22 per analysis (80% Haiku routing)

### Quality
- **Confidence threshold**: >0.80
- **Cross-verification**: 95%+ agreement

### Performance
- **Latency**: <500ms (Haiku), <2s (GPT-4o)
- **Failover**: <100ms additional

## 🎯 Future Enhancements

1. **Fine-tuned models** on dealership data
2. **Multi-agent workflows** (specialized agents per pillar)
3. **Real-time streaming** responses
4. **Voice interface** (Whisper STT + TTS)
5. **Visual analysis** (GPT-4 Vision for screenshots)

---

**The Chief Clarity Officer cuts through the noise. No fluff. Just clarity.** 🎯

