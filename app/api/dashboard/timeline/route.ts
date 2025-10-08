import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';

  // Generate sample data based on range
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const data = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toISOString().split('T')[0],
      score: 60 + Math.random() * 20 + i * 0.15, // Trending up
    };
  });

  return NextResponse.json({ data });
}
