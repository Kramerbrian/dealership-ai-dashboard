import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated data - replace with actual DB queries
  const competitors = [
    {
      id: 'comp-1',
      name: 'Larusso Motors',
      aiVisibility: 78,
      reviews: 342,
      seoScore: 82,
      trend: 'up' as const,
    },
    {
      id: 'comp-2',
      name: 'Prestige Worldwide Imports',
      aiVisibility: 65,
      reviews: 198,
      seoScore: 71,
      trend: 'neutral' as const,
    },
    {
      id: 'comp-3',
      name: 'Southside Motors',
      aiVisibility: 58,
      reviews: 156,
      seoScore: 64,
      trend: 'down' as const,
    },
  ];

  return NextResponse.json({ competitors });
}
