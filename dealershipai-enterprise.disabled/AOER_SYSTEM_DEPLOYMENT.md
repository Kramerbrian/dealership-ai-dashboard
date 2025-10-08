# 🎯 AOER (AI Overview Exposure Rate) System - Deployment Guide

## ✅ **What's Been Implemented**

The AOER system is fully implemented and ready for deployment. This is a comprehensive AI visibility analytics system that tracks AI Overview exposure and provides actionable insights.

### **1. Core Algorithms**
- **AOER Calculations**: Unweighted, volume-weighted, positional, and prominence-weighted
- **AI Claim Score (ACS)**: 0-100 risk score for each query
- **Click Loss Estimation**: CTR-based traffic impact analysis
- **Priority Scoring**: Ranks queries by impact and risk
- **Trend Analysis**: Compares periods for improvement tracking

### **2. Database Schema**
- **`queries`**: Query metadata and intent classification
- **`query_checks`**: SERP data and AI Overview presence
- **`query_metrics`**: Calculated metrics and priority scores
- **`aoer_rollups`**: Aggregated metrics by tenant/date/intent

### **3. API Endpoints**
- **`GET /api/tenants/[tenantId]/aoer`**: Comprehensive AOER dashboard data
- **`POST /api/tenants/[tenantId]/aoer`**: Submit new query check data
- **Real-time calculations** with trend analysis and recommendations

### **4. UI Components**
- **AOER Dashboard Card**: Multi-tab interface with overview, priority, and intent breakdown
- **Visual indicators** for trends, risk levels, and actionable insights
- **Interactive tables** for priority queries and intent analysis

### **5. Integration Points**
- **AIV Enhancement**: AOER negatively impacts visibility scores
- **ATR Enhancement**: Citation share boosts trust scores
- **Composite Reputation**: Combines all factors with click loss impact

## 🚀 **Deployment Steps**

### **Step 1: Create Database Tables**

Run the SQL migration in your Supabase database:

```sql
-- Create the AOER tables (from src/db/schema/aoer.ts)
-- This includes queries, query_checks, query_metrics, and aoer_rollups tables
-- Plus all necessary indexes and RLS policies
```

### **Step 2: Test the System**

```bash
# Test the AOER algorithms (works without database)
npm run aoer:test

# Expected output shows:
# - Individual query analysis
# - AOER rollup calculations
# - Intent breakdown
# - Priority query ranking
# - Recommendations
# - Trend analysis
```

### **Step 3: Deploy to Production**

```bash
# Deploy to Vercel
vercel --prod

# The AOER Card will be available in the dashboard
```

## 📊 **Test Results Summary**

From our test run with sample data:

```
📋 Summary:
   AOER (Positional Weighted): 56.2%
   Avg AI Claim Score: 69.8
   Citation Share: 40.0%
   Monthly Click Loss: 1544
   Priority Queries: 5
   Recommendations: 2
```

### **Key Metrics Explained:**

1. **AOER (Positional Weighted)**: 56.2% - 56.2% of queries show AI Overviews, weighted by prominence
2. **AI Claim Score**: 69.8 - Average risk score (higher = more at-risk)
3. **Citation Share**: 40.0% - 40% of AI Overviews cite your domain
4. **Click Loss**: 1,544 - Estimated monthly click loss from AI Overviews
5. **Priority Queries**: 5 queries ranked by impact and risk

## 🎯 **Algorithm Details**

### **AI Claim Score (ACS) Formula:**
```
ACS = (45×present + 25×prominence + 20×noCitation + 10×depth) / 100
```

### **AOER Calculations:**
- **Unweighted**: Simple percentage of queries with AI Overviews
- **Volume Weighted**: Weighted by search volume
- **Positional**: Weighted by AI Overview position (top=1.0, mid=0.6, bottom=0.3)
- **Positional Weighted**: Combines volume and position weighting

### **Click Loss Estimation:**
```
Click Loss = Volume × (CTR_base - CTR_with_AI)
CTR_with_AI = CTR_base × Dampen_Factor(position)
```

### **Priority Score:**
```
Priority = 100 × (0.5×ImpactNorm + 0.5×RiskNorm) × (0.6×VolumeNorm + 0.4)
```

