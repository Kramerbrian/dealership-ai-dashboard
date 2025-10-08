-- Quick script to add 5 sample dealerships

-- 1. Get tenant ID
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  
  -- 2. Add dealerships
  INSERT INTO dealership_data (tenant_id, name, website, domain, location, ai_visibility_score) VALUES
  (v_tenant_id, 'AutoNation Toyota Fort Myers', 'https://www.autonationtoyotafortmyers.com', 'autonationtoyotafortmyers.com', 'Fort Myers, FL', 85),
  (v_tenant_id, 'Germain Honda of Naples', 'https://www.germainhondaofnaples.com', 'germainhondaofnaples.com', 'Naples, FL', 78),
  (v_tenant_id, 'Sunset Dodge Chrysler Jeep', 'https://www.sunsetdodge.com', 'sunsetdodge.com', 'Sarasota, FL', 72),
  (v_tenant_id, 'Crown Honda Southpoint', 'https://www.crownhondasouthpoint.com', 'crownhondasouthpoint.com', 'Durham, NC', 88),
  (v_tenant_id, 'Phillips Chevrolet', 'https://www.phillipschevrolet.com', 'phillipschevrolet.com', 'Frankfort, IL', 81);
END $$;

-- 3. Verify
SELECT 
  COUNT(*) as total_dealerships,
  ROUND(AVG(ai_visibility_score)) as avg_score
FROM dealership_data;

SELECT name, location, ai_visibility_score 
FROM dealership_data 
ORDER BY ai_visibility_score DESC;
