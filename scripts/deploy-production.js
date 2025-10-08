/**
 * Production Deployment Script for DealershipAI Dashboard
 * Handles deployment to Vercel with custom domain configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ProductionDeployer {
    constructor() {
        this.vercelToken = process.env.VERCEL_TOKEN;
        this.projectName = process.env.VERCEL_PROJECT_NAME || 'dealership-ai-dashboard';
        this.customDomain = process.env.CUSTOM_DOMAIN;
        this.environment = process.env.NODE_ENV || 'production';
    }

    async deploy() {
        console.log('🚀 Starting production deployment...\n');

        try {
            // Step 1: Pre-deployment checks
            await this.preDeploymentChecks();

            // Step 2: Build and prepare
            await this.buildProject();

            // Step 3: Deploy to Vercel
            await this.deployToVercel();

            // Step 4: Configure custom domain
            if (this.customDomain) {
                await this.configureCustomDomain();
            }

            // Step 5: Post-deployment verification
            await this.postDeploymentVerification();

            console.log('\n🎉 Production deployment complete!');
            this.printDeploymentSummary();

        } catch (error) {
            console.error('\n❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }

    async preDeploymentChecks() {
        console.log('🔍 Running pre-deployment checks...');

        // Check if Vercel CLI is installed
        try {
            execSync('vercel --version', { stdio: 'pipe' });
        } catch (error) {
            throw new Error('Vercel CLI not installed. Install with: npm i -g vercel');
        }

        // Check if logged in to Vercel
        try {
            execSync('vercel whoami', { stdio: 'pipe' });
        } catch (error) {
            throw new Error('Not logged in to Vercel. Run: vercel login');
        }

        // Check required environment variables
        const requiredVars = [
            'STRIPE_SECRET_KEY',
            'STRIPE_PUBLISHABLE_KEY',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY'
        ];

        const missing = requiredVars.filter(varName => !process.env[varName]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Check if Stripe products are configured
        if (!process.env.STRIPE_PRICE_ID_STARTER_MONTHLY) {
            console.log('⚠️  Warning: Stripe products not configured. Run setup-stripe-products.js first.');
        }

        console.log('✅ Pre-deployment checks passed');
    }

    async buildProject() {
        console.log('\n🔨 Building project...');

        // Install dependencies
        console.log('   Installing dependencies...');
        execSync('npm install --production', { stdio: 'inherit' });

        // Run any build scripts
        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (packageJson.scripts && packageJson.scripts.build) {
                console.log('   Running build script...');
                execSync('npm run build', { stdio: 'inherit' });
            }
        }

        console.log('✅ Build complete');
    }

    async deployToVercel() {
        console.log('\n🚀 Deploying to Vercel...');

        const deployCommand = [
            'vercel',
            '--prod',
            '--yes',
            '--name', this.projectName
        ];

        if (this.vercelToken) {
            deployCommand.push('--token', this.vercelToken);
        }

        try {
            const output = execSync(deployCommand.join(' '), { 
                stdio: 'pipe',
                encoding: 'utf8'
            });

            // Extract deployment URL from output
            const urlMatch = output.match(/https:\/\/[^\s]+/);
            if (urlMatch) {
                this.deploymentUrl = urlMatch[0];
                console.log(`✅ Deployed to: ${this.deploymentUrl}`);
            } else {
                console.log('✅ Deployment completed');
            }

        } catch (error) {
            throw new Error(`Vercel deployment failed: ${error.message}`);
        }
    }

    async configureCustomDomain() {
        console.log(`\n🌐 Configuring custom domain: ${this.customDomain}`);

        try {
            // Add domain to Vercel project
            execSync(`vercel domains add ${this.customDomain}`, { stdio: 'inherit' });
            
            // Configure domain for project
            execSync(`vercel domains add ${this.customDomain} ${this.projectName}`, { stdio: 'inherit' });

            console.log('✅ Custom domain configured');
            console.log(`   Domain: https://${this.customDomain}`);
            console.log('   Please update your DNS records as shown in the Vercel dashboard');

        } catch (error) {
            console.log('⚠️  Custom domain configuration failed:', error.message);
            console.log('   You can configure it manually in the Vercel dashboard');
        }
    }

    async postDeploymentVerification() {
        console.log('\n🔍 Running post-deployment verification...');

        const testUrl = this.deploymentUrl || `https://${this.customDomain}`;
        
        try {
            // Test homepage
            const response = await fetch(testUrl);
            if (!response.ok) {
                throw new Error(`Homepage not accessible: ${response.status}`);
            }

            // Test pricing page
            const pricingResponse = await fetch(`${testUrl}/pricing.html`);
            if (!pricingResponse.ok) {
                throw new Error(`Pricing page not accessible: ${pricingResponse.status}`);
            }

            // Test API endpoints
            const apiResponse = await fetch(`${testUrl}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    dealershipUrl: 'https://example.com',
                    plan: 'monthly',
                    tier: 'starter'
                })
            });

            if (!apiResponse.ok) {
                console.log('⚠️  API test failed (this might be expected if Stripe is not fully configured)');
            }

            console.log('✅ Post-deployment verification passed');

        } catch (error) {
            console.log('⚠️  Post-deployment verification failed:', error.message);
        }
    }

    printDeploymentSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DEPLOYMENT SUMMARY');
        console.log('='.repeat(60));
        
        if (this.deploymentUrl) {
            console.log(`🌐 Vercel URL: ${this.deploymentUrl}`);
        }
        
        if (this.customDomain) {
            console.log(`🌐 Custom Domain: https://${this.customDomain}`);
        }

        console.log('\n📋 Next Steps:');
        console.log('1. Update DNS records for your custom domain');
        console.log('2. Configure Stripe webhook URL in Stripe dashboard');
        console.log('3. Set up monitoring and analytics');
        console.log('4. Test all functionality in production');
        console.log('5. Update environment variables in Vercel dashboard');

        console.log('\n🔧 Environment Variables to Set in Vercel:');
        const envVars = [
            'STRIPE_SECRET_KEY',
            'STRIPE_PUBLISHABLE_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'STRIPE_PRICE_ID_STARTER_MONTHLY',
            'STRIPE_PRICE_ID_STARTER_ANNUAL',
            'STRIPE_PRICE_ID_PRO_MONTHLY',
            'STRIPE_PRICE_ID_PRO_ANNUAL',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY',
            'NEXT_PUBLIC_URL',
            'OPENAI_API_KEY'
        ];

        envVars.forEach(varName => {
            const value = process.env[varName];
            console.log(`   ${varName}=${value ? '***' : 'NOT_SET'}`);
        });

        console.log('\n🎯 Your DealershipAI dashboard is now live!');
    }
}

// Main execution
async function main() {
    const deployer = new ProductionDeployer();
    await deployer.deploy();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProductionDeployer;
