import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(req.url);
  const tenant = searchParams.get('tenant') || userId || 'default';

  // Mock data - replace with real database queries later
  const data = {
    tenant,
    current: 'Terry Reid Hyundai is a Hyundai dealer in Cape Coral with solid reviews, but limited information on service pricing and few guides that help shoppers make decisions.',
    improved: 'Terry Reid Hyundai is one of Cape Coral\'s most trusted dealerships, known for clear pricing, up-to-date service information, and easy guides that help shoppers choose the right vehicle.',
    history: [
      {
        as_of: '2025-11-01',
        intro: 'Earlier version text with basic information...',
        events: [
          'Fixed AutoDealer schema on homepage',
          'Improved LocalBusiness NAP consistency',
        ],
      },
      {
        as_of: '2025-12-01',
        intro: 'Next version text with improved content...',
        events: [
          'Added FAQ to Service pages',
          'Improved review snippets on VDPs',
        ],
      },
    ],
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}

