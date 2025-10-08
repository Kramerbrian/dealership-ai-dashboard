import { analyzeUGCHealthDetailed } from './src/lib/scoring/ugc-health';

async function test() {
  console.log('🧪 Testing UGC Health Module...\n');
  
  const testDomains = [
    'terryreidhyundai.com',
    'example.com',
    'google.com'
  ];

  for (const domain of testDomains) {
    try {
      console.log(`Testing: ${domain}`);
      const result = await analyzeUGCHealthDetailed(domain);
      console.log('Result:', {
        score: result.score,
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
        recentReviews: result.recentReviews,
        responseRate: result.responseRate,
        reviewVelocity: result.reviewVelocity
      });
      console.log('---');
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
    }
  }
}

test().catch(console.error);
