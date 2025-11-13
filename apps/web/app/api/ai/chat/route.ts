import { NextRequest, NextResponse } from 'next/server';
import { chiefClarityOfficer } from '@/lib/ai/chief-clarity-officer';

/**
 * Chief Clarity Officer Chat API
 * Natural language interface for dealership AI visibility queries
 */
export async function POST(req: NextRequest) {
  try {
    const { question, dealerId, context } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Set context if provided
    if (dealerId && context) {
      chiefClarityOfficer.setContext({
        dealerId,
        ...context,
      });
    }

    // Execute chat
    const response = await chiefClarityOfficer.chat(question, context);

    return NextResponse.json({
      answer: response.output,
      model: response.model,
      confidence: response.confidence,
      cost: response.cost,
      latency: response.latency,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

