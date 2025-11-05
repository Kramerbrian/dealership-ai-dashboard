-- Enable extension if needed
do $$ begin
  create extension if not exists pgcrypto;
exception when others then null; end $$;

-- Telemetry table (already suggested; idempotent create)
create table if not exists public.telemetry (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  tier text,
  surface text,
  at timestamptz default now(),
  ip inet,
  ua text,
  metadata jsonb default '{}'::jsonb,
  user_id text
);

-- Add indexes for telemetry
create index if not exists idx_telemetry_event on public.telemetry (event);
create index if not exists idx_telemetry_tier on public.telemetry (tier);
create index if not exists idx_telemetry_at on public.telemetry (at);
create index if not exists idx_telemetry_user on public.telemetry (user_id);

-- Trials table: per-user/per-tenant feature grants
create table if not exists public.trials (
  id uuid primary key default gen_random_uuid(),
  user_id text,                 -- your app user id (Clerk/Custom). Optional if using cookies-only
  tenant_id text,               -- dealership/group id
  feature text not null,        -- e.g., "schema_fix", "zero_click_drawer"
  source text default 'pricing-page',
  granted_by text,              -- optional operator id
  granted_at timestamptz default now(),
  expires_at timestamptz not null,
  status text default 'active'  -- active | expired | revoked
);

create index if not exists idx_trials_user_feature on public.trials (user_id, feature);
create index if not exists idx_trials_tenant on public.trials (tenant_id);
create index if not exists idx_trials_expires on public.trials (expires_at);
create index if not exists idx_trials_status on public.trials (status);

-- RLS
alter table public.telemetry enable row level security;
alter table public.trials enable row level security;

-- Deny all by default; service key will bypass RLS for server-side routes
create policy telemetry_no_select on public.telemetry for select using (false);
create policy telemetry_no_insert on public.telemetry for insert with check (false);
create policy telemetry_no_update on public.telemetry for update using (false);
create policy telemetry_no_delete on public.telemetry for delete using (false);

create policy trials_no_select on public.trials for select using (false);
create policy trials_no_insert on public.trials for insert with check (false);
create policy trials_no_update on public.trials for update using (false);
create policy trials_no_delete on public.trials for delete using (false);

-- You may add a safe read policy later (e.g., auth.uid() = user_id) if you move to Supabase Auth.

