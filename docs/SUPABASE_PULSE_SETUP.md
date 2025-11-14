# Supabase Pulse Dashboard Setup Guide

**Using Supabase CLI to set up Pulse Dashboard database**

## 🎯 Overview

The Pulse Dashboard requires these database tables:
- `pulse_cards` - Main Pulse card storage
- `pulse_threads` - Thread conversations
- `pulse_digest` - Digest summaries
- `pulse_mutes` - Mute rules
- `pulse_incidents` - Auto-promoted incidents

And these functions:
- `get_pulse_inbox()` - Fetch filtered Pulse cards
- `ingest_pulse_card()` - Insert with deduplication

## 🚀 Quick Setup

### Option 1: Using Setup Script

```bash
# Check current status
./scripts/setup-supabase-pulse.sh

# Apply migrations
./scripts/apply-pulse-migrations-supabase.sh
```

### Option 2: Manual Setup

#### Local Development

```bash
# Start local Supabase
supabase start

# Apply all migrations
supabase db reset

# Or apply specific migration
supabase db execute -f supabase/migrations/20251112_pulse_decision_inbox.sql
```

#### Remote/Production

```bash
# Link to project
supabase link --project-ref [YOUR_PROJECT_REF]

# Push migrations
supabase db push

# Or apply directly via psql
psql $DATABASE_URL -f supabase/migrations/20251112_pulse_decision_inbox.sql
```

## 📋 Required Migrations

### 1. Telemetry & Pulse Schema
**File:** `supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql`

Creates:
- `telemetry_events` table
- `pulse_events` table

### 2. Pulse Decision Inbox
**File:** `supabase/migrations/20251112_pulse_decision_inbox.sql`

Creates:
- `pulse_cards` table
- `pulse_threads` table
- `pulse_mutes` table
- `pulse_incidents` table
- `get_pulse_inbox()` function
- `ingest_pulse_card()` function
- Views and triggers

## ✅ Verification

### Check Tables Exist

```bash
# Local
supabase db execute "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name LIKE 'pulse%';
"

# Remote
psql $DATABASE_URL -c "\dt pulse*"
```

### Check Functions Exist

```bash
# Local
supabase db execute "
  SELECT routine_name 
  FROM information_schema.routines 
  WHERE routine_name IN ('get_pulse_inbox', 'ingest_pulse_card');
"

# Remote
psql $DATABASE_URL -c "\df get_pulse_inbox"
```

### Test API

```bash
# Test snapshot endpoint
curl http://localhost:3000/api/pulse/snapshot?tenant=demo-tenant

# Test main inbox (requires auth)
curl http://localhost:3000/api/pulse?dealerId=demo-tenant
```

## 🔧 Troubleshooting

### Issue: Tables Don't Exist

**Solution:**
```bash
# Apply migrations
./scripts/apply-pulse-migrations-supabase.sh

# Or manually
supabase db reset  # Local
supabase db push   # Remote
```

### Issue: Functions Missing

**Solution:**
The `get_pulse_inbox` function is created in the migration. If missing:
```bash
# Re-apply migration
supabase db execute -f supabase/migrations/20251112_pulse_decision_inbox.sql
```

### Issue: RLS Policies Blocking Access

**Solution:**
The migration includes RLS policies. Verify they exist:
```bash
psql $DATABASE_URL -c "\d+ pulse_cards" | grep -i policy
```

## 📊 Database Schema

### pulse_cards
- Stores all Pulse cards
- Indexed by `dealer_id`, `ts`, `dedupe_key`
- Has RLS policies for tenant isolation

### pulse_threads
- Groups related cards
- Auto-updated via trigger
- Indexed by `dealer_id`, `thread_type`, `thread_id`

### get_pulse_inbox()
- Filters cards by dealer, level, kind
- Respects mute rules
- Returns paginated results

## 🔗 Related Documentation

- **Pulse Dashboard:** `docs/PULSE_DASHBOARD_ACTIVATION.md`
- **API Documentation:** `docs/PULSE_INBOX_SYSTEM.md`
- **Migration Files:** `supabase/migrations/20251112_pulse_decision_inbox.sql`

---

**Last Updated:** 2025-01-20

