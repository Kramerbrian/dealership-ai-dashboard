# Autonomous Trust Engine SDK

The Autonomous Trust Engine continuously optimizes dealer Trust Scores through a detect-diagnose-decide-deploy-verify loop.

---

## Trigger Autonomous Engine

### Manual Trigger

```typescript
// TypeScript
const result = await client.trust.autonomousEngine.run({
  dealerId: 'dealer-123'
});

console.log(`Detected Issues: ${result.cycle.detected}`);
console.log(`Fixes Generated: ${result.cycle.fixesGenerated}`);
console.log(`Deployed: ${result.cycle.deployed}`);
console.log(`Estimated New Score: ${result.estimatedNewScore}`);
```

```python
# Python
result = client.trust.autonomous_engine.run(dealer_id='dealer-123')

print(f"Detected Issues: {result.cycle.detected}")
print(f"Fixes Generated: {result.cycle.fixes_generated}")
print(f"Deployed: {result.cycle.deployed}")
print(f"Estimated New Score: {result.estimated_new_score}")
```

```bash
# cURL
curl -X POST "https://api.dealershipai.com/api/trust/autonomous-engine?dealerId=dealer-123" \
  -H "Authorization: Bearer $DEALERSHIPAI_API_KEY"
```

**Response:**
```json
{
  "dealerId": "dealer-123",
  "currentTrustScore": 78.5,
  "cycle": {
    "detected": 3,
    "diagnosed": 3,
    "fixesGenerated": 3,
    "deployed": 2,
    "verificationScheduled": "2025-01-04T10:30:00Z"
  },
  "issues": [
    {
      "type": "missing_schema",
      "severity": "high",
      "description": "No structured data detected"
    }
  ],
  "fixes": [
    {
      "type": "schema_injection",
      "confidence": 0.9,
      "estimatedTrustGain": 18,
      "action": "Generate and inject JSON-LD"
    }
  ],
  "estimatedNewScore": 96.5
}
```

---

## Get Action Mapping

Discover which dashboard actions most often precede Trust Score increases.

```typescript
// TypeScript
const mapping = await client.trust.actionMapping.get({
  dealerId: 'dealer-123',
  days: 30
});

console.log('Top 3 Behaviors:');
mapping.topBehaviors.forEach((behavior, idx) => {
  console.log(`${idx + 1}. ${behavior.action}: +${behavior.avgTrustGain} points`);
});
```

```python
# Python
mapping = client.trust.action_mapping.get(
    dealer_id='dealer-123',
    days=30
)

print('Top 3 Behaviors:')
for idx, behavior in enumerate(mapping.top_behaviors, 1):
    print(f"{idx}. {behavior.action}: +{behavior.avg_trust_gain} points")
```

**Response:**
```json
{
  "topBehaviors": [
    {
      "rank": 1,
      "action": "schema_fix",
      "avgTrustGain": 12.5,
      "occurrences": 8,
      "maxGain": 18.2,
      "recommendation": "Schema fixes show strong impact. Consider automating more schema generation."
    },
    {
      "rank": 2,
      "action": "review_response",
      "avgTrustGain": 8.3,
      "occurrences": 12,
      "maxGain": 14.1,
      "recommendation": "Continue responding to reviews promptly. High correlation with trust gains."
    }
  ]
}
```

---

## Get AI Explanation

Ask questions about any Trust Score metric and get AI-powered explanations.

```typescript
// TypeScript
const explanation = await client.trust.explain({
  question: 'Why is my Freshness Score low?',
  dealerId: 'dealer-123',
  metric: 'freshness'
});

console.log(explanation.explanation);
explanation.actionItems.forEach(item => {
  console.log(`- ${item}`);
});
```

```python
# Python
explanation = client.trust.explain(
    question='Why is my Freshness Score low?',
    dealer_id='dealer-123',
    metric='freshness'
)

print(explanation.explanation)
for item in explanation.action_items:
    print(f"- {item}")
```

**Response:**
```json
{
  "question": "Why is my Freshness Score low?",
  "explanation": "Your Freshness Score is low because 7 of 10 pages haven't been updated in 180+ days. Stale content signals to AI platforms that your site is inactive, reducing trust. Updating these pages with fresh content could recover +12 points.",
  "actionItems": [
    "Identify and update top 10 stale pages",
    "Schedule weekly content updates",
    "Add time-sensitive content (inventory, specials, events)"
  ],
  "timestamp": "2025-01-03T10:30:00Z"
}
```

---

## Get Audit Trail

