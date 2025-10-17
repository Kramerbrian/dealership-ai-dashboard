#!/usr/bin/env node

/**
 * Test PageSpeed Insights API directly
 */

const https = require('https');

const API_KEY = 'AQ.Ab8RN6KQBs2i2PtIK2Js2CCLY10PcK3ibTk8tpONbUs-SugQ8Q';
const TEST_URL = 'https://dealershipai.com';

console.log('🧪 Testing PageSpeed Insights API');
console.log('==================================');
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`🌐 Test URL: ${TEST_URL}`);
console.log('');

const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(TEST_URL)}&key=${API_KEY}&strategy=mobile`;

console.log('📡 Making API request...');
console.log(`URL: ${apiUrl}`);
console.log('');

https.get(apiUrl, (res) => {
  let data = '';
  
  console.log(`📊 Response Status: ${res.statusCode}`);
  console.log(`📋 Response Headers:`, res.headers);
  console.log('');
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.log('❌ API Error:');
        console.log(`   Code: ${response.error.code}`);
        console.log(`   Message: ${response.error.message}`);
        console.log(`   Status: ${response.error.status}`);
        
        if (response.error.code === 403) {
          console.log('');
          console.log('🔧 Possible Solutions:');
          console.log('1. Enable PageSpeed Insights API in Google Cloud Console');
          console.log('2. Check if API key has proper permissions');
          console.log('3. Verify API key is correct');
        }
      } else if (response.lighthouseResult) {
        console.log('✅ PageSpeed API Working!');
        console.log('');
        
        const categories = response.lighthouseResult.categories;
        console.log('📊 Performance Scores:');
        console.log(`   🚀 Performance: ${Math.round((categories.performance?.score || 0) * 100)}%`);
        console.log(`   ♿ Accessibility: ${Math.round((categories.accessibility?.score || 0) * 100)}%`);
        console.log(`   🏆 Best Practices: ${Math.round((categories['best-practices']?.score || 0) * 100)}%`);
        console.log(`   🔍 SEO: ${Math.round((categories.seo?.score || 0) * 100)}%`);
        
        const audits = response.lighthouseResult.audits;
        console.log('');
        console.log('⚡ Core Web Vitals:');
        console.log(`   📱 First Contentful Paint: ${audits['first-contentful-paint']?.displayValue || 'N/A'}`);
        console.log(`   🎯 Largest Contentful Paint: ${audits['largest-contentful-paint']?.displayValue || 'N/A'}`);
        console.log(`   📐 Cumulative Layout Shift: ${audits['cumulative-layout-shift']?.displayValue || 'N/A'}`);
        
      } else {
        console.log('❓ Unexpected response format:');
        console.log(JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.log('❌ Parse Error:');
      console.log(`   ${error.message}`);
      console.log('');
      console.log('📄 Raw Response:');
      console.log(data.substring(0, 500) + '...');
    }
  });
}).on('error', (error) => {
  console.log('❌ Network Error:');
  console.log(`   ${error.message}`);
});
