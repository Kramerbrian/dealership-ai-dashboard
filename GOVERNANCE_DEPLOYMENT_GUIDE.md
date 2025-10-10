# 🚀 Governance System Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the governance thresholds implementation to production.

## Prerequisites
- ✅ Supabase project with service role key
- ✅ Vercel deployment configured
- ✅ Environment variables set
- ✅ Governance system tested locally

## Deployment Steps

### 1. Database Schema Deployment

#### Option A: Using Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Deploy governance schema
supabase db push --db-url $NEXT_PUBLIC_SUPABASE_URL --schema-file database/governance-schema.sql
```

#### Option B: Manual Deployment via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database/governance-schema.sql`
4. Paste and execute the SQL
5. Verify tables are created:
   - `governance_rules`
   - `model_weights`
   - `governance_actions`
   - `governance_violations`

### 2. Environment Variables Setup

Ensure these environment variables are set in Vercel:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration (for SHAP explanations)
OPENAI_API_KEY=your_openai_api_key

# Application URL
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod --yes
```

#### Option B: Git-based Deployment
1. Commit all governance changes:
   ```bash
   git add .
   git commit -m "Deploy governance system with thresholds and monitoring"
   git push origin main
   ```

2. Vercel will automatically deploy from the main branch

### 4. Verify Deployment

#### Test Governance API Endpoints
```bash
# Test POST endpoint
curl -X POST https://dash.dealershipai.com/api/governance/check \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "test_dealer",
    "metrics": {
      "r2": 0.65,
      "rmse": 4.2,
      "accuracy_gain_percent": -8
    }
  }'

# Test GET endpoint
curl https://dash.dealershipai.com/api/governance/check?dealerId=test_dealer
```

#### Test Model Health Dashboard
1. Navigate to `https://dash.dealershipai.com`
2. Check that Model Health Tiles are visible
3. Verify governance status indicators
4. Test violation alerts and notifications

### 5. Production Configuration

#### Governance Rules Configuration
The system comes with 8 default governance rules:

**Critical Rules (Auto-Freeze):**
- R² < 0.7 → Freeze model
- RMSE > 3.5 → Freeze model

**High Priority Rules (Manual Review):**
- R² < 0.8 → Flag for review
- RMSE > 3.0 → Flag for review
- ΔAccuracy < -5% → Flag for review

**Medium Priority Rules (Alerts):**
- ROI < 10% → Send alert
- Ad efficiency < 15% → Send alert
- AIV-GEO correlation < 0.8 → Send alert

**Auto-Retrain Rules:**
- Mean latency > 7 days → Trigger retrain

#### Customizing Governance Rules
To modify governance rules, update the `governance_rules` table in Supabase:

```sql
-- Example: Update R² critical threshold
UPDATE governance_rules 
SET threshold_value = 0.75 
WHERE rule_name = 'R² Threshold Critical';

-- Example: Add new rule
INSERT INTO governance_rules (rule_name, rule_type, metric_name, operator, threshold_value, action_type, action_message) 
VALUES ('Custom Rule', 'threshold', 'mape', '>', 0.15, 'alert', 'MAPE above acceptable threshold');
```

### 6. Monitoring and Maintenance

#### Dashboard Monitoring
- **Model Health Tiles**: Monitor R², RMSE, ROI efficiency
- **Governance Status**: Check for frozen models or violations
- **Action Logs**: Review governance actions and violations

#### Alert Configuration
Set up alerts for:
- Model freeze events
- Governance violations
- System errors
- Performance degradation

#### Regular Maintenance
- **Weekly**: Review governance violations and actions
- **Monthly**: Analyze governance rule effectiveness
- **Quarterly**: Update governance thresholds based on performance

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test database connection
node scripts/test-db-connection.js
```

#### 2. API Endpoint Errors
```bash
# Check API endpoint logs
vercel logs --follow

# Test API endpoints locally
npm run dev
curl http://localhost:3000/api/governance/check
```

#### 3. Governance Rules Not Working
```sql
-- Check if rules are active
SELECT * FROM governance_rules WHERE is_active = true;

-- Check recent violations
SELECT * FROM governance_violations ORDER BY detected_at DESC LIMIT 10;
```

### Support and Documentation

- **Governance Engine**: `src/lib/governance-engine.ts`
- **API Endpoints**: `app/api/governance/check/route.ts`
- **Database Schema**: `database/governance-schema.sql`
- **Test Scripts**: `scripts/test-day3-governance-thresholds.js`

## Success Criteria

✅ **Deployment Complete When:**
- All governance tables created in Supabase
- API endpoints responding correctly
- Model Health Tiles visible in dashboard
- Governance rules active and monitoring
- Test scenarios passing
- No critical errors in logs

## Next Steps

After successful deployment:

1. **Monitor Initial Performance**: Watch for governance violations
2. **Fine-tune Thresholds**: Adjust rules based on real data
3. **Set Up Alerts**: Configure notifications for critical events
4. **Train Team**: Ensure team understands governance system
5. **Document Procedures**: Create runbooks for common scenarios

---

🎉 **Congratulations!** Your governance system is now protecting your AI models in production!
