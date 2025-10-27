# Enhanced dAI Algorithm Documentation

## Overview

The Enhanced DealershipAI (dAI) Algorithm represents a comprehensive AI visibility scoring system that incorporates advanced QAI (Quality of Answers Index) and PIQR (Page Information Quality Rank) metrics, real-time citation tracking, sentiment analysis, competitive benchmarking, structured data auditing, and technical health monitoring.

## Core Algorithm Components

### 1. QAI (Quality of Answers Index)

The QAI measures how well a dealership's content answers user queries and appears in AI-generated responses.

**Components:**
- **Answer Relevance** (25%): Semantic overlap with user queries
- **Structured Data Presence** (20%): Schema markup coverage
- **Content Clarity** (15%): Header structure and formatting
- **Citation Signals** (15%): External source references
- **Query Coverage** (15%): Breadth of answered queries
- **Answer Freshness** (10%): Content recency and updates

**Formula:**
```
QAI = (AnswerRelevance × 0.25) + (StructuredDataPresence × 0.20) + 
      (ContentClarity × 0.15) + (CitationSignals × 0.15) + 
      (QueryCoverage × 0.15) + (AnswerFreshness × 0.10)
```

### 2. PIQR (Page Information Quality Rank)

The PIQR evaluates the overall quality and trustworthiness of a dealership's digital presence.

**Components:**
- **Authorship Signals** (20%): Expert bios, credentials, attribution
- **Technical Health** (25%): Core Web Vitals, mobile optimization
- **Sentiment Trust** (20%): Review sentiment, NPS, reputation
- **Content Depth** (15%): Comprehensive content coverage
- **Citation Stability** (10%): Citation retention vs competitors
- **Content Safety** (10%): Privacy compliance, transparency

**Formula:**
```
PIQR = (AuthorshipSignals × 0.20) + (TechnicalHealth × 0.25) + 
       (SentimentTrust × 0.20) + (ContentDepth × 0.15) + 
       (CitationStability × 0.10) + (ContentSafety × 0.10)
```

### 3. VAI (Visibility Authority Index)

The VAI combines QAI with citation stability and position, penalized by PIQR issues.

**Formula:**
```
VAI = (QAI × 0.4) + (CitationStability × 0.3) + (CitationPosition × 0.3) - PIQRPenalty
```

### 4. HRP (High-Risk Penalty)

The HRP identifies and penalizes critical issues that could impact AI visibility.

**Penalty Factors:**
- Technical issues (error rate > 5%, uptime < 95%, poor Core Web Vitals)
- Sentiment issues (negative sentiment < -20, declining trend)
- Competitive issues (displacement risk > 70%, competitive gap < -30%)

### 5. OCI (Organic Citation Index)

The OCI measures the financial value of organic citations across AI engines.

**Formula:**
```
OCI = (ChatGPTMentions × 50) + (PerplexityMentions × 45) + 
      (GeminiMentions × 40) + (GoogleAIMentions × 60) + 
      (FeaturedSnippets × 80) + (PeopleAlsoAsk × 30) × CompetitiveMultiplier
```

## Advanced Metrics from JSON Schema

### Core Metrics

1. **Mentions**: Count of dealer mentions in AI answers
2. **Citations**: Count of explicit URL references
3. **SentimentIndex**: Net sentiment score (-100 to +100)
4. **ContentReadiness**: Percentage of optimized pages
5. **ShareOfVoice**: Dealer's share of total voice
6. **CitationStability**: Citation persistence score
7. **ImpressionToClickRate**: CTR from AI impressions
8. **CompetitiveShare**: Visibility vs competitors
9. **SemanticRelevanceScore**: NLP similarity score
10. **TechnicalHealth**: Composite technical score

### AI Engine Specific Adaptations

#### ChatGPT Strength
- **Focus**: Text coherence, informational depth, intent fit
- **Calculation**: Content quality + semantic relevance + authority signals
- **Optimization**: FAQ content, sales copy, prompt coverage

#### Perplexity Strength
- **Focus**: Citation frequency, freshness, domain reputation
- **Calculation**: Citations + citation stability + authority signals
- **Optimization**: Real-time citation opportunities, authoritative content

#### Gemini Strength
- **Focus**: Knowledge Graph signals, reputation, schema optimization
- **Calculation**: Structured data + technical health + authority signals
- **Optimization**: Schema markup, entity authority, SGE inclusion

## Technical Implementation

### File Structure

