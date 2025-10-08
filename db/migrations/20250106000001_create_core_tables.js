/**
 * Migration: Create Core Tables
 *
 * Creates the foundational tables for the DealershipAI platform:
 * - tenants (multi-tenant architecture)
 * - users (with Clerk integration)
 * - dealerships (dealer data)
 * - subscriptions (Stripe integration)
 */

exports.up = async function(knex) {
  // Enable necessary extensions
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

  // Create custom types
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('superadmin', 'enterprise_admin', 'dealership_admin', 'user');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE tenant_type AS ENUM ('enterprise', 'dealership', 'single');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create tenants table
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('name').notNullable();
    table.specificType('type', 'tenant_type').notNullable();
    table.uuid('parent_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.jsonb('settings').defaultTo('{}');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('parent_id');
    table.index('type');
  });

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('clerk_id').notNullable().unique();
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.specificType('role', 'user_role').notNullable().defaultTo('user');
    table.jsonb('permissions').defaultTo('{}');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('clerk_id');
    table.index('tenant_id');
    table.index('role');
  });

  // Create dealerships table
  await knex.schema.createTable('dealerships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('domain').notNullable().unique();
    table.text('website_url');
    table.text('address');
    table.string('city', 100);
    table.string('state', 50);
    table.string('zip_code', 20);
    table.string('phone', 20);
    table.string('email', 255);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.boolean('is_active').defaultTo(true);

    table.index('tenant_id');
    table.index('domain');
  });

  // Create subscriptions table
  await knex.schema.createTable('subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.text('user_id');
    table.text('email').notNullable().unique();
    table.text('dealership_url');
    table.text('dealership_name');

    // Stripe fields
    table.text('stripe_customer_id').notNullable();
    table.text('stripe_subscription_id');

    // Status tracking
    table.text('status').notNullable().defaultTo('trialing');
    table.text('plan').defaultTo('pro');
    table.timestamp('current_period_start', { useTz: true });
    table.timestamp('current_period_end', { useTz: true });
    table.timestamp('trial_end', { useTz: true });
    table.boolean('cancel_at_period_end').defaultTo(false);

    // Timestamps
    table.timestamp('activated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('canceled_at', { useTz: true });

    // Metadata
    table.text('utm_source');
    table.text('utm_campaign');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('user_id');
    table.index('email');
    table.index('status');
  });

  // Create audit_log table
  await knex.schema.createTable('audit_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.text('action').notNullable();
    table.text('resource_type').notNullable();
    table.uuid('resource_id');
    table.jsonb('details').defaultTo('{}');
    table.specificType('ip_address', 'inet');
    table.text('user_agent');
    table.timestamp('timestamp', { useTz: true }).defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('tenant_id');
    table.index('timestamp');
  });

  // Create function for updated_at trigger
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create triggers for updated_at
  await knex.raw('CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON dealerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');

  // Insert default SuperAdmin tenant
  await knex('tenants').insert({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'DealershipAI Platform',
    type: 'enterprise',
    settings: JSON.stringify({
      features_enabled: ['all'],
      billing_tier: 'enterprise'
    })
  });
};

exports.down = async function(knex) {
  // Drop triggers
  await knex.raw('DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions');
  await knex.raw('DROP TRIGGER IF EXISTS update_dealerships_updated_at ON dealerships');
  await knex.raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  await knex.raw('DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants');

  // Drop function
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');

  // Drop tables
  await knex.schema.dropTableIfExists('audit_log');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('dealerships');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('tenants');

  // Drop types
  await knex.raw('DROP TYPE IF EXISTS tenant_type');
  await knex.raw('DROP TYPE IF EXISTS user_role');
};
