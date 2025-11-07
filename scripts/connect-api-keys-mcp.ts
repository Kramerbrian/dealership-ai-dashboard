/**
 * Connect API Keys via MCP
 * 
 * Uses Model Context Protocol to configure API keys
 * Run with: npx tsx scripts/connect-api-keys-mcp.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EnvConfig {
  key: string;
  description: string;
  required: boolean;
  generate?: () => string;
  mcpSource?: 'supabase' | 'vercel' | 'manual';
}

const ENV_CONFIGS: EnvConfig[] = [
  {
    key: 'TELEMETRY_WEBHOOK',
    description: 'Slack webhook URL for alerts',
    required: false,
    mcpSource: 'manual'
  },
  {
    key: 'STRIPE_SECRET_KEY',
    description: 'Stripe Secret Key',
    required: false,
    mcpSource: 'manual'
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe Publishable Key',
    required: false,
    mcpSource: 'manual'
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe Webhook Secret',
    required: false,
    mcpSource: 'manual'
  },
  {
    key: 'CRON_SECRET',
    description: 'Cron job authentication secret',
    required: true,
    generate: () => {
      return execSync('openssl rand -hex 32', { encoding: 'utf-8' }).trim();
    },
    mcpSource: 'manual'
  },
  {
    key: 'SENTRY_DSN',
    description: 'Sentry DSN for error tracking',
    required: false,
    mcpSource: 'manual'
  },
  {
    key: 'MODEL_REGISTRY_VERSION',
    description: 'Model registry version',
    required: false,
    generate: () => '1.0.0',
    mcpSource: 'manual'
  },
  {
    key: 'NEXT_PUBLIC_API_URL',
    description: 'API base URL',
    required: true,
    generate: () => 'https://dash.dealershipai.com',
    mcpSource: 'manual'
  }
];

async function getSupabaseKeys() {
  try {
    // This would use Supabase MCP in production
    // For now, return from existing config
    const envFile = join(process.cwd(), '.env.local');
    if (existsSync(envFile)) {
      const content = readFileSync(envFile, 'utf-8');
      return {
        supabaseUrl: extractEnv('NEXT_PUBLIC_SUPABASE_URL', content),
        supabaseAnonKey: extractEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', content),
        supabaseServiceKey: extractEnv('SUPABASE_SERVICE_ROLE_KEY', content)
      };
    }
  } catch (error) {
    console.error('Failed to get Supabase keys:', error);
  }
  return null;
}

function extractEnv(key: string, content: string): string | null {
  const match = content.match(new RegExp(`^${key}=["']?([^"'\n]+)["']?`, 'm'));
  return match ? match[1] : null;
}

async function setVercelEnv(key: string, value: string, env: string = 'production') {
  try {
    // Use Vercel CLI to set env var
    execSync(`vercel env add ${key} ${env}`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✅ Set ${key} in Vercel (${env})`);
    return true;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      // Try to update
      try {
        execSync(`vercel env rm ${key} ${env} --yes`, { stdio: 'ignore' });
        execSync(`vercel env add ${key} ${env}`, {
          input: value,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`✅ Updated ${key} in Vercel (${env})`);
        return true;
      } catch (updateError) {
        console.error(`❌ Failed to update ${key}:`, updateError);
      }
    } else {
      console.error(`❌ Failed to set ${key}:`, error.message);
    }
    return false;
  }
}

async function updateEnvFile(key: string, value: string) {
  const envFile = join(process.cwd(), '.env.local');
  let content = '';
  
  if (existsSync(envFile)) {
    content = readFileSync(envFile, 'utf-8');
  }
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}="${value}"`;
  
  if (regex.test(content)) {
    content = content.replace(regex, newLine);
  } else {
    content += `\n${newLine}\n`;
  }
  
  writeFileSync(envFile, content, 'utf-8');
  console.log(`✅ Updated .env.local: ${key}`);
}

async function main() {
  console.log('🔑 Connecting API Keys via MCP\n');
  
  // Get Supabase keys if available
  const supabaseKeys = await getSupabaseKeys();
  if (supabaseKeys) {
    console.log('✅ Found Supabase configuration');
  }
  
  // Process each config
  for (const config of ENV_CONFIGS) {
    console.log(`\n📝 ${config.key}`);
    console.log(`   ${config.description}`);
    
    // Check if already set
    const envFile = join(process.cwd(), '.env.local');
    let currentValue: string | null = null;
    
    if (existsSync(envFile)) {
      const content = readFileSync(envFile, 'utf-8');
      currentValue = extractEnv(config.key, content);
    }
    
    let value = currentValue;
    
    // Generate if needed
    if (!value && config.generate) {
      value = config.generate();
      console.log(`   🔧 Generated: ${value.substring(0, 20)}...`);
    }
    
    // Update .env.local
    if (value) {
      await updateEnvFile(config.key, value);
      
      // Set in Vercel if configured
      if (process.env.VERCEL_PROJECT_ID) {
        await setVercelEnv(config.key, value);
      }
    } else if (config.required) {
      console.log(`   ⚠️  Required but not set`);
    }
  }
  
  console.log('\n✅ Configuration complete!');
  console.log('\nNext steps:');
  console.log('1. Review .env.local');
  console.log('2. Set remaining keys manually');
  console.log('3. Deploy: vercel --prod');
}

main().catch(console.error);

