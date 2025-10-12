# 🚀 One-Command AEMD Deployment

## Quick Deploy (Recommended)

Run this single command to deploy the complete AEMD & Accuracy Monitoring system:

```bash
./scripts/deploy-aemd-monitoring.sh
```

The script will:
1. ✅ Check prerequisites (PostgreSQL, Node.js)
2. ✅ Prompt for Supabase credentials
3. ✅ Test database connection
4. ✅ Apply database migration
5. ✅ Verify table creation
6. ✅ Update environment variables
7. ✅ Run test suite (optional)
8. ✅ Show next steps

**Time:** ~5 minutes

---

## Manual Deployment

If you prefer to run commands manually:

### 1. Get Your Supabase Credentials

Go to: https://supabase.com/dashboard → Your Project → Settings → API

You need:
- **Project URL**: `https://xxx.supabase.co`
- **Service Role Key**: `eyJhbGc...`
- **Database Password**: The password you set when creating the project

### 2. Apply Database Migration

```bash
# Set credentials
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export PGPASSWORD="your-database-password"

# Extract project ID and set DB host
PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
DB_HOST="db.${PROJECT_ID}.supabase.co"

# Apply migration
psql -h "$DB_HOST" -p 5432 -U postgres -d postgres \
  -f supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql
```

### 3. Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Test Endpoints

```bash
# Start dev server
npm run dev

# In another terminal, run tests
./scripts/test-aemd-accuracy.sh
```

### 5. Integrate Dashboard

```tsx
import { AEMDMonitoringDashboard } from '@/components/dashboard/AEMDMonitoringDashboard';

export default function MonitoringPage() {
  return (
    <AEMDMonitoringDashboard
      tenantId="your-tenant-id"
    />
  );
}
```

---

## What Gets Deployed

### Database Tables (4)
- ✅ `aemd_metrics` - AEMD calculations and scores
- ✅ `accuracy_monitoring` - AI accuracy metrics
- ✅ `accuracy_thresholds` - Alert configuration
- ✅ `accuracy_alerts` - Alert history

### API Endpoints (5)
- ✅ `POST /api/aemd-metrics` - Calculate AEMD
- ✅ `GET /api/aemd-metrics` - Get AEMD data
- ✅ `POST /api/accuracy-monitoring` - Record accuracy
- ✅ `GET /api/accuracy-monitoring` - Get accuracy data
- ✅ `PATCH /api/accuracy-monitoring` - Manage alerts

### Dashboard Components
- ✅ AEMD Score Tile
- ✅ Heatmap Module (ωDS segments)
- ✅ FastSearch Clarity Gauges (SCS/SIS/SCR)
- ✅ Trust & Accuracy Monitoring
- ✅ Active Alerts Banner
- ✅ ASR Execution Interface

### Features
- ✅ Automatic alert triggering
- ✅ Multi-channel notifications (Email, Slack, Webhooks)
- ✅ Governance & validation
- ✅ Row Level Security (RLS)
- ✅ Confidence level auto-calculation
- ✅ Alert cooldown (60 min default)

---

## Verification

After deployment, verify everything works:

```bash
# 1. Check tables exist
psql -h "$DB_HOST" -U postgres -d postgres -c "\dt"

# 2. Check default thresholds
psql -h "$DB_HOST" -U postgres -d postgres \
  -c "SELECT * FROM accuracy_thresholds LIMIT 5;"

# 3. Test AEMD endpoint
curl -X POST http://localhost:3000/api/aemd-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test",
    "report_date": "2025-01-11",
    "ctr_p3": 0.05, "ctr_fs": 0.04,
    "total_vdp_views": 15000, "vdp_views_ai": 8500,
    "total_assisted_conversions": 245,
    "assisted_conversions_paa": 178
  }'

# 4. Test accuracy endpoint
curl -X POST http://localhost:3000/api/accuracy-monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test",
    "issue_detection_accuracy": 0.88,
    "ranking_correlation": 0.72,
    "consensus_reliability": 0.92,
    "variance": 4.3
  }'
```

---

## Troubleshooting

### "psql: command not found"
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows (use WSL or download from postgresql.org)
```

### "Connection refused"
- Check your database password is correct
- Verify your Supabase project is active
- Check firewall/network settings

### "Permission denied"
- Make scripts executable: `chmod +x scripts/*.sh`
- Check you have write access to `.env.local`

### "Migration already applied"
If tables already exist, you can:
1. Skip migration (tables are already there)
2. Drop tables and reapply: **⚠️ WARNING: This deletes data**
   ```sql
   DROP TABLE IF EXISTS accuracy_alerts CASCADE;
   DROP TABLE IF EXISTS accuracy_thresholds CASCADE;
   DROP TABLE IF EXISTS accuracy_monitoring CASCADE;
   DROP TABLE IF EXISTS aemd_metrics CASCADE;
   ```

---

## Next Steps

After successful deployment:

1. **Configure Alerts**
   - Set up email notifications (add `RESEND_API_KEY` to `.env.local`)
   - Configure Slack webhooks in `accuracy_thresholds` table
   - Adjust thresholds per tenant

2. **Integrate Dashboard**
   - Add `AEMDMonitoringDashboard` to your app
   - Create route at `/monitoring` or `/dashboard/monitoring`
   - Link from main navigation

3. **Start Collecting Data**
   - POST AEMD metrics daily/weekly
   - POST accuracy metrics after model evaluations
   - Monitor alerts dashboard

4. **Team Training**
   - Share documentation links
   - Demo the dashboard
   - Explain alert acknowledgment process

---

## Documentation

📖 **Complete Guide**: [AEMD_ACCURACY_MONITORING_GUIDE.md](AEMD_ACCURACY_MONITORING_GUIDE.md)
📋 **Quick Reference**: [AEMD_QUICK_REFERENCE.md](AEMD_QUICK_REFERENCE.md)
📊 **Implementation Summary**: [AEMD_IMPLEMENTATION_SUMMARY.md](AEMD_IMPLEMENTATION_SUMMARY.md)

---

## Support

Need help?
1. Check troubleshooting section above
2. Review full documentation
3. Check GitHub issues
4. Run test suite for diagnostics: `./scripts/test-aemd-accuracy.sh`

---

**Deployment Date**: January 11, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
