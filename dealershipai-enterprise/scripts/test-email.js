const axios = require('axios');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('🧪 Testing Resend Email Integration...\n');

    // Test 1: Send test email
    console.log('1. Sending test email...');
    const testResponse = await axios.post('http://localhost:3000/api/email/send', {
      type: 'test',
      to: 'kramer177@gmail.com'
    });
    
    if (testResponse.data.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${testResponse.data.messageId}`);
    } else {
      console.log('❌ Test email failed:', testResponse.data.error);
    }

    console.log('\n2. Testing lead notification email...');
    
    // Test 2: Send lead notification
    const leadData = {
      leadId: 'test_lead_123',
      businessName: 'Premium Auto Dealership',
      website: 'https://premiumauto.com',
      email: 'kramer177@gmail.com',
      name: 'Brian Kramer',
      challenge: 'invisible',
      role: 'owner',
      dealershipName: 'Premium Auto Dealership'
    };

    const leadResponse = await axios.post('http://localhost:3000/api/email/send', {
      type: 'lead-notification',
      data: leadData
    });
    
    if (leadResponse.data.success) {
      console.log('✅ Lead notification sent successfully!');
      console.log(`   Message ID: ${leadResponse.data.messageId}`);
    } else {
      console.log('❌ Lead notification failed:', leadResponse.data.error);
    }

    console.log('\n3. Testing welcome email...');
    
    // Test 3: Send welcome email
    const welcomeResponse = await axios.post('http://localhost:3000/api/email/send', {
      type: 'welcome-email',
      data: leadData
    });
    
    if (welcomeResponse.data.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log(`   Message ID: ${welcomeResponse.data.messageId}`);
    } else {
      console.log('❌ Welcome email failed:', welcomeResponse.data.error);
    }

    console.log('\n4. Testing follow-up email...');
    
    // Test 4: Send follow-up email
    const followUpResponse = await axios.post('http://localhost:3000/api/email/send', {
      type: 'follow-up',
      followUpType: 'day1',
      data: leadData
    });
    
    if (followUpResponse.data.success) {
      console.log('✅ Follow-up email sent successfully!');
      console.log(`   Message ID: ${followUpResponse.data.messageId}`);
    } else {
      console.log('❌ Follow-up email failed:', followUpResponse.data.error);
    }

    console.log('\n🎉 Email testing complete!');
    console.log('Check your email inbox for the test messages.');

  } catch (error) {
    console.error('❌ Email test failed:', error.response?.data || error.message);
  }
}

// Test lead capture with email integration
async function testLeadCapture() {
  try {
    console.log('\n🧪 Testing Lead Capture with Email Integration...\n');

    const leadData = {
      website: 'https://premiumauto.com',
      dealership_name: 'Premium Auto Dealership',
      challenge: 'invisible',
      email: 'kramer177@gmail.com',
      name: 'Brian Kramer',
      role: 'owner'
    };

    const response = await axios.post('http://localhost:3000/api/leads', leadData);
    
    if (response.data.success) {
      console.log('✅ Lead captured successfully!');
      console.log(`   Lead ID: ${response.data.leadId}`);
      console.log('   Email notifications should have been sent automatically.');
    } else {
      console.log('❌ Lead capture failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Lead capture test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  await testEmail();
  await testLeadCapture();
}

runAllTests();

