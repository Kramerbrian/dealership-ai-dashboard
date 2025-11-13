import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { calculateQAI, calculateQAIWithGeographicPooling } from '@/lib/qai';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { domain, useGeographicPooling = false } = await req.json();
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }
    
    // Calculate QAI score (without database for now)
    const input = {
      domain,
      dealershipName: 'Demo Dealership',
      city: 'Naples',
      state: 'FL'
    };
    
    const qaiScore = useGeographicPooling 
      ? await calculateQAIWithGeographicPooling(input)
      : await calculateQAI(input);
    
    return NextResponse.json({
      success: true,
      score: qaiScore,
      remaining: 4 // Mock remaining sessions
    });
  } catch (error) {
    console.error('QAI calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate QAI score' },
      { status: 500 }
    );
  }
}