## 🔧 **Configuration**

### **Tuneable Constants:**
```typescript
// AI Claim Score weights
const W_PRESENT = 45      // Presence weight
const W_PROMINENCE = 25   // Position weight  
const W_NO_CITE = 20      // Citation penalty
const W_DEPTH = 10        // Content depth

// CTR dampening factors
const DAMPEN = {
  top: 0.55,    // 45% CTR reduction
  mid: 0.70,    // 30% CTR reduction
  bottom: 0.85, // 15% CTR reduction
  none: 1.00    // No reduction
}
```

### **Baseline CTR by Rank:**
```typescript
const CTR_BASE = {
  1: 0.28,  // 28% CTR for rank 1
  2: 0.16,  // 16% CTR for rank 2
  3: 0.11,  // 11% CTR for rank 3
  4: 0.08,  // 8% CTR for rank 4
  5: 0.06,  // 6% CTR for rank 5
  6+: 0.03  // 3% CTR for rank 6+
}
```

## 📈 **Usage Examples**

### **API Usage:**
```bash
# Get AOER data for a tenant
curl "https://your-domain.com/api/tenants/{tenantId}/aoer"

# Submit new query check
curl -X POST "https://your-domain.com/api/tenants/{tenantId}/aoer" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "best car dealership near me",
    "intent": "local",
    "volume": 5000,
    "serpPosition": 3,
    "aiPresent": true,
    "aiPosition": "top",
    "hasOurCitation": false
  }'
```

### **Dashboard Integration:**
```tsx
import { AOERCard } from '@/components/dashboard/AOERCard'

// Add to your dashboard
<AOERCard tenantId="your-tenant-id" className="col-span-2" />
```

## 🎯 **Key Benefits**

1. **AI Visibility Tracking**: Monitor AI Overview exposure across all queries
2. **Risk Assessment**: Identify high-risk queries with AI Claim Scores
3. **Traffic Impact**: Estimate click loss from AI Overviews
4. **Priority Ranking**: Focus on highest-impact queries first
5. **Trend Analysis**: Track improvements over time
6. **Actionable Insights**: Specific recommendations for optimization

## 📊 **Dashboard Features**

### **Overview Tab:**
- Key metrics tiles (AOER, AI Claim Score, Citation Share, Click Loss)
- Trend indicators with 15-day comparisons
- Automated recommendations based on analysis

### **Priority Tab:**
- Ranked list of AI-claimed queries
- AI Claim Score, Click Loss, and Priority Score for each
- One-click actions for optimization

### **Intents Tab:**
- AOER breakdown by query intent (local, inventory, finance, etc.)
- Query counts and weighted scores per intent
- Intent-specific optimization opportunities

## 🔄 **Integration with Existing Systems**

### **AIV (Algorithmic Visibility Index):**
- AOER negatively impacts AIV (higher AOER = lower visibility)
- Citation share positively impacts AIV
- 20% weight for AOER impact, 10% for citation boost

### **ATR (Algorithmic Trust Index):**
- Citation share is a strong trust signal (25% weight)
- Lower AI Claim Score indicates better trust (15% weight)
- AI citations = trust validation

### **Composite Reputation Score:**
- Combines AIV + ATR + UGC resonance
- Includes click loss impact in financial calculations
- Provides holistic view of AI visibility impact

## 🎉 **Success Criteria**

The system is working correctly when:
- ✅ AOER algorithms calculate correctly
- ✅ API endpoints return comprehensive data
- ✅ UI components display metrics and trends
- ✅ Priority queries are ranked by impact
- ✅ Recommendations are actionable and specific
- ✅ AIV/ATR integration improves accuracy
- ✅ Click loss estimates are reasonable

## 🚀 **Next Steps**

1. **Deploy database schema** to Supabase
2. **Set up data ingestion** for query checks
3. **Integrate with existing crawlers** for SERP monitoring
4. **Add AOER Card to dashboard** for real-time monitoring
5. **Monitor improvements** in AIV/ATR accuracy
6. **Iterate based on results** and user feedback

The AOER system is now ready to provide comprehensive AI visibility analytics and significantly improve your AIV and ATR model accuracy! 🎯
