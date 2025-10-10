import { NextResponse } from 'next/server';
import { GovernanceEngine } from '@/lib/governance-engine';

export async function POST(request: Request) {
  try {
    const { dealerId, metrics } = await request.json();
    
    if (!dealerId) {
      return NextResponse.json({ error: 'dealerId is required' }, { status: 400 });
    }

    if (!metrics) {
      return NextResponse.json({ error: 'metrics are required' }, { status: 400 });
    }

    console.log(`🔍 Checking governance rules for dealer: ${dealerId}`);
    console.log('📊 Metrics:', metrics);

    const governanceEngine = new GovernanceEngine();
    
    // Check for violations
    const violations = await governanceEngine.checkViolations(dealerId, metrics);
    
    // Execute actions based on violations
    const { actions_taken, model_frozen } = await governanceEngine.executeActions(dealerId, violations);
    
    // Get governance status
    const status = await governanceEngine.getGovernanceStatus(dealerId);

    const response = {
      success: true,
      dealerId,
      violations,
      actions_taken,
      model_frozen,
      governance_status: status,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Governance check completed:', response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Governance check failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId') || 'default';

    console.log(`🔍 Getting governance status for dealer: ${dealerId}`);

    const governanceEngine = new GovernanceEngine();
    const status = await governanceEngine.getGovernanceStatus(dealerId);

    return NextResponse.json({
      success: true,
      dealerId,
      governance_status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Failed to get governance status:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
