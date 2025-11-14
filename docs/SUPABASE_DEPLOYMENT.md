# Supabase Schema Deployment Guide

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open SQL Editor**
   - Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/sql
   - Or: Project → SQL Editor → New Query

2. **Copy Schema**
   ```bash
   cat supabase/schema.sql
   ```

3. **Paste and Execute**
   - Paste entire contents of `supabase/schema.sql`
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Tables**
   - Go to: Table Editor
   - Confirm these tables exist:
     - `dealer_master`
     - `dealer_metrics_daily`
     - `aggregate_metrics_daily`
     - `copilot_events`
     - `correlation_results`
     - `mood_report`
     - `orchestrator_log`

---

### Option 2: Using Supabase CLI

**Prerequisites:**
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Deploy:**
```bash
# Apply schema
supabase db push

# Or use the deployment script
./scripts/deploy-supabase-schema.sh
```

---

### Option 3: Using psql (Direct Connection)

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection String → URI

psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < supabase/schema.sql
```

---

## Verification Checklist

After deployment, verify:

- [ ] All 7 core tables created
- [ ] Indexes created (check with `\di` in psql)
- [ ] Views created (`dealer_summary`)
- [ ] Retention function exists (`purge_old_records`)
- [ ] RLS enabled on `dealer_metrics_daily`
- [ ] Timezone set to UTC

**Quick SQL Check:**
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%dealer%' OR table_name LIKE '%copilot%' OR table_name LIKE '%orchestrator%';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('dealer_metrics_daily', 'copilot_events', 'orchestrator_log');

-- Verify function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'purge_old_records';
```

---

## Post-Deployment

1. **Set up pg_cron (for retention policy)**
   - Supabase may require enabling pg_cron extension
   - Check: https://supabase.com/docs/guides/database/extensions/pg_cron
   - Or schedule retention manually via Vercel cron

2. **Create Service Role Key**
   - Settings → API → Service Role Key
   - Copy and add to Vercel env vars as `SUPABASE_SERVICE_ROLE_KEY`

3. **Test Connection**
   ```bash
   # Test from your app
   curl https://your-domain.vercel.app/api/orchestrator-background
   ```

---

## Troubleshooting

**Error: "relation already exists"**
- Tables may already exist from previous deployment
- Schema uses `CREATE TABLE IF NOT EXISTS` - safe to re-run

**Error: "permission denied"**
- Ensure you're using service role key, not anon key
- Check RLS policies if querying from client

**Error: "function does not exist"**
- Retention function may need to be created manually
- Check Supabase extensions (pg_cron may need enabling)

---

## Next Steps

After schema is deployed:
1. Set environment variables (see `docs/ENVIRONMENT_SETUP.md`)
2. Test orchestrator console at `/pulse/meta/orchestrator-console`
3. Verify cron job in Vercel dashboard

