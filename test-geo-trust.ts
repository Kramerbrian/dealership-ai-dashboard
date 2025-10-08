import { analyzeGeoTrustDetailed } from './src/lib/scoring/geo-trust';

async function test() {
  console.log('🧪 Testing Geo Trust Module...\n');
  
  const testDomains = [
    'terryreidhyundai.com',
    'example.com',
    'google.com'
  ];

  for (const domain of testDomains) {
    try {
      console.log(`Testing: ${domain}`);
      const result = await analyzeGeoTrustDetailed(domain);
      console.log('Result:', {
        score: result.score,
        hasGMB: result.hasGMB,
        completeness: result.completeness,
        rating: result.rating,
        reviewCount: result.reviewCount,
        hasPhotos: result.hasPhotos,
        hasHours: result.hasHours
      });
      console.log('---');
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
    }
  }
}

test().catch(console.error);
