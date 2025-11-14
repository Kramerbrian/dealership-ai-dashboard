# Supabase Migration Guide - Orchestrator Telemetry

## Quick Start

### Option 1: Using Supabase CLI (Recommended)

```bash
# Apply migration to local Supabase
./scripts/apply-telemetry-migration.sh --local

# Or apply to remote Supabase
./scripts/apply-telemetry-migration.sh --remote
```

### Option 2: Manual Application

```bash
# Local Supabase
supabase migration up

# Remote Supabase (with DATABASE_URL)
psql $DATABASE_URL -f supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql
```

## Migration Details

**File:** `supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql`

**Creates:**
- `orchestrator_executions` - Tracks orchestrator runs
- `orchestrator_job_executions` - Individual job results
- `orchestrator_health_metrics` - System health over time
- Automatic cleanup function (365-day retention)
- Helper views for monitoring

## Verification

### Check Tables Created

```sql
-- List new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'orchestrator%'
ORDER BY table_name;
```

### Verify Cleanup Function

```sql
-- Test cleanup function
SELECT cleanup_expired_telemetry();
```

### Check Views

```sql
-- Recent orchestrator executions
SELECT * FROM v_orchestrator_recent LIMIT 10;

-- Job success rates
SELECT * FROM v_job_success_rates;

-- Health trends
SELECT * FROM v_health_trends;
```

## Local Development Setup

### 1. Start Local Supabase

```bash
supabase start
```

This will:
- Start local PostgreSQL
- Start local Supabase API
- Create local project

### 2. Apply Migrations

```bash
# Apply all pending migrations
supabase migration up

# Or apply specific migration
supabase db push
```

### 3. Check Status

```bash
supabase status
```

Output shows:
- API URL
- DB URL
- Studio URL
- Anon key
- Service role key

## Production Deployment

### Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of migration file
3. Paste and run in SQL Editor
4. Verify tables created

### Using Supabase CLI

```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Using Direct Connection

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection string

psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql
```

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- Tables may already exist
- Check with: `\dt orchestrator*` in psql
- Drop and recreate if needed: `DROP TABLE IF EXISTS orchestrator_executions CASCADE;`

**Error: "permission denied"**
- Ensure you're using service role key
- Check RLS policies are correct
- Verify user has admin role

**Error: "pg_cron extension not available"**
- This is expected on some Supabase plans
- Cleanup function will still work manually
- Schedule cleanup via external cron if needed

### Verify Migration Applied

```sql
-- Check migration was applied
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version = '20250120000000_orchestrator_telemetry_365day_retention'
ORDER BY inserted_at DESC;
```

### Rollback (if needed)

```sql
-- Drop tables (careful - this deletes data!)
DROP TABLE IF EXISTS orchestrator_job_executions CASCADE;
DROP TABLE IF EXISTS orchestrator_executions CASCADE;
DROP TABLE IF EXISTS orchestrator_health_metrics CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS cleanup_expired_telemetry();

-- Drop views
DROP VIEW IF EXISTS v_orchestrator_recent;
DROP VIEW IF EXISTS v_job_success_rates;
DROP VIEW IF EXISTS v_health_trends;
```

## Next Steps After Migration

1. **Verify Tables Created**
   ```bash
   supabase db inspect
   ```

2. **Test Data Insertion**
   ```sql
   INSERT INTO orchestrator_executions (success, jobs_executed, governance_passed)
   VALUES (true, 5, true);
   ```

3. **Check Views**
   ```sql
   SELECT * FROM v_orchestrator_recent;
   ```

4. **Start Dev Server**
   ```bash
   npm run dev
   ```

5. **Test Endpoints**
   ```bash
   ./scripts/test-endpoints.sh
   ```

## Automated Cleanup

The migration includes automatic cleanup via `pg_cron` (if available):

- **Schedule:** Daily at 2 AM UTC
- **Function:** `cleanup_expired_telemetry()`
- **Retention:** 365 days

If `pg_cron` is not available, run cleanup manually:

```sql
-- Manual cleanup
SELECT cleanup_expired_telemetry();
```

Or schedule via external cron:

```bash
# Add to crontab
0 2 * * * psql $DATABASE_URL -c "SELECT cleanup_expired_telemetry();"
```

## Security Notes

- RLS (Row Level Security) is enabled
- Only admin/superadmin roles can read
- System can insert (for cron jobs)
- Adjust policies in migration if needed

## Support

For issues:
1. Check Supabase logs: Dashboard → Logs
2. Verify migration file syntax
3. Check database permissions
4. Review RLS policies

