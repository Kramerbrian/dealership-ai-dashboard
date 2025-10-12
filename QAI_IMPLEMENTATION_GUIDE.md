# QAI (Query AI) Master Prompt Implementation Guide

## Overview
The QAI Master Prompt system provides a comprehensive framework for analyzing automotive dealership visibility across AI search platforms. This guide covers implementation, optimization, and monitoring of the QAI system.

## Quick Start

### 1. Prerequisites
- API keys for supported platforms (OpenAI, Anthropic, Perplexity, Google)
- PostgreSQL database with dealership data
- Redis cache instance (Upstash recommended)
- Node.js environment with TypeScript support

### 2. Configuration Setup

```bash
# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export PERPLEXITY_API_KEY="your-perplexity-key"
export GOOGLE_API_KEY="your-google-key"
```

### 3. Load Master Prompt Configuration

```typescript
import qaiMasterPrompt from './prompts/qai_master_prompt.json';
import { UnifiedAPI } from './src/integrations/unified-api';

const qaiSystem = new UnifiedAPI();
qaiSystem.loadPromptConfiguration(qaiMasterPrompt);
```

## Core Components

### Query Templates
The system includes four types of query templates:

1. **Discovery Queries** - Find dealerships in specific locations
2. **Comparison Queries** - Compare multiple dealerships
3. **Intent Queries** - Specific action-oriented searches
4. **Reputation Queries** - Trust and review-based searches

### Platform-Specific Optimization

Each AI platform has optimized parameters:

| Platform | Temperature | Max Tokens | Response Format |
|----------|------------|------------|-----------------|
| ChatGPT | 0.3 | 500 | Structured |
| Claude | 0.2 | 600 | Analytical |
| Perplexity | 0.1 | 400 | Source-cited |
| Gemini | 0.3 | 500 | Location-enriched |

## Implementation Steps

### Step 1: Initialize QAI System

```typescript
class QAIManager {
  private config: QAIConfig;
  private api: UnifiedAPI;
  
  constructor() {
    this.config = qaiMasterPrompt;
    this.api = new UnifiedAPI();
  }
  
  async analyzeDealer(dealer: Dealer) {
    const queries = this.generateQueries(dealer);
    const results = await this.executeQueries(queries);
    return this.calculateVisibilityScore(results);
  }
}
```

### Step 2: Generate Dealer-Specific Queries

```typescript
generateQueries(dealer: Dealer): Query[] {
  const templates = this.config.query_templates;
  const queries: Query[] = [];
  
  // Replace placeholders with dealer data
  for (const template of templates.discovery_queries) {
    queries.push({
      text: template
        .replace('{dealer_name}', dealer.name)
        .replace('{city}', dealer.city)
        .replace('{state}', dealer.state)
        .replace('{make}', dealer.primaryMake),
      type: 'discovery',
      priority: 1
    });
  }
  
  return queries;
}
```

### Step 3: Execute Platform Queries

```typescript
async executeQueries(queries: Query[]): Promise<QueryResult[]> {
  const platforms = ['chatgpt', 'claude', 'perplexity', 'gemini'];
  const results: QueryResult[] = [];
  
  for (const query of queries) {
    for (const platform of platforms) {
      const response = await this.queryPlatform(platform, query);
      const analysis = this.analyzeResponse(response, query);
      results.push(analysis);
    }
  }
  
  return results;
}
```

### Step 4: Analyze Responses

```typescript
analyzeResponse(response: string, query: Query): AnalysisResult {
  const mentionDetection = this.detectMentions(response);
  const visibilityScore = this.scoreVisibility(response, mentionDetection);
  const completeness = this.assessCompleteness(response);
  
  return {
    mentioned: mentionDetection.found,
    position: mentionDetection.position,
    sentiment: mentionDetection.sentiment,
    completeness: completeness.score,
    visibilityScore: visibilityScore
  };
}
```

## Monitoring & Optimization

### Scan Frequency by Dealer Tier

- **Tier 1 (Premium)**: Daily scans, 100 queries/day
- **Tier 2 (Standard)**: Weekly scans, 100 queries/week  
- **Tier 3 (Basic)**: Bi-weekly scans, 100 queries/2 weeks

### Alert Thresholds

Monitor these key metrics:

| Metric | Alert Threshold | Action Required |
|--------|----------------|-----------------|
| Mention Rate Drop | > 20% | Review content strategy |
| Position Decline | > 2 positions | Optimize dealer information |
| Sentiment Decrease | > 15% | Address reputation issues |
| Completeness Drop | > 25% | Update dealer data |

### Cost Optimization

Daily budget allocation:

