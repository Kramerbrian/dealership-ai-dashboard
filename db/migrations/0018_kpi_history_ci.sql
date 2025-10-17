-- Add CI fields to kpi_history table
-- DealershipAI - Confidence intervals for KPI stability monitoring

alter table kpi_history
  add column if not exists aiv_ci jsonb,
  add column if not exists ati_ci jsonb,
  add column if not exists crs_ci jsonb;

-- Add index for CI queries
create index if not exists idx_kpi_history_ci on kpi_history(tenant_id, as_of) where aiv_ci is not null;

-- Add comment explaining CI structure
comment on column kpi_history.aiv_ci is '95% confidence interval for AIV: {"low":72.4,"high":78.9,"n":8}';
comment on column kpi_history.ati_ci is '95% confidence interval for ATI: {"low":72.4,"high":78.9,"n":8}';
comment on column kpi_history.crs_ci is '95% confidence interval for CRS: {"low":72.4,"high":78.9,"n":8}';
