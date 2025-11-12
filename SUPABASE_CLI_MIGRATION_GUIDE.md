# Supabase CLI Migration Guide

## Status

✅ **Migration File Created**: `supabase/migrations/20250112000001_onboarding_adaptive_ux.sql`

## Connection Issue

The Supabase CLI is experiencing connection issues:
- Error: `connection refused` or `SSL connection is required`
- This may be due to:
  - Network/firewall restrictions
  - Database paused or unavailable
  - Missing SSL configuration
  - Database password required

## Solutions

### Option 1: Fix CLI Connection (Recommended for CLI)

1. **Check Database Status**
   ```bash
   # Visit Supabase Dashboard to ensure database is active
   # https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/database
   ```

2. **Set Database Password** (if not set)
   - Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/database
   - Reset database password if needed
   - Use password when CLI prompts

3. **Repair Migration History** (if needed)
   ```bash
   supabase migration repair --status reverted 20251102080912 20251108045446 20251108072405 20251109171736 20251109234505 20251110014241 20251110015226 20251110022558 20251110024219 20251110024312 20251110024322 20251110032437 20251110033408 20251110033441 20251110033505 20251110033548 20251110034110 20251110034301 20251110034610 20251110040340 20251111185903 20251112024343 20251112034901
   ```

4. **Push Migration**
   ```bash
   supabase db push --include-all
   ```

### Option 2: Use Supabase Dashboard SQL Editor (Fastest)

1. **Visit SQL Editor**
   - https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new

2. **Copy Migration SQL**
   ```bash
   cat supabase/migrations/20250112000001_onboarding_adaptive_ux.sql
   ```

3. **Paste and Run**
   - Paste SQL into SQL Editor
   - Click "Run" or press Cmd+Enter

4. **Verify Tables Created**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('onboarding_step_durations', 'onboarding_step_metrics');
   ```

## Migration Contents

The migration creates:

1. **`onboarding_step_durations`** - Tracks time-to-complete for each onboarding step
   - Columns: `user_id`, `session_id`, `step_name`, `step_number`, `duration_ms`, `completed`, `skipped`
   - Indexes: user, session, step_name

2. **`onboarding_step_metrics`** - Aggregated metrics for dashboard queries
   - Columns: `step_name`, `total_users`, `completed_count`, `skipped_count`, `avg_duration_ms`, `median_duration_ms`, `p95_duration_ms`
   - Updated via `update_onboarding_metrics()` function

3. **`update_onboarding_metrics()`** - Function to compute aggregated metrics
   - Can be called by cron job
   - Updates metrics from last 30 days of data

## Verification

After migration, verify with:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'onboarding%';

-- Check function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_onboarding_metrics';

-- Test function
SELECT public.update_onboarding_metrics();
```

## Next Steps

1. Apply migration (via CLI or Dashboard)
2. Set up cron job to call `update_onboarding_metrics()` (optional)
3. Update application code to track step durations
4. Build dashboard to display adaptive UX metrics

