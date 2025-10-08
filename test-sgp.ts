import { analyzeSGPIntegrityDetailed } from './src/lib/scoring/sgp-integrity';

async function test() {
  console.log('🧪 Testing SGP Integrity Module...\n');
  
  const testDomains = [
    'terryreidhyundai.com',
    'example.com',
    'google.com'
  ];

  for (const domain of testDomains) {
    try {
      console.log(`Testing: ${domain}`);
      const result = await analyzeSGPIntegrityDetailed(domain);
      console.log('Result:', {
        score: result.score,
        hasSchema: result.hasSchema,
        schemaTypes: result.schemaTypes,
        completeness: result.completeness,
        validationErrors: result.validationErrors.length
      });
      console.log('---');
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
    }
  }
}

test().catch(console.error);
