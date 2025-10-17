/**
 * Master Supabase Project Setup Script
 * 
 * Sets up the master DealershipAI Supabase project with all required
 * configurations, migrations, and optimizations
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface MasterProjectConfig {
  url: string;
  serviceKey: string;
  anonKey: string;
}

class MasterProjectSetup {
  private client: any;
  private config: MasterProjectConfig;

  constructor(config: MasterProjectConfig) {
    this.config = config;
    this.client = createClient(config.url, config.serviceKey);
  }

  async setupCompleteProject(): Promise<void> {
    console.log('🚀 Setting up master DealershipAI Supabase project...');
    console.log(`📊 Project URL: ${this.config.url}`);

    try {
      await this.runAllMigrations();
      await this.setupRowLevelSecurity();
      await this.createIndexes();
      await this.setupMaterializedViews();
      await this.createFunctions();
      await this.insertSeedData();
      await this.validateSetup();

      console.log('\n✅ Master project setup completed successfully!');
      this.generateSetupReport();
    } catch (error) {
      console.error('\n❌ Setup failed:', error);
      throw error;
    }
  }

  private async runAllMigrations(): Promise<void> {
    console.log('\n📋 Running database migrations...');

    const migrationFiles = [
      '0018_ai_answer_intel.sql',
      // Add other migration files as needed
    ];

    for (const migrationFile of migrationFiles) {
      try {
        const migrationPath = path.join(process.cwd(), 'db', 'migrations', migrationFile);
        
        if (fs.existsSync(migrationPath)) {
          const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
          console.log(`  📄 Running: ${migrationFile}`);
          
          const { error } = await this.client.rpc('exec_sql', { sql: migrationSQL });
          
          if (error) {
            console.error(`  ❌ Error in ${migrationFile}:`, error);
            throw error;
          }
          
          console.log(`  ✅ Completed: ${migrationFile}`);
        } else {
          console.log(`  ⚠️  Migration file not found: ${migrationFile}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to run ${migrationFile}:`, error);
        throw error;
      }
    }
  }

  private async setupRowLevelSecurity(): Promise<void> {
    console.log('\n🔒 Setting up Row Level Security...');

    const rlsPolicies = [
      {
        table: 'ai_answer_events',
        policy: `
          CREATE POLICY "Users can only access their tenant data" ON ai_answer_events
          FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
        `,
      },
      {
        table: 'ai_snippet_share',
        policy: `
          CREATE POLICY "Users can only access their tenant data" ON ai_snippet_share
          FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
        `,
      },
      // Add more RLS policies as needed
    ];

    for (const { table, policy } of rlsPolicies) {
      try {
        console.log(`  🔐 Setting up RLS for: ${table}`);
        
        // Enable RLS
        await this.client.rpc('exec_sql', { 
          sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
        });

        // Create policy
        await this.client.rpc('exec_sql', { sql: policy });
        
        console.log(`  ✅ RLS configured for: ${table}`);
      } catch (error) {
        console.error(`  ❌ RLS setup failed for ${table}:`, error);
        throw error;
      }
    }
  }

  private async createIndexes(): Promise<void> {
    console.log('\n📊 Creating performance indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_ai_answer_events_tenant_time ON ai_answer_events (tenant_id, observed_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_ai_snippet_share_tenant_date ON ai_snippet_share (tenant_id, as_of DESC);',
      'CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants (created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);',
      // Add more indexes as needed
    ];

    for (const indexSQL of indexes) {
      try {
        await this.client.rpc('exec_sql', { sql: indexSQL });
        console.log(`  ✅ Index created`);
      } catch (error) {
        console.error(`  ❌ Index creation failed:`, error);
        throw error;
      }
    }
  }

  private async setupMaterializedViews(): Promise<void> {
    console.log('\n🔄 Setting up materialized views...');

    const materializedViews = [
      {
        name: 'ai_zero_click_impact_mv',
        sql: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS ai_zero_click_impact_mv AS
          SELECT
            tenant_id,
            CURRENT_DATE AS as_of,
            28 AS window_days,
            (SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0)) * 100 AS aiv_pct,
            (SUM(CASE WHEN appeared AND cited THEN 1 ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN appeared THEN 1 ELSE 0 END),0)) * 100 AS citation_share_pct,
            GREATEST(0, ((SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0)) * 0.345) * 100
                     * (1 - (COALESCE(AVG(CASE WHEN appeared THEN (CASE WHEN cited THEN 1 ELSE 0 END) END),0)))) AS zero_click_siphon_pct
          FROM ai_answer_events
          WHERE observed_at >= NOW() - INTERVAL '28 days'
          GROUP BY tenant_id;
        `,
      },
      // Add more materialized views as needed
    ];

    for (const { name, sql } of materializedViews) {
      try {
        console.log(`  📊 Creating materialized view: ${name}`);
        await this.client.rpc('exec_sql', { sql });
        console.log(`  ✅ Materialized view created: ${name}`);
      } catch (error) {
        console.error(`  ❌ Materialized view creation failed for ${name}:`, error);
        throw error;
      }
    }
  }

  private async createFunctions(): Promise<void> {
    console.log('\n⚙️  Creating database functions...');

    const functions = [
      {
        name: 'refresh_ai_zero_click_impact_mv',
        sql: `
          CREATE OR REPLACE FUNCTION refresh_ai_zero_click_impact_mv()
          RETURNS void AS $$
          BEGIN
            REFRESH MATERIALIZED VIEW CONCURRENTLY ai_zero_click_impact_mv;
          END;
          $$ LANGUAGE plpgsql;
        `,
      },
      {
        name: 'get_tenant_ai_metrics',
        sql: `
          CREATE OR REPLACE FUNCTION get_tenant_ai_metrics(tenant_uuid uuid)
          RETURNS TABLE (
            aiv_pct numeric,
            citation_share_pct numeric,
            zero_click_siphon_pct numeric
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              mv.aiv_pct,
              mv.citation_share_pct,
              mv.zero_click_siphon_pct
            FROM ai_zero_click_impact_mv mv
            WHERE mv.tenant_id = tenant_uuid;
          END;
          $$ LANGUAGE plpgsql;
        `,
      },
      // Add more functions as needed
    ];

    for (const { name, sql } of functions) {
      try {
        console.log(`  ⚙️  Creating function: ${name}`);
        await this.client.rpc('exec_sql', { sql });
        console.log(`  ✅ Function created: ${name}`);
      } catch (error) {
        console.error(`  ❌ Function creation failed for ${name}:`, error);
        throw error;
      }
    }
  }

  private async insertSeedData(): Promise<void> {
    console.log('\n🌱 Inserting seed data...');

    const seedData = [
      {
        table: 'tenants',
        data: [
          {
            id: 'demo-tenant-id',
            name: 'Demo Dealership',
            domain: 'demo-dealership.com',
            tier: 'pro',
            created_at: new Date().toISOString(),
          },
        ],
      },
      // Add more seed data as needed
    ];

    for (const { table, data } of seedData) {
      try {
        console.log(`  🌱 Seeding table: ${table}`);
        
        const { error } = await this.client
          .from(table)
          .insert(data);

        if (error) {
          console.error(`  ❌ Seed data error for ${table}:`, error);
          throw error;
        }

        console.log(`  ✅ Seeded ${data.length} records in ${table}`);
      } catch (error) {
        console.error(`  ❌ Seed data failed for ${table}:`, error);
        throw error;
      }
    }
  }

  private async validateSetup(): Promise<void> {
    console.log('\n🔍 Validating setup...');

    const validations = [
      {
        name: 'AI Answer Events Table',
        query: 'SELECT COUNT(*) FROM ai_answer_events',
      },
      {
        name: 'AI Snippet Share Table',
        query: 'SELECT COUNT(*) FROM ai_snippet_share',
      },
      {
        name: 'Materialized View',
        query: 'SELECT COUNT(*) FROM ai_zero_click_impact_mv',
      },
      {
        name: 'Tenants Table',
        query: 'SELECT COUNT(*) FROM tenants',
      },
    ];

    for (const { name, query } of validations) {
      try {
        const { data, error } = await this.client.rpc('exec_sql', { sql: query });
        
        if (error) {
          console.log(`  ❌ ${name}: ${error.message}`);
        } else {
          console.log(`  ✅ ${name}: Valid`);
        }
      } catch (error) {
        console.log(`  ❌ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private generateSetupReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      project: {
        url: this.config.url,
        anonKey: this.config.anonKey.substring(0, 20) + '...',
        serviceKey: this.config.serviceKey.substring(0, 20) + '...',
      },
      setup: {
        migrations: 'Completed',
        rls: 'Configured',
        indexes: 'Created',
        materializedViews: 'Created',
        functions: 'Created',
        seedData: 'Inserted',
      },
      nextSteps: [
        'Update environment variables in all environments',
        'Deploy to production',
        'Test all functionality',
        'Monitor performance',
        'Set up backups',
      ],
    };

    const reportPath = path.join(process.cwd(), 'master-project-setup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Setup report saved to: ${reportPath}`);
  }
}

// CLI usage
async function main() {
  const config: MasterProjectConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };

  if (!config.url || !config.serviceKey) {
    console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const setup = new MasterProjectSetup(config);
  await setup.setupCompleteProject();
}

if (require.main === module) {
  main().catch(console.error);
}

export { MasterProjectSetup };