```
lib/
├── scoring/
│   ├── enhanced-dai-engine.ts          # Core enhanced dAI engine
│   └── advanced-metrics-engine.ts     # Advanced metrics from JSON schema
├── services/
│   ├── citation-tracker.ts            # Real-time citation tracking
│   ├── sentiment-analyzer.ts          # Advanced sentiment analysis
│   ├── competitive-analyzer.ts        # Competitive benchmarking
│   ├── structured-data-auditor.ts     # Schema validation
│   └── technical-health-monitor.ts    # Technical health monitoring
app/api/
└── enhanced-dai/
    └── route.ts                       # Enhanced dAI API endpoint
components/dashboard/
└── EnhancedDAIDashboard.tsx           # Comprehensive dashboard UI
```

### API Endpoints

#### GET /api/enhanced-dai
Returns comprehensive enhanced dAI metrics including:
- Overall score and risk level
- QAI and PIQR breakdowns
- Advanced metrics from JSON schema
- AI engine specific scores
- Competitive intelligence
- Technical health metrics
- Structured data coverage
- Sentiment analysis
- Citation tracking
- Actionable recommendations

**Parameters:**
- `dealerId`: Dealer identifier
- `domain`: Dealer domain
- `simulate`: Include simulation data (optional)

#### POST /api/enhanced-dai
Processes custom metrics for enhanced dAI calculation.

**Body:**
```json
{
  "dealerId": "string",
  "domain": "string",
  "metrics": {
    "qai": { ... },
    "piqr": { ... },
    "citations": { ... },
    "sentiment": { ... },
    "competitive": { ... },
    "technical": { ... }
  }
}
```

## Dashboard Features

### Overview Tab
- Overall dAI score with trend indicators
- QAI and PIQR breakdowns with progress bars
- Advanced metrics grid
- Critical issues alerts

### AI Engines Tab
- ChatGPT, Perplexity, and Gemini strength scores
- Citation tracking with real-time metrics
- AI engine specific recommendations

### Competitive Tab
- Market position and share of voice
- Competitive gap analysis
- Top competitors with threat levels
- Displacement risk assessment

### Technical Tab
- Core Web Vitals monitoring
- Page speed and mobile optimization
- Accessibility compliance
- Error rate and security metrics

### Content Tab
- Structured data coverage by schema type
- Sentiment analysis with trends
- Content quality assessment
- Authority signal strength

### Recommendations Tab
- Prioritized action items
- Impact and effort assessment
- Category-based organization
- Implementation guidance

## Usage Examples

### Basic Implementation

```typescript
import { EnhancedDAIEngine } from '@/lib/scoring/enhanced-dai-engine';

const daiEngine = new EnhancedDAIEngine();
const result = daiEngine.calculateEnhancedDAIScore(metrics);

console.log('Overall Score:', result.overallScore);
console.log('Risk Level:', result.riskLevel);
console.log('Recommendations:', result.recommendations);
```

### Dashboard Integration

```tsx
import EnhancedDAIDashboard from '@/components/dashboard/EnhancedDAIDashboard';

function Dashboard() {
  return (
    <EnhancedDAIDashboard 
      dealerId="demo-dealer"
      domain="demo-dealership.com"
    />
  );
}
```

### API Integration

```typescript
const response = await fetch('/api/enhanced-dai?dealerId=demo&domain=example.com&simulate=true');
const data = await response.json();

console.log('QAI Score:', data.qai.score);
console.log('PIQR Score:', data.piqr.score);
console.log('VAI Score:', data.vai);
```

## Performance Considerations

### Caching Strategy
- API responses cached for 5 minutes with 10-minute stale-while-revalidate
- Real-time metrics updated every 5 minutes
- Historical data cached for 24 hours

### Data Quality
- Confidence scores based on data completeness
- Fallback to demo data when live data unavailable
- Validation of all metric calculations

### Scalability
- Modular architecture for easy extension
- Efficient algorithms for real-time processing
- Optimized database queries for large datasets

## Monitoring and Alerts

### Critical Issues
- Overall score below 40
- Technical health below 50
- High error rates (>10%)
- Security vulnerabilities
- Mobile unfriendly status

### Risk Levels
- **Low**: Score 80+, minimal issues
- **Medium**: Score 60-79, some concerns
- **High**: Score 40-59, significant issues
- **Critical**: Score <40, urgent action required

## Future Enhancements

### Planned Features
- Machine learning model integration
- Real-time competitor monitoring
- Predictive analytics
- Automated optimization recommendations
- Integration with more AI engines

### API Extensions
- Webhook support for real-time updates
- Bulk processing endpoints
- Historical trend analysis
- Custom metric definitions

## Support and Documentation

For technical support and detailed documentation:
- API Documentation: `/api/docs`
- Algorithm Details: `/docs/algorithms`
- Dashboard Guide: `/docs/dashboard`
- Integration Examples: `/docs/examples`

## License

This enhanced dAI algorithm is proprietary to DealershipAI and protected by intellectual property rights. Unauthorized use or distribution is prohibited.
