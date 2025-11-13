#!/usr/bin/env tsx
/**
 * Batch Migrate Endpoints to Enhanced Routes
 * Systematically migrates endpoints to use createPublicRoute/createAdminRoute
 */

import fs from 'fs';
import path from 'path';
import { readdirSync, statSync } from 'fs';

interface EndpointInfo {
  file: string;
  path: string;
  hasGet: boolean;
  hasPost: boolean;
  needsMigration: boolean;
  currentAuth: 'none' | 'manual' | 'enhanced';
}

function findRouteFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.tsx') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function analyzeEndpoint(filePath: string): EndpointInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routePath = filePath
    .replace(process.cwd() + '/app/api/', '/api/')
    .replace('/route.ts', '')
    .replace('/route.tsx', '');

  const hasGet = /export (async function|const) GET/.test(content);
  const hasPost = /export (async function|const) POST/.test(content);
  
  const hasEnhancedRoute = /createPublicRoute|createAdminRoute|createAuthRoute/.test(content);
  const hasManualAuth = /requireAdmin|auth\(\)|getServerSession/.test(content);
  
  let currentAuth: 'none' | 'manual' | 'enhanced' = 'none';
  if (hasEnhancedRoute) {
    currentAuth = 'enhanced';
  } else if (hasManualAuth) {
    currentAuth = 'manual';
  }

  const needsMigration = !hasEnhancedRoute && (hasGet || hasPost);

  return {
    file: path.relative(process.cwd(), filePath),
    path: routePath,
    hasGet,
    hasPost,
    needsMigration,
    currentAuth,
  };
}

async function main() {
  console.log('🔍 Analyzing endpoints for migration...\n');

  const apiDir = path.join(process.cwd(), 'app/api');
  const routeFiles = findRouteFiles(apiDir);
  
  const endpoints: EndpointInfo[] = [];
  for (const file of routeFiles) {
    const info = analyzeEndpoint(file);
    if (info) {
      endpoints.push(info);
    }
  }

  const needsMigration = endpoints.filter(e => e.needsMigration);
  const alreadyMigrated = endpoints.filter(e => !e.needsMigration);

  console.log(`📊 Analysis Results:\n`);
  console.log(`Total endpoints: ${endpoints.length}`);
  console.log(`✅ Already migrated: ${alreadyMigrated.length}`);
  console.log(`🔄 Needs migration: ${needsMigration.length}\n`);

  console.log('🔄 Endpoints needing migration:');
  needsMigration.slice(0, 20).forEach(e => {
    const methods = [];
    if (e.hasGet) methods.push('GET');
    if (e.hasPost) methods.push('POST');
    console.log(`  ${e.path} [${methods.join(', ')}] - ${e.currentAuth}`);
  });
  if (needsMigration.length > 20) {
    console.log(`  ... and ${needsMigration.length - 20} more`);
  }

  // Save migration plan
  fs.writeFileSync(
    'endpoint-migration-plan.json',
    JSON.stringify({
      total: endpoints.length,
      migrated: alreadyMigrated.length,
      needsMigration: needsMigration.length,
      endpoints: needsMigration,
    }, null, 2)
  );

  console.log('\n✅ Migration plan saved to: endpoint-migration-plan.json');
  console.log('\n💡 Next steps:');
  console.log('  1. Review endpoint-migration-plan.json');
  console.log('  2. Migrate endpoints systematically');
  console.log('  3. Test each migration');
}

main().catch(console.error);

