import { analyzeZeroClickDetailed } from './src/lib/scoring/zero-click';

async function test() {
  console.log('🧪 Testing Zero-Click Module...\n');
  
  const testDomains = [
    'terryreidhyundai.com',
    'example.com',
    'google.com'
  ];

  for (const domain of testDomains) {
    try {
      console.log(`Testing: ${domain}`);
      const result = await analyzeZeroClickDetailed(domain);
      console.log('Result:', {
        score: result.score,
        hasFAQ: result.hasFAQ,
        hasHowTo: result.hasHowTo,
        hasArticle: result.hasArticle,
        faqCount: result.faqCount,
        headingStructure: result.headingStructure
      });
      console.log('---');
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
    }
  }
}

test().catch(console.error);
