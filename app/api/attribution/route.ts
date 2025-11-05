import { auth } from '@clerk/nextjs/server';
import { RevenueAttributionEngine } from '@/lib/attribution/revenue-calculator';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealershipId = searchParams.get('dealership');
  const periodDays = parseInt(searchParams.get('period') || '30');

  if (!dealershipId) {
    return Response.json({ error: 'Dealership ID required' }, { status: 400 });
  }

  try {
    const attribution = await RevenueAttributionEngine.calculateAttribution(
      dealershipId,
      periodDays
    );

    return Response.json(attribution);
  } catch (error) {
    console.error('Attribution calculation failed:', error);
    return Response.json({ error: 'Calculation failed' }, { status: 500 });
  }
}

