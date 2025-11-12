import { NextRequest, NextResponse } from 'next/server';
import { calculateOEL, generateDemoOEL } from '@/lib/oel';

export async function GET(req: NextRequest) {
  try {
    // TODO: Replace with actual data from your data sources
    // For now, returning demo data
    const demoData = generateDemoOEL();
    
    return NextResponse.json({
      success: true,
      data: demoData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('OEL calculation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate OEL' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const metrics = await req.json();
    
    // Calculate OEL with provided metrics
    const result = calculateOEL(metrics);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('OEL calculation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate OEL' },
      { status: 500 }
    );
  }
}

