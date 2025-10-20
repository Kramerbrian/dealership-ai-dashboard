# DealershipAI Scoring System

## Overview

The DealershipAI scoring system uses 9 core metrics to evaluate dealership performance across AI visibility, trust, and operational excellence. Each metric is scored 0-100 and weighted based on ElasticNet regression analysis.

## Core Metrics

### 1. ATI - Algorithmic Trust Index
**Purpose**: Measures how well the dealership adheres to algorithmic standards and policies.

**Components**:
- Schema Compliance (25%)
- Data Freshness (25%)
- Feed Integrity (25%)
- Policy Adherence (25%)

**Calculation**:
```
ATI = (schemaCompliance × 0.25) + (dataFreshness × 0.25) + 
      (feedIntegrity × 0.25) + (policyAdherence × 0.25)
```

### 2. AIV - AI Visibility Index
**Purpose**: Evaluates presence and performance in AI search results and voice queries.

**Components**:
- Search Presence (30%)
- AI Mentions (30%)
- Content Relevance (20%)
- Semantic Density (20%)

**Calculation**:
```
AIV = (searchPresence^0.9 × 0.3) + (aiMentions^0.8 × 0.3) + 
      (contentRelevance × 0.2) + (semanticDensity × 0.2)
```

### 3. VLI - Vehicle Listing Integrity
**Purpose**: Assesses quality and completeness of vehicle listing data.

**Components**:
- Listing Completeness (30%)
- Image Quality (40%)
- Data Accuracy (20%)
- Update Frequency (10%)

**Calculation**:
```
VLI = (listingCompleteness × 0.3) + (imageQuality × 0.4) + 
      (dataAccuracy × 0.2) + (updateFrequency × 0.1)
```

### 4. OI - Offer Integrity
**Purpose**: Measures transparency and accuracy of pricing and offers.

**Components**:
- Price Transparency (40%)
- Offer Clarity (30%)
- Condition Accuracy (20%)
- Availability Status (10%)

**Calculation**:
```
OI = (priceTransparency × 0.4) + (offerClarity × 0.3) + 
     (conditionAccuracy × 0.2) + (availabilityStatus × 0.1)
```

### 5. GBP - Google Business Profile Health
**Purpose**: Evaluates Google Business Profile optimization and engagement.

**Components**:
- Profile Completeness (25%)
- Review Score (35%)
- Response Rate (25%)
- Update Frequency (15%)

**Calculation**:
```
GBP = (profileCompleteness × 0.25) + ((reviewScore/5) × 100 × 0.35) + 
      (responseRate × 0.25) + (updateFrequency × 0.15)
```

### 6. RRS - Review & Reputation Score
**Purpose**: Analyzes customer feedback and reputation management.

**Components**:
- Average Rating (40%)
- Review Count (20%)
- Sentiment Score (25%)
- Response Rate (15%)

**Calculation**:
```
RRS = ((averageRating/5) × 100 × 0.4) + (log10(reviewCount + 1) × 20 × 0.2) + 
      (sentimentScore × 0.25) + (responseRate × 0.15)
```

### 7. WX - Web Experience
**Purpose**: Measures website performance and user experience.

**Components**:
- Page Speed (40%)
- Mobile Usability (30%)
- Accessibility (20%)
- SEO Score (10%)

**Calculation**:
```
WX = (pageSpeed × 0.4) + (mobileUsability × 0.3) + 
     (accessibility × 0.2) + (seoScore × 0.1)
```

### 8. IFR - Inventory Freshness Recency
**Purpose**: Tracks how current and up-to-date inventory data is.

**Components**:
- Listing Age (30%) - inverse scoring
- Update Frequency (30%)
- Data Completeness (25%)
- Sync Accuracy (15%)

**Calculation**:
```
IFR = ((100 - listingAge) × 0.3) + (updateFrequency × 0.3) + 
      (dataCompleteness × 0.25) + (syncAccuracy × 0.15)
```

### 9. CIS - Clarity Intelligence Score
**Purpose**: Evaluates content clarity and information architecture.

**Components**:
- Content Clarity (30%)
- Information Architecture (25%)
- User Journey (25%)
- Call-to-Action Effectiveness (20%)

**Calculation**:
```
CIS = (contentClarity × 0.3) + (informationArchitecture × 0.25) + 
      (userJourney × 0.25) + (callToActionEffectiveness × 0.2)
```

## Penalty System

Penalties reduce the overall score based on violations:

### Penalty Types
- **Policy Violations** (40% weight): Compliance issues
- **Parity Failures** (30% weight): Data inconsistencies
- **Feed Staleness** (20% weight): Outdated information
- **Data Inconsistencies** (10% weight): Format mismatches

### Penalty Calculation
```
Penalty = (policyViolations × 0.4) + (parityFailures × 0.3) + 
          (feedStaleness × 0.2) + (dataInconsistencies × 0.1)

Final Score = Weighted Score × (1 - Penalty)
```

## Weight Learning

### ElasticNet Regression
The system uses ElasticNet regression to automatically adjust metric weights based on historical performance data.

### Weight Updates
- **Frequency**: Weekly
- **Method**: ElasticNet with L1 and L2 regularization
- **Stability**: Weights are clamped to prevent extreme changes
- **Fallback**: Default weights used if insufficient data

### Default Weights
```
ATI: 15%  - Algorithmic Trust Index
AIV: 20%  - AI Visibility Index  
VLI: 15%  - Vehicle Listing Integrity
OI:  10%  - Offer Integrity
GBP: 12%  - Google Business Profile
RRS: 10%  - Review & Reputation Score
WX:  8%   - Web Experience
IFR: 5%   - Inventory Freshness Recency
CIS: 5%   - Clarity Intelligence Score
```

## Data Sources

### Primary Sources
- Website crawling and analysis
- Google Business Profile API
- Review platform APIs
- Search engine data
- AI platform mentions

### Secondary Sources
- Social media monitoring
- Competitor analysis
- Market research data
- Customer feedback

## Score Interpretation

### Score Ranges
- **90-100**: Excellent - Industry leading performance
- **80-89**: Good - Above average performance
- **70-79**: Fair - Average performance with room for improvement
- **60-69**: Poor - Below average, needs attention
- **0-59**: Critical - Significant issues requiring immediate action

### Recommendations
The system generates targeted recommendations based on:
- Low-scoring metrics
- Penalty analysis
- Competitive positioning
- Industry best practices

## API Usage

### Calculate Score
```typescript
import { scoringEngine } from '@/lib/scoring/algorithm';

const scoreResult = await scoringEngine.calculateScore({
  domain: 'example-dealership.com',
  tenantId: 'tenant-123',
  timestamp: new Date(),
  rawData: { /* metric data */ },
  penalties: { /* penalty data */ }
});
```

### Learn Weights
```typescript
const newWeights = await scoringEngine.learnWeights(historicalData);
```

## Monitoring

### Real-time Tracking
- Score changes over time
- Metric performance trends
- Penalty occurrences
- Weight adjustments

### Alerts
- Significant score drops
- Penalty threshold breaches
- Data quality issues
- System errors

## Best Practices

### Data Quality
- Ensure accurate and complete data
- Regular data validation
- Timely updates
- Consistent formatting

### Performance Optimization
- Monitor page speed
- Optimize images
- Improve mobile experience
- Enhance accessibility

### Content Strategy
- Target AI search queries
- Create voice-optimized content
- Maintain fresh inventory data
- Encourage customer reviews

---

For technical implementation details, see the source code in `lib/scoring/algorithm.ts`.
