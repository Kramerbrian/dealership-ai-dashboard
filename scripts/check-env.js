#!/usr/bin/env node
/**
 * Environment Variable Checker
 * Verifies all required env vars are set
 */

require('dotenv').config({ path: '.env.local' });

const required = {
  'SUPABASE_URL': 'Your Supabase project URL',
  'SUPABASE_SERVICE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM5ODUwNCwiZXhwIjoyMDcwOTc0NTA0fQ.nud8cCUmdqw5WFi5bOZ8jeIf2GGFjeKIcWDhERb_-gk',
};

const optional = {
  'UPSTASH_REDIS_REST_URL': 'Upstash Redis URL (for rate limiting)',
  'UPSTASH_REDIS_REST_TOKEN': 'Upstash Redis token (for rate limiting)',
  'SCHEMA_ENGINE_URL': 'Schema Engine URL (optional)',
};

const recommended = {
  'NEXT_PUBLIC_BASE_URL': 'Base URL for the app',
};

console.log('🔍 Checking Environment Variables\n');
console.log('='.repeat(50));

let allGood = true;

// Check required
console.log('\n📋 Required Variables:');
for (const [key, desc] of Object.entries(required)) {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: Set (${value.length} chars)`);
  } else {
    console.log(`  ❌ ${key}: MISSING`);
    console.log(`     → ${desc}`);
    allGood = false;
  }
}

// Check optional

console.log('\n📋 Optional Variables (Recommended):');
for (const [key, desc] of Object.entries(optional)) {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: Set`);
  } else {
    console.log(`  ⚠️  ${key}: Not set`);
    console.log(`     → ${desc}`);
  }
}

// Check recommended
console.log('\n📋 Recommended Variables:');
for (const [key, desc] of Object.entries(recommended)) {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: Set (${value})`);
  } else {
    console.log(`  ⚠️  ${key}: Not set (defaults to http://localhost:3000)`);
  }
}

// Check for alternative names
console.log('\n📋 Alternative Variable Names Found:');
const alternatives = {
  'EXPO_PUBLIC_SUPABASE_URL': 'SUPABASE_URL',
  'MCP_SUPABASE_URL': 'SUPABASE_URL',
};
for (const [altKey, targetKey] of Object.entries(alternatives)) {
  if (process.env[altKey] && !process.env[targetKey]) {
    console.log(`  💡 ${altKey} found → You can use this for ${targetKey}`);
    console.log(`     Add to .env.local: ${targetKey}=${process.env[altKey]}`);
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('\n✅ All required variables are set!');
  console.log('🚀 You can now use the API endpoints.');
} else {
  console.log('\n❌ Some required variables are missing.');
  console.log('📝 Add them to .env.local and restart the dev server.');
}
console.log('');

