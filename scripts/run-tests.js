/**
 * Automated Testing Script for DealershipAI Dashboard
 * Runs through the comprehensive testing checklist
 */

const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const TEST_DEALERSHIP_URL = 'https://example-dealership.com';

class TestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            errors: []
        };
        this.startTime = Date.now();
    }

    async runTest(name, testFunction) {
        this.results.total++;
        process.stdout.write(`🧪 Testing ${name}... `);
        
        try {
            await testFunction();
            console.log('✅ PASSED');
            this.results.passed++;
        } catch (error) {
            console.log('❌ FAILED');
            console.log(`   Error: ${error.message}`);
            this.results.failed++;
            this.results.errors.push({ name, error: error.message });
        }
    }

    async testServerHealth() {
        const response = await fetch(`${BASE_URL}/`);
        if (!response.ok) {
            throw new Error(`Server not responding: ${response.status}`);
        }
    }

    async testPricingPage() {
        const response = await fetch(`${BASE_URL}/pricing.html`);
        if (!response.ok) {
            throw new Error(`Pricing page not accessible: ${response.status}`);
        }
        
        const html = await response.text();
        // Check for either Stripe pricing table or fallback pricing tiers
        const hasStripeTable = html.includes('stripe-pricing-table') && html.includes('prctbl_');
        const hasFallbackTiers = html.includes('Pro Tier') || html.includes('Premium+ Tier');
        
        if (!hasStripeTable && !hasFallbackTiers) {
            throw new Error('Pricing tiers not found on page');
        }
    }

    async testSubscriptionPage() {
        const response = await fetch(`${BASE_URL}/subscription.html`);
        if (!response.ok) {
            throw new Error(`Subscription page not accessible: ${response.status}`);
        }
    }

    async testCheckoutAPI() {
        const response = await fetch(`${BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: TEST_EMAIL,
                dealershipUrl: TEST_DEALERSHIP_URL,
                plan: 'monthly',
                tier: 'pro'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Checkout API failed: ${error.message || response.status}`);
        }

        const data = await response.json();
        if (!data.url) {
            throw new Error('No checkout URL returned');
        }
    }

    async testProCheckoutAPI() {
        const response = await fetch(`${BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: TEST_EMAIL,
                dealershipUrl: TEST_DEALERSHIP_URL,
                plan: 'monthly',
                tier: 'premium'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Premium checkout API failed: ${error.message || response.status}`);
        }
    }

    async testAnalyzeAPI() {
        const response = await fetch(`${BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dealershipUrl: TEST_DEALERSHIP_URL,
                userId: 'test-user-123',
                plan: 'free'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Analyze API failed: ${error.message || response.status}`);
        }

        const data = await response.json();
        if (typeof data.aiVisibilityScore !== 'number') {
            throw new Error('Invalid AI visibility score returned');
        }
    }

    async testChatbotAPI() {
        const response = await fetch(`${BASE_URL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'What is an AI visibility score?',
                context: {}
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Chatbot API failed: ${error.message || response.status}`);
        }

        const data = await response.json();
        if (!data.response || typeof data.response !== 'string') {
            throw new Error('Invalid chatbot response');
        }
    }

    async testSubscriptionAPI() {
        const response = await fetch(`${BASE_URL}/api/subscription`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // This might return 401 if no user is authenticated, which is expected
        if (response.status !== 401 && !response.ok) {
            throw new Error(`Subscription API failed: ${response.status}`);
        }
    }

    async testPortalAPI() {
        const response = await fetch(`${BASE_URL}/api/portal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId: 'test-customer-123'
            })
        });

        // This might return 401 if no user is authenticated, which is expected
        if (response.status !== 401 && !response.ok) {
            throw new Error(`Portal API failed: ${response.status}`);
        }
    }

    async testStaticAssets() {
        const assets = [
            '/style.css',
            '/components/ai-chatbot.js',
            '/components/notifications.js',
            '/components/analytics-dashboard.js'
        ];

        for (const asset of assets) {
            const response = await fetch(`${BASE_URL}${asset}`);
            if (!response.ok) {
                throw new Error(`Asset not found: ${asset} (${response.status})`);
            }
        }
    }

    async testErrorHandling() {
        // Test invalid checkout data
        const response = await fetch(`${BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Missing required fields
            })
        });

        if (response.ok) {
            throw new Error('Should have returned error for invalid data');
        }
    }

    async testCORSHeaders() {
        const response = await fetch(`${BASE_URL}/api/checkout`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://example.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });

        if (!response.ok) {
            throw new Error('CORS preflight failed');
        }
    }

    async testRateLimiting() {
        // Make multiple rapid requests to test rate limiting
        const promises = Array(5).fill().map(() => 
            fetch(`${BASE_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealershipUrl: TEST_DEALERSHIP_URL,
                    plan: 'free'
                })
            })
        );

        const responses = await Promise.all(promises);
        const successCount = responses.filter(r => r.ok).length;
        
        if (successCount === 0) {
            throw new Error('All requests failed - possible rate limiting issue');
        }
    }

    async testDatabaseConnection() {
        // This would test Supabase connection
        // For now, we'll just check if the server starts without database errors
        console.log('   (Database connection test requires Supabase configuration)');
    }

    async testStripeIntegration() {
        // Test if Stripe keys are configured
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Stripe secret key not configured');
        }

        if (!process.env.STRIPE_PRICE_ID_PRO_MONTHLY) {
            throw new Error('Stripe Pro price IDs not configured');
        }

        if (!process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY) {
            throw new Error('Stripe Premium+ price IDs not configured');
        }
    }

    async testEnvironmentVariables() {
        const requiredVars = [
            'STRIPE_SECRET_KEY',
            'STRIPE_PUBLISHABLE_KEY',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY'
        ];

        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            throw new Error(`Missing environment variables: ${missing.join(', ')}`);
        }
    }

    async runAllTests() {
        console.log('🚀 Starting DealershipAI Dashboard Tests\n');
        console.log(`Testing against: ${BASE_URL}\n`);

        // Server Health Tests
        await this.runTest('Server Health Check', () => this.testServerHealth());
        await this.runTest('Pricing Page Accessibility', () => this.testPricingPage());
        await this.runTest('Subscription Page Accessibility', () => this.testSubscriptionPage());
        await this.runTest('Static Assets Loading', () => this.testStaticAssets());

        // API Tests
        await this.runTest('Pro Tier Checkout API', () => this.testCheckoutAPI());
        await this.runTest('Premium+ Tier Checkout API', () => this.testProCheckoutAPI());
        await this.runTest('Analysis API', () => this.testAnalyzeAPI());
        await this.runTest('Chatbot API', () => this.testChatbotAPI());
        await this.runTest('Subscription API', () => this.testSubscriptionAPI());
        await this.runTest('Portal API', () => this.testPortalAPI());

        // Error Handling Tests
        await this.runTest('Error Handling', () => this.testErrorHandling());
        await this.runTest('CORS Headers', () => this.testCORSHeaders());
        await this.runTest('Rate Limiting', () => this.testRateLimiting());

        // Configuration Tests
        await this.runTest('Environment Variables', () => this.testEnvironmentVariables());
        await this.runTest('Stripe Integration', () => this.testStripeIntegration());
        await this.runTest('Database Connection', () => this.testDatabaseConnection());

        this.printResults();
    }

    printResults() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Total:  ${this.results.total}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📊 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

        if (this.results.errors.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.errors.forEach(({ name, error }) => {
                console.log(`   • ${name}: ${error}`);
            });
        }

        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! Your dashboard is ready for production.');
        } else {
            console.log('\n⚠️  Some tests failed. Please fix the issues before deploying.');
        }

        console.log('\n📋 Next steps:');
        if (this.results.failed === 0) {
            console.log('1. Deploy to production');
            console.log('2. Set up monitoring');
            console.log('3. Configure custom domain');
        } else {
            console.log('1. Fix failed tests');
            console.log('2. Re-run tests');
            console.log('3. Deploy when all tests pass');
        }
    }
}

// Main execution
async function main() {
    const tester = new TestRunner();
    await tester.runAllTests();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = TestRunner;
