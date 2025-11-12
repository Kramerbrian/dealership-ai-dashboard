#!/usr/bin/env node
/**
 * Direct Vercel API Environment Variable Configuration
 * Bypasses buggy Vercel CLI v48.9.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read project configuration
const projectConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../.vercel/project.json'), 'utf8')
);

const PROJECT_ID = projectConfig.projectId;
const ORG_ID = projectConfig.orgId;

console.log('🔧 Vercel API Environment Variable Configuration');
console.log('='.repeat(50));
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`Org ID: ${ORG_ID}`);
console.log('');

// Extract Vercel token from CLI auth file
let VERCEL_TOKEN;
try {
  const whoami = execSync('npx vercel whoami 2>&1', { encoding: 'utf8' });
  console.log(`✅ Authenticated as: ${whoami.trim()}`);

  // Read token from auth.json
  const authPath = path.join(
    process.env.HOME,
    'Library/Application Support/com.vercel.cli/auth.json'
  );

  if (fs.existsSync(authPath)) {
    const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
    VERCEL_TOKEN = authData.token;
    console.log('✅ Token extracted from auth.json');
  } else if (process.env.VERCEL_TOKEN) {
    VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    console.log('✅ Token found in environment variable');
  } else {
    throw new Error('No token found');
  }
} catch (error) {
  console.error('❌ Could not extract Vercel token');
  console.error('Try: export VERCEL_TOKEN="your_token"');
  process.exit(1);
}

// Read environment variables from .env.local
const envLocal = fs.readFileSync(
  path.join(__dirname, '../.env.local'),
  'utf8'
);

function extractEnvVar(name) {
  const regex = new RegExp(`^${name}=(.*)$`, 'm');
  const match = envLocal.match(regex);
  return match ? match[1].trim() : null;
}

const envVars = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: extractEnvVar('SUPABASE_URL'),
    target: ['production'],
    type: 'encrypted'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: extractEnvVar('SUPABASE_ANON_KEY'),
    target: ['production'],
    type: 'encrypted'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: extractEnvVar('SUPABASE_SERVICE_KEY'),
    target: ['production'],
    type: 'encrypted'
  },
  {
    key: 'DATABASE_URL',
    value: extractEnvVar('DATABASE_URL'),
    target: ['production'],
    type: 'encrypted'
  }
];

console.log('');
console.log('📝 Environment Variables to Add:');
console.log('='.repeat(50));
envVars.forEach(({ key, value }) => {
  console.log(`  ${key}: ${value ? '✅ Found' : '❌ Missing'}`);
});
console.log('');

async function addEnvVar({ key, value, target, type }) {
  console.log(`Adding ${key}...`);

  // Try personal account (no teamId) and team account
  const urls = [
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env`,
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${ORG_ID}`
  ];

  const body = JSON.stringify({
    key,
    value,
    target,
    type
  });

  // Try personal account first
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i], {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        console.log(`  ✅ ${key} added successfully`);
        return true;
      } else {
        const errorText = await response.text();
        if (i === urls.length - 1) {
          // Last attempt failed
          console.log(`  ⚠️  ${key}: ${errorText}`);
          return false;
        }
        // Try next URL
        continue;
      }
    } catch (error) {
      if (i === urls.length - 1) {
        console.log(`  ❌ ${key}: ${error.message}`);
        return false;
      }
    }
  }
}

// Add all environment variables
(async () => {
  console.log('🚀 Adding environment variables via Vercel API...');
  console.log('');

  for (const envVar of envVars) {
    if (envVar.value) {
      await addEnvVar(envVar);
    } else {
      console.log(`  ⚠️  Skipping ${envVar.key} (no value found)`);
    }
  }

  console.log('');
  console.log('✅ Environment variable configuration complete!');
  console.log('');
  console.log('🔍 Verify at:');
  console.log(`https://vercel.com/${ORG_ID}/dealership-ai-dashboard/settings/environment-variables`);
  console.log('');
  console.log('🚀 Deploy to production:');
  console.log('npx vercel --prod');
})();
