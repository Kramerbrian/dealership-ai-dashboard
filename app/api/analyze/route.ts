import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      { error: 'Domain parameter is required' },
      { status: 400 }
    );
  }

  // Mock AI visibility analysis data
  const mockData = {
    dealership: extractDealershipName(domain),
    location: 'Local Market',
    overall: Math.floor(Math.random() * 30) + 50,
    rank: Math.floor(Math.random() * 10) + 1,
    of: Math.floor(Math.random() * 20) + 15,
    platforms: [
      {
        name: 'ChatGPT',
        score: Math.floor(Math.random() * 40) + 40,
        status: getStatus(Math.floor(Math.random() * 40) + 40)
      },
      {
        name: 'Google SGE',
        score: Math.floor(Math.random() * 40) + 40,
        status: getStatus(Math.floor(Math.random() * 40) + 40)
      },
      {
        name: 'Perplexity',
        score: Math.floor(Math.random() * 40) + 40,
        status: getStatus(Math.floor(Math.random() * 40) + 40)
      },
      {
        name: 'Claude',
        score: Math.floor(Math.random() * 40) + 40,
        status: getStatus(Math.floor(Math.random() * 40) + 40)
      },
      {
        name: 'Gemini',
        score: Math.floor(Math.random() * 40) + 40,
        status: getStatus(Math.floor(Math.random() * 40) + 40)
      }
    ],
    issues: [
      {
        title: 'Missing Schema Markup',
        impact: Math.floor(Math.random() * 10000) + 5000,
        effort: '2-3 hours'
      },
      {
        title: 'Low AI Training Data',
        impact: Math.floor(Math.random() * 15000) + 10000,
        effort: '1-2 weeks'
      },
      {
        title: 'Inconsistent NAP Data',
        impact: Math.floor(Math.random() * 8000) + 4000,
        effort: '4-6 hours'
      }
    ]
  };

  return NextResponse.json(mockData);
}

function extractDealershipName(domain: string): string {
  const cleaned = domain
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\.(com|net|org|io).*$/, '');

  return cleaned
    .split(/[-_.]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatus(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Improvement';
}
