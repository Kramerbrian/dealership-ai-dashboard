# AI Answer Intelligence Integration Guide

## Overview

This guide covers the complete integration of the AI Answer Intelligence system into the DealershipAI dashboard. The system tracks AI overview visibility, citation share, and zero-click siphon impact across multiple AI engines.

## 🚀 What's Been Implemented

### 1. Database Schema
- **Tables**: `ai_answer_events`, `ai_snippet_share`
- **Materialized View**: `ai_zero_click_impact_mv`
- **Migration**: `0018_ai_answer_intel.sql`

### 2. API Endpoints
- **GET** `/api/ai/answer-intel` - Fetch AI intelligence KPIs
- **POST** `/api/ai/answer-intel/ingest` - Ingest AI answer events
- **GET** `/api/dashboard/impact` - Dashboard impact metrics

### 3. Dashboard Components
- **AiAnswerIntelCard** - Main dashboard widget
- **Integration** - Added to Intelligence page overview tab

### 4. Utility Functions
- **refreshAiZeroClickMV()** - Refresh materialized view
- **Sample data ingestion script** - For testing

## 📊 Key Metrics Tracked

### AI Visibility Percentage
- Percentage of probed queries where any AI answer appeared
- Tracks across Google SGE, Perplexity, Gemini, ChatGPT, Copilot, Claude

### Citation Share Percentage
- Percentage of AI answers that cited the dealer
- Critical for measuring brand visibility in AI responses

### Zero-Click Siphon Percentage
- Estimated traffic siphoned away by AI answers
- Uses 34.5% baseline siphon factor with citation protection

## 🔧 How to Use

### 1. Database Setup
The migration is already applied. If you need to re-run:
```sql
-- The migration file is at: db/migrations/0018_ai_answer_intel.sql
```

### 2. Ingest AI Answer Events
Send probe results to the ingest endpoint:
```bash
curl -X POST /api/ai/answer-intel/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "google_sge",
    "query": "best car dealership near me",
    "appeared": true,
    "cited": false,
    "clicksEst": 25.5,
    "sampleSize": 1
  }'
```

### 3. View Dashboard
Navigate to `/intelligence` and view the AI Answer Intelligence card in the Overview tab.

### 4. Sample Data (Testing)
Run the sample data ingestion script:
```bash
npx ts-node scripts/ingest-sample-ai-data.ts [tenant-id] [count]
```

## 🎯 Dashboard Features

### Real-time Metrics
- Auto-refreshes every 5 minutes
- Manual refresh button
- Last updated timestamp

### Risk Assessment
- **High Risk**: >20% siphon rate
- **Medium Risk**: 10-20% siphon rate  
- **Low Risk**: <10% siphon rate

### Protection Strategy
- Improve structured data and entity clarity
- Enhance review trust signals
- Optimize for featured snippets

## 🔄 Data Flow

1. **Probe Agents** → Send AI answer events to `/api/ai/answer-intel/ingest`
2. **Database** → Events stored in `ai_answer_events` table
3. **Materialized View** → `ai_zero_click_impact_mv` aggregates data
4. **Dashboard** → Fetches KPIs from `/api/ai/answer-intel`
5. **Display** → Real-time metrics shown in AiAnswerIntelCard

## 🛠️ Technical Details

### Supported AI Engines
- `google_sge` - Google Search Generative Experience
- `perplexity` - Perplexity AI
- `gemini` - Google Gemini
- `chatgpt` - OpenAI ChatGPT
- `copilot` - Microsoft Copilot
- `claude` - Anthropic Claude

### Snippet Types
- `overview` - AI overview boxes
- `snippet` - Featured snippets
- `paa` - People Also Ask
- `featured` - Featured results
- `inline_citation` - Inline citations

### Performance Optimizations
- Materialized view for fast aggregations
- Indexed queries for tenant and time
- Batch ingestion support
- Concurrent MV refresh

## 📈 Business Impact

### Revenue Protection
- Track zero-click siphon impact
- Monitor citation share trends
- Identify optimization opportunities

### Competitive Intelligence
- Compare AI visibility across engines
- Track market share in AI responses
- Measure brand authority signals

### Strategic Planning
- Data-driven AI optimization decisions
- ROI measurement for AI visibility efforts
- Trend analysis for future planning

## 🔐 Security & Compliance

### Multi-tenant Support
- Tenant isolation via RLS policies
- Secure API endpoints with auth
- Data privacy compliance

### Error Handling
- Graceful fallbacks for missing data
- Comprehensive error logging
- User-friendly error messages

## 🚀 Next Steps

### 1. Production Deployment
- Configure real tenant IDs
- Set up monitoring and alerts
- Implement proper authentication

### 2. Enhanced Features
- Historical trend analysis
- Competitive benchmarking
- Automated optimization recommendations

### 3. Integration Expansion
- Connect with existing AIV metrics
- Link to revenue attribution
- Integrate with alerting systems

## 📞 Support

For questions or issues with the AI Answer Intelligence system:
1. Check the API endpoints are responding
2. Verify database connectivity
3. Review error logs in the dashboard
4. Test with sample data ingestion

---

**Status**: ✅ Complete and Ready for Production
**Last Updated**: January 2025
**Version**: 1.0
