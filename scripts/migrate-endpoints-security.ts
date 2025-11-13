#!/usr/bin/env tsx
/**
 * Batch Migration Script: Phase 1 Security Fixes
 * 
 * 1. Protects all admin endpoints
 * 2. Adds rate limiting to public endpoints
 * 3. Adds Zod validation to POST endpoints
 */

import fs from 'fs';
import path from 'path';
import { readdirSync, statSync } from 'fs';

interface EndpointInfo {
  file: string;
  path: string;
  methods: string[];
  isAdmin: boolean;
  isPublic: boolean;
  needsAuth: boolean;
  needsRateLimit: boolean;
  needsZod: boolean;
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

function analyzeEndpoint(filePath: string): EndpointInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  const routePath = filePath
    .replace(process.cwd() + '/app/api/', '/api/')
    .replace('/route.ts', '')
    .replace('/route.tsx', '')
    .replace(/\[(\w+)\]/g, ':$1');

  const isAdmin = routePath.includes('/admin/');
  const isPublic = routePath.includes('/v1/') || routePath.includes('/health') || routePath.includes('/status');
  
  const hasGet = content.includes('export async function GET') || content.includes('export const GET');
  const hasPost = content.includes('export async function POST') || content.includes('export const POST');
  const hasPut = content.includes('export async function PUT') || content.includes('export const PUT');
  const hasPatch = content.includes('export async function PATCH') || content.includes('export const PATCH');
  const hasDelete = content.includes('export async function DELETE') || content.includes('export const DELETE');

  const methods: string[] = [];
  if (hasGet) methods.push('GET');
  if (hasPost) methods.push('POST');
  if (hasPut) methods.push('PUT');
  if (hasPatch) methods.push('PATCH');
  if (hasDelete) methods.push('DELETE');

  const hasAuth = /auth\(\)|currentUser\(\)|requireAdmin|requireAuth/.test(content);
  const hasRateLimit = /rateLimit|ratelimit|createEnhancedApiRoute|allow\(/.test(content);
  const hasZod = /from ['"]zod['"]|z\.object|z\.string/.test(content);

  return {
    file: relativePath,
    path: routePath,
    methods,
    isAdmin,
    isPublic,
    needsAuth: isAdmin && !hasAuth,
    needsRateLimit: (isPublic || hasPost) && !hasRateLimit,
    needsZod: (hasPost || hasPut || hasPatch) && !hasZod,
  };
}

async function main() {
  console.log('🔒 Starting Security Migration (Phase 1)...\n');

  const apiDir = path.join(process.cwd(), 'app/api');
  const routeFiles = findRouteFiles(apiDir);
  
  console.log(`Found ${routeFiles.length} endpoints to analyze\n`);

  const endpoints: EndpointInfo[] = routeFiles.map(analyzeEndpoint);
  
  const adminEndpoints = endpoints.filter(e => e.isAdmin);
  const publicEndpoints = endpoints.filter(e => e.isPublic);
  const postEndpoints = endpoints.filter(e => e.methods.includes('POST'));

  console.log('📊 Analysis:');
  console.log(`  Admin endpoints: ${adminEndpoints.length}`);
  console.log(`  Public endpoints: ${publicEndpoints.length}`);
  console.log(`  POST endpoints: ${postEndpoints.length}\n`);

  console.log('🔴 Admin endpoints needing auth:');
  adminEndpoints.filter(e => e.needsAuth).forEach(e => {
    console.log(`  ${e.path} (${e.methods.join(', ')})`);
  });

  console.log('\n🟡 Public endpoints needing rate limiting:');
  publicEndpoints.filter(e => e.needsRateLimit).slice(0, 10).forEach(e => {
    console.log(`  ${e.path} (${e.methods.join(', ')})`);
  });
  if (publicEndpoints.filter(e => e.needsRateLimit).length > 10) {
    console.log(`  ... and ${publicEndpoints.filter(e => e.needsRateLimit).length - 10} more`);
  }

  console.log('\n🟠 POST endpoints needing Zod validation:');
  postEndpoints.filter(e => e.needsZod).slice(0, 10).forEach(e => {
    console.log(`  ${e.path}`);
  });
  if (postEndpoints.filter(e => e.needsZod).length > 10) {
    console.log(`  ... and ${postEndpoints.filter(e => e.needsZod).length - 10} more`);
  }

  // Save migration plan
  const migrationPlan = {
    summary: {
      total: endpoints.length,
      adminNeedingAuth: adminEndpoints.filter(e => e.needsAuth).length,
      publicNeedingRateLimit: publicEndpoints.filter(e => e.needsRateLimit).length,
      postNeedingZod: postEndpoints.filter(e => e.needsZod).length,
    },
    endpoints: endpoints.filter(e => e.needsAuth || e.needsRateLimit || e.needsZod),
  };

  fs.writeFileSync(
    'security-migration-plan.json',
    JSON.stringify(migrationPlan, null, 2)
  );

  console.log('\n✅ Migration plan saved to: security-migration-plan.json');
  console.log('\n📝 Next steps:');
  console.log('  1. Review security-migration-plan.json');
  console.log('  2. Run migration script to apply fixes');
  console.log('  3. Test all endpoints');
}

main().catch(console.error);

