-- Enable UUIDs if needed
create extension if not exists "uuid-ossp";

-- Integration tokens table
create table if not exists public.integrations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id text not null,
  kind text not null,           -- 'ga4', 'reviews', etc.
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb,               -- e.g., { "ga4_property_id": "properties/12345678" }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists integrations_tenant_kind_idx
  on public.integrations (tenant_id, kind);

-- Helpful view for debugging (optional)
create view public.integrations_public as
  select tenant_id, kind, (metadata->>'ga4_property_id') as ga4_property_id, created_at, updated_at
  from public.integrations;

-- RLS (optional — if you use anon/service key on server, service role bypasses RLS)
alter table public.integrations enable row level security;

-- Only service role may write (server-only)
create policy "service_role_full_access" on public.integrations
  for all using (auth.role() = 'service_role');

