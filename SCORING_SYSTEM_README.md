# DealershipAI Scoring System

## 🎯 Overview

The DealershipAI Scoring System analyzes dealership websites across 5 key dimensions to determine their AI visibility and digital presence. This system provides actionable insights to help dealerships improve their online visibility in the age of AI assistants.

## 📊 The 5 Scoring Modules

### 1. SGP Integrity (Structured Data) - 10% Weight
**File**: `src/lib/scoring/sgp-integrity.ts`
- **Purpose**: Validates structured data implementation
- **Cost**: Free
- **Time**: ~2 seconds
- **Checks**:
  - JSON-LD structured data presence
  - LocalBusiness/AutoDealer schema
  - Required fields completeness
  - Validation errors

### 2. Zero-Click Shield - 20% Weight
**File**: `src/lib/scoring/zero-click.ts`
- **Purpose**: Optimizes for featured snippets and zero-click results
- **Cost**: Free
- **Time**: ~2 seconds
- **Checks**:
  - FAQ schema implementation
  - HowTo schema presence
  - Article/BlogPosting schema
  - Heading structure (H1, H2, H3)
  - Meta descriptions

### 3. Geo Trust (Google My Business) - 15% Weight
**File**: `src/lib/scoring/geo-trust.ts`
- **Purpose**: Analyzes local business presence
- **Cost**: Free (with Google Places API)
- **Time**: ~1 second
- **Checks**:
  - GMB listing existence
  - Profile completeness
  - Rating and review count
  - Photo presence
  - Business hours

### 4. UGC Health (Review Quality) - 20% Weight
**File**: `src/lib/scoring/ugc-health.ts`
- **Purpose**: Evaluates review ecosystem health
- **Cost**: Free (with Google Places API)
- **Time**: ~1 second
- **Checks**:
  - Average rating
  - Total review volume
  - Recent review velocity
  - Response rate
  - Review quality metrics

### 5. AI Visibility Tracker - 35% Weight
**File**: `src/lib/scoring/ai-visibility.ts`
- **Purpose**: Tests actual AI assistant visibility
- **Cost**: ~$0.10 per analysis
- **Time**: ~10 seconds
- **Checks**:
  - ChatGPT mention rate
  - Claude mention rate
  - Query response relevance
  - Business name recognition

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `env-template.txt` to `.env.local` and fill in your API keys:

```bash
cp env-template.txt .env.local
```

**Required for full functionality**:
- `OPENAI_API_KEY` - For ChatGPT queries
- `ANTHROPIC_API_KEY` - For Claude queries
- `GOOGLE_PLACES_API_KEY` - For GMB and review data

### 3. Test Individual Modules

```bash
# Test SGP Integrity (Free)
npm run test:sgp

# Test Zero-Click (Free)
npm run test:zero-click

# Test Geo Trust (Free with API key)
npm run test:geo-trust

# Test UGC Health (Free with API key)
npm run test:ugc-health

# Test AI Visibility (Costs ~$0.10)
npm run test:ai-visibility
```

### 4. Test Full System

```bash
# Run complete analysis (Costs ~$0.12)
npm run test:full-scoring
```

### 5. Use API Endpoints

```bash
# Start development server
npm run dev

# Test API endpoint
curl "http://localhost:3000/api/ai-scores?origin=example.com"

# Test detailed endpoint
curl "http://localhost:3000/api/ai-scores-detailed?origin=example.com"
```

## 📁 Project Structure

```
src/lib/
├── scoring/
│   ├── sgp-integrity.ts       # Day 1: Structured Data
│   ├── zero-click.ts          # Day 2: Zero-Click Optimization
│   ├── geo-trust.ts           # Day 3: Google My Business
│   ├── ugc-health.ts          # Day 4: Review Health
│   └── ai-visibility.ts       # Day 5: AI Visibility
├── utils/
│   ├── html-fetcher.ts        # Website content fetching
│   └── cache.ts               # Caching layer
└── scoring-engine.ts          # Orchestration layer

api/
├── ai-scores.ts               # Basic scoring endpoint
└── ai-scores-detailed.ts      # Detailed scoring endpoint

test-*.ts                      # Individual module tests
```

## 💰 Cost Analysis

### Per Dealership Analysis (Without Caching):
- **SGP Integrity**: $0.00
- **Zero-Click**: $0.00
- **Geo Trust**: $0.00
- **UGC Health**: $0.00
- **AI Visibility**: $0.10
- **Total**: $0.12 per analysis

