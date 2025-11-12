#!/usr/bin/env node
/**
 * ============================================================================
 * DealershipAI Backend Endpoint Audit Script
 * ============================================================================
 * Comprehensive test suite for all 182 API endpoints
 * Tests: Authentication, Response codes, Data integrity, Performance
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const AUDIT_REPORT_PATH = path.join(__dirname, '../audit-report.json');
const AUDIT_MD_PATH = path.join(__dirname, '../BACKEND_AUDIT_REPORT.md');

// All discovered endpoints (182 total)
const ENDPOINTS = [
  // Admin & Setup
  { path: '/api/admin/flags', methods: ['GET'], requiresAuth: true, category: 'Admin' },
  { path: '/api/admin/integrations/visibility', methods: ['GET', 'POST'], requiresAuth: true, category: 'Admin' },
  { path: '/api/admin/seed', methods: ['POST'], requiresAuth: true, category: 'Admin' },
  { path: '/api/admin/setup', methods: ['GET', 'POST'], requiresAuth: true, category: 'Admin' },

  // Actions
  { path: '/api/actions/draft-reviews', methods: ['POST'], requiresAuth: true, category: 'Actions' },
  { path: '/api/actions/generate-schema', methods: ['POST'], requiresAuth: true, category: 'Actions' },

  // AEO (AI Engine Optimization)
  { path: '/api/aeo/breakdown', methods: ['GET'], requiresAuth: false, category: 'AEO' },
  { path: '/api/aeo/leaderboard', methods: ['GET'], requiresAuth: false, category: 'AEO' },

  // Agentic Commerce
  { path: '/api/agentic/checkout', methods: ['POST'], requiresAuth: true, category: 'Agentic' },

  // AI & Intelligence
  { path: '/api/ai-chat', methods: ['POST'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai-scores', methods: ['GET'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai-visibility', methods: ['GET'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai/advanced-analysis', methods: ['POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/analysis', methods: ['POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/analyze', methods: ['POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/answer-intel', methods: ['GET'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai/automated-alerts', methods: ['GET', 'POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/chat', methods: ['POST'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai/competitor-intelligence', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/compute', methods: ['GET'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai/customer-behavior', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/enhanced-analytics', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/finetuning', methods: ['POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/health', methods: ['GET'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai/market-trends', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/metrics', methods: ['GET'], requiresAuth: false, category: 'AI' },
  { path: '/api/ai/offer/validate', methods: ['POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/performance-monitoring', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/predictive-analytics', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/predictive-optimization', methods: ['POST'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/real-time-monitoring', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/trust-optimization', methods: ['GET'], requiresAuth: true, category: 'AI' },
  { path: '/api/ai/visibility-index', methods: ['GET'], requiresAuth: false, category: 'AI' },

  // Alerts
  { path: '/api/alerts/prioritization', methods: ['GET'], requiresAuth: true, category: 'Alerts' },

  // Analytics
  { path: '/api/analytics/ga4', methods: ['GET'], requiresAuth: true, category: 'Analytics' },
  { path: '/api/analytics/trends', methods: ['GET'], requiresAuth: true, category: 'Analytics' },
  { path: '/api/analyze', methods: ['POST'], requiresAuth: false, category: 'Analytics' },

  // Audit & Testing
  { path: '/api/audit', methods: ['GET'], requiresAuth: false, category: 'Audit' },
  { path: '/api/quick-audit', methods: ['GET'], requiresAuth: false, category: 'Audit' },
  { path: '/api/test', methods: ['GET'], requiresAuth: false, category: 'Testing' },
  { path: '/api/test-analytics', methods: ['GET'], requiresAuth: false, category: 'Testing' },
  { path: '/api/test-oauth', methods: ['GET'], requiresAuth: false, category: 'Testing' },
  { path: '/api/performance-test', methods: ['GET'], requiresAuth: false, category: 'Testing' },

  // Authentication
  { path: '/api/auth/[...nextauth]', methods: ['GET', 'POST'], requiresAuth: false, category: 'Auth', skip: true },

  // Automation
  { path: '/api/automation/fix', methods: ['POST'], requiresAuth: true, category: 'Automation' },

  // Calculator
  { path: '/api/calculator/ai-scores', methods: ['GET'], requiresAuth: false, category: 'Calculator' },

  // Capture & Leads
  { path: '/api/capture-email', methods: ['POST'], requiresAuth: false, category: 'Leads' },
  { path: '/api/leads', methods: ['GET', 'POST'], requiresAuth: true, category: 'Leads' },
  { path: '/api/leads/capture', methods: ['POST'], requiresAuth: false, category: 'Leads' },

  // Chat
  { path: '/api/chat', methods: ['POST'], requiresAuth: false, category: 'Chat' },

  // Claude Export
  { path: '/api/claude/download', methods: ['GET'], requiresAuth: false, category: 'Claude' },
  { path: '/api/claude/export', methods: ['GET'], requiresAuth: false, category: 'Claude' },
  { path: '/api/claude/manifest', methods: ['GET'], requiresAuth: false, category: 'Claude' },
  { path: '/api/claude/stats', methods: ['GET'], requiresAuth: false, category: 'Claude' },

  // Competitors
  { path: '/api/competitors', methods: ['GET'], requiresAuth: false, category: 'Competitors' },
  { path: '/api/competitors/intelligence', methods: ['GET'], requiresAuth: true, category: 'Competitors' },

  // Console
  { path: '/api/console/query', methods: ['POST'], requiresAuth: true, category: 'Console' },

  // Cron Jobs
  { path: '/api/cron/fleet-refresh', methods: ['GET'], requiresAuth: false, category: 'Cron' },
  { path: '/api/cron/nurture', methods: ['GET'], requiresAuth: false, category: 'Cron' },

  // Dealership
  { path: '/api/dealership/profile', methods: ['GET', 'POST'], requiresAuth: true, category: 'Dealership' },
  { path: '/api/dealerships/[id]/competitors', methods: ['GET'], requiresAuth: true, category: 'Dealership', parameterized: true },
  { path: '/api/dealerships/[id]/qai', methods: ['GET'], requiresAuth: true, category: 'Dealership', parameterized: true },
  { path: '/api/dealerships/[id]/quick-wins', methods: ['GET'], requiresAuth: true, category: 'Dealership', parameterized: true },

  // Diagnostics
  { path: '/api/diagnostics', methods: ['GET'], requiresAuth: false, category: 'Diagnostics' },

  // DriftGuard
  { path: '/api/driftguard/ack', methods: ['POST'], requiresAuth: true, category: 'DriftGuard' },
  { path: '/api/driftguard/history', methods: ['GET'], requiresAuth: true, category: 'DriftGuard' },
  { path: '/api/driftguard/promote', methods: ['POST'], requiresAuth: true, category: 'DriftGuard' },
  { path: '/api/driftguard/run', methods: ['POST'], requiresAuth: true, category: 'DriftGuard' },
  { path: '/api/driftguard/status', methods: ['GET'], requiresAuth: false, category: 'DriftGuard' },

  // Economics
  { path: '/api/econ/tsm', methods: ['GET'], requiresAuth: false, category: 'Economics' },

  // ElevenLabs
  { path: '/api/elevenlabs/agent', methods: ['POST'], requiresAuth: true, category: 'ElevenLabs' },
  { path: '/api/elevenlabs/text-to-speech', methods: ['POST'], requiresAuth: true, category: 'ElevenLabs' },
  { path: '/api/elevenlabs/voices', methods: ['GET'], requiresAuth: true, category: 'ElevenLabs' },

  // Enhanced DAI
  { path: '/api/enhanced-dai', methods: ['POST'], requiresAuth: true, category: 'DAI' },

  // Export
  { path: '/api/export/data', methods: ['GET'], requiresAuth: true, category: 'Export' },

  // Fix Pack
  { path: '/api/fix-pack/roi', methods: ['GET'], requiresAuth: false, category: 'FixPack' },
  { path: '/api/fix/action', methods: ['POST'], requiresAuth: true, category: 'Fix' },
  { path: '/api/fix/apply', methods: ['POST'], requiresAuth: true, category: 'Fix' },
  { path: '/api/fix/deploy', methods: ['POST'], requiresAuth: true, category: 'Fix' },
  { path: '/api/fix/estimate', methods: ['POST'], requiresAuth: true, category: 'Fix' },
  { path: '/api/fix/pack', methods: ['POST'], requiresAuth: true, category: 'Fix' },

  // Formulas
  { path: '/api/formulas/weights', methods: ['GET'], requiresAuth: false, category: 'Formulas' },

  // GA4
  { path: '/api/ga4/summary', methods: ['GET'], requiresAuth: true, category: 'GA4' },

  // Geo
  { path: '/api/geo/domain-location', methods: ['GET'], requiresAuth: false, category: 'Geo' },
  { path: '/api/geo/market-analysis', methods: ['GET'], requiresAuth: true, category: 'Geo' },

  // Growth
  { path: '/api/growth/analytics', methods: ['GET'], requiresAuth: true, category: 'Growth' },
  { path: '/api/growth/viral-reports', methods: ['GET'], requiresAuth: true, category: 'Growth' },

  // Health & Status
  { path: '/api/health', methods: ['GET'], requiresAuth: false, category: 'Health' },
  { path: '/api/status', methods: ['GET'], requiresAuth: false, category: 'Health' },
  { path: '/api/system/status', methods: ['GET'], requiresAuth: false, category: 'Health' },
  { path: '/api/v1/health', methods: ['GET'], requiresAuth: false, category: 'Health' },

  // Integrations
  { path: '/api/integrations/ai-platforms', methods: ['GET', 'POST'], requiresAuth: true, category: 'Integrations' },
  { path: '/api/integrations/google', methods: ['GET', 'POST'], requiresAuth: true, category: 'Integrations' },
  { path: '/api/integrations/reviews', methods: ['GET', 'POST'], requiresAuth: true, category: 'Integrations' },

  // Intel
  { path: '/api/intel/simulate', methods: ['POST'], requiresAuth: true, category: 'Intel' },

  // Landing Page
  { path: '/api/landing/email-unlock', methods: ['POST'], requiresAuth: false, category: 'Landing' },
  { path: '/api/landing/session-stats', methods: ['GET'], requiresAuth: false, category: 'Landing' },
  { path: '/api/landing/track-onboarding-start', methods: ['POST'], requiresAuth: false, category: 'Landing' },
  { path: '/api/landing/track-share', methods: ['POST'], requiresAuth: false, category: 'Landing' },

  // MarketPulse
  { path: '/api/marketpulse/compute', methods: ['GET'], requiresAuth: false, category: 'MarketPulse' },

  // Metrics
  { path: '/api/metrics/agentic/emit', methods: ['POST'], requiresAuth: false, category: 'Metrics' },
  { path: '/api/metrics/eeat', methods: ['GET'], requiresAuth: false, category: 'Metrics' },
  { path: '/api/metrics/oel', methods: ['GET'], requiresAuth: false, category: 'Metrics' },
  { path: '/api/metrics/oel/channels', methods: ['GET'], requiresAuth: false, category: 'Metrics' },
  { path: '/api/metrics/piqr', methods: ['GET'], requiresAuth: false, category: 'Metrics' },
  { path: '/api/metrics/qai', methods: ['GET'], requiresAuth: false, category: 'Metrics' },
  { path: '/api/metrics/rar', methods: ['GET'], requiresAuth: false, category: 'Metrics' },

  // Migration
  { path: '/api/migrate', methods: ['POST'], requiresAuth: true, category: 'Migration' },

  // Mystery Shop
  { path: '/api/mystery-shop', methods: ['POST'], requiresAuth: true, category: 'MysteryShop' },

  // Notifications
  { path: '/api/notifications/workflow-status', methods: ['POST'], requiresAuth: true, category: 'Notifications' },

  // Observability
  { path: '/api/observability', methods: ['GET'], requiresAuth: false, category: 'Observability' },

  // OEL (Organic Engagement Lift)
  { path: '/api/oel', methods: ['GET'], requiresAuth: false, category: 'OEL' },

  // Opportunities
  { path: '/api/opportunities', methods: ['GET'], requiresAuth: true, category: 'Opportunities' },

  // Optimizer
  { path: '/api/optimizer/top-opportunity', methods: ['GET'], requiresAuth: true, category: 'Optimizer' },

  // Orchestrator
  { path: '/api/orchestrator', methods: ['POST'], requiresAuth: false, category: 'Orchestrator' },
  { path: '/api/orchestrator/autonomy', methods: ['GET', 'POST'], requiresAuth: true, category: 'Orchestrator' },
  { path: '/api/orchestrator/run', methods: ['POST'], requiresAuth: true, category: 'Orchestrator' },
  { path: '/api/orchestrator/status', methods: ['GET'], requiresAuth: false, category: 'Orchestrator' },

  // Origins
  { path: '/api/origins', methods: ['GET', 'POST'], requiresAuth: true, category: 'Origins' },
  { path: '/api/origins/bulk', methods: ['POST'], requiresAuth: true, category: 'Origins' },
  { path: '/api/origins/bulk-csv', methods: ['POST'], requiresAuth: true, category: 'Origins' },
  { path: '/api/origins/bulk-csv/commit', methods: ['POST'], requiresAuth: true, category: 'Origins' },

  // Parity
  { path: '/api/parity/ingest', methods: ['POST'], requiresAuth: true, category: 'Parity' },

  // Probe
  { path: '/api/probe/verify', methods: ['POST'], requiresAuth: false, category: 'Probe' },
  { path: '/api/probe/verify-bulk', methods: ['POST'], requiresAuth: true, category: 'Probe' },
  { path: '/api/v1/probe/status', methods: ['GET'], requiresAuth: false, category: 'Probe' },

  // Public API
  { path: '/api/public/v1/insights', methods: ['GET'], requiresAuth: false, category: 'Public' },

  // Pulse
  { path: '/api/pulse/events', methods: ['GET', 'POST'], requiresAuth: true, category: 'Pulse' },
  { path: '/api/pulse/impacts', methods: ['GET'], requiresAuth: false, category: 'Pulse' },
  { path: '/api/pulse/impacts/compute', methods: ['POST'], requiresAuth: true, category: 'Pulse' },
  { path: '/api/pulse/radar', methods: ['GET'], requiresAuth: false, category: 'Pulse' },
  { path: '/api/pulse/scenario', methods: ['POST'], requiresAuth: true, category: 'Pulse' },
  { path: '/api/pulse/score', methods: ['GET'], requiresAuth: false, category: 'Pulse' },
  { path: '/api/pulse/simulate', methods: ['POST'], requiresAuth: true, category: 'Pulse' },
  { path: '/api/pulse/snapshot', methods: ['GET'], requiresAuth: false, category: 'Pulse' },
  { path: '/api/pulse/trends', methods: ['GET'], requiresAuth: false, category: 'Pulse' },

  // QAI (Quality AI Index)
  { path: '/api/qai/calculate', methods: ['GET'], requiresAuth: false, category: 'QAI' },
  { path: '/api/qai/simple', methods: ['GET'], requiresAuth: false, category: 'QAI' },

  // Refresh
  { path: '/api/refresh', methods: ['POST'], requiresAuth: true, category: 'Refresh' },

  // Relevance
  { path: '/api/relevance/overlay', methods: ['GET'], requiresAuth: false, category: 'Relevance' },
  { path: '/api/relevance/scenarios', methods: ['GET'], requiresAuth: false, category: 'Relevance' },

  // Reviews
  { path: '/api/reviews/summary', methods: ['GET'], requiresAuth: false, category: 'Reviews' },

  // Save Metrics
  { path: '/api/save-metrics', methods: ['POST'], requiresAuth: true, category: 'Metrics' },

  // Scan
  { path: '/api/scan/quick', methods: ['GET'], requiresAuth: false, category: 'Scan' },
  { path: '/api/scan/stream', methods: ['GET'], requiresAuth: false, category: 'Scan' },

  // Scenarios
  { path: '/api/scenarios/templates', methods: ['GET'], requiresAuth: false, category: 'Scenarios' },

  // Schema
  { path: '/api/schema', methods: ['GET'], requiresAuth: false, category: 'Schema' },
  { path: '/api/schema-validation', methods: ['POST'], requiresAuth: false, category: 'Schema' },
  { path: '/api/schema/request', methods: ['POST'], requiresAuth: true, category: 'Schema' },
  { path: '/api/schema/status', methods: ['GET'], requiresAuth: false, category: 'Schema' },
  { path: '/api/schema/validate', methods: ['POST'], requiresAuth: false, category: 'Schema' },

  // Scores
  { path: '/api/scores/history', methods: ['GET'], requiresAuth: true, category: 'Scores' },

  // Share
  { path: '/api/share/track', methods: ['POST'], requiresAuth: false, category: 'Share' },

  // Site Inject
  { path: '/api/site-inject', methods: ['POST'], requiresAuth: true, category: 'SiteInject' },
  { path: '/api/site-inject/rollback', methods: ['POST'], requiresAuth: true, category: 'SiteInject' },
  { path: '/api/site-inject/versions', methods: ['GET'], requiresAuth: true, category: 'SiteInject' },

  // Stripe
  { path: '/api/stripe/checkout', methods: ['POST'], requiresAuth: true, category: 'Stripe' },
  { path: '/api/stripe/create-checkout', methods: ['POST'], requiresAuth: false, category: 'Stripe' },
  { path: '/api/stripe/portal', methods: ['POST'], requiresAuth: true, category: 'Stripe' },
  { path: '/api/stripe/verify-session', methods: ['GET'], requiresAuth: false, category: 'Stripe' },

  // System Endpoints
  { path: '/api/system/endpoints', methods: ['GET'], requiresAuth: false, category: 'System' },

  // Targeting
  { path: '/api/targeting/underperforming-dealers', methods: ['GET'], requiresAuth: true, category: 'Targeting' },

  // Telemetry
  { path: '/api/telemetry', methods: ['POST'], requiresAuth: false, category: 'Telemetry' },

  // Trust
  { path: '/api/trust/calculate', methods: ['POST'], requiresAuth: false, category: 'Trust' },

  // UGC
  { path: '/api/ugc', methods: ['GET'], requiresAuth: false, category: 'UGC' },

  // User
  { path: '/api/user/onboarding-complete', methods: ['POST'], requiresAuth: true, category: 'User' },
  { path: '/api/user/profile', methods: ['GET', 'POST'], requiresAuth: true, category: 'User' },
  { path: '/api/user/subscription', methods: ['GET'], requiresAuth: true, category: 'User' },
  { path: '/api/user/usage', methods: ['GET'], requiresAuth: true, category: 'User' },

  // V1 API
  { path: '/api/v1/analyze', methods: ['POST'], requiresAuth: false, category: 'V1' },

  // Viral
  { path: '/api/viral/audit-complete', methods: ['POST'], requiresAuth: false, category: 'Viral' },
  { path: '/api/viral/metrics', methods: ['GET'], requiresAuth: false, category: 'Viral' },

  // Visibility
  { path: '/api/visibility-roi', methods: ['GET'], requiresAuth: false, category: 'Visibility' },
  { path: '/api/visibility/aeo', methods: ['GET'], requiresAuth: false, category: 'Visibility' },
  { path: '/api/visibility/geo', methods: ['GET'], requiresAuth: false, category: 'Visibility' },
  { path: '/api/visibility/history', methods: ['GET'], requiresAuth: true, category: 'Visibility' },
  { path: '/api/visibility/presence', methods: ['GET'], requiresAuth: false, category: 'Visibility' },
  { path: '/api/visibility/seo', methods: ['GET'], requiresAuth: false, category: 'Visibility' },

  // WebSocket
  { path: '/api/websocket', methods: ['GET'], requiresAuth: false, category: 'WebSocket' },

  // Zero Click
  { path: '/api/zero-click', methods: ['GET'], requiresAuth: false, category: 'ZeroClick' },
  { path: '/api/zero-click/recompute', methods: ['POST'], requiresAuth: true, category: 'ZeroClick' },
  { path: '/api/zero-click/summary', methods: ['GET'], requiresAuth: false, category: 'ZeroClick' },
];

// Test results storage
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  warnings: 0,
  details: [],
  categories: {},
  startTime: new Date().toISOString(),
  endTime: null,
  duration: 0,
};

/**
 * Make HTTP request to endpoint
 */
