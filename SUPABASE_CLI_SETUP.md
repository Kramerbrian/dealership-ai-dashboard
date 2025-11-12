# 🔗 Supabase CLI Setup & Migration Guide

## Step 1: Install Supabase CLI (if not installed)

### macOS
```bash
brew install supabase/tap/supabase
```

### npm
```bash
npm install -g supabase
```

### Other platforms
See: https://supabase.com/docs/guides/cli

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

## Step 3: Find Your Project Reference

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **General**
3. Find **Reference ID** (looks like: `abcdefghijklmnop`)
4. Copy this value

## Step 4: Link Your Project

```bash
# Replace YOUR_PROJECT_REF with your actual reference ID
supabase link --project-ref YOUR_PROJECT_REF
```

Example:
```bash
supabase link --project-ref abcdefghijklmnop
```

## Step 5: Push Migration

```bash
supabase db push
```

This will:
- Create the `telemetry_events` table
- Add all indexes
- Enable RLS
- Create security policies

## Alternative: Manual SQL Execution

If you prefer not to use CLI:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the SQL from `supabase/migrations/20250111000001_create_telemetry_events.sql`
3. Paste and click **Run**

## Verify Migration

After pushing, verify the table exists:

```bash
# Using Supabase CLI
supabase db remote list

# Or check in Dashboard → Table Editor
```

## Troubleshooting

### "command not found: supabase"
- Install Supabase CLI (see Step 1)

### "Error: project not found"
- Verify your project reference ID is correct
- Make sure you're logged in: `supabase login`

### "Error: permission denied"
- Make sure you're the project owner or have admin access
- Try logging in again: `supabase login`

### "Error: migration already exists"
- The table might already exist
- Check Supabase Dashboard → Table Editor
- If table exists, you can skip the migration
