import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated data - replace with actual DB queries
  const dealers = [
    {
      id: 'dealer-1',
      name: 'Lou Glutz Motors',
      location: 'Chicago, IL',
      aiScore: 72,
      reviewCount: 128,
      status: 'active' as const,
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dealer-2',
      name: 'Larusso Motors',
      location: 'Reseda, CA',
      aiScore: 78,
      reviewCount: 342,
      status: 'active' as const,
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dealer-3',
      name: 'Prestige Worldwide Imports',
      location: 'Los Angeles, CA',
      aiScore: 65,
      reviewCount: 198,
      status: 'active' as const,
      lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dealer-4',
      name: 'Southside Motors',
      location: 'Chicago, IL',
      aiScore: 58,
      reviewCount: 156,
      status: 'inactive' as const,
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dealer-5',
      name: 'Premier Toyota Sacramento',
      location: 'Sacramento, CA',
      aiScore: 82,
      reviewCount: 89,
      status: 'pending' as const,
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({ dealers });
}
