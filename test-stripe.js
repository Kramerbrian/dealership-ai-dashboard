// Test script for Stripe integration
// Run with: node test-stripe.js

const { stripe } = require('./lib/stripe');
const { supabaseAdmin } = require('./lib/supabase');

async function testStripeConnection() {
    try {
        console.log('🧪 Testing Stripe connection...');
        
        // Test Stripe connection by listing products
        const products = await stripe.products.list({ limit: 1 });
        console.log('✅ Stripe connection successful');
        console.log(`Found ${products.data.length} products`);
        
        return true;
    } catch (error) {
        console.error('❌ Stripe connection failed:', error.message);
        return false;
    }
}

async function testSupabaseConnection() {
    try {
        console.log('🧪 Testing Supabase connection...');
        
        // Test Supabase connection by querying users table
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
}

async function testCheckoutCreation() {
    try {
        console.log('🧪 Testing checkout creation...');
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_test',
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel',
        });
        
        console.log('✅ Checkout session created successfully');
        console.log(`Session ID: ${session.id}`);
        return true;
    } catch (error) {
        console.error('❌ Checkout creation failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Stripe integration tests...\n');
    
    const results = {
        stripe: await testStripeConnection(),
        supabase: await testSupabaseConnection(),
        checkout: await testCheckoutCreation()
    };
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`Stripe Connection: ${results.stripe ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Supabase Connection: ${results.supabase ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Checkout Creation: ${results.checkout ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Your Stripe integration is ready.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check your configuration.');
    }
    
    return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { runTests };

