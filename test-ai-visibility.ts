import { analyzeAIVisibilityDetailed } from './src/lib/scoring/ai-visibility';

async function test() {
  console.log('🧪 Testing AI Visibility Module...\n');
  console.log('⚠️  Warning: This will cost ~$0.10 per domain');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const testDomains = [
    'terryreidhyundai.com'
    // Add more domains carefully - each costs ~$0.10
  ];

  for (const domain of testDomains) {
    try {
      console.log(`Testing: ${domain}`);
      const result = await analyzeAIVisibilityDetailed(domain);
      console.log('Result:', {
        score: result.score,
        chatgptScore: result.chatgptScore,
        claudeScore: result.claudeScore,
        appearsInResults: result.appearsInResults,
        mentionCount: result.mentionCount
      });
      console.log('---');
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
    }
  }
  
  console.log('✅ AI Visibility test complete!');
  console.log('💰 Cost: ~$0.10 per domain tested');
}

test().catch(console.error);