### With 24h Caching (90% hit rate):
- **Cost per dealer/month**: $0.12 × 0.1 × 2 = $0.024
- **Actual cost**: Even better with pooling!

## 🔧 API Usage

### Basic Scoring

```typescript
import { getDealershipScores } from './src/lib/scoring-engine';

const scores = await getDealershipScores('example.com');
console.log(scores);
// {
//   ai_visibility: 67,
//   zero_click: 72,
//   ugc_health: 81,
//   geo_trust: 75,
//   sgp_integrity: 69,
//   overall: 72,
//   timestamp: "2025-01-05T12:00:00.000Z"
// }
```

### Detailed Scoring

```typescript
import { getDetailedDealershipScores } from './src/lib/scoring-engine';

const detailedScores = await getDetailedDealershipScores('example.com');
console.log(detailedScores.details);
// {
//   sgp: { score: 69, hasSchema: true, schemaTypes: [...], ... },
//   zeroClick: { score: 72, hasFAQ: true, faqCount: 5, ... },
//   geo: { score: 75, hasGMB: true, rating: 4.5, ... },
//   ugc: { score: 81, averageRating: 4.3, totalReviews: 150, ... },
//   ai: { score: 67, chatgptScore: 70, claudeScore: 64, ... }
// }
```

### HTTP API

```bash
# Basic scoring
curl "http://localhost:3000/api/ai-scores?origin=example.com"

# Detailed scoring
curl "http://localhost:3000/api/ai-scores-detailed?origin=example.com"
```

## 🎯 Scoring Weights

The overall score is calculated using weighted averages:

- **AI Visibility**: 35% (Most important - actual AI mentions)
- **Zero-Click**: 20% (Featured snippets optimization)
- **UGC Health**: 20% (Review ecosystem health)
- **Geo Trust**: 15% (Local business presence)
- **SGP Integrity**: 10% (Technical foundation)

## 🚨 Production Considerations

### 1. Rate Limiting
- AI queries are limited to 50 per day by default
- Use `getDealershipScoresOptimized()` for automatic fallback to estimates

### 2. Error Handling
- Each module has built-in error handling
- Failed modules return 0 score instead of breaking the system
- Detailed error logging for debugging

### 3. Caching
- Results are cached for 24 hours by default
- Reduces API costs by ~90%
- Use Redis in production for better performance

### 4. Monitoring
- All scoring requests are logged
- Cost tracking per analysis
- Performance metrics collection

## 🔍 Development Tips

### Testing Without API Keys
- Modules return mock data when API keys are missing
- Perfect for development and testing
- Real data requires valid API keys

### Cost Optimization
- Use `analyzeAIVisibilityOptimized()` for cost control
- Implement geographic pooling for similar businesses
- Cache aggressively to reduce API calls

### Debugging
- Enable detailed logging with `LOG_LEVEL=debug`
- Use individual test files to isolate issues
- Check network connectivity for external APIs

## 📈 Next Steps

After implementing the 5 scoring modules:

1. **Add Geographic Pooling** - Reduce costs by ~80%
2. **Implement Synthetic Variance** - Add realistic score variations
3. **Build Dashboard UI** - Visualize scores and trends
4. **Setup ChatGPT Agent** - Automated recommendations
5. **Deploy to Production** - Scale with proper infrastructure

## 🆘 Troubleshooting

### Common Issues

**"Failed to fetch website"**
- Check internet connectivity
- Verify domain is accessible
- Some sites block automated requests

**"API key not configured"**
- Add missing API keys to `.env.local`
- Restart development server after changes
- Check key permissions and quotas

**"Analysis failed"**
- Check console logs for specific errors
- Verify all dependencies are installed
- Test individual modules to isolate issues

### Getting Help

1. Check the console logs for detailed error messages
2. Test individual modules to isolate the problem
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed with `npm install`

## 🎉 Success Metrics

After implementing this system, you should have:

- ✅ **5 working scoring modules** with real data
- ✅ **API endpoints** serving scores via HTTP
- ✅ **Caching layer** reducing costs by 90%
- ✅ **Test suite** validating all functionality
- ✅ **Cost tracking** monitoring API usage
- ✅ **Error handling** for production reliability

**Total development time**: ~5 days
**Cost per analysis**: $0.12 (with caching: $0.024)
**Analysis time**: ~16 seconds per dealership
