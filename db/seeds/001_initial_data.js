/**
 * Seed: Initial Data
 *
 * Seeds the database with initial data for development and testing:
 * - Demo tenants
 * - Sample dealerships
 * - Test users (note: actual users need Clerk IDs)
 */

exports.seed = async function(knex) {
  // Clear existing data (be careful with this in production!)
  await knex('analyses').del();
  await knex('optimization_recommendations').del();
  await knex('competitors').del();
  await knex('reviews').del();
  await knex('mystery_shops').del();
  await knex('market_scans').del();
  await knex('chat_sessions').del();
  await knex('ai_visibility_audits').del();
  await knex('dealership_data').del();
  await knex('audit_log').del();
  await knex('subscriptions').del();
  await knex('dealerships').del();
  await knex('users').del();
  // Don't delete the SuperAdmin tenant created in migration

  // Insert demo tenants
  const demoTenantId = '10000000-0000-0000-0000-000000000001';
  const enterpriseTenantId = '20000000-0000-0000-0000-000000000001';

  await knex('tenants').insert([
    {
      id: demoTenantId,
      name: 'Demo Dealership Group',
      type: 'dealership',
      settings: JSON.stringify({
        features_enabled: ['dashboard', 'scores', 'chat'],
        billing_tier: 'pro'
      })
    },
    {
      id: enterpriseTenantId,
      name: 'Enterprise Auto Group',
      type: 'enterprise',
      settings: JSON.stringify({
        features_enabled: ['all'],
        billing_tier: 'enterprise'
      })
    }
  ]);

  // Note: In production, users would be created via Clerk webhook
  // This is just for development testing with mock Clerk IDs
  const demoUserId = '30000000-0000-0000-0000-000000000001';
  const enterpriseUserId = '40000000-0000-0000-0000-000000000001';

  await knex('users').insert([
    {
      id: demoUserId,
      clerk_id: 'user_demo_12345',
      tenant_id: demoTenantId,
      role: 'dealership_admin',
      permissions: JSON.stringify({
        can_view_analytics: true,
        can_export_data: true,
        can_manage_users: false
      })
    },
    {
      id: enterpriseUserId,
      clerk_id: 'user_enterprise_67890',
      tenant_id: enterpriseTenantId,
      role: 'enterprise_admin',
      permissions: JSON.stringify({
        can_view_analytics: true,
        can_export_data: true,
        can_manage_users: true,
        can_manage_settings: true
      })
    }
  ]);

  // Insert sample dealerships
  const dealership1Id = '50000000-0000-0000-0000-000000000001';
  const dealership2Id = '60000000-0000-0000-0000-000000000001';
  const dealership3Id = '70000000-0000-0000-0000-000000000001';

  await knex('dealerships').insert([
    {
      id: dealership1Id,
      tenant_id: demoTenantId,
      name: 'ABC Toyota',
      domain: 'abctoyota.com',
      website_url: 'https://abctoyota.com',
      city: 'Austin',
      state: 'TX',
      zip_code: '78701',
      phone: '(512) 555-1234',
      email: 'info@abctoyota.com'
    },
    {
      id: dealership2Id,
      tenant_id: demoTenantId,
      name: 'Honda Center',
      domain: 'hondacenter.com',
      website_url: 'https://hondacenter.com',
      city: 'Dallas',
      state: 'TX',
      zip_code: '75201',
      phone: '(214) 555-5678',
      email: 'info@hondacenter.com'
    },
    {
      id: dealership3Id,
      tenant_id: enterpriseTenantId,
      name: 'BMW of Texas',
      domain: 'bmwoftexas.com',
      website_url: 'https://bmwoftexas.com',
      city: 'Houston',
      state: 'TX',
      zip_code: '77002',
      phone: '(713) 555-9012',
      email: 'info@bmwoftexas.com'
    }
  ]);

  // Insert sample dealership data with scores
  await knex('dealership_data').insert([
    {
      tenant_id: demoTenantId,
      dealership_url: 'https://abctoyota.com',
      dealership_name: 'ABC Toyota',
      ai_visibility_score: 75,
      zero_click_score: 72,
      ugc_health_score: 80,
      geo_trust_score: 78,
      sgp_integrity_score: 70,
      overall_score: 75,
      last_analyzed: new Date()
    },
    {
      tenant_id: demoTenantId,
      dealership_url: 'https://hondacenter.com',
      dealership_name: 'Honda Center',
      ai_visibility_score: 68,
      zero_click_score: 65,
      ugc_health_score: 70,
      geo_trust_score: 72,
      sgp_integrity_score: 68,
      overall_score: 69,
      last_analyzed: new Date()
    },
    {
      tenant_id: enterpriseTenantId,
      dealership_url: 'https://bmwoftexas.com',
      dealership_name: 'BMW of Texas',
      ai_visibility_score: 85,
      zero_click_score: 88,
      ugc_health_score: 82,
      geo_trust_score: 90,
      sgp_integrity_score: 84,
      overall_score: 86,
      last_analyzed: new Date()
    }
  ]);

  // Insert sample subscriptions
  await knex('subscriptions').insert([
    {
      tenant_id: demoTenantId,
      user_id: 'user_demo_12345',
      email: 'demo@abctoyota.com',
      dealership_url: 'https://abctoyota.com',
      dealership_name: 'ABC Toyota',
      stripe_customer_id: 'cus_demo_12345',
      stripe_subscription_id: 'sub_demo_12345',
      status: 'active',
      plan: 'pro',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    {
      tenant_id: enterpriseTenantId,
      user_id: 'user_enterprise_67890',
      email: 'admin@enterpriseautogroup.com',
      dealership_url: 'https://bmwoftexas.com',
      dealership_name: 'BMW of Texas',
      stripe_customer_id: 'cus_enterprise_67890',
      stripe_subscription_id: 'sub_enterprise_67890',
      status: 'active',
      plan: 'enterprise',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  ]);

  // Insert sample competitors
  await knex('competitors').insert([
    {
      tenant_id: demoTenantId,
      dealership_id: dealership1Id,
      competitor_name: 'Larusso Motors',
      competitor_domain: 'larussomotors.com',
      competitor_url: 'https://larussomotors.com',
      competitor_score: 82,
      last_analyzed: new Date()
    },
    {
      tenant_id: demoTenantId,
      dealership_id: dealership2Id,
      competitor_name: 'Prestige Worldwide Imports',
      competitor_domain: 'prestigeworldwide.com',
      competitor_url: 'https://prestigeworldwide.com',
      competitor_score: 71,
      last_analyzed: new Date()
    },
    {
      tenant_id: demoTenantId,
      dealership_id: dealership2Id,
      competitor_name: 'Southside Motors',
      competitor_domain: 'southsidemotors.com',
      competitor_url: 'https://southsidemotors.com',
      competitor_score: 65,
      last_analyzed: new Date()
    }
  ]);

  console.log('✅ Seed data inserted successfully!');
  console.log('   - 2 demo tenants');
  console.log('   - 2 test users');
  console.log('   - 3 sample dealerships');
  console.log('   - 3 dealership score records');
  console.log('   - 2 subscriptions');
  console.log('   - 2 competitors');
};
