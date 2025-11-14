/**
 * DealershipAI Agent Test Suite
 * Validates canonical GPT stack configuration and runtime
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON configs using fs.readFileSync for compatibility
const agentConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'dai-agent-canonical.json'), 'utf-8')
);
const commerceConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'dai-orchestrator-agentic-commerce.json'), 'utf-8')
);

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean | void): void {
  try {
    const result = fn();
    results.push({
      name,
      passed: result !== false,
      message: result === false ? 'Test returned false' : undefined,
    });
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      message: error.message,
    });
  }
}

// ===== Configuration Validation Tests =====

test('Agent config has required fields', () => {
  const required = ['agent', 'capabilities', 'scoring_framework', 'orchestration'];
  return required.every(field => field in agentConfig);
});

test('Commerce config has required fields', () => {
  const required = ['orchestrator', 'economics', 'intelligence_sources'];
  return required.every(field => field in commerceConfig);
});

test('Agent capabilities are valid', () => {
  return agentConfig.capabilities.length > 0 &&
    agentConfig.capabilities.every((cap: any) =>
      cap.name && cap.description && Array.isArray(cap.tools)
    );
});

test('Economics targets are within range', () => {
  return commerceConfig.economics.target_profit_margin >= 0 &&
    commerceConfig.economics.target_profit_margin <= 1 &&
    commerceConfig.economics.blending_strategy.real_query_rate >= 0 &&
    commerceConfig.economics.blending_strategy.real_query_rate <= 1;
});

test('Platform targets sum to valid weights', () => {
  const totalWeight = Object.values(agentConfig.platform_targets)
    .reduce((sum: number, target: any) => sum + target.visibility_weight, 0);
  return Math.abs(totalWeight - 1.0) < 0.01; // Allow small floating point error
});

test('Caching strategy has valid TTLs', () => {
  return commerceConfig.caching_strategy.layers.every((layer: any) =>
    layer.ttl > 0 && layer.hit_rate_target >= 0 && layer.hit_rate_target <= 1
  );
});

test('Analysis pipeline steps are ordered', () => {
  const priorities = commerceConfig.analysis_pipeline.steps.map((s: any) => s.priority);
  for (let i = 1; i < priorities.length; i++) {
    if (priorities[i] < priorities[i - 1]) return false;
  }
  return true;
});

test('Funnel stages have valid conversion rates', () => {
  return commerceConfig.commerce_funnel.stages.every((stage: any) =>
    stage.conversion_target >= 0 && stage.conversion_target <= 1
  );
});

// ===== File Existence Tests =====

test('Runtime file exists', () => {
  return fs.existsSync(path.join(__dirname, 'dai-agent-runtime.ts'));
});

test('Types file exists', () => {
  return fs.existsSync(path.join(__dirname, 'dai-agent.d.ts'));
});

test('Funnel visual file exists', () => {
  return fs.existsSync(path.join(__dirname, 'funnel-visual.ts'));
});

test('Pulse agent builder file exists', () => {
  return fs.existsSync(path.join(__dirname, 'pulse-agent-builder.ts'));
});

// ===== Runtime Integration Tests =====

test('Agent config version matches', () => {
  return agentConfig.version === commerceConfig.version;
});

test('Monitoring metrics are defined', () => {
  return agentConfig.monitoring.metrics.length > 0 &&
    commerceConfig.monitoring.business_metrics.length > 0;
});

// ===== Print Results =====

console.log('\n🧪 DealershipAI Agent Test Suite');
console.log('================================\n');

let passed = 0;
let failed = 0;

results.forEach(result => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}`);
  if (!result.passed && result.message) {
    console.log(`   Error: ${result.message}`);
  }
  result.passed ? passed++ : failed++;
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
console.log(`   Total: ${results.length} tests\n`);

if (failed > 0) {
  process.exit(1);
}
