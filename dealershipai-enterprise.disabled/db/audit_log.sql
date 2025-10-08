-- DealershipAI Audit Log Schema
-- Run in Supabase SQL editor

-- Create audit_log table with append-only behavior
create table if not exists audit_log (
  id            bigserial primary key,
  tenant_id     uuid not null,
  agent_id      text not null,
  model_version text not null,
  prompt_hash   text not null,
  action_type   text not null,
  entity_type   text not null,
  entity_id     text not null,
  inputs_ptr    jsonb not null,    -- pointers/ids only
  outputs_json  jsonb not null,    -- exact write payload
  rationale     text,              -- concise why
  confidence    numeric(4,3) not null,
  policy_check  jsonb not null,    -- {contract_id, pass, violations: []}
  human_override jsonb,            -- {by, reason, delta}
  retention_class text not null check (retention_class in ('A','B','C')),
  occurred_at   timestamptz not null default now()
);

-- Append-only: block UPDATE/DELETE
create or replace function audit_log_no_mutations() returns trigger as $$
begin
  if (TG_OP = 'UPDATE' or TG_OP = 'DELETE') then
    raise exception 'audit_log is append-only';
  end if;
  return null;
end; $$ language plpgsql;

create trigger audit_log_no_update
  before update on audit_log for each statement execute function audit_log_no_mutations();
create trigger audit_log_no_delete
  before delete on audit_log for each statement execute function audit_log_no_mutations();

-- Minimal indexes for performance
create index if not exists idx_audit_tenant_time on audit_log(tenant_id, occurred_at desc);
create index if not exists idx_audit_agent on audit_log(agent_id);
create index if not exists idx_audit_confidence on audit_log(confidence);
create index if not exists idx_audit_policy_check on audit_log using gin(policy_check);

-- Row Level Security (RLS) for tenant isolation
alter table audit_log enable row level security;

-- Policy for tenant isolation (adjust based on your auth setup)
create policy tenant_isolation on audit_log 
  using (tenant_id = auth.uid());

-- View: compliance summary
create or replace view audit_compliance_summary as
select
  tenant_id,
  date_trunc('day', occurred_at) as day,
  count(*) as total_actions,
  sum( (policy_check->>'pass')::boolean::int ) as passes,
  sum( case when (policy_check->>'pass')::boolean = false then 1 else 0 end ) as violations,
  avg(confidence) as avg_confidence,
  sum( case when (policy_check->>'mode') = 'FULL_AUTO' then 1 else 0 end ) as auto_actions,
  sum( case when (policy_check->>'mode') = 'HUMAN_REVIEW' then 1 else 0 end ) as human_reviews
from audit_log
group by 1,2
order by 2 desc;

-- RPC function for compliance metrics
create or replace function compliance_summary_metrics()
returns json as $$
  with base as (
    select
      count(*) as total,
      sum(case when (policy_check->>'mode') = 'FULL_AUTO' then 1 else 0 end) as auto_count,
      sum(case when (policy_check->>'mode') = 'HUMAN_REVIEW' then 1 else 0 end) as human_reviews,
      sum(case when (policy_check->>'pass')::boolean = false then 1 else 0 end) as violations_7d,
      avg(confidence) as avg_confidence
    from audit_log
    where occurred_at >= now() - interval '7 days'
  )
  select json_build_object(
    'auto_pct', round(100.0 * auto_count / nullif(total,0), 1),
    'human_reviews', human_reviews,
    'violations_7d', violations_7d,
    'avg_confidence', avg_confidence
  ) from base;
$$ language sql stable;

-- Sample data for testing (remove in production)
insert into audit_log (
  tenant_id, agent_id, model_version, prompt_hash, action_type, entity_type, entity_id,
  inputs_ptr, outputs_json, rationale, confidence, policy_check, retention_class
) values 
(
  '00000000-0000-0000-0000-000000000001',
  'appraisal-penetration-agent',
  'gpt-4-turbo',
  'abc123def456',
  'create_task',
  'crm.task',
  'task_001',
  '{"roId": "ro_123", "vin": "1HGBH41JXMN109186"}',
  '{"taskType": "appraisal_nudge", "dueAt": "2024-01-16T09:00:00Z", "assignee": "advisor_001"}',
  'High-value service customer with trade-in potential',
  0.92,
  '{"contract_id": "appraisal-penetration-agent", "pass": true, "violations": [], "mode": "FULL_AUTO"}',
  'B'
),
(
  '00000000-0000-0000-0000-000000000001',
  'appraisal-penetration-agent',
  'gpt-4-turbo',
  'def456ghi789',
  'create_task',
  'crm.task',
  'task_002',
  '{"roId": "ro_124", "vin": "1HGBH41JXMN109187"}',
  '{"taskType": "appraisal_nudge", "dueAt": "2024-01-16T10:00:00Z", "assignee": "advisor_002"}',
  'Service customer with high mileage vehicle',
  0.75,
  '{"contract_id": "appraisal-penetration-agent", "pass": false, "violations": ["confidence_below_threshold"], "mode": "HUMAN_REVIEW"}',
  'B'
);
