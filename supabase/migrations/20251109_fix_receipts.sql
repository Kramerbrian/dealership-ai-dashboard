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

