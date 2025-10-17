-- 0011_kpi_history_ci.sql
alter table kpi_history
  add column if not exists aiv_ci jsonb,
  add column if not exists ati_ci jsonb,
  add column if not exists crs_ci jsonb;
-- shape: {"low":72.4,"high":78.9,"n":8}
