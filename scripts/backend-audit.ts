#!/usr/bin/env tsx
/**
 * Comprehensive Backend Audit Script
 * Audits all API endpoints for:
 * - Authentication/Authorization
 * - Rate Limiting
 * - Input Validation (Zod)
 * - Error Handling
 * - Database Connections
 * - TODOs/FIXMEs
 * - Missing Implementations
 */

import fs from 'fs';
import path from 'path';
import { readdirSync, statSync } from 'fs';

interface EndpointAudit {
  path: string;
  file: string;
  methods: string[];
  hasAuth: boolean;
  hasRateLimit: boolean;
  hasZodValidation: boolean;
  hasErrorHandling: boolean;
  hasDatabase: boolean;
  hasTodos: boolean;
  todos: string[];
  issues: string[];
  status: 'complete' | 'incomplete' | 'stub' | 'error';
}

const API_DIR = path.join(process.cwd(), 'app/api');
const RESULTS: EndpointAudit[] = [];

async function auditEndpoint(filePath: string): Promise<EndpointAudit> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Extract route path from file structure
  const routePath = filePath
    .replace(process.cwd() + '/app/api/', '/api/')
    .replace('/route.ts', '')
    .replace('/route.js', '')
    .replace(/\[(\w+)\]/g, ':$1');

  const audit: EndpointAudit = {
    path: routePath,
    file: relativePath,
    methods: [],
    hasAuth: false,
    hasRateLimit: false,
    hasZodValidation: false,
    hasErrorHandling: false,
    hasDatabase: false,
    hasTodos: false,
    todos: [],
    issues: [],
    status: 'incomplete',
  };

  // Detect HTTP methods
  if (content.includes('export async function GET')) audit.methods.push('GET');
  if (content.includes('export async function POST')) audit.methods.push('POST');
  if (content.includes('export async function PUT')) audit.methods.push('PUT');
  if (content.includes('export async function PATCH')) audit.methods.push('PATCH');
  if (content.includes('export async function DELETE')) audit.methods.push('DELETE');

  // Check for authentication
  const authPatterns = [
    /auth\(\)/,
    /currentUser\(\)/,
    /getServerSession/,
    /requireTenant/,
    /@clerk\/nextjs/,
    /userId/,
    /user\.id/,
  ];
  audit.hasAuth = authPatterns.some(pattern => pattern.test(content));

  // Check for rate limiting
  const rateLimitPatterns = [
    /rateLimit/,
    /ratelimit/,
    /createEnhancedApiRoute/,
    /upstash.*ratelimit/,
  ];
  audit.hasRateLimit = rateLimitPatterns.some(pattern => pattern.test(content));

  // Check for Zod validation
  const zodPatterns = [
    /from ['"]zod['"]/,
    /z\.object/,
    /z\.string/,
    /\.parse\(/,
    /\.safeParse\(/,
  ];
  audit.hasZodValidation = zodPatterns.some(pattern => pattern.test(content));

  // Check for error handling
  const errorPatterns = [
    /try\s*\{/,
    /catch\s*\(/,
    /NextResponse\.json.*error/,
    /status:\s*\d{3}/,
  ];
  audit.hasErrorHandling = errorPatterns.some(pattern => pattern.test(content));

  // Check for database connections
  const dbPatterns = [
    /supabase/,
    /prisma/,
    /@supabase/,
    /createClient/,
    /\.from\(/,
    /\.findMany/,
    /\.findUnique/,
  ];
  audit.hasDatabase = dbPatterns.some(pattern => pattern.test(content));

  // Check for TODOs/FIXMEs
  const todoMatches = content.matchAll(/(?:TODO|FIXME|XXX|HACK|NOTE|BUG):\s*(.+)/gi);
  audit.todos = Array.from(todoMatches, m => m[1].trim());
  audit.hasTodos = audit.todos.length > 0;

  // Determine status
  if (content.includes('// stub') || content.includes('// TODO:') || content.includes('return NextResponse.json({ stub: true })')) {
    audit.status = 'stub';
  } else if (content.includes('throw new Error') && !content.includes('try')) {
    audit.status = 'error';
  } else if (audit.hasAuth && audit.hasErrorHandling) {
    audit.status = 'complete';
  }

  // Identify issues
  if (!audit.hasAuth && !routePath.includes('/health') && !routePath.includes('/status') && !routePath.includes('/v1/analyze')) {
    audit.issues.push('Missing authentication');
  }
  if (!audit.hasRateLimit && audit.methods.includes('POST')) {
    audit.issues.push('Missing rate limiting');
  }
  if (!audit.hasZodValidation && (audit.methods.includes('POST') || audit.methods.includes('PUT'))) {
    audit.issues.push('Missing Zod validation');
  }
  if (!audit.hasErrorHandling) {
    audit.issues.push('Missing error handling');
  }

  return audit;
}

function findRouteFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.tsx' || file === 'route.js' || file === 'route.jsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function main() {
  console.log('🔍 Starting Backend Audit...\n');

  // Find all API route files
  const apiDir = path.join(process.cwd(), 'app/api');
  const routeFiles = findRouteFiles(apiDir);

  console.log(`Found ${routeFiles.length} API endpoints\n`);

  // Audit each endpoint
  for (const file of routeFiles) {
    try {
      const audit = await auditEndpoint(file);
      RESULTS.push(audit);
    } catch (error) {
      console.error(`Error auditing ${file}:`, error);
    }
  }

  // Generate report
  const total = RESULTS.length;
  const withAuth = RESULTS.filter(r => r.hasAuth).length;
  const withRateLimit = RESULTS.filter(r => r.hasRateLimit).length;
  const withZod = RESULTS.filter(r => r.hasZodValidation).length;
  const withErrorHandling = RESULTS.filter(r => r.hasErrorHandling).length;
  const stubs = RESULTS.filter(r => r.status === 'stub').length;
  const incomplete = RESULTS.filter(r => r.status === 'incomplete').length;
  const withIssues = RESULTS.filter(r => r.issues.length > 0).length;
  const withTodos = RESULTS.filter(r => r.hasTodos).length;

  const report = {
    summary: {
      totalEndpoints: total,
      withAuthentication: withAuth,
      withRateLimiting: withRateLimit,
      withZodValidation: withZod,
      withErrorHandling: withErrorHandling,
      stubs: stubs,
      incomplete: incomplete,
      withIssues: withIssues,
      withTodos: withTodos,
    },
    endpoints: RESULTS.sort((a, b) => a.path.localeCompare(b.path)),
  };

  // Write report
  fs.writeFileSync(
    'backend-audit-report.json',
    JSON.stringify(report, null, 2)
  );

  // Print summary
  console.log('📊 Audit Summary:');
  console.log(`Total Endpoints: ${total}`);
  console.log(`✅ With Authentication: ${withAuth} (${Math.round((withAuth/total)*100)}%)`);
  console.log(`✅ With Rate Limiting: ${withRateLimit} (${Math.round((withRateLimit/total)*100)}%)`);
  console.log(`✅ With Zod Validation: ${withZod} (${Math.round((withZod/total)*100)}%)`);
  console.log(`✅ With Error Handling: ${withErrorHandling} (${Math.round((withErrorHandling/total)*100)}%)`);
  console.log(`⚠️  Stubs: ${stubs}`);
  console.log(`⚠️  Incomplete: ${incomplete}`);
  console.log(`❌ With Issues: ${withIssues}`);
  console.log(`📝 With TODOs: ${withTodos}`);
  console.log('\n📄 Full report saved to: backend-audit-report.json');

  // List endpoints with issues
  const endpointsWithIssues = RESULTS.filter(r => r.issues.length > 0);
  if (endpointsWithIssues.length > 0) {
    console.log('\n❌ Endpoints with Issues:');
    endpointsWithIssues.forEach(e => {
      console.log(`  ${e.path} (${e.methods.join(', ')})`);
      e.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }
}

main().catch(console.error);

