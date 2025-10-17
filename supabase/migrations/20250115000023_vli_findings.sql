-- 0006_vli_findings.sql
create table if not exists vli_findings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  vdp_id text not null,
  as_of date not null,
  integrity_pct numeric(5,2) not null,       -- 0..100
  issues jsonb not null,                      -- [{id,severity,msg}]
  created_at timestamptz default now(),
  unique(tenant_id, vdp_id, as_of)
);

create index if not exists idx_vli_findings_tvw on vli_findings(tenant_id, as_of desc);

alter table vli_findings enable row level security;

do $$ begin
  create policy vli_sel on vli_findings for select using (tenant_id=current_setting('app.tenant')::uuid);
  create policy vli_ins on vli_findings for insert with check (tenant_id=current_setting('app.tenant')::uuid);
end $$;
