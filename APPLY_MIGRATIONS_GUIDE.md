# Database Migrations - Manual Application Guide

Since direct psql connection requires credentials not in local env, use the **Supabase Dashboard SQL Editor** to apply migrations.

## Quick Access
🔗 **Supabase SQL Editor**: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new

## Migration Application Order

Apply these files in order via the SQL Editor (copy/paste contents):

### 1. Core Monitoring Tables ✅ PRIORITY
These are required for the cron jobs to function.

**File**: `supabase/migrations/20250109_add_cron_monitoring_tables.sql`
- Creates: `cron_job_health`, `cron_job_executions`, `review_anomalies`, `forecasts`
- Purpose: Track cron job execution and health metrics
- Size: ~6.5KB

**File**: `supabase/migrations/20250109_add_system_alerts_table.sql`
- Creates: `system_alerts` table and alert management functions
- Purpose: Store and manage system alerts from monitoring
- Size: ~3.2KB

### 2. Security Framework 🔒 HIGH PRIORITY
The security schema you selected - comprehensive security system.

**File**: `database/security-schema.sql`
- Creates: Security events, access controls, audit log, API keys, security alerts, model access log
- Includes: RLS policies, triggers, functions for security operations
- Purpose: Complete security, access control, and audit trail system
- Size: ~15.5KB

### 3. Model & Governance 📊 MEDIUM PRIORITY

**File**: `database/model-audit-schema.sql`
- Creates: `model_audit`, `model_weights`, performance tracking tables
- Purpose: Track model performance metrics (R², RMSE, accuracy)
- Enables: The control rule query (`select * from model_audit where r2 < 0.7 or rmse > 3.5`)
- Size: ~8.6KB

**File**: `database/governance-schema.sql`
- Creates: `governance_rules`, `model_freeze_log`, compliance tracking
- Purpose: Model governance and change management
- Size: ~7.3KB

### 4. Optional Enhancements (As Needed)

**File**: `database/aiv-training-schema.sql`
- Creates: Training data, reinforcement learning tables
- Purpose: Support autonomous model improvement

**File**: `database/aoer-schema.sql`
- Creates: `aoer_queue`, `aoer_runs` tables
- Purpose: Asynchronous recomputation queue

## Application Steps

1. **Open SQL Editor**
   - Navigate to: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new

2. **Apply Each Migration**
   ```bash
   # Open the file locally
   cat supabase/migrations/20250109_add_cron_monitoring_tables.sql

   # Copy entire contents
   # Paste into Supabase SQL Editor
   # Click "Run" button
   ```

3. **Verify Success**
   After each migration, verify tables were created:
   ```sql
   -- Check tables exist
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN (
     'cron_job_health',
     'cron_job_executions',
     'system_alerts',
     'security_events',
     'model_audit'
   );
   ```

4. **Check for Errors**
   - If you see "already exists" errors, that's OK - skip that file
   - If you see permission errors, you may need to use a different connection method

## Verification Queries

After applying migrations, run these to verify:

```sql
-- 1. Check cron monitoring tables
SELECT COUNT(*) as cron_tables FROM information_schema.tables
WHERE table_name IN ('cron_job_health', 'cron_job_executions');
-- Expected: 2

-- 2. Check security tables
SELECT COUNT(*) as security_tables FROM information_schema.tables
WHERE table_name IN ('security_events', 'access_controls', 'security_rules', 'audit_log');
-- Expected: 4

-- 3. Check model audit
SELECT COUNT(*) as model_tables FROM information_schema.tables
WHERE table_name IN ('model_audit', 'model_weights');
-- Expected: 2

-- 4. Test the control rule query
SELECT COUNT(*) as failing_models
FROM model_audit
WHERE r2 < 0.7 OR rmse > 3.5;
-- Expected: 0 (if no data yet)
```

## Alternative: Supabase CLI (If Linked)

If you have Supabase CLI linked to the project:

```bash
# Link project (first time only)
supabase link --project-ref gzlgfghpkbqlhgfozjkb

# Push all migrations
supabase db push

# Or apply specific migration
supabase db execute --file supabase/migrations/20250109_add_cron_monitoring_tables.sql
```

## Next Steps After Migration

Once migrations are applied:

1. ✅ **Verify cron jobs are active** in Vercel Dashboard
   - Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/crons
   - Should see 6 active cron jobs

2. ✅ **Test monitoring endpoints**
   ```bash
   # Executive summary
   curl https://your-domain.vercel.app/api/monitoring/system-health?query=executive-summary

   # Control rules (your specific query)
   curl https://your-domain.vercel.app/api/monitoring/system-health?query=control-rules

   # Cron health
   curl https://your-domain.vercel.app/api/cron/health
   ```

3. ✅ **Monitor first cron execution**
   - Wait for next scheduled run (or trigger manually via Vercel)
   - Check `cron_job_executions` table for logs
   ```sql
   SELECT * FROM cron_job_executions
   ORDER BY executed_at DESC
   LIMIT 10;
   ```

## Troubleshooting

**Issue**: "relation already exists" errors
- **Solution**: Skip that migration, table already created

**Issue**: "permission denied" errors
- **Solution**: Use Supabase dashboard SQL editor instead of psql
- **Alternative**: Use service role key in connection string

**Issue**: Cannot access SQL editor
- **Solution**: Ensure you're logged into Supabase with the correct account
- **Check**: Project ID is correct (gzlgfghpkbqlhgfozjkb)

## Migration Files Location

All migration files are in these directories:
```
supabase/migrations/          # Timestamped migrations
database/                     # Schema definitions
```

Ready to apply! Start with the core monitoring tables (step 1).
