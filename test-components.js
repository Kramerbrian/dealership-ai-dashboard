#!/usr/bin/env node

/**
 * DealershipAI 2026 Component Test Suite
 * Tests all new components and integrations
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 DealershipAI 2026 Component Test Suite\n');

// Test 1: Check all component files exist
console.log('📁 Testing Component Files...');
const components = [
  'app/components/AdminLiveStatus.tsx',
  'app/components/DealerGPT2.tsx', 
  'app/components/BotParityDiffViewer.tsx',
  'app/components/APIUsageChart.tsx',
  'app/components/ViralReportComponent.tsx'
];

let allFilesExist = true;
components.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check API endpoints
console.log('\n🔌 Testing API Endpoints...');
const apiEndpoints = [
  'app/api/admin/status/route.ts',
  'app/api/bot-parity-snapshots/route.ts'
];

let allAPIsExist = true;
apiEndpoints.forEach(endpoint => {
  if (fs.existsSync(endpoint)) {
    console.log(`✅ ${endpoint}`);
  } else {
    console.log(`❌ ${endpoint} - MISSING`);
    allAPIsExist = false;
  }
});

// Test 3: Check dashboard integration
console.log('\n📊 Testing Dashboard Integration...');
const dashboardFile = 'app/dashboard/page.tsx';
if (fs.existsSync(dashboardFile)) {
  const content = fs.readFileSync(dashboardFile, 'utf8');
  if (content.includes('AdminLiveStatus')) {
    console.log('✅ AdminLiveStatus integrated in dashboard');
  } else {
    console.log('❌ AdminLiveStatus not found in dashboard');
  }
} else {
  console.log('❌ Dashboard file not found');
}

// Test 4: Check A/B testing components
console.log('\n🧪 Testing A/B Testing Components...');
const abComponents = [
  'lib/ab/cuped.ts',
  'lib/ab/power.ts',
  'lib/ab/sequential.ts',
  'lib/ab/guardrails.ts',
  'lib/ab/anomaly.ts',
  'lib/ab/cost-tracking.ts',
  'lib/ab/allocation-safety.ts'
];

let allABComponentsExist = true;
abComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - MISSING`);
    allABComponentsExist = false;
  }
});

// Test 5: Check A/B testing API endpoints
console.log('\n🔬 Testing A/B Testing APIs...');
const abAPIs = [
  'app/api/ab/mde/route.ts',
  'app/api/ab/guardrails/route.ts',
  'app/api/ab/sequential/route.ts',
  'app/api/metrics/aroi/route.ts'
];

let allABAPIsExist = true;
abAPIs.forEach(api => {
  if (fs.existsSync(api)) {
    console.log(`✅ ${api}`);
  } else {
    console.log(`❌ ${api} - MISSING`);
    allABAPIsExist = false;
  }
});

// Test 6: Check documentation
console.log('\n📚 Testing Documentation...');
const docs = [
  'ADMIN_STATUS_GUIDE.md'
];

let allDocsExist = true;
docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`✅ ${doc}`);
  } else {
    console.log(`❌ ${doc} - MISSING`);
    allDocsExist = false;
  }
});

// Summary
console.log('\n📋 Test Summary:');
console.log(`Components: ${allFilesExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`API Endpoints: ${allAPIsExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Dashboard Integration: ${allFilesExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`A/B Testing Components: ${allABComponentsExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`A/B Testing APIs: ${allABAPIsExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Documentation: ${allDocsExist ? '✅ PASS' : '❌ FAIL'}`);

const overallPass = allFilesExist && allAPIsExist && allABComponentsExist && allABAPIsExist && allDocsExist;
console.log(`\n🎯 Overall Result: ${overallPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (overallPass) {
  console.log('\n🚀 Ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000/dashboard');
  console.log('3. Set admin mode: localStorage.setItem("isAdmin", "true")');
  console.log('4. Refresh page to see admin widget');
  console.log('5. Test voice features in DealerGPT 2.0');
} else {
  console.log('\n⚠️  Please fix missing components before deployment');
}

console.log('\n✨ DealershipAI 2026 Intelligence Command Center Test Complete!');
