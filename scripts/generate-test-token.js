#!/usr/bin/env node

/**
 * Generate Test JWT Token for Development
 * Usage: node scripts/generate-test-token.js [role]
 */

const jwt = require('jsonwebtoken')

// Get role from command line or default to 'admin'
const role = process.argv[2] || 'admin'

// Valid roles
const validRoles = ['owner', 'admin', 'manager', 'editor', 'analyst', 'viewer']

if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role: ${role}`)
  console.error(`Valid roles: ${validRoles.join(', ')}`)
  process.exit(1)
}

// Get JWT secret from environment or use dev default
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'dev-secret'

// Permission mapping from authz-unified.ts
const ROLE_PERMISSIONS = {
  owner: [
    'origins:read', 'origins:create', 'origins:update', 'origins:delete',
    'origins:bulk_upload', 'origins:bulk_delete', 'origins:export', 'origins:verify', 'origins:schedule_jobs',
    'evidence:read', 'evidence:capture', 'evidence:export',
    'audit:read', 'audit:export',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'tenants:manage', 'users:read', 'users:manage',
    'settings:read', 'settings:write',
    'billing:view', 'billing:manage',
    'ai:visibility_test', 'ai:prompt_test', 'ai:model_config'
  ],
  admin: [
    'origins:read', 'origins:create', 'origins:update', 'origins:delete',
    'origins:bulk_upload', 'origins:bulk_delete', 'origins:export', 'origins:verify', 'origins:schedule_jobs',
    'evidence:read', 'evidence:capture', 'evidence:export',
    'audit:read', 'audit:export',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'users:read', 'users:manage',
    'settings:read', 'settings:write',
    'billing:view',
    'ai:visibility_test', 'ai:prompt_test', 'ai:model_config'
  ],
  manager: [
    'origins:read', 'origins:create', 'origins:update',
    'origins:bulk_upload', 'origins:export', 'origins:verify',
    'evidence:read', 'evidence:capture',
    'audit:read',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'users:read',
    'settings:read',
    'ai:visibility_test', 'ai:prompt_test'
  ],
  editor: [
    'origins:read', 'origins:create', 'origins:update',
    'origins:export', 'origins:verify',
    'evidence:read',
    'audit:read',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'settings:read',
    'ai:visibility_test'
  ],
  analyst: [
    'origins:read', 'origins:export',
    'evidence:read', 'evidence:export',
    'audit:read',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'settings:read',
    'ai:visibility_test'
  ],
  viewer: [
    'origins:read',
    'evidence:read',
    'dashboard:view', 'analytics:view',
    'settings:read'
  ]
}

// Upload limits
const UPLOAD_LIMITS = {
  owner: { maxFileSizeMB: 100, maxBatchSize: 10000, dailyUploadLimit: 100000 },
  admin: { maxFileSizeMB: 100, maxBatchSize: 10000, dailyUploadLimit: 50000 },
  manager: { maxFileSizeMB: 50, maxBatchSize: 5000, dailyUploadLimit: 10000 },
  editor: { maxFileSizeMB: 10, maxBatchSize: 1000, dailyUploadLimit: 5000 },
  analyst: { maxFileSizeMB: 0, maxBatchSize: 0, dailyUploadLimit: 0 },
  viewer: { maxFileSizeMB: 0, maxBatchSize: 0, dailyUploadLimit: 0 }
}

// Create payload
const payload = {
  tenant_id: 'test-tenant-' + Date.now(),
  user_id: 'test-user-' + Date.now(),
  sub: 'test-user-' + Date.now(),
  role: role,
  permissions: ROLE_PERMISSIONS[role],
  email: `test-${role}@example.com`,
  name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`
}

// Generate token (expires in 24 hours)
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

// Display results
console.log('\n🔑 Test JWT Token Generated\n')
console.log('═'.repeat(80))
console.log(`Role:        ${role}`)
console.log(`Tenant ID:   ${payload.tenant_id}`)
console.log(`User ID:     ${payload.user_id}`)
console.log(`Permissions: ${ROLE_PERMISSIONS[role].length} permissions`)
console.log(`Upload Limit: ${UPLOAD_LIMITS[role].maxFileSizeMB}MB / ${UPLOAD_LIMITS[role].maxBatchSize} rows`)
console.log('═'.repeat(80))
console.log('\n📋 Token (copy this):\n')
console.log(token)
console.log('\n')
console.log('═'.repeat(80))
console.log('\n🧪 Test API Upload:\n')
console.log(`curl -X POST http://localhost:3000/api/origins/bulk-csv \\`)
console.log(`  -H "Authorization: Bearer ${token}" \\`)
console.log(`  -F "file=@test.csv"`)
console.log('\n')
console.log('═'.repeat(80))
console.log('\n💾 Store in localStorage (browser console):\n')
console.log(`localStorage.setItem('auth_token', '${token}')`)
console.log('\n')
console.log('═'.repeat(80))
console.log('\n✅ Token expires in 24 hours')
console.log('\n')

// Also save to .env.local.test for convenience
const fs = require('fs')
const path = require('path')

const testEnvPath = path.join(__dirname, '../.env.local.test')
const testEnvContent = `
# Generated test token (${new Date().toISOString()})
# Role: ${role}
# Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}

TEST_AUTH_TOKEN="${token}"
TEST_TENANT_ID="${payload.tenant_id}"
TEST_USER_ID="${payload.user_id}"
TEST_ROLE="${role}"
`

fs.writeFileSync(testEnvPath, testEnvContent.trim() + '\n')
console.log(`📝 Token saved to: ${testEnvPath}\n`)
