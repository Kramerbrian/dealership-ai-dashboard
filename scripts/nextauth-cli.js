#!/usr/bin/env node

/**
 * NextAuth CLI Tool for DealershipAI Dashboard
 * Provides easy management of authentication configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class NextAuthCLI {
  constructor() {
    this.projectRoot = process.cwd();
    this.authConfigPath = path.join(this.projectRoot, 'lib/auth.ts');
    this.envPath = path.join(this.projectRoot, '.env.local');
  }

  // Initialize NextAuth configuration
  init() {
    console.log('🚀 Initializing NextAuth for DealershipAI Dashboard...');
    
    // Create auth configuration
    this.createAuthConfig();
    
    // Create environment template
    this.createEnvTemplate();
    
    // Install dependencies
    this.installDependencies();
    
    console.log('✅ NextAuth initialization complete!');
    console.log('📝 Next steps:');
    console.log('   1. Configure your OAuth providers in .env.local');
    console.log('   2. Run: npm run auth:setup');
    console.log('   3. Test authentication: npm run auth:test');
  }

  // Create NextAuth configuration
  createAuthConfig() {
    const authConfig = `import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Add your user validation logic here
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
`;

    fs.writeFileSync(this.authConfigPath, authConfig);
    console.log('✅ Created auth configuration at lib/auth.ts');
  }

  // Create environment template
  createEnvTemplate() {
    const envTemplate = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dealershipai
`;

    if (!fs.existsSync(this.envPath)) {
      fs.writeFileSync(this.envPath, envTemplate);
      console.log('✅ Created environment template at .env.local');
    } else {
      console.log('⚠️  .env.local already exists, skipping...');
    }
  }

  // Install required dependencies
  installDependencies() {
    const dependencies = [
      'next-auth',
      '@next-auth/prisma-adapter',
      '@auth/prisma-adapter',
      'bcryptjs',
      '@types/bcryptjs'
    ];

    console.log('📦 Installing NextAuth dependencies...');
    try {
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.error('❌ Error installing dependencies:', error.message);
    }
  }

  // Setup OAuth providers
  setupProviders() {
    console.log('🔧 Setting up OAuth providers...');
    
    const providers = [
      {
        name: 'Google',
        url: 'https://console.developers.google.com/',
        steps: [
          '1. Go to Google Cloud Console',
          '2. Create a new project or select existing',
          '3. Enable Google+ API',
          '4. Create OAuth 2.0 credentials',
          '5. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google'
        ]
      },
      {
        name: 'GitHub',
        url: 'https://github.com/settings/developers',
        steps: [
          '1. Go to GitHub Settings > Developer settings',
          '2. Click "New OAuth App"',
          '3. Set Authorization callback URL: http://localhost:3000/api/auth/callback/github'
        ]
      }
    ];

    providers.forEach(provider => {
      console.log(`\n📋 ${provider.name} Setup:`);
      console.log(`   URL: ${provider.url}`);
      provider.steps.forEach(step => console.log(`   ${step}`));
    });
  }

  // Test authentication
  testAuth() {
    console.log('🧪 Testing authentication setup...');
    
    // Load environment variables from .env.local
    require('dotenv').config({ path: '.env.local' });
    
    // Check if auth config exists
    if (!fs.existsSync(this.authConfigPath)) {
      console.log('❌ Auth configuration not found. Run: npm run auth:init');
      return;
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:', missingVars.join(', '));
      console.log('   Please configure them in .env.local');
    } else {
      console.log('✅ All required environment variables are set');
    }

    console.log('\n🚀 To test authentication:');
    console.log('   1. Start development server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/api/auth/signin');
  }

  // Generate secret key
  generateSecret() {
    const crypto = require('crypto');
    const secret = crypto.randomBytes(32).toString('hex');
    console.log('🔐 Generated NextAuth secret:');
    console.log(`NEXTAUTH_SECRET=${secret}`);
    return secret;
  }

  // Deploy to Vercel
  deployToVercel() {
    console.log('🚀 Deploying authentication to Vercel...');
    
    const envVars = [
      'NEXTAUTH_URL=https://dash.dealershipai.com',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'DATABASE_URL'
    ];

    console.log('📝 Add these environment variables to Vercel:');
    envVars.forEach(envVar => console.log(`   ${envVar}`));
    
    console.log('\n🔧 To add them:');
    console.log('   1. Go to Vercel Dashboard > Project Settings > Environment Variables');
    console.log('   2. Add each variable for Production environment');
    console.log('   3. Redeploy: vercel --prod');
  }
}

// CLI Interface
const cli = new NextAuthCLI();
const command = process.argv[2];

switch (command) {
  case 'init':
    cli.init();
    break;
  case 'setup':
    cli.setupProviders();
    break;
  case 'test':
    cli.testAuth();
    break;
  case 'secret':
    cli.generateSecret();
    break;
  case 'deploy':
    cli.deployToVercel();
    break;
  default:
    console.log(`
🔐 NextAuth CLI for DealershipAI Dashboard

Usage: node scripts/nextauth-cli.js <command>

Commands:
  init     Initialize NextAuth configuration
  setup    Show OAuth provider setup instructions
  test     Test authentication configuration
  secret   Generate a new secret key
  deploy   Show Vercel deployment instructions

Examples:
  node scripts/nextauth-cli.js init
  node scripts/nextauth-cli.js test
  node scripts/nextauth-cli.js secret
`);
}
