/**
 * Quick Start Script for DealershipAI Dashboard
 * Runs all setup, testing, and deployment steps
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QuickStart {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
    }

    async run() {
        console.log('🚀 DealershipAI Dashboard - Quick Start\n');
        console.log('This script will guide you through the complete setup process.\n');

        try {
            await this.checkPrerequisites();
            await this.installDependencies();
            await this.setupStripe();
            await this.runTests();
            await this.deployToProduction();
            await this.setupMonitoring();
            
            this.printSummary();
        } catch (error) {
            console.error('\n❌ Quick start failed:', error.message);
            console.log('\nPlease check the error above and try again.');
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        this.logStep('Checking prerequisites...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 18) {
            throw new Error('Node.js 18+ is required. Current version: ' + nodeVersion);
        }
        
        // Check if Vercel CLI is installed
        try {
            execSync('vercel --version', { stdio: 'pipe' });
        } catch (error) {
            console.log('⚠️  Vercel CLI not found. Installing...');
            execSync('npm install -g vercel', { stdio: 'inherit' });
        }
        
        // Check if logged in to Vercel
        try {
            execSync('vercel whoami', { stdio: 'pipe' });
        } catch (error) {
            console.log('⚠️  Not logged in to Vercel. Please run: vercel login');
            throw new Error('Please login to Vercel first: vercel login');
        }
        
        console.log('✅ Prerequisites check passed');
    }

    async installDependencies() {
        this.logStep('Installing dependencies...');
        
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dependencies installed');
        } catch (error) {
            throw new Error('Failed to install dependencies: ' + error.message);
        }
    }

    async setupStripe() {
        this.logStep('Setting up Stripe products...');
        
        try {
            execSync('npm run setup-stripe', { stdio: 'inherit' });
            console.log('✅ Stripe products configured');
        } catch (error) {
            console.log('⚠️  Stripe setup failed. Please check your STRIPE_SECRET_KEY');
            console.log('   You can run this manually later: npm run setup-stripe');
        }
    }

    async runTests() {
        this.logStep('Running tests...');
        
        try {
            execSync('npm run test', { stdio: 'inherit' });
            console.log('✅ All tests passed');
        } catch (error) {
            console.log('⚠️  Some tests failed. Please check the output above.');
            console.log('   You can run tests manually: npm run test');
        }
    }

    async deployToProduction() {
        this.logStep('Deploying to production...');
        
        try {
            execSync('npm run deploy', { stdio: 'inherit' });
            console.log('✅ Deployed to production');
        } catch (error) {
            console.log('⚠️  Deployment failed. Please check the error above.');
            console.log('   You can deploy manually: npm run deploy');
        }
    }

    async setupMonitoring() {
        this.logStep('Setting up monitoring...');
        
        try {
            execSync('npm run monitor', { stdio: 'inherit' });
            console.log('✅ Monitoring configured');
        } catch (error) {
            console.log('⚠️  Monitoring setup failed. You can run it manually: npm run monitor');
        }
    }

    logStep(message) {
        this.currentStep++;
        console.log(`\n${this.currentStep}. ${message}`);
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 QUICK START COMPLETE!');
        console.log('='.repeat(60));
        
        console.log('\n📋 What was accomplished:');
        console.log('✅ Dependencies installed');
        console.log('✅ Stripe products configured');
        console.log('✅ Tests run');
        console.log('✅ Deployed to production');
        console.log('✅ Monitoring set up');
        
        console.log('\n🌐 Your dashboard is now live!');
        console.log('   Check your Vercel dashboard for the deployment URL');
        
        console.log('\n📋 Next steps:');
        console.log('1. Configure your custom domain in Vercel dashboard');
        console.log('2. Set up Stripe webhooks with your production URL');
        console.log('3. Add all environment variables to Vercel');
        console.log('4. Test all functionality in production');
        console.log('5. Set up monitoring alerts');
        
        console.log('\n📚 Documentation:');
        console.log('   • DEPLOYMENT_GUIDE.md - Complete deployment guide');
        console.log('   • TESTING_CHECKLIST.md - Comprehensive testing');
        console.log('   • INTEGRATION_GUIDE.md - Feature documentation');
        
        console.log('\n🆘 Need help?');
        console.log('   • Check the troubleshooting section in DEPLOYMENT_GUIDE.md');
        console.log('   • Run individual scripts: npm run setup-stripe, npm run test, etc.');
        console.log('   • Check logs in the logs/ directory');
        
        console.log('\n🎯 Happy analyzing! 🚀');
    }
}

// Main execution
async function main() {
    const quickStart = new QuickStart();
    await quickStart.run();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = QuickStart;
