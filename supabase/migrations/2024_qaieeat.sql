-- DealershipAI QAI + E-E-A-T Schema
-- Run this in Supabase SQL Editor

create table if not exists scores(
  id bigserial primary key,
  dealer_id uuid not null,
  metric text not null,
  value numeric not null,
  delta numeric default 0,
  detail jsonb,
  measured_at timestamptz default now()
);

create index if not exists idx_scores_dealer_metric on scores(dealer_id, metric, measured_at desc);

create table if not exists eeat_opportunities(
  id bigserial primary key,
  dealer_id uuid not null,
  pillar text not null check (pillar in ('experience','expertise','authority','trust')),
  title text not null,
  impact numeric,
  effort text,
  steps jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_eeat_opps_dealer_pillar on eeat_opportunities(dealer_id, pillar);

create table if not exists agent_runs(
  id bigserial primary key,
  agent text not null,        -- 'openai:seo', 'claude:eeat'
  dealer_id uuid,
  domain text,
  input jsonb,
  output jsonb,
  cost_usd numeric default 0,
  duration_ms integer,
  created_at timestamptz default now()
);

create index if not exists idx_agent_runs_dealer on agent_runs(dealer_id, created_at desc);
create index if not exists idx_agent_runs_agent on agent_runs(agent, created_at desc);

create table if not exists voice_sessions(
  id bigserial primary key,
  dealer_id uuid,
  session_id text,
  utterance text,
  intent text,
  handled_by text,            -- 'voice_router', 'openai', 'claude'
  result jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_voice_sessions_dealer on voice_sessions(dealer_id, created_at desc);

-- RLS policies (optional - uncomment if needed)
-- alter table scores enable row level security;
-- alter table eeat_opportunities enable row level security;
-- alter table agent_runs enable row level security;
-- alter table voice_sessions enable row level security;

