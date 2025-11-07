# Feedback Loop System

## Overview

Implements a continuous improvement cycle for AI chatbot/assistant:

```
User Query → Store Logs → Annotate Errors → Update Pipeline → Retrain → Evaluate → Deploy
```

## Architecture

### Components

1. **Query Storage** (`/api/feedback/query`)
   - Stores user queries and outcomes
   - Tracks latency, tokens, model version
   - Captures user satisfaction ratings

2. **Annotation** (`/api/feedback/annotate`)
   - Annotates errors and interactions
   - Categorizes error types (hallucination, incomplete, irrelevant, format)
   - Provides corrected responses

3. **Update Generation** (`/api/feedback/update`)
   - Generates training updates from annotations
   - Supports: prompt, KB, RAG, fine-tune
   - Computes changes based on error patterns

4. **Retraining** (`/api/feedback/update/:id/retrain`)
   - Triggers model retraining
   - Updates RAG embeddings
   - Fine-tunes LLM

5. **Evaluation** (`/api/feedback/evaluate`)
   - Evaluates on golden query set
   - Calculates accuracy, relevance, latency, cost
   - Compares against thresholds

6. **Deployment** (`/api/feedback/deploy`)
   - Deploys to production if metrics pass
   - Enables A/B testing
   - Monitors rollout

7. **Complete Cycle** (`/api/feedback/cycle`)
   - Runs full feedback loop in one call
   - Automatically triggers when threshold reached

## Usage

### Store Query and Outcome

```typescript
POST /api/feedback/query
{
  "query": "What's my AI visibility score?",
  "response": "Your AI visibility score is 82%...",
  "success": true,
  "userSatisfaction": 4,
  "latencyMs": 450,
  "model": "gpt-4",
  "tokensUsed": 120
}
```

### Annotate Error

```typescript
POST /api/feedback/annotate
{
  "queryId": "query-123",
  "errorType": "hallucination",
  "severity": "high",
  "notes": "Response included incorrect data",
  "correctedResponse": "Your AI visibility score is 78%..."
}
```

### Run Complete Cycle

```typescript
POST /api/feedback/cycle
{
  "query": "What's my AI visibility?",
  "response": "...",
  "success": true,
  "annotation": {
    "errorType": "incomplete",
    "severity": "medium",
    "notes": "Missing competitor comparison",
    "correctedResponse": "..."
  }
}
```

### Check Status

```typescript
GET /api/feedback/status
// Returns:
{
  "queries": 1250,
  "outcomes": 1250,
  "annotations": 87,
  "updates": 12,
  "evaluations": 8,
  "pendingDeployments": 2
}
```

## Thresholds

- **Update Generation**: 10+ annotations in last 7 days
- **Evaluation Thresholds**:
  - Accuracy: ≥ 0.85
  - Relevance: ≥ 0.90
- **Deployment**: Only if evaluation passes

## Integration Points

1. **Chatbot**: Call `/api/feedback/query` after each response
2. **Annotation UI**: Call `/api/feedback/annotate` when user corrects
3. **Training Pipeline**: Poll `/api/feedback/update` for new updates
4. **Evaluation Service**: Call `/api/feedback/evaluate` after retraining
5. **Deployment**: Call `/api/feedback/deploy` if evaluation passes

## Next Steps

1. **Database Integration**: Replace in-memory storage with Supabase/Postgres
2. **Training Pipeline**: Integrate with actual RAG/LLM training services
3. **Golden Set**: Load from database/config
4. **A/B Testing**: Implement gradual rollout
5. **Monitoring**: Add metrics dashboard

