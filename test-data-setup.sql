-- ============================================
-- TEST DATA SETUP FOR AUDIT WORKFLOW
-- ============================================
-- Run this in your Supabase SQL Editor to set up test data
-- Then use http://localhost:3001/test-audit to test the workflow

-- ============================================
-- 1. CREATE TEST TENANT
-- ============================================
INSERT INTO tenants (
  id,
  name,
  type,
  subscription_tier,
  subscription_status,
  mrr,
  rooftop_count,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Dealership Group',
  'dealership',
  'growth',
  'active',
  999.00,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- ============================================
-- 2. CREATE TEST USER (LINKED TO CLERK)
-- ============================================
-- IMPORTANT: Replace 'your_clerk_user_id' with your actual Clerk user ID
-- Get it from: Clerk Dashboard → Users → Click your user → Copy User ID

INSERT INTO users (
  clerk_id,
  tenant_id,
  email,
  full_name,
  role,
  permissions,
  created_at
) VALUES (
  'user_2example123',  -- ⚠️ REPLACE THIS with your Clerk user ID!
  '11111111-1111-1111-1111-111111111111',
  'test@dealership.com',
  'Test User',
  'dealership_admin',
  ARRAY['view:own_data', 'manage:team', 'update:settings', 'run:audits'],
  NOW()
) ON CONFLICT (clerk_id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email;

-- ============================================
-- 3. CREATE TEST DEALERSHIPS
-- ============================================

-- Test Dealership 1: Naples Auto Mall
INSERT INTO dealership_data (
  id,
  tenant_id,
  name,
  website,
  domain,
  location,
  phone,
  email,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Naples Auto Mall',
  'https://naplesautomall.com',
  'naplesautomall.com',
  'Naples, FL',
  '(239) 555-0100',
  'info@naplesautomall.com',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website;

-- Test Dealership 2: Terry Reid Hyundai
INSERT INTO dealership_data (
  id,
  tenant_id,
  name,
  website,
  domain,
  location,
  phone,
  email,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Terry Reid Hyundai',
  'https://terryreidhyundai.com',
  'terryreidhyundai.com',
  'Naples, FL',
  '(239) 555-0200',
  'info@terryreidhyundai.com',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website;

-- ============================================
-- 4. VERIFY SETUP
-- ============================================

-- Check if data was created
SELECT 'Tenants' as table_name, COUNT(*) as count FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'Users', COUNT(*) FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'Dealerships', COUNT(*) FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

-- Show dealership IDs (copy these for testing)
SELECT
  id,
  name,
  website,
  domain
FROM dealership_data
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

-- ============================================
-- 5. NEXT STEPS
-- ============================================

/*

✅ After running this SQL:

1. Copy the dealership ID from the results above
   Example: 22222222-2222-2222-2222-222222222222

2. Go to: http://localhost:3001/test-audit

3. Paste the dealership ID into the form

4. Click "Run Complete Workflow"

5. Watch the magic happen! 🚀

The workflow will:
  ✓ Run audit (scores across 5 modules)
  ✓ Generate recommendations
  ✓ Analyze competitors
  ✓ Build competitive matrix

All results are stored in your Supabase database!

*/

-- ============================================
-- OPTIONAL: ADD TEST COMPETITORS
-- ============================================

-- Add competitors for Naples Auto Mall
INSERT INTO competitors (
  dealership_id,
  name,
  website,
  domain,
  location,
  last_score,
  ai_visibility_score,
  zero_click_score,
  ugc_health_score,
  geo_trust_score,
  sgp_integrity_score,
  last_analyzed,
  created_at
) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  'Honda of Naples',
  'https://hondaofnaples.com',
  'hondaofnaples.com',
  'Naples, FL',
  78,
  75,
  80,
  82,
  76,
  71,
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  'Toyota of Naples',
  'https://toyotaofnaples.com',
  'toyotaofnaples.com',
  'Naples, FL',
  82,
  80,
  85,
  84,
  79,
  78,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- CLEANUP (if you need to start over)
-- ============================================

/*
-- Uncomment to delete all test data:

DELETE FROM competitors WHERE dealership_id IN (
  SELECT id FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
);

DELETE FROM recommendations WHERE dealership_id IN (
  SELECT id FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
);

DELETE FROM score_history WHERE dealership_id IN (
  SELECT id FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
);

DELETE FROM audits WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111';
*/
