# Migrations - Copy/Paste for Supabase Dashboard

## 🗄️ Apply These Migrations via Supabase Dashboard

**Dashboard URL:** https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb

**Steps:**
1. Go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy/paste Migration 1 below
4. Click **Run** (or Cmd/Ctrl + Enter)
5. Repeat for Migration 2

---

## Migration 1: Integrations Indexes

```sql
-- Reuse existing 'integrations' table; store provider-specific data in metadata JSON.
-- Add convenience indexes for common lookups.

-- kind = 'reviews' → metadata: { "place_id": "ChIJ...", "provider": "google" }
-- kind = 'visibility' → metadata: { "engines": { "ChatGPT": true, "Perplexity": true, "Gemini": true, "Copilot": true } }

create index if not exists integrations_kind_idx on public.integrations(kind);
create index if not exists integrations_tenant_idx on public.integrations(tenant_id);

-- (Optional) JSON indexes for quick filter
create index if not exists integrations_metadata_placeid_idx
  on public.integrations ((metadata->>'place_id'))
  where kind = 'reviews';

create index if not exists integrations_metadata_engines_idx
  on public.integrations ((metadata->'engines'))
  where kind = 'visibility';
```

**Expected result:** "Success. No rows returned"

---

## Migration 2: Fix Receipts Table

```sql
-- Fix receipts table for Impact Ledger
-- Tracks applied fixes with 10-minute undo window

create table if not exists public.fix_receipts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id text not null,
  pulse_id text not null,
  tier text not null,                -- 'preview'|'apply'|'autopilot'
  actor text not null,               -- 'human'|'agent'
  summary text not null,             -- short description shown in Ledger
  delta_usd numeric not null,        -- signed; positive = recovered
  undoable boolean not null default true,
  undo_deadline timestamptz,         -- now() + interval '10 minutes'
  undone boolean not null default false,
  context jsonb,                     -- payload (diff, entities, etc.)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fix_receipts_tenant_idx on public.fix_receipts(tenant_id);
create index if not exists fix_receipts_pulse_idx on public.fix_receipts(pulse_id);
create index if not exists fix_receipts_deadline_idx on public.fix_receipts(undo_deadline);

alter table public.fix_receipts enable row level security;

-- Server-only writes with service role; reads can be later opened via views if needed
create policy "service_role_full_access_receipts" on public.fix_receipts
  for all using (auth.role() = 'service_role');
```

**Expected result:** "Success. No rows returned"

---

## ✅ Verify Migrations Applied

After running both, verify in SQL Editor:

```sql
-- Check tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('integrations', 'fix_receipts');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (indexname LIKE '%integrations%' OR indexname LIKE '%fix_receipts%');
```

You should see:
- `fix_receipts` table
- Multiple indexes on both tables

---

## 📋 After Migrations

Once both migrations are applied:
1. ✅ Set missing environment variables: `./scripts/quick-env-setup.sh`
2. ✅ Configure Clerk dashboard (add domain)
3. ✅ Deploy: `./scripts/deploy.sh`

