import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tenant = url.searchParams.get('tenant') || 'dlr_example';

  const data = {
    tenant,
    current:
      'This dealership is a well-known store in its area with solid reviews, but AI still struggles to see clear service information and buyer guides.',
    improved:
      'This dealership is seen as a trusted local store with clear pricing, current service information, and simple guides that help shoppers choose the right vehicle.',
    history: [
      {
        as_of: '2025-11-01T00:00:00Z',
        intro:
          'This dealership has good reviews, but limited online information and few detailed guides for shoppers.',
        events: [
          'Fixed basic AutoDealer schema on homepage',
          'Aligned NAP details between website and GBP'
        ]
      },
      {
        as_of: '2025-12-01T00:00:00Z',
        intro:
          'This dealership is improving its online clarity, with better service details and some early guides for shoppers.',
        events: [
          'Added FAQs to Service pages',
          'Improved review snippets on VDPs'
        ]
      }
    ]
  };

  return NextResponse.json(data, { status: 200 });
}
