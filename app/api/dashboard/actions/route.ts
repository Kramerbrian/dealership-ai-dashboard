import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated data - replace with actual DB queries
  const actions = [
    {
      id: 'action-1',
      title: 'Optimize FAQ Schema',
      description: 'Add structured data markup to improve AI visibility',
      priority: 'high' as const,
      status: 'pending' as const,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'seo' as const,
    },
    {
      id: 'action-2',
      title: 'Respond to Recent Reviews',
      description: '5 new reviews need responses to maintain rating',
      priority: 'medium' as const,
      status: 'in-progress' as const,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'reviews' as const,
    },
    {
      id: 'action-3',
      title: 'Update Business Hours',
      description: 'Sync Google My Business hours with website',
      priority: 'low' as const,
      status: 'completed' as const,
      category: 'ai' as const,
    },
    {
      id: 'action-4',
      title: 'Create Service Content',
      description: 'Add HowTo schema for oil change process',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'content' as const,
    },
    {
      id: 'action-5',
      title: 'Monitor Competitor Changes',
      description: 'Track Larusso Motors\' new AI optimization strategy',
      priority: 'low' as const,
      status: 'pending' as const,
      category: 'ai' as const,
    },
  ];

  return NextResponse.json({ actions });
}
