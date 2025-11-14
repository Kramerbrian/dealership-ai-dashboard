# Deploy Supabase Schema via CLI

## Recommended Method: Supabase Dashboard

The Supabase CLI requires local Docker setup. For quickest deployment, use the dashboard:

### Step 1: Open SQL Editor
Go to: https://app.supabase.com/project/gzlgfghpkbqlhgfozjkb/sql

### Step 2: Copy Schema
```bash
cat supabase/schema.sql
```

### Step 3: Paste and Run
- Paste entire contents into SQL editor
- Click "Run" or press Cmd/Ctrl + Enter
- ✅ Done!

---

## Alternative: Supabase CLI (If Docker is Running)

If you have Docker running and want to use CLI:

```bash
# 1. Ensure project is linked
supabase link --project-ref gzlgfghpkbqlhgfozjkb

# 2. Create migration from schema
supabase migration new orchestrator_telemetry_365day_retention

# 3. Copy schema.sql content to the new migration file
cp supabase/schema.sql supabase/migrations/[timestamp]_orchestrator_telemetry_365day_retention.sql

# 4. Push to remote
supabase db push
```

**Note:** This requires Docker to be running for local Supabase instance.

---

## Verification

After deployment, verify tables exist:

```sql
-- Run in Supabase SQL editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%dealer%' OR table_name LIKE '%copilot%' OR table_name LIKE '%orchestrator%')
ORDER BY table_name;
```

Expected tables:
- `dealer_master`
- `dealer_metrics_daily`
- `aggregate_metrics_daily`
- `copilot_events`
- `correlation_results`
- `mood_report`
- `orchestrator_log`

---

## Quick Command Reference

```bash
# View schema
cat supabase/schema.sql

# Check if linked
supabase projects list

# Link to project
supabase link --project-ref gzlgfghpkbqlhgfozjkb

# Push migrations (if using CLI method)
supabase db push
```

