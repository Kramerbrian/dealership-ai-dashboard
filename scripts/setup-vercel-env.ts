#!/usr/bin/env tsx

/**
 * DealershipAI Vercel Environment Setup Script
 * 
 * This script helps automate the setup of environment variables in Vercel
 * for the DealershipAI dashboard application.
 * 
 * Usage:
 *   npm run setup:env
 *   tsx scripts/setup-vercel-env.ts
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EnvVariable {
  name: string;
  description: string;
  required: boolean;
  example?: string;
  scope: 'production' | 'preview' | 'development' | 'all';
}

const ENVIRONMENT_VARIABLES: EnvVariable[] = [
  // Critical Variables (Required)
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL database connection string',
    required: true,
    example: 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres',
    scope: 'all'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    required: true,
    example: 'https://[PROJECT-REF].supabase.co',
    scope: 'all'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    required: true,
    example: 'eyJhbGc...',
    scope: 'all'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key',
    required: true,
    example: 'eyJhbGc...',
    scope: 'all'
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth.js secret for JWT signing',
    required: true,
    example: '[32-CHAR-SECRET]',
    scope: 'all'
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT secret for token signing',
    required: true,
    example: '[32-CHAR-SECRET]',
    scope: 'all'
  },
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API key for AI features',
    required: true,
    example: 'sk-[YOUR-OPENAI-KEY]',
    scope: 'all'
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    description: 'Upstash Redis REST URL',
    required: true,
    example: 'https://[REDIS-URL].upstash.io',
    scope: 'all'
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    description: 'Upstash Redis REST token',
    required: true,
    example: '[REDIS-TOKEN]',
    scope: 'all'
  },

  // App Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Main application URL',
    required: true,
    example: 'https://main.dealershipai.com',
    scope: 'all'
  },
  {
    name: 'NEXT_PUBLIC_DASHBOARD_URL',
    description: 'Dashboard application URL',
    required: true,
    example: 'https://dash.dealershipai.com',
    scope: 'all'
  },
  {
    name: 'NEXT_PUBLIC_MARKETING_URL',
    description: 'Marketing site URL',
    required: true,
    example: 'https://marketing.dealershipai.com',
    scope: 'all'
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'NextAuth.js callback URL',
    required: true,
    example: 'https://dash.dealershipai.com',
    scope: 'all'
  },

  // Optional Variables
  {
    name: 'ANTHROPIC_API_KEY',
    description: 'Anthropic API key for Claude integration',
    required: false,
    example: 'sk-ant-[YOUR-ANTHROPIC-KEY]',
    scope: 'all'
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth client ID',
    required: false,
    example: '[GOOGLE-OAUTH-CLIENT-ID]',
    scope: 'all'
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth client secret',
    required: false,
    example: '[GOOGLE-OAUTH-CLIENT-SECRET]',
    scope: 'all'
  },
  {
    name: 'GITHUB_CLIENT_ID',
    description: 'GitHub OAuth client ID',
    required: false,
    example: '[GITHUB-OAUTH-CLIENT-ID]',
    scope: 'all'
  },
  {
    name: 'GITHUB_CLIENT_SECRET',
    description: 'GitHub OAuth client secret',
    required: false,
    example: '[GITHUB-OAUTH-CLIENT-SECRET]',
    scope: 'all'
  },
  {
    name: 'RESEND_API_KEY',
    description: 'Resend email service API key',
    required: false,
    example: 're_[YOUR-RESEND-KEY]',
    scope: 'all'
  },
  {
    name: 'FROM_EMAIL',
    description: 'Default from email address',
    required: false,
    example: 'noreply@dealershipai.com',
    scope: 'all'
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for payments',
    required: false,
    example: 'sk_live_[KEY]',
    scope: 'all'
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key',
    required: false,
    example: 'pk_live_[KEY]',
    scope: 'all'
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook secret',
    required: false,
    example: 'whsec_[WEBHOOK-SECRET]',
    scope: 'all'
  },
  {
    name: 'NEXT_PUBLIC_GA',
    description: 'Google Analytics measurement ID',
    required: false,
    example: 'G-[MEASUREMENT-ID]',
    scope: 'all'
  },
  {
    name: 'SENTRY_DSN',
    description: 'Sentry error monitoring DSN',
    required: false,
    example: 'https://[DSN]@[ORG].ingest.sentry.io/[PROJECT]',
    scope: 'all'
  },
  {
    name: 'ENCRYPTION_KEY',
    description: 'Encryption key for sensitive data',
    required: false,
    example: '[64-CHAR-HEX-KEY]',
    scope: 'all'
  },
  {
    name: 'API_SECRET',
    description: 'API secret for request signatures',
    required: false,
    example: '[API-SECRET-FOR-SIGNATURES]',
    scope: 'all'
  }
];

class VercelEnvSetup {
  private projectPath: string;
  private isVercelProject: boolean;

  constructor() {
    this.projectPath = process.cwd();
    this.isVercelProject = existsSync(join(this.projectPath, '.vercel'));
  }

  /**
   * Check if Vercel CLI is installed
   */
  private checkVercelCLI(): boolean {
    try {
      execSync('vercel --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is logged into Vercel
   */
  private checkVercelAuth(): boolean {
    try {
      execSync('vercel whoami', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current Vercel project info
   */
  private getVercelProjectInfo(): { name: string; id: string } | null {
    try {
      const output = execSync('vercel ls', { encoding: 'utf8' });
      const lines = output.split('\n');
      const projectLine = lines.find(line => line.includes('dealership-ai-dashboard'));
      
      if (projectLine) {
        const parts = projectLine.trim().split(/\s+/);
        return {
          name: parts[0],
          id: parts[1] || 'unknown'
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate a secure random secret
   */
  private generateSecret(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Add environment variable to Vercel
   */
  private async addEnvVariable(name: string, value: string, environment: string): Promise<boolean> {
    try {
      const command = `vercel env add ${name} ${environment}`;
      execSync(command, { 
        input: value,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`✅ Added ${name} to ${environment}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add ${name} to ${environment}:`, error);
      return false;
    }
  }

  /**
   * Interactive setup for environment variables
   */
  private async interactiveSetup(): Promise<void> {
    console.log('\n🔧 Interactive Environment Setup\n');
    
    for (const envVar of ENVIRONMENT_VARIABLES) {
      if (!envVar.required) {
        const skip = await this.prompt(`Skip optional variable ${envVar.name}? (y/n): `);
        if (skip.toLowerCase() === 'y') continue;
      }

      console.log(`\n📝 Setting up: ${envVar.name}`);
      console.log(`   Description: ${envVar.description}`);
      if (envVar.example) {
        console.log(`   Example: ${envVar.example}`);
      }

      let value: string;
      if (envVar.name.includes('SECRET') && !envVar.name.includes('API_KEY')) {
        const generate = await this.prompt('Generate a random secret? (y/n): ');
        if (generate.toLowerCase() === 'y') {
          value = this.generateSecret();
          console.log(`   Generated: ${value}`);
        } else {
          value = await this.prompt('Enter value: ');
        }
      } else {
        value = await this.prompt('Enter value: ');
      }

      if (value.trim()) {
        await this.addEnvVariable(envVar.name, value.trim(), 'production');
      }
    }
  }

  /**
   * Setup from .env.local file
   */
  private async setupFromEnvFile(): Promise<void> {
    const envPath = join(this.projectPath, '.env.local');
    
    if (!existsSync(envPath)) {
      console.log('❌ .env.local file not found');
      return;
    }

    console.log('\n📁 Setting up from .env.local file\n');
    
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => {
        const [name, ...valueParts] = line.split('=');
        return {
          name: name.trim(),
          value: valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        };
      });

    for (const { name, value } of envVars) {
      if (value) {
        await this.addEnvVariable(name, value, 'production');
      }
    }
  }

  /**
   * Quick setup with critical variables only
   */
  private async quickSetup(): Promise<void> {
    console.log('\n⚡ Quick Setup - Critical Variables Only\n');
    
    const criticalVars = ENVIRONMENT_VARIABLES.filter(v => v.required);
    
    for (const envVar of criticalVars) {
      console.log(`\n📝 ${envVar.name}: ${envVar.description}`);
      if (envVar.example) {
        console.log(`   Example: ${envVar.example}`);
      }

      let value: string;
      if (envVar.name.includes('SECRET') && !envVar.name.includes('API_KEY')) {
        value = this.generateSecret();
        console.log(`   Generated: ${value}`);
      } else {
        value = await this.prompt('Enter value: ');
      }

      if (value.trim()) {
        await this.addEnvVariable(envVar.name, value.trim(), 'production');
      }
    }
  }

  /**
   * Simple prompt function
   */
  private async prompt(question: string): Promise<string> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  /**
   * Main setup function
   */
  async setup(): Promise<void> {
    console.log('🚀 DealershipAI Vercel Environment Setup\n');

    // Check prerequisites
    if (!this.checkVercelCLI()) {
      console.log('❌ Vercel CLI not found. Please install it first:');
      console.log('   npm i -g vercel');
      process.exit(1);
    }

    if (!this.checkVercelAuth()) {
      console.log('❌ Not logged into Vercel. Please login first:');
      console.log('   vercel login');
      process.exit(1);
    }

    const projectInfo = this.getVercelProjectInfo();
    if (projectInfo) {
      console.log(`📦 Project: ${projectInfo.name} (${projectInfo.id})`);
    } else {
      console.log('⚠️  Could not find dealership-ai-dashboard project');
    }

    // Choose setup method
    console.log('\nChoose setup method:');
    console.log('1. Quick setup (critical variables only)');
    console.log('2. Interactive setup (all variables)');
    console.log('3. Setup from .env.local file');
    console.log('4. Exit');

    const choice = await this.prompt('\nEnter choice (1-4): ');

    switch (choice) {
      case '1':
        await this.quickSetup();
        break;
      case '2':
        await this.interactiveSetup();
        break;
      case '3':
        await this.setupFromEnvFile();
        break;
      case '4':
        console.log('👋 Goodbye!');
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid choice');
        process.exit(1);
    }

    console.log('\n✅ Environment setup complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy your application: vercel --prod');
    console.log('2. Test your environment: curl https://your-app.vercel.app/api/health');
    console.log('3. Check Vercel dashboard for environment variables');
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new VercelEnvSetup();
  setup.setup().catch(console.error);
}

export default VercelEnvSetup;