# Supabase Migration Status

## ⚠️ Connection Issue

The Supabase CLI is experiencing connection timeouts:
```
failed to connect to postgres: failed to receive message (timeout: context deadline exceeded)
```

## ✅ Migration File Ready

The migration is prepared and ready:
- **File**: `supabase/migrations/20250112000001_onboarding_adaptive_ux.sql`
- **Creates**: 
  - `onboarding_step_durations` table
  - `onboarding_step_metrics` table
  - `update_onboarding_metrics()` function

## 📋 Options to Apply Migration

### Option 1: Retry Supabase CLI

```bash
export PGPASSWORD='Autonation2077$'
supabase db push --include-all
```

**If timeout persists:**
- Check network connection
- Verify database is active in Supabase Dashboard
- Try using direct connection string instead of pooler

### Option 2: Use Supabase Dashboard (Recommended)

1. **Visit SQL Editor**
   - https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new

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

### Option 3: Proceed with Vercel Setup

The migration can be applied later. You can:
1. Complete Vercel environment variables setup
2. Apply Supabase migration when connection is stable
3. Both are independent operations

## 🔍 Troubleshooting Connection

### Check Database Status
- Visit: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/settings/database
- Ensure database is active (not paused)

### Test Connection
```bash
# Test direct connection
psql "postgresql://postgres.vxrdvkhkombwlhjvtsmw:Autonation2077$@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Use Direct Connection (Not Pooler)
If pooler is timing out, try direct connection:
```bash
# Update DATABASE_URL in .env.local to use direct port 5432 instead of 6543
# Then retry migration
```

## ✅ Next Steps

1. **Apply Migration** (choose one option above)
2. **Run Vercel Setup**: `./scripts/vercel-setup-interactive.sh`
3. **Verify**: Check tables exist in Supabase

## 📄 Related Files

- `supabase/migrations/20250112000001_onboarding_adaptive_ux.sql` - Migration file
- `scripts/supabase-push.sh` - Helper script
- `ENV_SETUP_COMPLETE.md` - Environment setup guide

