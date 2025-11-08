-- DealershipAI · Supabase schema (telemetry + pulse stubs)
-- Run this once in Supabase SQL editor

-- 1) Telemetry events (PLG funnel + UX events)
create table if not exists public.telemetry_events (
  id bigserial primary key,
  type text not null,
  payload jsonb default '{}'::jsonb,
  ts timestamptz not null default now(),
  ip text
);
create index if not exists idx_telemetry_ts on public.telemetry_events (ts desc);
create index if not exists idx_telemetry_type on public.telemetry_events (type);

-- 2) (Optional) Pulse snapshots for admin demos
create table if not exists public.pulse_events (
  id bigserial primary key,
  market_id text not null default 'us_default',
  event_type text not null,
  oem text,
  models text[],
  delta_msrp_abs numeric,
  delta_rebate_abs numeric,
  severity text check (severity in ('P0','P1','P2')),
  effective_at timestamptz not null default now()
);
create index if not exists idx_pulse_market_time on public.pulse_events (market_id, effective_at desc);

-- 3) (Optional) Seed helper view for daily rollups
create or replace view public.v_telemetry_daily as
select date_trunc('day', ts) as day,
       count(*) as events
from telemetry_events
group by 1
order by 1 desc;

-- (Optional) RLS examples — uncomment if you want RLS now
-- alter table public.telemetry_events enable row level security;
-- create policy "telemetry_read_all_admin_only" on public.telemetry_events for select to authenticated using (true);
-- create policy "telemetry_insert_public" on public.telemetry_events for insert to anon, authenticated using (true) with check (true);
-- NOTE: Adjust roles/policies to your security posture.
