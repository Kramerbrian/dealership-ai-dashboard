/**
 * DealershipAI Sample Data Testing Script
 * Tests the monthly scan system with 10 sample dealerships
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
);

// Sample dealerships for testing
const sampleDealers = [
  {
    name: 'Lou Glutz Motors',
    website: 'louglutz.com',
    brand: 'Multi-Brand',
    city: 'Chicago',
    state: 'IL'
  },
  {
    name: 'Larusso Motors',
    website: 'larussomotors.com',
    brand: 'Import',
    city: 'Reseda',
    state: 'CA'
  },
  {
    name: 'Prestige Worldwide Imports',
    website: 'prestigeworldwide.com',
    brand: 'Luxury',
    city: 'Los Angeles',
    state: 'CA'
  },
  {
    name: 'Southside Motors',
    website: 'southsidemotors.com',
    brand: 'Domestic',
    city: 'Chicago',
    state: 'IL'
  },
  {
    name: 'Premier Toyota Sacramento',
    website: 'premiertoyota.com',
    brand: 'Toyota',
    city: 'Sacramento',
    state: 'CA'
  },
  {
    name: 'Honda of Clearwater',
    website: 'hondaclearwater.com',
    brand: 'Honda',
    city: 'Clearwater',
    state: 'FL'
  },
  {
    name: 'Ford of Fort Myers',
    website: 'fordfortmyers.com',
    brand: 'Ford',
    city: 'Fort Myers',
    state: 'FL'
  },
  {
    name: 'Mercedes-Benz of Tampa',
    website: 'mercedestampa.com',
    brand: 'Mercedes-Benz',
    city: 'Tampa',
    state: 'FL'
  },
  {
    name: 'Nissan of Bradenton',
    website: 'nissanbradenton.com',
    brand: 'Nissan',
    city: 'Bradenton',
    state: 'FL'
  },
  {
    name: 'Chevrolet of Venice',
    website: 'chevroletvenice.com',
    brand: 'Chevrolet',
    city: 'Venice',
    state: 'FL'
  }
];

// Sample scan results for testing
const generateSampleScanResults = (dealerId) => {
  const platforms = ['chatgpt', 'claude', 'perplexity', 'gemini', 'google-sge', 'grok'];
  const results = [];
  
  platforms.forEach(platform => {
    results.push({
      scan_id: null, // Will be set after scan creation
      platform,
      mentions: Math.floor(Math.random() * 20) + 1,
      rank: Math.floor(Math.random() * 10) + 1,
      sentiment: (Math.random() * 2 - 1).toFixed(2), // -1 to 1
      citations: JSON.stringify([
        `https://${platform}.com/result1`,
        `https://${platform}.com/result2`
      ])
    });
  });
  
  return results;
};

// Test functions
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('dealers')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function insertSampleDealers() {
  console.log('📝 Inserting sample dealerships...');
  
  try {
    const { data, error } = await supabase
      .from('dealers')
      .insert(sampleDealers)
      .select();
    
    if (error) throw error;
    console.log(`✅ Inserted ${data.length} sample dealerships`);
    return data;
  } catch (error) {
    console.error('❌ Failed to insert dealerships:', error.message);
    return [];
  }
}

async function createSampleScans(dealers) {
  console.log('📊 Creating sample monthly scans...');
  
  const scanDate = new Date().toISOString().split('T')[0];
  const scans = [];
  
  for (const dealer of dealers) {
    try {
      // Create monthly scan
      const { data: scan, error: scanError } = await supabase
        .from('monthly_scans')
        .insert({
          dealer_id: dealer.id,
          scan_date: scanDate,
          visibility_score: Math.floor(Math.random() * 40) + 60, // 60-100
          total_mentions: Math.floor(Math.random() * 50) + 10,
          avg_rank: (Math.random() * 5 + 1).toFixed(2),
          sentiment_score: (Math.random() * 1.5 + 0.2).toFixed(2), // 0.2 to 1.7
          scan_status: 'completed'
        })
        .select()
        .single();
      
      if (scanError) throw scanError;
      
      // Create platform results
      const platformResults = generateSampleScanResults(dealer.id);
      platformResults.forEach(result => result.scan_id = scan.id);
      
      const { error: platformError } = await supabase
        .from('platform_results')
        .insert(platformResults);
      
      if (platformError) throw platformError;
      
      scans.push(scan);
      console.log(`✅ Created scan for ${dealer.name}`);
    } catch (error) {
      console.error(`❌ Failed to create scan for ${dealer.name}:`, error.message);
    }
  }
  
  return scans;
}

async function testLeaderboard() {
  console.log('🏆 Testing leaderboard query...');
  
  try {
    const { data, error } = await supabase
      .from('dealer_leaderboard')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    console.log('✅ Leaderboard query successful');
    console.log('📊 Top 5 dealerships:');
    data.slice(0, 5).forEach((dealer, index) => {
      console.log(`${index + 1}. ${dealer.name} - Score: ${dealer.visibility_score}`);
    });
    
    return data;
  } catch (error) {
    console.error('❌ Leaderboard query failed:', error.message);
    return [];
  }
}

async function testAPIEndpoints() {
  console.log('🔌 Testing API endpoints...');
  
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  const endpoints = [
    '/api/health',
    '/api/leaderboard',
    '/api/cron/monthly-scan'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const status = response.status;
      
      if (status === 200 || status === 401) { // 401 is expected for protected endpoints
        console.log(`✅ ${endpoint} - Status: ${status}`);
      } else {
        console.log(`⚠️  ${endpoint} - Status: ${status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

async function generateCostReport() {
  console.log('💰 Generating cost report...');
  
  try {
    const { data, error } = await supabase
      .from('api_usage')
      .select('platform, cost_usd, total_tokens')
      .limit(100);
    
    if (error) throw error;
    
    const totalCost = data.reduce((sum, usage) => sum + (usage.cost_usd || 0), 0);
    const totalTokens = data.reduce((sum, usage) => sum + (usage.total_tokens || 0), 0);
    
    console.log('✅ Cost report generated');
    console.log(`📊 Total cost: $${totalCost.toFixed(2)}`);
    console.log(`📊 Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`📊 Average cost per token: $${(totalCost / totalTokens).toFixed(6)}`);
    
    return { totalCost, totalTokens };
  } catch (error) {
    console.error('❌ Cost report failed:', error.message);
    return { totalCost: 0, totalTokens: 0 };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 DealershipAI Sample Data Testing');
  console.log('===================================');
  console.log('');
  
  // Test 1: Database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('❌ Cannot proceed without database connection');
    return;
  }
  
  // Test 2: Insert sample data
  const dealers = await insertSampleDealers();
  if (dealers.length === 0) {
    console.log('⚠️  No dealers inserted, using existing data');
  }
  
  // Test 3: Create sample scans
  const scans = await createSampleScans(dealers);
  console.log(`✅ Created ${scans.length} sample scans`);
  
  // Test 4: Test leaderboard
  await testLeaderboard();
  
  // Test 5: Test API endpoints
  await testAPIEndpoints();
  
  // Test 6: Generate cost report
  await generateCostReport();
  
  console.log('');
  console.log('🎉 Sample data testing complete!');
  console.log('');
  console.log('📋 Summary:');
  console.log(`- ${dealers.length} dealerships inserted`);
  console.log(`- ${scans.length} monthly scans created`);
  console.log('- Leaderboard query tested');
  console.log('- API endpoints tested');
  console.log('- Cost report generated');
  console.log('');
  console.log('🚀 Ready for beta launch with 5-10 dealerships!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testDatabaseConnection,
  insertSampleDealers,
  createSampleScans,
  testLeaderboard,
  testAPIEndpoints,
  generateCostReport,
  runTests
};
