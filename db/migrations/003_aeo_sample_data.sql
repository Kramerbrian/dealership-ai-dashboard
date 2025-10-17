-- Sample AEO Data for Testing
-- Populates tables with realistic test data

-- Insert sample AEO runs for the last 30 days
INSERT INTO aeo_runs (tenant_id, run_date, total_queries, queries_with_surfaces)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid as tenant_id,
  (CURRENT_DATE - (random() * 30)::int) as run_date,
  (100 + random() * 400)::int as total_queries,
  (20 + random() * 80)::int as queries_with_surfaces
FROM generate_series(1, 15);

-- Insert sample AEO queries
WITH run_ids AS (
  SELECT id, run_date FROM aeo_runs 
  WHERE tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
  ORDER BY run_date DESC
  LIMIT 5
),
sample_queries AS (
  SELECT 
    r.id as run_id,
    r.tenant_id,
    q.query_text,
    md5(q.query_text) as query_hash,
    q.surface_type,
    q.aeo_present,
    q.fs,
    q.paa,
    q.local_pack,
    q.first_dealer_domain,
    q.ours_first
  FROM run_ids r
  CROSS JOIN (
    VALUES 
      ('honda civic for sale near me', 'local', false, false, false, true, 'dealership1.com', true),
      ('best car dealerships in miami', 'aeo', true, false, false, false, 'dealership2.com', false),
      ('toyota camry price', 'fs', false, true, false, false, 'dealership1.com', true),
      ('car financing options', 'paa', false, false, true, false, 'dealership3.com', false),
      ('used cars under 15000', 'none', false, false, false, false, null, false),
      ('honda accord reviews', 'fs', false, true, false, false, 'dealership1.com', true),
      ('car insurance quotes', 'aeo', true, false, false, false, 'dealership2.com', false),
      ('auto repair shop near me', 'local', false, false, false, true, 'dealership3.com', true),
      ('car rental deals', 'paa', false, false, true, false, 'dealership1.com', false),
      ('electric vehicle charging stations', 'none', false, false, false, false, null, false),
      ('ford f150 for sale', 'local', false, false, false, true, 'dealership2.com', true),
      ('car maintenance tips', 'fs', false, true, false, false, 'dealership3.com', false),
      ('best suv 2024', 'aeo', true, false, false, false, 'dealership1.com', true),
      ('car accident lawyer', 'paa', false, false, true, false, 'dealership2.com', false),
      ('motorcycle dealerships', 'local', false, false, false, true, 'dealership3.com', true)
  ) AS q(query_text, surface_type, aeo_present, fs, paa, local_pack, first_dealer_domain, ours_first)
)
INSERT INTO aeo_queries (
  run_id, tenant_id, query_text, query_hash, surface_type, 
  aeo_present, fs, paa, local_pack, first_dealer_domain, ours_first
)
SELECT * FROM sample_queries;

-- Add some additional random queries for more realistic data
INSERT INTO aeo_queries (run_id, tenant_id, query_text, query_hash, surface_type, aeo_present, fs, paa, local_pack, first_dealer_domain, ours_first)
SELECT 
  r.id,
  r.tenant_id,
  'sample query ' || generate_series,
  md5('sample query ' || generate_series),
  CASE (random() * 4)::int
    WHEN 0 THEN 'aeo'
    WHEN 1 THEN 'fs' 
    WHEN 2 THEN 'paa'
    WHEN 3 THEN 'local'
    ELSE 'none'
  END,
  (random() * 4)::int = 0,
  (random() * 4)::int = 1,
  (random() * 4)::int = 2,
  (random() * 4)::int = 3,
  CASE (random() * 3)::int
    WHEN 0 THEN 'dealership1.com'
    WHEN 1 THEN 'dealership2.com'
    WHEN 2 THEN 'dealership3.com'
    ELSE null
  END,
  random() > 0.5
FROM aeo_runs r
CROSS JOIN generate_series(1, 20)
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000'::uuid;
