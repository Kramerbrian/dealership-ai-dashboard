/**
 * Route Migration Helper Script
 * Helps identify routes that need migration
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

interface RouteInfo {
  path: string;
  hasAuth: boolean;
  hasValidation: boolean;
  hasErrorHandling: boolean;
  usesWrapper: boolean;
  needsMigration: boolean;
}

async function findRouteFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function walk(currentPath: string) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return files;
}

async function analyzeRoute(filePath: string): Promise<RouteInfo> {
  const content = await readFile(filePath, 'utf-8');
  
  const hasAuth = /auth\(\)|requireAuth|@clerk/.test(content);
  const hasValidation = /z\.|ZodSchema|validate/.test(content);
  const hasErrorHandling = /try\s*\{|catch\s*\(|errorResponse/.test(content);
  const usesWrapper = /createApiRoute/.test(content);
  
  return {
    path: filePath,
    hasAuth: hasAuth || false,
    hasValidation: hasValidation || false,
    hasErrorHandling: hasErrorHandling || false,
    usesWrapper,
    needsMigration: !usesWrapper,
  };
}

async function main() {
  const apiDir = join(process.cwd(), 'app', 'api');
  const routes = await findRouteFiles(apiDir);
  
  console.log(`Found ${routes.length} API routes\n`);
  
  const analysis = await Promise.all(
    routes.map(route => analyzeRoute(route))
  );
  
  const needsMigration = analysis.filter(r => r.needsMigration);
  const alreadyMigrated = analysis.filter(r => !r.needsMigration);
  
  console.log('📊 Migration Status:');
  console.log(`✅ Already migrated: ${alreadyMigrated.length}`);
  console.log(`⚠️  Needs migration: ${needsMigration.length}\n`);
  
  console.log('Routes needing migration:');
  needsMigration.forEach(route => {
    const indicators = [];
    if (!route.hasAuth) indicators.push('❌ No auth');
    if (!route.hasValidation) indicators.push('❌ No validation');
    if (!route.hasErrorHandling) indicators.push('❌ No error handling');
    
    console.log(`  ${route.path}`);
    if (indicators.length > 0) {
      console.log(`    ${indicators.join(' | ')}`);
    }
  });
  
  console.log('\n✅ Migrated routes:');
  alreadyMigrated.forEach(route => {
    console.log(`  ${route.path}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

export { analyzeRoute, findRouteFiles };

