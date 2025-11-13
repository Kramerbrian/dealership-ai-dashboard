/**
 * Test Healthcheck Endpoint
 * 
 * Run: npx tsx scripts/test-healthcheck.ts
 * 
 * Tests the /api/health endpoint and provides detailed diagnostics
 */

async function testHealthcheck(baseUrl: string = 'http://localhost:3000') {
  console.log('\n🏥 Testing Healthcheck Endpoint\n');
  console.log('='.repeat(60));
  console.log(`Testing: ${baseUrl}/api/health\n`);

  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Overall: ${data.ok ? '✅ OK' : '❌ BROKEN'}\n`);

    // Environment Variables
    if (data.checks?.env) {
      console.log('📋 Environment Variables:');
      console.log('-'.repeat(60));
      for (const [key, value] of Object.entries(data.checks.env)) {
        if (key.startsWith('_')) continue; // Skip internal keys
        const status = value ? '✅' : '❌';
        console.log(`${status} ${key}: ${value ? 'Set' : 'Missing'}`);
      }
      if (data.checks.env._critical_missing) {
        console.log(`\n⚠️  ${data.checks.env._critical_missing}`);
      }
      console.log('');
    }

    // Clarity API
    if (data.checks?.clarity) {
      console.log('🔍 Clarity API:');
      console.log('-'.repeat(60));
      const clarity = data.checks.clarity;
      console.log(`Status: ${clarity.ok ? '✅ OK' : '❌ FAILED'}`);
      if (clarity.status) {
        console.log(`HTTP: ${clarity.status}`);
      }
      if (clarity.hasScores !== undefined) {
        console.log(`Has Scores: ${clarity.hasScores ? '✅' : '❌'}`);
      }
      if (clarity.hasLocation !== undefined) {
        console.log(`Has Location: ${clarity.hasLocation ? '✅' : '❌'}`);
      }
      if (clarity.hasIntros !== undefined) {
        console.log(`Has Intros: ${clarity.hasIntros ? '✅' : '❌'}`);
      }
      if (clarity.error) {
        console.log(`Error: ${clarity.error}`);
      }
      if (clarity.note) {
        console.log(`Note: ${clarity.note}`);
      }
      console.log('');
    }

    // Trust API
    if (data.checks?.trust_api) {
      console.log('🛡️  Trust API:');
      console.log('-'.repeat(60));
      const trust = data.checks.trust_api;
      console.log(`Exists: ${trust.exists ? '✅' : '❌'}`);
      if (trust.status) {
        console.log(`HTTP: ${trust.status}`);
      }
      if (trust.error) {
        console.log(`Error: ${trust.error}`);
      }
      console.log('');
    }

    // Assistant API
    if (data.checks?.assistant_api) {
      console.log('🤖 Assistant API:');
      console.log('-'.repeat(60));
      const assistant = data.checks.assistant_api;
      console.log(`Exists: ${assistant.exists ? '✅' : '❌'}`);
      if (assistant.status) {
        console.log(`HTTP: ${assistant.status}`);
      }
      if (assistant.error) {
        console.log(`Error: ${assistant.error}`);
      }
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    console.log('-'.repeat(60));
    
    if (!data.ok) {
      console.log('❌ Healthcheck failed. Review issues above.');
    } else {
      console.log('✅ All checks passed!');
    }

    if (data.checks?.env) {
      const missing = Object.entries(data.checks.env)
        .filter(([k, v]) => !k.startsWith('_') && !v)
        .map(([k]) => k);
      
      if (missing.length > 0) {
        console.log(`\n⚠️  Missing optional variables: ${missing.join(', ')}`);
        console.log('   These are optional but may be needed for some features.');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\nTimestamp: ${data.timestamp}`);
    console.log(`Version: ${data.version || 'unknown'}\n`);

    return data.ok;

  } catch (error: any) {
    console.error('\n❌ Error testing healthcheck:');
    console.error(error.message);
    console.log('\nMake sure your dev server is running:');
    console.log('  npm run dev\n');
    return false;
  }
}

// Get base URL from command line or use default
const baseUrl = process.argv[2] || 'http://localhost:3000';

testHealthcheck(baseUrl).then(success => {
  process.exit(success ? 0 : 1);
});

