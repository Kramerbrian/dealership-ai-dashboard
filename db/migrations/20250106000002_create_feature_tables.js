/**
 * Migration: Create Feature Tables
 *
 * Creates feature-specific tables for DealershipAI:
 * - scores (AI visibility and trust scores)
 * - chat_sessions (ACP chat interactions)
 * - market_scans (competitive analysis)
 * - mystery_shops (mystery shopping data)
 * - reviews (review management)
 * - competitors (competitor tracking)
 * - ai_visibility_audits (audit history)
 * - optimization_recommendations (AI-generated recommendations)
 */

exports.up = async function(knex) {
  // Create custom types for features
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE audit_status AS ENUM ('pending', 'processing', 'completed', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE optimization_priority AS ENUM ('low', 'medium', 'high', 'critical');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create dealership_data/scores table
  await knex.schema.createTable('dealership_data', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.text('dealership_url').notNullable();
    table.text('dealership_name');

    // AI Visibility Scores
    table.integer('ai_visibility_score').defaultTo(0);
    table.integer('zero_click_score').defaultTo(0);
    table.integer('ugc_health_score').defaultTo(0);
    table.integer('geo_trust_score').defaultTo(0);
    table.integer('sgp_integrity_score').defaultTo(0);
    table.integer('overall_score').defaultTo(0);

    // Schema audit data
    table.jsonb('schema_audit').defaultTo('{}');

    table.timestamp('last_analyzed', { useTz: true });
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('dealership_url');
  });

  // Create ai_visibility_audits table
  await knex.schema.createTable('ai_visibility_audits', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.specificType('status', 'audit_status').defaultTo('pending');

    // AI Visibility Scores
    table.integer('ai_visibility_score').checkBetween([0, 100]);
    table.integer('zero_click_score').checkBetween([0, 100]);
    table.integer('ugc_health_score').checkBetween([0, 100]);
    table.integer('geo_trust_score').checkBetween([0, 100]);
    table.integer('sgp_integrity_score').checkBetween([0, 100]);
    table.integer('overall_score').checkBetween([0, 100]);

    // Trust Scores
    table.integer('authority_score').checkBetween([0, 100]);
    table.integer('expertise_score').checkBetween([0, 100]);
    table.integer('experience_score').checkBetween([0, 100]);
    table.integer('transparency_score').checkBetween([0, 100]);
    table.integer('consistency_score').checkBetween([0, 100]);
    table.integer('freshness_score').checkBetween([0, 100]);
    table.integer('overall_trust_score').checkBetween([0, 100]);

    // Metadata
    table.jsonb('audit_data');
    table.text('error_message');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('completed_at', { useTz: true });

    table.index('dealership_id');
    table.index('tenant_id');
    table.index('created_at');
  });

  // Create chat_sessions table
  await knex.schema.createTable('chat_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');

    table.text('session_token').notNullable();
    table.jsonb('messages').defaultTo('[]');
    table.jsonb('context_data').defaultTo('{}');

    table.timestamp('started_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('last_activity', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('ended_at', { useTz: true });

    table.index('tenant_id');
    table.index('dealership_id');
    table.index('session_token');
    table.index('started_at');
  });

  // Create market_scans table
  await knex.schema.createTable('market_scans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');

    table.text('market_area').notNullable();
    table.jsonb('scan_results').defaultTo('{}');
    table.integer('competitors_found').defaultTo(0);

    table.timestamp('scanned_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('dealership_id');
    table.index('scanned_at');
  });

  // Create mystery_shops table
  await knex.schema.createTable('mystery_shops', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');

    table.text('shop_type').notNullable();
    table.jsonb('shop_data').defaultTo('{}');
    table.integer('overall_rating').checkBetween([0, 100]);

    table.timestamp('shopped_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('dealership_id');
    table.index('shopped_at');
  });

  // Create reviews table
  await knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');

    table.text('platform').notNullable(); // google, yelp, facebook, etc
    table.text('review_id_external');
    table.text('reviewer_name');
    table.decimal('rating', 2, 1).notNullable();
    table.text('review_text');
    table.text('response_text');
    table.timestamp('review_date', { useTz: true });
    table.timestamp('response_date', { useTz: true });
    table.jsonb('metadata').defaultTo('{}');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('dealership_id');
    table.index('platform');
    table.index('review_date');
  });

  // Create competitors table
  await knex.schema.createTable('competitors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');

    table.text('competitor_name').notNullable();
    table.text('competitor_domain').notNullable();
    table.text('competitor_url');
    table.integer('competitor_score').checkBetween([0, 100]);
    table.jsonb('analysis_data').defaultTo('{}');

    table.timestamp('last_analyzed', { useTz: true });
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('dealership_id');
    table.index('competitor_domain');
  });

  // Create optimization_recommendations table
  await knex.schema.createTable('optimization_recommendations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('dealership_id').references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('audit_id').references('id').inTable('ai_visibility_audits').onDelete('CASCADE');

    // Recommendation details
    table.text('actionable_win').notNullable();
    table.text('opportunity').notNullable();
    table.decimal('score', 3, 2).checkBetween([0, 1]);
    table.text('explanation').notNullable();

    // Categorization
    table.text('category'); // seo, aeo, geo, ai_visibility, content, technical, local
    table.specificType('priority', 'optimization_priority').defaultTo('medium');
    table.text('effort_level'); // low, medium, high
    table.text('impact_level'); // low, medium, high

    // Implementation details
    table.text('estimated_time');
    table.specificType('required_skills', 'text[]');
    table.specificType('tools_needed', 'text[]');

    // Status tracking
    table.text('status').defaultTo('pending'); // pending, in_progress, completed, cancelled
    table.uuid('created_by').references('id').inTable('users');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('dealership_id');
    table.index('tenant_id');
    table.index('audit_id');
  });

  // Create analyses table (for premium analysis results)
  await knex.schema.createTable('analyses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('dealership_url').notNullable();

    // Results
    table.integer('ai_visibility_score');
    table.jsonb('results');

    // Access control
    table.boolean('is_premium').defaultTo(false);
    table.timestamp('unlocked_at', { useTz: true });

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('tenant_id');
    table.index('user_id');
    table.index('dealership_url');
  });

  // Create triggers for updated_at
  await knex.raw('CREATE TRIGGER update_dealership_data_updated_at BEFORE UPDATE ON dealership_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_ai_visibility_audits_updated_at BEFORE UPDATE ON ai_visibility_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
  await knex.raw('CREATE TRIGGER update_optimization_recommendations_updated_at BEFORE UPDATE ON optimization_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()');
};

exports.down = async function(knex) {
  // Drop triggers
  await knex.raw('DROP TRIGGER IF EXISTS update_optimization_recommendations_updated_at ON optimization_recommendations');
  await knex.raw('DROP TRIGGER IF EXISTS update_competitors_updated_at ON competitors');
  await knex.raw('DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews');
  await knex.raw('DROP TRIGGER IF EXISTS update_ai_visibility_audits_updated_at ON ai_visibility_audits');
  await knex.raw('DROP TRIGGER IF EXISTS update_dealership_data_updated_at ON dealership_data');

  // Drop tables
  await knex.schema.dropTableIfExists('analyses');
  await knex.schema.dropTableIfExists('optimization_recommendations');
  await knex.schema.dropTableIfExists('competitors');
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('mystery_shops');
  await knex.schema.dropTableIfExists('market_scans');
  await knex.schema.dropTableIfExists('chat_sessions');
  await knex.schema.dropTableIfExists('ai_visibility_audits');
  await knex.schema.dropTableIfExists('dealership_data');

  // Drop types
  await knex.raw('DROP TYPE IF EXISTS optimization_priority');
  await knex.raw('DROP TYPE IF EXISTS audit_status');
};
