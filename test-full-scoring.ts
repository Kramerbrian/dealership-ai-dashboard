import { getDealershipScores } from './src/lib/scoring-engine';

async function test() {
  console.log('🚀 Running full dealership analysis...\n');
  
  const testDomain = 'terryreidhyundai.com';
  
  try {
    const scores = await getDealershipScores(testDomain);
    
    console.log('\n📊 Results:');
    console.log('═══════════════════════════════════════');
    console.log(`🤖 AI Visibility:    ${scores.ai_visibility}/100`);
    console.log(`🛡️  Zero-Click:       ${scores.zero_click}/100`);
    console.log(`⭐ Review Health:    ${scores.ugc_health}/100`);
    console.log(`📍 Local Trust:      ${scores.geo_trust}/100`);
    console.log(`🔧 Tech Setup:       ${scores.sgp_integrity}/100`);
    console.log('═══════════════════════════════════════');
    console.log(`📈 OVERALL SCORE:    ${scores.overall}/100`);
    console.log('\n✅ Analysis complete!');
    console.log('💰 Cost: ~$0.12 per analysis');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

test().catch(console.error);
