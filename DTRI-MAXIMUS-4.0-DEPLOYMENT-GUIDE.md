# 🚀 DTRI-MAXIMUS 4.0 Deployment Guide

## Overview
This guide will help you deploy the complete DTRI-MAXIMUS 4.0 system to your Supabase database and integrate it with your frontend dashboard.

## Prerequisites
- Supabase project with admin access
- Next.js application running
- Node.js 18+ installed
- Access to your Supabase SQL editor

## Step 1: Apply Database Migrations

### Option A: Using Supabase SQL Editor (Recommended)
1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `DTRI-MAXIMUS-4.0-COMPLETE.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

### Option B: Using Supabase CLI (Alternative)
```bash
# If you have Supabase CLI working
supabase db push --file DTRI-MAXIMUS-4.0-COMPLETE.sql
```

## Step 2: Verify Database Schema

After applying the migration, verify these tables were created:

### Core Tables
- `qai_dashboard_configs` - QAI Dashboard configuration
- `qai_metrics_config` - QAI Metrics configuration
- `qai_alerts_config` - QAI Alerts configuration
- `qai_actions_config` - QAI Actions configuration
- `qai_dashboard_layouts` - QAI Dashboard layouts

### DTRI-MAXIMUS Tables
- `dtri_maximus_supermodal` - Main DTRI-MAXIMUS score display
- `dtri_micro_segmented_scores` - Micro-segmented DTRI scores
- `dtri_segmented_lead_flow` - Segmented lead flow quantification
- `dtri_beta_recalibration` - Beta coefficient recalibration
- `dtri_ml_beta_calibration` - ML-based beta calibration
- `dtri_autonomous_triggers` - Autonomous agent triggers
- `dtri_segment_tsm_calibration` - Segment-specific TSM calibration
- `dtri_time_series_models` - Time series forecasting models

## Step 3: Deploy API Endpoints

The following API endpoints are already created and ready to use:

### 1. DTRI-MAXIMUS Supermodal
```
GET /api/dtri-maximus/supermodal?tenantId={tenantId}&dealershipId={dealershipId}
```

### 2. Micro-Segmentation
```
GET /api/dtri-maximus/micro-segmentation?tenantId={tenantId}&dealershipId={dealershipId}
```

### 3. Feedback Loop
```
GET /api/dtri-maximus/feedback-loop?tenantId={tenantId}&dealershipId={dealershipId}&action=get_recalibration
POST /api/dtri-maximus/feedback-loop
```

### 4. Ultimate Enhancements
```
GET /api/dtri-maximus/ultimate?tenantId={tenantId}&dealershipId={dealershipId}&enhancement=all
```

## Step 4: Integrate Frontend Components

### 1. Install Required Dependencies
```bash
npm install lucide-react
```

### 2. Add the DTRI-MAXIMUS Supermodal Component
The component is already created at `src/components/DTriMaximusSupermodal.tsx`

### 3. Use in Your Dashboard
```tsx
import DTriMaximusSupermodal from '@/components/DTriMaximusSupermodal';

export default function Dashboard() {
  return (
    <div>
      <DTriMaximusSupermodal 
        tenantId="your-tenant-id" 
        dealershipId="your-dealership-id" 
      />
    </div>
  );
}
```

## Step 5: Test the System

### 1. Run the Test Script
```bash
node test-dtri-maximus.js
```

### 2. Manual Testing
1. Open your dashboard
2. Navigate to the DTRI-MAXIMUS section
3. Verify the supermodal displays correctly
4. Click "Click to Reveal: MAXIMUS Strategy Report"
5. Check all three tabs (Risk, Reward, Action)

## Step 6: Configure Sample Data

### 1. Update Tenant and Dealership IDs
Replace the sample UUIDs in the SQL file with your actual tenant and dealership IDs:

```sql
-- Replace these with your actual IDs
'00000000-0000-0000-0000-000000000000'::uuid  -- tenant_id
'11111111-1111-1111-1111-111111111111'::uuid  -- dealership_id
```

### 2. Customize Financial Data
Update the sample financial data to match your dealership's actual numbers:

```sql
-- Update these values in the sample data inserts
dtri_score: 85.2,
profit_opportunity_dollars: 90000,
decay_tax_risk_dollars: 18000,
avg_gp_per_unit: 3500,  -- Sales
avg_gp_per_unit: 450,   -- Service
```

## Step 7: Production Configuration

### 1. Environment Variables
Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. RLS Policies
The migration includes Row Level Security (RLS) policies. Ensure your application sets the tenant context:

```typescript
// In your API routes
await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
```

### 3. Performance Optimization
The migration includes 100+ performance indexes. Monitor query performance and adjust as needed.

## Step 8: Monitoring and Maintenance

### 1. Monitor API Performance
- Check response times for all endpoints
- Monitor database query performance
- Set up alerts for failed requests

### 2. Regular Maintenance
- Review and update beta coefficients monthly
- Retrain ML models quarterly
- Update TSM calibrations as market conditions change

### 3. Data Validation
- Verify DTRI scores are within expected ranges (0-100)
- Check that financial calculations are accurate
- Ensure RLS policies are working correctly

## Troubleshooting

### Common Issues

1. **Migration Errors**
   - Check for existing tables with same names
   - Verify all required extensions are enabled
   - Ensure proper permissions

2. **API Errors**
   - Verify tenant and dealership IDs are valid
   - Check RLS policies are correctly configured
   - Ensure sample data is inserted

3. **Frontend Issues**
   - Check component imports and dependencies
   - Verify API endpoints are accessible
   - Check browser console for errors

### Support
If you encounter issues:
1. Check the test report: `dtri-maximus-test-report.json`
2. Review the SQL migration logs
3. Verify all environment variables are set correctly

## Success Criteria

Your DTRI-MAXIMUS 4.0 system is successfully deployed when:

✅ All database tables are created  
✅ All API endpoints return valid data  
✅ Frontend component displays correctly  
✅ All tests pass  
✅ RLS security is working  
✅ Sample data is visible  

## Next Steps

After successful deployment:

1. **Customize the UI** - Adjust colors, layout, and styling to match your brand
2. **Add Real Data** - Replace sample data with actual dealership metrics
3. **Configure Alerts** - Set up automated alerts for threshold violations
4. **Train ML Models** - Feed historical data to improve predictions
5. **Monitor Performance** - Track system performance and optimize as needed

---

🎉 **Congratulations!** You now have the most advanced digital trust revenue index system ever built for automotive dealerships!
