#!/usr/bin/env node
/**
 * Update existing Vercel environment variables
 * Uses DELETE + CREATE to update values
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

console.log('🔄 Vercel Environment Variable Update');
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

console.log('✅ Token extracted');
console.log('');

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
    target: 'production'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: extractEnvVar('SUPABASE_ANON_KEY'),
    target: 'production'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: extractEnvVar('SUPABASE_SERVICE_KEY'),
    target: 'production'
  },
  {
    key: 'DATABASE_URL',
    value: extractEnvVar('DATABASE_URL'),
    target: 'production'
  }
];

console.log('📝 Environment Variables to Update:');
console.log('='.repeat(50));
envVars.forEach(({ key, value }) => {
  console.log(`  ${key}: ${value ? value.substring(0, 50) + '...' : '❌ Missing'}`);
});
console.log('');

async function getEnvVarId(key) {
  try {
    const url = `https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${ORG_ID}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const envVar = data.envs.find(e => e.key === key && e.target.includes('production'));
      return envVar ? envVar.id : null;
    }
  } catch (error) {
    console.log(`  ⚠️  Error finding ${key}: ${error.message}`);
  }
  return null;
}

async function deleteEnvVar(id, key) {
  try {
    const url = `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${id}?teamId=${ORG_ID}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });

    if (response.ok) {
      console.log(`  ✅ Deleted old ${key}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`  ⚠️  Delete failed: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

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
      console.log(`  ✅ Created new ${key}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`  ⚠️  Create failed: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function updateEnvVar(envVar) {
  console.log(`\nUpdating ${envVar.key}...`);

  // Get current env var ID
  const id = await getEnvVarId(envVar.key);

  if (id) {
    // Delete existing
    const deleted = await deleteEnvVar(id, envVar.key);
    if (!deleted) return false;

    // Wait a bit for propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Create new
  return await createEnvVar(envVar);
}

// Update all environment variables
(async () => {
  console.log('🚀 Updating environment variables...');
  console.log('');

  for (const envVar of envVars) {
    if (envVar.value) {
      await updateEnvVar(envVar);
    } else {
      console.log(`\n⚠️  Skipping ${envVar.key} (no value found)`);
    }
  }

  console.log('');
  console.log('✅ Environment variable update complete!');
  console.log('');
  console.log('🔄 Vercel will automatically redeploy with new values');
  console.log('');
  console.log('🔍 Monitor deployment at:');
  console.log(`https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/deployments`);
  console.log('');
  console.log('🌐 Production URLs:');
  console.log('- https://dealershipai.com');
  console.log('- https://dash.dealershipai.com');
})();
