#!/usr/bin/env node
/**
 * Sync Environment Variables
 * Maps existing env vars to required names
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

// Read current .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Mapping of existing vars to required vars
const mappings = {
  'EXPO_PUBLIC_SUPABASE_URL': 'SUPABASE_URL',
  'MCP_SUPABASE_URL': 'SUPABASE_URL',
};

let updated = false;
const newLines = [];
const existingVars = new Set();

// Parse existing vars
lines.forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) {
    existingVars.add(match[1]);
  }
});

// Process lines and add mappings
lines.forEach(line => {
  const trimmed = line.trim();
  
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('#')) {
    newLines.push(line);
    return;
  }

  const match = trimmed.match(/^([A-Z_]+)=(.+)$/);
  if (match) {
    const [key, value] = [match[1], match[2]];
    
    // If this is a source var, check if we need to add the mapped var
    if (mappings[key] && !existingVars.has(mappings[key])) {
      newLines.push(line);
      newLines.push(`${mappings[key]}=${value}  # Auto-mapped from ${key}`);
      updated = true;
      console.log(`✅ Added ${mappings[key]} from ${key}`);
    } else {
      newLines.push(line);
    }
  } else {
    newLines.push(line);
  }
});

// Add missing required vars as comments
const requiredVars = {
  'SUPABASE_SERVICE_KEY': 'Get from Supabase Dashboard → Settings → API → service_role key',
  'UPSTASH_REDIS_REST_URL': 'Get from Upstash Console → Redis Database',
  'UPSTASH_REDIS_REST_TOKEN': 'Get from Upstash Console → Redis Database',
};

let hasComments = false;
Object.entries(requiredVars).forEach(([key, desc]) => {
  if (!existingVars.has(key)) {
    if (!hasComments) {
      newLines.push('');
      newLines.push('# Add these values from your Supabase/Upstash dashboards:');
      hasComments = true;
    }
    newLines.push(`# ${key}=  # ${desc}`);
  }
});

if (updated || hasComments) {
  fs.writeFileSync(envPath, newLines.join('\n') + '\n');
  console.log('\n✅ Updated .env.local');
  console.log('\n📝 Next steps:');
  console.log('   1. Get SUPABASE_SERVICE_KEY from Supabase Dashboard');
  console.log('   2. Get Upstash credentials from Upstash Console (optional)');
  console.log('   3. Add the values to .env.local');
  console.log('   4. Restart dev server: npm run dev');
} else {
  console.log('✅ All mappings already exist');
}

