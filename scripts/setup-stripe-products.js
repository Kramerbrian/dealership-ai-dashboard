/**
 * Stripe Products Setup Script
 * Automatically creates products and prices for DealershipAI pricing tiers
 */

const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
});

// Product configurations
const PRODUCTS = [
    {
        name: 'DealershipAI Pro Plan',
        description: 'Professional AI optimization for growing dealerships. Includes comprehensive analytics, competitor tracking, and priority support.',
        prices: [
            {
                amount: 59900, // $599.00 in cents
                currency: 'usd',
                interval: 'month',
                nickname: 'Pro Monthly'
            }
        ],
        metadata: {
            plan: 'pro',
            analyses_per_month: 'unlimited',
            features: 'detailed_reports,competitor_tracking,priority_support,api_access'
        }
    },
    {
        name: 'DealershipAI Premium+ Plan',
        description: 'Enterprise-grade AI optimization with advanced features, white-label options, and dedicated support.',
        prices: [
            {
                amount: 99900, // $999.00 in cents
                currency: 'usd',
                interval: 'month',
                nickname: 'Premium+ Monthly'
            }
        ],
        metadata: {
            plan: 'premium',
            analyses_per_month: 'unlimited',
            features: 'detailed_reports,competitor_tracking,priority_support,api_access,white_label,dedicated_support'
        }
    }
];

async function setupStripeProducts() {
    console.log('🚀 Setting up Stripe products for DealershipAI...\n');

    try {
        const results = {
            products: [],
            priceIds: {}
        };

        for (const productConfig of PRODUCTS) {
            console.log(`📦 Creating product: ${productConfig.name}`);
            
            // Create product
            const product = await stripe.products.create({
                name: productConfig.name,
                description: productConfig.description,
                metadata: productConfig.metadata,
                active: true
            });

            console.log(`   ✅ Product created: ${product.id}`);

            // Create prices for this product
            const prices = [];
            for (const priceConfig of productConfig.prices) {
                console.log(`   💰 Creating ${priceConfig.nickname} price...`);
                
                const price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: priceConfig.amount,
                    currency: priceConfig.currency,
                    recurring: {
                        interval: priceConfig.interval
                    },
                    nickname: priceConfig.nickname,
                    metadata: {
                        plan: productConfig.metadata.plan,
                        interval: priceConfig.interval
                    }
                });

                console.log(`   ✅ Price created: ${price.id}`);
                prices.push(price);

                // Store price IDs for environment variables
                const planKey = productConfig.metadata.plan === 'pro' ? 'PRO' : 'PREMIUM';
                const key = `STRIPE_PRICE_ID_${planKey}_MONTHLY`;
                results.priceIds[key] = price.id;
            }

            results.products.push({
                product,
                prices
            });

            console.log(`   🎉 Product setup complete!\n`);
        }

        // Display results
        console.log('🎯 Setup Complete! Here are your price IDs:\n');
        console.log('Add these to your .env file:\n');
        console.log('# Stripe Price IDs');
        console.log('STRIPE_PRICE_ID_PRO_MONTHLY=' + (results.priceIds.STRIPE_PRICE_ID_PRO_MONTHLY || 'NOT_CREATED'));
        console.log('STRIPE_PRICE_ID_PREMIUM_MONTHLY=' + (results.priceIds.STRIPE_PRICE_ID_PREMIUM_MONTHLY || 'NOT_CREATED'));

        console.log('\n📋 Next steps:');
        console.log('1. Copy the price IDs above to your .env file');
        console.log('2. Update your Vercel environment variables');
        console.log('3. Test the checkout flow');
        console.log('4. Run the testing checklist');

        return results;

    } catch (error) {
        console.error('❌ Error setting up Stripe products:', error);
        throw error;
    }
}

// Test webhook endpoint
async function testWebhookEndpoint() {
    console.log('\n🔗 Testing webhook endpoint...');
    
    try {
        const webhookUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/webhooks/stripe`;
        console.log(`Webhook URL: ${webhookUrl}`);
        
        // Test if webhook endpoint is accessible
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'test',
                data: { test: true }
            })
        });

        if (response.ok) {
            console.log('✅ Webhook endpoint is accessible');
        } else {
            console.log('⚠️  Webhook endpoint returned:', response.status);
        }
    } catch (error) {
        console.log('⚠️  Could not test webhook endpoint:', error.message);
    }
}

// Main execution
async function main() {
    try {
        // Check if Stripe key is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
            console.log('Please add your Stripe secret key to .env file');
            process.exit(1);
        }

        // Setup products
        await setupStripeProducts();
        
        // Test webhook
        await testWebhookEndpoint();
        
        console.log('\n🎉 Stripe setup complete!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { setupStripeProducts, testWebhookEndpoint };
