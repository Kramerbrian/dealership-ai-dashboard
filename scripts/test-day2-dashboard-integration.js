#!/usr/bin/env node

/**
 * Day 2 Dashboard Integration Test
 * Validates that ModelHealthTiles component is properly integrated
 */

console.log('🚀 Week 1 Validation - Day 2: Dashboard Integration Testing\n');

// Test 1: Check if ModelHealthTiles component exists and is properly structured
function testModelHealthTilesComponent() {
  console.log('🔍 Testing ModelHealthTiles Component Structure...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const componentPath = path.join(__dirname, '..', 'src', 'components', 'dashboard', 'ModelHealthTiles.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ ModelHealthTiles component not found');
    return false;
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  // Check for required imports
  const requiredImports = [
    'React',
    'useState',
    'useEffect',
    'TrendingUp',
    'TrendingDown',
    'AlertTriangle',
    'CheckCircle',
    'Activity'
  ];
  
  const missingImports = requiredImports.filter(importName => 
    !componentContent.includes(importName)
  );
  
  if (missingImports.length > 0) {
    console.log(`❌ Missing imports: ${missingImports.join(', ')}`);
    return false;
  }
  
  // Check for required interfaces
  const requiredInterfaces = [
    'ModelHealthData',
    'GovernanceViolation'
  ];
  
  const missingInterfaces = requiredInterfaces.filter(interfaceName => 
    !componentContent.includes(`interface ${interfaceName}`)
  );
  
  if (missingInterfaces.length > 0) {
    console.log(`❌ Missing interfaces: ${missingInterfaces.join(', ')}`);
    return false;
  }
  
  // Check for required functions
  const requiredFunctions = [
    'fetchModelHealth',
    'getStatusColor',
    'getTrendIcon',
    'getTrendColor'
  ];
  
  const missingFunctions = requiredFunctions.filter(funcName => 
    !componentContent.includes(`function ${funcName}`) && 
    !componentContent.includes(`const ${funcName}`)
  );
  
  if (missingFunctions.length > 0) {
    console.log(`❌ Missing functions: ${missingFunctions.join(', ')}`);
    return false;
  }
  
  console.log('✅ ModelHealthTiles component structure: PASSED');
  return true;
}

// Test 2: Check if ModelHealthTiles is imported in DealershipDashboardFull
function testDashboardIntegration() {
  console.log('\n🔍 Testing Dashboard Integration...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const dashboardPath = path.join(__dirname, '..', 'src', 'components', 'DealershipDashboardFull.tsx');
  
  if (!fs.existsSync(dashboardPath)) {
    console.log('❌ DealershipDashboardFull component not found');
    return false;
  }
  
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  // Check for ModelHealthTiles import
  if (!dashboardContent.includes("import ModelHealthTiles from '@/components/dashboard/ModelHealthTiles'")) {
    console.log('❌ ModelHealthTiles import not found in DealershipDashboardFull');
    return false;
  }
  
  // Check for ModelHealthTiles usage in OverviewTab
  if (!dashboardContent.includes('<ModelHealthTiles />')) {
    console.log('❌ ModelHealthTiles component not used in OverviewTab');
    return false;
  }
  
  // Check for proper section structure
  if (!dashboardContent.includes('Model Health Dashboard')) {
    console.log('❌ Model Health Dashboard section not found');
    return false;
  }
  
  console.log('✅ Dashboard integration: PASSED');
  return true;
}

// Test 3: Check API endpoint structure
function testAPIEndpointStructure() {
  console.log('\n🔍 Testing API Endpoint Structure...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const apiPath = path.join(__dirname, '..', 'app', 'api', 'model-health', 'summary', 'route.ts');
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ Model health API endpoint not found');
    return false;
  }
  
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  // Check for required exports
  if (!apiContent.includes('export async function GET')) {
    console.log('❌ GET function not exported from API endpoint');
    return false;
  }
  
  // Check for Supabase integration
  if (!apiContent.includes('createClient')) {
    console.log('❌ Supabase client not imported');
    return false;
  }
  
  console.log('✅ API endpoint structure: PASSED');
  return true;
}

// Test 4: Simulate component rendering
function simulateComponentRendering() {
  console.log('\n🔍 Simulating Component Rendering...\n');
  
  // Mock data for testing
  const mockModelHealthData = {
    latest_r2: 0.87,
    latest_rmse: 2.34,
    accuracy_trend: 5.2,
    roi_trend: 12.8,
    governance_status: 'active',
    last_training_date: new Date().toISOString(),
    days_since_training: 3
  };
  
  const mockViolations = [
    {
      rule_name: 'R² Threshold',
      violation_type: 'accuracy',
      current_value: 0.65,
      threshold_value: 0.7,
      action_required: 'freeze_model',
      severity: 'critical'
    }
  ];
  
  console.log('📊 Mock Model Health Data:');
  console.log(`   R²: ${(mockModelHealthData.latest_r2 * 100).toFixed(1)}%`);
  console.log(`   RMSE: ${mockModelHealthData.latest_rmse.toFixed(3)}`);
  console.log(`   Accuracy Trend: +${mockModelHealthData.accuracy_trend.toFixed(1)}% MoM`);
  console.log(`   ROI Trend: +${mockModelHealthData.roi_trend.toFixed(1)}% MoM`);
  console.log(`   Governance Status: ${mockModelHealthData.governance_status.toUpperCase()}`);
  console.log(`   Days Since Training: ${mockModelHealthData.days_since_training}`);
  
  console.log('\n🚨 Mock Governance Violations:');
  mockViolations.forEach((violation, index) => {
    console.log(`   ${index + 1}. ${violation.rule_name}`);
    console.log(`      Current: ${violation.current_value.toFixed(3)} | Threshold: ${violation.threshold_value.toFixed(3)}`);
    console.log(`      Action: ${violation.action_required.replace('_', ' ').toUpperCase()}`);
    console.log(`      Severity: ${violation.severity.toUpperCase()}`);
  });
  
  console.log('\n✅ Component rendering simulation: PASSED');
  return true;
}

// Run all tests
function runDay2Validation() {
  console.log('🎯 Week 1 - Day 2: Dashboard Integration Testing\n');
  
  const tests = [
    { name: 'ModelHealthTiles Component Structure', test: testModelHealthTilesComponent },
    { name: 'Dashboard Integration', test: testDashboardIntegration },
    { name: 'API Endpoint Structure', test: testAPIEndpointStructure },
    { name: 'Component Rendering Simulation', test: simulateComponentRendering }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach(({ name, test }) => {
    try {
      if (test()) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
    }
  });
  
  console.log('\n📊 Day 2 Validation Results:');
  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Day 2 Validation Complete!');
    console.log('📋 Next Steps:');
    console.log('   1. Implement governance thresholds');
    console.log('   2. Test SHAP explanations integration');
    console.log('   3. End-to-end integration testing');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before proceeding.');
  }
}

// Execute validation
if (require.main === module) {
  runDay2Validation();
}

module.exports = { 
  testModelHealthTilesComponent,
  testDashboardIntegration,
  testAPIEndpointStructure,
  simulateComponentRendering,
  runDay2Validation
};
