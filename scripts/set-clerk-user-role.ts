/**
 * Set Clerk User Role and Tenant
 * 
 * Usage:
 *   npx tsx scripts/set-clerk-user-role.ts <userId> <role> <tenant>
 * 
 * Example:
 *   npx tsx scripts/set-clerk-user-role.ts user_abc123 admin demo-dealer-001
 */

import { clerkClient } from '@clerk/nextjs/server';

async function setUserRole(userId: string, role: 'admin' | 'ops' | 'viewer', tenant: string) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        tenant,
      },
    });
    
    console.log(`✅ Successfully set user ${userId}:`);
    console.log(`   Role: ${role}`);
    console.log(`   Tenant: ${tenant}`);
  } catch (error: any) {
    console.error('❌ Error setting user metadata:', error.message);
    process.exit(1);
  }
}

// Get args from command line
const [,, userId, role, tenant] = process.argv;

if (!userId || !role || !tenant) {
  console.error('Usage: npx tsx scripts/set-clerk-user-role.ts <userId> <role> <tenant>');
  console.error('Example: npx tsx scripts/set-clerk-user-role.ts user_abc123 admin demo-dealer-001');
  process.exit(1);
}

if (!['admin', 'ops', 'viewer'].includes(role)) {
  console.error('Role must be one of: admin, ops, viewer');
  process.exit(1);
}

setUserRole(userId, role as 'admin' | 'ops' | 'viewer', tenant);

