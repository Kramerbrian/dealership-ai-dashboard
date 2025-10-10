# Closed-Loop AIV System - Complete Deployment Guide

## 🎯 Overview

This guide will help you deploy the **self-improving Algorithmic Visibility Index™ (AIV)** as a production-grade closed-loop analytics API that constantly retrains itself against fresh dealership data.

## 🏗️ System Architecture

### Core Components
- **Next.js API Routes**: 6 endpoints for closed-loop analytics
- **Supabase Database**: Raw signals, model weights, audit trails
- **Vercel Deployment**: Serverless functions with cron jobs
- **Dashboard Integration**: Real-time metrics via API

### Data Flow
```
Fresh Data → Supabase → API Processing → Model Updates → Dashboard Display
     ↑                                                      ↓
     └─────────── Continuous Learning Loop ←─────────────────┘
```

## 📊 API Endpoints

| Endpoint | Method | Purpose | Schedule |
|----------|--------|---------|----------|
| `/api/kpis/latest` | GET | Serve current AIV/ATI/CRS/Elasticity | Real-time |
| `/api/history` | GET | Return 8-week trend for charts | Real-time |
| `/api/train/reinforce` | POST | Update pillar weights from new data | Daily @ 2 AM |
| `/api/train/evaluate` | POST | Log RMSE, R², MAPE and suggest learning rate | Weekly @ 3 AM |
| `/api/anomaly/reviews` | POST | FraudGuard audit with 4σ detection | Every 6 hours |
| `/api/predict/forecast` | GET | Kalman + gradient boost forecast | Weekly @ 4 AM |

## 🗄️ Database Schema

### Core Tables
- `aiv_raw_signals` - Ingested data from various sources
- `model_weights` - Evolution of model weights over time
- `model_audit` - Performance tracking and audit trails
- `anomaly_detection` - Fraud and anomaly detection results
- `predictive_forecasts` - Stored predictions for future AIV
- `reinforcement_history` - Weight update history

### Key Functions
- `recompute_elasticity_8w()` - 8-week rolling regression
- `update_model_weights()` - Reinforcement learning updates
- `detect_review_anomalies()` - FraudGuard detection

## 🚀 Deployment Steps

### 1. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Start local development
supabase start

# Apply migrations
supabase db push
```

### 2. Environment Variables

Add to Vercel dashboard:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure cron jobs in Vercel dashboard
```

### 4. Cron Job Configuration

In Vercel dashboard → Functions → Cron Jobs:

```json
{
  "crons": [
    {
      "path": "/api/train/reinforce",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/train/evaluate", 
      "schedule": "0 3 * * 1"
    },
    {
      "path": "/api/anomaly/reviews",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/predict/forecast",
      "schedule": "0 4 * * 1"
    }
  ]
}
```

## 🔄 Continuous Learning Cycle

### Daily Process (2 AM UTC)
1. **Ingest**: Fresh crawl + revenue data → `aiv_raw_signals`
2. **Reinforce**: Update pillar weights using reward signal
3. **Log**: Store weight changes in `reinforcement_history`

### Weekly Process (Monday 3 AM UTC)
1. **Evaluate**: Compare predicted vs actual performance
2. **Assess**: Calculate RMSE, R², MAPE improvements
3. **Recommend**: Suggest optimal learning rate
4. **Forecast**: Generate 4-week predictions

### Continuous Process (Every 6 hours)
1. **Detect**: Run FraudGuard anomaly detection
2. **Flag**: Identify velocity spikes and sentiment anomalies
3. **Penalize**: Apply FraudGuard penalty scores

## 📈 Monitoring & Governance

### Model Health Dashboard
- **RMSE Trends**: Track prediction accuracy over time
- **R² Evolution**: Monitor model fit quality
- **Accuracy Gains**: Month-over-month improvements
- **Weight Drift**: Pillar weight stability analysis

### Alerting Thresholds
- **Model Drift**: Δweights > 4σ → Alert
- **Performance Drop**: RMSE increase > 20% → Alert
- **Fraud Detection**: FraudGuard score < 0.8 → Alert
- **Data Quality**: Coverage < 90% → Alert