```typescript
const dailyBudget = 100; // $100/day
const costPerPlatform = {
  chatgpt: 0.0015,
  claude: 0.0020,
  perplexity: 0.0010,
  gemini: 0.0008
};

// Optimize query distribution
const queryAllocation = optimizeQueryDistribution(
  dailyBudget,
  costPerPlatform,
  dealerPriorities
);
```

## Dashboard Integration

### Visibility Score Calculation

```typescript
calculateVisibilityScore(results: QueryResult[]): VisibilityScore {
  const weights = this.config.analysis_prompts.visibility_scoring.scoring_weights;
  
  return {
    prominence: results.avgPosition * weights.prominence,
    completeness: results.avgCompleteness * weights.completeness,
    sentiment: results.avgSentiment * weights.sentiment,
    callToAction: results.ctaPresence * weights.call_to_action,
    overall: calculateWeightedAverage(results, weights)
  };
}
```

### Real-time Updates

```typescript
// Push updates to dashboard
async updateDashboard(dealerId: string, scores: VisibilityScore) {
  await fetch('/api/qai/visibility-scores', {
    method: 'POST',
    body: JSON.stringify({
      dealerId,
      scores,
      timestamp: new Date().toISOString()
    })
  });
}
```

## Performance Benchmarks

Target metrics for optimal performance:

| KPI | Target | Minimum | Calculation |
|-----|--------|---------|-------------|
| Mention Rate | 85% | 65% | mentions / total_queries |
| Avg Position | 2.5 | 4.0 | sum(positions) / mention_count |
| Completeness | 80% | 60% | info_scores / max_score * 100 |
| Sentiment | 0.75 | 0.50 | positive / total_mentions |

## Troubleshooting

### Common Issues

1. **Low Mention Rate**
   - Verify dealer name variations and DBAs
   - Check geographic query targeting
   - Review competitor density in area

2. **API Rate Limits**
   - Implement exponential backoff
   - Use caching more aggressively
   - Distribute queries across time

3. **Inconsistent Platform Results**
   - Normalize scoring across platforms
   - Weight platforms by reliability
   - Cross-validate with multiple queries

## Advanced Features

### Multi-Dealer Batch Processing

```typescript
async processDealerBatch(dealers: Dealer[]): Promise<BatchResults> {
  // Group by geographic region for efficiency
  const regionalGroups = groupByRegion(dealers);
  
  // Process regions in parallel
  const results = await Promise.all(
    regionalGroups.map(group => this.processRegion(group))
  );
  
  return consolidateResults(results);
}
```

### Competitive Intelligence

```typescript
async analyzeCompetitiveLandscape(dealer: Dealer): Promise<CompetitiveAnalysis> {
  const competitors = await this.identifyCompetitors(dealer);
  const comparativeQueries = this.generateComparativeQueries(dealer, competitors);
  const results = await this.executeQueries(comparativeQueries);
  
  return {
    shareOfVoice: calculateShareOfVoice(results, dealer),
    relativePosition: determineRelativeRank(results, dealer),
    competitiveAdvantages: extractAdvantages(results, dealer),
    improvementAreas: identifyGaps(results, dealer, competitors)
  };
}
```

## Maintenance & Updates

### Monthly Optimization Workflow

1. Review query performance metrics
2. Update query templates based on platform changes
3. Refine scoring algorithms using ML feedback
4. Adjust cost allocation based on ROI
5. Update competitive landscape mapping
6. Generate performance reports

### Version Control

Track prompt configuration changes:

```bash
# Create versioned backup
cp prompts/qai_master_prompt.json prompts/archive/qai_master_prompt_v1.0_$(date +%Y%m%d).json

# Update version in configuration
jq '.version = "1.1"' prompts/qai_master_prompt.json > temp.json && mv temp.json prompts/qai_master_prompt.json

# Commit changes
git add prompts/qai_master_prompt.json
git commit -m "Update QAI master prompt configuration to v1.1"
```

## Security Considerations

1. **API Key Management**
   - Store keys in secure environment variables
   - Rotate keys quarterly
   - Monitor usage for anomalies

2. **Data Privacy**
   - Anonymize dealer data in logs
   - Encrypt cached responses
   - Implement GDPR compliance

3. **Rate Limiting**
   - Implement per-dealer query limits
   - Use circuit breakers for API failures
   - Monitor and alert on unusual patterns

## Support & Resources

- **Documentation**: `/docs/qai-system/`
- **API Reference**: `/api/docs/qai/`
- **Support Email**: qai-support@dealershipai.com
- **Monitoring Dashboard**: `https://dashboard.dealershipai.com/qai`

## Next Steps

1. Configure platform API keys
2. Load master prompt configuration
3. Set up monitoring alerts
4. Run initial dealer analysis
5. Review dashboard integration
6. Schedule regular optimization reviews

---

*Last Updated: January 2025*
*Version: 1.0*
*Configuration File: `/prompts/qai_master_prompt.json`*