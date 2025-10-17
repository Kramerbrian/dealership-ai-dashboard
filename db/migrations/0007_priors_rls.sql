-- Supabase/PG: RLS enable + policies for SeoVariantPrior
alter table if exists "SeoVariantPrior" enable row level security;

create policy if not exists priors_select on "SeoVariantPrior"
  for select using (tenantId = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));

create policy if not exists priors_insert on "SeoVariantPrior"
  for insert with check (tenantId = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));

create policy if not exists priors_update on "SeoVariantPrior"
  for update using (tenantId = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));

-- Unique already defined at Prisma level