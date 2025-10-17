create table if not exists tenant_webhook_secrets (
  tenant_id text primary key,
  secret text not null,
  rotated_at timestamptz not null default now()
);
alter table tenant_webhook_secrets enable row level security;
create policy if not exists twh_readwrite on tenant_webhook_secrets
  using (tenant_id = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''))
  with check (tenant_id = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));