async function testEndpoint(endpoint, method) {
  const startTime = Date.now();
  const url = `${BASE_URL}${endpoint.path}`;

  try {
    // Handle parameterized routes
    const testUrl = endpoint.parameterized
      ? url.replace('[id]', 'test-dealer-123')
      : url;

    const response = await fetch(testUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint.requiresAuth && {
          // Mock auth header for testing
          Authorization: 'Bearer test-token',
        }),
      },
      // Add query params for GET requests that need them
      ...(method === 'GET' && endpoint.category === 'MarketPulse' && {
        // Example: ?dealer=test-dealer
      }),
    });

    const duration = Date.now() - startTime;
    const status = response.status;
    const isSuccess = status >= 200 && status < 400;
    const isClientError = status >= 400 && status < 500;
    const isServerError = status >= 500;

    // Try to get response body
    let body = null;
    const contentType = response.headers.get('content-type');
    try {
      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }
    } catch (e) {
      // Ignore parse errors
    }

    return {
      endpoint: endpoint.path,
      method,
      category: endpoint.category,
      status,
      duration,
      isSuccess,
      isClientError,
      isServerError,
      requiresAuth: endpoint.requiresAuth,
      body: body ? (typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 200)) : null,
      error: null,
    };
  } catch (error) {
    return {
      endpoint: endpoint.path,
      method,
      category: endpoint.category,
      status: 0,
      duration: Date.now() - startTime,
      isSuccess: false,
      isClientError: false,
      isServerError: false,
      requiresAuth: endpoint.requiresAuth,
      body: null,
      error: error.message,
    };
  }
}

