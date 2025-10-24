import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url, revenue, marketSize, competition, visibility } = await request.json();

  const revenueNumber = Number(revenue) || 0;
  const visibilityPercent = Number(visibility) || 0;

  const marketMultipliers: Record<string, number> = {
    small: 0.8,
    medium: 1,
    large: 1.5,
  };

  const competitionMultipliers: Record<string, number> = {
    low: 0.8,
    moderate: 1,
    high: 1.2,
  };

  const marketKey = typeof marketSize === 'string' ? marketSize.toLowerCase() : 'medium';
  const competitionKey = typeof competition === 'string' ? competition.toLowerCase() : 'moderate';

  const marketFactor = marketMultipliers[marketKey] ?? 1;
  const competitionFactor = competitionMultipliers[competitionKey] ?? 1;

  const revenueAtRisk = revenueNumber * ((100 - visibilityPercent) / 100) * marketFactor;
  const potentialRecovery = revenueAtRisk * 0.8 * competitionFactor;

  const spend = revenueNumber * 0.1;
  const expectedROI = spend > 0 ? (potentialRecovery / spend) * 100 : null;

  return NextResponse.json({
    revenueAtRisk: Math.round(revenueAtRisk),
    potentialRecovery: Math.round(potentialRecovery),
    expectedROI: expectedROI !== null ? Math.round(expectedROI) : null,
  });
}