View transparent verification history for any metric.

```typescript
// TypeScript
const auditTrail = await client.trust.auditTrail.get({
  dealerId: 'dealer-123',
  metric: 'aiVisibility'
});

console.log(`Current Value: ${auditTrail.auditTrail.aiVisibility.currentValue}%`);
console.log(`Last Verified: ${auditTrail.auditTrail.aiVisibility.lastVerified}`);
console.log(`Source: ${auditTrail.auditTrail.aiVisibility.verificationSource}`);
console.log(`Confidence: ${auditTrail.auditTrail.aiVisibility.confidence}`);
```

```python
# Python
audit_trail = client.trust.audit_trail.get(
    dealer_id='dealer-123',
    metric='aiVisibility'
)

metric = audit_trail.audit_trail.ai_visibility
print(f"Current Value: {metric.current_value}%")
print(f"Last Verified: {metric.last_verified}")
print(f"Source: {metric.verification_source}")
print(f"Confidence: {metric.confidence}")
```

**Response:**
```json
{
  "auditTrail": {
    "aiVisibility": {
      "currentValue": 87.5,
      "lastVerified": "2025-01-02T10:30:00Z",
      "verificationSource": "Google Rich Results Test + Perplexity API + ChatGPT API",
      "confidence": 0.92,
      "methodology": "Weighted average of platform-specific visibility scores",
      "dataPoints": [
        {
          "value": 87.5,
          "timestamp": "2025-01-02T10:30:00Z",
          "verified": true
        }
      ]
    }
  }
}
```

---

## Entity Graph Analysis

Build comprehensive dealer knowledge graphs and identify orphan pages.

```typescript
// TypeScript
const graph = await client.aiVisibility.entityGraph.get({
  origin: 'https://dealer1.com'
});

console.log(`Total Entities: ${graph.entityGraph.metrics.totalEntities}`);
console.log(`Orphan Pages: ${graph.entityGraph.metrics.orphanPages}`);
console.log(`Entity Density: ${graph.entityGraph.metrics.entityDensity}`);

graph.recommendations.forEach(rec => {
  console.log(`${rec.priority}: ${rec.issue} (Estimated gain: +${rec.estimatedTrustGain} pts)`);
});
```

```python
# Python
graph = client.ai_visibility.entity_graph.get(origin='https://dealer1.com')

metrics = graph.entity_graph.metrics
print(f"Total Entities: {metrics.total_entities}")
print(f"Orphan Pages: {metrics.orphan_pages}")
print(f"Entity Density: {metrics.entity_density}")

for rec in graph.recommendations:
    print(f"{rec.priority}: {rec.issue} (Estimated gain: +{rec.estimated_trust_gain} pts)")
```

---

## Velocity Metrics

Track content propagation delays across AI platforms.

```typescript
// TypeScript
const velocity = await client.aiVisibility.velocity.get({
  origin: 'https://dealer1.com'
});

console.log('Propagation Delays:');
console.log(`  Google: ${velocity.velocity.google.averagePropagationDays} days`);
console.log(`  ChatGPT: ${velocity.velocity.chatgpt.averagePropagationDays} days`);
console.log(`  Perplexity: ${velocity.velocity.perplexity.averagePropagationDays} days`);
console.log(`  Claude: ${velocity.velocity.claude.averagePropagationDays} days`);
```

---

## Consensus Tracking

Compare how different AI platforms answer the same queries.

```typescript
// TypeScript
const consensus = await client.aiVisibility.consensus.get({
  origin: 'https://dealer1.com',
  query: 'What are the hours for this dealership?'
});

console.log(`Consensus Strength: ${consensus.consensus.strength}`);
console.log(`Divergence: ${consensus.consensus.divergence}`);
console.log(`Most Reliable: ${consensus.consensus.mostReliable}`);

if (consensus.consensus.divergence > 0.25) {
  console.warn('High divergence - unstable reputation signal');
}
```

**Response:**
```json
{
  "consensus": {
    "strength": 0.87,
    "divergence": 0.13,
    "agreement": 0.87,
    "mostReliable": "google"
  },
  "interpretation": {
    "strength": "high",
    "stability": "stable",
    "recommendation": "Strong consensus indicates reliable reputation signal."
  }
}
```

---

## Error Handling

```typescript
// TypeScript
try {
  const result = await client.trust.autonomousEngine.run({
    dealerId: 'dealer-123'
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Dealer not found');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
    const retry = await client.trust.autonomousEngine.run({ dealerId: 'dealer-123' });
  }
}
```

