alter table if exists "SeoVariantMetric" enable row level security;

create policy if not exists metrics_select on "SeoVariantMetric"
  for select using (tenantId = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));

create policy if not exists metrics_insert on "SeoVariantMetric"
  for insert with check (tenantId = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));

create policy if not exists metrics_update on "SeoVariantMetric"
  for update using (tenantId = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));