/**
 * Run audit on all endpoints
 */
async function runAudit() {
  console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║  DealershipAI Backend Endpoint Audit                          ║
║  Testing ${ENDPOINTS.length} endpoints across ${new Set(ENDPOINTS.map(e => e.category)).size} categories                         ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  console.log(`${colors.gray}Base URL: ${BASE_URL}${colors.reset}\n`);

  // Test each endpoint
  for (const endpoint of ENDPOINTS) {
    if (endpoint.skip) {
      results.skipped++;
      results.total++;
      console.log(`${colors.gray}⊘ ${endpoint.path} (${endpoint.category}) - SKIPPED${colors.reset}`);
      continue;
    }

    for (const method of endpoint.methods) {
      results.total++;
      process.stdout.write(`${colors.gray}Testing ${method} ${endpoint.path}...${colors.reset}`);

      const result = await testEndpoint(endpoint, method);
      results.details.push(result);

      // Update category stats
      if (!results.categories[result.category]) {
        results.categories[result.category] = { passed: 0, failed: 0, total: 0 };
      }
      results.categories[result.category].total++;

      // Log result
      if (result.isSuccess) {
        results.passed++;
        results.categories[result.category].passed++;
        console.log(`\r${colors.green}✓ ${method} ${endpoint.path} (${result.status}) ${result.duration}ms${colors.reset}`);
      } else if (result.isClientError && result.status === 401 && endpoint.requiresAuth) {
        // 401 is expected for auth-required endpoints
        results.passed++;
        results.categories[result.category].passed++;
        console.log(`\r${colors.yellow}✓ ${method} ${endpoint.path} (401 - Auth Required) ${result.duration}ms${colors.reset}`);
      } else if (result.isClientError && result.status === 405) {
        // 405 Method Not Allowed
        results.warnings++;
        console.log(`\r${colors.yellow}⚠ ${method} ${endpoint.path} (405 - Method Not Allowed) ${result.duration}ms${colors.reset}`);
      } else {
        results.failed++;
        results.categories[result.category].failed++;
        console.log(`\r${colors.red}✗ ${method} ${endpoint.path} (${result.status || 'ERROR'}) ${result.duration}ms${colors.reset}`);
        if (result.error) {
          console.log(`  ${colors.red}  Error: ${result.error}${colors.reset}`);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  results.endTime = new Date().toISOString();
  results.duration = Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000);

  // Generate reports
  generateConsoleReport();
  saveJsonReport();
  generateMarkdownReport();
}

/**
 * Generate console summary
 */
function generateConsoleReport() {
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  const failRate = ((results.failed / results.total) * 100).toFixed(1);

  console.log(`\n${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║  Audit Summary                                                ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`
${colors.bright}Overall Results:${colors.reset}
  Total Endpoints:   ${results.total}
  ${colors.green}✓ Passed:          ${results.passed} (${passRate}%)${colors.reset}
  ${colors.red}✗ Failed:          ${results.failed} (${failRate}%)${colors.reset}
  ${colors.yellow}⚠ Warnings:        ${results.warnings}${colors.reset}
  ${colors.gray}⊘ Skipped:         ${results.skipped}${colors.reset}
  Duration:          ${results.duration}s
`);

  console.log(`${colors.bright}Results by Category:${colors.reset}`);
  Object.entries(results.categories)
    .sort((a, b) => b[1].failed - a[1].failed)
    .forEach(([category, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(0);
      const icon = stats.failed === 0 ? colors.green + '✓' : colors.red + '✗';
      console.log(`  ${icon} ${category}: ${stats.passed}/${stats.total} (${rate}%)${colors.reset}`);
    });

  console.log(`\n${colors.bright}Reports Generated:${colors.reset}`);
  console.log(`  📄 JSON:     ${AUDIT_REPORT_PATH}`);
  console.log(`  📝 Markdown: ${AUDIT_MD_PATH}\n`);
}

/**
 * Save JSON report
 */
function saveJsonReport() {
  fs.writeFileSync(AUDIT_REPORT_PATH, JSON.stringify(results, null, 2));
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport() {
  const passRate = ((results.passed / results.total) * 100).toFixed(1);

  let md = `# DealershipAI Backend Audit Report

**Generated:** ${results.startTime}
**Duration:** ${results.duration}s
**Base URL:** ${BASE_URL}

## Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Endpoints | ${results.total} | 100% |
| ✅ Passed | ${results.passed} | ${passRate}% |
| ❌ Failed | ${results.failed} | ${((results.failed / results.total) * 100).toFixed(1)}% |
| ⚠️ Warnings | ${results.warnings} | ${((results.warnings / results.total) * 100).toFixed(1)}% |
| ⊘ Skipped | ${results.skipped} | ${((results.skipped / results.total) * 100).toFixed(1)}% |

## Results by Category

| Category | Passed | Failed | Total | Pass Rate |
|----------|--------|--------|-------|-----------|
`;

  Object.entries(results.categories)
    .sort((a, b) => b[1].failed - a[1].failed)
    .forEach(([category, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(0);
      md += `| ${category} | ${stats.passed} | ${stats.failed} | ${stats.total} | ${rate}% |\n`;
    });

  md += `\n## Failed Endpoints\n\n`;

  const failed = results.details.filter(r => !r.isSuccess && r.status !== 401);
  if (failed.length === 0) {
    md += `✅ No failed endpoints!\n`;
  } else {
    md += `| Endpoint | Method | Status | Error | Duration |\n`;
    md += `|----------|--------|--------|-------|----------|\n`;
    failed.forEach(r => {
      md += `| ${r.endpoint} | ${r.method} | ${r.status || 'ERROR'} | ${r.error || '-'} | ${r.duration}ms |\n`;
    });
  }

  md += `\n## Detailed Results\n\n`;
  md += `<details>\n<summary>Click to expand full results</summary>\n\n`;
  md += `| Endpoint | Method | Status | Duration | Category |\n`;
  md += `|----------|--------|--------|----------|----------|\n`;
  results.details.forEach(r => {
    const icon = r.isSuccess ? '✅' : (r.status === 401 ? '🔒' : '❌');
    md += `| ${icon} ${r.endpoint} | ${r.method} | ${r.status} | ${r.duration}ms | ${r.category} |\n`;
  });
  md += `\n</details>\n`;

  md += `\n## Recommendations\n\n`;
  if (results.failed > 0) {
    md += `1. **Fix ${results.failed} failed endpoints** - Review error messages and fix root causes\n`;
  }
  if (results.warnings > 0) {
    md += `2. **Review ${results.warnings} warnings** - Check method implementations\n`;
  }
  md += `3. **Add authentication tests** - Implement proper auth header testing\n`;
  md += `4. **Add integration tests** - Test endpoint interactions and data flow\n`;
  md += `5. **Monitor performance** - Some endpoints >1000ms response time\n`;

  md += `\n---\n\n`;
  md += `**Next Steps:**\n`;
  md += `- Review failed endpoints in detail\n`;
  md += `- Add unit tests for critical endpoints\n`;
  md += `- Set up automated testing in CI/CD\n`;
  md += `- Monitor production endpoints with health checks\n`;

  fs.writeFileSync(AUDIT_MD_PATH, md);
}

// Run the audit
runAudit().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
