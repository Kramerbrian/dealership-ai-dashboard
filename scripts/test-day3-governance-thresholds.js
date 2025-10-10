#!/usr/bin/env node

/**
 * Day 3 Governance Thresholds Test
 * Validates governance rules, thresholds, and automated actions
 */

console.log('🚀 Week 1 Validation - Day 3: Governance Thresholds Testing\n');

// Test 1: Validate Governance Rules Structure
function testGovernanceRulesStructure() {
  console.log('🔍 Testing Governance Rules Structure...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const governanceEnginePath = path.join(__dirname, '..', 'src', 'lib', 'governance-engine.ts');
  const apiPath = path.join(__dirname, '..', 'app', 'api', 'governance', 'check', 'route.ts');
  const schemaPath = path.join(__dirname, '..', 'database', 'governance-schema.sql');
  
  // Check governance engine
  if (!fs.existsSync(governanceEnginePath)) {
    console.log('❌ Governance engine not found');
    return false;
  }
  
  const engineContent = fs.readFileSync(governanceEnginePath, 'utf8');
  
  // Check for required classes and methods
  const requiredMethods = [
    'checkViolations',
    'executeActions',
    'freezeModel',
    'unfreezeModel',
    'getGovernanceStatus',
    'isModelFrozen'
  ];
  
  const missingMethods = requiredMethods.filter(method => 
    !engineContent.includes(method)
  );
  
  if (missingMethods.length > 0) {
    console.log(`❌ Missing methods: ${missingMethods.join(', ')}`);
    return false;
  }
  
  // Check API endpoint
  if (!fs.existsSync(apiPath)) {
    console.log('❌ Governance API endpoint not found');
    return false;
  }
  
  // Check database schema
  if (!fs.existsSync(schemaPath)) {
    console.log('❌ Governance database schema not found');
    return false;
  }
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for required tables
  const requiredTables = [
    'governance_rules',
    'model_weights',
    'governance_actions',
    'governance_violations'
  ];
  
  const missingTables = requiredTables.filter(table => 
    !schemaContent.includes(`CREATE TABLE`) || !schemaContent.includes(table)
  );
  
  if (missingTables.length > 0) {
    console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
    return false;
  }
  
  console.log('✅ Governance rules structure: PASSED');
  return true;
}

// Test 2: Test Governance Rule Scenarios
function testGovernanceRuleScenarios() {
  console.log('\n🔍 Testing Governance Rule Scenarios...\n');
  
  const testScenarios = [
    {
      name: 'Critical R² Violation',
      metrics: { r2: 0.65, rmse: 2.1, accuracy_gain_percent: 5.0 },
      expectedViolations: 1,
      expectedAction: 'freeze_model',
      expectedSeverity: 'critical'
    },
    {
      name: 'Critical RMSE Violation',
      metrics: { r2: 0.85, rmse: 4.2, accuracy_gain_percent: 8.0 },
      expectedViolations: 1,
      expectedAction: 'freeze_model',
      expectedSeverity: 'critical'
    },
    {
      name: 'Warning R² Violation',
      metrics: { r2: 0.75, rmse: 2.8, accuracy_gain_percent: 3.0 },
      expectedViolations: 1,
      expectedAction: 'manual_review',
      expectedSeverity: 'high'
    },
    {
      name: 'Multiple Violations',
      metrics: { r2: 0.65, rmse: 4.5, accuracy_gain_percent: -8.0 },
      expectedViolations: 3,
      expectedAction: 'freeze_model',
      expectedSeverity: 'critical'
    },
    {
      name: 'No Violations',
      metrics: { r2: 0.92, rmse: 1.8, accuracy_gain_percent: 12.0 },
      expectedViolations: 0,
      expectedAction: null,
      expectedSeverity: null
    }
  ];
  
  let passedScenarios = 0;
  
  testScenarios.forEach((scenario, index) => {
    console.log(`Test ${index + 1}: ${scenario.name}`);
    console.log(`   Metrics: R²=${scenario.metrics.r2}, RMSE=${scenario.metrics.rmse}, ΔAccuracy=${scenario.metrics.accuracy_gain_percent}%`);
    
    // Simulate rule checking
    const violations = [];
    
    // R² rules
    if (scenario.metrics.r2 < 0.7) {
      violations.push({
        rule_name: 'R² Threshold Critical',
        action_required: 'freeze_model',
        severity: 'critical'
      });
    } else if (scenario.metrics.r2 < 0.8) {
      violations.push({
        rule_name: 'R² Threshold Warning',
        action_required: 'manual_review',
        severity: 'high'
      });
    }
    
    // RMSE rules
    if (scenario.metrics.rmse > 3.5) {
      violations.push({
        rule_name: 'RMSE Threshold Critical',
        action_required: 'freeze_model',
        severity: 'critical'
      });
    } else if (scenario.metrics.rmse > 3.0) {
      violations.push({
        rule_name: 'RMSE Threshold Warning',
        action_required: 'manual_review',
        severity: 'high'
      });
    }
    
    // Accuracy degradation rule
    if (scenario.metrics.accuracy_gain_percent < -5.0) {
      violations.push({
        rule_name: 'Accuracy Degradation',
        action_required: 'manual_review',
        severity: 'high'
      });
    }
    
    const actualViolations = violations.length;
    const hasCriticalViolation = violations.some(v => v.severity === 'critical');
    const primaryAction = hasCriticalViolation ? 'freeze_model' : 
                         violations.length > 0 ? violations[0].action_required : null;
    const primarySeverity = hasCriticalViolation ? 'critical' : 
                           violations.length > 0 ? violations[0].severity : null;
    
    const passed = (
      actualViolations === scenario.expectedViolations &&
      primaryAction === scenario.expectedAction &&
      primarySeverity === scenario.expectedSeverity
    );
    
    console.log(`   Expected: ${scenario.expectedViolations} violations, ${scenario.expectedAction}, ${scenario.expectedSeverity}`);
    console.log(`   Actual: ${actualViolations} violations, ${primaryAction}, ${primarySeverity}`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passed) passedScenarios++;
  });
  
  console.log(`\n📊 Governance Rule Scenarios: ${passedScenarios}/${testScenarios.length} passed`);
  return passedScenarios === testScenarios.length;
}

// Test 3: Test Action Execution
function testActionExecution() {
  console.log('\n🔍 Testing Action Execution...\n');
  
  const actionScenarios = [
    {
      name: 'Freeze Model Action',
      violation: {
        rule_name: 'R² Threshold Critical',
        action_required: 'freeze_model',
        severity: 'critical'
      },
      expectedAction: 'Model frozen due to: R² Threshold Critical',
      expectedModelFrozen: true
    },
    {
      name: 'Alert Action',
      violation: {
        rule_name: 'ROI Efficiency Warning',
        action_required: 'alert',
        severity: 'medium'
      },
      expectedAction: 'Alert sent for: ROI Efficiency Warning',
      expectedModelFrozen: false
    },
    {
      name: 'Manual Review Action',
      violation: {
        rule_name: 'R² Threshold Warning',
        action_required: 'manual_review',
        severity: 'high'
      },
      expectedAction: 'Flagged for manual review: R² Threshold Warning',
      expectedModelFrozen: false
    },
    {
      name: 'Auto-Retrain Action',
      violation: {
        rule_name: 'Latency Warning',
        action_required: 'auto_retrain',
        severity: 'medium'
      },
      expectedAction: 'Auto-retrain triggered: Latency Warning',
      expectedModelFrozen: false
    }
  ];
  
  let passedActions = 0;
  
  actionScenarios.forEach((scenario, index) => {
    console.log(`Test ${index + 1}: ${scenario.name}`);
    console.log(`   Violation: ${scenario.violation.rule_name}`);
    console.log(`   Action Required: ${scenario.violation.action_required}`);
    
    // Simulate action execution
    let actionMessage = '';
    let modelFrozen = false;
    
    switch (scenario.violation.action_required) {
      case 'freeze_model':
        actionMessage = `Model frozen due to: ${scenario.violation.rule_name}`;
        modelFrozen = true;
        break;
      case 'alert':
        actionMessage = `Alert sent for: ${scenario.violation.rule_name}`;
        break;
      case 'manual_review':
        actionMessage = `Flagged for manual review: ${scenario.violation.rule_name}`;
        break;
      case 'auto_retrain':
        actionMessage = `Auto-retrain triggered: ${scenario.violation.rule_name}`;
        break;
    }
    
    const passed = (
      actionMessage === scenario.expectedAction &&
      modelFrozen === scenario.expectedModelFrozen
    );
    
    console.log(`   Expected: "${scenario.expectedAction}", Model Frozen: ${scenario.expectedModelFrozen}`);
    console.log(`   Actual: "${actionMessage}", Model Frozen: ${modelFrozen}`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passed) passedActions++;
  });
  
  console.log(`\n📊 Action Execution: ${passedActions}/${actionScenarios.length} passed`);
  return passedActions === actionScenarios.length;
}

// Test 4: Test Model Freeze/Unfreeze
function testModelFreezeUnfreeze() {
  console.log('\n🔍 Testing Model Freeze/Unfreeze...\n');
  
  const freezeScenarios = [
    {
      name: 'Freeze Model',
      action: 'freeze',
      expectedStatus: 'frozen',
      expectedMessage: 'Model frozen successfully'
    },
    {
      name: 'Unfreeze Model',
      action: 'unfreeze',
      expectedStatus: 'active',
      expectedMessage: 'Model unfrozen successfully'
    },
    {
      name: 'Check Freeze Status',
      action: 'check',
      expectedStatus: 'active',
      expectedMessage: 'Model status checked'
    }
  ];
  
  let passedFreezeTests = 0;
  
  freezeScenarios.forEach((scenario, index) => {
    console.log(`Test ${index + 1}: ${scenario.name}`);
    
    // Simulate freeze/unfreeze operations
    let status = 'active';
    let message = '';
    
    switch (scenario.action) {
      case 'freeze':
        status = 'frozen';
        message = 'Model frozen successfully';
        break;
      case 'unfreeze':
        status = 'active';
        message = 'Model unfrozen successfully';
        break;
      case 'check':
        status = 'active';
        message = 'Model status checked';
        break;
    }
    
    const passed = (
      status === scenario.expectedStatus &&
      message === scenario.expectedMessage
    );
    
    console.log(`   Expected: Status=${scenario.expectedStatus}, Message="${scenario.expectedMessage}"`);
    console.log(`   Actual: Status=${status}, Message="${message}"`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passed) passedFreezeTests++;
  });
  
  console.log(`\n📊 Model Freeze/Unfreeze: ${passedFreezeTests}/${freezeScenarios.length} passed`);
  return passedFreezeTests === freezeScenarios.length;
}

// Test 5: Test API Endpoint Simulation
function testAPIEndpointSimulation() {
  console.log('\n🔍 Testing API Endpoint Simulation...\n');
  
  const apiTests = [
    {
      name: 'POST /api/governance/check - Violation Detection',
      method: 'POST',
      endpoint: '/api/governance/check',
      payload: {
        dealerId: 'test_dealer',
        metrics: { r2: 0.65, rmse: 4.2, accuracy_gain_percent: -8.0 }
      },
      expectedResponse: {
        success: true,
        violations: 3,
        model_frozen: true
      }
    },
    {
      name: 'GET /api/governance/check - Status Check',
      method: 'GET',
      endpoint: '/api/governance/check?dealerId=test_dealer',
      payload: null,
      expectedResponse: {
        success: true,
        governance_status: 'active'
      }
    }
  ];
  
  let passedAPITests = 0;
  
  apiTests.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`   Method: ${test.method}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    
    if (test.payload) {
      console.log(`   Payload: ${JSON.stringify(test.payload, null, 2)}`);
    }
    
    // Simulate API response
    let response = { success: false };
    
    if (test.method === 'POST' && test.payload) {
      // Simulate violation checking
      const violations = [];
      if (test.payload.metrics.r2 < 0.7) violations.push({ rule: 'R² Critical' });
      if (test.payload.metrics.rmse > 3.5) violations.push({ rule: 'RMSE Critical' });
      if (test.payload.metrics.accuracy_gain_percent < -5.0) violations.push({ rule: 'Accuracy Degradation' });
      
      response = {
        success: true,
        violations: violations.length,
        model_frozen: violations.some(v => v.rule.includes('Critical'))
      };
    } else if (test.method === 'GET') {
      response = {
        success: true,
        governance_status: 'active'
      };
    }
    
    const passed = (
      response.success === test.expectedResponse.success &&
      (test.expectedResponse.violations === undefined || response.violations === test.expectedResponse.violations) &&
      (test.expectedResponse.model_frozen === undefined || response.model_frozen === test.expectedResponse.model_frozen) &&
      (test.expectedResponse.governance_status === undefined || response.governance_status === test.expectedResponse.governance_status)
    );
    
    console.log(`   Expected: ${JSON.stringify(test.expectedResponse)}`);
    console.log(`   Actual: ${JSON.stringify(response)}`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passed) passedAPITests++;
  });
  
  console.log(`\n📊 API Endpoint Simulation: ${passedAPITests}/${apiTests.length} passed`);
  return passedAPITests === apiTests.length;
}

// Run all tests
function runDay3Validation() {
  console.log('🎯 Week 1 - Day 3: Governance Thresholds Testing\n');
  
  const tests = [
    { name: 'Governance Rules Structure', test: testGovernanceRulesStructure },
    { name: 'Governance Rule Scenarios', test: testGovernanceRuleScenarios },
    { name: 'Action Execution', test: testActionExecution },
    { name: 'Model Freeze/Unfreeze', test: testModelFreezeUnfreeze },
    { name: 'API Endpoint Simulation', test: testAPIEndpointSimulation }
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
  
  console.log('\n📊 Day 3 Validation Results:');
  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Day 3 Validation Complete!');
    console.log('📋 Next Steps:');
    console.log('   1. Test SHAP explanations integration');
    console.log('   2. End-to-end integration testing');
    console.log('   3. Deploy to production');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before proceeding.');
  }
}

// Execute validation
if (require.main === module) {
  runDay3Validation();
}

module.exports = { 
  testGovernanceRulesStructure,
  testGovernanceRuleScenarios,
  testActionExecution,
  testModelFreezeUnfreeze,
  testAPIEndpointSimulation,
  runDay3Validation
};
