/**
 * Supabase Consolidation Script
 * 
 * This script helps migrate data from multiple Supabase projects
 * into a single master DealershipAI project
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration for existing projects to migrate from
const EXISTING_PROJECTS = [
  {
    name: 'primary',
    url: 'https://vxrdvkhkombwlhjvtsmw.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_OLD || '',
  },
  // Add other projects here as needed
];

// Master project configuration
const MASTER_PROJECT = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

// Tables to migrate (in dependency order)
const TABLES_TO_MIGRATE = [
  'tenants',
  'users',
  'ai_answer_events',
  'ai_snippet_share',
  'kpi_history',
  'secondary_metrics',
  'avi_reports',
  'feature_store',
  'sentinel_events',
  // Add other tables as needed
];

interface MigrationResult {
  project: string;
  table: string;
  recordsExported: number;
  recordsImported: number;
  errors: string[];
  success: boolean;
}

class SupabaseConsolidator {
  private masterClient: any;
  private results: MigrationResult[] = [];

  constructor() {
    this.masterClient = createClient(MASTER_PROJECT.url, MASTER_PROJECT.serviceKey);
  }

  async consolidateAllProjects(): Promise<void> {
    console.log('🚀 Starting Supabase consolidation...');
    console.log(`📊 Master project: ${MASTER_PROJECT.url}`);
    console.log(`📋 Projects to migrate: ${EXISTING_PROJECTS.length}`);

    for (const project of EXISTING_PROJECTS) {
      console.log(`\n📦 Processing project: ${project.name}`);
      await this.migrateProject(project);
    }

    await this.generateReport();
  }

  private async migrateProject(project: any): Promise<void> {
    const client = createClient(project.url, project.serviceKey);

    for (const table of TABLES_TO_MIGRATE) {
      try {
        console.log(`  📄 Migrating table: ${table}`);
        const result = await this.migrateTable(client, project.name, table);
        this.results.push(result);
      } catch (error) {
        console.error(`  ❌ Error migrating ${table}:`, error);
        this.results.push({
          project: project.name,
          table,
          recordsExported: 0,
          recordsImported: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          success: false,
        });
      }
    }
  }

  private async migrateTable(sourceClient: any, projectName: string, tableName: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      project: projectName,
      table: tableName,
      recordsExported: 0,
      recordsImported: 0,
      errors: [],
      success: false,
    };

    try {
      // Export data from source
      const { data: sourceData, error: exportError } = await sourceClient
        .from(tableName)
        .select('*');

      if (exportError) {
        result.errors.push(`Export error: ${exportError.message}`);
        return result;
      }

      result.recordsExported = sourceData?.length || 0;
      console.log(`    📤 Exported ${result.recordsExported} records`);

      if (result.recordsExported === 0) {
        result.success = true;
        return result;
      }

      // Import data to master
      const { data: importData, error: importError } = await this.masterClient
        .from(tableName)
        .insert(sourceData);

      if (importError) {
        result.errors.push(`Import error: ${importError.message}`);
        return result;
      }

      result.recordsImported = sourceData.length;
      result.success = true;
      console.log(`    📥 Imported ${result.recordsImported} records`);

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 Migration Report');
    console.log('==================');

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`✅ Successful migrations: ${successful.length}`);
    console.log(`❌ Failed migrations: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\n❌ Failed Migrations:');
      failed.forEach(result => {
        console.log(`  ${result.project}.${result.table}: ${result.errors.join(', ')}`);
      });
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  async validateMasterProject(): Promise<void> {
    console.log('\n🔍 Validating master project...');

    for (const table of TABLES_TO_MIGRATE) {
      try {
        const { data, error } = await this.masterClient
          .from(table)
          .select('count', { count: 'exact', head: true });

        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: ${data?.length || 0} records`);
        }
      } catch (error) {
        console.log(`  ❌ ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
}

// CLI usage
async function main() {
  const consolidator = new SupabaseConsolidator();

  const command = process.argv[2];

  switch (command) {
    case 'migrate':
      await consolidator.consolidateAllProjects();
      break;
    case 'validate':
      await consolidator.validateMasterProject();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run consolidate:migrate  - Migrate all projects to master');
      console.log('  npm run consolidate:validate - Validate master project');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { SupabaseConsolidator };
