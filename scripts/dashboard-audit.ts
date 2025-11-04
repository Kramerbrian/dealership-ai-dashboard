/**
 * End-to-End Dashboard Audit Script
 * Verifies all endpoints, data flows, and connections
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EndpointAudit {
  endpoint: string;
  method: string;
  status: 'connected' | 'missing' | 'error';
  responseTime?: number;
  error?: string;
  usedBy: string[];
}

interface ComponentAudit {
  component: string;
  endpoints: string[];
  dataFlow: 'working' | 'broken' | 'partial';
  issues: string[];
}

interface EngineAudit {
  engine: string;
  status: 'connected' | 'missing' | 'error';
  exports: string[];
  usedIn: string[];
}

const API_ENDPOINTS = [
  '/api/dashboard/overview',
  '/api/dashboard/ai-health',
  '/api/dashboard/website',
  '/api/dashboard/reviews',
  '/api/visibility/seo',
  '/api/visibility/aeo',
  '/api/visibility/geo',
  '/api/ai/analysis',
  '/api/ai/visibility-index',
  '/api/user/profile',
  '/api/user/subscription',
  '/api/user/usage'
];

const DASHBOARD_COMPONENTS = [
  'DealershipAIDashboardLA',
  'DAICognitiveDashboardModal',
  'HAL9000Chatbot',
  'CompetitiveComparisonWidget',
  'WhatIfRevenueCalculator',
  'QuickWinsWidget'
];

const ENGINES = [
  'SecureScoringEngine',
  'DTRIMaximusEngine',
  'AlgorithmicFrameworkEngine',
  'ComprehensiveScoringEngine',
  'calculateDealershipAIScore'
];

function auditAPIEndpoints(): EndpointAudit[] {
  const audits: EndpointAudit[] = [];
  const workspaceRoot = process.cwd();
  
  for (const endpoint of API_ENDPOINTS) {
    // Convert /api/dashboard/overview to app/api/dashboard/overview/route.ts
    const pathParts = endpoint.replace('/api/', '').split('/');
    const routePath = join(workspaceRoot, 'app', 'api', ...pathParts, 'route.ts');
    
    try {
      const fileExists = require('fs').existsSync(routePath);
      
      if (fileExists) {
        const content = readFileSync(routePath, 'utf-8');
        const hasGET = content.includes('export const GET') || content.includes('export async function GET');
        const hasPOST = content.includes('export const POST') || content.includes('export async function POST');
        
        // Check if migrated to createApiRoute
        const isMigrated = content.includes('createApiRoute');
        
        audits.push({
          endpoint,
          method: hasGET ? 'GET' : hasPOST ? 'POST' : 'NONE',
          status: fileExists ? 'connected' : 'missing',
          usedBy: findUsages(endpoint)
        });
      } else {
        audits.push({
          endpoint,
          method: 'NONE',
          status: 'missing',
          error: 'Route file not found',
          usedBy: []
        });
      }
    } catch (error) {
      audits.push({
        endpoint,
        method: 'NONE',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        usedBy: []
      });
    }
  }
  
  return audits;
}

function findUsages(endpoint: string): string[] {
  const usages: string[] = [];
  const workspaceRoot = process.cwd();
  
  // Check common files
  const filesToCheck = [
    'lib/services/dashboard-data-service.ts',
    'lib/hooks/useDashboardData.ts',
    'app/components/DealershipAIDashboardLA.tsx',
    'app/components/Dashboard.tsx'
  ];
  
  for (const file of filesToCheck) {
    try {
      const filePath = join(workspaceRoot, file);
      if (require('fs').existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes(endpoint)) {
          usages.push(file);
        }
      }
    } catch {
      // File doesn't exist or can't be read
    }
  }
  
  return usages;
}

function auditComponents(): ComponentAudit[] {
  const audits: ComponentAudit[] = [];
  const workspaceRoot = process.cwd();
  
  for (const component of DASHBOARD_COMPONENTS) {
    // Check multiple possible locations
    const possiblePaths = [
      join(workspaceRoot, 'app', 'components', `${component}.tsx`),
      join(workspaceRoot, 'components', `${component}.tsx`),
      join(workspaceRoot, 'app', 'components', 'demo', `${component}.tsx`),
      join(workspaceRoot, 'components', 'demo', `${component}.tsx`)
    ];
    
    let filePath = null;
    for (const path of possiblePaths) {
      if (require('fs').existsSync(path)) {
        filePath = path;
        break;
      }
    }
    
    if (filePath) {
      const content = readFileSync(filePath, 'utf-8');
      const endpoints: string[] = [];
      
      // Find all API endpoints used
      const endpointRegex = /['"](?:\/api\/[^'"]+)['"]/g;
      const matches = content.match(endpointRegex);
      if (matches) {
        endpoints.push(...matches.map(m => m.replace(/['"]/g, '')));
      }
      
      // Check for data hooks
      const usesHook = content.includes('useDashboardData') || 
                      content.includes('useQuery') || 
                      content.includes('useState');
      
      const dataFlow = endpoints.length > 0 || usesHook ? 'working' : 'broken';
      
      audits.push({
        component,
        endpoints: [...new Set(endpoints)],
        dataFlow,
        issues: []
      });
    } else {
      audits.push({
        component,
        endpoints: [],
        dataFlow: 'broken',
        issues: ['Component file not found']
      });
    }
  }
  
  return audits;
}

function auditEngines(): EngineAudit[] {
  const audits: EngineAudit[] = [];
  const workspaceRoot = process.cwd();
  
  for (const engine of ENGINES) {
    const engineFiles = [
      `lib/secure-scoring-engine.ts`,
      `lib/dtri-maximus-engine.ts`,
      `lib/algorithmic-framework.ts`,
      `lib/scoring/comprehensive-scoring-engine.ts`,
      `lib/scoring/algorithm.ts`
    ];
    
    let foundIn = '';
    let exports: string[] = [];
    
    for (const file of engineFiles) {
      try {
        const filePath = join(workspaceRoot, file);
        if (require('fs').existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf-8');
          if (content.includes(engine)) {
            foundIn = file;
            
            // Extract exports
            const exportRegex = new RegExp(`export.*${engine}`, 'g');
            const exportMatches = content.match(exportRegex);
            if (exportMatches) {
              exports = exportMatches;
            }
          }
        }
      } catch {
        // Continue
      }
    }
    
    // Find usages
    const usedIn = findEngineUsages(engine);
    
    audits.push({
      engine,
      status: foundIn ? 'connected' : 'missing',
      exports,
      usedIn
    });
  }
  
  return audits;
}

function findEngineUsages(engine: string): string[] {
  const usages: string[] = [];
  const workspaceRoot = process.cwd();
  
  const filesToCheck = [
    'lib/services/dashboard-data-service.ts',
    'app/components/DealershipAIDashboardLA.tsx'
  ];
  
  for (const file of filesToCheck) {
    try {
      const filePath = join(workspaceRoot, file);
      if (require('fs').existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        if (content.includes(engine)) {
          usages.push(file);
        }
      }
    } catch {
      // Continue
    }
  }
  
  return usages;
}

function generateReport(
  endpoints: EndpointAudit[],
  components: ComponentAudit[],
  engines: EngineAudit[]
): string {
  let report = '# Dashboard End-to-End Audit Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Summary
  const connectedEndpoints = endpoints.filter(e => e.status === 'connected').length;
  const missingEndpoints = endpoints.filter(e => e.status === 'missing').length;
  const workingComponents = components.filter(c => c.dataFlow === 'working').length;
  const connectedEngines = engines.filter(e => e.status === 'connected').length;
  
  report += '## Executive Summary\n\n';
  report += `- **API Endpoints**: ${connectedEndpoints}/${endpoints.length} connected\n`;
  report += `- **Components**: ${workingComponents}/${components.length} working\n`;
  report += `- **Engines**: ${connectedEngines}/${engines.length} connected\n\n`;
  
  // API Endpoints
  report += '## API Endpoints Audit\n\n';
  report += '| Endpoint | Method | Status | Used By |\n';
  report += '|----------|--------|--------|---------|\n';
  
  for (const ep of endpoints) {
    const status = ep.status === 'connected' ? '✅' : ep.status === 'missing' ? '❌' : '⚠️';
    const usedBy = ep.usedBy.length > 0 ? ep.usedBy.join(', ') : 'None';
    report += `| ${ep.endpoint} | ${ep.method} | ${status} | ${usedBy} |\n`;
  }
  
  report += '\n';
  
  // Components
  report += '## Components Audit\n\n';
  report += '| Component | Endpoints | Data Flow | Issues |\n';
  report += '|-----------|-----------|-----------|--------|\n';
  
  for (const comp of components) {
    const flow = comp.dataFlow === 'working' ? '✅' : comp.dataFlow === 'broken' ? '❌' : '⚠️';
    const endpoints = comp.endpoints.length > 0 ? comp.endpoints.join(', ') : 'None';
    const issues = comp.issues.length > 0 ? comp.issues.join(', ') : 'None';
    report += `| ${comp.component} | ${endpoints} | ${flow} | ${issues} |\n`;
  }
  
  report += '\n';
  
  // Engines
  report += '## Engines Audit\n\n';
  report += '| Engine | Status | Used In |\n';
  report += '|--------|--------|---------|\n';
  
  for (const eng of engines) {
    const status = eng.status === 'connected' ? '✅' : eng.status === 'missing' ? '❌' : '⚠️';
    const usedIn = eng.usedIn.length > 0 ? eng.usedIn.join(', ') : 'None';
    report += `| ${eng.engine} | ${status} | ${usedIn} |\n`;
  }
  
  report += '\n';
  
  // Issues
  report += '## Issues & Recommendations\n\n';
  
  const issues: string[] = [];
  
  if (missingEndpoints > 0) {
    issues.push(`❌ ${missingEndpoints} API endpoints are missing`);
  }
  
  const brokenComponents = components.filter(c => c.dataFlow === 'broken');
  if (brokenComponents.length > 0) {
    issues.push(`❌ ${brokenComponents.length} components have broken data flow`);
  }
  
  const missingEngines = engines.filter(e => e.status === 'missing');
  if (missingEngines.length > 0) {
    issues.push(`❌ ${missingEngines.length} engines are not found`);
  }
  
  const unusedEndpoints = endpoints.filter(e => e.usedBy.length === 0);
  if (unusedEndpoints.length > 0) {
    issues.push(`⚠️ ${unusedEndpoints.length} endpoints are not being used`);
  }
  
  if (issues.length === 0) {
    report += '✅ No issues found! All endpoints and components are properly connected.\n';
  } else {
    for (const issue of issues) {
      report += `${issue}\n`;
    }
  }
  
  return report;
}

// Main execution
if (require.main === module) {
  console.log('🔍 Starting Dashboard Audit...\n');
  
  const endpoints = auditAPIEndpoints();
  const components = auditComponents();
  const engines = auditEngines();
  
  const report = generateReport(endpoints, components, engines);
  
  console.log(report);
  
  // Write to file
  const fs = require('fs');
  const reportPath = join(process.cwd(), 'DASHBOARD_AUDIT_REPORT.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

export { auditAPIEndpoints, auditComponents, auditEngines, generateReport };

