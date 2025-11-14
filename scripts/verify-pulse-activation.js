#!/usr/bin/env node
/**
 * Pulse Dashboard Activation Verifier
 * Checks all components and provides activation status
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const checks = {
  components: [],
  apis: [],
  config: [],
  errors: []
};

// Check components
const componentChecks = [
  { path: 'app/(dashboard)/pulse/page.tsx', name: 'Pulse Dashboard Page' },
  { path: 'app/components/pulse/PulseInbox.tsx', name: 'PulseInbox Component' },
  { path: 'app/components/pulse/InboxHeader.tsx', name: 'InboxHeader Component' },
  { path: 'app/components/pulse/ThreadDrawer.tsx', name: 'ThreadDrawer Component' },
];

componentChecks.forEach(check => {
  const exists = fs.existsSync(check.path);
  checks.components.push({ name: check.name, exists, path: check.path });
});

// Check API routes
const apiChecks = [
  { path: 'app/api/pulse/route.ts', name: 'Main Pulse API' },
  { path: 'app/api/pulse/snapshot/route.ts', name: 'Pulse Snapshot API' },
  { path: 'app/api/pulse/trends/route.ts', name: 'Pulse Trends API' },
  { path: 'app/api/pulse/inbox/push/route.ts', name: 'Pulse Inbox Push API' },
  { path: 'app/api/pulse-session-init/route.ts', name: 'Pulse Session Init' },
];

apiChecks.forEach(check => {
  const exists = fs.existsSync(check.path);
  checks.apis.push({ name: check.name, exists, path: check.path });
});

// Check config files
const configChecks = [
  { path: 'middleware.ts', name: 'Middleware (Clerk auth)' },
  { path: 'app/(dashboard)/layout.tsx', name: 'Dashboard Layout' },
  { path: 'lib/redis.ts', name: 'Redis Client' },
  { path: 'lib/pulse/registry.ts', name: 'Pulse Registry' },
];

configChecks.forEach(check => {
  const exists = fs.existsSync(check.path);
  checks.config.push({ name: check.name, exists, path: check.path });
});

// Print results
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}🚀 Pulse Dashboard Activation Status${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

// Components
console.log(`${YELLOW}Components:${RESET}`);
checks.components.forEach(item => {
  const status = item.exists ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
  console.log(`  ${status} ${item.name}`);
  if (!item.exists) checks.errors.push(`Missing: ${item.path}`);
});
console.log('');

// APIs
console.log(`${YELLOW}API Routes:${RESET}`);
checks.apis.forEach(item => {
  const status = item.exists ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
  console.log(`  ${status} ${item.name}`);
  if (!item.exists) checks.errors.push(`Missing: ${item.path}`);
});
console.log('');

// Config
console.log(`${YELLOW}Configuration:${RESET}`);
checks.config.forEach(item => {
  const status = item.exists ? `${GREEN}✅${RESET}` : `${YELLOW}⚠️${RESET}`;
  console.log(`  ${status} ${item.name}`);
  if (!item.exists) checks.errors.push(`Missing: ${item.path}`);
});
console.log('');

// Summary
const totalChecks = checks.components.length + checks.apis.length + checks.config.length;
const passedChecks = [
  ...checks.components,
  ...checks.apis,
  ...checks.config
].filter(c => c.exists).length;

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}Summary: ${passedChecks}/${totalChecks} checks passed${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

if (checks.errors.length === 0) {
  console.log(`${GREEN}✅ Pulse Dashboard is ready for activation!${RESET}\n`);
  console.log(`${YELLOW}Next Steps:${RESET}`);
  console.log(`  1. Set environment variables in Vercel`);
  console.log(`  2. Deploy: ${GREEN}vercel --prod${RESET}`);
  console.log(`  3. Visit: ${GREEN}https://dash.dealershipai.com/pulse${RESET}`);
  console.log(`  4. Test: ${GREEN}./scripts/test-pulse-dashboard.sh${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}❌ Missing components detected:${RESET}`);
  checks.errors.forEach(err => console.log(`  - ${err}`));
  console.log(`\n${YELLOW}Please create missing files before activation.${RESET}\n`);
  process.exit(1);
}

