#!/usr/bin/env node

/**
 * Security Schema Deployment Helper
 * This script helps you deploy the security schema to Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️ Security Schema Deployment Helper');
console.log('=====================================\n');

// Read the security schema
const schemaPath = path.join(__dirname, '..', 'database', 'security-schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 Security Schema Content:');
console.log('============================');
console.log(schemaContent);
console.log('\n');

console.log('🚀 Next Steps:');
console.log('==============');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project: gzlgfghpkbqlhgfozjkb');
console.log('3. Click "SQL Editor" in the left sidebar');
console.log('4. Click "New Query"');
console.log('5. Copy the SQL content above and paste it into the editor');
console.log('6. Click "Run" to execute the SQL');
console.log('7. Verify all 7 security tables are created');
console.log('8. Run: node scripts/test-security-implementation.js');
console.log('\n');

console.log('📊 Expected Tables:');
console.log('===================');
console.log('✅ security_events');
console.log('✅ access_controls');
console.log('✅ security_rules');
console.log('✅ api_keys');
console.log('✅ security_alerts');
console.log('✅ audit_log');
console.log('✅ model_access_log');
console.log('\n');

console.log('🔐 Default Security Rules (9 rules):');
console.log('=====================================');
console.log('• Multiple Failed Logins (lockout)');
console.log('• Unusual IP Access (alert)');
console.log('• Rapid API Requests (block)');
console.log('• Large Data Export (block)');
console.log('• Unauthorized Model Access (alert)');
console.log('• Suspicious Data Pattern (alert)');
console.log('• Admin Privilege Escalation (alert)');
console.log('• System Configuration Change (audit)');
console.log('• Security Rule Modification (audit)');
console.log('\n');

console.log('👥 Default Access Controls (4 roles):');
console.log('======================================');
console.log('• super_admin - Full access with MFA');
console.log('• governance_admin - Governance operations');
console.log('• model_engineer - Model read access');
console.log('• viewer - Dashboard read only');
console.log('\n');

console.log('🛡️ Your AI governance system will be fully secured!');