### GitHub Actions Integration
```yaml
name: AIV Benchmark
on:
  schedule:
    - cron: '0 5 1 * *'  # Monthly on 1st at 5 AM
jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - name: Run AIV Benchmark
        run: |
          curl -X POST ${{ secrets.VERCEL_URL }}/api/train/evaluate \
            -H "Content-Type: application/json" \
            -d '{"dealerId": "all"}'
      - name: Commit Results
        run: |
          git add benchmarks/
          git commit -m "AIV Monthly Benchmark $(date +%Y-%m)"
          git push
```

## 🎛️ Dashboard Integration

### Real-Time Updates
```typescript
// Dashboard component
const { data, loading, error } = useSWR(
  '/api/kpis/latest?dealerId=naplesfordfl',
  fetcher,
  { refreshInterval: 300000 } // 5 minutes
);

// Access enhanced metrics
const currentAIV = data?.current_metrics.aiv;
const modelWeights = data?.model_weights;
const accuracyGain = data?.audit_info.accuracy_gain_mom;
```

### New Dashboard Tiles
- **Model Accuracy**: Shows MoM accuracy improvements
- **Predictive Forecast**: 4-week AIV trend with confidence bands
- **FraudGuard Score**: Real-time data trust monitoring
- **Weight Evolution**: Pillar weight changes over time
- **Anomaly Alerts**: Recent fraud detection results

## 🔧 Advanced Configuration

### Custom Learning Rates
```typescript
// Adjust learning rate based on performance
const learningRate = accuracyGain > 0.1 ? 0.2 : 
                    accuracyGain < -0.05 ? 0.05 : 0.1;
```

### Regional Weight Optimization
```typescript
// Apply regional adjustments
const regionalWeights = await getRegionalWeights(region);
const adjustedWeights = applyRegionalFactors(weights, regionalWeights);
```

### Elasticity Thresholds
```typescript
// Dynamic elasticity thresholds
const elasticityThreshold = marketConditions === 'volatile' ? 0.6 : 0.8;
```

## 📊 Expected Performance

### Accuracy Improvements
- **Month 1**: +5-10% accuracy gains
- **Month 3**: +15-20% accuracy gains  
- **Month 6**: +25-30% accuracy gains
- **Steady State**: Continuous 2-5% monthly improvements

### System Performance
- **API Response Time**: < 200ms for real-time endpoints
- **Model Training Time**: < 30 seconds for reinforcement learning
- **Forecast Generation**: < 10 seconds for 4-week predictions
- **Anomaly Detection**: < 5 seconds for fraud analysis

## 🚨 Troubleshooting

### Common Issues

1. **Model Weights Not Updating**
   - Check Supabase RLS policies
   - Verify service role permissions
   - Review cron job logs in Vercel

2. **Poor Forecast Accuracy**
   - Increase historical data window
   - Adjust Kalman filter parameters
   - Review feature engineering

3. **High FraudGuard Alerts**
   - Check data quality
   - Adjust anomaly thresholds
   - Review review velocity patterns

### Debug Commands
```bash
# Check model weights
curl $VERCEL_URL/api/kpis/latest?dealerId=test

# Test reinforcement learning
curl -X POST $VERCEL_URL/api/train/reinforce \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test", "learningRate": 0.1}'

# Run anomaly detection
curl -X POST $VERCEL_URL/api/anomaly/reviews \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test", "threshold": 4}'
```

## ✅ Success Metrics

### Technical KPIs
- **Model Accuracy**: > 85% R² coefficient
- **Prediction Error**: < 3.0 RMSE
- **Data Trust**: > 95% FraudGuard score
- **System Uptime**: > 99.9% availability

### Business KPIs
- **Revenue Attribution**: > 80% correlation with AIV
- **Forecast Accuracy**: > 75% for 4-week predictions
- **Anomaly Detection**: > 90% fraud detection rate
- **User Engagement**: > 25% increase in dashboard usage

## 🎉 End State

Your DealershipAI dashboard now features:

✅ **Self-Improving Model**: Continuously learns from production data  
✅ **Real-Time Analytics**: Live AIV metrics with confidence intervals  
✅ **Predictive Insights**: 4-week forecasts with trend classification  
✅ **Fraud Protection**: Automated anomaly detection and data trust scoring  
✅ **Performance Monitoring**: Comprehensive model health tracking  
✅ **Automated Deployment**: Serverless architecture with cron automation  

The AIV system is now a **true self-optimizing Algorithmic Visibility Index** that gets smarter with every data point, providing increasingly accurate insights for automotive retail success.

**Welcome to the future of autonomous AI analytics! 🚀**
