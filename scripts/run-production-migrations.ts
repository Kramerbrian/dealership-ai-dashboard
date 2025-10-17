#!/usr/bin/env tsx

/**
 * Production Database Migration Script
 * 
 * This script applies all necessary migrations for the production deployment:
 * 1. Idempotency keys table
 * 2. Tenant tiers and billing
 * 3. Usage tracking tables
 * 4. Indexes and constraints
 */

import { PrismaClient } from '@prisma/client';
import { config } from '../lib/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});

async function runMigrations() {
  console.log('🚀 Starting production database migrations...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Migration 1: Idempotency keys table
    console.log('📝 Creating idempotency_keys table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        id text PRIMARY KEY,
        tenant_id uuid NOT NULL,
        route text NOT NULL,
        key text NOT NULL,
        seen_at timestamptz DEFAULT now()
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS ix_idem_tenant_route ON idempotency_keys(tenant_id, route, key);
    `;
    
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION cleanup_old_idempotency_keys()
      RETURNS void AS $$
      BEGIN
        DELETE FROM idempotency_keys 
        WHERE seen_at < now() - interval '24 hours';
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Idempotency keys table created');

    // Migration 2: Tenant tiers and billing
    console.log('📝 Adding tenant tier columns...');
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tier text DEFAULT 'free' CHECK (tier IN ('free', 'growth', 'pro', 'enterprise'));
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_id text;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email text;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
    `;
    console.log('✅ Tenant tier columns added');

    // Migration 3: Create indexes for performance
    console.log('📝 Creating performance indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tier);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_tenants_subscription_id ON tenants(subscription_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);
    `;
    console.log('✅ Performance indexes created');

    // Migration 4: API logs table
    console.log('📝 Creating API logs table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        route text NOT NULL,
        method text NOT NULL,
        status_code integer NOT NULL,
        response_time_ms integer NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_logs_tenant_id ON api_logs(tenant_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_api_logs_route ON api_logs(route);
    `;
    console.log('✅ API logs table created');

    // Migration 5: Webhook logs table
    console.log('📝 Creating webhook logs table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        webhook_type text NOT NULL,
        status_code integer NOT NULL,
        response_time_ms integer NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_webhook_logs_tenant_id ON webhook_logs(tenant_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
    `;
    console.log('✅ Webhook logs table created');

    // Migration 6: Bandit allocations table
    console.log('📝 Creating bandit allocations table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS bandit_allocations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        variant_id text NOT NULL,
        traffic_allocated integer NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_bandit_allocations_tenant_id ON bandit_allocations(tenant_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_bandit_allocations_created_at ON bandit_allocations(created_at);
    `;
    console.log('✅ Bandit allocations table created');

    // Migration 7: Tenant usage summary view
    console.log('📝 Creating tenant usage summary view...');
    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW tenant_usage_summary AS
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        t.tier,
        COALESCE(api_counts.api_calls, 0) as api_calls_this_month,
        COALESCE(webhook_counts.webhook_calls, 0) as webhook_calls_this_month,
        COALESCE(bandit_counts.bandit_allocations, 0) as bandit_allocations_this_month,
        t.created_at,
        t.updated_at
      FROM tenants t
      LEFT JOIN (
        SELECT 
          tenant_id,
          COUNT(*) as api_calls
        FROM api_logs 
        WHERE created_at >= date_trunc('month', now())
        GROUP BY tenant_id
      ) api_counts ON t.id = api_counts.tenant_id
      LEFT JOIN (
        SELECT 
          tenant_id,
          COUNT(*) as webhook_calls
        FROM webhook_logs 
        WHERE created_at >= date_trunc('month', now())
        GROUP BY tenant_id
      ) webhook_counts ON t.id = webhook_counts.tenant_id
      LEFT JOIN (
        SELECT 
          tenant_id,
          COUNT(*) as bandit_allocations
        FROM bandit_allocations 
        WHERE created_at >= date_trunc('month', now())
        GROUP BY tenant_id
      ) bandit_counts ON t.id = bandit_counts.tenant_id;
    `;
    console.log('✅ Tenant usage summary view created');

    // Migration 8: Create cleanup job
    console.log('📝 Setting up cleanup jobs...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION cleanup_old_logs()
      RETURNS void AS $$
      BEGIN
        -- Clean up API logs older than 30 days
        DELETE FROM api_logs 
        WHERE created_at < now() - interval '30 days';
        
        -- Clean up webhook logs older than 30 days
        DELETE FROM webhook_logs 
        WHERE created_at < now() - interval '30 days';
        
        -- Clean up bandit allocations older than 90 days
        DELETE FROM bandit_allocations 
        WHERE created_at < now() - interval '90 days';
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Cleanup jobs created');

    // Migration 9: Insert default tenant if none exists
    console.log('📝 Checking for default tenant...');
    const tenantCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM tenants
    `;
    
    if (Number(tenantCount[0].count) === 0) {
      console.log('📝 Creating default tenant...');
      await prisma.$executeRaw`
        INSERT INTO tenants (id, name, tier, is_active, created_at, updated_at)
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          'Default Tenant',
          'free',
          true,
          now(),
          now()
        );
      `;
      console.log('✅ Default tenant created');
    } else {
      console.log('✅ Tenants already exist, skipping default tenant creation');
    }

    console.log('🎉 All migrations completed successfully!');
    
    // Display migration summary
    console.log('\n📊 Migration Summary:');
    console.log('- ✅ Idempotency keys table');
    console.log('- ✅ Tenant tier columns');
    console.log('- ✅ Performance indexes');
    console.log('- ✅ API logs table');
    console.log('- ✅ Webhook logs table');
    console.log('- ✅ Bandit allocations table');
    console.log('- ✅ Tenant usage summary view');
    console.log('- ✅ Cleanup jobs');
    console.log('- ✅ Default tenant (if needed)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations().catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

export { runMigrations };
