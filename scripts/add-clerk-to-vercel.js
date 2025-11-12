#!/usr/bin/env node
/**
 * Add Clerk environment variables to Vercel
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

console.log('🔧 Adding Clerk Environment Variables to Vercel');
console.log('='.repeat(50));
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`Team ID: ${ORG_ID}`);
console.log('');

// Extract Vercel token
const authPath = path.join(
  process.env.HOME,
  'Library/Application Support/com.vercel.cli/auth.json'
);

const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const VERCEL_TOKEN = authData.token;

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
    key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    value: extractEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
    target: 'production'
  },
  {
    key: 'CLERK_SECRET_KEY',
    value: extractEnvVar('CLERK_SECRET_KEY'),
    target: 'production'
  }
];

console.log('📝 Clerk Variables to Add:');
console.log('='.repeat(50));
envVars.forEach(({ key, value }) => {
  console.log(`  ${key}: ${value ? '✅ Found' : '❌ Missing'}`);
});
console.log('');

async function createEnvVar({ key, value, target }) {
  try {
    const url = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${ORG_ID}`;
    const body = JSON.stringify({
      key,
      value,
      target: [target],
      type: 'encrypted'
    });

    const response = await fetch(url, {
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
      console.log(`  ⚠️  ${key}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ ${key}: ${error.message}`);
    return false;
  }
}

// Add all environment variables
(async () => {
  console.log('🚀 Adding Clerk variables via Vercel API...');
  console.log('');

  for (const envVar of envVars) {
    if (envVar.value) {
      await createEnvVar(envVar);
    } else {
      console.log(`\n⚠️  Skipping ${envVar.key} (no value found)`);
    }
  }

  console.log('');
  console.log('✅ Clerk configuration complete!');
  console.log('');
  console.log('🔄 Vercel will automatically redeploy');
})();
