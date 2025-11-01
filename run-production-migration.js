#!/usr/bin/env node
/**
 * Production Database Migration Runner
 *
 * This script runs Prisma migrations in the production environment
 * where the database is accessible (not blocked by IP restrictions).
 *
 * Usage:
 *   node run-production-migration.js
 *
 * Prerequisites:
 *   - DATABASE_URL and DIRECT_URL environment variables must be set
 *   - Prisma CLI must be installed
 */

const { execSync } = require('child_process');

console.log('========================================');
console.log('Production Database Migration Runner');
console.log('========================================\n');

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

if (!process.env.DIRECT_URL) {
  console.error('❌ ERROR: DIRECT_URL environment variable not set');
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log(`📊 Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown'}\n`);

try {
  console.log('🔄 Running Prisma migrations...\n');

  // Run migrations
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('\n✅ Migrations completed successfully!');
  console.log('\n📋 Verifying tables created...\n');

  // List Pulse tables
  execSync(`npx prisma db execute --stdin <<SQL
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'Pulse%'
ORDER BY table_name;
SQL`, {
    stdio: 'inherit',
    env: process.env
  });

  console.log('\n🎉 Production database migration complete!');

} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
