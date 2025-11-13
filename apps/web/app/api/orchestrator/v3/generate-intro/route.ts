import { NextRequest, NextResponse } from 'next/server';
import { callOrchestrator } from '@/lib/orchestrator/gpt-bridge';

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, clarity_stack, prompt } = body;

    if (!domain || !clarity_stack) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, clarity_stack' },
        { status: 400 }
      );
    }

    // Use Orchestrator 3.0 to generate improved intro
    const orchestratorResponse = await callOrchestrator({
      dealerId: domain,
      action: 'generate_ai_intro',
      domain,
      context: {
        clarity_stack,
        prompt: prompt || 'Generate a realistic, achievable improved AI description for this dealership (1-2 sentences, 11th grade reading level).',
      },
    });

    return NextResponse.json({
      intro: orchestratorResponse.content,
      confidence: orchestratorResponse.confidence || 0.8,
      traceId: orchestratorResponse.traceId,
    });
  } catch (error: any) {
    console.error('Orchestrator intro generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate intro', details: error.message },
      { status: 500 }
    );
  }
}

