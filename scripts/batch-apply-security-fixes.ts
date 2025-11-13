#!/usr/bin/env tsx
/**
 * Batch Apply Security Fixes
 * Systematically applies:
 * 1. Rate limiting to public endpoints
 * 2. Zod validation to POST endpoints
 * 3. Error handling improvements
 */

import fs from 'fs';
import path from 'path';
import { readdirSync, statSync } from 'fs';

interface EndpointFix {
  file: string;
  path: string;
  needsRateLimit: boolean;
  needsZod: boolean;
  methods: string[];
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

function analyzeEndpoint(filePath: string): EndpointFix | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routePath = filePath
    .replace(process.cwd() + '/app/api/', '/api/')
    .replace('/route.ts', '')
    .replace('/route.tsx', '');

  const isPublic = routePath.includes('/v1/') || 
                   routePath.includes('/health') || 
                   routePath.includes('/status') ||
                   routePath.includes('/ai/health');
  
  const hasGet = content.includes('export async function GET') || content.includes('export const GET');
  const hasPost = content.includes('export async function POST') || content.includes('export const POST');
  
  const methods: string[] = [];
  if (hasGet) methods.push('GET');
  if (hasPost) methods.push('POST');

  const hasRateLimit = /rateLimit|ratelimit|createEnhancedApiRoute|createPublicRoute|allow\(/.test(content);
  const hasZod = /from ['"]zod['"]|z\.object|z\.string/.test(content);

  if (!isPublic && !hasPost) return null;

  return {
    file: path.relative(process.cwd(), filePath),
    path: routePath,
    needsRateLimit: isPublic && !hasRateLimit,
    needsZod: hasPost && !hasZod,
    methods,
  };
}

async function main() {
  console.log('🔒 Batch Applying Security Fixes...\n');

  const apiDir = path.join(process.cwd(), 'app/api');
  const routeFiles = findRouteFiles(apiDir);
  
  const fixes: EndpointFix[] = [];
  for (const file of routeFiles) {
    const fix = analyzeEndpoint(file);
    if (fix && (fix.needsRateLimit || fix.needsZod)) {
      fixes.push(fix);
    }
  }

  console.log(`Found ${fixes.length} endpoints needing fixes\n`);
  console.log('📋 Fixes to apply:');
  fixes.slice(0, 20).forEach(f => {
    const fixes = [];
    if (f.needsRateLimit) fixes.push('rate-limit');
    if (f.needsZod) fixes.push('zod');
    console.log(`  ${f.path} - ${fixes.join(', ')}`);
  });
  if (fixes.length > 20) {
    console.log(`  ... and ${fixes.length - 20} more`);
  }

  // Save fix plan
  fs.writeFileSync(
    'security-fixes-plan.json',
    JSON.stringify({ fixes }, null, 2)
  );

  console.log('\n✅ Fix plan saved to: security-fixes-plan.json');
  console.log('\n💡 To apply fixes, use the enhanced-route wrapper in each endpoint');
}

main().catch(console.error);

