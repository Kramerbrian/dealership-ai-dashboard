/**
 * Environment Variables Update Script
 * 
 * Updates all environment variable references to point to the master Supabase project
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface EnvUpdateConfig {
  oldProjectRef: string;
  newProjectRef: string;
  newAnonKey: string;
  newServiceKey: string;
  newDatabaseUrl: string;
}

class EnvVariableUpdater {
  private config: EnvUpdateConfig;
  private filesToUpdate: string[] = [];

  constructor(config: EnvUpdateConfig) {
    this.config = config;
    this.findFilesToUpdate();
  }

  private findFilesToUpdate(): void {
    const rootDir = process.cwd();
    
    // Find all files that might contain Supabase references
    const patterns = [
      '**/*.md',
      '**/*.txt',
      '**/*.env*',
      '**/*.js',
      '**/*.ts',
      '**/*.tsx',
      '**/*.json',
    ];

    patterns.forEach(pattern => {
      try {
        const files = execSync(`find ${rootDir} -name "${pattern}" -type f`, { encoding: 'utf8' })
          .split('\n')
          .filter(file => file.trim() && !file.includes('node_modules'));
        
        this.filesToUpdate.push(...files);
      } catch (error) {
        // Ignore errors for patterns that don't match
      }
    });

    // Remove duplicates
    this.filesToUpdate = [...new Set(this.filesToUpdate)];
  }

  async updateAllFiles(): Promise<void> {
    console.log('🔄 Updating environment variable references...');
    console.log(`📁 Found ${this.filesToUpdate.length} files to check`);

    let updatedFiles = 0;

    for (const filePath of this.filesToUpdate) {
      try {
        if (await this.updateFile(filePath)) {
          updatedFiles++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error);
      }
    }

    console.log(`✅ Updated ${updatedFiles} files`);
  }

  private async updateFile(filePath: string): Promise<boolean> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      let newContent = content;

      // Update Supabase URL references
      if (content.includes(this.config.oldProjectRef)) {
        newContent = newContent.replace(
          new RegExp(this.config.oldProjectRef, 'g'),
          this.config.newProjectRef
        );
        updated = true;
      }

      // Update environment variable templates
      const envUpdates = [
        {
          pattern: /NEXT_PUBLIC_SUPABASE_URL="https:\/\/[^"]+\.supabase\.co"/g,
          replacement: `NEXT_PUBLIC_SUPABASE_URL="${this.config.newProjectRef}"`,
        },
        {
          pattern: /NEXT_PUBLIC_SUPABASE_ANON_KEY="[^"]*"/g,
          replacement: `NEXT_PUBLIC_SUPABASE_ANON_KEY="${this.config.newAnonKey}"`,
        },
        {
          pattern: /SUPABASE_SERVICE_ROLE_KEY="[^"]*"/g,
          replacement: `SUPABASE_SERVICE_ROLE_KEY="${this.config.newServiceKey}"`,
        },
        {
          pattern: /DATABASE_URL="postgresql:\/\/[^"]+"/g,
          replacement: `DATABASE_URL="${this.config.newDatabaseUrl}"`,
        },
      ];

      envUpdates.forEach(({ pattern, replacement }) => {
        if (pattern.test(newContent)) {
          newContent = newContent.replace(pattern, replacement);
          updated = true;
        }
      });

      if (updated) {
        fs.writeFileSync(filePath, newContent);
        console.log(`  ✅ Updated: ${filePath}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`  ❌ Error reading ${filePath}:`, error);
      return false;
    }
  }

  generateNewEnvFile(): void {
    const envContent = `# DealershipAI Master Supabase Configuration
# Generated: ${new Date().toISOString()}

# Master Supabase Project
NEXT_PUBLIC_SUPABASE_URL="${this.config.newProjectRef}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${this.config.newAnonKey}"
SUPABASE_SERVICE_ROLE_KEY="${this.config.newServiceKey}"

# Database Connection
DATABASE_URL="${this.config.newDatabaseUrl}"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://dash.dealershipai.com"
NODE_ENV="production"

# Authentication
NEXTAUTH_URL="https://dash.dealershipai.com"
NEXTAUTH_SECRET="[GENERATE_NEW_SECRET]"

# AI Services
OPENAI_API_KEY="[YOUR_OPENAI_KEY]"
ANTHROPIC_API_KEY="[YOUR_ANTHROPIC_KEY]"

# Stripe (Production)
STRIPE_SECRET_KEY="[YOUR_STRIPE_SECRET]"
STRIPE_PUBLISHABLE_KEY="[YOUR_STRIPE_PUBLISHABLE]"
STRIPE_WEBHOOK_SECRET="[YOUR_STRIPE_WEBHOOK]"

# Session Limits
FREE_SESSION_LIMIT="0"
PRO_SESSION_LIMIT="50"
ENTERPRISE_SESSION_LIMIT="200"
`;

    const envPath = path.join(process.cwd(), '.env.master');
    fs.writeFileSync(envPath, envContent);
    console.log(`📄 Generated master environment file: ${envPath}`);
  }

  generateVercelEnvInstructions(): void {
    const vercelInstructions = `# Vercel Environment Variables - Master Supabase

## Add these to Vercel Dashboard:
## https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables

### Core Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL
${this.config.newProjectRef}

NEXT_PUBLIC_SUPABASE_ANON_KEY
${this.config.newAnonKey}

SUPABASE_SERVICE_ROLE_KEY
${this.config.newServiceKey}

DATABASE_URL
${this.config.newDatabaseUrl}

### Application Configuration
NEXT_PUBLIC_APP_URL
https://dash.dealershipai.com

NODE_ENV
production

NEXTAUTH_URL
https://dash.dealershipai.com

NEXTAUTH_SECRET
[GENERATE_NEW_SECRET_32_CHARS]

### AI Services
OPENAI_API_KEY
[YOUR_OPENAI_API_KEY]

ANTHROPIC_API_KEY
[YOUR_ANTHROPIC_API_KEY]

### Stripe (Production)
STRIPE_SECRET_KEY
[YOUR_STRIPE_SECRET_KEY]

STRIPE_PUBLISHABLE_KEY
[YOUR_STRIPE_PUBLISHABLE_KEY]

STRIPE_WEBHOOK_SECRET
[YOUR_STRIPE_WEBHOOK_SECRET]

### Session Limits
FREE_SESSION_LIMIT
0

PRO_SESSION_LIMIT
50

ENTERPRISE_SESSION_LIMIT
200
`;

    const vercelPath = path.join(process.cwd(), 'VERCEL_ENV_MASTER.md');
    fs.writeFileSync(vercelPath, vercelInstructions);
    console.log(`📄 Generated Vercel instructions: ${vercelPath}`);
  }
}

// CLI usage
async function main() {
  const command = process.argv[2];

  if (command === 'update') {
    const config: EnvUpdateConfig = {
      oldProjectRef: process.env.OLD_PROJECT_REF || 'vxrdvkhkombwlhjvtsmw',
      newProjectRef: process.env.NEW_PROJECT_REF || '',
      newAnonKey: process.env.NEW_ANON_KEY || '',
      newServiceKey: process.env.NEW_SERVICE_KEY || '',
      newDatabaseUrl: process.env.NEW_DATABASE_URL || '',
    };

    if (!config.newProjectRef) {
      console.error('❌ Please set NEW_PROJECT_REF environment variable');
      process.exit(1);
    }

    const updater = new EnvVariableUpdater(config);
    await updater.updateAllFiles();
    updater.generateNewEnvFile();
    updater.generateVercelEnvInstructions();
  } else {
    console.log('Usage:');
    console.log('  NEW_PROJECT_REF="your-new-project" npm run env:update');
    console.log('');
    console.log('Environment variables needed:');
    console.log('  NEW_PROJECT_REF - New Supabase project reference');
    console.log('  NEW_ANON_KEY - New anon key (optional)');
    console.log('  NEW_SERVICE_KEY - New service key (optional)');
    console.log('  NEW_DATABASE_URL - New database URL (optional)');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { EnvVariableUpdater };
