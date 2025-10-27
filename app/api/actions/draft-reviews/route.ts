import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { review_ids, tone } = await req.json();

    if (!review_ids || !Array.isArray(review_ids) || review_ids.length === 0) {
      return NextResponse.json({ error: 'Review IDs are required' }, { status: 400 });
    }

    // Mock AI review response drafting (no external dependencies)
    const mockResponses = review_ids.map(id => ({
      reviewId: id,
      draft: `Thank you for your review! We appreciate your feedback. (Tone: ${tone})`,
      status: 'drafted'
    }));

    return NextResponse.json({ responses: mockResponses });
  } catch (error: any) {
    console.error('Draft reviews error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to draft review responses' },
      { status: 500 }
    );
  }
}