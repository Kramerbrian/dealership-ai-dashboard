/**
 * Non-Interactive API Keys Setup
 * 
 * Automatically configures keys without prompts
 * Uses MCP for Supabase, generates secrets, uses defaults
 * 
 * Run: npx tsx scripts/setup-api-keys-auto.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EnvConfig {
  key: string;
  value: string | (() => string);
  source: string;
}

// Supabase keys from MCP (already retrieved)
const SUPABASE_URL = 'https://gzlgfghpkbqlhgfozjkb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg';

function generateSecret(): string {
  try {
    return execSync('openssl rand -hex 32', { encoding: 'utf-8' }).trim();
  } catch {
    // Fallback
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

function readEnvFile(): Record<string, string> {
  const envFile = join(process.cwd(), '.env.local');
  const env: Record<string, string> = {};
  
  if (existsSync(envFile)) {
    const content = readFileSync(envFile, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
  }
  
  return env;
}

function writeEnvFile(env: Record<string, string>) {
  const envFile = join(process.cwd(), '.env.local');
  const lines = Object.entries(env)
    .filter(([_, value]) => value) // Only write non-empty values
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  writeFileSync(envFile, lines + '\n', 'utf-8');
}

async function setVercelEnv(key: string, value: string, env: string = 'production') {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log(`   📤 Setting in Vercel (${env})...`);
    
    // Try to add (will fail if exists)
    try {
      execSync(`echo "${value}" | vercel env add ${key} ${env}`, {
        stdio: 'pipe',
        shell: true
      });
      console.log(`   ✅ Set in Vercel`);
      return true;
    } catch {
      // If exists, try to remove and re-add
      try {
        execSync(`vercel env rm ${key} ${env} --yes`, { stdio: 'ignore' });
        execSync(`echo "${value}" | vercel env add ${key} ${env}`, {
          stdio: 'pipe',
          shell: true
        });
        console.log(`   ✅ Updated in Vercel`);
        return true;
      } catch (error) {
        console.log(`   ⚠️  Could not update in Vercel`);
        return false;
      }
    }
  } catch {
    console.log(`   ⚠️  Vercel CLI not available`);
    return false;
  }
}

async function main() {
  console.log('🔑 DealershipAI API Keys - Auto Configuration\n');
  
  const env = readEnvFile();
  const configs: EnvConfig[] = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: SUPABASE_URL,
      source: 'MCP'
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: SUPABASE_ANON_KEY,
      source: 'MCP'
    },
    {
      key: 'CRON_SECRET',
      value: generateSecret(),
      source: 'Generated'
    },
    {
      key: 'MODEL_REGISTRY_VERSION',
      value: '1.0.0',
      source: 'Default'
    },
    {
      key: 'NEXT_PUBLIC_API_URL',
      value: 'https://dash.dealershipai.com',
      source: 'Default'
    }
  ];
  
  // Only update if not already set (preserve existing values)
  for (const config of configs) {
    const value = typeof config.value === 'function' ? config.value() : config.value;
    
    if (!env[config.key] || env[config.key].includes('your-') || env[config.key].includes('localhost')) {
      env[config.key] = value;
      console.log(`✅ ${config.key} = ${value.substring(0, 30)}... (${config.source})`);
    } else {
      console.log(`⏭️  ${config.key} already set, keeping existing value`);
    }
  }
  
  // Write .env.local
  writeEnvFile(env);
  console.log('\n✅ Updated .env.local\n');
  
  // Ask about Vercel sync
  console.log('📤 Vercel Sync');
  console.log('   Run: vercel env add KEY_NAME production');
  console.log('   Or use: vercel env pull .env.local\n');
  
  // List keys that need manual setup
  const manualKeys = [
    'TELEMETRY_WEBHOOK',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENTRY_DSN',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  console.log('⚠️  Manual Setup Required:');
  manualKeys.forEach(key => {
    if (!env[key] || env[key].includes('your-')) {
      console.log(`   - ${key}`);
    }
  });
  
  console.log('\n📖 See scripts/setup-api-keys.md for details\n');
}

main().catch(console.error);

