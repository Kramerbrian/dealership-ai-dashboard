create materialized view if not exists mv_weekly_variant as
select "tenantId", "variantId",
       date_trunc('week', "asOf")::date as bucket,
       sum(impressions) as impressions,
       sum(clicks) as clicks,
       sum(conversions) as conversions,
       sum(revenue) as revenue
from "SeoVariantMetric"
group by 1,2,3;
create index if not exists idx_mv_weekly on mv_weekly_variant("tenantId", "variantId", bucket);
