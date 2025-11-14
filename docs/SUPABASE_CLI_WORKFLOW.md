# Supabase CLI Workflow Guide

**Complete guide for using Supabase CLI with Pulse Dashboard**

## 🎯 Quick Start

### 1. Link to Your Project

```bash
# Get your project ref from: https://supabase.com/dashboard
supabase link --project-ref [YOUR_PROJECT_REF]
```

**Or use the helper script:**
```bash
./scripts/supabase-link-and-setup.sh
```

### 2. Check Current Status

```bash
# Check connection
supabase status

# Check Pulse setup
./scripts/setup-supabase-pulse.sh
```

### 3. Apply Migrations

```bash
# Push all migrations
supabase db push

# Or apply specific migration
supabase db execute -f supabase/migrations/20251112_pulse_decision_inbox.sql
```

## 📋 Common Commands

### Project Management

```bash
# Link to project
supabase link --project-ref [PROJECT_REF]

# Check status
supabase status

# List projects
supabase projects list
```

### Database Operations

```bash
# Push all migrations
supabase db push

# Reset local database (applies all migrations)
supabase db reset

# Execute SQL file
supabase db execute -f [FILE.sql]

# Check diff (what would change)
supabase db diff

# Generate migration from schema changes
supabase db diff -f [migration_name]
```

### Local Development

```bash
# Start local Supabase (requires Docker)
supabase start

# Stop local instance
supabase stop

# View logs
supabase logs
```

## 🔧 Pulse Dashboard Setup

### Step 1: Verify Migrations Exist

```bash
ls -la supabase/migrations/*pulse*.sql
```

**Required migrations:**
- `20251105110958_telemetry_and_pulse_schema.sql`
- `20251112_pulse_decision_inbox.sql`

### Step 2: Apply Migrations

**Option A: Push All (Recommended)**
```bash
supabase db push
```

**Option B: Apply Specific Migration**
```bash
supabase db execute -f supabase/migrations/20251112_pulse_decision_inbox.sql
```

**Option C: Use Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/[PROJECT_REF]/sql/new
2. Copy/paste migration SQL
3. Run

### Step 3: Verify Tables

```bash
# Check tables exist
supabase db execute "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name LIKE 'pulse%';
"
```

### Step 4: Verify Functions

```bash
# Check functions exist
supabase db execute "
  SELECT routine_name 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
    AND routine_name IN ('get_pulse_inbox', 'ingest_pulse_card');
"
```

## 🚀 Production Deployment

### Method 1: Supabase CLI (Recommended)

```bash
# Link to production project
supabase link --project-ref [PROJECT_REF]

# Push migrations
supabase db push

# Verify
supabase db execute "SELECT COUNT(*) FROM pulse_cards;"
```

### Method 2: Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard/project/[PROJECT_REF]/sql/new
2. **Copy migration SQL** from file
3. **Paste and run**
4. **Verify** in Table Editor

### Method 3: Direct psql

```bash
# If you have DATABASE_URL
psql $DATABASE_URL -f supabase/migrations/20251112_pulse_decision_inbox.sql
```

## 🔍 Verification Checklist

- [ ] Project linked: `supabase status` shows connection
- [ ] Migrations applied: Tables exist
- [ ] Functions exist: `get_pulse_inbox` available
- [ ] RLS policies: Tables have security policies
- [ ] API works: `/api/pulse/snapshot` returns data

## 🐛 Troubleshooting

### Issue: "Not linked to a project"

**Solution:**
```bash
supabase link --project-ref [YOUR_PROJECT_REF]
```

### Issue: "Cannot connect to Docker"

**Solution:**
- Start Docker Desktop
- Or use remote connection: `supabase link`

### Issue: "Migration already applied"

**Solution:**
- This is normal if migration was already run
- Check tables exist: `supabase db execute "SELECT * FROM pulse_cards LIMIT 1;"`

### Issue: "RLS policy blocking access"

**Solution:**
- Verify policies exist: `\d+ pulse_cards` in psql
- Check JWT claims are set correctly
- Test with service role key if needed

## 📚 Related Documentation

- **Pulse Setup:** `docs/SUPABASE_PULSE_SETUP.md`
- **Dashboard Activation:** `docs/PULSE_DASHBOARD_ACTIVATION.md`
- **Migration Guide:** `SUPABASE_MIGRATION_GUIDE.md`

## 🔗 Resources

- **Supabase CLI Docs:** https://supabase.com/docs/reference/cli
- **Database Migrations:** https://supabase.com/docs/guides/cli/local-development#database-migrations
- **Project Linking:** https://supabase.com/docs/guides/cli/managing-environments

---

**Last Updated:** 2025-01-20

