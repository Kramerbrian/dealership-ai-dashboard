import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dealer = searchParams.get('dealer') || 'demo';

  return NextResponse.json({
    dealer,
    alert: Math.random() > 0.5 ? 'Spike in negative Yelp reviews (last 48h)' : '',
    summary: { mentions7d: 42, positive: 0.71, avgResponseHrs: 18 },
    feed: [
      {
        id: '1',
        platform: 'Google',
        author: 'alex',
        excerpt: 'Great service bay turnaround.',
        sentiment: 'positive',
        timestamp: Date.now() - 3600e3
      },
      {
        id: '2',
        platform: 'Reddit',
        author: 'carfan21',
        excerpt: 'Any Naples dealer actually responds fast?',
        sentiment: 'neutral',
        timestamp: Date.now() - 2 * 3600e3
      },
      {
        id: '3',
        platform: 'Yelp',
        author: 'sarah',
        excerpt: 'Was quoted wrong online.',
        sentiment: 'negative',
        timestamp: Date.now() - 6 * 3600e3
      }
    ]
  });
}

