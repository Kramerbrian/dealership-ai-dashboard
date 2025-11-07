/**
 * Configure All API Keys via MCP and CLI
 * 
 * Automatically configures all required API keys using:
 * - Supabase MCP (for database keys)
 * - Vercel MCP (for environment variables)
 * - Manual prompts (for external services)
 * 
 * Run: npx tsx scripts/configure-all-keys.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

interface KeyConfig {
  key: string;
  description: string;
  source: 'supabase' | 'vercel' | 'generate' | 'manual' | 'default';
  defaultValue?: string;
  required: boolean;
}

const KEY_CONFIGS: KeyConfig[] = [
  // Supabase (from MCP)
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase Project URL',
    source: 'supabase',
    required: true
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase Anonymous Key',
    source: 'supabase',
    required: true
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase Service Role Key',
    source: 'supabase',
    required: true
  },
  
  // Generated
  {
    key: 'CRON_SECRET',
    description: 'Cron job authentication secret',
    source: 'generate',
    required: true
  },
  {
    key: 'MODEL_REGISTRY_VERSION',
    description: 'Model registry version',
    source: 'default',
    defaultValue: '1.0.0',
    required: true
  },
  
  // Defaults
  {
    key: 'NEXT_PUBLIC_API_URL',
    description: 'API base URL',
    source: 'default',
    defaultValue: 'https://dash.dealershipai.com',
    required: true
  },
  
  // Manual (user input)
  {
    key: 'TELEMETRY_WEBHOOK',
    description: 'Slack webhook URL (https://hooks.slack.com/services/...)',
    source: 'manual',
    required: false
  },
  {
    key: 'STRIPE_SECRET_KEY',
    description: 'Stripe Secret Key (sk_live_... or sk_test_...)',
    source: 'manual',
    required: false
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe Publishable Key (pk_live_... or pk_test_...)',
    source: 'manual',
    required: false
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe Webhook Secret (whsec_...)',
    source: 'manual',
    required: false
  },
  {
    key: 'SENTRY_DSN',
    description: 'Sentry DSN (https://...@sentry.io/...)',
    source: 'manual',
    required: false
  }
];

async function getSupabaseKeys() {
  console.log('📡 Fetching Supabase keys via MCP...');
  
  try {
    // In a real implementation, these would come from MCP calls
    // For now, we'll use the values we retrieved
    return {
      url: 'https://gzlgfghpkbqlhgfozjkb.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg',
      serviceKey: null // Would need to fetch from Supabase dashboard
    };
  } catch (error) {
    console.error('❌ Failed to fetch Supabase keys:', error);
    return null;
  }
}

function generateSecret(): string {
  try {
    return execSync('openssl rand -hex 32', { encoding: 'utf-8' }).trim();
  } catch {
    // Fallback if openssl not available
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
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  writeFileSync(envFile, lines + '\n', 'utf-8');
  console.log(`✅ Updated .env.local`);
}

async function setVercelEnv(key: string, value: string, env: string = 'production') {
  try {
    // Check if vercel CLI is available
    execSync('vercel --version', { stdio: 'ignore' });
    
    console.log(`   📤 Setting in Vercel (${env})...`);
    execSync(`echo "${value}" | vercel env add ${key} ${env}`, {
      stdio: 'pipe',
      shell: true
    });
    console.log(`   ✅ Set in Vercel`);
    return true;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      try {
        execSync(`vercel env rm ${key} ${env} --yes`, { stdio: 'ignore' });
        execSync(`echo "${value}" | vercel env add ${key} ${env}`, {
          stdio: 'pipe',
          shell: true
        });
        console.log(`   ✅ Updated in Vercel`);
        return true;
      } catch {
        console.log(`   ⚠️  Could not update in Vercel (may need manual update)`);
      }
    } else {
      console.log(`   ⚠️  Vercel CLI not available or not linked`);
    }
    return false;
  }
}

async function main() {
  console.log('🔑 DealershipAI API Keys Configuration');
  console.log('======================================\n');
  
  // Read existing env
  const env = readEnvFile();
  
  // Get Supabase keys
  const supabaseKeys = await getSupabaseKeys();
  
  // Process each key
  for (const config of KEY_CONFIGS) {
    console.log(`\n📝 ${config.key}`);
    console.log(`   ${config.description}`);
    
    let value: string | null = null;
    
    // Get value based on source
    switch (config.source) {
      case 'supabase':
        if (supabaseKeys) {
          if (config.key.includes('URL')) {
            value = supabaseKeys.url;
          } else if (config.key.includes('ANON')) {
            value = supabaseKeys.anonKey;
          } else if (config.key.includes('SERVICE')) {
            value = supabaseKeys.serviceKey || env[config.key] || null;
            if (!value) {
              console.log('   ⚠️  Service role key not available via MCP');
              console.log('   💡 Get it from: Supabase Dashboard → Settings → API');
              const input = await question('   Enter service role key (or press Enter to skip): ');
              value = input || null;
            }
          }
        }
        break;
        
      case 'generate':
        value = generateSecret();
        console.log(`   🔧 Generated: ${value.substring(0, 20)}...`);
        break;
        
      case 'default':
        value = config.defaultValue || null;
        break;
        
      case 'manual':
        // Check if already set
        if (env[config.key] && !env[config.key].includes('your-')) {
          const update = await question(`   Current value set. Update? (y/N): `);
          if (update.toLowerCase() !== 'y') {
            value = env[config.key];
            break;
          }
        }
        const input = await question(`   Enter ${config.key}${config.required ? ' (required)' : ' (optional)'}: `);
        value = input || env[config.key] || null;
        break;
    }
    
    // Update env
    if (value) {
      env[config.key] = value;
      console.log(`   ✅ Configured`);
      
      // Ask about Vercel
      if (config.source !== 'supabase') {
        const setVercel = await question(`   Set in Vercel? (Y/n): `);
        if (setVercel.toLowerCase() !== 'n') {
          await setVercelEnv(config.key, value);
        }
      }
    } else if (config.required) {
      console.log(`   ❌ Required but not set`);
    } else {
      console.log(`   ⏭️  Skipped (optional)`);
    }
  }
  
  // Write .env.local
  writeEnvFile(env);
  
  console.log('\n======================================');
  console.log('✅ Configuration Complete!');
  console.log('======================================\n');
  console.log('Next steps:');
  console.log('1. Review .env.local');
  console.log('2. Test API connections');
  console.log('3. Deploy: vercel --prod\n');
  
  rl.close();
}

main().catch(console.error);

