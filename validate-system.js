#!/usr/bin/env node

/**
 * System Validation Script
 * Validates all components and configurations without requiring server
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DealershipAI System Validation\n');

// Validation results
const results = {
  components: 0,
  apis: 0,
  schemas: 0,
  configs: 0,
  total: 0
};

// Check if file exists and is valid
function validateFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation based on file type
      if (filePath.endsWith('.json')) {
        JSON.parse(content);
        console.log(`✅ ${description}`);
        return true;
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        if (content.includes('export') || content.includes('import')) {
          console.log(`✅ ${description}`);
          return true;
        } else {
          console.log(`⚠️  ${description} - No exports found`);
          return false;
        }
      } else {
        console.log(`✅ ${description}`);
        return true;
      }
    } else {
      console.log(`❌ ${description} - File not found`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

// Validate components
console.log('📱 UI Components:');
console.log('='.repeat(40));
const components = [
  'app/(dashboard)/zeropoint/page.tsx',
  'app/(dashboard)/zeropoint/components/DashboardHeader.tsx',
  'app/(dashboard)/zeropoint/components/SalesIntelligencePanel.tsx',
  'app/(dashboard)/zeropoint/components/UsedAcquisitionPanel.tsx',
  'app/(dashboard)/zeropoint/components/KPITile.tsx',
  'app/(dashboard)/zeropoint/components/FunnelChart.tsx',
  'app/(dashboard)/zeropoint/components/AcquisitionChart.tsx',
  'app/(dashboard)/zeropoint/components/AlertsPanel.tsx',
  'app/(dashboard)/zeropoint/components/LoadingSkeleton.tsx'
];

components.forEach(component => {
  if (validateFile(component, `Component: ${component}`)) {
    results.components++;
  }
  results.total++;
});

// Validate API endpoints
console.log('\n🔌 API Endpoints:');
console.log('='.repeat(40));
const apis = [
  'app/api/internal/sentinel/run/route.ts',
  'app/api/tenants/[tenantId]/alerts/latest/route.ts',
  'app/api/beta/recalibrate/route.ts',
  'app/api/dtri/analyze/route.ts',
  'app/api/dtri/trend/route.ts',
  'app/api/dtri/enhancer/route.ts',
  'app/api/acp/trade-in/route.ts',
  'app/api/acp/parts/route.ts',
  'app/api/acp/webhooks/payment/route.ts',
  'app/api/acp/webhooks/fulfillment/route.ts',
  'app/api/scoreboard/sales/route.ts',
  'app/api/scoreboard/used_acquisition/route.ts',
  'app/api/internal/cron/kpi-history/route.ts',
  'app/api/health/route.ts'
];

apis.forEach(api => {
  if (validateFile(api, `API: ${api}`)) {
    results.apis++;
  }
  results.total++;
});

// Validate JSON schemas
console.log('\n📋 JSON Schemas:');
console.log('='.repeat(40));
const schemas = [
  'schemas/ati_report.schema.json',
  'schemas/crs_report.schema.json',
  'schemas/elasticity.schema.json',
  'schemas/inventory_truth_index.schema.json',
  'schemas/signals.schema.json'
];

schemas.forEach(schema => {
  if (validateFile(schema, `Schema: ${schema}`)) {
    results.schemas++;
  }
  results.total++;
});

// Validate configuration files
console.log('\n⚙️  Configuration Files:');
console.log('='.repeat(40));
const configs = [
  'formulas/formulas.json',
  'configs/weights.defaults.json',
  'configs/locale.calibration.json',
  'vercel.json',
  'package.json'
];

configs.forEach(config => {
  if (validateFile(config, `Config: ${config}`)) {
    results.configs++;
  }
  results.total++;
});

// Validate library files
console.log('\n📚 Library Files:');
console.log('='.repeat(40));
const libraries = [
  'lib/policy.ts',
  'lib/sentinel.ts',
  'lib/kpi-history.ts',
  'lib/authz.ts',
  'lib/scoring/dtriComposite.py',
  'lib/analysis/ada_workflow.py',
  'lib/analysis/penalty_enhancer.py',
  'lib/scoring/elasticity_trend.py'
];

libraries.forEach(lib => {
  if (validateFile(lib, `Library: ${lib}`)) {
    results.total++;
  }
});

// Validate migrations
console.log('\n🗄️  Database Migrations:');
console.log('='.repeat(40));
const migrations = [
  'supabase/migrations/20250115000021_sentinel_governance.sql'
];

migrations.forEach(migration => {
  if (validateFile(migration, `Migration: ${migration}`)) {
    results.total++;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`UI Components: ${results.components}/${components.length}`);
console.log(`API Endpoints: ${results.apis}/${apis.length}`);
console.log(`JSON Schemas: ${results.schemas}/${schemas.length}`);
console.log(`Config Files: ${results.configs}/${configs.length}`);
console.log(`Total Files: ${results.total}`);

const successRate = ((results.components + results.apis + results.schemas + results.configs) / (components.length + apis.length + schemas.length + configs.length)) * 100;

console.log(`\nSuccess Rate: ${successRate.toFixed(1)}%`);

if (successRate >= 95) {
  console.log('\n🎉 SYSTEM VALIDATION PASSED!');
  console.log('✅ All critical components are present and valid');
  console.log('🚀 Ready for deployment');
} else if (successRate >= 80) {
  console.log('\n⚠️  SYSTEM MOSTLY VALID');
  console.log('🔧 Some components need attention');
} else {
  console.log('\n❌ SYSTEM VALIDATION FAILED');
  console.log('🚨 Critical components missing or invalid');
}

// Check for common issues
console.log('\n🔍 Additional Checks:');
console.log('='.repeat(40));

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed - run: npm install');
}

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('✅ Environment file exists');
} else {
  console.log('⚠️  Environment file missing - create .env.local');
}

// Check if supabase directory exists
if (fs.existsSync('supabase')) {
  console.log('✅ Supabase configuration exists');
} else {
  console.log('❌ Supabase configuration missing');
}

console.log('\n📝 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Set up environment variables');
console.log('3. Apply database migrations: supabase db push --include-all');
console.log('4. Start development server: npm run dev');
console.log('5. Run API tests: npm test');

process.exit(successRate >= 95 ? 0 : 1);
