-- Add a new dealership to the database
-- Replace the values below with actual dealership information

-- 1. First, get your tenant ID
SELECT id, name FROM tenants;

-- 2. Add dealership data (replace 'YOUR_TENANT_ID' with actual tenant ID from above)
INSERT INTO dealership_data (
  tenant_id,
  name,
  website,
  domain,
  location,
  ai_visibility_score,
  google_my_business_score,
  social_media_score,
  online_reviews_score,
  website_seo_score,
  local_listings_score,
  last_audit_date
) VALUES (
  'YOUR_TENANT_ID',  -- Replace with actual tenant ID
  'Example Dealership',
  'https://example-dealer.com',
  'example-dealer.com',
  'Tampa, FL',
  75,  -- Overall score
  80,  -- GMB score
  70,  -- Social media score
  85,  -- Reviews score
  65,  -- SEO score
  90,  -- Local listings score
  NOW()
) RETURNING *;

-- 3. Verify the data was added
SELECT 
  d.name,
  d.location,
  d.ai_visibility_score,
  t.name as tenant_name
FROM dealership_data d
JOIN tenants t ON d.tenant_id = t.id
ORDER BY d.created_at DESC
LIMIT 5;
