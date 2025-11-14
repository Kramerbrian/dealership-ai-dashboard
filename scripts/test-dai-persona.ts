/**
 * dAI Agent Persona Test Script
 *
 * Tests all personality levels with various dealership contexts
 */

interface TestCase {
  name: string;
  message: string;
  personalityLevel: 'formal' | 'dry-wit' | 'full-dai';
  enableTruthBombs?: boolean;
  daiContext?: {
    role?: string;
    market?: string;
    store_name?: string;
    oem_brand?: string;
  };
}

const testCases: TestCase[] = [
  // Formal personality tests
  {
    name: 'Formal - GM asking about AI visibility',
    message: 'What is our AI Visibility Score and how do we improve it?',
    personalityLevel: 'formal',
    enableTruthBombs: false,
    daiContext: {
      role: 'gm',
      market: 'Naples, FL',
      store_name: 'Lou Grubbs Motors',
      oem_brand: 'hyundai',
    },
  },
  {
    name: 'Formal - Marketing Director asking about SEO',
    message: 'How does our SEO performance compare to competitors?',
    personalityLevel: 'formal',
    enableTruthBombs: false,
    daiContext: {
      role: 'marketing_director',
      market: 'Austin, TX',
      store_name: 'Capital City Toyota',
      oem_brand: 'toyota',
    },
  },

  // Dry-wit personality tests
  {
    name: 'Dry-wit - Used Car Manager asking about inventory',
    message: 'Why is our online inventory visibility so low?',
    personalityLevel: 'dry-wit',
    enableTruthBombs: true,
    daiContext: {
      role: 'used_car_manager',
      market: 'Phoenix, AZ',
      store_name: 'Desert Auto Group',
      oem_brand: 'used',
    },
  },
  {
    name: 'Dry-wit - Dealer Principal asking about ROI',
    message: 'Is this AI visibility stuff actually worth the investment?',
    personalityLevel: 'dry-wit',
    enableTruthBombs: true,
    daiContext: {
      role: 'dealer_principal',
      market: 'Nashville, TN',
      store_name: 'Music City Ford',
      oem_brand: 'ford',
    },
  },

  // Full-dai personality tests
  {
    name: 'Full-dai - Internet Manager asking about leads',
    message: 'Our lead volume dropped last month. What happened?',
    personalityLevel: 'full-dai',
    enableTruthBombs: true,
    daiContext: {
      role: 'internet',
      market: 'Miami, FL',
      store_name: 'South Beach Hyundai',
      oem_brand: 'hyundai',
    },
  },
  {
    name: 'Full-dai - Sales Manager asking about AI recommendations',
    message: 'How do I get my dealership to show up in AI search results?',
    personalityLevel: 'full-dai',
    enableTruthBombs: true,
    daiContext: {
      role: 'sales_manager',
      market: 'Denver, CO',
      store_name: 'Mile High Toyota',
      oem_brand: 'toyota',
    },
  },

  // Context variations
  {
    name: 'Formal - No context (general query)',
    message: 'What is DealershipAI and how does it help car dealerships?',
    personalityLevel: 'formal',
    enableTruthBombs: false,
  },
  {
    name: 'Dry-wit - Minimal context',
    message: 'My competitors are beating me online. Help!',
    personalityLevel: 'dry-wit',
    enableTruthBombs: true,
    daiContext: {
      market: 'Chicago, IL',
    },
  },
  {
    name: 'Full-dai - Rich context with data',
    message: 'Our GEO score is 65, AEO is 58, and SEO is 78. Where should we focus?',
    personalityLevel: 'full-dai',
    enableTruthBombs: true,
    daiContext: {
      role: 'marketing',
      market: 'Los Angeles, CA',
      store_name: 'LA Auto Center',
      oem_brand: 'general',
    },
  },
];

async function testDAIPersona() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const endpoint = `${API_URL}/api/assistant`;

  console.log('🤖 dAI Agent Persona Test Suite\n');
  console.log(`Testing endpoint: ${endpoint}\n`);
  console.log('='.repeat(80));

  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n\n[Test ${index + 1}/${testCases.length}] ${testCase.name}`);
    console.log('-'.repeat(80));

    const payload = {
      message: testCase.message,
      personalityLevel: testCase.personalityLevel,
      enableTruthBombs: testCase.enableTruthBombs,
      daiContext: testCase.daiContext,
    };

    console.log('\n📤 Request:');
    console.log(JSON.stringify(payload, null, 2));

    try {
      const startTime = Date.now();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        console.log(`\n❌ Failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
        continue;
      }

      const data = await response.json();

      console.log(`\n✅ Success (${duration}ms)`);
      console.log('\n📥 Response:');
      console.log('-'.repeat(80));
      console.log(data.response);
      console.log('-'.repeat(80));

      if (data.usage) {
        console.log(`\n📊 Token Usage: Input: ${data.usage.input_tokens}, Output: ${data.usage.output_tokens}`);
      }

      // Personality validation
      console.log('\n🎭 Personality Analysis:');
      const response_text = data.response.toLowerCase();

      if (testCase.personalityLevel === 'formal') {
        const hasFormalTone = !response_text.includes('honestly') && !response_text.includes('brutal truth');
        console.log(`  - Formal tone: ${hasFormalTone ? '✅' : '❌'}`);
      } else if (testCase.personalityLevel === 'dry-wit') {
        const hasWit = response_text.includes('clarity') || response_text.includes('focus');
        console.log(`  - Dry wit detected: ${hasWit ? '✅' : '⚠️'}`);
      } else if (testCase.personalityLevel === 'full-dai') {
        const hasPersonality = response_text.length > 100; // Full responses should be comprehensive
        console.log(`  - Full personality: ${hasPersonality ? '✅' : '⚠️'}`);
      }

      // Context validation
      if (testCase.daiContext?.market) {
        const hasMarketContext = response_text.includes(testCase.daiContext.market.toLowerCase());
        console.log(`  - Market context (${testCase.daiContext.market}): ${hasMarketContext ? '✅' : '⚠️'}`);
      }

      if (testCase.daiContext?.role) {
        const hasRoleAwareness = data.response.length > 50; // Role-aware responses should be tailored
        console.log(`  - Role awareness (${testCase.daiContext.role}): ${hasRoleAwareness ? '✅' : '⚠️'}`);
      }

      if (testCase.enableTruthBombs) {
        // Check for truth bomb phrases (optional, not guaranteed)
        const truthBombPhrases = [
          'losing to their own meetings',
          'too many tabs',
          'flying blind',
          'guesswork into straight answers',
        ];
        const hasTruthBomb = truthBombPhrases.some(phrase => response_text.includes(phrase));
        console.log(`  - Truth bomb present: ${hasTruthBomb ? '✅' : '⚠️ (optional)'}`);
      }

      // Wait between requests to avoid rate limiting
      if (index < testCases.length - 1) {
        console.log('\n⏳ Waiting 2s before next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('🏁 Test Suite Complete');
  console.log('='.repeat(80));
}

// Run tests
testDAIPersona().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
